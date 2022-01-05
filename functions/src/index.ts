/* eslint-disable max-len */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import algoliasearch from "algoliasearch";
import {IDataProductItem} from "./models/IProduct";
import {DocumentSnapshot} from "firebase-functions/v1/firestore";
import {IDataShoppingListItem} from "./models/IShoppingList";
import {CallableContext} from "firebase-functions/v1/https";

// Set up Firestore.
admin.initializeApp();
const db = admin.firestore();

// Set up Algolia.
const algoliaClient = algoliasearch(functions.config().algolia.appid, functions.config().algolia.apikey);

const collectionIndexName = "dev_waddle";
const collectionIndex = algoliaClient.initIndex(collectionIndexName);

// Set up Algolia functions.

/**
 * When a document is created, we add it to Algolia.
 * @param {DocumentSnapshot} snapshot
 */
const saveDocumentInAlgolia = async (snapshot: DocumentSnapshot) => {
  if (snapshot.exists) {
    const record = {id: snapshot.id, ...snapshot.data()} as IDataProductItem;
    if (record) {
      // Removes the possibility of snapshot.data() being undefined.
      const {id, refShoppingList, ...simpleRecord} = record;
      const algoliaRecord = {
        ...simpleRecord,
        objectID: id,
        shoppingListId: refShoppingList.id,
      };

      await collectionIndex.saveObject(algoliaRecord);
    }
  }
};

/**
 * When a document is updated, we update it in Algolia.
 * @param {functions.Change<FirebaseFirestore.DocumentSnapshot>} change
 */
const updateDocumentInAlgolia = async (
    change: functions.Change<FirebaseFirestore.DocumentSnapshot>
) => {
  const docBeforeChange = change.before.data();
  const docAfterChange = change.after.data();
  if (docBeforeChange && docAfterChange) {
    await saveDocumentInAlgolia(change.after);
  }
};

/**
 * When a document is deleted, we delete it from Algolia.
 * @param {DocumentSnapshot} snapshot
 */
const deleteDocumentFromAlgolia = async (
    snapshot: DocumentSnapshot
) => {
  if (snapshot.exists) {
    const objectID = snapshot.id;
    await collectionIndex.deleteObject(objectID);
  }
};

// Set up Cloud Functions.

/**
 * Return a link associated to a shopping list.
 */
export const getShareLink = functions.https.onCall(
    async (data: any, context: CallableContext) => {
      const snapshot = await db
          .collection("shoppingLists")
          .doc(data.id)
          .get();
      const shoppingLists = {
        id: snapshot.id,
        ...snapshot.data(),
      } as IDataShoppingListItem;
      if (shoppingLists) {
        const link = await db.collection("shareLinks").add({
          shoppingListId: shoppingLists.id,
          timestamp: admin.firestore.Timestamp.now().toMillis(),
        });
        const shareLink = {
          linkId: link.id,
          linkUrl: `${functions.config().waddle.cfurl}/shareGateway?id=${link.id}`,
        };
        return {code: 200, message: "OK", data: shareLink};
      } else {
        return {code: 400, message: "Shopping list not found"};
      }
    }
);

/**
 * Redirect share link to application link.
 */
export const shareGateway = functions.https.onRequest(async (request, response) => {
  const id = (request.query as { id: string | undefined }).id;
  if (!id) {
    response.status(400).send("Bad request");
  } else {
    const snapshot = await db
        .collection("shareLinks")
        .doc(id)
        .get();
    if (snapshot.exists) {
      response.redirect("sheddle:///openShare?id=" + snapshot.id);
    } else {
      response.status(400).send("Bad request");
    }
  }
});

/**
 * Add a device with a valid share link access to the associated shopping list.
 */
export const accessShare = functions.https.onCall(
    async (data: any, context: CallableContext) => {
      const snapshot = await db
          .collection("shareLinks")
          .doc(data.id)
          .get();
      const shareLinks = snapshot.data();
      if (shareLinks && data.platformId) {
        const shoppingList = (await db.collection("shoppingLists").doc(shareLinks.shoppingListId).get()).data() as IDataShoppingListItem;

        if (shoppingList.allowedDeviceIds.length > 50) {
          return {code: 400, message: "Sharing limit"};
        }
        if (shoppingList.allowedDeviceIds.includes(data.platformId)) {
          return {code: 400, message: "Already In"};
        }

        await db
            .collection("shoppingLists")
            .doc(shareLinks.shoppingListId)
            .set(
                {
                  allowedDeviceIds: admin.firestore.FieldValue.arrayUnion(
                      data.platformId
                  ),
                },
                {merge: true}
            );
        return {code: 200, message: "OK"};
      } else {
        return {code: 400, message: "Link not found"};
      }
    }
);


/**
 * Triggers each day to remove old shared links.
 */
export const scheduledFunction = functions.pubsub
    .schedule("every 24 hours")
    .onRun(async (context) => {
      const snapshots = await db
          .collection("shareLinks")
          .where(
              "timestamp",
              "<",
              admin.firestore.Timestamp.now().toMillis() - 1000 * 60 * 60 * 24
          )
          .get();
      snapshots.forEach(async (snapshot) => {
        snapshot.ref.delete();
      });

      const snapshotsShop = await db
          .collection("shoppingLists")
          .where(
              "allowedDeviceIds",
              "==",
              []
          )
          .get();
      snapshotsShop.forEach(async (snapshot) => {
        snapshot.ref.delete();
      });
    });


/**
 * Trigger on product creation.
 */
export const collectionOnCreate = functions.firestore
    .document("products/{uid}")
    .onCreate(async (snapshot:DocumentSnapshot, context) => {
      const snap = snapshot.data() as IDataProductItem;
      snap.refShoppingList.set({productQuantity: admin.firestore.FieldValue.increment(1)}, {merge: true});
      await saveDocumentInAlgolia(snapshot);
    });

/**
 * Trigger on product update.
 */
export const collectionOnUpdate = functions.firestore
    .document("products/{uid}")
    .onUpdate(async (change, context) => {
      const snapBefore = change.before.data() as IDataProductItem;
      const snapAfter = change.after.data() as IDataProductItem;
      if (snapBefore.isChecked !== snapAfter.isChecked) {
        snapAfter.refShoppingList.set({
          productValidated: admin.firestore.FieldValue.increment(
              snapAfter.isChecked ? 1 : -1
          ),
        }, {merge: true});
      }
      await updateDocumentInAlgolia(change);
    });

/**
 * Trigger on product deletion.
 */
export const collectionOnDelete = functions.firestore
    .document("products/{uid}")
    .onDelete(async (snapshot, context) => {
      const snap = snapshot.data() as IDataProductItem;
      snap.refShoppingList.set({
        productQuantity: admin.firestore.FieldValue.increment(-1),
      }, {merge: true});
      await deleteDocumentFromAlgolia(snapshot);
    });


/**
 * Trigger on shopping list deletion.
 */
export const collectionShoppingListsOnDelete = functions.firestore
    .document("shoppingLists/{uid}")
    .onDelete(async (snapshot, context) => {
      const snap = await db
          .collection("products")
          .where("refShoppingList", "==", snapshot.ref)
          .get();
      snap.forEach(async (snapshot) =>
        snapshot.ref.delete()
      );
    });

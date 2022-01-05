import { DocumentReference } from 'firebase/firestore';
//Firebase Data
export interface IDataProductItem {
    /**
     * Unique identifier for the product
     */
    id: string;

    /**
     * Time the product was created
     */
    timestamp: number;

    /**
     * The name of the product
     */
    title: string;

    /**
     * The quantity of the product
     */
    quantity: number;

    /**
     * Is the product validated
     */
    isChecked: boolean;

    /**
     * European Article Number (Barcode)
     */
    ean: string | null;

    /**
     * Picture
     */
    picture?: string;

    /**
     * Reference to the shopping list the product belongs to
     */
    refShoppingList: DocumentReference;
}

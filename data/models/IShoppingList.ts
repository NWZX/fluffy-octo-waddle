//Firebase Data
export interface IDataShoppingListItem {
    /**
     * Unique identifier for the shopping list
     */
    id: string;

    /**
     * Allowed devices for the shopping list
     */
    allowedDeviceIds: string[];

    /**
     * Time the shopping list was created
     */
    timestamp: number;

    /**
     * The name of the shopping list
     */
    title: string;

    /**
     * Quantity of products in the shopping list
     */
    productQuantity: number;

    /**
     * Number of products validated
     */
    productValidated: number;

    //Local state
    isEdit?: boolean;
}

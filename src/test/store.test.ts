import StoreItem from "../services/models/store/StoreItem";
import ItemSetting from "../services/models/store/item_settings/ItemSettings";
import { expect } from "chai";
import { createStreamerTables, ID_FOR_STORE, deleteStreamerTables, ID_FOR_PURCHASE_ORDER } from "./ForTests.test";
import { dbPurchaseOrder } from "../services/models/store/dbPurchaseOrders";
import PurchaseOrder from "../services/models/store/PurchaseOrder";
import dbPurchaseOrderManager from "../services/modules/databaseManager/store/dbPurchaseOrderManager";
import dbStoreManager from "../services/modules/databaseManager/store/dbStoreManager";
import { dbStoreItem } from "../services/models/store/dbStoreItem";

describe('Store Manager', () => {
    let StoreItemToSpectated: StoreItem;
    before(async () => {
        await createStreamerTables(ID_FOR_STORE);

        StoreItemToSpectated = new StoreItem(1, 2, 'Descriptions test', new ItemSetting('ItemSettingsTest', false, 2), 'test.mp3', 2);
        let Manager = new dbStoreManager(ID_FOR_STORE);
        await Manager.UpdateOrCreateStoreItem(StoreItemToSpectated);
    })
    after(async () => {
        await deleteStreamerTables(ID_FOR_STORE)
    })

    it('Create and Get StoreItem', async function () {
        let Manager = new dbStoreManager(ID_FOR_STORE);
        let StoreItemToTest = new StoreItem(2, 2, 'Descriptions test', new ItemSetting('ItemSettingsTest', false, 2), 'test.mp3', 2);
        await Manager.UpdateOrCreateStoreItem(StoreItemToTest);

        let StoreItemObtained = await Manager.getItem(StoreItemToTest.id);
        let StoreItemExpected = new StoreItem(
            StoreItemObtained.id, StoreItemObtained.Type,
            StoreItemObtained.Description, StoreItemObtained.ItemsSettings,
            StoreItemObtained.FileName, StoreItemObtained.Price);

        StoreItemToTest.ItemsSettings = JSON.parse(StoreItemToTest.ItemsSettingsJson);
        delete StoreItemToTest.ItemsSettingsJson;
        expect(StoreItemExpected).to.deep.equal(StoreItemToTest);
    })
    it('Delete Store Item', async function () {
        StoreItemToSpectated = new StoreItem(1, 2, 'Descriptions test', new ItemSetting('ItemSettingsTest', false, 2), 'test.mp3', 2);
        let Manager = new dbStoreManager(ID_FOR_STORE);
        await Manager.UpdateOrCreateStoreItem(StoreItemToSpectated);
        await Manager.DeleteStoreItem(StoreItemToSpectated);
        expect(await Manager.getItem(StoreItemToSpectated.id)).to.deep.equal(null);
    })
    it('Get All Items', async function () {
        this.slow(120);

        let Manager = new dbStoreManager(ID_FOR_STORE);

        let StoreItemsForTest = [
            new StoreItem(1, 2, 'Descriptions test', new ItemSetting('ItemSettingsTest', false, 2), 'test.mp3', 2),
            new StoreItem(2, 2, 'Descriptions test', new ItemSetting('ItemSettingsTest', false, 2), 'test.mp3', 2),
            new StoreItem(3, 2, 'Descriptions test', new ItemSetting('ItemSettingsTest', false, 2), 'test.mp3', 2),
            new StoreItem(4, 2, 'Descriptions test', new ItemSetting('ItemSettingsTest', false, 2), 'test.mp3', 2)
        ]
        for (const index in StoreItemsForTest) {
            await Manager.UpdateOrCreateStoreItem(StoreItemsForTest[index]);
        }

        let dbItems = await Manager.getAllItems();

        let converted_dbItems = [];
        dbItems.forEach((StoreItemObtained: dbStoreItem) => {            
            converted_dbItems.push(new StoreItem(StoreItemObtained.id, StoreItemObtained.Type, StoreItemObtained.Description,
                StoreItemObtained.ItemsSettings, StoreItemObtained.FileName, StoreItemObtained.Price))
        });

        StoreItemsForTest.forEach(StoreItemForTest => {
            StoreItemForTest.ItemsSettings = JSON.parse(StoreItemForTest.ItemsSettingsJson);
            delete StoreItemForTest.ItemsSettingsJson;
        })        
        expect(converted_dbItems).to.deep.equal(StoreItemsForTest);
    })
})

describe('Purchase Order Manager', () => {
    let Manager: dbPurchaseOrderManager;
    let PurchaseOrderForTest_I: PurchaseOrder;
    let PurchaseOrderForTest_II: PurchaseOrder;
    let ItemIDForTest = 5;
    before(async () => {
        await createStreamerTables(ID_FOR_PURCHASE_ORDER);

        Manager = new dbPurchaseOrderManager(ID_FOR_PURCHASE_ORDER);
        PurchaseOrderForTest_I = new PurchaseOrder(20, ID_FOR_PURCHASE_ORDER, ItemIDForTest)
        await Manager.addPurchaseOrder(PurchaseOrderForTest_I);

    })
    after(async () => {
        await deleteStreamerTables(ID_FOR_PURCHASE_ORDER)
    })

    it('Add and Get PurchaseOrder', async () => {
        PurchaseOrderForTest_II = new PurchaseOrder(20, ID_FOR_PURCHASE_ORDER, ItemIDForTest)

        await Manager.addPurchaseOrder(PurchaseOrderForTest_II);

        expect(PurchaseOrderForTest_II).to.deep.equal(dbPurchaseOrder.toPurchaseOrder
            (await Manager.getPurchaseOrder(2)));
    })

    it('Get Purchase Order By StoreItemID', async () => {
        expect(PurchaseOrderForTest_I).to.deep.equal(dbPurchaseOrder.toPurchaseOrder(
            await Manager.getPurchaseOrderByStoreItemID(ItemIDForTest)))
    })

    it('Get All Purchase Orders', async () => {
        let dbPurchaseOrders = await Manager.getAllPurchaseOrders('*');

        let PurchaseOrders = [];
        for (const dbPurchaseOrderID in dbPurchaseOrders) {
            PurchaseOrders.push(dbPurchaseOrder.toPurchaseOrder(dbPurchaseOrders[dbPurchaseOrderID]))
        }

        expect([PurchaseOrderForTest_I, PurchaseOrderForTest_II]).to.deep.equal(PurchaseOrders)
    })

    it('Remove Purchase Order', async () => {
        await Manager.removePurchaseOrder(1);
        expect(await Manager.getPurchaseOrder(1)).to.deep.equal(null);
    })
})
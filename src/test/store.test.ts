import StoreItem from "../services/models/store/StoreItem";

import ItemSetting from "../services/models/store/item_settings/ItemSettings";

import dbStoreManager from "../services/modules/database/store/dbStoreManager";

import { expect } from "chai";
import { createAndStartStreamerDatabase, ID_FOR_STORE, deleteStreamerDatabase, ID_FOR_PURCHASE_ORDER } from "./ForTests.test";
import { dbStoreItem } from "../services/models/store/dbStoreItem";
import dbPurchaseOrderManager from "../services/modules/database/store/dbPurchaseOrderManager";
import PurchaseOrder from "../services/models/store/PurchaseOrder";
import { dbPurchaseOrder } from "../services/models/store/dbPurchaseOrders";

describe('Store Manager', () => {
    let StoreItemForTest: StoreItem;
    before(async () => {
        await createAndStartStreamerDatabase(ID_FOR_STORE);

        StoreItemForTest = new StoreItem(1, 2, 'Descriptions test', new ItemSetting('ItemSettingstest', false), 'test.mp3', 2);
        let Manager = new dbStoreManager(ID_FOR_STORE);
        await Manager.UpdateOrCreateStoreItem(StoreItemForTest);
    })
    after(async () => {
        await deleteStreamerDatabase(ID_FOR_STORE)
    })

    it('Create and Get StoreItem', async function () {
        let Manager = new dbStoreManager(ID_FOR_STORE);
        let StoreItemForTest = new StoreItem(2, 2, 'Descriptions test', new ItemSetting('ItemSettingstest', false), 'test.mp3', 2);
        let CreateRes = await Manager.UpdateOrCreateStoreItem(StoreItemForTest);
        expect(CreateRes).to.include.keys('SuccessfullyCreatedItem');
        let storeItem = dbStoreItem.ToStoreItem(await Manager.getIten(StoreItemForTest.id));
        storeItem.ItemSettingsJson = JSON.stringify(storeItem.ItemsSettings);
        expect(storeItem).to.deep.equal(StoreItemForTest);
    })
    it('Delete Store Item', async function () {
        StoreItemForTest = new StoreItem(1, 2, 'Descriptions test', new ItemSetting('ItemSettingstest', false), 'test.mp3', 2);
        let Manager = new dbStoreManager(ID_FOR_STORE);
        await Manager.UpdateOrCreateStoreItem(StoreItemForTest);
        await Manager.DeleteStoreItem(StoreItemForTest);
        expect(await Manager.getIten(StoreItemForTest.id)).to.deep.equal(null);
    })
    it('Get All Itens', async function () {
        this.slow(120);

        let Manager = new dbStoreManager(ID_FOR_STORE);

        let StoreItemsForTest = [
            new StoreItem(1, 2, 'Descriptions test', new ItemSetting('ItemSettingstest', false), 'test.mp3', 2),
            new StoreItem(2, 2, 'Descriptions test', new ItemSetting('ItemSettingstest', false), 'test.mp3', 2),
            new StoreItem(3, 2, 'Descriptions test', new ItemSetting('ItemSettingstest', false), 'test.mp3', 2),
            new StoreItem(4, 2, 'Descriptions test', new ItemSetting('ItemSettingstest', false), 'test.mp3', 2)

        ]
        for (const index in StoreItemsForTest) {
            await Manager.UpdateOrCreateStoreItem(StoreItemsForTest[index]);
        }

        let dbItens = await Manager.getAllItens();

        let allItens = [];
        dbItens.forEach(dbIten => {
            let iten = dbStoreItem.ToStoreItem(dbIten);
            iten.ItemSettingsJson = JSON.stringify(iten.ItemsSettings);
            allItens.push(iten)
        });

        expect(StoreItemsForTest).to.deep.equal(allItens);
    })
})

describe('Purchase Order Manager', () => {
    let Manager: dbPurchaseOrderManager;
    let PurchaseOrderForTest_I: PurchaseOrder;
    let PurchaseOrderForTest_II: PurchaseOrder;
    let ItemIDForTest = 5;
    before(async () => {
        await createAndStartStreamerDatabase(ID_FOR_PURCHASE_ORDER);

        Manager = new dbPurchaseOrderManager(ID_FOR_PURCHASE_ORDER);
        PurchaseOrderForTest_I = new PurchaseOrder(20, ID_FOR_PURCHASE_ORDER, ItemIDForTest)
        await Manager.addPurchaseOrder(PurchaseOrderForTest_I);

    })
    after(async () => {
        await deleteStreamerDatabase(ID_FOR_PURCHASE_ORDER)
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
        let dbPurchaseOrders = await Manager.getAllPurchaseOrders();

        let PurchaseOrders = [];
        for (const dbPurchaseOrderID in dbPurchaseOrders) {
            PurchaseOrders.push(dbPurchaseOrder.toPurchaseOrder(dbPurchaseOrders[dbPurchaseOrderID]))
        }

        expect([PurchaseOrderForTest_I,PurchaseOrderForTest_II]).to.deep.equal(PurchaseOrders)
    })

    it('Remove Purchase Order', async () => {
        await Manager.removePurchaseOrder(1);
        expect(await Manager.getPurchaseOrder(1)).to.deep.equal(null);
    })
})
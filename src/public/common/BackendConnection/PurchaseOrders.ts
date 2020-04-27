import { PurchaseOrderRoute, getPurchaseOrderRoute } from "../../../services/routes/routes";
import PurchaseOrderRequest from "../../../services/models/store/PurchaseOrderRequest";
import { reject } from "bluebird";
import DeletePurchaseOrderRequest from "../../../services/models/store/DeletePurchaseOrderRequest";
import PurchaseOrder from "../../../services/models/store/PurchaseOrder";
import StoreItem from "../../../services/models/store/StoreItem";
import config from "./config";

export async function addPurchaseOrder(Token: string, TwitchUserID: string, StoreItem: StoreItem) {
    let H = new Headers();
    H.append("Content-Type", "application/json");

    return fetch(config.URL + PurchaseOrderRoute, {
        method: "POST",
        headers: H,
        body: JSON.stringify(new PurchaseOrderRequest(Token, TwitchUserID, StoreItem.id))
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function DeletePurchaseOrder(Token: string, PurchaseOrder: PurchaseOrder, Refund: boolean) {
    let H = new Headers();
    H.append("Content-Type", "application/json");

    return fetch(config.URL + PurchaseOrderRoute, {
        method: "DELETE",
        headers: H,
        body: JSON.stringify(new DeletePurchaseOrderRequest(Token, PurchaseOrder.TwitchUserID, PurchaseOrder.id, PurchaseOrder.StoreItemID, PurchaseOrder.SpentCoins, Refund))
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function GetPurchaseOrders(Token: string) {
    return fetch(config.URL + getPurchaseOrderRoute(Token), {
        method: "GET"
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}
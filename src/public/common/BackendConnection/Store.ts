import { getStoreRoute, StoreManagerRoute } from "../../../services/routes/routes";
import { reject } from "bluebird";
import StoreManagerRequest from "../../../services/models/store/StoreManagerRequest";
import StoreItem from "../../../services/models/store/StoreItem";
import config from "./config";

export async function GetStore(StreamerID: string, StoreItemID = -1) {
    return fetch(config.URL + getStoreRoute(StreamerID, StoreItemID), {
        method: "GET"
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function updateStoreItem(Token: string, StoreItem: StoreItem) {
    let H = new Headers();
    H.append("Content-Type", "application/json");

    return fetch(config.URL + StoreManagerRoute, {
        method: "POST",
        headers: H,
        body: JSON.stringify(new StoreManagerRequest(Token, StoreItem))
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }
    })
}

export async function DeleteStoreItem(Token: string, StoreItem: StoreItem) {
    let H = new Headers();
    H.append("Content-Type", "application/json");

    return fetch(config.URL + StoreManagerRoute, {
        method: "DELETE",
        headers: H,
        body: JSON.stringify(new StoreManagerRequest(Token, StoreItem))
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}
import { getStoreRoute, StoreManagerRoute } from "../../../services/routes/routes";
import { reject } from "bluebird";
import StoreManagerRequest from "../../../services/models/store/StoreManagerRequest";
import StoreItem from "../../../services/models/store/StoreItem";
import ServerConfigs from "../../../configs/ServerConfigs";

export async function GetStore(StreamerID: string, StoreItemID = -1) {
    return fetch(ServerConfigs.URL + getStoreRoute(StreamerID, StoreItemID), {
        method: "GET"
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function PutStoreItem(Token: string, StoreItem: StoreItem) {
    let H = new Headers();
    H.append("Content-Type", "application/json");

    return fetch(ServerConfigs.URL + StoreManagerRoute, {
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

    return fetch(ServerConfigs.URL + StoreManagerRoute, {
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
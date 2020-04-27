import { UpdateTransitionsByUser, GetTransitionsByUser as GetTransitionsByUser } from "../../../services/routes/routes";
import { reject } from "bluebird";
import { UpdateTransitionsByUserRequest } from "../../../services/models/dealer/UpdateProductsPurchasedByUserRequest";
import config from "./config";

export async function updateTransitionsByUser(UpdateTransitionsByUserRequest: UpdateTransitionsByUserRequest) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(config.URL + UpdateTransitionsByUser, {
        method: "POST",
        headers: H,
        body: JSON.stringify(UpdateTransitionsByUserRequest)
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }
    })
}

export async function getTransitionsByUser(Token: string):Promise<TwitchExtBitsTransaction[]> {
    let H = new Headers();
    H.append("token", Token);
    return fetch(config.URL + GetTransitionsByUser, {
        method: "GET",
        headers: H
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }
    })
}
import { UpdateTransitionsByUser, GetTransitionsByUser as GetTransitionsByUser } from "../../../services/routes/routes";
import ServerConfigs from "../../../configs/ServerConfigs";
import { reject } from "bluebird";
import { UpdateProductsPurchasedByUserRequest as UpdateTransitionsByUserRequest } from "../../../services/models/dealer/UpdateProductsPurchasedByUserRequest";

export async function updateTransitionsByUser(UpdateTransitionsByUserRequest: UpdateTransitionsByUserRequest) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(ServerConfigs.URL + UpdateTransitionsByUser, {
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
    return fetch(ServerConfigs.URL + GetTransitionsByUser, {
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
import { Poll } from "../../../services/models/poll/Poll";
import { getPollRoute, AddBetRoute, PollManagerRoute } from "../../../services/routes/routes";
import { AddBetRequest } from "../../../services/models/poll/AddBetRequest";
import { PollRequest } from "../../../services/models/poll/PollRequest";
import { reject } from "bluebird";
import ServerConfigs from "../../../configs/ServerConfigs";

export async function getCurrentPoll(StreamerID: string): Promise<Poll> {
    return fetch(ServerConfigs.URL + getPollRoute(StreamerID), {
        method: "GET"
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function addBet(AddBetRequest:AddBetRequest) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(ServerConfigs.URL + AddBetRoute, {
        method: "POST",
        headers: H,
        body: JSON.stringify(AddBetRequest)

    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function PollManager(PollRequest:PollRequest) {
    let H = new Headers();
    H.append("Content-Type", "application/json");

    return fetch(ServerConfigs.URL + PollManagerRoute, {
        method: "POST",
        headers: H,
        body: JSON.stringify(PollRequest)
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

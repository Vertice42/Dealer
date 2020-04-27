import { MinerManagerRoute, getMinerSettingsRoute, MineCoinRoute } from "../../../services/routes/routes";
import { MinerManagerRequest } from "../../../services/models/miner/MinerManagerRequest";
import { reject } from "bluebird";
import { MinerRequest } from "../../../services/models/miner/MinerRequest";
import config from "./config";

export async function ManagerMiner(MinerManagerRequest:MinerManagerRequest) {
    let H = new Headers();
    H.append("Content-Type", "application/json");

    return fetch(config.URL + MinerManagerRoute, {
        method: "POST",
        headers: H,
        body: JSON.stringify(MinerManagerRequest)
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function GetMinerSettings(StreamerID: string) {
    return fetch(config.URL + getMinerSettingsRoute(StreamerID), {
        method: "GET"
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function MineCoin(MinerRequest:MinerRequest) {
    let H = new Headers();
    H.append("Content-Type", "application/json");
    return fetch(config.URL + MineCoinRoute, {
      method: "POST",
      headers: H,
      body: JSON.stringify(MinerRequest)
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}
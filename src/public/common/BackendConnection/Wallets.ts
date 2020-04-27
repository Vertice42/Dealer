import { getWalletRoute, getWalletsRoute, WalletManager } from "../../../services/routes/routes";
import { reject } from "bluebird";
import { WalletManagerRequest } from "../../../services/models/wallet/WalletManagerRequest";
import config from "./config";

export async function GetWallet(StreamerID: string, TwitchUserID: string) {
  return fetch(config.URL + getWalletRoute(StreamerID, TwitchUserID), {
    method: "GET"
  }).then((result) => {
    if (result.ok) return result.json();
    else return reject(result);
  })
}

export async function GetWallets(StreamerID: string, TwitchUserID = '*') {
  return fetch(config.URL + getWalletsRoute(StreamerID, TwitchUserID), {
    method: "GET"
  }).then((result) => {
    if (result.ok) return result.json();
    else return reject(result);
  })
}

export async function ManagerWallets(WalletManagerRequest: WalletManagerRequest) {
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(config.URL + WalletManager, {
    method: "POST",
    headers: H,
    body: JSON.stringify(WalletManagerRequest)
  }).then((result) => {
    if (result.ok) return result.json();
    else return reject(result);
  })
}
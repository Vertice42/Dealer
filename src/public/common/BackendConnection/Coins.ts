import { CoinsSettings } from "../../../services/models/streamer_settings/CoinsSettings";
import { getCoinsSettingsRoute, CoinsSettingsManagerRoute } from "../../../services/routes/routes";
import { reject } from "bluebird";
import { CoinsSettingsManagerRequest } from "../../../services/models/streamer_settings/CoinsSettingsManagerRequest";
import ServerConfigs from "../../../configs/ServerConfigs";

export async function GetCoinsSettings(StreamerID: string): Promise<CoinsSettings> {
  return fetch(ServerConfigs.URL + getCoinsSettingsRoute(StreamerID), {
    method: "GET"
  }).then((result) => {
    if (result.ok) return result.json();
    else return reject(result);
  })
}

export async function ManagerCoinsSettings(CoinsSettingsManagerRequest: CoinsSettingsManagerRequest) {
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(ServerConfigs.URL + CoinsSettingsManagerRoute, {
    method: "POST",
    headers: H,
    body: JSON.stringify(CoinsSettingsManagerRequest)
  }).then((result) => {
    if (result.ok) return result.json();
    else return reject(result);
  })
}
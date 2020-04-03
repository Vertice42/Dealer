import { reject, resolve, any } from 'bluebird';
import ServerConfigs from '../services/configs/ServerConfigs';
import { PollStatus } from '../services/models/poll/PollStatus';
import { PollButton } from '../services/models/poll/PollButton';
import { MinerSettings } from '../services/models/streamer_settings/MinerSettings';
import StoreItem from '../services/models/store/StoreItem';
import StoreManagerRequest from '../services/models/store/StoreManagerRequest';
import PurchaseOrderRequest from '../services/models/store/PurchaseOrderRequest';
import DeletePurchaseOrderRequest from '../services/models/store/DeletePurchaseOrderRequest';
import PurchaseOrder from '../services/models/store/PurchaseOrder';
import { WalletManagerRequest } from '../services/models/wallet/WalletManagerRequest';
import { CoinsSettings } from '../services/models/streamer_settings/CoinsSettings';
import { getPollRoute, PollManagerRoute, MinerManagerRoute, addBeatRoute, getMinerSettingsRoute, getCoinsSettingsRoute, CoinsSettingsManagerRoute, MineCoinRoute, getWalletRoute, WalletManager, getStoreRoute, StoreManagerRoute, PurchaseOrderRoute, getPurchaseOrderRoute, UploadFileRoute, getFilesRoute, GetWalletsRoute, getWallestRoute, getWalletSkinImage, GetWalletSkins, getLocale } from '../services/routes/routes';
import { Poll } from '../services/models/poll/Poll';
import { sleep } from '../utils/utils';

export const HOST = 'http://localhost:' + (ServerConfigs.Port || process.env.Port);

export class Observer {
  private Observation: () => Promise<any>;
  public WaitingTime: number;
  public OnWaitch = (_result: any) => { };
  private PromiseToStop: () => any;

  IsStop = false;

  async stop() {
    if (!this.IsStop) {
      this.IsStop = true;
      return new Promise((resolve, reject) => {
        this.PromiseToStop = () => { resolve() };
      });
    }
  }

  async start() {
    if (this.IsStop) {
      this.IsStop = false;
      this.OnWaitch(await this.Observation()
        .catch(async () => {
          await sleep(1000);
          return resolve();
        }));
      this.watch();
    }
  }


  watch = async () => {
    setTimeout(async () => {
      if (this.IsStop) {
        this.PromiseToStop();
      } else {
        this.OnWaitch(await this.Observation());
        this.watch();
      }
    }, this.WaitingTime);
  }

  constructor(Observation: () => Promise<any>, WaitingTime = 100) {
    this.Observation = Observation;
    this.WaitingTime = WaitingTime;

    this.watch();
  }
}
export async function getCurrentPoll(StreamerID: string): Promise<Poll> {
  /* Use fetch to communicate to backend and get current voting */
  return fetch(HOST + getPollRoute(StreamerID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok) return res.json();
    else return reject(res);
  }).catch((rej) => {
    console.error(rej);
    return rej.json().then((res) => { console.error(res) });
  })
}

export async function SendToPollManager(StreamerID: String, PollButtons: PollButton[],
  NewPollStatus: PollStatus): Promise<any> {
  /*Send current voting with your buttons and current poll status */
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(HOST + PollManagerRoute, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      StreamerID: StreamerID,
      NewPollStatus: NewPollStatus,
      PollButtons: PollButtons//TODO POR EM UM MODELODE DE REQUISIÇÃO
    })
  }).then((res) => {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json().then((res) => {
      return res;
    })
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function SendToMinerManager(StreamerID: string, Setting: MinerSettings) {
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(HOST + MinerManagerRoute, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      StreamerID: StreamerID,
      Setting: Setting
    })
  }).then(function (res) {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json();
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}
export async function addBet(StreamerID: string, TwitchUserID: string,
  IdOfVote: number, BetAmount: number): Promise<any> {
  let H = new Headers();
  H.append("Content-Type", "application/json");
  return fetch(HOST + addBeatRoute(StreamerID, TwitchUserID), {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      StreamerID: StreamerID,
      TwitchUserID: TwitchUserID,
      Vote: IdOfVote,
      BetAmount: Number(BetAmount)
    })
  }).then(async function (res) {
    if (res.ok) return resolve(await res.json())
    else return reject(await res.json());
  })
}

export async function GetMinerSettings(StreamerID: string) {
  return fetch(HOST + getMinerSettingsRoute(StreamerID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json();
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function GetCoinsSettings(StreamerID: string): Promise<CoinsSettings> {//TODO A ESTRURA SE REPETE em get Miner
  return fetch(HOST + getCoinsSettingsRoute(StreamerID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json();
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function SendToCoinsSettingsManager(StreamerID: String, Setting: CoinsSettings) {
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(HOST + CoinsSettingsManagerRoute, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      StreamerID: StreamerID,
      Setting: Setting
    })
  }).then(function (res) {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json();
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function MineCoin(StreamerID: string, TwitchUserID: string) {
  let H = new Headers();
  H.append("Content-Type", "application/json");
  return fetch(HOST + MineCoinRoute, {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      StreamerID: StreamerID,
      TwitchUserID: TwitchUserID
    })
  }).then(function (res) {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json();
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function GetWallet(StreamerID: string, TwitchUserID: string) {
  return fetch(HOST + getWalletRoute(StreamerID, TwitchUserID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  }).catch((rej) => {
    console.error(rej);

  })
}


export async function GetWallets(StreamerID: string, TwitchUserID = '*') {
  return fetch(HOST + getWallestRoute(StreamerID, TwitchUserID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  }).catch((rej) => {
    console.error(rej);

  })
}

export async function SendToWalletManager(StreamerID: string, TwitchUserID: string, newValue: number): Promise<any> {
  /*Send current voting with your buttons and current poll status */
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(HOST + WalletManager, {
    method: "POST",
    headers: H,
    body: JSON.stringify(new WalletManagerRequest(StreamerID, TwitchUserID, newValue))
  }).then((res) => {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json().then((res) => {
      return res;
    })
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function GetStore(StreamerID: string, StoreItemID = -1) {
  return fetch(HOST + getStoreRoute(StreamerID, StoreItemID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  }).catch((rej) => {
    console.error(rej);
  })
}

export async function SendToStoreManager(StreamerID: string, StoreItem: StoreItem): Promise<any> {
  /*Send current voting with your buttons and current poll status */
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(HOST + StoreManagerRoute, {
    method: "POST",
    headers: H,
    body: JSON.stringify(new StoreManagerRequest(StreamerID, StoreItem))
  }).then((res) => {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json().then((res) => {
      return res;
    })
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function addPurchaseOrder(StreamerID: string, TwitchUserID: string, StoreItem: StoreItem) {
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(HOST + PurchaseOrderRoute, {
    method: "POST",
    headers: H,
    body: JSON.stringify(new PurchaseOrderRequest(StreamerID, TwitchUserID, StoreItem.id))
  }).then((res) => {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json().then((res) => {
      return res;
    })
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function DeletePurchaseOrder(StreamerID: string, PurchaseOrder: PurchaseOrder, Refund: boolean) {
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(HOST + PurchaseOrderRoute, {
    method: "DELETE",
    headers: H,
    body: JSON.stringify(new DeletePurchaseOrderRequest(StreamerID, PurchaseOrder.TwitchUserID, PurchaseOrder.id, PurchaseOrder.StoreItemID, PurchaseOrder.SpentCoins, Refund))
  }).then((res) => {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then(async (res) => {
    return res.json();
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function DeteleStoreItem(StreamerID: string, StoreItem: StoreItem): Promise<any> {
  /*Send current voting with your buttons and current poll status */
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(HOST + StoreManagerRoute, {
    method: "DELETE",
    headers: H,
    body: JSON.stringify(new StoreManagerRequest(StreamerID, StoreItem))
  }).then((res) => {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json().then((res) => {
      return res;
    })
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        return reject(res);
      })
  });
}

export async function GetPurchaseOrders(StreamerID: string) {
  return fetch(HOST + getPurchaseOrderRoute(StreamerID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  }).catch((rej) => {
    console.error(rej);
  })
}

export async function UploadFile(StreamerID: string, FolderName: string, FileName: string, File: File) {
  /*Send current voting with your buttons and current poll status */
  let headers = new Headers();
  headers.append("Accept", "application/json");
  headers.append('streamer-id', StreamerID);
  headers.append("file-name", FileName);
  headers.append("file-id", FolderName);
  return fetch(HOST + UploadFileRoute,
    {
      method: "POST",
      headers: headers,
      body: File
    })
    .catch((rej) => {
      console.error(rej);
      return rej.json()
    })
    .then((res) => {
      return res.json();
    });
}

export function getUrlOfFile(StreamerID: string, Folder: string, FileName: string) {
  return HOST + getFilesRoute(StreamerID, Folder, FileName);
}

export function getURLOfWalletSkinsImage(SkinImageName: string, MaskNumber: number) {
  return HOST + getWalletSkinImage(SkinImageName, MaskNumber);
}

export async function getWalletSkins() {
  return fetch(HOST + GetWalletSkins, {
    method: "GET"
  }).then(function (res) {    
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  })
    .catch((rej) => {
      console.error(rej);
    })
} 

export async function getLocaleFile(ViewName:string,Locale:string) {
  return fetch(HOST + getLocale(ViewName,Locale), {
    method: "GET"
  }).then(function (res) {    
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  })
    .catch((rej) => {
      console.error(rej);
    })
}
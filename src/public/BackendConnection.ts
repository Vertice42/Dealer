import { reject, resolve, any } from 'bluebird';
import link from '../services/Links';
import ServerConfigs from '../services/configs/ServerConfigs';
import { PollStatus } from '../services/models/poll/PollStatus';
import { PollButton } from '../services/models/poll/PollButton';
import { Poll } from '../services/models/poll/Poll';
import { MinerSettings } from '../services/models/miner/MinerSettings';
import StoreItem from '../services/models/store/StoreItem';
import StoreManagerRequest from '../services/models/store/StoreManagerRequest';
import PurchaseOrderRequest from '../services/modules/database/store/PurchaseOrderRequest';
import DeletePurchaseOrderRequest from '../services/modules/database/store/DeletePurchaseOrderRequest';
import PurchaseOrder from '../services/models/store/PurchaseOrder';
import { WalletManagerRequest } from '../services/models/wallet/WalletManagerRequest';
import { CoinsSettings } from '../services/models/streamer_settings/CoinsSettings';
import { dbWallet } from '../services/models/poll/dbWallet';

export const host = 'http://localhost:' + (ServerConfigs.Port || process.env.Port);

export class Watch {
  private Watched: () => Promise<any>;
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
      this.OnWaitch(await this.Watched());
      this.watch();
    }
  }


  watch = async () => {
    setTimeout(async () => {
      if (this.IsStop) {
        this.PromiseToStop();
      } else {
        this.OnWaitch(await this.Watched());
        this.watch();
      }
    }, this.WaitingTime);
  }

  constructor(Watched: () => Promise<any>, WaitingTime = 100) {
    this.Watched = Watched;
    this.WaitingTime = WaitingTime;

    this.watch();
  }
}
export async function getCurrentPoll(StreamerID: string) {
  /* Use fetch to communicate to backend and get current voting */
  return fetch(host + link.getPoll(StreamerID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok) return res.json()
    else return reject(res);
  }).catch((rej) => {
    console.log(rej);
    return rej.json().then((res) => { console.error(res) });
  })
}

export async function SendToPollManager(StreamerID: String, PollButtons: PollButton[],
  NewPollStatus: PollStatus): Promise<any> {
  /*Send current voting with your buttons and current poll status */
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(host + link.PollManager, {
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

export async function SendToMinerManager(StreamerID: String, Setting: MinerSettings) {
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(host + link.MinerManager, {
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
        console.log(res);
        return reject(res);
      })
  });
}
export async function addBet(StreamerID: string, TwitchUserID: string,
  IdOfVote: number, BetAmount: number): Promise<any> {
  let H = new Headers();
  H.append("Content-Type", "application/json");
  return fetch(host + link.addBeat(StreamerID, TwitchUserID), {
    method: "POST",
    headers: H,
    body: JSON.stringify({
      StreamerID: StreamerID,
      TwitchUserID: TwitchUserID,
      Vote: IdOfVote,
      BetAmount: Number(BetAmount)
    })
  }).then(async function (res) {
    console.log(res.ok);
    if (res.ok) return resolve(await res.json())
    else return reject(await res.json());
  })
}

export async function GetMinerSettings(StreamerID: string) {
  return fetch(host + link.getMiner(StreamerID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json();
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        console.log(res);
        return reject(res);
      })
  });
}

export async function GetCoinsSettings(StreamerID: string): Promise<CoinsSettings> {//TODO A ESTRURA SE REPETE em get Miner
  return fetch(host + link.getCoinsSettings(StreamerID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok) return resolve(res)
    else return reject(res);
  }).then((res) => {
    return res.json();
  }).catch((rej) => {
    return rej.json()
      .then((res) => {
        console.log(res);
        return reject(res);
      })
  });
}

export async function SendToCoinsSettingsManager(StreamerID: String, Setting: CoinsSettings) {
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(host + link.CoinsSettingsManager, {
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
        console.log(res);
        return reject(res);
      })
  });
}

export async function MineCoin(StreamerID: string, TwitchUserID: string) {
  let H = new Headers();
  H.append("Content-Type", "application/json");
  return fetch(host + link.MineCoin, {
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
        console.log(res);
        return reject(res);
      })
  });
}

export async function GetWallet(StreamerID: string, TwitchUserID: string): Promise<dbWallet> {
  return fetch(host + link.getWallet(StreamerID, TwitchUserID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  }).catch((rej) => {
    console.log(rej);

  })
}

export async function GetWallets(StreamerID: string, TwitchUserID = '*') {
  return fetch(host + link.getWallets(StreamerID, TwitchUserID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  }).catch((rej) => {
    console.log(rej);

  })
}

export async function SendToWalletManager(StreamerID: string, TwitchUserID: string, newValue: number): Promise<any> {
  /*Send current voting with your buttons and current poll status */
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(host + link.WalletManager, {
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

export async function GetStore(StreamerID: string, StoreItemID: number) {
  return fetch(host + link.getStore(StreamerID, StoreItemID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  }).catch((rej) => {
    console.log(rej);
  })
}

export async function SendToStoreManager(StreamerID: string, StoreItem: StoreItem): Promise<any> {
  /*Send current voting with your buttons and current poll status */
  let H = new Headers();
  H.append("Content-Type", "application/json");

  return fetch(host + link.StoreManager, {
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

  return fetch(host + link.PurchaseOrder, {
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

  return fetch(host + link.PurchaseOrder, {
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

  return fetch(host + link.StoreManager, {
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
  return fetch(host + link.getPurchaseOrder(StreamerID), {
    method: "GET"
  }).then(function (res) {
    if (res.ok)
      return resolve(res.json())
    else
      return reject(res.json());
  }).catch((rej) => {
    console.log(rej);
  })


}

export async function UploadFile(StreamerID: string, FileName: string, File: File) {
  /*Send current voting with your buttons and current poll status */
  let headers = new Headers();
  headers.append("Accept", "application/json");
  headers.append('streamer-id', StreamerID);
  headers.append("file-name", FileName);
  return fetch(host + link.UploadFile,
    {
      method: "POST",
      headers: headers,
      body: File
    }).catch((rej) => {
      console.log(rej);
      return rej.json()
    })
    .then((res) => {
      return res.json();
    });
}

export function getUrlOfFile(StreamerID: string, FileName: string) {
  return host + link.getFiles(StreamerID, FileName);
}


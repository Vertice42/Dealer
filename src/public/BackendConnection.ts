import { reject, resolve } from 'bluebird';
import link from '../services/links';
import ServerConfigs from '../services/configs/ServerConfigs';
import { PollStatus } from '../services/models/poll/PollStatus';
import { PollButton } from '../services/models/poll/PollButton';
import { Poll } from '../services/models/poll/Poll';
import { MinerSettings } from '../services/models/miner/MinerSettings';
const host = 'http://localhost:' + (ServerConfigs.Port || process.env.Port);

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
export class WatchPoll {
  public onWatch = null;

  private onPollChange = null;
  private Stop = null;
  private LastUpdate = 0;
  private StreamerID: string

  constructor(StreamerID: string) {
    this.StreamerID = StreamerID;
  }

  private Watch() {
    getCurrentPoll(this.StreamerID).then((Poll: Poll) => {
      setTimeout(() => {
        if (!this.Stop) {
          this.Watch();
          if (this.onWatch) this.onWatch(Poll);
          if (this.LastUpdate !== Poll.LastUpdate) {
            if (this.onPollChange) this.onPollChange(Poll);
            this.LastUpdate = Poll.LastUpdate;
          }
        } else {
          this.Stop = null;
        }
      }, 500);
    }).catch(() => {
      console.log('Error connecting to Service, next attempt in 3s');
      setTimeout(() => {
        if (!this.Stop) this.Watch();
      }, 3000);
    });
  }

  start() {
    if (this.Stop === null) this.Watch();

    this.Stop = false;
    return this;
  }
  stop() {
    this.Stop = true;
    return this;
  }
  setOnPollChange(onPollChange) {
    this.onPollChange = onPollChange;
    return this;
  }
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
  return fetch(host + link.addVote, {
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

export async function GetMiner(StreamerID: string) {
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

export async function GetWallet(StreamerID: string, TwitchUserID: string) {
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
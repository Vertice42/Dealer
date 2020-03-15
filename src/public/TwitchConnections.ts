import { resolve, reject } from "bluebird";

export async function getUsername(TwitchUserID: string, Client_ID: string) {
    let H = new Headers();
    H.append('Accept', 'application/vnd.twitchtv.v5+json');
    H.append('Client-ID', Client_ID);

    return fetch('https://api.twitch.tv/kraken/users/'+TwitchUserID, {
        method: "GET",
        headers: H,
    }).then((res) => {        
        if (res.ok) return resolve(res)
        else return reject(res);
    }).then((res) => {
        return res.json();
    }).catch((rej) => {
        return rej.json();
    });
}

export async function getUserIDByUsername(TwitchUserID: string, Client_ID: string) {
    let H = new Headers();
    H.append('Accept', 'application/vnd.twitchtv.v5+json');
    H.append('Client-ID', Client_ID);

    return fetch('https://api.twitch.tv/kraken/users?login='+TwitchUserID, {
        method: "GET",
        headers: H,
    }).then((res) => {        
        if (res.ok) return resolve(res)
        else return reject(res);
    }).then((res) => {
        return res.json();
    }).catch((rej) => {
        return rej.json();
    });
}
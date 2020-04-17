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
    }).catch(async (rej) => {
        console.error(await rej.json());
        return rej.json();
    });
}

export async function getID(name: string, Client_ID: string) {
    let H = new Headers();
    H.append('Accept', 'application/vnd.twitchtv.v5+json');
    H.append('Client-ID', Client_ID);

    return fetch('https://api.twitch.tv/kraken/users?login='+name, {
        method: "GET",
        headers: H,
    }).then((res) => {                
        if (res.ok) return resolve(res)
        else return reject(res);
    }).then((res) => {
        return res.json();
    }).catch(async (rej) => {
        console.error(await rej.json());
        
        return rej.json();
    });
}

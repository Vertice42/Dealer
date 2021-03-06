import { UploadFileRoute, getFilesRoute, getWalletSkinImage, GetWalletSkins, getLocale } from "../../../services/routes/routes";
import { reject } from "bluebird";
import config from "./config";

export async function UploadFile(Token: string, FolderName: string, FileName: string, File: File) {
    let headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append('token', Token);
    headers.append("file-name", FileName);
    headers.append("file-id", FolderName);
    return fetch(config.URL + UploadFileRoute,
        {
            method: "POST",
            headers: headers,
            body: File
        }).then((result) => {
            if (result.ok) return result.json();
            else {
            console.error(result);
            return reject(result);
        }        })
}

export function getUrlOfFile(StreamerID: string, Folder: string, FileName: string) {
    return config.URL + getFilesRoute(StreamerID, Folder, FileName);
}

export function getURLOfWalletSkinsImg(SkinImageName: string, MaskNumber: number) {
    return config.URL + getWalletSkinImage(SkinImageName, MaskNumber);
}

export async function getWalletSkins() {
    return fetch(config.URL + GetWalletSkins, {
        method: "GET"
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    })
}

export async function getLocaleFile(ViewName: string, Locale: string) {
    return fetch(config.URL + getLocale(ViewName, Locale), {
        method: "GET"
    }).then((result) => {
        if (result.ok) return result.json();
        else {
            console.error(result);
            return reject(result);
        }    } )
}
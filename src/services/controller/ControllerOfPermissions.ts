import ExtensionProduct from "../models/store/item_settings/ExtensionProduct";
import ItemSetting from "../models/store/item_settings/ItemSettings";
import fs = require('fs');
import path = require('path');
import fetch from 'node-fetch';
import { resolve } from "bluebird";
import { sleep } from "../utils/functions";
import dbDealerManager from "../modules/databaseManager/dbDealerManager";

var OAuth = undefined;
var OAuthUsed = false;

async function getOAuthOfTwitch() {
    return (await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.ClientID}&client_secret=${process.env.ClientSecret}&grant_type=client_credentials`, {
        method: 'POST'
    })).json();
}
async function resetOauthOnTimeOut() {
    await sleep(OAuth.expires_in * 0.6);
    if (OAuthUsed) {
        OAuth = await getOAuthOfTwitch();
        resetOauthOnTimeOut();
    } else {
        OAuth = undefined;
    }
    OAuthUsed = false;
}
async function getOAuth() {
    OAuthUsed = true;
    if (OAuth) {
        return OAuth
    } else {
        OAuth = await getOAuthOfTwitch();
        resetOauthOnTimeOut();
        return OAuth;
    }
}

async function GetExtensionTransactions(id?: string, pagination = '') {
    console.log(process.env.ClientID);
    console.log(await getOAuth());


    return (await fetch(`https://api.twitch.tv/helix/extensions/transactions?extension_id=${process.env.ClientID}${(id) ? '&id=' + id : ''}${pagination}`, {
        method: 'GET',
        headers: {
            'client-id': process.env.ClientID,
            Authorization: 'Bearer ' + (await getOAuth()).access_token
        }
    })).json()
}

export async function VerifyOwnershipOfProduct(SkuOfProduct: string, id?: string, pagination = ''): Promise<boolean> {
    return GetExtensionTransactions(id, pagination).then((response) => {

        if (response.data.length < 1) return resolve(false);

        for (const product of response.data) {
            if (product.product_data.sku === SkuOfProduct)
                return resolve(true);
        }
        if (response.pagination) {
            return VerifyOwnershipOfProduct(SkuOfProduct, response.pagination);
        } else return resolve(false);
    })
}

export default class ControllerOfPermissions {
    private ID: string;

    private async UserHaveProductInTwitch(ExtensionProduct: ExtensionProduct) {
        return VerifyOwnershipOfProduct(ExtensionProduct.sku);
    }

    private async UserHaveProductIn_db(ExtensionProduct: ExtensionProduct) {
        if (ExtensionProduct.ItIsFree) return resolve(true);

        let have = false;
        let TransactionsOfUser = await new dbDealerManager(this.ID).getTransactionsOfUser();

        if (TransactionsOfUser) {
            have = !TransactionsOfUser.TransactionsArray.every(Transaction => {
                return Transaction.product.sku !== ExtensionProduct.sku;
            })
        }
        if (have) return resolve(true);
        else throw false;
    }

    private async UserHaveProduct(ExtensionProduct: ExtensionProduct) {
        return this.UserHaveProductIn_db(ExtensionProduct)
            .catch(async rej => {
                return this.UserHaveProductInTwitch(ExtensionProduct);
            })
    }

    async ThereAreBlockedSettings(ItemsSettings: ItemSetting[]) {
        return new Promise((resolve, reject) => {
            fs.readFile(path.resolve('./configs/DonorFeatures.json'), "utf8", async (ERROR, data) => {
                if (ERROR) return reject(ERROR);

                let ExtensionProducts: ExtensionProduct[] = JSON.parse(data);

                for (const ItemsSetting of ItemsSettings) {
                    if (!ItemsSetting.Enable ||
                        ExtensionProducts[ItemsSetting.DonorFeatureName].ItIsFree
                    ) return resolve(false);

                    if (await this.UserHaveProduct(ExtensionProducts[ItemsSetting.DonorFeatureName])) {
                        return resolve(false);
                    } else {
                        return resolve(true);
                    }
                }
            })
        })
    }

    constructor(ID: string) {
        this.ID = ID;
    }
}
import ExtensionProduct from "../models/store/item_settings/ExtensionProduct";
import ItemSetting from "../models/store/item_settings/ItemSettings";
import fs = require('fs');
import path = require('path');
import fetch from 'node-fetch';
import { resolve, reject } from "bluebird";
import { sleep } from "../utils/functions";
import dbDealerManager from "../modules/databaseManager/dbDealerManager";

var OAuth = undefined;

async function getOAuth() {
    if (OAuth) {
        return OAuth
    } else {        
        OAuth = await (await fetch(`https://id.twitch.tv/oauth2/token?client_id=${process.env.ClientID}&client_secret=${process.env.ClientSecret}&grant_type=client_credentials`, {
            method: 'POST'
        })).json();
        await sleep(OAuth.expires_in);
        OAuth = undefined;
    }

}

async function GetExtensionTransactions(id?: string, pagination = '') {    
    return (await fetch(`https://api.twitch.tv/helix/extensions/transactions?extension_id=${process.env.ExtensionID}${(id) ? '&id=' + id : ''}${pagination}`, {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + (await getOAuth()).access_token
        }
    })).json()
}

export async function VerifyOwnershipOfProduct(SkuOfProduct: string, id?: string, pagination = ''): Promise<boolean> {
    return GetExtensionTransactions(id, pagination).then((response) => {
        if (response.data.length < 1) return resolve(false);
        
        if ((!response.data.every(product => {
            return product.data.product_data.sku !== SkuOfProduct
        }))) {
        } else if (response.pagination) {
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
        else return reject(false);
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
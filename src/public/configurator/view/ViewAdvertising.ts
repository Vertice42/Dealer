import { sleep } from "../../../utils/utils";
import { ViewMain } from "./ViewMain";

export class ViewAdvertisement {
    private static HTML_AdvertisementDiv = <HTMLDivElement> document.getElementById('AdvertisementDiv');
    private static HTML_CloaseAdvertisementButton = <HTMLButtonElement> document.getElementById('CloaseAdvertisementButton');
    private static HTML_AdvertisementButton = <HTMLButtonElement> document.getElementById('AdvertisementButton');

    //TODO REMOVER HARD CODE html ?

    static Show() {
        ViewAdvertisement.HTML_AdvertisementDiv.style.display = '';
        ViewAdvertisement.HTML_AdvertisementDiv.classList.remove('AdvertisementHide');
        ViewAdvertisement.HTML_AdvertisementDiv.classList.add('AdvertisementSample');

        ViewMain.Hide();
    }

    static async Hide() {
        ViewAdvertisement.HTML_AdvertisementDiv.classList.remove('AdvertisementSample');
        ViewAdvertisement.HTML_AdvertisementDiv.classList.add('AdvertisementHide');
        await sleep(1100);
        ViewAdvertisement.HTML_AdvertisementDiv.style.display = 'none';
        ViewMain.Show();
    }

    constructor(){
        ViewAdvertisement.HTML_CloaseAdvertisementButton.onclick = () => {
            ViewAdvertisement.Hide();
        }
    }
    

}
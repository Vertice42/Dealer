import { sleep } from "../../../services/utils/functions";
import { ViewMain } from "./ViewMain";
/**
 * Contains methods to control advertising for the streamer
 */
export class ViewAdvertisement {
    public static onAdvertisementButtonActive = () => {};

    private static HTML_AdvertisementDiv = <HTMLDivElement> document.getElementById('AdvertisementDiv');
    private static HTML_CloseAdvertisementButton = <HTMLButtonElement> document.getElementById('CloseAdvertisementButton');
    private static HTML_AdvertisementButton = <HTMLButtonElement> document.getElementById('AdvertisementButton');

    public static Show() {
        ViewAdvertisement.HTML_AdvertisementDiv.style.display = '';
        ViewAdvertisement.HTML_AdvertisementDiv.classList.remove('AdvertisementHide');
        ViewAdvertisement.HTML_AdvertisementDiv.classList.add('AdvertisementSample');

        ViewMain.Hide();
    }

    public static async Hide() {
        ViewAdvertisement.HTML_AdvertisementDiv.classList.remove('AdvertisementSample');
        ViewAdvertisement.HTML_AdvertisementDiv.classList.add('AdvertisementHide');
        await sleep(1100);
        ViewAdvertisement.HTML_AdvertisementDiv.style.display = 'none';
        ViewMain.Show();
    }

    constructor(){
        ViewAdvertisement.HTML_CloseAdvertisementButton.onclick = () => {
            ViewAdvertisement.Hide();
        }

        ViewAdvertisement.HTML_AdvertisementButton.onclick = () => {
            ViewAdvertisement.onAdvertisementButtonActive();
        }
    }
}
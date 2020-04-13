import { sleep } from "../../../utils/functions";
import { ViewAdvertisement } from "./ViewAdvertising";

/**
 * Gives modules the functionality to be hidden, and to hide itself
 */
export class ViewMain {
    static HTML = <HTMLDivElement>document.getElementById('MainDiv');

    HTML_PollModule = <HTMLDivElement>document.getElementById('PollModule');
    HTML_PollModuleTitle = <HTMLTitleElement>document.getElementById('PollModuleTitle');

    HTML_SettingModule = <HTMLDivElement>document.getElementById('SettingModule');
    HTML_SettingModuleTitle = <HTMLTitleElement>document.getElementById('SettingModuleTitle');

    HTML_StoreModule = <HTMLDivElement>document.getElementById('StoreModule');
    HTML_StoreModuleTitle = <HTMLTitleElement>document.getElementById('StoreModuleTitle');

    HTML_WalletsModule = <HTMLDivElement>document.getElementById('WalletsModule');
    HTML_WalletsModuleTitle = <HTMLTitleElement>document.getElementById('WalletsModuleTitle');

    private async setModuleHide(HTMLDivElement: HTMLDivElement) {
        HTMLDivElement.classList.remove('ModuleSample');
        HTMLDivElement.classList.add('ModuleHide');
        localStorage.setItem(HTMLDivElement.id, '0');

        await sleep(500);
        HTMLDivElement.style.display = 'none';
    }

    private async setModuleSample(HTMLDivElement: HTMLDivElement) {
        HTMLDivElement.style.display = '';
        await sleep(100);

        HTMLDivElement.classList.remove('ModuleHide');
        HTMLDivElement.classList.add('ModuleSample');

        localStorage.setItem(HTMLDivElement.id, '1');
    }

    private ModuleIsHide(HTMLDivElement: HTMLDivElement) {
        let ISHide = localStorage.getItem(HTMLDivElement.id);

        return (HTMLDivElement.classList.contains('ModuleHide') || (ISHide) ? (ISHide === '0') : false)
    }

    private setHidden(button: HTMLElement, Module: HTMLDivElement) {
        if (this.ModuleIsHide(Module)) {
            this.setModuleHide(Module);
        }

        button.onclick = () => {
            if (this.ModuleIsHide(Module)) {
                this.setModuleSample(Module);
            } else {
                this.setModuleHide(Module);
            }
        }
    }

    static Hide() {
        this.HTML.classList.add('MainDivHidden');
    }

    static Show() {
        this.HTML.classList.remove('MainDivHidden');
    }

    constructor() {
        this.setHidden(this.HTML_PollModuleTitle, this.HTML_PollModule);
        this.setHidden(this.HTML_SettingModuleTitle, this.HTML_SettingModule);
        this.setHidden(this.HTML_StoreModuleTitle, this.HTML_StoreModule);
        this.setHidden(this.HTML_WalletsModuleTitle, this.HTML_WalletsModule);

        new ViewAdvertisement();
    }
}
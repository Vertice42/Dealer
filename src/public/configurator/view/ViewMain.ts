export class ViewMain {

    HTML_PollModule = <HTMLDivElement>document.getElementById('PollModule');
    HTML_PollModuleTitle = <HTMLTitleElement>document.getElementById('PollModuleTitle');

    HTML_SettingModule = <HTMLDivElement>document.getElementById('SettingModule');
    HTML_SettingModuleTitle = <HTMLTitleElement>document.getElementById('SettingModuleTitle');

    HTML_StoreModule = <HTMLDivElement>document.getElementById('StoreModule');
    HTML_StoreModuleTitle = <HTMLTitleElement>document.getElementById('StoreModuleTitle');

    HTML_WalletsModule = <HTMLDivElement>document.getElementById('WalletsModule');
    HTML_WalletsModuleTitle = <HTMLTitleElement>document.getElementById('WalletsModuleTitle');

    private setModuleHide(HTMLDivElement: HTMLDivElement) {
        HTMLDivElement.classList.remove('ModuleSample');
        HTMLDivElement.classList.add('ModuleHide');
        localStorage.setItem(HTMLDivElement.id,'0');
    }

    private setModuleSample(HTMLDivElement: HTMLDivElement) {
        HTMLDivElement.classList.remove('ModuleHide');
        HTMLDivElement.classList.add('ModuleSample');

        localStorage.setItem(HTMLDivElement.id,'1');
    }

    private ModuleIsHide(HTMLDivElement: HTMLDivElement) {
        let ISHide = localStorage.getItem(HTMLDivElement.id);
        
        return (HTMLDivElement.classList.contains('ModuleHide') || (ISHide)? (ISHide === '0') : false)

    }

    private setHideble(button: HTMLElement, Module: HTMLDivElement) {
        if(this.ModuleIsHide(Module)){
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

    constructor() {
        this.setHideble(this.HTML_PollModuleTitle, this.HTML_PollModule);
        this.setHideble(this.HTML_SettingModuleTitle, this.HTML_SettingModule);
        this.setHideble(this.HTML_StoreModuleTitle, this.HTML_StoreModule);
        this.setHideble(this.HTML_WalletsModuleTitle, this.HTML_WalletsModule);
    }
}
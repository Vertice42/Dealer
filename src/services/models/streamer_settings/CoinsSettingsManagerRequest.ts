import { CoinsSettings } from "./CoinsSettings";

export class CoinsSettingsManagerRequest {
    Token: string;
    Setting: CoinsSettings;
    constructor(Token: string, Setting: CoinsSettings) {
        this.Token = Token;
        this.Setting = Setting;
    }
}

import { MinerSettings } from "../streamer_settings/MinerSettings";
export class MinerManagerRequest {
    Token: string;
    Setting: MinerSettings;

    constructor(Token: string,Setting: MinerSettings) {
        this.Token = Token;
        this.Setting = Setting;
    }
}

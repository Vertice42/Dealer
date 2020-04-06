import { CoinsSettings } from "./CoinsSettings";

export class CoinsSettingsManagerRequest {
    StreamerID: string;
    Setting: CoinsSettings;
    constructor(StreamerID: string, Setting: CoinsSettings) {
        this.StreamerID = StreamerID;
        this.Setting = Setting;
    }
}

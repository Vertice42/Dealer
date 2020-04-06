import { MinerSettings } from "../streamer_settings/MinerSettings";
export class MinerManagerRequest {
    StreamerID: string;
    Setting: MinerSettings;

    constructor(StreamerID: string,Setting: MinerSettings) {
        this.StreamerID = StreamerID;
        this.Setting = Setting;
    }
}

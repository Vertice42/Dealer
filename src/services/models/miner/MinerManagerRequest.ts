import { MinerSettings } from "../streamer_settings/MinerSettings";
export class MinerManagerRequest {
    body: {
        StreamerID: string;
        Setting: MinerSettings;
    };
}

import { MinerSettings } from "./MinerSettings";
export class MinerManagerRequest {
    body: {
        StreamerID: string;
        Setting: MinerSettings;
    };
}

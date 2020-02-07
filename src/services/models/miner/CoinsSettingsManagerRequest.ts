import { CoinsSettings } from "../CoinsSettings";

export class CoinsSettingsManagerRequest {
    body: {
        StreamerID: string;
        Setting: CoinsSettings;
    };
}

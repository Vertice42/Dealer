export class TwitchListener {
    ListenerName: string;
    data:any;
    constructor(ListenerName: string,data: any) {
        this.ListenerName = ListenerName;
        this.data = data;
    }
}
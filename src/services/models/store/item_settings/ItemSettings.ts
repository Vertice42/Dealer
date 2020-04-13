export default class ItemSetting {
    public DonorFeatureName: string;
    public Enable: boolean;
    public value: any;


    constructor(DonorFeatureName: string, Enable: boolean, Value?: any) {
        this.DonorFeatureName = DonorFeatureName;
        this.Enable = Enable;
        this.value = Value;
    }
}
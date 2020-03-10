export default class ItemSettings {
    public DonorFeatureName: string;
    public Enable:boolean;

    constructor(DonorFeatureName: string,Enable:boolean) {        
        this.DonorFeatureName = DonorFeatureName;
        this.Enable = Enable
    }
}
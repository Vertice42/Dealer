import { ResponsiveInput } from "../../common/view/Inputs";

/**
 * Contains the necessary elements for the streamer to manage its settings
 */
export default class ViewSettings {
  public HourlyRewardInput: ResponsiveInput;
  public CoinNameInput: ResponsiveInput;
  public InputCoinImg: HTMLInputElement;
  private LabeForInputCoinImg = <HTMLLabelElement>document.getElementById('LabeForInputCoinImg');
  setCoinIMG(URL: string) {
    this.LabeForInputCoinImg.style.backgroundImage = 'url(' + URL + ')';
  }
  constructor() {
    this.HourlyRewardInput = new ResponsiveInput(<HTMLInputElement>document.getElementById('HourlyRewardInput'));
    this.CoinNameInput = new ResponsiveInput(<HTMLInputElement>document.getElementById('CoinNameInput'));
    this.InputCoinImg = <HTMLInputElement>document.getElementById('InputCoinImg');
  }
}

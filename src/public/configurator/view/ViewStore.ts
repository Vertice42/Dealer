import StoreItem, { StoreTypes, getItemsSetting } from "../../../services/models/store/StoreItem";
import { OrientedInput, ResponsiveInputFile } from "../../common/view/Inputs";
import ItemSetting from "../../../services/models/store/item_settings/ItemSettings";
import { Texts } from "../controller/MainController";

class SingleReproductionSettings {
  private ItemSettings: ItemSetting
  HTML: HTMLLabelElement
  HTML_Input: HTMLInputElement;
  HTML_span: HTMLSpanElement;
  constructor(ItemSettings: ItemSetting) {
    this.ItemSettings = ItemSettings;

    this.HTML = document.createElement('label');
    this.HTML.classList.add('switch');

    this.HTML_Input = document.createElement('input');
    this.HTML_Input.checked = this.ItemSettings.Enable;
    this.HTML_Input.type = 'checkbox';
    this.HTML.appendChild(this.HTML_Input);

    this.HTML_span = document.createElement('span');
    this.HTML_span.classList.add('slider');
    this.HTML_span.classList.add('round');
    Texts.onLocaleChange = () => this.HTML_span.title = Texts.get('SingleReproductionSettingsDescription');
    this.HTML.appendChild(this.HTML_span);

  }
}

class ViewStoreType {
  HTML: HTMLDivElement;
  HTML_InputAudioVolume: HTMLInputElement;
  Image: HTMLDivElement;
  AudioVolumeDiv: HTMLDivElement;

  onStoreTypeActive: (ViewStoreType: ViewStoreType) => any;

  public get InDemo(): boolean {
    return this.Image.classList.contains('ViewStoreTypeInDemo');
  }

  setInDemo() {
    this.Image.classList.add('ViewStoreTypeInDemo');

    this.AudioVolumeDiv.classList.remove('AudioVolumeDivHide');
    this.AudioVolumeDiv.classList.add('AudioVolumeDivSample');

    this.HTML_InputAudioVolume.style.display = '';
  }

  setHide() {
    this.Image.classList.remove('ViewStoreTypeInDemo');

    this.AudioVolumeDiv.classList.remove('AudioVolumeDivSample');
    this.AudioVolumeDiv.classList.add('AudioVolumeDivHide');

    this.HTML_InputAudioVolume.style.display = 'none';
  }

  constructor(StoreType: number, AudioVolumeSetting: ItemSetting) {
    this.HTML = document.createElement('div');
    this.HTML.classList.add('StoreTypeDiv')

    this.AudioVolumeDiv = document.createElement('div');
    this.AudioVolumeDiv.classList.add('AudioVolumeDiv');
    this.AudioVolumeDiv.classList.add('AudioVolumeDivHide');

    this.HTML_InputAudioVolume = document.createElement('input');
    this.HTML_InputAudioVolume.type = 'range';

    this.HTML_InputAudioVolume.value = AudioVolumeSetting.value;
    this.AudioVolumeDiv.appendChild(this.HTML_InputAudioVolume);

    this.Image = document.createElement('div');
    this.Image.classList.add('TypeDisplayIMG');

    this.HTML.classList.add('TypeDisplay');
    switch (StoreType) {
      case StoreTypes.Audio:
        this.Image.classList.add('ViewStoreTypeSound');
        break;
      default:
        this.Image.classList.add('ViewStoreTypeDefault');
        break;
    }

    this.Image.onclick = () => {

      this.onStoreTypeActive(this);
    }

    this.HTML.appendChild(this.AudioVolumeDiv);
    this.HTML.appendChild(this.Image);
  }
}

/**
 * A viewer so that the streamer can create and edit store items
 */
export class ViewStoreItem implements StoreItem {
  id: number;
  Type: number;
  Description: string;
  ItemsSettings: ItemSetting[];
  ItemsSettingsJson: string;
  FileName: string;
  Price: number;
  SingleReproductionSetting: SingleReproductionSettings;

  public HTML: HTMLDivElement

  private ElementHTML_ID: string;

  public ViewStoreType: ViewStoreType
  public DescriptionInput: OrientedInput
  public PriceInput: OrientedInput
  public ResponsiveInputFile: ResponsiveInputFile

  private HTML_DeleteButton: HTMLButtonElement

  public onDescriptionChange = (ViewStoreItem: ViewStoreItem) => { };
  public onPriceChange = (ViewStoreItem: ViewStoreItem) => { };
  public onSettingChange = (ViewStoreItem: ViewStoreItem, ItemSettings: ItemSetting) => { };
  public onButtonDeleteActive = (ViewStoreItem: ViewStoreItem) => { };

  private createDeleteButton() {
    this.HTML_DeleteButton = document.createElement('button');
    this.HTML_DeleteButton.classList.add('DeleteStoreItem')
    this.HTML_DeleteButton.onclick = () => { this.onButtonDeleteActive(this) };
    return this.HTML_DeleteButton;
  }

  constructor(ID: number, Type: number, Description: string, ItemSettings: ItemSetting[],
    FileName: string, Price: number) {

    this.id = ID;
    this.Type = Type;
    this.Description = Description;
    this.ItemsSettings = ItemSettings;
    this.FileName = FileName;
    this.Price = Price;

    this.ElementHTML_ID = 'InputFile' + this.id;

    this.DescriptionInput = new OrientedInput('text', 'DescriptionInput');
    Texts.onLocaleChange = () => this.DescriptionInput.Guidance = Texts.get('DescriptionInput');

    this.PriceInput = new OrientedInput('number', 'PriceInput');
    Texts.onLocaleChange = () => this.PriceInput.Guidance = Texts.get('PriceInput');

    this.ResponsiveInputFile = new ResponsiveInputFile(this.ElementHTML_ID, '.mp3,.wav');

    this.ViewStoreType = new ViewStoreType(this.Type, getItemsSetting('AudioVolume', this.ItemsSettings));
    this.SingleReproductionSetting = new SingleReproductionSettings(getItemsSetting('SingleReproduction', this.ItemsSettings))

    this.HTML = document.createElement('div');
    this.HTML.classList.add('StoreItem');
    this.HTML.appendChild(this.ViewStoreType.HTML);
    this.HTML.appendChild(this.DescriptionInput.HTML);
    this.HTML.appendChild(this.PriceInput.HTML);
    this.HTML.appendChild(this.SingleReproductionSetting.HTML);
    this.HTML.appendChild(this.ResponsiveInputFile.HTML);
    this.HTML.appendChild(this.createDeleteButton());

    this.SingleReproductionSetting.HTML.onchange = () => {
      let ItemSetting: ItemSetting = getItemsSetting('SingleReproduction', this.ItemsSettings);
      ItemSetting.Enable = this.SingleReproductionSetting.HTML_Input.checked;
      this.onSettingChange(this, ItemSetting);
    }

    this.ViewStoreType.HTML_InputAudioVolume.onchange = () => {
      let ItemSetting: ItemSetting = getItemsSetting('AudioVolume', this.ItemsSettings);
      ItemSetting.Enable = true;
      ItemSetting.value = this.ViewStoreType.HTML_InputAudioVolume.value;
      this.onSettingChange(this, ItemSetting);
    }

    this.DescriptionInput.HTML.onchange = () => {
      this.onDescriptionChange(this)
    };
    this.PriceInput.HTML.onchange = () => { this.onPriceChange(this) }
  }
}

/**
 * Containing html elements and methods so that the streamer can 
 * manage the store by limiting himself in the iteration with the same
 */
export default class ViewStoreManager {
  ViewStoreItems: ViewStoreItem[] = [];

  HTML_StoreItemsDiv = <HTMLDivElement>document.getElementById('StoreItems');
  HTML_DemoAudioPlayer = <HTMLAudioElement>document.getElementById('DemoAudioPlayer');
  HTML_AudioPlayer = <HTMLAudioElement>document.getElementById('AudioPlayer');

  onAddStoreItemSoundActive = () => { };
  onStoreTypeActive = (ViewStoreItem: ViewStoreItem, ViewStoreType: ViewStoreType) => { };
  onDescriptionChange = (ViewStoreItem: ViewStoreItem) => { };
  onPriceChange = (ViewStoreItem: ViewStoreItem) => { };
  onButtonDeleteActive = (ViewStoreItem: ViewStoreItem) => { };
  onSettingOfItemChange = (ViewStoreItem: ViewStoreItem, ItemSettings: ItemSetting) => { };
  onFileInputChange = (ViewStoreItem: ViewStoreItem) => { };

  addViewStoreItem(StoreItem: StoreItem) {
    let id = 1;
    if (this.ViewStoreItems.length > 1) {
      id = this.ViewStoreItems[this.ViewStoreItems.length - 1].id + 1;
    } else {
      if (this.ViewStoreItems.length > 0) {
        id = this.ViewStoreItems[0].id + 1;
      }
    }

    let viewStoreItem = new ViewStoreItem(
      id,
      StoreItem.Type,
      StoreItem.Description,
      StoreItem.ItemsSettings,
      StoreItem.FileName,
      StoreItem.Price);

    if (StoreItem.Description) {
      viewStoreItem.DescriptionInput.value = StoreItem.Description;
      viewStoreItem.Description = StoreItem.Description;
    }
    if (StoreItem.FileName) {
      viewStoreItem.ResponsiveInputFile.setUpgradeable();
    }
    if (StoreItem.Price) {
      viewStoreItem.PriceInput.value = StoreItem.Price.toString();
      viewStoreItem.Price = StoreItem.Price;
    }
    viewStoreItem.onDescriptionChange = (ViewStoreItem) => {
      viewStoreItem.Description = ViewStoreItem.DescriptionInput.HTML.value;
      this.onDescriptionChange(ViewStoreItem);
    };
    viewStoreItem.onPriceChange = (ViewStoreItem) => {
      viewStoreItem.Price = Number(ViewStoreItem.PriceInput.HTML.value);
      this.onPriceChange(ViewStoreItem);
    };
    viewStoreItem.ResponsiveInputFile.HTML_InputFile.addEventListener('change', () => {
      this.onFileInputChange(viewStoreItem);
    });
    viewStoreItem.onSettingChange = (ViewStoreItem, ItemSettings) => {
      this.onSettingOfItemChange(ViewStoreItem, ItemSettings);
    }
    viewStoreItem.onButtonDeleteActive = (StoreItem) => {
      this.onButtonDeleteActive(StoreItem);
    };
    viewStoreItem.ViewStoreType.onStoreTypeActive = (ViewStoreType) => {
      this.onStoreTypeActive(viewStoreItem, ViewStoreType);
    }

    this.ViewStoreItems.push(viewStoreItem);
    this.HTML_StoreItemsDiv.appendChild(viewStoreItem.HTML);
    return viewStoreItem;
  }
  removeStoreItem(StoreItem: ViewStoreItem) {
    this.HTML_StoreItemsDiv.removeChild(StoreItem.HTML);
    this.ViewStoreItems.splice(this.ViewStoreItems.indexOf(StoreItem), 1);
  }
  constructor() {
    document.getElementById('AddStoreItem').onclick = () => { this.onAddStoreItemSoundActive(); };
  }
}

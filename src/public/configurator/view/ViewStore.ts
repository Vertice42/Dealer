import StoreItem, { StoreTypes } from "../../../services/models/store/StoreItem";
import { OrientedInput, ResponsiveLabelForInputFile } from "../../common/model/Inputs";
import ItemSettings from "../../../services/models/store/ItemSettings";

export class ViewItemSettings {
  id: number
  ItemSettings: ItemSettings
  HTML: HTMLInputElement
  constructor(id: number, ItemSettings: ItemSettings) {
    this.id = id;
    this.ItemSettings = ItemSettings;

    this.HTML = document.createElement('input');
    this.HTML.type = 'checkbox';
    this.HTML.innerText = 'connect to back end' ///ItemSettings.SettingName;
  }
}

export class ViewStoreItem implements StoreItem {
  id: number;
  Type: number;
  Description: string;
  ItemsSettings: ItemSettings[];  
  ItemSettingsJson: string;
  FileName: string;
  Price: number;

  ViewSettingsOfItens: ViewItemSettings[] = [];

  public HTML: HTMLDivElement
  private ElemeteHTML_ID: string;

  private HTML_StoreType: HTMLImageElement
  public DescriptionInput: OrientedInput
  public PriceInput: OrientedInput
  public HTML_ItemSettingsDiv: HTMLDivElement
  public HTML_InputFile: HTMLInputElement
  public ResponsiveInputFile: ResponsiveLabelForInputFile;

  private HTML_DeleteButton: HTMLButtonElement

  public onDescriptionChange = (ViewStoreItem: ViewStoreItem) => { };
  public onPriceChange = (ViewStoreItem: ViewStoreItem) => { };
  public onSettingChange = (ViewStoreItem: ViewStoreItem, ViewItemSettings: ViewItemSettings) => { };
  public onButtonDeleteActived = (ViewStoreItem: ViewStoreItem) => { };

  private createStoreType(StoreType: number) {
    this.HTML_StoreType = document.createElement('img');
    switch (StoreType) {
      case StoreTypes.Audio:
        this.HTML_StoreType.src = './configurator/images/sond-document.png';
        break;
      default:
        this.HTML_StoreType.src = './configurator/images/undefined-document.png';
        break;
    }
    return this.HTML_StoreType;
  }

  private createItemsSettings(ItemSettings: ItemSettings[]) {
    this.HTML_ItemSettingsDiv = document.createElement('div');
    ItemSettings.forEach((ItemSettings, id) => {
      let viewItemSettings = new ViewItemSettings(id, ItemSettings);
      viewItemSettings.HTML.onchange = () => {
        this.onSettingChange(this, viewItemSettings);
      }
      this.HTML_ItemSettingsDiv.appendChild(viewItemSettings.HTML);
      this.ViewSettingsOfItens.push(viewItemSettings);
    });
    return this.HTML_ItemSettingsDiv;
  }

  private createInputFile() {
    this.HTML_InputFile = document.createElement('input');
    this.HTML_InputFile.setAttribute('type', 'file');
    this.HTML_InputFile.classList.add('inputfile');
    this.HTML_InputFile.name = 'file';
    this.HTML_InputFile.accept = '.mp3,.wav';

    this.HTML_InputFile.id = this.ElemeteHTML_ID;
    return this.HTML_InputFile;
  }

  private createDeletebutton() {
    this.HTML_DeleteButton = document.createElement('button');
    this.HTML_DeleteButton.classList.add('DeleteStoreItem')
    this.HTML_DeleteButton.onclick = () => { this.onButtonDeleteActived(this) };
    return this.HTML_DeleteButton;
  }

  constructor(
    ID: number,
    Type: number,
    Description: string,
    ItemSettings: ItemSettings[],
    FileName: string,
    Price: number
  ) {

    console.log(ID);
    

    this.id = ID;
    this.Type = Type;
    this.Description = Description;
    this.ItemsSettings = ItemSettings;
    this.FileName = FileName;
    this.Price = Price;

    this.ElemeteHTML_ID = 'inputFile' + this.id;

    this.ItemsSettings = ItemSettings;

    this.DescriptionInput = new OrientedInput('Incert Description', 'text', 'DescriptionInput');
    this.ResponsiveInputFile = new ResponsiveLabelForInputFile(this.ElemeteHTML_ID);
    this.PriceInput = new OrientedInput('Incert Price', 'number', 'PriceInput');

    this.HTML = document.createElement('div');
    this.HTML.classList.add('StoreItem');
    this.HTML.appendChild(this.createStoreType(this.Type));
    this.HTML.appendChild(this.DescriptionInput.HTMLInput);
    this.HTML.appendChild(this.PriceInput.HTMLInput);
    this.HTML.appendChild(this.createItemsSettings(ItemSettings));
    this.HTML.appendChild(this.createInputFile());
    this.HTML.appendChild(this.ResponsiveInputFile.HTMLInput)
    this.HTML.appendChild(this.createDeletebutton());

    this.DescriptionInput.HTMLInput.onchange = () => {
      this.onDescriptionChange(this)
    };
    this.PriceInput.HTMLInput.onchange = () => { this.onPriceChange(this) }
  }
}

export default class ViewStore {
  StoreItems: ViewStoreItem[] = [];
  ViewItemSettings: ItemSettings[];

  HTML_StoreItemsDiv = <HTMLDivElement>document.getElementById('StoreItems');
  HTML_AudioPlayer = <HTMLAudioElement>document.getElementById('AudioPlayer');

  onAddStoreItemSondActive = () => { };
  onDescriptionChange = (ViewStoreItem: ViewStoreItem) => { };
  onPriceChange = (ViewStoreItem: ViewStoreItem) => { };
  onButtonDeleteActive = (ViewStoreItem: ViewStoreItem) => { };
  onSettingsChange = (ViewStoreItem: StoreItem, ViewItemSettings: ViewItemSettings) => { };
  onFileInputChange = (ViewStoreItem: ViewStoreItem) => { };

  addStoreItem(StoreItem: StoreItem) {
    let id = 1;
    if (this.StoreItems.length > 1) {
      id = this.StoreItems[this.StoreItems.length - 1].id + 1;
    } else {
      if (this.StoreItems.length > 0) {
        id = this.StoreItems[0].id + 1;
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
      viewStoreItem.DescriptionInput.HTMLInput.value = StoreItem.Description;
      viewStoreItem.Description = StoreItem.Description;
      viewStoreItem.DescriptionInput.setUsed();
    }
    if (StoreItem.ItemsSettings) {
      viewStoreItem.ItemsSettings = StoreItem.ItemsSettings;
      viewStoreItem.ViewSettingsOfItens.forEach((ViewSettingsOfIten, index) => {
        ViewSettingsOfIten.ItemSettings = StoreItem.ItemsSettings[index];
        ViewSettingsOfIten.HTML.checked = StoreItem.ItemsSettings[index].Enable;
      });
    }
    if (StoreItem.FileName) {
      viewStoreItem.ResponsiveInputFile.setUpgradeable();
    }
    if (StoreItem.Price) {
      viewStoreItem.PriceInput.HTMLInput.value = StoreItem.Price.toString();
      viewStoreItem.Price = StoreItem.Price;
      viewStoreItem.PriceInput.setUsed();
    }

    viewStoreItem.onDescriptionChange = (ViewStoreItem) => {
      viewStoreItem.Description = ViewStoreItem.DescriptionInput.HTMLInput.value;
      this.onDescriptionChange(ViewStoreItem);
    };
    viewStoreItem.onPriceChange = (ViewStoreItem) => {
      viewStoreItem.Price = Number(ViewStoreItem.PriceInput.HTMLInput.value);
      this.onPriceChange(ViewStoreItem);
    };
    viewStoreItem.HTML_InputFile.addEventListener('change', () => {
      this.onFileInputChange(viewStoreItem); //TODO > 0)
    });
    viewStoreItem.onSettingChange = (ViewStoreItem, ViewItemSettings) => {
      this.onSettingsChange(ViewStoreItem, ViewItemSettings);
    }
    viewStoreItem.onButtonDeleteActived = (StoreItem) => {
      this.onButtonDeleteActive(StoreItem);
    };

    this.StoreItems.push(viewStoreItem);
    this.HTML_StoreItemsDiv.appendChild(viewStoreItem.HTML);
    return viewStoreItem;
  }
  removeStoreItem(StoreItem: ViewStoreItem) {
    this.HTML_StoreItemsDiv.removeChild(StoreItem.HTML);
    this.StoreItems.splice(this.StoreItems.indexOf(StoreItem), 1);
  }
  constructor(ItemSettings: ItemSettings[]) {
    this.ViewItemSettings = ItemSettings;
    document.getElementById('AddStoreItem').onclick = () => { this.onAddStoreItemSondActive(); };
  }
}

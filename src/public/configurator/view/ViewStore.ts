import StoreItem from "../../../services/models/store/StoreItem";
import { OrientedInput, ResponsiveLabelForInputFile } from "../../common/model/Inputs";

export class ViewStoreItem implements StoreItem {
    id: number;
    Type: number;
    Description: string;
    FileName: string;
    Price: number;
  
    public HTML: HTMLDivElement
    private ElemeteHTML_ID: string;
  
    private HTML_StoreType: HTMLImageElement
    public DescriptionInput: OrientedInput
    public PriceInput: OrientedInput
    public HTML_InputFile: HTMLInputElement
    public ResponsiveInputFile: ResponsiveLabelForInputFile;
  
    private HTML_DeleteButton: HTMLButtonElement
  
    public onDescriptionChange = (ViewStoreItem: ViewStoreItem) => { };
    public onPriceChange = (ViewStoreItem: ViewStoreItem) => { };
    public onButtonDeleteActived = (ViewStoreItem: ViewStoreItem) => { };
  
    private createStoreType() {
      this.HTML_StoreType = document.createElement('img');
      this.HTML_StoreType.src = './configurator/images/undefined-document.png';
      return this.HTML_StoreType;
    }
  
    private createInputFile() {
      this.HTML_InputFile = document.createElement('input');
      this.HTML_InputFile.setAttribute('type', 'file');
      this.HTML_InputFile.classList.add('inputfile');
      this.HTML_InputFile.name = 'file';
      this.HTML_InputFile.accept = 'audio/*';
  
      this.HTML_InputFile.id = this.ElemeteHTML_ID;
      return this.HTML_InputFile;
    }
  
    private createDeletebutton() {
      this.HTML_DeleteButton = document.createElement('button');
      this.HTML_DeleteButton.classList.add('DeleteStoreItem')
      this.HTML_DeleteButton.onclick = () => { this.onButtonDeleteActived(this) };
      return this.HTML_DeleteButton;
    }
  
    constructor(ID: number) {
      this.id = ID
      this.ElemeteHTML_ID = 'inputFile' + this.id;
  
      this.DescriptionInput = new OrientedInput('Incert Description', 'text', 'DescriptionInput');
      this.ResponsiveInputFile = new ResponsiveLabelForInputFile(this.ElemeteHTML_ID);
      this.PriceInput = new OrientedInput('Incert Price', 'number', 'PriceInput');
  
      this.HTML = document.createElement('div');
      this.HTML.classList.add('StoreItem');
      this.HTML.appendChild(this.createStoreType());
      this.HTML.appendChild(this.DescriptionInput.HTMLInput);
      this.HTML.appendChild(this.PriceInput.HTMLInput);
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
  HTML_StoreItems = <HTMLDivElement>document.getElementById('StoreItems');
  HTML_AudioPlayer = <HTMLAudioElement>document.getElementById('AudioPlayer');
  onAddStoreItemActive = () => { };
  onDescriptionChange = (ViewStoreItem: ViewStoreItem) => { };
  onPriceChange = (ViewStoreItem: ViewStoreItem) => { };
  onButtonDeleteActive = (ViewStoreItem: ViewStoreItem) => { };
  onFileInputChange = (ViewStoreItem: ViewStoreItem) => { };
  private StoreItems: ViewStoreItem[] = [];
  addStoreItem(StoreItem: StoreItem) {
    let id = (this.StoreItems[this.StoreItems.length - 1]) ? this.StoreItems[this.StoreItems.length - 1].id + 1 : 0;
    let Item = new ViewStoreItem(id);
    if (StoreItem) {
      if (StoreItem.id) {
        Item.id = StoreItem.id;
      }
      if (StoreItem.Description) {
        Item.DescriptionInput.HTMLInput.value = StoreItem.Description;
        Item.Description = StoreItem.Description;
        Item.DescriptionInput.setUsed();
      }
      if (StoreItem.Price) {
        Item.PriceInput.HTMLInput.value = StoreItem.Price.toString();
        Item.Price = StoreItem.Price;
        Item.PriceInput.setUsed();
      }
      if (StoreItem.FileName) {
        Item.ResponsiveInputFile.setUpgradeable();
      }
    }
    this.StoreItems.push(Item);
    Item.onDescriptionChange = (StoreItem) => {
      Item.Description = StoreItem.DescriptionInput.HTMLInput.value;
      this.onDescriptionChange(StoreItem);
    };
    Item.onPriceChange = (StoreItem) => {
      Item.Price = Number(StoreItem.PriceInput.HTMLInput.value);
      this.onPriceChange(StoreItem);
    };
    Item.HTML_InputFile.addEventListener('change', () => {
      this.onFileInputChange(Item); //TODO > 0)
    });
    Item.onButtonDeleteActived = (StoreItem) => {
      this.onButtonDeleteActive(StoreItem);
    };
    this.HTML_StoreItems.appendChild(Item.HTML);
  }
  removeStoreItem(StoreItem: ViewStoreItem) {
    this.HTML_StoreItems.removeChild(StoreItem.HTML);
    this.StoreItems.splice(this.StoreItems.indexOf(StoreItem), 1);
  }
  constructor() {
    document.getElementById('AddStoreItem').onclick = () => { this.onAddStoreItemActive(); };
  }
}

import { PollStatus } from "../../services/models/poll/PollStatus";
import { Poll } from "../../services/models/poll/Poll";
import { ResponsiveInput, OrientedInput, ResponsiveInputFile } from "../model/Inputs";
import StoreItem from "../../services/models/store/StoreItem";
import PurchaseOrder from "../../services/models/store/PurchaseOrder";

function GenerateColor() {
  /**Generate random hex color*/
  var hexadecimais = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += hexadecimais[Math.floor(Math.random() * 16)];
  }
  return color;
}

class PollItemViewer {
  ID: number;
  onChange: { (): void; (): void; (): void; };

  getNameInputValue: () => string;
  setNameInputValue: (v: string) => void;
  getColorInputValue: () => string;
  setColorInputValue: (v: string) => void;
  IsWinner: () => boolean;
  setVoteCounterOutputValue: (value: number) => void;

  ShowWinnerPick: () => void;
  HideWinnerPick: () => void;
}
class PollItemDesktopViewer extends PollItemViewer {
  private ViewPoll: ViewPollManeger;

  public HTMLElement: HTMLDivElement;

  getVoteCounterOutputValue: () => number;
  onWinnersButtonsChange: () => {};

  private NameInput = class {
    public HTMLElement: HTMLDivElement;
    private HTMLNameInput: HTMLInputElement;
    onChange: { (): void; (): void; };

    constructor() {
      let name_input_div = document.createElement("div");
      name_input_div.style.display = 'flex';
      let text_name = document.createElement("h3");
      text_name.innerText = "NOME |";
      name_input_div.appendChild(text_name);
      // name to indicate input function
      this.HTMLNameInput = document.createElement("input");
      this.HTMLNameInput.type = "text";
      this.HTMLNameInput.onchange = () => { this.onChange(); }
      name_input_div.appendChild(this.HTMLNameInput);
      this.HTMLElement = name_input_div;
    }
    public getValue(): string {
      return this.HTMLNameInput.value;
    }

    public setValue(v: string) {
      this.HTMLNameInput.value = v;
    }
  }

  private ColorInput = class {
    public HTMLElement: HTMLDivElement;
    private HTMLColorInput: HTMLInputElement
    onChange: { (): void; (): void; };

    constructor() {
      let color_input_div = document.createElement("div");
      color_input_div.style.display = 'flex';
      let text_color = document.createElement("h3");
      text_color.innerText = "COR |";
      color_input_div.appendChild(text_color);
      // name to indicate input function
      this.HTMLColorInput = document.createElement("input");
      this.HTMLColorInput.type = "color";
      this.HTMLColorInput.onchange = () => { this.onChange(); };
      color_input_div.appendChild(this.HTMLColorInput);
      this.HTMLElement = color_input_div;
    }

    public getValue(): string {
      return this.HTMLColorInput.value;
    }

    public setValue(v: string) {
      this.HTMLColorInput.value = v;
    }
  }

  private VoteCounterOutput = class {
    HTMLElement: HTMLDivElement;
    private HTMLVoteOutput: HTMLHeadingElement;
    constructor() {
      let vote_output_div = document.createElement('div');
      vote_output_div.style.display = 'contents';
      vote_output_div.style.width = 'max-content';
      //vote_output_div.classList.add('');
      let text_Vote = document.createElement("h3");
      text_Vote.innerText = "VOTOS |";
      vote_output_div.appendChild(text_Vote);
      //name to indicate output function
      this.HTMLVoteOutput = document.createElement("h3");
      this.HTMLVoteOutput.classList.add("VoteNumerator");
      this.HTMLVoteOutput.innerText = "0";
      vote_output_div.appendChild(this.HTMLVoteOutput);
      this.HTMLElement = vote_output_div;
    }

    public getValue(): number {
      return Number(this.HTMLVoteOutput.innerText);
    }

    public setValue(value: number) {
      this.HTMLVoteOutput.innerText = value.toString();
    }

  }

  private DeleteButton = class {
    HTMLElement: HTMLButtonElement;
    constructor(ViewPoll: ViewPollManeger, PollItemDesktopViewer: PollItemDesktopViewer) {
      let delete_button = document.createElement("button");
      delete_button.classList.add("DeletePollItemButton");
      delete_button.onclick = function () {
        ViewPoll.removeItem(PollItemDesktopViewer);
      };
      //button to delete this item
      this.HTMLElement = delete_button;
    }
  }

  private PickWinnerButton = class {
    HTMLElement: HTMLDivElement;
    private PickWinnerButton: HTMLButtonElement;
    onChange: () => void;
    IsSelected() {
      return this.PickWinnerButton.classList.contains("selected");
    }

    Selected() {
      this.PickWinnerButton.classList.add("selected");
    }

    Unelected() {
      this.PickWinnerButton.classList.remove("selected");
    }

    Show() {
      this.HTMLElement.classList.remove('LayoutToChooseHidden');
      this.HTMLElement.classList.add('LayoutToChoose')

    }

    Hide() {
      this.HTMLElement.classList.remove('LayoutToChoose');
      this.HTMLElement.classList.add('LayoutToChooseHidden')
    }

    constructor() {
      let pick_winner_div = document.createElement("div");
      pick_winner_div.classList.add("LayoutToChooseHidden");


      let glass_div = document.createElement("div");

      let pick_winner_button_div = document.createElement("div");
      pick_winner_button_div.classList.add("DivOfChooseButton");

      this.PickWinnerButton = document.createElement("button");

      this.PickWinnerButton.classList.add("VoteManagementButton");
      this.PickWinnerButton.classList.add("ChooseButton");
      this.PickWinnerButton.value = "false";

      let pick_button = this;
      this.PickWinnerButton.onclick = () => {

        if (pick_button.IsSelected())
          pick_button.Unelected();
        else
          pick_button.Selected();
        this.onChange();
      };

      pick_winner_button_div.appendChild(this.PickWinnerButton);

      glass_div.appendChild(pick_winner_button_div);

      pick_winner_div.appendChild(pick_winner_button_div);
      pick_winner_div.appendChild(glass_div);

      this.HTMLElement = pick_winner_div;
    }
  }

  Enable(background_div: HTMLDivElement) {
    background_div.classList.add('PollItemInChoose');// TODO RENAME CSS
  }

  Disable(background_div: HTMLDivElement) {
    background_div.classList.remove('PollItemInChoose');
  }

  setWinner: () => void;

  constructor(ID: number, ViewPoll: ViewPollManeger) {
    super();
    this.ID = ID;
    this.ViewPoll = ViewPoll;

    let view_vote_item_div = document.createElement("div");
    view_vote_item_div.classList.add("PollItem");

    let background_div = document.createElement("div");
    background_div.style.display = 'flex';
    let NameInput = new this.NameInput();
    NameInput.onChange = () => this.onChange();
    this.getNameInputValue = () => NameInput.getValue();
    this.setNameInputValue = (v) => NameInput.setValue(v);

    let ColorInput = new this.ColorInput();
    ColorInput.onChange = () => this.onChange();
    this.getColorInputValue = () => ColorInput.getValue();
    this.setColorInputValue = (v) => ColorInput.setValue(v);

    let VoteCounterOutput = new this.VoteCounterOutput();
    this.getVoteCounterOutputValue = () => VoteCounterOutput.getValue();
    this.setVoteCounterOutputValue = (v) => VoteCounterOutput.setValue(v);

    background_div.appendChild(NameInput.HTMLElement)
    background_div.appendChild(ColorInput.HTMLElement)
    background_div.appendChild(VoteCounterOutput.HTMLElement);
    background_div.appendChild(new this.DeleteButton(ViewPoll, this).HTMLElement);


    let PickWinnerButton = new this.PickWinnerButton();
    PickWinnerButton.onChange = () => this.onWinnersButtonsChange();
    this.setWinner = () => PickWinnerButton.Selected();

    this.ShowWinnerPick = () => {
      this.Enable(background_div);
      PickWinnerButton.Show();
    };
    this.HideWinnerPick = () => {
      this.Disable(background_div);
      PickWinnerButton.Hide();
    };

    this.IsWinner = () => PickWinnerButton.IsSelected();

    view_vote_item_div.appendChild(background_div);
    view_vote_item_div.appendChild(PickWinnerButton.HTMLElement);
    view_vote_item_div.appendChild(background_div);

    this.HTMLElement = view_vote_item_div;
  }
}

export class ViewPollManeger {
  PollStatus: PollStatus = null;

  PollItemsViewers: PollItemViewer[] = [];

  DistributionDiv = <HTMLDivElement>document.getElementById("DistributionDiv");
  PollManagerDiv = <HTMLDivElement>document.getElementById("PollManagerDiv");
  PollItensDiv = <HTMLDivElement>document.getElementById("PollItensDiv");

  CreatePollButton = <HTMLButtonElement>document.getElementById("CreatePollButton");
  DeletePollButton = <HTMLButtonElement>document.getElementById("DeletePollButton");

  AddItemButton = <HTMLButtonElement>document.getElementById("AddPollItemButton");
  StartPollButton = <HTMLButtonElement>document.getElementById("StartPollButton");
  ApplyChangesButton = <HTMLButtonElement>document.getElementById("ApplyChangesButton");
  StopPollButton = <HTMLButtonElement>document.getElementById("StopPollButton");
  RestartButton = <HTMLButtonElement>document.getElementById("RestartButton");
  DistributeButton = <HTMLButtonElement>document.getElementById("DistributeButton");
  CloseButton = <HTMLButtonElement>document.getElementById("CloseButton");

  onCommandToCreateSent: { (): Promise<any>; (): { then: (arg0: () => void) => void; }; }
  onCommandToWaxSent: { (): Promise<any>; (): { then: (arg0: (res: any) => void) => void; }; (): void; }
  onCommandToStartSent: { (): Promise<any>; (): { then: (arg0: (res: any) => void) => void; }; (): void; }
  onCommandToStopSent: { (): Promise<any>; (): { then: (arg0: (res: any) => void) => void; }; (): void; }
  onCommandToApplyChangesSent: { (): Promise<any>; (): { then: (arg0: (res: any) => void) => void; }; (): void; }
  onCommandToRestartSent: { (): Promise<any>; (): { then: (arg0: (res: any) => void) => void; }; (): void; }
  onCloseButtonClick: { (): Promise<any>; (): { then: (arg0: (res: any) => void) => void; }; (): void; }
  onCommandToDistributeSent: { (): Promise<any>; (): { then: (arg0: (res: any) => void) => void; }; (): void; }

  IsStarted: boolean;

  setCreatedPoll() {
    this.ShowPoll();
    this.EnableButton(this.AddItemButton, this.onClickOfAddItemButton);
    this.EnableButton(this.DeletePollButton, this.onClickOfWaxedPollButton);
  }

  setWaxedPoll() {
    this.HidePoll();
    this.HideDistributionDiv();
    this.HideButton(this.RestartButton);
    this.HideButton(this.StopPollButton);
    this.HideButton(this.DistributeButton);
    this.removeAllItems();

    this.ShowButton(this.CreatePollButton);
    this.EnableButton(this.CreatePollButton, this.onClickOfCreatePollButton);

    this.IsStarted = false;
  }

  setStartedPoll() {
    this.ShowButton(this.StopPollButton);
    this.EnableButton(this.StopPollButton, this.onClickOfStopPollButton);
    this.HideButton(this.StartPollButton);
    this.IsStarted = true;
  }

  setStopedPoll() {
    this.ShwoWinnersPicks();
    this.HideButton(this.StopPollButton);
    this.ShowButton(this.DistributeButton);
    this.ShowButton(this.RestartButton);
    this.EnableButton(this.RestartButton, this.onClickOfRestartButton);
    this.DisableButton(this.AddItemButton);

    this.IsStarted = false;
  }

  setRestartedPoll() {
    this.HideWinnersPicks();
    this.ShowButton(this.StopPollButton);
    this.HideButton(this.DistributeButton);
    this.HideButton(this.RestartButton);
    this.EnableButton(this.StopPollButton, this.onClickOfStopPollButton);
    this.EnableButton(this.AddItemButton, this.onClickOfAddItemButton);

    this.IsStarted = true;
  }

  setInDestruction() {
    this.ShowDistributionDiv();
  }

  Initialize() {
    this.CreatePollButton.onclick = this.onClickOfCreatePollButton;
    this.DeletePollButton.onclick = this.onClickOfWaxedPollButton;
  }

  constructor(Poll: Poll) {
    this.Initialize();
    if (Poll.PollStatus.PollWaxed) this.setWaxedPoll()
    else {
      this.setCreatedPoll();
      if (Poll.PollStatus.PollStarted) {
        this.setStartedPoll();
        Poll.PollButtons.forEach(PollButton => {

          this.addItem(PollButton.ID,
            PollButton.Name,
            PollButton.Color,
            PollButton.IsWinner)
        });
      };
      if (Poll.PollStatus.PollStoped) this.setStopedPoll();
      if (Poll.PollStatus.InDistribution) this.setInDestruction();
      if (Poll.PollStatus.DistributionCompleted) this.setDistributioFninished();
    }
  }

  private onClickOfCreatePollButton = () => {
    this.DisableButton(this.CreatePollButton)
    this.onCommandToCreateSent().then((res) => {
      this.setCreatedPoll();
    }).catch((rej) => {
      console.log(rej);

    })
    return true;
  }

  private onClickOfWaxedPollButton = () => {
    this.DisableButton(this.DeletePollButton);
    this.onCommandToWaxSent().then((res) => {
      this.setWaxedPoll();
    })
    return true;
  }

  private onClickOfAddItemButton = () => {
    let ID = 0;

    let LestPollItemsViewer = this.PollItemsViewers[this.PollItemsViewers.length - 1];
    if (LestPollItemsViewer !== undefined) {
      ID = LestPollItemsViewer.ID;
      ID++;
    }
    this.addItem(ID, null, GenerateColor(), false);
    this.onModified();
    return true;
  }

  private onClickOfStartButton = () => {
    this.onCommandToStartSent().then((res) => {
      this.setStartedPoll();
    });
    return true;
  }

  private onClickOfApplyChangesButton = () => {
    this.DisableButton(this.ApplyChangesButton)
    this.onCommandToApplyChangesSent().then((res) => {
      this.HideButton(this.ApplyChangesButton)
    });
    return true;
  }

  private onClickOfStopPollButton = () => {
    this.onCommandToStopSent().then((res) => {
      this.setStopedPoll();
    })
    return true;
  }

  private onClickOfRestartButton = () => {
    this.onCommandToRestartSent().then((res) => {
      this.setRestartedPoll();
    })
    return true;
  }

  private onClickOfDistributeButton = () => {
    this.onCommandToDistributeSent().then((res) => {
      this.setInDestruction();
    })
    return true;
  }

  private onClickOfCloseButton = () => {
    this.onCommandToWaxSent().then((res) => {
      this.setWaxedPoll();
    })
    return true;
  }

  //TODO ADD canell distribuition 

  setDistributioFninished() {
    this.ShowButton(this.CloseButton);
    this.EnableButton(this.CloseButton, this.onClickOfCloseButton);
  }

  private onModified = () => {
    if (this.PollStatus.PollStarted) {
      this.ShowButton(this.ApplyChangesButton);
    }

    if (this.ThereAreEnoughElements()) {
      this.EnableButton(this.ApplyChangesButton, this.onClickOfApplyChangesButton);
      this.EnableButton(this.StartPollButton, this.onClickOfStartButton);
      this.EnableButton(this.StopPollButton, this.onClickOfStopPollButton)
    } else {
      this.DisableButton(this.ApplyChangesButton);
      this.DisableButton(this.StartPollButton);
      this.DisableButton(this.StopPollButton);
    }
  };

  private onWinnerButtonsModified = () => {
    if (this.ThereAreWinners())
      this.EnableButton(this.DistributeButton, this.onClickOfDistributeButton);
    else this.DisableButton(this.DistributeButton);
    return true;
  };

  private ThereAreWinners() {
    let ThereAreWinners = false;
    this.PollItemsViewers.forEach(PollItemViewer => {
      if (PollItemViewer.IsWinner()) ThereAreWinners = true;
    });
    return ThereAreWinners
  }

  private ThereAreEnoughElements() {
    return (this.PollItemsViewers.length > 1);
  }

  addItem(ID: number, Name: string, Color: string, IsWinner: boolean) {
    let PollItem = new PollItemDesktopViewer(ID, this);
    PollItem.setNameInputValue(Name);
    PollItem.setColorInputValue(Color)
    if (IsWinner) PollItem.setWinner();
    PollItem.onChange = this.onModified;
    PollItem.onWinnersButtonsChange = this.onWinnerButtonsModified;

    this.PollItemsViewers.push(PollItem)
    this.PollItensDiv.appendChild(PollItem.HTMLElement);
  }

  removeItem(PollItem: PollItemDesktopViewer) {
    if (!this.PollStatus.PollStoped) {
      this.PollItemsViewers.splice(this.PollItemsViewers.indexOf(PollItem), 1);
      this.PollItensDiv.removeChild(PollItem.HTMLElement);
      this.onModified();
    }
  }

  uppdateAllItems(Poll: Poll) {
    this.PollItemsViewers.forEach(PollItem => {
      PollItem.setVoteCounterOutputValue(0);
      Poll.Bets.forEach(bet => {
        if (bet) {
          if (bet.BetID === PollItem.ID)
            PollItem.setVoteCounterOutputValue(bet.NumberOfBets);
        }
      });
    });
  }

  removeAllItems() {
    this.PollItensDiv.innerHTML = '';
    this.PollItemsViewers = [];
  }

  private ShowPoll() {
    this.PollManagerDiv.classList.remove("Hidden");

    this.HideButton(this.CreatePollButton);

    this.ShowButton(this.StartPollButton);

    this.HideDistributionDiv();
  }

  private HidePoll() {
    this.PollManagerDiv.classList.add("Hidden");
  }

  private ShowDistributionDiv() {
    this.DistributionDiv.classList.remove('Hidden')
    this.HidePoll();
  }

  private HideDistributionDiv() {
    this.DistributionDiv.classList.add('Hidden');
  }

  private ShowButton(Button: HTMLButtonElement) {
    Button.classList.remove("ButtonHide");
    Button.classList.remove("ButtonEnable");
    Button.classList.add("ButtonDisable");

    Button.onclick = null;
  }

  private HideButton(Button: HTMLButtonElement) {
    Button.classList.remove("ButtonDisable");
    Button.classList.remove("ButtonEnable");
    Button.classList.add("ButtonHide");
    Button.onclick = null;

  }

  private EnableButton(Button: HTMLButtonElement, onclick: () => {}) {
    Button.classList.remove("ButtonDisable");
    Button.classList.add("ButtonEnable");
    Button.onclick = onclick;

  }

  private DisableButton(Button: HTMLButtonElement) {
    Button.classList.remove("ButtonEnable");
    Button.classList.add("ButtonDisable");
    Button.onclick = null;

  }

  private ShwoWinnersPicks() {
    this.PollItemsViewers.forEach(PollItemViewer => {
      PollItemViewer.ShowWinnerPick();
    });
  }

  private HideWinnersPicks() {
    this.PollItemsViewers.forEach(PollItemViewer => {
      PollItemViewer.HideWinnerPick();
    });
  }

}
export class ViewSettings {
  public HourlyRewardInput: ResponsiveInput
  constructor() {
    this.HourlyRewardInput = new ResponsiveInput(<HTMLInputElement>document.getElementById('HourlyRewardInput'))
  }
}

class ViewStoreItem implements StoreItem {
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
  public ResponsiveInputFile: ResponsiveInputFile;

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
    this.ResponsiveInputFile = new ResponsiveInputFile(this.ElemeteHTML_ID);
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
export class ViewStore {
  HTML_StoreItems = <HTMLDivElement>document.getElementById('StoreItems');
  HTML_AudioPlayer = <HTMLAudioElement>document.getElementById('AudioPlayer');

  onAddStoreItemActive = () => { };
  onDescriptionChange = (ViewStoreItem: ViewStoreItem) => { };
  onPriceChange = (ViewStoreItem: ViewStoreItem) => { };
  onButtonDeleteActive = (ViewStoreItem: ViewStoreItem) => { };
  onFileInputChange = (ViewStoreItem: ViewStoreItem) => { }

  private StoreItems: ViewStoreItem[] = [];

  addStoreItem(StoreItem: StoreItem) {
    let id = (this.StoreItems[this.StoreItems.length - 1]) ? this.StoreItems[this.StoreItems.length - 1].id + 1 : 0
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
        Item.PriceInput.HTMLInput.value = StoreItem.Price.toString()
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
      this.onDescriptionChange(StoreItem)
    };
    Item.onPriceChange = (StoreItem) => {
      Item.Price = Number(StoreItem.PriceInput.HTMLInput.value);
      this.onPriceChange(StoreItem)
    };

    Item.HTML_InputFile.addEventListener('change', () => {
      this.onFileInputChange(Item)//TODO > 0)
    })

    Item.onButtonDeleteActived = (StoreItem) => {
      this.onButtonDeleteActive(StoreItem)
    };

    this.HTML_StoreItems.appendChild(Item.HTML);
  }

  removeStoreItem(StoreItem: ViewStoreItem) {
    this.HTML_StoreItems.removeChild(StoreItem.HTML)
    this.StoreItems.splice(this.StoreItems.indexOf(StoreItem), 1)
  }
  constructor() {
    document.getElementById('AddStoreItem').onclick = () => { this.onAddStoreItemActive() }
  }
}
export class ViewPurchasedItems {
  HTML:HTMLDivElement
  private HTML_ItemPlacement:HTMLSpanElement
  private HTML_UserName:HTMLSpanElement
  private HTML_PurchaseTime:HTMLSpanElement
  private HTML_ItemName:HTMLSpanElement
  private HTML_RefundButton:HTMLSpanElement

  private CreateHTML_ItemPlacement(ItemPlacement:number){
    this.HTML_ItemPlacement = document.createElement('span');
    this.HTML_ItemPlacement.classList.add('ItemPlacement');
    this.HTML_ItemPlacement.innerText = ItemPlacement + '°';
    return this.HTML_ItemPlacement;
  }

  private CreateHTML_UserName(UserName:string){
    this.HTML_UserName = document.createElement('span');
    this.HTML_UserName.classList.add('UserName');
    this.HTML_UserName.innerText = '@'+UserName;
    return this.HTML_UserName;
  }

  private CreatePurchaseTime(PurchaseTime:number){
    this.HTML_PurchaseTime = document.createElement('span');
    this.HTML_PurchaseTime.classList.add('PurchaseTime');
    //add ,ecanica de tempo dinamico
    this.HTML_PurchaseTime.innerText = PurchaseTime+'';
    return this.HTML_PurchaseTime;
  }

  private CreateHTML_ItemName(ItemName:string){
    this.HTML_ItemName = document.createElement('span');
    this.HTML_ItemName.classList.add('ItemName');
    this.HTML_ItemName.innerText = ItemName;
    return this.HTML_ItemName;
  }

  private CreateHTML_RefundButton(){
    this.HTML_RefundButton = document.createElement('button');
    this.HTML_RefundButton.classList.add('RefundButton');
    this.HTML_RefundButton.innerText = 'Refund';
    return this.HTML_RefundButton;
  }

  constructor(Placement:number,UserName:string,PurchaseTime:number,ItemDescription:string){
    this.HTML = document.createElement('div');
    this.HTML.classList.add('PurchasedItem');
    this.HTML.appendChild(this.CreateHTML_ItemPlacement(Placement))
    this.HTML.appendChild(this.CreateHTML_UserName(UserName))
    this.HTML.appendChild(this.CreatePurchaseTime(PurchaseTime))
    this.HTML.appendChild(this.CreateHTML_ItemName(ItemDescription))
    this.HTML.appendChild(this.CreateHTML_RefundButton())

  }
}

export class ViewPurchaseOrders {
  HTML_ListOfPurchasedItems = <HTMLDivElement> document.getElementById('ListOfPurchasedItems');
  HTML_LoadingBarOfAudioPlayer = <HTMLDivElement> document.getElementById('LoadingBarOfAudioPlayer');
  setAudioPlayerProgress(progres:number){
    let left = progres;
    let rigth = progres;
    this.HTML_LoadingBarOfAudioPlayer.style.backgroundImage = 
    `linear-gradient(to left, rgb(86, 128, 219) ${rigth}%, rgb(93, 144, 255) ${left}%)`;
  }
  addViewPurchaseOrder(OrderPlacement:number,UserName:string,PurchaseTime:number,StoreItem:StoreItem){
    this.HTML_ListOfPurchasedItems.appendChild(new ViewPurchasedItems(OrderPlacement,UserName,PurchaseTime,StoreItem.Description).HTML)
  }
  clear(){
    this.HTML_ListOfPurchasedItems.innerHTML = '';
  }
  constructor(){
  }
}
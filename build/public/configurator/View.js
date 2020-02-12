"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Inputs_1 = require("../model/Inputs");
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
}
class PollItemDesktopViewer extends PollItemViewer {
    constructor(ID, ViewPoll) {
        super();
        this.NameInput = class {
            constructor() {
                let name_input_div = document.createElement("div");
                name_input_div.style.display = 'flex';
                let text_name = document.createElement("h3");
                text_name.innerText = "NOME |";
                name_input_div.appendChild(text_name);
                // name to indicate input function
                this.HTMLNameInput = document.createElement("input");
                this.HTMLNameInput.type = "text";
                this.HTMLNameInput.onchange = () => { this.onChange(); };
                name_input_div.appendChild(this.HTMLNameInput);
                this.HTMLElement = name_input_div;
            }
            getValue() {
                return this.HTMLNameInput.value;
            }
            setValue(v) {
                this.HTMLNameInput.value = v;
            }
        };
        this.ColorInput = class {
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
            getValue() {
                return this.HTMLColorInput.value;
            }
            setValue(v) {
                this.HTMLColorInput.value = v;
            }
        };
        this.VoteCounterOutput = class {
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
            getValue() {
                return Number(this.HTMLVoteOutput.innerText);
            }
            setValue(value) {
                this.HTMLVoteOutput.innerText = value.toString();
            }
        };
        this.DeleteButton = class {
            constructor(ViewPoll, PollItemDesktopViewer) {
                let delete_button = document.createElement("button");
                delete_button.classList.add("DeletePollItemButton");
                delete_button.onclick = function () {
                    ViewPoll.removeItem(PollItemDesktopViewer);
                };
                //button to delete this item
                this.HTMLElement = delete_button;
            }
        };
        this.PickWinnerButton = class {
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
                this.HTMLElement.classList.add('LayoutToChoose');
            }
            Hide() {
                this.HTMLElement.classList.remove('LayoutToChoose');
                this.HTMLElement.classList.add('LayoutToChooseHidden');
            }
        };
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
        background_div.appendChild(NameInput.HTMLElement);
        background_div.appendChild(ColorInput.HTMLElement);
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
    Enable(background_div) {
        background_div.classList.add('PollItemInChoose'); // TODO RENAME CSS
    }
    Disable(background_div) {
        background_div.classList.remove('PollItemInChoose');
    }
}
class ViewPollManeger {
    constructor(Poll) {
        this.PollStatus = null;
        this.PollItemsViewers = [];
        this.DistributionDiv = document.getElementById("DistributionDiv");
        this.PollManagerDiv = document.getElementById("PollManagerDiv");
        this.PollItensDiv = document.getElementById("PollItensDiv");
        this.CreatePollButton = document.getElementById("CreatePollButton");
        this.DeletePollButton = document.getElementById("DeletePollButton");
        this.AddItemButton = document.getElementById("AddPollItemButton");
        this.StartPollButton = document.getElementById("StartPollButton");
        this.ApplyChangesButton = document.getElementById("ApplyChangesButton");
        this.StopPollButton = document.getElementById("StopPollButton");
        this.RestartButton = document.getElementById("RestartButton");
        this.DistributeButton = document.getElementById("DistributeButton");
        this.CloseButton = document.getElementById("CloseButton");
        this.onClickOfCreatePollButton = () => {
            this.DisableButton(this.CreatePollButton);
            this.onCommandToCreateSent().then((res) => {
                this.setCreatedPoll();
            }).catch((rej) => {
                console.log(rej);
            });
            return true;
        };
        this.onClickOfWaxedPollButton = () => {
            this.DisableButton(this.DeletePollButton);
            this.onCommandToWaxSent().then((res) => {
                this.setWaxedPoll();
            });
            return true;
        };
        this.onClickOfAddItemButton = () => {
            let ID = 0;
            let LestPollItemsViewer = this.PollItemsViewers[this.PollItemsViewers.length - 1];
            if (LestPollItemsViewer !== undefined) {
                ID = LestPollItemsViewer.ID;
                ID++;
            }
            this.addItem(ID, null, GenerateColor(), false);
            this.onModified();
            return true;
        };
        this.onClickOfStartButton = () => {
            this.onCommandToStartSent().then((res) => {
                this.setStartedPoll();
            });
            return true;
        };
        this.onClickOfApplyChangesButton = () => {
            this.DisableButton(this.ApplyChangesButton);
            this.onCommandToApplyChangesSent().then((res) => {
                this.HideButton(this.ApplyChangesButton);
            });
            return true;
        };
        this.onClickOfStopPollButton = () => {
            this.onCommandToStopSent().then((res) => {
                this.setStopedPoll();
            });
            return true;
        };
        this.onClickOfRestartButton = () => {
            this.onCommandToRestartSent().then((res) => {
                this.setRestartedPoll();
            });
            return true;
        };
        this.onClickOfDistributeButton = () => {
            this.onCommandToDistributeSent().then((res) => {
                this.setInDestruction();
            });
            return true;
        };
        this.onClickOfCloseButton = () => {
            this.onCommandToWaxSent().then((res) => {
                this.setWaxedPoll();
            });
            return true;
        };
        this.onModified = () => {
            if (this.PollStatus.PollStarted) {
                this.ShowButton(this.ApplyChangesButton);
            }
            if (this.ThereAreEnoughElements()) {
                this.EnableButton(this.ApplyChangesButton, this.onClickOfApplyChangesButton);
                this.EnableButton(this.StartPollButton, this.onClickOfStartButton);
                this.EnableButton(this.StopPollButton, this.onClickOfStopPollButton);
            }
            else {
                this.DisableButton(this.ApplyChangesButton);
                this.DisableButton(this.StartPollButton);
                this.DisableButton(this.StopPollButton);
            }
        };
        this.onWinnerButtonsModified = () => {
            if (this.ThereAreWinners())
                this.EnableButton(this.DistributeButton, this.onClickOfDistributeButton);
            else
                this.DisableButton(this.DistributeButton);
            return true;
        };
        this.Initialize();
        if (Poll.PollStatus.PollWaxed)
            this.setWaxedPoll();
        else {
            this.setCreatedPoll();
            if (Poll.PollStatus.PollStarted) {
                this.setStartedPoll();
                Poll.PollButtons.forEach(PollButton => {
                    this.addItem(PollButton.ID, PollButton.Name, PollButton.Color, PollButton.IsWinner);
                });
            }
            ;
            if (Poll.PollStatus.PollStoped)
                this.setStopedPoll();
            if (Poll.PollStatus.InDistribution)
                this.setInDestruction();
            if (Poll.PollStatus.DistributionCompleted)
                this.setDistributioFninished();
        }
    }
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
    //TODO ADD canell distribuition 
    setDistributioFninished() {
        this.ShowButton(this.CloseButton);
        this.EnableButton(this.CloseButton, this.onClickOfCloseButton);
    }
    ThereAreWinners() {
        let ThereAreWinners = false;
        this.PollItemsViewers.forEach(PollItemViewer => {
            if (PollItemViewer.IsWinner())
                ThereAreWinners = true;
        });
        return ThereAreWinners;
    }
    ThereAreEnoughElements() {
        return (this.PollItemsViewers.length > 1);
    }
    addItem(ID, Name, Color, IsWinner) {
        let PollItem = new PollItemDesktopViewer(ID, this);
        PollItem.setNameInputValue(Name);
        PollItem.setColorInputValue(Color);
        if (IsWinner)
            PollItem.setWinner();
        PollItem.onChange = this.onModified;
        PollItem.onWinnersButtonsChange = this.onWinnerButtonsModified;
        this.PollItemsViewers.push(PollItem);
        this.PollItensDiv.appendChild(PollItem.HTMLElement);
    }
    removeItem(PollItem) {
        if (!this.PollStatus.PollStoped) {
            this.PollItemsViewers.splice(this.PollItemsViewers.indexOf(PollItem), 1);
            this.PollItensDiv.removeChild(PollItem.HTMLElement);
            this.onModified();
        }
    }
    uppdateAllItems(Poll) {
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
    ShowPoll() {
        this.PollManagerDiv.classList.remove("Hidden");
        this.HideButton(this.CreatePollButton);
        this.ShowButton(this.StartPollButton);
        this.HideDistributionDiv();
    }
    HidePoll() {
        this.PollManagerDiv.classList.add("Hidden");
    }
    ShowDistributionDiv() {
        this.DistributionDiv.classList.remove('Hidden');
        this.HidePoll();
    }
    HideDistributionDiv() {
        this.DistributionDiv.classList.add('Hidden');
    }
    ShowButton(Button) {
        Button.classList.remove("ButtonHide");
        Button.classList.remove("ButtonEnable");
        Button.classList.add("ButtonDisable");
        Button.onclick = null;
    }
    HideButton(Button) {
        Button.classList.remove("ButtonDisable");
        Button.classList.remove("ButtonEnable");
        Button.classList.add("ButtonHide");
        Button.onclick = null;
    }
    EnableButton(Button, onclick) {
        Button.classList.remove("ButtonDisable");
        Button.classList.add("ButtonEnable");
        Button.onclick = onclick;
    }
    DisableButton(Button) {
        Button.classList.remove("ButtonEnable");
        Button.classList.add("ButtonDisable");
        Button.onclick = null;
    }
    ShwoWinnersPicks() {
        this.PollItemsViewers.forEach(PollItemViewer => {
            PollItemViewer.ShowWinnerPick();
        });
    }
    HideWinnersPicks() {
        this.PollItemsViewers.forEach(PollItemViewer => {
            PollItemViewer.HideWinnerPick();
        });
    }
}
exports.ViewPollManeger = ViewPollManeger;
class ViewSettings {
    constructor() {
        this.HourlyRewardInput = new Inputs_1.ResponsiveInput(document.getElementById('HourlyRewardInput'));
    }
}
exports.ViewSettings = ViewSettings;
class ViewStoreItem {
    constructor(ID) {
        this.onDescriptionChange = (ViewStoreItem) => { };
        this.onPriceChange = (ViewStoreItem) => { };
        this.onButtonDeleteActived = (ViewStoreItem) => { };
        this.id = ID;
        this.ElemeteHTML_ID = 'inputFile' + this.id;
        this.DescriptionInput = new Inputs_1.OrientedInput('Incert Description', 'text');
        this.PriceInput = new Inputs_1.OrientedInput('Incert Price', 'number');
        this.HTML = document.createElement('div');
        this.HTML.classList.add('StoreItem');
        this.HTML.appendChild(this.createStoreType());
        this.HTML.appendChild(this.DescriptionInput.HTMLInput);
        this.HTML.appendChild(this.PriceInput.HTMLInput);
        this.HTML.appendChild(this.createInputFile());
        this.HTML.appendChild(this.createLabelForInputFile());
        this.HTML.appendChild(this.createDeletebutton());
        this.DescriptionInput.HTMLInput.onchange = () => { this.onDescriptionChange(this); };
        this.PriceInput.HTMLInput.onchange = () => { this.onPriceChange(this); };
    }
    createStoreType() {
        this.HTML_StoreType = document.createElement('img');
        this.HTML_StoreType.src = './configurator/images/undefined-document.png';
        return this.HTML_StoreType;
    }
    createInputFile() {
        this.HTML_InputFile = document.createElement('input');
        this.HTML_InputFile.setAttribute('type', 'file');
        this.HTML_InputFile.classList.add('inputfile');
        this.HTML_InputFile.id = this.ElemeteHTML_ID;
        return this.HTML_InputFile;
    }
    createLabelForInputFile() {
        this.HTML_LabelForInputFile = document.createElement('label');
        this.HTML_LabelForInputFile.classList.add('AddUpdateFileIcon');
        this.HTML_LabelForInputFile.htmlFor = this.ElemeteHTML_ID;
        return this.HTML_LabelForInputFile;
    }
    createDeletebutton() {
        this.HTML_DeleteButton = document.createElement('button');
        this.HTML_DeleteButton.classList.add('DeleteStoreItem');
        this.HTML_DeleteButton.onclick = () => { this.onButtonDeleteActived(this); };
        return this.HTML_DeleteButton;
    }
}
class ViewStore {
    constructor() {
        this.onAddStoreItemActive = () => { };
        this.onDescriptionChange = (ViewStoreItem) => { };
        this.onPriceChange = (ViewStoreItem) => { };
        this.onButtonDeleteActive = (ViewStoreItem) => { };
        this.StoreItems = [];
        this.HTML_StoreItems = document.getElementById('StoreItems');
        document.getElementById('AddStoreItem').onclick = () => { this.onAddStoreItemActive(); };
    }
    addStoreItem() {
        let Item = new ViewStoreItem(this.StoreItems.length);
        this.StoreItems.push(Item);
        Item.onDescriptionChange = (StoreItem) => { this.onDescriptionChange(StoreItem); };
        Item.onPriceChange = (StoreItem) => { this.onPriceChange(StoreItem); };
        Item.onButtonDeleteActived = (StoreItem) => { this.onButtonDeleteActive(StoreItem); };
        this.HTML_StoreItems.appendChild(Item.HTML);
    }
    removeStoreItem(StoreItem) {
        this.HTML_StoreItems.removeChild(StoreItem.HTML);
        this.StoreItems.splice(this.StoreItems.indexOf(StoreItem), 1);
    }
}
exports.ViewStore = ViewStore;

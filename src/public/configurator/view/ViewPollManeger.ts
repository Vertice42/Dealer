import { PollStatus } from "../../../services/models/poll/PollStatus";
import { Poll } from "../../../services/models/poll/Poll";
import { PollButton } from "../../../services/models/poll/PollButton";
import { GenerateColor } from "../../common/model/ViewerFeatures";
import { Texts } from "../controller/MainController";

export class PollItemViewer {
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

class NameInput {
    public HTMLElement: HTMLDivElement;
    public HTMLNameInput: HTMLInputElement;
    onChange: { (): void; (): void; };

    constructor() {
        let name_input_div = document.createElement("div");
        name_input_div.classList.add('ItemInputDiv')
        let text_name = document.createElement("h3");
        Texts.onLocaleChange = () => {
            text_name.innerText = Texts.get("Name") + " |";
        }
        name_input_div.appendChild(text_name);
        // name to indicate input function
        this.HTMLNameInput = document.createElement('input');
        this.HTMLNameInput.maxLength = 13;
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

class ColorInput {
    public HTMLElement: HTMLDivElement;
    public HTMLColorInput: HTMLInputElement
    onChange: { (): void; (): void; };

    constructor() {
        let color_input_div = document.createElement("div");
        color_input_div.classList.add('ItemInputDiv')
        let text_color = document.createElement("h3");
        Texts.onLocaleChange = () => {
            text_color.innerText = Texts.get("Color") + " |";
        }
        color_input_div.appendChild(text_color);
        // name to indicate input function
        this.HTMLColorInput = document.createElement('input');
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

class VoteCounterOutput {
    HTMLElement: HTMLDivElement;
    public HTMLVoteOutput: HTMLHeadingElement;
    constructor() {
        let vote_output_div = document.createElement('div');
        vote_output_div.classList.add('ItemInputDiv');
        let text_Vote = document.createElement("h3");
        Texts.onLocaleChange = () => {
            text_Vote.innerText = Texts.get("Betting") + " |";
        }
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

class DeleteButton {
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

class PickWinnerButton {
    HTMLElement: HTMLDivElement;
    public PickWinnerButton: HTMLButtonElement;
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

export class PollItemDesktopViewer extends PollItemViewer {
    private ViewPoll: ViewPollManeger;

    public HTMLElement: HTMLDivElement;

    getVoteCounterOutputValue: () => number;
    onWinnersButtonsChange: () => {};
    NameInput: NameInput;
    ColorInput: ColorInput;
    VoteCounterOutput: VoteCounterOutput;
    DeleteButton: DeleteButton;
    PickWinnerButton: PickWinnerButton;

    Enable(background_div: HTMLDivElement) {
        background_div.classList.add('PollItemInChoose');
        this.NameInput.HTMLNameInput.setAttribute("disabled", "disabled");
        this.ColorInput.HTMLColorInput.setAttribute("disabled", "disabled");
        this.DeleteButton.HTMLElement.setAttribute("disabled", "disabled");
    }

    Disable(background_div: HTMLDivElement) {
        background_div.classList.remove('PollItemInChoose');
        this.NameInput.HTMLNameInput.removeAttribute("disabled");
        this.ColorInput.HTMLColorInput.removeAttribute("disabled");
        this.DeleteButton.HTMLElement.removeAttribute("disabled");
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

        this.NameInput = new NameInput();
        this.NameInput.onChange = () => this.onChange();
        this.getNameInputValue = () => this.NameInput.getValue();
        this.setNameInputValue = (v) => this.NameInput.setValue(v);

        this.ColorInput = new ColorInput();
        this.ColorInput.onChange = () => this.onChange();
        this.getColorInputValue = () => this.ColorInput.getValue();
        this.setColorInputValue = (v) => this.ColorInput.setValue(v);

        this.VoteCounterOutput = new VoteCounterOutput();
        this.getVoteCounterOutputValue = () => this.VoteCounterOutput.getValue();
        this.setVoteCounterOutputValue = (v) => this.VoteCounterOutput.setValue(v);

        this.DeleteButton = new DeleteButton(ViewPoll, this);

        background_div.appendChild(this.NameInput.HTMLElement)
        background_div.appendChild(this.ColorInput.HTMLElement)
        background_div.appendChild(this.VoteCounterOutput.HTMLElement);
        background_div.appendChild(this.DeleteButton.HTMLElement);


        this.PickWinnerButton = new PickWinnerButton();
        this.PickWinnerButton.onChange = () => this.onWinnersButtonsChange();
        this.setWinner = () => this.PickWinnerButton.Selected();

        this.ShowWinnerPick = () => {
            this.Enable(background_div);
            this.PickWinnerButton.Show();
        };
        this.HideWinnerPick = () => {
            this.Disable(background_div);
            this.PickWinnerButton.Hide();
        };

        this.IsWinner = () => this.PickWinnerButton.IsSelected();

        view_vote_item_div.appendChild(background_div);
        view_vote_item_div.appendChild(this.PickWinnerButton.HTMLElement);
        view_vote_item_div.appendChild(background_div);

        this.HTMLElement = view_vote_item_div;
    }
}
export default class ViewPollManeger {
    IsStarted: boolean;

    private pollStatus: PollStatus;

    public onStatusChange = (PollStatus: PollStatus) => { };

    public get PollStatus(): PollStatus {
        return this.pollStatus;
    }

    public set PollStatus(pollStatus: PollStatus) {
        this.pollStatus = pollStatus;
        this.onStatusChange(pollStatus);
    }


    PollItemsViewers: PollItemViewer[] = [];

    public get ThereAreSelectedWinners(): boolean {
        for (const key in this.PollItemsViewers) {
            if (this.PollItemsViewers[key].IsWinner())
                return true;
        }
        return false;
    }

    DistributionDiv = <HTMLDivElement>document.getElementById("DistributionDiv");
    PollManagerDiv = <HTMLDivElement>document.getElementById("PollManagerDiv");
    PollItensDiv = <HTMLDivElement>document.getElementById("PollItensDiv");
    CreatePollButton = <HTMLButtonElement>document.getElementById("CreatePollButton");
    DeletePollButton = <HTMLButtonElement>document.getElementById("DeletePollButton");
    AddItemButton = <HTMLButtonElement>document.getElementById("AddPollItemButton");
    StartPollButton = <HTMLButtonElement>document.getElementById("StartPollButton");
    ApplyChangesButton = <HTMLButtonElement>document.getElementById("ApplyChangesButton");
    RevertChangesButton = <HTMLButtonElement>document.getElementById("RevertChangesButton");
    StopPollButton = <HTMLButtonElement>document.getElementById("StopPollButton");
    RestartButton = <HTMLButtonElement>document.getElementById("RestartButton");
    DistributeButton = <HTMLButtonElement>document.getElementById("DistributeButton");
    CloseButton = <HTMLButtonElement>document.getElementById("CloseButton");

    onCommandToCreateSent: () => Promise<void>;
    onCommandToWaxSent: () => Promise<void>;
    onCommandToStartSent: () => Promise<void>;
    onCommandToStopSent: () => Promise<void>;
    onCommandToApplyChangesSent: { (): Promise<any>; (): Promise<void>; };
    onCommandToRestartSent: () => Promise<void>;
    onCloseButtonClick: () => Promise<void>;
    onCommandToDistributeSent: () => Promise<void>;
    onCommandToRevertChanges: () => Promise<void>;

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
        if (this.ThereAreSelectedWinners) this.EnableButton(this.DistributeButton, this.onClickOfDistributeButton);

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

    private onClickOfCreatePollButton = () => {
        this.DisableButton(this.CreatePollButton);
        this.onCommandToCreateSent().then((res) => {
            this.setCreatedPoll();
        }).catch((rej) => {
            console.error(rej);
        });
        return true;
    };
    private onClickOfWaxedPollButton = () => {
        this.DisableButton(this.DeletePollButton);
        this.onCommandToWaxSent().then((res) => {
            this.setWaxedPoll();
        });
        return true;
    };
    private onClickOfAddItemButton = () => {
        let ID = 0;
        let LestPollItemsViewer = this.PollItemsViewers[this.PollItemsViewers.length - 1];
        if (LestPollItemsViewer !== undefined) {
            ID = LestPollItemsViewer.ID;
            ID++;
        }
        this.addItem(ID, null, GenerateColor(), false);
        this.onPollItemModified();
        return true;
    };
    private onClickOfStartButton = () => {
        this.onCommandToStartSent().then((res) => {
            this.setStartedPoll();
        });
        return true;
    };
    private onClickOfApplyChangesButton = () => {
        this.DisableButton(this.ApplyChangesButton);
        this.onCommandToApplyChangesSent().then((res) => {
            this.HideButton(this.ApplyChangesButton);
            this.HideButton(this.RevertChangesButton);
        });
        return true;
    };
    private onClickOfRevertChangesButton = async () => {
        this.DisableButton(this.ApplyChangesButton);
        await this.onCommandToRevertChanges();
        this.HideButton(this.ApplyChangesButton);
        this.HideButton(this.RevertChangesButton);
        this.EnableButton(this.StopPollButton, this.onClickOfStopPollButton);

        return true;
    };
    private onClickOfStopPollButton = () => {
        this.onCommandToStopSent().then((res) => {
            this.setStopedPoll();
        });
        return true;
    };
    private onClickOfRestartButton = () => {
        this.onCommandToRestartSent().then((res) => {
            this.setRestartedPoll();
        });
        return true;
    };
    private onClickOfDistributeButton = () => {
        this.onCommandToDistributeSent().then((res) => {
            this.setInDestruction();
        });
        return true;
    };
    private onClickOfCloseButton = () => {
        this.onCommandToWaxSent().then((res) => {
            this.setWaxedPoll();
        });
        return true;
    };

    //TODO ADD canell distribuition 
    setDistributioFninished() {
        this.ShowButton(this.CloseButton);
        this.EnableButton(this.CloseButton, this.onClickOfCloseButton);
    }
    private onPollItemModified = () => {
        if (this.pollStatus.PollStarted) {
            this.ShowButton(this.ApplyChangesButton);
            this.ShowButton(this.RevertChangesButton);
        }

        this.EnableButton(this.RevertChangesButton, this.onClickOfRevertChangesButton);
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
    private onWinnerButtonsModified = () => {
        if (this.ThereAreSelectedWinners)
            this.EnableButton(this.DistributeButton, this.onClickOfDistributeButton);
        else
            this.DisableButton(this.DistributeButton);
        return true;
    };
    private ThereAreEnoughElements() {
        return (this.PollItemsViewers.length > 1);
    }
    addItem(ID: number, Name: string, Color: string, IsWinner: boolean) {
        let PollItem = new PollItemDesktopViewer(ID, this);
        PollItem.setNameInputValue(Name);
        PollItem.setColorInputValue(Color);
        if (IsWinner) {
            PollItem.setWinner();
        }
        PollItem.onChange = this.onPollItemModified;
        PollItem.onWinnersButtonsChange = this.onWinnerButtonsModified;
        this.PollItemsViewers.push(PollItem);
        this.PollItensDiv.appendChild(PollItem.HTMLElement);
        return PollItem;
    }
    removeItem(PollItem: PollItemDesktopViewer) {
        if (!this.pollStatus.PollStoped) {
            this.PollItemsViewers.splice(this.PollItemsViewers.indexOf(PollItem), 1);
            this.PollItensDiv.removeChild(PollItem.HTMLElement);
            this.onPollItemModified();
        }
    }
    uppdateVotesOfAllItems(Poll: Poll) {
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
    updateItems(Poll: Poll) {
        this.removeAllItems();
        Poll.PollButtons.forEach(PollButton => {
            this.addItem(PollButton.ID, PollButton.Name, PollButton.Color, PollButton.IsWinner);
        });
        this.uppdateVotesOfAllItems(Poll);
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
        this.DistributionDiv.classList.remove('Hidden');
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
    getPollButtons(): PollButton[] {
        let Buttons = [];
        this.PollItemsViewers.forEach(PollItemViewer => {
            Buttons.push(new PollButton(PollItemViewer.ID, PollItemViewer.getNameInputValue(), PollItemViewer.getColorInputValue(), PollItemViewer.IsWinner()));
        });
        return Buttons;
    }

    constructor(Poll: Poll) {
        this.Initialize();
        if (Poll.PollStatus.PollWaxed) {
            this.setWaxedPoll();
        } else {
            this.setCreatedPoll();
            if (Poll.PollStatus.PollStarted) {
                this.setStartedPoll();
                this.updateItems(Poll);
            }
            if (Poll.PollStatus.PollStoped)
                this.setStopedPoll();
            if (Poll.PollStatus.InDistribution)
                this.setInDestruction();
            if (Poll.PollStatus.DistributionCompleted)
                this.setDistributioFninished();
        }
    }
}

//TODO refatorar 
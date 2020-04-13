import { PollButton } from "../../../services/models/poll/PollButton";
import { ResponsiveInput } from "../../common/view/Inputs";
import { hexToRgb, sleep } from "../../../utils/functions";
import { EnableHideWhenMouseIsInactive, DivRelocatable } from "../../common/view/viewerFeatures";

const GRADIENT_DARKENING_RATE = 1.5;

export class ViewPollButton {
    HTMLElement: HTMLButtonElement
    ID: number;

    IsSelected() {
        return this.HTMLElement.classList.contains("selected");
    }

    Select() {
        this.HTMLElement.classList.add("Selected");
    }

    Unelect() {
        this.HTMLElement.classList.remove("Selected");
    }

    onSelected: () => any;

    constructor(Button: PollButton) {
        let ViewButton = document.createElement("button");
        ViewButton.classList.add('PollButton')

        ViewButton.onclick = () => {
            this.onSelected();
            this.Select();
        };

        let RGBcolor = hexToRgb(Button.Color);
        if (RGBcolor) {
            ViewButton.style.border = `border: 1px solid 
            rgb(${RGBcolor.r / GRADIENT_DARKENING_RATE * 1.3}, 
                ${RGBcolor.g / GRADIENT_DARKENING_RATE * 1.3},
                ${RGBcolor.b / GRADIENT_DARKENING_RATE * 1.3})`;

            ViewButton.style.backgroundImage = `linear-gradient(${Button.Color},
            rgb(${RGBcolor.r / GRADIENT_DARKENING_RATE}, 
                ${RGBcolor.g / GRADIENT_DARKENING_RATE},
                ${RGBcolor.b / GRADIENT_DARKENING_RATE}))`;

            ViewButton.style.boxShadow = `0px 6px 0px 
            rgb(${RGBcolor.r / GRADIENT_DARKENING_RATE * 1.4}, 
                ${RGBcolor.g / GRADIENT_DARKENING_RATE * 1.4},
                ${RGBcolor.b / GRADIENT_DARKENING_RATE * 1.4}),
                0px 3px 10px rgba(0, 0, 0, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.288), inset 0px 0px 3px rgba(255, 255, 255, 0.411)`

            ViewButton.addEventListener('mousedown', () => {
                ViewButton.style.boxShadow = `0px 2px 0px 
                rgb(${RGBcolor.r / GRADIENT_DARKENING_RATE * 1.4}, 
                        ${RGBcolor.g / GRADIENT_DARKENING_RATE * 1.4},
                        ${RGBcolor.b / GRADIENT_DARKENING_RATE * 1.4}),
                        0px 3px 10px rgba(0, 0, 0, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.288), inset 0px 0px 3px rgba(255, 255, 255, 0.411)`
            });
            ViewButton.addEventListener('mouseup', () => {
                ViewButton.style.boxShadow = `0px 6px 0px 
                rgb(${RGBcolor.r / GRADIENT_DARKENING_RATE * 1.4}, 
                    ${RGBcolor.g / GRADIENT_DARKENING_RATE * 1.4},
                    ${RGBcolor.b / GRADIENT_DARKENING_RATE * 1.4}),
                    0px 3px 10px rgba(0, 0, 0, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.288), inset 0px 0px 3px rgba(255, 255, 255, 0.411)`

            })
        }

        let Name = document.createElement("h4");
        Name.innerHTML = Button.Name;

        if (Button.Name !== null) {
            if (Button.Name.length > 2)
                Name.style.fontSize = 30 / Button.Name.length + 'px';
            else Name.style.fontSize = 10 + 'px'

        }

        ViewButton.appendChild(Name);
        this.HTMLElement = ViewButton;

    }
}
export default class ViewAlerts {    
    TwitchUserName: string;
    AlertsRelocatable: DivRelocatable;

    public getBetValue: () => number;
    public onBeatIDSelected = () => { };
    public BetAmountInput = new ResponsiveInput(<HTMLInputElement>document.getElementById("BetAmountInput"));

    private ParticipatePollButton = <HTMLInputElement>document.getElementById("ParticipatePollButton");
    private AlertsDiv = <HTMLDivElement>document.getElementById("AlertsDiv");
    
    private PollAlert = <HTMLDivElement>document.getElementById("PollAlert");
    private StopAlert = <HTMLDivElement>document.getElementById("StopAlert");
    private AlertOfWinner = <HTMLDivElement>document.getElementById("AlertOfWinner");
    private AlertOfLoser = <HTMLDivElement>document.getElementById("AlertOfLoser");

    private LossView = <HTMLDivElement>document.getElementById("LossView");
    private EarningsView = <HTMLDivElement>document.getElementById("EarningsView");
    private PollDiv = <HTMLDivElement>document.getElementById("PollDiv");
    private ButtonsDiv = <HTMLDivElement>document.getElementById("ButtonsDiv");

    public setButtonsInPollDiv(PollButtons: PollButton[]) {
        localStorage['sbi'+this.TwitchUserName] = undefined;
        this.ButtonsDiv.innerHTML = "";
        let buttons = [];
        PollButtons.forEach(pollButton => {
            let button = new ViewPollButton(pollButton);
            buttons.push(button);
            button.onSelected = () => {                
                localStorage['sbi'+this.TwitchUserName] = pollButton.ID;                
                this.onBeatIDSelected();
                buttons.forEach(Button => {
                    Button.Unelect();
                });
            };
            this.ButtonsDiv.appendChild(button.HTMLElement);
        });
    }
    public ShowAllert(div: HTMLDivElement) {
        div.classList.remove("Disable");
        div.classList.remove("Hidden");
        div.classList.add("Enable");
        div.classList.add("Alert");
    }
    public async HideAllert(div: HTMLDivElement) {
        return new Promise(async (resolve, reject) => {
            if (div.classList.contains("Disable")) {
                return resolve();
            }
            else {
                let onEnd = () => {
                    div.classList.remove("Alert");
                    div.classList.add("Hidden");
                    div.onanimationend = null;
                    div.removeEventListener('animationend', onEnd);
                    return resolve();
                };
                div.addEventListener('animationend', onEnd);
                div.classList.remove("Enable");
                div.classList.add("Disable");

                await sleep(1100);
                onEnd();
            }
        });
    }
    public async HideAllAlerts() {
        return Promise.all([
            this.HideAllert(this.PollAlert),
            this.HideAllert(this.StopAlert),
            this.HideAllert(this.AlertOfWinner),
            this.HideAllert(this.AlertOfLoser),
            this.HideAllert(this.PollDiv)
        ]);
    }
    private onclickOfParticipatePollButton() {
        this.HideAllAlerts().then(() => {
            this.ShowAllert(this.PollDiv);
        });
    }
    ;
    setInBetMode(PollButtons: PollButton[]) {
        this.HideAllAlerts().then(() => {
            this.setButtonsInPollDiv(PollButtons);
            this.ShowAllert(this.PollAlert);
        });
    }
    setInStopeMode() {
        this.HideAllAlerts().then(() => {
            this.ShowAllert(this.StopAlert);
        });
    }
    setInWinnerMode(LossDistributorOfPoll: number) {
        this.HideAllAlerts().then(() => {
            this.ShowAllert(this.AlertOfWinner);
            this.EarningsView.innerText = (this.getBetValue() * LossDistributorOfPoll).toString();
        });
    }
    setInLoserMode() {
        this.HideAllAlerts().then(() => {
            this.ShowAllert(this.AlertOfLoser);
            this.LossView.innerText = this.getBetValue().toString();
        });
    }
    constructor(TwitchUserName:string) {
        this.TwitchUserName = TwitchUserName;

        let display = document.getElementById('display');
        let X = display.clientWidth;
        let Y = display.clientHeight;

        this.AlertsRelocatable = new DivRelocatable(this.AlertsDiv, X / 2.5, Y / 1.9);

        this.BetAmountInput.HTML.onmouseenter = () => this.AlertsRelocatable.Disable();
        this.BetAmountInput.HTML.onmouseleave = () => this.AlertsRelocatable.Disable();

        EnableHideWhenMouseIsInactive(document.body, this.PollAlert);
        EnableHideWhenMouseIsInactive(document.body, this.PollDiv);
        EnableHideWhenMouseIsInactive(document.body, this.StopAlert);
        EnableHideWhenMouseIsInactive(document.body, this.AlertOfWinner);
        EnableHideWhenMouseIsInactive(document.body, this.AlertOfLoser);


        this.ParticipatePollButton.onclick = () => this.onclickOfParticipatePollButton();
        this.getBetValue = () => { return Number(this.BetAmountInput.HTML.value); };
    }
}

import { PollButton } from "../../../services/models/poll/PollButton";
import { ResponsiveInput } from "../../common/view/Inputs";
import { hexToRgb, sleep } from "../../../services/utils/functions";
import { DivRelocatable, AutomaticHidingDueInactivity } from "../../common/view/viewerFeatures";

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

    Unselect() {
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

        let RGB_Color = hexToRgb(Button.Color);
        if (RGB_Color) {
            ViewButton.style.border = `border: 1px solid 
            rgb(${RGB_Color.r / GRADIENT_DARKENING_RATE * 1.3}, 
                ${RGB_Color.g / GRADIENT_DARKENING_RATE * 1.3},
                ${RGB_Color.b / GRADIENT_DARKENING_RATE * 1.3})`;

            ViewButton.style.backgroundImage = `linear-gradient(${Button.Color},
            rgb(${RGB_Color.r / GRADIENT_DARKENING_RATE}, 
                ${RGB_Color.g / GRADIENT_DARKENING_RATE},
                ${RGB_Color.b / GRADIENT_DARKENING_RATE}))`;

            ViewButton.style.boxShadow = `0px 6px 0px 
            rgb(${RGB_Color.r / GRADIENT_DARKENING_RATE * 1.4}, 
                ${RGB_Color.g / GRADIENT_DARKENING_RATE * 1.4},
                ${RGB_Color.b / GRADIENT_DARKENING_RATE * 1.4}),
                0px 3px 10px rgba(0, 0, 0, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.288), inset 0px 0px 3px rgba(255, 255, 255, 0.411)`

            ViewButton.addEventListener('mousedown', () => {
                ViewButton.style.boxShadow = `0px 2px 0px 
                rgb(${RGB_Color.r / GRADIENT_DARKENING_RATE * 1.4}, 
                        ${RGB_Color.g / GRADIENT_DARKENING_RATE * 1.4},
                        ${RGB_Color.b / GRADIENT_DARKENING_RATE * 1.4}),
                        0px 3px 10px rgba(0, 0, 0, 0.4), inset 0px 1px 0px rgba(255, 255, 255, 0.288), inset 0px 0px 3px rgba(255, 255, 255, 0.411)`
            });
            ViewButton.addEventListener('mouseup', () => {
                ViewButton.style.boxShadow = `0px 6px 0px 
                rgb(${RGB_Color.r / GRADIENT_DARKENING_RATE * 1.4}, 
                    ${RGB_Color.g / GRADIENT_DARKENING_RATE * 1.4},
                    ${RGB_Color.b / GRADIENT_DARKENING_RATE * 1.4}),
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
    AutomaticHidingDueInactivity: AutomaticHidingDueInactivity;

    public getBetValue: () => number;
    public onBetIDSelected = () => { };
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
        this.ButtonsDiv.innerHTML = "";
        let buttons = [];
        PollButtons.forEach(pollButton => {
            let button = new ViewPollButton(pollButton);
            buttons.push(button);
            button.onSelected = () => {
                localStorage['ChosenBet' + this.TwitchUserName] = pollButton.ID;
                this.onBetIDSelected();
                buttons.forEach(Button => {
                    Button.Unselect();
                });
            };
            this.ButtonsDiv.appendChild(button.HTMLElement);
        });
    }
    public ShowAlert(div: HTMLDivElement) {
        div.classList.remove("Disable");
        div.classList.remove("Hidden");
        div.classList.add("Enable");
        div.classList.add("Alert");
    }
    public async HideAlert(div: HTMLDivElement) {
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
                if (div.classList.contains('Disable') && !div.classList.contains('Hidden'))
                    onEnd();
            }
        });
    }
    public async HideAllAlerts() {
        return Promise.all([
            this.HideAlert(this.PollAlert),
            this.HideAlert(this.StopAlert),
            this.HideAlert(this.AlertOfWinner),
            this.HideAlert(this.AlertOfLoser),
            this.HideAlert(this.PollDiv)
        ]);
    }
    private onclickOfParticipatePollButton() {
        this.HideAllAlerts().then(() => {
            this.ShowAlert(this.PollDiv);
        });
    }
    ;
    async setInBetMode(PollButtons: PollButton[]) {
        await this.HideAllAlerts();
        localStorage['ChosenBet' + this.TwitchUserName] = undefined;
        this.setButtonsInPollDiv(PollButtons);
        this.ShowAlert(this.PollAlert);
    }
    async setInStopeMode() {
        await this.HideAllAlerts();
        this.ShowAlert(this.StopAlert);
    }
    async setInWinnerMode(EarningsDistributor: number) {
        await this.HideAllAlerts();
        this.ShowAlert(this.AlertOfWinner);
        this.EarningsView.innerText = (Math.round(this.getBetValue() * (EarningsDistributor))).toString();

    }
    async setInLoserMode() {
        await this.HideAllAlerts();
        this.ShowAlert(this.AlertOfLoser);
        this.LossView.innerText = this.getBetValue().toString();

    }
    constructor(TwitchUserName: string) {
        this.TwitchUserName = TwitchUserName;

        let display = document.getElementById('display');
        let X = display.clientWidth;
        let Y = display.clientHeight;

        this.AlertsRelocatable = new DivRelocatable(this.AlertsDiv, X / 2.5, Y / 1.9);

        this.AutomaticHidingDueInactivity = new AutomaticHidingDueInactivity(document.body,
            [this.PollAlert,
            this.PollDiv,
            this.StopAlert,
            this.AlertOfWinner,
            this.AlertOfLoser]);

        this.ParticipatePollButton.onclick = () => this.onclickOfParticipatePollButton();
        this.getBetValue = () => { return Number(this.BetAmountInput.HTML.value); };
    }
}

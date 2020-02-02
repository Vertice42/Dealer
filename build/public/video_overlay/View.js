"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
const GRADIENT_DARKENING_RATE = 1.5;
class GameBoard {
    constructor() {
        this.SelectedButtonID = null;
        this.OnBeatChange = () => { };
        this.CoinsOfUserView = document.getElementById("CoinsOfUserView");
        this.ParticipatePollButton = document.getElementById("ParticipatePollButton");
        this.BetAmountInput = document.getElementById("BetAmountInput");
        this.AlertsDiv = document.getElementById("AlertsDiv");
        this.PollAlert = document.getElementById("PollAlert");
        this.StopAlert = document.getElementById("StopAlert");
        this.AlertOfWinner = document.getElementById("AlertOfWinner");
        this.EarningsView = document.getElementById("EarningsView");
        this.AlertOfLoser = document.getElementById("AlertOfLoser");
        this.LossView = document.getElementById("LossView");
        this.WalletDiv = document.getElementById("WalletDiv");
        this.CoinsDiv = document.getElementById("CoinsDiv");
        this.PollDiv = document.getElementById("PollDiv");
        this.ButtonsDiv = document.getElementById("ButtonsDiv");
        this.ViewPollButton = class {
            constructor(Button) {
                let ViewButton = document.createElement("button");
                ViewButton.classList.add('PollButton');
                ViewButton.onclick = () => {
                    this.onSelected();
                    this.Select();
                };
                let RGBcolor = hexToRgb(Button.Color);
                if (RGBcolor)
                    ViewButton.style.backgroundImage = `linear-gradient(${Button.Color},
                    rgb(${RGBcolor.r / GRADIENT_DARKENING_RATE}, 
                        ${RGBcolor.g / GRADIENT_DARKENING_RATE},
                        ${RGBcolor.b / GRADIENT_DARKENING_RATE}))`;
                let Name = document.createElement("h4");
                Name.innerHTML = Button.Name;
                if (Button.Name !== null) {
                    if (Button.Name.length > 2)
                        Name.style.fontSize = 30 / Button.Name.length + 'px';
                    else
                        Name.style.fontSize = 10 + 'px';
                }
                ViewButton.appendChild(Name);
                this.HTMLElement = ViewButton;
            }
            IsSelected() {
                return this.HTMLElement.classList.contains("selected");
            }
            Select() {
                this.HTMLElement.classList.add("Selected");
            }
            Unelect() {
                this.HTMLElement.classList.remove("Selected");
            }
        };
        this.EnableRelocatableElemente(this.WalletDiv);
        this.EnableRelocatableElemente(this.AlertsDiv);
        this.BetAmountInput.onmouseenter = () => this.DisableRelocatableElemente(this.AlertsDiv);
        this.BetAmountInput.onmouseleave = () => this.EnableRelocatableElemente(this.AlertsDiv);
        this.ParticipatePollButton.onclick = () => this.onclickOfParticipatePollButton();
        this.getBetValue = () => { return Number(this.BetAmountInput.value); };
        this.BetAmountInput.onchange = () => this.OnBeatChange();
    }
    DepositAnimation(Coin, CoinNumber, onStart, onEnd) {
        Coin.classList.add('Coin');
        Coin.style.left = -35 + (CoinNumber * 15) + '%';
        Coin.style.top = -50 + '%';
        this.CoinsDiv.appendChild(Coin);
        setTimeout(() => {
            Coin.style.opacity = '1';
            Coin.style.left = '35%';
            Coin.style.top = '-50%';
            setTimeout(() => {
                let ontransitionstart = function () {
                    Coin.removeEventListener('transitionstart', ontransitionstart);
                    if (onStart)
                        onStart();
                };
                Coin.addEventListener('transitionstart', ontransitionstart);
                let ontransitionend = function () {
                    Coin.removeEventListener('transitionend', ontransitionend);
                    if (onEnd)
                        onEnd();
                };
                Coin.addEventListener('transitionend', ontransitionend);
                Coin.style.top = '10%';
            }, 500 + CoinNumber * 10);
        }, 500 + CoinNumber * 500);
    }
    WithdrawalAnimation(Coin, CoinNumber, onStart, onEnd) {
        Coin.classList.add('Coin');
        this.CoinsDiv.appendChild(Coin);
        setTimeout(() => {
            Coin.style.opacity = '1';
            Coin.style.left = '35%';
            Coin.style.top = '10%';
            setTimeout(() => {
                let ontransitionstart = function () {
                    Coin.style.opacity = '0';
                    Coin.removeEventListener('transitionstart', ontransitionstart);
                    if (onStart)
                        onStart();
                };
                Coin.addEventListener('transitionstart', ontransitionstart);
                let ontransitionend = function () {
                    Coin.removeEventListener('transitionend', ontransitionend);
                    if (onEnd)
                        onEnd();
                };
                Coin.addEventListener('transitionend', ontransitionend);
                Coin.style.top = '-50%';
            }, 500 + CoinNumber * 10);
        }, 500 + CoinNumber * 500);
    }
    StartCoinsAnimation(reverse, CoinsNumber) {
        this.CoinsDiv.innerHTML = null;
        let addX = 0.1 / CoinsNumber;
        let addY = 0.2 / CoinsNumber;
        if (reverse) {
            for (let i = 0; i < CoinsNumber; i++) {
                this.WithdrawalAnimation(document.createElement('div'), i, () => {
                    if (i === 0)
                        this.WalletDiv.classList.add('inAction');
                }, () => {
                    this.WalletDiv.style.transform = 'scale(' + (1 + addX * i) + ',' + (1 + addY * i) + ')';
                    setTimeout(() => {
                        if (i === CoinsNumber - 1)
                            this.WalletDiv.classList.remove('inAction');
                        this.WalletDiv.style.transform = 'scale(1)';
                    }, 100);
                });
            }
        }
        else {
            for (let i = 0; i < CoinsNumber; i++) {
                this.DepositAnimation(document.createElement('div'), i, null, () => {
                    this.WalletDiv.style.transform = 'scale(' + (1 + addX * i) + ',' + (1 + addY * i) + ')';
                    setTimeout(() => {
                        this.WalletDiv.style.transform = 'scale(1)';
                    }, 100);
                });
            }
        }
    }
    startDepositAnimation(Deposit) {
        this.StartCoinsAnimation(false, Deposit);
    }
    ;
    startWithdrawalAnimation(Withdrawal) {
        this.StartCoinsAnimation(true, Withdrawal);
    }
    EnableRelocatableElemente(Element) {
        var moveX = 0;
        var moveY = 0;
        var X = localStorage[Element.id + 'X'] || 0;
        var Y = localStorage[Element.id + 'Y'] || 0;
        Element.style.left = X + 'px';
        Element.style.top = Y + 'px';
        Element.onmousedown = function (event) {
            moveX = event.pageX;
            moveY = event.pageY;
            X = Element.offsetLeft;
            Y = Element.offsetTop;
            Element.onmousemove = function (event) {
                moveX -= event.pageX;
                moveY -= event.pageY;
                if (X - moveX > 0 && X - moveX < window.innerWidth - Element.offsetWidth &&
                    Y - moveY > 0 && Y - moveY < window.innerHeight - Element.offsetHeight) {
                    X -= moveX;
                    Y -= moveY;
                    Element.style.left = X + 'px';
                    Element.style.top = Y + 'px';
                    localStorage[Element.id + 'X'] = X;
                    localStorage[Element.id + 'Y'] = Y;
                }
                moveX = event.pageX;
                moveY = event.pageY;
            };
            return false;
        };
        Element.onmouseleave = function () {
            Element.onmousemove = null;
        };
        Element.onmouseup = function () {
            Element.onmousemove = null;
        };
    }
    DisableRelocatableElemente(Element) {
        Element.onmousedown = null;
        Element.onmouseleave = null;
        Element.onmouseup = null;
    }
    ShowAllert(div) {
        div.classList.remove("Disable");
        div.classList.remove("Hidden");
        div.classList.add("Enable");
        div.classList.add("Alert");
    }
    HideAllert(div) {
        return new Promise((resolve, reject) => {
            if (div.classList.contains("Disable")) {
                resolve();
            }
            else {
                function onEnd() {
                    div.classList.remove("Alert");
                    div.classList.add("Hidden");
                    div.onanimationend = null;
                    div.removeEventListener('animationend', onEnd);
                    resolve();
                }
                div.addEventListener('animationend', onEnd);
                div.classList.remove("Enable");
                div.classList.add("Disable");
            }
        });
    }
    HideAllAlerts() {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                this.HideAllert(this.PollAlert),
                this.HideAllert(this.StopAlert),
                this.HideAllert(this.AlertOfWinner),
                this.HideAllert(this.AlertOfLoser),
                this.HideAllert(this.PollDiv)
            ]);
        });
    }
    onclickOfParticipatePollButton() {
        this.HideAllAlerts().then(() => {
            this.ShowAllert(this.PollDiv);
        });
    }
    ;
    setButtonsInPollDiv(PollButtons) {
        this.SelectedButtonID = null;
        this.ButtonsDiv.innerHTML = "";
        let buttons = [];
        PollButtons.forEach(pollButton => {
            let button = new this.ViewPollButton(pollButton);
            buttons.push(button);
            button.onSelected = () => {
                this.SelectedButtonID = pollButton.ID;
                this.OnBeatChange();
                buttons.forEach(Button => {
                    Button.Unelect();
                });
            };
            this.ButtonsDiv.appendChild(button.HTMLElement);
        });
    }
    setInBetMode(PollButtons) {
        this.HideAllAlerts().then(() => {
            this.setButtonsInPollDiv(PollButtons);
            this.ShowAllert(this.PollAlert);
        });
    }
    setInStopMode() {
        this.HideAllAlerts().then(() => {
            this.ShowAllert(this.StopAlert);
        });
    }
    setInWinnerMode(LossDistributorOfPoll) {
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
}
exports.GameBoard = GameBoard;
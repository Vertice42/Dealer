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
const View_1 = require("../../video_overlay/View");
const BackendConnection_1 = require("../../BackendConnection");
class Miner {
    constructor(StreamerID, TwitchUserID, CoinsOfUser) {
        this.StreamerID = StreamerID;
        this.TwitchUserID = TwitchUserID;
        this.CoinsOfUser = CoinsOfUser;
    }
    onSuccessfullyMined(MiningResponse) {
        let diference = ~~MiningResponse.CoinsOfUser - this.CoinsOfUser;
        if (diference > 0) {
            View_1.default.startDepositAnimation(~~diference + 1);
        }
        else {
            if (diference <= -1) {
                View_1.default.startWithdrawalAnimation((~~diference + 1) * -1);
            }
        }
        this.CoinsOfUser = MiningResponse.CoinsOfUser;
        View_1.default.CoinsOfUserView.innerText = (~~this.CoinsOfUser).toString();
        setTimeout(() => {
            this.TryToMine();
        }, 1000);
    }
    TryToMine() {
        return __awaiter(this, void 0, void 0, function* () {
            return BackendConnection_1.MineCoin(this.StreamerID, this.TwitchUserID)
                .then((res) => {
                this.onSuccessfullyMined(res);
            })
                .catch((error) => {
                console.log('Error connecting to Mine Service, next attempt in 3s');
                setTimeout(() => {
                    this.TryToMine();
                }, 3000);
            });
        });
    }
}
exports.Miner = Miner;

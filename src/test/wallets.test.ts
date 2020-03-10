import { expect } from "chai";

import { createAndStartStreamerDatabase, deleteStreamerDatabase, ID_FOR_WALLETS } from "./ForTests.test";
import { dbWalletManeger } from "../services/modules/database/miner/dbWalletManager";
import { dbWallet } from "../services/models/poll/dbWallet";

describe('Wallet', () => {
  let UserIdForTest = 'fin'
  before(async () => {
    await createAndStartStreamerDatabase(ID_FOR_WALLETS);
  })
  after(async () => {
    await deleteStreamerDatabase(ID_FOR_WALLETS)
  })

  it('Create and Get Wallet', async function () {
    let Manager = new dbWalletManeger(ID_FOR_WALLETS, UserIdForTest);
    let wallet = dbWallet.toWallet(await Manager.getWallet())
    expect(wallet.Coins).to.deep.equal(0);
    expect(wallet.LastMiningAttemp).exist;
    expect(wallet.TwitchUserID).to.deep.equal(UserIdForTest);
  })

  it('Deposit', async function () {
    let Manager = new dbWalletManeger(ID_FOR_WALLETS, UserIdForTest);
    await Manager.deposit(10);
    expect((await Manager.getWallet()).Coins).to.deep.equal(10);
  })

  it('withdraw', async function () {
    let Manager = new dbWalletManeger(ID_FOR_WALLETS, UserIdForTest);
    await Manager.withdraw(10);
    expect((await Manager.getWallet()).Coins).to.deep.equal(0);
  })
})
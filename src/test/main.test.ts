import { deleteStreamerDatabase, ID_FOR_CREATE, createStreamerDatabase } from "./ForTests.test";
import { expect } from "chai";

describe('DATABASE_MANAGER', () => {
  after(async () => { await deleteStreamerDatabase(ID_FOR_CREATE) })

  it('CreateStreamerDataBase', async function () {
    expect(await createStreamerDatabase(ID_FOR_CREATE)).to.include.keys('StreamerDataBaseCreated');
  });

  require('./poll.test'); 

  require('./mining.test');

  require('./store.test');

  require('./settings.test');

  require('./wallets.test')

});
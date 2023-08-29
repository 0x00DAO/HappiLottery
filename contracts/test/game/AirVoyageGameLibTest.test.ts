import { Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';

describe('AirVoyageGameLibTest', function () {
  let testContract: Contract;
  beforeEach(async function () {
    const AirVoyageGameLibTest = await ethers.getContractFactory(
      'AirVoyageGameLibTest'
    );
    testContract = await upgrades.deployProxy(AirVoyageGameLibTest, []);
    await testContract.deployed();
  });

  it('testGetEmptySeatCount', async function () {
    await testContract.testGetEmptySeatCount();
  });

  it('testGetPlayerCount', async function () {
    await testContract.testGetPlayerCount();
  });
  it('testGetNextEmptySeat', async function () {
    await testContract.testGetNextEmptySeat();
  });

  it('testGetNextPlayingPlayerIndex', async function () {
    await testContract.testGetNextPlayingPlayerIndex();
  });

  it('testCheckIsPlayerIsFinished', async function () {
    await testContract.testCheckIsPlayerIsFinished();
  });

  it('testCheckIsGameFinished', async function () {
    await testContract.testCheckIsGameFinished();
  });
});

import { Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';

describe('AriVoyagePieceLibTest', function () {
  let testContract: Contract;
  beforeEach(async function () {
    const TestAirVoyagePiece = await ethers.getContractFactory(
      'TestAirVoyagePiece'
    );
    testContract = await upgrades.deployProxy(TestAirVoyagePiece, []);
    await testContract.deployed();
  });

  it('testSetPlayer', async function () {
    await testContract.testSetPlayer();
  });

  it('testConvertLocalToGlobalPosition', async function () {
    await testContract.testConvertLocalToGlobalPosition();
  });

  it('testConvertGlobalToLocalPosition', async function () {
    await testContract.testConvertGlobalToLocalPosition();
  });

  it('testConvertGlobalToLocalPositionInvalid', async function () {
    await testContract.testConvertGlobalToLocalPositionInvalid();
  });

  it('testSetLocalPosition', async function () {
    await testContract.testSetLocalPosition();
  });

  it('testSetGlobalPosition', async function () {
    await testContract.testSetLocalPosition();
  });

  it('testInitial', async function () {
    await testContract.testInitial();
  });
});

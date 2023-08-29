import { Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';

describe('AriVoyagePieceLibTest2', function () {
  let testContract: Contract;
  beforeEach(async function () {
    const TestAirVoyagePiece = await ethers.getContractFactory(
      'TestAirVoyagePiece2'
    );
    testContract = await upgrades.deployProxy(TestAirVoyagePiece, []);
    await testContract.deployed();
  });

  it('testMoveForward', async function () {
    await testContract.testMoveForward();
  });
});

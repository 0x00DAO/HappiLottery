import { expect } from 'chai';
import { Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { deployUtil } from '../../../scripts/utils/deploy.util';

describe('AirVoyageGameBonusEntity', function () {
  let gameRootContract: Contract;
  let airVoyageGameBonusEntityContract: Contract;
  const initialGameId = 1000000000;
  beforeEach(async function () {
    //deploy GameRoot
    const GameRoot = await ethers.getContractFactory('GameRoot');
    gameRootContract = await upgrades.deployProxy(GameRoot, []);
    await gameRootContract.deployed();

    //deploy System

    //deploy entity

    const AirVoyageGameBonusEntityContract = await ethers.getContractFactory(
      'AirVoyageGameBonusEntity'
    );
    airVoyageGameBonusEntityContract = await upgrades.deployProxy(
      AirVoyageGameBonusEntityContract,
      [gameRootContract.address]
    );
    await airVoyageGameBonusEntityContract.deployed();

    const [owner] = await ethers.getSigners();
    //grant write permission to entity
    await deployUtil.gameEntityGrantWriteRole(
      airVoyageGameBonusEntityContract,
      [owner.address]
    );
  });
  it('should be deployed', async function () {
    expect(airVoyageGameBonusEntityContract.address).to.not.equal(null);
  });

  describe('setValue', function () {
    it('should be able to create bonus', async function () {
      const [owner, addr1] = await ethers.getSigners();

      const bonusAddress = addr1.address;
      const bonusValue = 100;

      await airVoyageGameBonusEntityContract['set(uint256,uint256)'](
        bonusAddress,
        bonusValue
      );
      const bonus = await airVoyageGameBonusEntityContract.getValue(
        bonusAddress
      );

      expect(bonus).to.equal(bonusValue);
    });
  });
});

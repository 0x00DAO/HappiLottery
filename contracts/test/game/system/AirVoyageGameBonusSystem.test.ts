import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { deployUtil } from '../../../scripts/utils/deploy.util';

describe('AirVoyageGameBonusSystem', function () {
  let gameRootContract: Contract;
  let airVoyageGameBonusEntityContract: Contract;
  let airVoyageGameBonusSystemEntityContract: Contract;
  let airVoyageGameBonusSystemContract: Contract;

  beforeEach(async function () {
    //deploy GameRoot
    const GameRoot = await ethers.getContractFactory('GameRoot');
    gameRootContract = await upgrades.deployProxy(GameRoot, []);
    await gameRootContract.deployed();

    //deploy System
    const AirVoyageGameBonusSystem = await ethers.getContractFactory(
      'AirVoyageGameBonusSystem'
    );
    airVoyageGameBonusSystemContract = await upgrades.deployProxy(
      AirVoyageGameBonusSystem,
      [gameRootContract.address]
    );

    const [owner] = await ethers.getSigners();
    deployUtil.gameSystemGrantInternalRole(airVoyageGameBonusSystemContract, [
      owner.address,
    ]);

    //deploy entity

    const AirVoyageGameBonusEntityContract = await ethers.getContractFactory(
      'AirVoyageGameBonusEntity'
    );
    airVoyageGameBonusEntityContract = await upgrades.deployProxy(
      AirVoyageGameBonusEntityContract,
      [gameRootContract.address]
    );
    await airVoyageGameBonusEntityContract.deployed();

    //grant write permission to entity
    await deployUtil.gameEntityGrantWriteRole(
      airVoyageGameBonusEntityContract,
      [airVoyageGameBonusSystemContract.address]
    );

    const AirVoyageGameBonusSystemEntityContract =
      await ethers.getContractFactory('AirVoyageGameBonusSystemEntity');
    airVoyageGameBonusSystemEntityContract = await upgrades.deployProxy(
      AirVoyageGameBonusSystemEntityContract,
      [gameRootContract.address]
    );
    await airVoyageGameBonusSystemEntityContract.deployed();
    await deployUtil.gameEntityGrantWriteRole(
      airVoyageGameBonusSystemEntityContract,
      [airVoyageGameBonusSystemContract.address]
    );
  });
  it('should be deployed', async function () {
    expect(airVoyageGameBonusSystemContract.address).to.not.equal(null);
  });

  describe('deposit', function () {
    it('should be able to deposit bonus', async function () {
      const [owner, addr1] = await ethers.getSigners();

      const bonusValue = ethers.utils.parseEther('0.005');
      await expect(
        airVoyageGameBonusSystemContract.deposit(addr1.address, {
          value: bonusValue,
        })
      )
        .to.emit(airVoyageGameBonusSystemContract, 'Deposit')
        .withArgs(addr1.address, bonusValue);

      //check address eth balance
      await ethers.provider
        .getBalance(airVoyageGameBonusSystemContract.address)
        .then((v: BigNumber) => {
          expect(v).to.equal(bonusValue);
        });

      const bonus = await airVoyageGameBonusSystemContract.getBonus();
      expect(bonus).to.equal(0);

      await airVoyageGameBonusSystemContract
        .availableAmount()
        .then((v: BigNumber) => {
          expect(v).to.equal(bonusValue);
        });

      await airVoyageGameBonusSystemContract
        .waitingForRewardAmount()
        .then((waitingForRewardAmount: BigNumber) => {
          expect(waitingForRewardAmount).to.equal(0);
        });
    });

    it('failed: should not be able to deposit bonus', async function () {
      const [owner, addr1] = await ethers.getSigners();

      await expect(
        airVoyageGameBonusSystemContract.deposit(addr1.address, {})
      ).to.be.reverted.revertedWith(
        'AirVoyageGameBonusSystem: deposit amount is not correct'
      );

      const bonusValue = ethers.utils.parseEther('0.11');
      await expect(
        airVoyageGameBonusSystemContract.deposit(addr1.address, {
          value: bonusValue,
        })
      ).to.be.reverted.revertedWith(
        'AirVoyageGameBonusSystem: deposit amount is not correct'
      );
    });
  });

  describe('winBonus', function () {
    it('success: should be able to win bonus', async function () {
      const [owner, addr1] = await ethers.getSigners();

      const bonusValue = ethers.utils.parseEther('0.005');
      await airVoyageGameBonusSystemContract.deposit(addr1.address, {
        value: bonusValue,
      });

      await expect(
        airVoyageGameBonusSystemContract.winBonus(addr1.address, bonusValue)
      )
        .to.emit(airVoyageGameBonusSystemContract, 'WinBonus')
        .withArgs(addr1.address, bonusValue);

      const bonus = await airVoyageGameBonusSystemContract
        .connect(addr1)
        .getBonus();
      expect(bonus).to.equal(bonusValue);

      await airVoyageGameBonusSystemContract
        .availableAmount()
        .then((v: BigNumber) => {
          expect(v).to.equal(0);
        });

      await airVoyageGameBonusSystemContract
        .waitingForRewardAmount()
        .then((waitingForRewardAmount: BigNumber) => {
          expect(waitingForRewardAmount).to.equal(bonus);
        });
    });

    it('failed: overflow', async function () {
      const [owner, addr1] = await ethers.getSigners();

      const bonusValue = ethers.utils.parseEther('0.005');
      await airVoyageGameBonusSystemContract.deposit(addr1.address, {
        value: bonusValue,
      });

      await expect(
        airVoyageGameBonusSystemContract.winBonus(
          ethers.constants.AddressZero,
          bonusValue
        )
      ).to.be.reverted.revertedWith(
        'AirVoyageGameBonusSystem: from is zero address'
      );

      await expect(
        airVoyageGameBonusSystemContract.winBonus(addr1.address, 0)
      ).to.be.reverted.revertedWith('AirVoyageGameBonusSystem: amount is zero');

      await expect(
        airVoyageGameBonusSystemContract.winBonus(
          addr1.address,
          bonusValue.mul(2)
        )
      ).to.be.reverted.revertedWith(
        'AirVoyageGameBonusSystem: availableAmount is not enough'
      );
    });
  });

  describe('rewardBonus', function () {
    it('success: should be able to reward bonus', async function () {
      const [owner, addr1] = await ethers.getSigners();

      const bonusValue = ethers.utils.parseEther('0.005');
      await airVoyageGameBonusSystemContract.deposit(addr1.address, {
        value: bonusValue,
      });

      await airVoyageGameBonusSystemContract.winBonus(
        addr1.address,
        bonusValue
      );
      //check address eth balance
      await ethers.provider
        .getBalance(airVoyageGameBonusSystemContract.address)
        .then((v: BigNumber) => {
          expect(v).to.equal(bonusValue);
        });

      await expect(
        airVoyageGameBonusSystemContract.connect(addr1).rewardBonus()
      )
        .to.emit(airVoyageGameBonusSystemContract, 'RewardBonus')
        .withArgs(addr1.address, bonusValue);

      //check address eth balance
      await ethers.provider
        .getBalance(airVoyageGameBonusSystemContract.address)
        .then((v: BigNumber) => {
          expect(v).to.equal(0);
        });

      const bonus = await airVoyageGameBonusSystemContract
        .connect(addr1)
        .getBonus();
      expect(bonus).to.equal(0);

      await airVoyageGameBonusSystemContract
        .availableAmount()
        .then((v: BigNumber) => {
          expect(v).to.equal(0);
        });

      await airVoyageGameBonusSystemContract
        .waitingForRewardAmount()
        .then((waitingForRewardAmount: BigNumber) => {
          expect(waitingForRewardAmount).to.equal(0);
        });
    });
  });
});

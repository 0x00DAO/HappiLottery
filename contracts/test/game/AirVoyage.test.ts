import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { BigNumber, Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { deployUtil } from '../../scripts/utils/deploy.util';

describe('AirVoyage', function () {
  let gameRootContract: Contract;
  let airVoyageContract: Contract;
  let airVoyageGameViewSystem: Contract;
  let airVoyageGameMoveSystem: Contract;
  let airVoyageGameBonusSystemContract: Contract;
  let airVoyageGameEntityContract: Contract;
  let airVoyageGameBonusEntityContract: Contract;
  let airVoyageGameBonusSystemEntityContract: Contract;
  const initialGameId = 1000000000;
  const bonusValue = ethers.utils.parseEther('0.005');
  beforeEach(async function () {
    //deploy GameRoot
    const GameRoot = await ethers.getContractFactory('GameRoot');
    gameRootContract = await upgrades.deployProxy(GameRoot, []);
    await gameRootContract.deployed();

    //deploy System
    const AirVoyage = await ethers.getContractFactory('AirVoyage');
    airVoyageContract = await upgrades.deployProxy(AirVoyage, [
      gameRootContract.address,
    ]);
    await airVoyageContract.deployed();

    const AirVoyageGameMoveSystem = await ethers.getContractFactory(
      'AirVoyageGameMoveSystem'
    );
    airVoyageGameMoveSystem = await upgrades.deployProxy(
      AirVoyageGameMoveSystem,
      [gameRootContract.address]
    );
    await airVoyageGameMoveSystem.deployed();

    await airVoyageGameMoveSystem.grantRole(
      await airVoyageGameMoveSystem.SYSTEM_INTERNAL_ROLE(),
      airVoyageContract.address
    );

    const AirVoyageGameViewSystem = await ethers.getContractFactory(
      'AirVoyageGameViewSystem'
    );
    airVoyageGameViewSystem = await upgrades.deployProxy(
      AirVoyageGameViewSystem,
      [gameRootContract.address]
    );

    const AirVoyageGameBonusSystem = await ethers.getContractFactory(
      'AirVoyageGameBonusSystem'
    );
    airVoyageGameBonusSystemContract = await upgrades.deployProxy(
      AirVoyageGameBonusSystem,
      [gameRootContract.address]
    );

    deployUtil.gameSystemGrantInternalRole(airVoyageGameBonusSystemContract, [
      airVoyageContract.address,
    ]);

    //deploy entity

    const AirVoyageGameEntity = await ethers.getContractFactory(
      'AirVoyageGameEntity'
    );
    airVoyageGameEntityContract = await upgrades.deployProxy(
      AirVoyageGameEntity,
      [gameRootContract.address]
    );

    //grant role to AirVoyageGameEntity
    await deployUtil.gameEntityGrantWriteRole(airVoyageGameEntityContract, [
      airVoyageContract.address,
      airVoyageGameMoveSystem.address,
    ]);

    const AirVoyageGameBonusEntityContract = await ethers.getContractFactory(
      'AirVoyageGameBonusEntity'
    );
    airVoyageGameBonusEntityContract = await upgrades.deployProxy(
      AirVoyageGameBonusEntityContract,
      [gameRootContract.address]
    );
    await airVoyageGameBonusEntityContract.deployed();
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
    expect(airVoyageContract.address).to.not.equal(null);
  });

  describe('create a new game', function () {
    it('should create a new game', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      await expect(airVoyageContract.createGame({ value: bonusValue }))
        .to.emit(airVoyageContract, 'GameCreated')
        .withArgs(initialGameId, owner.address)
        .to.emit(airVoyageContract, 'GameJoined')
        .withArgs(initialGameId, owner.address);

      const game = await airVoyageGameViewSystem.getGame(initialGameId);

      expect(game.gameId).to.equal(initialGameId);
      expect(game.owner).to.equal(owner.address);
      expect(game.status).to.equal(1);
      expect(game.currentPlayer).to.equal(0);

      const player = await airVoyageContract.players(owner.address);
      expect(player.gameId).to.equal(initialGameId);

      //check waiting list
      const waitingList = await airVoyageContract.getWaitingGames();
      expect(waitingList.length).to.equal(1);
      expect(waitingList[0]).to.equal(initialGameId);
    });

    it('should not create a new game if the game is not finished', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      await expect(airVoyageContract.createGame({ value: bonusValue }))
        .to.emit(airVoyageContract, 'GameCreated')
        .withArgs(initialGameId, owner.address);

      await expect(airVoyageContract.createGame()).to.be.revertedWith(
        'You have already participated in the game'
      );
    });

    it('should not create a new game if the game is not finished', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      await expect(airVoyageContract.createGame({ value: bonusValue }))
        .to.emit(airVoyageContract, 'GameCreated')
        .withArgs(initialGameId, owner.address);

      const airVoyageContractB = airVoyageContract.connect(addr1);
      // await airVoyageContractB.createGame({ value: bonusValue });
      await expect(
        airVoyageContractB.createGame({ value: bonusValue })
      ).to.be.revertedWith('There are games waiting');
    });
  });

  describe('joinGame', function () {
    it('should join a game', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      await airVoyageContract.createGame({ value: bonusValue });

      await expect(
        airVoyageContract
          .connect(addr1)
          .joinGame(initialGameId, { value: bonusValue })
      )
        .to.emit(airVoyageContract, 'GameJoined')
        .withArgs(initialGameId, addr1.address)
        .to.emit(airVoyageContract, 'GameStarted')
        .withArgs(initialGameId);

      const game = await airVoyageGameViewSystem.getGame(initialGameId);

      expect(game.gameId).to.equal(initialGameId);
      expect(game.owner).to.equal(owner.address);
      expect(game.status).to.equal(2);

      const player = await airVoyageContract.players(addr1.address);
      expect(player.gameId).to.equal(initialGameId);

      //check waiting list
      const waitingList = await airVoyageContract.getWaitingGames();
      expect(waitingList.length).to.equal(0);
    });
  });

  describe('getCurrentPlayer', function () {
    it('should return the current player', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      await airVoyageContract.createGame({ value: bonusValue });
      //join game
      await airVoyageContract
        .connect(addr1)
        .joinGame(initialGameId, { value: bonusValue });

      const currentPlayer = await airVoyageGameViewSystem.getCurrentPlayer(
        initialGameId
      );

      //expect equal to owner or addr1
      expect(currentPlayer).to.match(/0x[a-fA-F0-9]{40}/);
    });

    it('revert when Game is not playing', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      await airVoyageContract.createGame({ value: bonusValue });
      await expect(
        airVoyageGameViewSystem.getCurrentPlayer(initialGameId)
      ).to.be.revertedWith('Game is not playing');
    });
  });

  describe('rollDiceAndMovePiece', function () {
    it('should roll dice and move', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      await airVoyageContract.createGame({ value: bonusValue });
      //join game
      await airVoyageContract
        .connect(addr1)
        .joinGame(initialGameId, { value: bonusValue });

      for (let i = 0; i < 4; i++) {
        await airVoyageGameViewSystem
          .getGamePiece(initialGameId, i)
          .then((x: any) => {
            // console.log(i, x);
          });
      }

      for (let i = 0; i < 4; i++) {
        const currentPlayer = await airVoyageGameViewSystem.getCurrentPlayer(
          initialGameId
        );

        const currentPlayerSigner =
          currentPlayer === owner.address ? owner : addr1;
        await expect(
          airVoyageContract.connect(currentPlayerSigner).rollDiceAndMovePiece(0)
        )
          .to.emit(airVoyageContract, 'DiceRolled')
          .withArgs(
            initialGameId,
            currentPlayerSigner.address,
            async (x: BigNumber) => console.log(x)
          )
          .to.emit(airVoyageContract, 'PieceMoved')
          .withArgs(
            initialGameId,
            currentPlayerSigner.address,
            async (x: any) => console.log(`pieceIndex ${x}`),
            async (x: any) => console.log(`from ${x}`),
            async (x: any) => console.log(`to ${x}`)
          );

        const isFinished = await airVoyageGameViewSystem.isGameFinished(
          initialGameId
        );
        console.log('isFinished', isFinished);

        const currentPlayerAfterRoll =
          await airVoyageGameViewSystem.getCurrentPlayer(initialGameId);

        expect(currentPlayerAfterRoll).to.not.equal(currentPlayer);
      }
    });

    it('should roll dice and move to finish', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      function getSignerByAddress(address: string): SignerWithAddress {
        if (address === owner.address) {
          return owner;
        } else if (address === addr1.address) {
          return addr1;
        } else if (address === addr2.address) {
          return addr2;
        }
        throw new Error('Invalid address');
      }

      await airVoyageContract.createGame({ value: bonusValue });
      //join game
      await airVoyageContract
        .connect(addr1)
        .joinGame(initialGameId, { value: bonusValue });

      let userLastOperationTime = 0;
      for (let i = 0; i < 500; i++) {
        const currentPlayer = await airVoyageGameViewSystem.getCurrentPlayer(
          initialGameId
        );
        {
          const game = await airVoyageGameViewSystem.getGame(initialGameId);
          console.log(
            `step: ${i}, currentPlayer: ${currentPlayer}, currentPlayerIndex:${game.currentPlayer}`
          );

          //check lastOperationTime
          const gamePlayer = game.players[game.currentPlayer];
          expect(gamePlayer.lastOperationTime).to.be.gt(userLastOperationTime);
          userLastOperationTime = gamePlayer.lastOperationTime;
          expect(game.currentPlayerLastOperationTime).to.be.eq(
            userLastOperationTime
          );
        }

        const currentPlayerSigner = getSignerByAddress(currentPlayer);
        await expect(
          airVoyageContract.connect(currentPlayerSigner).rollDiceAndMovePiece(0)
        )
          .to.emit(airVoyageContract, 'DiceRolled')
          .withArgs(
            initialGameId,
            currentPlayerSigner.address,
            async (x: BigNumber) => console.log(x)
          )
          .to.emit(airVoyageContract, 'PieceMoved')
          .withArgs(
            initialGameId,
            currentPlayerSigner.address,
            async (x: any) => console.log(`pieceIndex ${x}`),
            async (x: any) => console.log(`from ${x}`),
            async (x: any) => console.log(`to ${x}`)
          );

        const isFinished = await airVoyageGameViewSystem.isGameFinished(
          initialGameId
        );
        console.log('isFinished', isFinished);
        if (isFinished) {
          console.log(`finished at step ${i}`);
          const game = await airVoyageGameViewSystem.getGame(initialGameId);
          expect(game.winner).to.equal(currentPlayer);

          break;
        }

        const currentPlayerAfterRoll =
          await airVoyageGameViewSystem.getCurrentPlayer(initialGameId);

        expect(currentPlayerAfterRoll).to.not.equal(currentPlayer);
      }

      //check reward

      const game = await airVoyageGameViewSystem.getGame(initialGameId);
      const reward = await airVoyageGameBonusSystemContract.bonusOf(
        game.winner
      );
      const winnerSigner = getSignerByAddress(game.winner);
      await airVoyageGameBonusSystemContract
        .connect(winnerSigner)
        .getBonus()
        .then((v: any) => {
          expect(v).to.equal(reward);
        });

      await airVoyageGameBonusSystemContract
        .availableAmount()
        .then((v: BigNumber) => {
          expect(v).to.equal(0);
        });
      await airVoyageGameBonusSystemContract
        .waitingForRewardAmount()
        .then((waitingForRewardAmount: BigNumber) => {
          expect(waitingForRewardAmount).to.equal(reward);
        });

      await ethers.provider
        .getBalance(airVoyageGameBonusSystemContract.address)
        .then((v: BigNumber) => {
          expect(v).to.equal(reward);
        });
      console.log('reward before', reward.toString());
      await airVoyageGameBonusSystemContract
        .connect(getSignerByAddress(game.winner))
        .rewardBonus();

      const rewardAfter = await airVoyageGameBonusSystemContract.bonusOf(
        game.winner
      );
      console.log('reward after', rewardAfter.toString());
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

      const nextGameId = initialGameId + 1;
      //create new game
      await airVoyageContract.connect(addr1).createGame({ value: bonusValue });

      //check waiting list
      const waitingList = await airVoyageContract.getWaitingGames();
      expect(waitingList.length).to.equal(1);
      expect(waitingList[0]).to.equal(nextGameId);

      //join game
      await airVoyageContract
        .connect(owner)
        .joinGame(nextGameId, { value: bonusValue });

      //check waiting list
      const waitingListAfterJoin = await airVoyageContract.getWaitingGames();
      expect(waitingListAfterJoin.length).to.equal(0);

      for (let i = 0; i < 2; i++) {
        const currentPlayer = await airVoyageGameViewSystem.getCurrentPlayer(
          nextGameId
        );

        console.log(`step ${i} currentPlayer ${currentPlayer}`);

        const currentPlayerSigner =
          currentPlayer === owner.address ? owner : addr1;
        await expect(
          airVoyageContract.connect(currentPlayerSigner).rollDiceAndMovePiece(0)
        )
          .to.emit(airVoyageContract, 'DiceRolled')
          .withArgs(
            nextGameId,
            currentPlayerSigner.address,
            async (x: BigNumber) => console.log(x)
          )
          .to.emit(airVoyageContract, 'PieceMoved')
          .withArgs(
            nextGameId,
            currentPlayerSigner.address,
            async (x: any) => console.log(`pieceIndex ${x}`),
            async (x: any) => console.log(`from ${x}`),
            async (x: any) => console.log(`to ${x}`)
          );

        const isFinished = await airVoyageGameViewSystem.isGameFinished(
          nextGameId
        );
        console.log('isFinished', isFinished);
        if (isFinished) {
          console.log(`finished at step ${i}`);
          const game = await airVoyageGameViewSystem.getGame(nextGameId);
          expect(game.winner).to.equal(currentPlayer);

          break;
        }

        const currentPlayerAfterRoll =
          await airVoyageGameViewSystem.getCurrentPlayer(nextGameId);

        expect(currentPlayerAfterRoll).to.not.equal(currentPlayer);
      }
    });

    it('should roll dice and move if timeout', async function () {
      const [owner, addr1, addr2] = await ethers.getSigners();

      await airVoyageContract.createGame({ value: bonusValue });
      //join game
      await airVoyageContract
        .connect(addr1)
        .joinGame(initialGameId, { value: bonusValue });

      for (let i = 0; i < 4; i++) {
        await airVoyageGameViewSystem
          .getGamePiece(initialGameId, i)
          .then((x: any) => {
            // console.log(i, x);
          });
      }
      const currentPlayer = await airVoyageGameViewSystem.getCurrentPlayer(
        initialGameId
      );
      //snapshot
      const snapshotId = await ethers.provider.send('evm_snapshot', []);

      for (let i = 0; i < 4; i++) {
        const currentPlayerSigner =
          currentPlayer === owner.address ? owner : addr1;

        const game = await airVoyageGameViewSystem.getGame(initialGameId);
        console.log(
          `step: ${i}, currentPlayer: ${currentPlayer}, currentPlayerIndex:${game.currentPlayer}`
        );

        await expect(
          airVoyageContract.connect(currentPlayerSigner).rollDiceAndMovePiece(0)
        )
          .to.emit(airVoyageContract, 'DiceRolled')
          .withArgs(
            initialGameId,
            currentPlayerSigner.address,
            async (x: BigNumber) => console.log(x)
          )
          .to.emit(airVoyageContract, 'PieceMoved')
          .withArgs(
            initialGameId,
            currentPlayerSigner.address,
            async (x: any) => console.log(`pieceIndex ${x}`),
            async (x: any) => console.log(`from ${x}`),
            async (x: any) => console.log(`to ${x}`)
          );

        const isFinished = await airVoyageGameViewSystem.isGameFinished(
          initialGameId
        );
        console.log('isFinished', isFinished);

        const currentPlayerAfterRoll =
          await airVoyageGameViewSystem.getCurrentPlayer(initialGameId);

        expect(currentPlayerAfterRoll).to.not.equal(currentPlayer);

        //block time add 120s
        await ethers.provider.send('evm_increaseTime', [120]);
        //mine
        await ethers.provider.send('evm_mine', []);
      }

      //restore
      await ethers.provider.send('evm_revert', [snapshotId]);
    });
  });
});

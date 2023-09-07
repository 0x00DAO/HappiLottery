import { Label, _decorator } from "cc";
import { GamePlayerStatus } from "../../../const/GameConst";
import { OnEvent } from "../../../core/event/decorators/OnEventDecorator";
import { GameObject } from "../../../core/game/GameObject";
import { AutoLockedAsync } from "../../../core/model/DataDecorators";
import { StringUtil } from "../../../core/utils/StringUtil";
import { GameEventContractAirVoyageDiceRolled } from "../../contracts/events/GameEventContractAirVoyageDiceRolled";
import { GameEventContractAirVoyageGameFinished } from "../../contracts/events/GameEventContractAirVoyageGameFinished";
import { GameEventContractAirVoyageGameJoined } from "../../contracts/events/GameEventContractAirVoyageGameJoined";
import { GameEventContractAirVoyageGameStarted } from "../../contracts/events/GameEventContractAirVoyageGameStarted";
import { GameEventContractGameBonusSystemDeposit } from "../../contracts/events/GameEventContractGameBonusSystemDeposit";
import { GameEventContractGameBonusSystemRewardBonus } from "../../contracts/events/GameEventContractGameBonusSystemRewardBonus";
import { gameAccountData } from "../../data/GameAccountData";
import { GameData, gameData } from "../../data/GameData";
import { walletData } from "../../data/WalletData";
import { GameEventGameOpened } from "../../events/GameEventGameOpened";
import { GameEventRechargeBalance } from "../../events/GameEventRechargeBalance";
import { GameEventWalletConnected } from "../../events/GameEventWalletConnected";
import { GasRecharge } from "../GasRecharge/GasRecharge";
import { Toast } from "../Toast/Toast";
import { GameEventBuildArcadeAccount } from "../../events/GameEventBuildArcadeAccount";
import { GameEventContractAirVoyagePieceMoved } from "../../contracts/events/GameEventContractAirVoyagePieceMoved";
const { menu, ccclass, property } = _decorator;

@ccclass("GameRoll")
@menu("game/logic/components/GameRoll")
export class GameRoll extends GameObject {
  private _clickable = false;
  private _stepAnimationIndex = -1;
  private _stepAnimationDt = 0;

  @property(Label)
  private txtLabel: Label = null!;

  @property(Label)
  private stepTxtLabel: Label = null!;

  @property(Label)
  private balanceLabel: Label = null!;

  @property(Label)
  private waitingTimeLeftLabel: Label = null!;

  private set balance(balance: string) {
    this.balanceLabel.string = `${Number(balance).toFixed(5)}`;
  }

  private set waitingTimeLeft(time: number) {
    this.waitingTimeLeftLabel.node.active = time >= 0;
    this.unschedule(this.countdownRollWaitTime);
    if (this.waitingTimeLeftLabel.node.active) {
      if (time > 60) {
        this.waitingTimeLeftLabel.string = "It's your turn!";
      } else {
        this.waitingTimeLeftLabel.string = StringUtil.formatTime(time);
        this.schedule(this.countdownRollWaitTime, 1);
      }
    }
  }

  private set step(step: number) {
    this.stopStepUpdate();
    this.stepTxtLabel.node.active = step > 0;
    this.stepTxtLabel.string = `${step}`;
  }

  private set rollButtonStatus(value: GamePlayerStatus) {
    if (gameData.currentGame && gameData.currentGame.hasStarted) {
      if (gameData.currentGame.me) {
        this.txtLabel.string =
          GamePlayerStatus.Playing === value ? "Roll" : "Wait";
      } else {
        this.txtLabel.string = "Join";
      }
    } else {
      this.txtLabel.string =
        GamePlayerStatus.Playing === value ? "Roll" : "Join";
    }
    if (this.txtLabel.string === "Wait") {
      Toast.showMessage("Please wait for your opponent to join the game.");
    }
  }

  async load() {
    this.rollButtonStatus = GamePlayerStatus.Idle;
    this.stepTxtLabel.string = "";
    this.scheduleOnce(async () => await this.onBalanceRefreshed(), 1);
    this.schedule(() => (this._clickable = true), 2);
  }

  private countdownRollWaitTime() {
    const game = gameData.currentGame;
    if (!game || !game.me) {
      return;
    }
    this.waitingTimeLeft =
      parseInt((new Date().getTime() / 1000).toString()) - game.me.lastOpTime;
  }

  private startStepUpdate() {
    this.stepTxtLabel.node.active = true;
    this.stepTxtLabel.string = "1";
    this._stepAnimationIndex = 1;
    this._stepAnimationDt = 0;
  }

  private stopStepUpdate() {
    this._stepAnimationIndex = -1;
    this._stepAnimationDt = 0;
  }

  protected update(dt: number) {
    if (this._stepAnimationIndex > 0) {
      this._stepAnimationDt += dt;
      if (this._stepAnimationDt > 0.03) {
        this._stepAnimationDt = 0;
        this.stepTxtLabel.string = `${this._stepAnimationIndex++ % 7}`;
      }
    }
  }

  @AutoLockedAsync
  private async onGameRollClicked() {
    if (!this._clickable) {
      Toast.showMessage("Please wait for game to be initialized");
      return Promise.resolve();
    }
    const currentGame = gameData.currentGame;
    if (!currentGame || !currentGame.me) {
      await this.joinGame();
    } else {
      await this.rollStep();
    }
  }

  private async joinGame() {
    if (StringUtil.isEmpty(walletData.address)) {
      Toast.showMessage("Please connect wallet");
      return Promise.resolve();
    }
    if (!gameAccountData.hasAccount) {
      await gameAccountData.buildAccount();
    }
    if (gameData.currentGame && gameData.currentGame.me) {
      Toast.showMessage("You are in a game now");
      return Promise.resolve();
    }
    // get my status
    const player = await gameAccountData.getPlayerSimple();
    try {
      if (
        !player ||
        GameData.INVALID_GAME_ID.eq(player.gameId) ||
        !player.gameId
      ) {
        // there's no game that current player joined, find or create a new one
        const deposit = await this.deposit();
        if (!deposit) {
          Toast.showMessage("Deposit failed");
          return Promise.resolve();
        }
        const toast = await Toast.showMessage(
          "Waiting find or create game...",
          true
        );
        await gameData.findOrNewGame();
        toast && toast.close();
      } else {
        // the player is in a game now, just join it, refresh game
        await gameData.startGame(player.gameId);
      }
    } catch (e) {
      Toast.showMessage("Join game failed");
      console.error(e);
    }
  }

  private async deposit(): Promise<boolean> {
    const balance = await walletData.provider.getBalance(
      gameAccountData.address
    );
    const minGameFee = gameData.minGameFeePerRound;
    let depositComplete = true;

    if (balance.lt(minGameFee)) {
      const toast = await Toast.showMessage(
        "Recharge Matic for playing.",
        true
      );
      const amount = minGameFee.sub(balance);
      const transaction = {
        to: gameAccountData.address,
        value: amount,
      };

      const signer = walletData.provider.getSigner();

      try {
        toast && (toast.message = "waiting...");
        const tx = await signer.sendTransaction(transaction);
        const receipt = await tx.wait();
        toast && toast.close();

        this.balance = walletData.ethers.utils.formatEther(minGameFee);
      } catch (e) {
        toast && toast.close();

        Toast.showMessage("Recharge failed");
        depositComplete = false;
      }
    } else {
      this.balance = walletData.ethers.utils.formatEther(balance);
    }
    return depositComplete;
  }

  private async rollStep() {
    if (!gameData.currentGame || !gameData.currentGame.me) {
      return Promise.resolve();
    }
    if (!gameData.currentGame.isPlaying) {
      Toast.showMessage("Game hasn't started, please wait for your opponent.");
      return Promise.resolve();
    }

    const isMyTurn = await gameData.currentGame.isMyTurn();
    if (!isMyTurn) {
      Toast.showMessage("It's not your turn");
      return Promise.resolve();
    }

    this.startStepUpdate();
    Toast.showLoading("Dice Rolling...");

    try {
      await gameData.rollDice();
    } catch (e: any) {
      this.step = 0;
      await Toast.closeLoading();
      if (e && JSON.stringify(e).indexOf("execution reverted") > 0) {
        GasRecharge.showPopUp();
      }
    }

    // this.scheduleOnce(() => {
    //     gameEventListenerManager.addEventToQueue(
    //         GameEventContractAirVoyagePlayerFinished.event,
    //         [gameData.currentGame!.gameId, gameAccountData.address]
    //     );
    // }, 2);

    // this.scheduleOnce(() => {
    //     gameEventListenerManager.addEventToQueue(GameEventContractAirVoyageGameFinished.event, [
    //         gameData.currentGame!.gameId,
    //         '0xasdjkasd82388',
    //     ]);
    // }, 2.5);
  }

  @OnEvent(GameEventRechargeBalance.event)
  private async onBalanceRefreshed() {
    await this.findAccountBalance();
  }

  @OnEvent(GameEventBuildArcadeAccount.event)
  private async onArcadeAccountBuilded() {
    await this.findAccountBalance();
  }

  private async findAccountBalance() {
    if (StringUtil.isEmpty(gameAccountData.address)) {
      return Promise.resolve();
    }
    const balance = await walletData.provider.getBalance(
      gameAccountData.address
    );
    this.balance = walletData.ethers.utils.formatEther(balance);
  }

  private async refreshRollButtonStatus() {
    if (!gameData.currentGame || !gameData.currentGame.me) {
      return Promise.resolve();
    }
    const player = gameData.currentGame.me;
    this.rollButtonStatus = player.status;
  }

  private async checkWhoseTurn() {
    const game = gameData.currentGame;
    if (!game || !game.isPlaying || !game.me) {
      this.waitingTimeLeft = -1;
      return Promise.resolve();
    }

    this.waitingTimeLeft =
      parseInt((new Date().getTime() / 1000).toString()) - game.me.lastOpTime;
  }

  @OnEvent(GameEventContractAirVoyagePieceMoved.eventAsync)
  private async onPieceMoved(
    gameId: any,
    player: string,
    pieceIndex: any,
    from: any,
    to: any
  ) {
    await this.checkWhoseTurn();
  }

  @OnEvent(GameEventWalletConnected.eventAsync)
  private async onWalletConnected() {
    if (StringUtil.isEmpty(gameAccountData.address)) {
      await gameAccountData.buildAccount();
    }
    await this.onBalanceRefreshed();
  }

  @OnEvent(GameEventGameOpened.eventAsync)
  private async onGameOpened() {
    await this.refreshRollButtonStatus();
    await this.checkWhoseTurn();
    this.step = 0;
  }

  @OnEvent(GameEventContractAirVoyageGameStarted.eventAsync)
  private async onGameStarted() {
    await this.refreshRollButtonStatus();
    await this.checkWhoseTurn();
  }

  @OnEvent(GameEventContractAirVoyageGameJoined.eventAsync)
  private async onGameJoined() {
    await this.refreshRollButtonStatus();
    await this.checkWhoseTurn();
  }

  @OnEvent(GameEventContractGameBonusSystemDeposit.eventAsync)
  private async onBonusDeposit(from: string, amount: any) {
    if (from !== gameAccountData.address) {
      return Promise.resolve();
    }
    await this.onBalanceRefreshed();
  }

  @OnEvent(GameEventContractGameBonusSystemRewardBonus.eventAsync)
  private async onBonusReward(from: string, amount: any) {
    if (from !== gameAccountData.address) {
      return Promise.resolve();
    }
    await this.onBalanceRefreshed();
  }

  @OnEvent(GameEventContractAirVoyageDiceRolled.eventAsync)
  private async onDiceRolled(gameId: any, player: any, dice: any) {
    await this.onBalanceRefreshed();
    if (player === gameAccountData.address) {
      const step = parseInt(dice.toString());
      this.step = step;
    }
  }

  @OnEvent(GameEventContractAirVoyageGameFinished.eventAsync)
  private async onGameFinished(gameId: any, winner: string) {
    this.step = 0;
    this.rollButtonStatus = GamePlayerStatus.Idle;
  }
}

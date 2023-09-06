import { OnEvent } from "../../core/event/decorators/OnEventDecorator";
import { DataModelBase } from "../../core/model/DataModelBase";
import { GameEventWalletDisconnect } from "../events/GameEventWalletDisconnect";
import { contractData } from "./ContractData";
import { registerDataModel } from "./DataRegister";
//@ts-ignore
import ethersLib from "../../../libs/ethers.js";
import { GameMap } from "../components/Main/GameMap";
import { Toast } from "../components/Toast/Toast";
import { GameEventContractAirVoyageGameFinished } from "../contracts/events/GameEventContractAirVoyageGameFinished";
import { GameEventGameOpened } from "../events/GameEventGameOpened";
import { gameEventListenerManager } from "../events/listeners/GameEventListenerManager";
import { GameDTO } from "./dto/GameDTO";
import { gameAccountData } from "./GameAccountData";

const { ethers } = ethersLib;

export class GameData extends DataModelBase {
  private _gaming: boolean = false;
  private _currentGameId: any = GameData.INVALID_GAME_ID;
  private _gameMap: GameMap | null = null;
  private _currentGame: GameDTO | null = null;

  static readonly INVALID_GAME_ID: any = ethers.utils.parseEther("0");

  public get currentGameId(): any {
    return this._currentGameId;
  }

  public get isGaming(): boolean {
    return this._gaming;
  }

  public get stakeToken(): number {
    return 0.005;
  }

  public get minGameFeePerRound(): any {
    return ethers.utils.parseEther(`${this.stakeToken * 200}`);
  }

  public get gameMap(): GameMap {
    return this._gameMap!;
  }

  public get currentGame(): GameDTO | null {
    return this._currentGame;
  }

  public setGameMap(gameMap: GameMap) {
    this._gameMap = gameMap;
  }

  public async startGame(gameId: any) {
    this._currentGameId = gameId;
    this._gaming = true;

    gameEventListenerManager.addEventToQueue(GameEventGameOpened.event, [
      gameId,
    ]);
  }

  public endGame() {
    this._currentGameId = GameData.INVALID_GAME_ID;
    this._gaming = false;
    this._currentGame = null;
  }

  public async getGame(gameID: any): Promise<GameDTO | null> {
    Toast.showLoading();
    let game = null;
    try {
      const data = await contractData.airVoyageGameViewSystemContract.getGame(
        gameID
      );
      game = GameDTO.fillWith(data);
      this.gameMap.clearAllPlanes();
      game.initAllAirplanes();
      this._currentGame = game;
    } catch (error) {
      console.error(error);
    }
    await Toast.closeLoading();
    return game;
  }

  public async findOrNewGame() {
    try {
      // game id list
      const waitingList =
        await contractData.airVoyageContract.getWaitingGames();

      if (waitingList.length > 0) {
        await this.joinGame(waitingList[0]);
      } else {
        await this.createGame();
      }
    } catch (e) {
      console.error(e);
    }
  }

  public async joinGame(gameId: any) {
    await contractData.airVoyageContract.joinGame(gameId, {
      value: ethers.utils.parseEther(`${this.stakeToken}`),
    });
  }

  public async createGame() {
    await contractData.airVoyageContract.createGame({
      value: ethers.utils.parseEther(`${this.stakeToken}`),
    });
  }

  public async getCurrentPlayer(gameId?: any): Promise<string | null> {
    let player = null;
    try {
      let gameID = gameId ?? this._currentGameId;
      player =
        await contractData.airVoyageGameViewSystemContract.getCurrentPlayer(
          gameID
        );
    } catch (e) {}
    return player;
  }

  // TODO: Only one dice by default
  public async rollDice(diceIndex: number = 0) {
    const me = this._currentGame ? this._currentGame.me : null;
    if (!me) {
      return Promise.reject();
    } else {
      const tx = await contractData.airVoyageContract.rollDiceAndMovePiece(
        diceIndex
      );
      tx.wait();
    }
  }

  @OnEvent(GameEventWalletDisconnect.eventAsync)
  private onDisconnect() {
    this.endGame();
  }

  @OnEvent(GameEventContractAirVoyageGameFinished.eventAsync)
  private async onGameFinished(gameId: any, winner: string) {
    await this._gameMap?.clear();

    const message =
      winner === gameAccountData.address
        ? "You Win, now you can claim your Bonus!"
        : `${winner} win!`;

    Toast.showMessage(message);
  }
}
export const gameData: Readonly<GameData> = GameData.getInstance();

registerDataModel(gameData);

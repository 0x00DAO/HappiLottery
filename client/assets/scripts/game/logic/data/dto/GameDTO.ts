import {
  GameStatus,
  TIME_INTERVAL_BETWEEN_ROLL,
} from "../../../const/GameConst";
import { BaseDTO } from "../../../core/model/BaseDTO";
import { PropertyType } from "../../../core/model/DataDecorators";
import { gameAccountData } from "../GameAccountData";
import { gameData } from "../GameData";
import { PieceDTO } from "./PieceDTO";
import { PlayerDTO } from "./PlayerDTO";

export class GameDTO extends BaseDTO {
  gameId: any = "";
  owner: string = "";

  @PropertyType(PlayerDTO)
  players: PlayerDTO[] = [];

  @PropertyType(PieceDTO)
  pieces: PieceDTO[] = [];

  currentPlayer: any = "";

  winner: string = "";
  status: GameStatus = GameStatus.Idle;

  public get playersInGame(): PlayerDTO[] {
    return this.players.filter((player: PlayerDTO) => player.isValid);
  }

  public get hasStarted(): boolean {
    return this.status === GameStatus.Waiting || this.isPlaying;
  }

  public get isPlaying(): boolean {
    return this.status === GameStatus.Playing;
  }

  public get me(): PlayerDTO | null {
    return (
      this.players.find(
        (player: PlayerDTO) => player.addr === gameAccountData.address
      ) ?? null
    );
  }

  public get validPieces(): PieceDTO[] {
    return this.pieces.filter((piece: PieceDTO) => piece.isValid);
  }

  public getPlayerByAddress(address: string): PlayerDTO | null {
    return (
      this.players.find((player: PlayerDTO) => player.addr === address) ?? null
    );
  }

  public getPieceByIndex(index: number): PieceDTO | null {
    return this.pieces.length > index ? this.pieces[index] : null;
  }

  public async isMyTurn(): Promise<boolean> {
    const player = await gameData.getCurrentPlayer();
    if (!player) {
      return false;
    }
    if (player === gameAccountData.address) {
      return true;
    }
    const me = this.me;
    if (!me) {
      return false;
    }
    const lastTime =
      parseInt((new Date().getTime() / 1000).toString()) - me.lastOpTime;
    return lastTime > TIME_INTERVAL_BETWEEN_ROLL;
  }

  public destroyAllAirplanes() {
    this.pieces.forEach((piece: PieceDTO) => piece.destroyAirplane());
  }

  public initAllAirplanes() {
    this.validPieces.forEach((piece: PieceDTO) => piece.gotoInitPosition());
  }

  public landedAllAirplanes() {
    this.validPieces.forEach((piece: PieceDTO) => piece.landToAirport());
  }
}

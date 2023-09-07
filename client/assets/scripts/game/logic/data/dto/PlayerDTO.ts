import { EMPTY_ADDRESS, GamePlayerStatus } from "../../../const/GameConst";
import { BaseDTO } from "../../../core/model/BaseDTO";
import { StringUtil } from "../../../core/utils/StringUtil";
import { AirPlane } from "../../components/AirPlane/AirPlane";
import { PieceDTO } from "./PieceDTO";

export class PlayerDTO extends BaseDTO {
  addr: string = "";
  dice: any = 0;
  status: GamePlayerStatus = GamePlayerStatus.Idle;
  score: any = 0;
  lastOperationTime: any = null;

  public get airplanes(): AirPlane[] {
    return this.myPieces.map((piece: PieceDTO) => piece.airplane);
  }

  public get isPlaying(): boolean {
    return this.status === GamePlayerStatus.Playing;
  }

  public get lastOpTime(): number {
    if (!this.lastOperationTime) {
      return 0;
    }

    return parseInt(this.lastOperationTime.toString());
  }

  public get isValid(): boolean {
    if (StringUtil.isEmpty(this.addr)) {
      return false;
    }
    if (this.addr === EMPTY_ADDRESS) {
      return false;
    }
    return true;
  }

  public get myPieces(): PieceDTO[] {
    if (!this.holder) {
      return [];
    }

    const pieces = this.holder.pieces;
    if (!pieces || pieces.length === 0) {
      return [];
    }
    const myPieces = pieces.filter(
      (piece: PieceDTO) => piece.player === this.addr
    );
    return myPieces;
  }

  public landAllPlanes() {
    this.myPieces.forEach((piece: PieceDTO) => piece.landToAirport());
  }
}

import { GameEventBaseDTO } from "../../core/event/GameEventBaseDTO";

export class GameEventBuildArcadeAccount extends GameEventBaseDTO {
  public static readonly event: string = "core.game.event.build_arcade_account";
}

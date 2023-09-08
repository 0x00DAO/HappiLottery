import { GameEventBaseDTO } from "../../core/event/GameEventBaseDTO";

export class GameEventRefreshArcadeAccount extends GameEventBaseDTO {
  public static readonly event = "core.game.event.withdraw_arcade_account";

  public get subject(): string {
    return GameEventRefreshArcadeAccount.event;
  }
}

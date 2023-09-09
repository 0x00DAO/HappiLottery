import { GameEventBaseDTO } from "../../../core/event/GameEventBaseDTO";
import { Toast } from "../../components/Toast/Toast";
import { GameData, gameData } from "../../data/GameData";

export class GameEventContractAirVoyageDiceRolled extends GameEventBaseDTO {
  public static readonly event: string =
    "core.game.event.air_voyage_dice_rolled";

  public get subject(): string {
    return GameEventContractAirVoyageDiceRolled.event;
  }

  public async exec(gameId: any, player: any, dice: number) {
    console.log(this.subject, gameId, player, dice);

    if (
      gameData.currentGameId.eq(GameData.INVALID_GAME_ID) ||
      !gameData.currentGameId.eq(gameId)
    ) {
      return Promise.reject();
    }
    await Toast.closeLoading();
    await gameData.getGame(gameId);
  }
}

import { GameEventBaseDTO } from '../../../core/event/GameEventBaseDTO';
import { GameData, gameData } from '../../data/GameData';

export class GameEventContractAirVoyageGameFinished extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.air_voyage_game_finished';

    public get subject(): string {
        return GameEventContractAirVoyageGameFinished.event;
    }

    public async exec(gameId: any, winner: any) {
        console.log(this.subject, gameId, winner);

        if (
            gameData.currentGameId.eq(GameData.INVALID_GAME_ID) ||
            !gameData.currentGameId.eq(gameId)
        ) {
            return Promise.reject();
        }

        await gameData.getGame(gameId);
    }
}

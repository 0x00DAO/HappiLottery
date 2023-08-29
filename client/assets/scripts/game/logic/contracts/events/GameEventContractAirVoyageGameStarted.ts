import { GameEventBaseDTO } from '../../../core/event/GameEventBaseDTO';
import { gameData } from '../../data/GameData';

export class GameEventContractAirVoyageGameStarted extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.air_voyage_game_started';

    public get subject(): string {
        return GameEventContractAirVoyageGameStarted.event;
    }

    public async exec(gameId: any) {
        console.log(this.subject, gameId);
        if (!gameId) {
            return Promise.reject();
        }
        await gameData.getGame(gameId);

        // tween animation game start
        console.log('game start, show animation');
    }
}

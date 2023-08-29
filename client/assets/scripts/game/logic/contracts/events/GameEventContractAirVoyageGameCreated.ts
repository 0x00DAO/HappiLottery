import { GameEventBaseDTO } from '../../../core/event/GameEventBaseDTO';
import { gameAccountData } from '../../data/GameAccountData';
import { gameData } from '../../data/GameData';

export class GameEventContractAirVoyageGameCreated extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.air_voyage_game_created';

    public get subject(): string {
        return GameEventContractAirVoyageGameCreated.event;
    }

    public async exec(gameId: any, player: any) {
        console.log(this.subject, gameId, player);
        if (!player || player !== gameAccountData.address) {
            return Promise.reject();
        }
        await gameData.startGame(player.gameId);
    }
}

import { GameEventBaseDTO } from '../../../core/event/GameEventBaseDTO';
import { gameAccountData } from '../../data/GameAccountData';
import { GameData, gameData } from '../../data/GameData';

export class GameEventContractAirVoyageGameJoined extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.air_voyage_game_joined';

    public get subject(): string {
        return GameEventContractAirVoyageGameJoined.event;
    }

    public async exec(gameId: any, player: any) {
        console.log(this.subject, gameId, player, player === gameAccountData.address);
        if (player && player === gameAccountData.address) {
            await gameData.startGame(player.gameId);
        } else {
            if (
                gameData.currentGameId.eq(GameData.INVALID_GAME_ID) ||
                !gameData.currentGameId.eq(gameId)
            ) {
                return Promise.reject();
            }

            const game = await gameData.getGame(gameId);
            if (!game) {
                return Promise.reject();
            }

            const players = game.players;
            if (!players || players.length <= 0) {
                return Promise.reject();
            }

            const findMe = players.find((player: any) => player.addr === gameAccountData.address);
            if (!findMe) {
                return Promise.reject();
            }

            // I joined a game, refresh game
            await gameData.startGame(gameId);
        }
    }
}

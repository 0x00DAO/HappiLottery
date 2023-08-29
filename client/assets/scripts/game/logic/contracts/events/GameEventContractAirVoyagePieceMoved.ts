import { GameEventBaseDTO } from '../../../core/event/GameEventBaseDTO';
import { GameData, gameData } from '../../data/GameData';

export class GameEventContractAirVoyagePieceMoved extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.air_voyage_piece_moved';

    public get subject(): string {
        return GameEventContractAirVoyagePieceMoved.event;
    }

    public async exec(gameId: any, player: any, pieceIndex: any, from: any, to: any) {
        console.log(this.subject, gameId, player, pieceIndex, from, to);
        if (
            gameData.currentGameId.eq(GameData.INVALID_GAME_ID) ||
            !gameData.currentGameId.eq(gameId)
        ) {
            return Promise.reject();
        }

        await gameData.getGame(gameId);
    }
}

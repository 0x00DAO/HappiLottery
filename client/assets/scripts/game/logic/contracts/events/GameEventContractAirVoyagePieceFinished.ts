import { GameEventBaseDTO } from '../../../core/event/GameEventBaseDTO';
import { GameData, gameData } from '../../data/GameData';

export class GameEventContractAirVoyagePieceFinished extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.air_voyage_piece_finished';

    public get subject(): string {
        return GameEventContractAirVoyagePieceFinished.event;
    }

    public async exec(gameId: any, player: any, pieceIndex: any) {
        console.log(this.subject, gameId, player, pieceIndex);
        if (
            gameData.currentGameId.eq(GameData.INVALID_GAME_ID) ||
            !gameData.currentGameId.eq(gameId)
        ) {
            return Promise.reject();
        }

        const game = await gameData.getGame(gameId);
    }
}

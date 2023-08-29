import { GameEventBaseDTO } from '../../core/event/GameEventBaseDTO';
import { gameData } from '../data/GameData';

export class GameEventGameOpened extends GameEventBaseDTO {
    public static readonly event = 'core.game.event.game_opened';

    public get subject(): string {
        return GameEventGameOpened.event;
    }

    public async exec(gameId: any) {
        if (!gameId) return Promise.resolve();
        await gameData.getGame(gameId);
    }
}

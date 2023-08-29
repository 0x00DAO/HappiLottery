import { GameEventBaseDTO } from '../../event/GameEventBaseDTO';

export class GameEventGameOver extends GameEventBaseDTO {
    public static readonly event: string = 'logic.game.event.game_over';
}

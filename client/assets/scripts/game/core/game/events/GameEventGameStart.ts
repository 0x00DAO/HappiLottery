import { GameEventBaseDTO } from '../../event/GameEventBaseDTO';

export class GameEventGameStart extends GameEventBaseDTO {
    public static readonly event: string = 'logic.game.event.game_start';
}

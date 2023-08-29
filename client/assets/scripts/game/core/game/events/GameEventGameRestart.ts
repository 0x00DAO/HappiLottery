import { GameEventBaseDTO } from '../../event/GameEventBaseDTO';

export class GameEventGameRestart extends GameEventBaseDTO {
    public static readonly event: string = 'logic.game.event.game_restart';
}

import { GameEventBaseDTO } from '../../event/GameEventBaseDTO';

export class GameEventGameLaunch extends GameEventBaseDTO {
    public static readonly event: string = 'logic.game.event.game_launch';
}

import { GameEventBaseDTO } from '../../core/event/GameEventBaseDTO';

export class GameEventResourceLoading extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.resource_loading';
}

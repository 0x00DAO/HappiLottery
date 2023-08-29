import { GameEventBaseDTO } from '../../core/event/GameEventBaseDTO';

export class GameEventRechargeBalance extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.recharge_balance';
}

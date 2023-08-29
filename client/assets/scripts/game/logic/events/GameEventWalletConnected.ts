import { GameEventBaseDTO } from '../../core/event/GameEventBaseDTO';

export class GameEventWalletConnected extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.wallet_connected';
}

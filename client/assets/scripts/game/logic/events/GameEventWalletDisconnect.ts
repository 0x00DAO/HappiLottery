import { GameEventBaseDTO } from '../../core/event/GameEventBaseDTO';
import { walletData } from '../data/WalletData';

export class GameEventWalletDisconnect extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.wallet_disconnect';

    public get subject(): string {
        return GameEventWalletDisconnect.event;
    }

    public async exec() {
        await walletData.disconnect();
    }
}

import { GameEventBaseDTO } from '../../core/event/GameEventBaseDTO';
import { walletData } from '../data/WalletData';

export class GameEventWalletChainChanged extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.wallet_chain_changed';

    public get subject(): string {
        return GameEventWalletChainChanged.event;
    }

    public async exec(chainId: string) {
        await walletData.chainChange(parseInt(chainId, 16));
    }
}

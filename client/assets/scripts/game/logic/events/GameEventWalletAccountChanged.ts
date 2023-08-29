import { GameEventBaseDTO } from '../../core/event/GameEventBaseDTO';
import { walletData } from '../data/WalletData';

export class GameEventWalletAccountChanged extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.wallet_account_changed';

    public get subject(): string {
        return GameEventWalletAccountChanged.event;
    }

    public async exec(accounts: string[]) {
        await walletData.changeAccount(accounts.length > 0 ? accounts[0] : '');
    }
}

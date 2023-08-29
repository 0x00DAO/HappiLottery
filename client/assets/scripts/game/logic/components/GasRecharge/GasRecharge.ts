import { Label, _decorator } from 'cc';
import { eventBus } from '../../../core/event/EventBus';
import { onAddedPromise } from '../../../core/layout/LayerHelper';
import { AutoLockedAsync } from '../../../core/model/DataDecorators';
import { gameAccountData } from '../../data/GameAccountData';
import { gameData } from '../../data/GameData';
import { walletData } from '../../data/WalletData';
import { GameEventRechargeBalance } from '../../events/GameEventRechargeBalance';
import { LayoutCom } from '../../layout/LayoutCom';
import { registerLayout } from '../GameUI';
import { Toast } from '../Toast/Toast';
const { menu, ccclass, property } = _decorator;

@ccclass('GasRecharge')
@menu('game/logic/components/GasRecharge')
export class GasRecharge extends LayoutCom {
    static prefabName(): string {
        return 'GasRecharge';
    }

    private static _instance: GasRecharge | null = null;

    @property(Label)
    private tokenLabel: Label = null!;

    private set tokenCount(value: string) {
        this.tokenLabel.string = `need matic: ${value}`;
    }

    load() {
        this.setNeedMaticLabel();
    }

    private async setNeedMaticLabel() {
        const balance = await walletData.provider.getBalance(gameAccountData.address);
        const minGameFee = gameData.minGameFeePerRound;

        if (balance.lt(minGameFee)) {
            const amount = minGameFee.sub(balance);
            this.tokenCount = `${Number(walletData.ethers.utils.formatEther(amount)).toFixed(5)}`;
        } else {
            this.tokenCount = '0';
        }
    }

    @AutoLockedAsync
    private async onGasRecharge() {
        this.onClosed();
        if (this.tokenLabel.string !== '0') {
            await this.deposit();
        }
    }

    private async deposit() {
        const balance = await walletData.provider.getBalance(gameAccountData.address);
        const minGameFee = gameData.minGameFeePerRound;

        if (balance.lt(minGameFee)) {
            const toast = await Toast.showMessage('Recharge Matic for playing.', true);
            const amount = minGameFee.sub(balance);
            const transaction = {
                to: gameAccountData.address,
                value: amount,
            };

            const signer = walletData.provider.getSigner();

            try {
                toast && (toast.message = 'waiting...');
                const tx = await signer.sendTransaction(transaction);
                const receipt = await tx.wait();
                toast && toast.close();

                eventBus.emit(GameEventRechargeBalance.event);
            } catch (e) {
                toast && toast.close();

                Toast.showMessage('Recharge failed');
            }
        }
    }

    private onClosed() {
        GasRecharge.closePopUp();
    }

    static async showPopUp() {
        if (this._instance) {
            return Promise.resolve();
        }
        this._instance = await onAddedPromise(GasRecharge);
    }

    public static closePopUp() {
        if (!this._instance) {
            return;
        }
        GasRecharge.remove();
        this._instance = null;
    }
}

registerLayout(GasRecharge);

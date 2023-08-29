import { AfterDataLoad } from '../../core/model/DataDecorators';
import { DataModelBase } from '../../core/model/DataModelBase';
import { registerDataModel } from './DataRegister';
//@ts-ignore
import ethersLib from '../../../libs/ethers.js';
import { eventBus } from '../../core/event/EventBus';
import { StringUtil } from '../../core/utils/StringUtil';
import { Toast } from '../components/Toast/Toast';
import { ChainID } from '../enum/Chain';
import { GameEventWalletAccountChanged } from '../events/GameEventWalletAccountChanged';
import { GameEventWalletChainChanged } from '../events/GameEventWalletChainChanged';
import { GameEventWalletConnected } from '../events/GameEventWalletConnected';
import { GameEventWalletDisconnect } from '../events/GameEventWalletDisconnect';

interface WalletCache {
    address: string;
    chainId: number;
}

const ChainIds = Object.keys(ChainID)
    .filter((key) => !isNaN(Number(ChainID[key as keyof typeof ChainID])))
    .map((key) => ChainID[key as keyof typeof ChainID]);

export class WalletData extends DataModelBase {
    private _provider: any = null;

    protected get dataCacheKey(): string {
        return 'DM:WalletData';
    }

    public get ethereum(): any {
        //@ts-ignore
        return globalThis?.ethereum;
    }

    public get ethers(): any {
        return ethersLib.ethers;
    }

    public get hasProvider(): boolean {
        return this.ethereum !== undefined && this.ethereum !== null;
    }

    public get address(): string {
        return this.data.address;
    }

    public get chainId(): number {
        return this.data.chainId;
    }

    public get provider(): any {
        if (!this._provider && this.hasProvider) {
            this._provider = new this.ethers.providers.Web3Provider(this.ethereum);
        }
        return this._provider;
    }

    protected get defaultData(): WalletCache {
        return {
            address: '',
            chainId: -1,
        };
    }

    @AfterDataLoad
    async loadData() {
        this.registerProviderEvent();
    }

    private registerProviderEvent() {
        if (!this.hasProvider) {
            return;
        }
        this.ethereum.on('accountsChanged', (accounts: string[]) =>
            eventBus.emit(GameEventWalletAccountChanged.event, accounts)
        );
        this.ethereum.on('chainChanged', (chainId: string) =>
            eventBus.emit(GameEventWalletChainChanged.event, chainId)
        );
        this.ethereum.on('disconnect', () => {
            eventBus.emit(GameEventWalletDisconnect.event);
        });
    }

    public async isChainValid(): Promise<boolean> {
        if (!this.hasProvider) {
            return Promise.resolve(false);
        }
        const currentId = this.data.chainId;
        if (ChainIds.findIndex((id) => id === currentId) >= 0) {
            return Promise.resolve(true);
        }
        const chainId0x = await this.ethereum.request({
            method: 'eth_chainId',
        });

        const chainId = parseInt(chainId0x, 16);
        const idx = ChainIds.findIndex((id) => id === chainId);
        return idx >= 0;
    }

    public async changeAccount(account: string) {
        if (StringUtil.isEmpty(account)) {
            await this.disconnect();
        } else {
            this.data.address = account;
            this.saveData();
        }
    }

    public async chainChange(chainId: number) {
        this.data.chainId = chainId;
        this.saveData();
    }

    public async connectWallet(): Promise<void> {
        if (!this.hasProvider) {
            Toast.showMessage(`there's no provider`);
            return Promise.resolve();
        }
        const chainId0x = await this.ethereum.request({
            method: 'eth_chainId',
        });

        const chainId = parseInt(chainId0x, 16);
        const idx = ChainIds.findIndex((id) => id === chainId);
        if (idx < 0) {
            Toast.showMessage(`chain ${chainId} is not supported, please switch to Polygon`);
            return Promise.resolve();
        }

        const accounts = await this.ethereum.request({
            method: 'eth_requestAccounts',
        });
        if (accounts.length <= 0) {
            return Promise.resolve();
        }
        const address = accounts[0];
        this.data.address = address;
        this.data.chainId = chainId;

        this.saveData();

        eventBus.emit(GameEventWalletConnected.event, accounts);
    }

    public async disconnect() {
        this.data.address = '';
        this.data.chainId = -1;
        this.saveData();
    }
}
export const walletData: Readonly<WalletData> = WalletData.getInstance();

registerDataModel(walletData);

import { OnEvent } from '../../core/event/decorators/OnEventDecorator';
import { DataModelBase } from '../../core/model/DataModelBase';
import { EncryptUtil } from '../../core/utils/EncryptUtil';
import { StringUtil } from '../../core/utils/StringUtil';
import { GameEventWalletDisconnect } from '../events/GameEventWalletDisconnect';
import { contractData } from './ContractData';
import { registerDataModel } from './DataRegister';
import { walletData } from './WalletData';
import { PlayerSimpleDTO } from './dto/PlayerSimpleDTO';
//@ts-ignore
import ethersLib from '../../../libs/ethers.js';

const { ethers } = ethersLib;

interface IAccountCache {
    address: string;
    secret: string;
}
export class GameAccountData extends DataModelBase {
    protected get dataCacheKey(): string {
        return 'DM:GameAccountData';
    }

    protected get defaultData(): IAccountCache {
        return {
            address: '',
            secret: '',
        };
    }

    public get secret(): string | null {
        return StringUtil.isEmpty(this.data.secret) || StringUtil.isEmpty(this.data.address)
            ? null
            : EncryptUtil.decryptWithKey(this.data.secret, this.data.address);
    }

    public get address(): string | null {
        return StringUtil.isEmpty(this.data.address) ? null : this.data.address;
    }

    public get hasAccount(): boolean {
        return !StringUtil.isEmpty(this.address) && !StringUtil.isEmpty(this.secret);
    }

    @OnEvent(GameEventWalletDisconnect.eventAsync)
    private onDisconnect() {
        this.data.address = '';
        this.data.secret = '';
        this.saveData();
    }

    public async getPlayerSimple(address?: string): Promise<PlayerSimpleDTO | null> {
        let player = null;
        try {
            const data = await contractData.airVoyageContract.players(address ?? this.address);
            player = PlayerSimpleDTO.fillWith(data);
        } catch (e) {
            console.error(e);
        }
        return player;
    }

    public async buildAccount() {
        if (!StringUtil.isEmpty(this.data.address) && !StringUtil.isEmpty(this.data.secret)) {
            return Promise.resolve();
        }
        const signer = walletData.provider.getSigner();
        const message = ethers.utils.solidityKeccak256(
            ['address', 'string'],
            [walletData.address, 'airvoyage']
        );
        const hash = ethers.utils.arrayify(message);
        const signature = await signer.signMessage(hash);
        const { r, s, v } = ethers.utils.splitSignature(signature);
        const secret = `${s.substring(49, s.length)}${r.substring(2, 17)}${s.substring(
            2,
            17
        )}${r.substring(49, r.length)}`;
        const wallet = new ethers.Wallet(secret);
        this.data.secret = EncryptUtil.encryptWithKey(secret, wallet.address);
        this.data.address = wallet.address;

        this.saveData();
    }

    public async getBonus(): Promise<any> {
        let bonus = ethers.utils.parseEther('0');
        try {
            bonus = await contractData.airVoyageGameViewSystemContract.getBonus(this.address);
        } catch (e) {}

        return bonus;
    }

    public async winBonus(): Promise<any> {
        const amount = await this.getBonus();
        if (amount.lte(ethers.utils.parseEther('0'))) {
            return Promise.reject();
        }
        await contractData.airVoyageGameViewSystemContract.rewardBonus();
        return amount;
    }
}
export const gameAccountData: Readonly<GameAccountData> = GameAccountData.getInstance();

registerDataModel(gameAccountData);

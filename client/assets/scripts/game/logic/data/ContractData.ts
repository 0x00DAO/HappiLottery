import { CONTRACT_ADDRESS_MUMBAI, CONTRACT_ADDRESS_POLYGON } from '../../const/ContractConst';
import { DataModelBase } from '../../core/model/DataModelBase';
import { ContractAirVoyage } from '../contracts/ContractAirVoyage';
import { ContractGameBonusSystem } from '../contracts/ContractGameBonusSystem';
import { ContractGameViewSystem } from '../contracts/ContractGameViewSystem';
import { ChainID } from '../enum/Chain';
import { registerDataModel } from './DataRegister';
import { walletData } from './WalletData';

interface IContractAddress {
    AirVoyage: string;
    AirVoyageGameViewSystem: string;
    AirVoyageGameBonusSystem: string;
}

export class ContractData extends DataModelBase {
    private _airVoyageContract: any = null!;
    private _airVoyageGameViewSystemContract: any = null!;
    private _airVoyageGameBonusSystemContract: any = null!;

    public get airVoyageContract(): any {
        if (!this._airVoyageContract) {
            this._airVoyageContract = ContractAirVoyage.create();
        }
        return this._airVoyageContract;
    }

    public get airVoyageGameViewSystemContract(): any {
        if (!this._airVoyageGameViewSystemContract) {
            this._airVoyageGameViewSystemContract = ContractGameViewSystem.create();
        }
        return this._airVoyageGameViewSystemContract;
    }

    public get airVoyageGameBonusSystemContract(): any {
        if (!this._airVoyageGameBonusSystemContract) {
            this._airVoyageGameBonusSystemContract = ContractGameBonusSystem.create();
        }
        return this._airVoyageGameBonusSystemContract;
    }

    public get contractAddress(): IContractAddress {
        if (walletData.chainId === ChainID.Mumbai) {
            return CONTRACT_ADDRESS_MUMBAI;
        } else if (walletData.chainId === ChainID.Polygon) {
            return CONTRACT_ADDRESS_POLYGON;
        }
        return {
            AirVoyage: '',
            AirVoyageGameViewSystem: '',
            AirVoyageGameBonusSystem: '',
        };
    }
}
export const contractData: Readonly<ContractData> = ContractData.getInstance();

registerDataModel(contractData);

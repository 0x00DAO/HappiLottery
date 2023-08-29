import { contractData } from '../data/ContractData';
import { gameAccountData } from '../data/GameAccountData';
import { gameEventListenerManager } from '../events/listeners/GameEventListenerManager';
import { ContractBase } from './ContractBase';
import ContractABIAirVoyageGameBonusSystem from './abi/systems/AirVoyageGameBonusSystem/AirVoyageGameBonusSystem.json';
import { GameEventContractGameBonusSystemDeposit } from './events/GameEventContractGameBonusSystemDeposit';
import { GameEventContractGameBonusSystemRewardBonus } from './events/GameEventContractGameBonusSystemRewardBonus';
import { GameEventContractGameBonusSystemWinBonus } from './events/GameEventContractGameBonusSystemWinBonus';

export class ContractGameBonusSystem extends ContractBase {
    static create() {
        const address = contractData.contractAddress.AirVoyageGameBonusSystem;
        const contract = new ContractGameBonusSystem(
            ContractABIAirVoyageGameBonusSystem,
            address,
            gameAccountData.secret ?? '',
            ''
        );
        const contractWithSigner = contract.createContract();
        contract.registerEvents(contractWithSigner);
        return contractWithSigner;
    }

    public registerEvents(contractIns: any) {
        if (!contractIns) {
            return;
        }

        contractIns.on('Deposit', (from: any, amount: any) =>
            gameEventListenerManager.addEventToQueue(
                GameEventContractGameBonusSystemDeposit.event,
                [from, amount]
            )
        );
        contractIns.on('WinBonus', (from: any, amount: any) =>
            gameEventListenerManager.addEventToQueue(
                GameEventContractGameBonusSystemWinBonus.event,
                [from, amount]
            )
        );
        contractIns.on('RewardBonus', (from: any, amount: any) =>
            gameEventListenerManager.addEventToQueue(
                GameEventContractGameBonusSystemRewardBonus.event,
                [from, amount]
            )
        );
    }
}

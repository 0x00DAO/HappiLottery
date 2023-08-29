import { contractData } from '../data/ContractData';
import { gameAccountData } from '../data/GameAccountData';
import { ContractBase } from './ContractBase';
import ContractABIAirVoyageGameViewSystem from './abi/systems/AirVoyageGameViewSystem/AirVoyageGameVIewSystem.json';

export class ContractGameViewSystem extends ContractBase {
    static create() {
        const address = contractData.contractAddress.AirVoyageGameViewSystem;
        const contract = new ContractGameViewSystem(
            ContractABIAirVoyageGameViewSystem,
            address,
            gameAccountData.secret ?? '',
            ''
        );
        const contractWithSigner = contract.createContract();
        contract.registerEvents(contractWithSigner);
        return contractWithSigner;
    }
}

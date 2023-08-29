import { hardhatArguments } from 'hardhat';
import { deployNetwork } from './deploy.const';

type ContractDeployAddress = string | null;

interface ContractDeployAddressInterface {
  GameRoot?: ContractDeployAddress;
  AirVoyage?: ContractDeployAddress;
  AirVoyageGameViewSystem?: ContractDeployAddress;
  AirVoyageGameMoveSystem?: ContractDeployAddress;
  AirVoyageGameBonusSystem?: ContractDeployAddress;
  AirVoyageGameEntity?: ContractDeployAddress;
  AirVoyageGameBonusEntity?: ContractDeployAddress;
  AirVoyageGameBonusSystemEntity?: ContractDeployAddress;
}

const ContractDeployAddress_PolygonTestNet: ContractDeployAddressInterface = {
  GameRoot: '0xED57fD92FC6575051C885e9F0F6716818aAeE4dB',
  AirVoyage: '0xA5cC0422ef56e1e66A1B6100cD73061592B58b13',
  AirVoyageGameViewSystem: '0xf5d1e1aFfD00894b26Be2A470dc4005ACE8974AC',
  AirVoyageGameMoveSystem: '0xD6880B4761167Be4fD378248Dba345c9eE6FD93a',
  AirVoyageGameBonusSystem: '0x84B7F92c0187eee470fd85028C15905BD2d4FcdF',
  AirVoyageGameEntity: '0x77b9F07967065d43f8d374983f97eA0EaF0eAb72',
  AirVoyageGameBonusEntity: '0xC563314A79B1FD99b251a3061A842387b8D7C200',
  AirVoyageGameBonusSystemEntity: '0xE3E966B9073dAE30f87c50b7C6e759513A202c7e',
};

const ContractDeployAddress_PolygonMainNet: ContractDeployAddressInterface = {};

export function getContractDeployAddress(
  network?: string
): ContractDeployAddressInterface {
  let _ContractDeployAddress: ContractDeployAddressInterface = null as any;
  switch (network) {
    case deployNetwork.polygon_testnet:
      _ContractDeployAddress = ContractDeployAddress_PolygonTestNet;
      break;
    case deployNetwork.polygon_mainnet:
      _ContractDeployAddress = ContractDeployAddress_PolygonMainNet;
      break;
    default:
      _ContractDeployAddress = undefined as any;
      break;
  }
  return _ContractDeployAddress;
}

export const ContractDeployAddress: ContractDeployAddressInterface =
  getContractDeployAddress(hardhatArguments?.network) as any;

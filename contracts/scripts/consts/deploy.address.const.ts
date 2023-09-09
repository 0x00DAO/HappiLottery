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
  GameRoot: '0x8A725623389d835EfD812f8aFBC0f473728Ebb86',
  AirVoyage: '0x4e312Ebb98306ABf7D2C50fFbBf7021FBFFf4E13',
  AirVoyageGameViewSystem: '0x35F45aA48EF715571bbd0B07ed195405b8afE888',
  AirVoyageGameMoveSystem: '0xE2710De9474d8724361a643DA6A5Dbe28793fac8',
  AirVoyageGameBonusSystem: '0xC13B9eC6Bd31fDdd0DfB46137E32994e6Da82347',
  AirVoyageGameEntity: '0x16AdBE7728BbcF494A64A0aCd63CB8e0328E8Df3',
  AirVoyageGameBonusEntity: '0x70afc49e5D77786B5E91AaC8cE3A827Fb1feC029',
  AirVoyageGameBonusSystemEntity: '0xA4E9E9d501FA72EF5f9be83aa9a1cA00c89E506C',
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

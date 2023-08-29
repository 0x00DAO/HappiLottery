import { contractData } from "../data/ContractData";
import { gameAccountData } from "../data/GameAccountData";
import { ContractBase } from "./ContractBase";
import ContractABIAirVoyage from "./abi/AirVoyage/AirVoyage.json";
import { GameEventContractAirVoyageDiceRolled } from "./events/GameEventContractAirVoyageDiceRolled";
import { GameEventContractAirVoyageGameFinished } from "./events/GameEventContractAirVoyageGameFinished";
import { GameEventContractAirVoyageGameJoined } from "./events/GameEventContractAirVoyageGameJoined";
import { GameEventContractAirVoyageGameStarted } from "./events/GameEventContractAirVoyageGameStarted";
import { GameEventContractAirVoyagePieceFinished } from "./events/GameEventContractAirVoyagePieceFinished";
import { GameEventContractAirVoyagePieceMoved } from "./events/GameEventContractAirVoyagePieceMoved";
import { GameEventContractAirVoyagePlayerFinished } from "./events/GameEventContractAirVoyagePlayerFinished";
import { gameEventListenerManager } from "../events/listeners/GameEventListenerManager";
import { GameEventContractAirVoyageGameCreated } from "./events/GameEventContractAirVoyageGameCreated";

export class ContractAirVoyage extends ContractBase {
  static create(): any {
    const address = contractData.contractAddress.AirVoyage;
    const contract = new ContractAirVoyage(
      ContractABIAirVoyage,
      address,
      gameAccountData.secret ?? "",
      ""
    );
    const contractWithSigner = contract.createContract();
    contract.registerEvents(contractWithSigner);
    return contractWithSigner;
  }

  public registerEvents(contractIns: any, currentGameId?: any) {
    if (!contractIns) {
      return;
    }

    contractIns.on("GameCreated", (gameId: any, player: any) =>
      gameEventListenerManager.addEventToQueue(
        GameEventContractAirVoyageGameCreated.event,
        [gameId, player]
      )
    );
    contractIns.on("GameJoined", (gameId: any, player: any) =>
      gameEventListenerManager.addEventToQueue(
        GameEventContractAirVoyageGameJoined.event,
        [gameId, player]
      )
    );
    contractIns.on("GameStarted", (gameId: any) =>
      gameEventListenerManager.addEventToQueue(
        GameEventContractAirVoyageGameStarted.event,
        [gameId]
      )
    );
    contractIns.on("DiceRolled", (gameId: any, player: any, dice: any) =>
      gameEventListenerManager.addEventToQueue(
        GameEventContractAirVoyageDiceRolled.event,
        [gameId, player, dice]
      )
    );
    contractIns.on(
      "PieceMoved",
      (gameId: any, player: any, pieceIndex: any, from: any, to: any) =>
        gameEventListenerManager.addEventToQueue(
          GameEventContractAirVoyagePieceMoved.event,
          [gameId, player, pieceIndex, from, to]
        )
    );
    contractIns.on(
      "PieceFinished",
      (gameId: any, player: any, pieceIndex: any) =>
        gameEventListenerManager.addEventToQueue(
          GameEventContractAirVoyagePieceFinished.event,
          [gameId, player, pieceIndex]
        )
    );
    contractIns.on("PlayerFinished", (gameId: any, player: any) =>
      gameEventListenerManager.addEventToQueue(
        GameEventContractAirVoyagePlayerFinished.event,
        [gameId, player]
      )
    );
    contractIns.on("GameFinished", (gameId: any, winner: any) =>
      gameEventListenerManager.addEventToQueue(
        GameEventContractAirVoyageGameFinished.event,
        [gameId, winner]
      )
    );
  }
}

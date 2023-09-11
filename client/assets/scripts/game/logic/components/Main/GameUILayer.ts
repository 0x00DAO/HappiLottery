import { Label, _decorator, Node, Sprite } from "cc";
import { GameObject } from "../../../core/game/GameObject";
import { gameAccountData } from "../../data/GameAccountData";
import { StringUtil } from "../../../core/utils/StringUtil";
import { OnEvent } from "../../../core/event/decorators/OnEventDecorator";
import { GameEventBuildArcadeAccount } from "../../events/GameEventBuildArcadeAccount";
import { GameEventContractAirVoyageGameFinished } from "../../contracts/events/GameEventContractAirVoyageGameFinished";
import { ViewUtil } from "../../../core/utils/ViewUtil";
import { Textures } from "../../enum/Textures";
import { GameEventGameOpened } from "../../events/GameEventGameOpened";
import { gameData } from "../../data/GameData";
import { contractData } from "../../data/ContractData";
import { Toast } from "../Toast/Toast";
import { ArcadeWithdrawPopUp } from "../ArcadeWithdrawPopUp/ArcadeWithdrawPopUp";

const { menu, ccclass, property } = _decorator;
@ccclass("GameUILayer")
@menu("game/logic/components/Main/GameUILayer")
export class GameUILayer extends GameObject {
  @property(Label)
  private arcadeAccountLabel: Label = null!;

  @property(Node)
  private yourFactionNode: Node = null!;

  @property(Sprite)
  private factionSp: Sprite = null!;

  @property(Label)
  private gameIdLabel: Label = null!;

  @property(Label)
  private contractAddress: Label = null!;

  static prefabName(): string {
    return "GameUILayer";
  }

  load() {
    if (!StringUtil.isEmpty(gameAccountData.address)) {
      this.setArcadeAccount();
    } else {
      this.arcadeAccountLabel.string = "";
    }
    // this.contractAddress.string = `Contract Address: ${contractData.contractAddress.AirVoyage}`;
    this.contractAddress.string = `Contract Address: 0x4e312Ebb98306ABf7D2C50fFbBf7021FBFFf4E13`;
  }

  private setArcadeAccount() {
    this.arcadeAccountLabel.string = `arcade account: ${
      gameAccountData.address as string
    }`;
  }

  private onCopyArcadeAccount() {
    if (gameAccountData.address && gameAccountData.address.length > 0) {
      ArcadeWithdrawPopUp.showPopUp();
    }
  }

  private onCopyContractAddr() {
    StringUtil.copyString(contractData.contractAddress.AirVoyage);
    Toast.showMessage("Copied!");
  }

  @OnEvent(GameEventBuildArcadeAccount.event)
  private onArcadeAccountBuilded() {
    this.setArcadeAccount();
  }

  @OnEvent(GameEventContractAirVoyageGameFinished.event)
  private onGameFinished() {
    this.yourFactionNode.active = false;
  }
  @OnEvent(GameEventGameOpened.eventAsync)
  private async onGameStarted() {
    if (!gameData.currentGame || !gameData.currentGame.me) {
      this.yourFactionNode.active = false;
      return Promise.resolve();
    }
    if (!gameData.currentGame.hasStarted) {
      this.yourFactionNode.active = false;
      return Promise.resolve();
    }

    const account = await gameAccountData.getPlayerSimple();
    if (!account) {
      this.yourFactionNode.active = false;
      return Promise.resolve();
    }

    this.gameIdLabel.string = `Current Game: ${account.gameId.toString()}`;
    const seatIndex = account.seatIndex;
    const planeTex = `airplane_${seatIndex}`;

    ViewUtil.setTexture(this.factionSp, Textures.UI_GAME_MAP, planeTex);
    this.yourFactionNode.active = true;
  }
}

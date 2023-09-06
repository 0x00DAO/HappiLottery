import { Label, _decorator } from "cc";
import { GameObject } from "../../../core/game/GameObject";
import { gameAccountData } from "../../data/GameAccountData";
import { StringUtil } from "../../../core/utils/StringUtil";
import { OnEvent } from "../../../core/event/decorators/OnEventDecorator";
import { GameEventBuildArcadeAccount } from "../../events/GameEventBuildArcadeAccount";
const { menu, ccclass, property } = _decorator;
@ccclass("GameUILayer")
@menu("game/logic/components/Main/GameUILayer")
export class GameUILayer extends GameObject {
  @property(Label)
  private arcadeAccountLabel: Label = null!;

  static prefabName(): string {
    return "GameUILayer";
  }

  load() {
    if (!StringUtil.isEmpty(gameAccountData.address)) {
      this.setArcadeAccount();
    } else {
      this.arcadeAccountLabel.string = "";
    }
  }

  @OnEvent(GameEventBuildArcadeAccount.event)
  private onArcadeAccountBuilded() {
    this.setArcadeAccount();
  }

  private setArcadeAccount() {
    this.arcadeAccountLabel.string = `arcade account: ${StringUtil.shortAddress(
      gameAccountData.address as string,
      6
    )}`;
  }
}

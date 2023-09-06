import { Label, _decorator } from "cc";
import { GameObject } from "../../../core/game/GameObject";
import { gameAccountData } from "../../data/GameAccountData";
import { StringUtil } from "../../../core/utils/StringUtil";
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
    console.log(gameAccountData.address);
    if (!StringUtil.isEmpty(gameAccountData.address)) {
      this.arcadeAccountLabel.string = `arcade account: ${StringUtil.shortAddress(
        gameAccountData.address as string,
        6
      )}`;
    }
  }
}

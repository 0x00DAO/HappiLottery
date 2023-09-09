import { _decorator } from "cc";
import { GameObject } from "../../../core/game/GameObject";
import { AutoLockedAsync } from "../../../core/model/DataDecorators";
import { StringUtil } from "../../../core/utils/StringUtil";
import { gameAccountData } from "../../data/GameAccountData";
import { BonusPopUp } from "../BonusPopUp/BonusPopUp";
import { Toast } from "../Toast/Toast";
const { menu, ccclass } = _decorator;

@ccclass("TokenButton")
@menu("game/logic/components/TokenButton")
export class TokenButton extends GameObject {
  @AutoLockedAsync
  private async onCoinButtonClicked() {
    if (StringUtil.isEmpty(gameAccountData.address)) {
      await gameAccountData.buildAccount();
    }
    if (StringUtil.isEmpty(gameAccountData.address)) {
      Toast.showMessage("Please connect wallet");
      return Promise.resolve();
    }
    await BonusPopUp.showPopUp();
  }
}

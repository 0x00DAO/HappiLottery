import { Label, _decorator } from "cc";
//@ts-ignore
import ethersLib from "../../../../libs/ethers.js";
import { AutoLockedAsync } from "../../../core/model/DataDecorators";
import { StringUtil } from "../../../core/utils/StringUtil";
import { gameAccountData } from "../../data/GameAccountData";
import { LayoutCom } from "../../layout/LayoutCom";
import { registerLayout } from "../GameUI";
import { onAddedPromise } from "../../../core/layout/LayerHelper";
import { Toast } from "../Toast/Toast";

const { menu, ccclass, property } = _decorator;
const { ethers } = ethersLib;

@ccclass("BonusPopUp")
@menu("game/logic/components/BonusPopUp")
export class BonusPopUp extends LayoutCom {
  static prefabName(): string {
    return "BonusPopUp";
  }

  private static _bonusPopUp: BonusPopUp | null = null;
  private _bonus: any = ethers.utils.parseEther("0");

  private set bonus(value: any) {
    this._bonus = value;
    this.bonusLabel.string = `Bonus: ${Number(
      ethers.utils.formatEther(value)
    ).toFixed(5)}`;
  }

  static async showPopUp() {
    if (this._bonusPopUp) {
      return Promise.resolve();
    }
    this._bonusPopUp = await onAddedPromise(BonusPopUp);
  }

  static closePopUp() {
    if (!this._bonusPopUp) {
      return;
    }
    BonusPopUp.remove();
    this._bonusPopUp = null;
  }

  @property(Label)
  private bonusLabel: Label = null!;

  load() {
    this.getBonus();
  }

  private async getBonus() {
    if (StringUtil.isEmpty(gameAccountData.address)) {
      return Promise.resolve();
    }

    this.bonus = await gameAccountData.getBonus();
  }

  @AutoLockedAsync
  private async onRewardClicked() {
    this.onClose();
    if (StringUtil.isEmpty(gameAccountData.address)) {
      return Promise.resolve();
    }

    if (this._bonus.lte(ethers.utils.parseEther("0"))) {
      Toast.showMessage("No bonus to award.");
      return Promise.resolve();
    }

    try {
      const amount = await gameAccountData.winBonus();
      Toast.showMessage(
        `Reward ${Number(ethers.utils.formatEther(amount)).toFixed(5)} Matic`
      );
    } catch (e) {
      Toast.showMessage("Reward failed");
    }
  }

  private onClose() {
    BonusPopUp.closePopUp();
  }
}

registerLayout(BonusPopUp);

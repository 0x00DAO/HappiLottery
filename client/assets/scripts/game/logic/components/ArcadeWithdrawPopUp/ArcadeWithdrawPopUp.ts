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
import { walletData } from "../../data/WalletData";

const { menu, ccclass, property } = _decorator;
const { ethers } = ethersLib;

@ccclass("ArcadeWithdrawPopUp")
@menu("game/logic/components/ArcadeWithdrawPopUp")
export class ArcadeWithdrawPopUp extends LayoutCom {
  static prefabName(): string {
    return "ArcadeWithdrawPopUp";
  }

  private static _arcadeWithdrawPopUp: ArcadeWithdrawPopUp | null = null;

  private set balance(value: any) {
    this.balanceLabel.string = `Balance: ${Number(value).toFixed(5)}`;
  }

  static async showPopUp() {
    if (this._arcadeWithdrawPopUp) {
      return Promise.resolve();
    }
    this._arcadeWithdrawPopUp = await onAddedPromise(ArcadeWithdrawPopUp);
  }

  private onCopyArcadeAccount() {
    if (gameAccountData.address && gameAccountData.address.length > 0) {
      StringUtil.copyString(gameAccountData.address as string);
      Toast.showMessage("Copied!");
    }
  }

  static closePopUp() {
    if (!this._arcadeWithdrawPopUp) {
      return;
    }
    ArcadeWithdrawPopUp.remove();
    this._arcadeWithdrawPopUp = null;
  }

  @property(Label)
  private balanceLabel: Label = null!;

  @property(Label)
  private addressLabel: Label = null!;

  load() {
    if (gameAccountData.address && gameAccountData.address.length > 0) {
      this.addressLabel.string = `address: ${gameAccountData.address}`;
    } else {
      this.addressLabel.string = "";
    }
    this.getBalance();
  }

  private async getBalance() {
    if (StringUtil.isEmpty(gameAccountData.address)) {
      return Promise.resolve();
    }

    const balance = await walletData.provider.getBalance(
      gameAccountData.address
    );
    this.balance = walletData.ethers.utils.formatEther(balance).toString();
  }

  @AutoLockedAsync
  private async onWithdraw() {
    this.onClose();
    try {
      Toast.showLoading("Withdrawing...");
      await gameAccountData.withdraw();
      Toast.closeLoading();
      Toast.showMessage(`Withdraw success!`);
    } catch (e) {
      Toast.closeLoading();
      console.log(e);
      Toast.showMessage("Withdraw failed.");
    }
  }

  private onClose() {
    ArcadeWithdrawPopUp.closePopUp();
  }
}

registerLayout(ArcadeWithdrawPopUp);

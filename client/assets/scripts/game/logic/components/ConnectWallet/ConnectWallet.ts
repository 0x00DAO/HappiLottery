import { Label, _decorator } from "cc";
import { OnEvent } from "../../../core/event/decorators/OnEventDecorator";
import { GameObject } from "../../../core/game/GameObject";
import { AutoLockedAsync } from "../../../core/model/DataDecorators";
import { StringUtil } from "../../../core/utils/StringUtil";
import { walletData } from "../../data/WalletData";
import { GameEventWalletAccountChanged } from "../../events/GameEventWalletAccountChanged";
import { GameEventWalletDisconnect } from "../../events/GameEventWalletDisconnect";
import { Toast } from "../Toast/Toast";
import { NETWORK_NAME } from "../../../const/ContractConst";
const { menu, ccclass, property } = _decorator;

@ccclass("ConnectWallet")
@menu("game/logic/components/ConnectWallet")
export class ConnectWallet extends GameObject {
  @property(Label)
  private txtLabel: Label = null!;

  private set txt(value: string) {
    let str = "connect wallet";
    if (!StringUtil.isEmpty(value)) {
      str = `${value.substring(0, 4)}...${value.substring(
        value.length - 4,
        value.length
      )}`;
    }
    this.txtLabel.string = str;
  }

  load() {
    this.txt = walletData.address;
  }

  @AutoLockedAsync
  private async onConnectWallet() {
    const isChainValid = await walletData.isChainValid();
    if (!isChainValid) {
      Toast.showMessage(`Please switch to the ${NETWORK_NAME} network`);
      return Promise.resolve();
    }
    if (!StringUtil.isEmpty(walletData.address)) {
      Toast.showMessage("Wallet already connected");
      return Promise.resolve();
    }
    try {
      await walletData.connectWallet();
      this.txt = walletData.address;
    } catch (e) {
      Toast.showMessage("Connect wallet failed");
    }
  }

  @OnEvent(GameEventWalletDisconnect.eventAsync)
  private onDisconnect() {
    this.txt = "";
  }

  @OnEvent(GameEventWalletAccountChanged.eventAsync)
  private onAccountChanged() {
    this.txt = walletData.address;
  }
}

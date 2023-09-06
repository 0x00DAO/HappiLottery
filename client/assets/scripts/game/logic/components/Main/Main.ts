import { _decorator, assert, Label, Node } from "cc";
import { gameData } from "../../data/GameData";
import { LayoutCom } from "../../layout/LayoutCom";
import { registerLayout } from "../GameUI";
import { GameMap } from "./GameMap";
import { VERSION } from "../../const/Game";
const { menu, ccclass, property } = _decorator;

@ccclass("Main")
@menu("game/logic/components/Main")
export class Main extends LayoutCom {
  static prefabName(): string {
    return "Main";
  }

  @property(Node)
  private mapNode: Node = null!;

  @property(Label)
  private versionLabel: Label = null!;

  async load() {
    this.versionLabel.string = `v${VERSION.version}`;

    const map = await GameMap.createAsync();
    assert(map, "game map resource is null");
    gameData.setGameMap(map);
    this.mapNode.addChild(map.node);
  }
}

registerLayout(Main);

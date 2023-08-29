import { Node, UITransform, _decorator, math, screen } from 'cc';
import { GameObject } from '../game/GameObject';
const { menu, ccclass } = _decorator;

@ccclass('ContentAdapter')
@menu('game/core/layout/ContentAdapter')
export class ContentAdapter extends GameObject {
  protected load() {
    this.updateNodeTransformSize(this.node);
  }

  public updateNodeTransformSize(node: Node) {
    const transform: UITransform = node.getComponent(UITransform)!;
    let srcScaleForShowAll = Math.min(
      screen.windowSize.width / transform.contentSize.width,
      screen.windowSize.height / transform.contentSize.height
    );
    let realWidth = transform.contentSize.width * srcScaleForShowAll;
    let realHeight = transform.contentSize.height * srcScaleForShowAll;

    transform.contentSize = math.size(
      transform.contentSize.width * (screen.windowSize.width / realWidth),
      transform.contentSize.height * (screen.windowSize.height / realHeight)
    );
  }
}

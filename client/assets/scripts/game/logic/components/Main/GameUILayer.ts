import { _decorator } from 'cc';
import { GameObject } from '../../../core/game/GameObject';
const { menu, ccclass } = _decorator;

@ccclass('GameUILayer')
@menu('game/logic/components/Main/GameUILayer')
export class GameUILayer extends GameObject {
  static prefabName(): string {
    return 'GameUILayer';
  }
}

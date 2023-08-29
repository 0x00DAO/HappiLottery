import { _decorator, assert, Node } from 'cc';
import { gameData } from '../../data/GameData';
import { LayoutCom } from '../../layout/LayoutCom';
import { registerLayout } from '../GameUI';
import { GameMap } from './GameMap';
const { menu, ccclass, property } = _decorator;

@ccclass('Main')
@menu('game/logic/components/Main')
export class Main extends LayoutCom {
    static prefabName(): string {
        return 'Main';
    }

    @property(Node)
    private mapNode: Node = null!;

    async load() {
        const map = await GameMap.createAsync();
        assert(map, 'game map resource is null');
        gameData.setGameMap(map);
        this.mapNode.addChild(map.node);
    }
}

registerLayout(Main);

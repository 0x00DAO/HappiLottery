import { _decorator, Node } from 'cc';
import { MAX_PIECES_PER_PLAYER } from '../../../const/GameConst';
import { GameObject } from '../../../core/game/GameObject';
import { gameData } from '../../data/GameData';
import { AirPlane } from '../AirPlane/AirPlane';
const { menu, ccclass } = _decorator;

@ccclass('AirPort')
@menu('game/logic/components/AirPort')
export class AirPort extends GameObject {
    static findParkingPortByAirPlane(plane: AirPlane): Node | null {
        const airportComponent = gameData.gameMap.getComponentInChildren(AirPort)!;
        if (!airportComponent) return null;
        const airPortName = `airport_${plane.plane}`;
        const airport = airportComponent.node.getChildByName(airPortName);
        if (!airport) return null;
        for (let i = 0; i < MAX_PIECES_PER_PLAYER; i++) {
            const node = airport.getChildByName(`parking_port_${i}`);
            if (!node) continue;
            if (node.children.length > 0) continue;
            return node;
        }
        return null;
    }

    public static clearAllAirports() {
        const airportComponent = gameData.gameMap.getComponentInChildren(AirPort)!;
        if (!airportComponent) return null;
        for (let port = 0; port < 4; port++) {
            const airPortName = `airport_${port}`;
            const airport = airportComponent.node.getChildByName(airPortName);
            if (!airport) return null;
            for (let i = 0; i < MAX_PIECES_PER_PLAYER; i++) {
                const node = airport.getChildByName(`parking_port_${i}`);
                if (!node) continue;
                node.removeAllChildren();
            }
        }
    }
}

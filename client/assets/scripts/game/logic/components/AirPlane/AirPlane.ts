import { Node, Sprite, _decorator, math } from 'cc';
import { AirPlaneType, Directions, FLY_TO_AIRPORT } from '../../../const/GameConst';
import { GameObject } from '../../../core/game/GameObject';
import { ViewUtil } from '../../../core/utils/ViewUtil';
import { gameData } from '../../data/GameData';
import { Prefabs } from '../../enum/Prefabs';
import { Textures } from '../../enum/Textures';
import { AirPort } from '../AirPort/AirPort';
const { menu, ccclass, property } = _decorator;

@ccclass('AirPlane')
@menu('game/logic/components/AirPlane')
export class AirPlane extends GameObject {
    static create(planeType: AirPlaneType = AirPlaneType.Red): AirPlane {
        const node = ViewUtil.createPrefabNode(Prefabs.AirPlane);
        const airplane = node.getComponent(AirPlane)!;
        airplane.plane = planeType;
        // @ts-ignore
        airplane.direction = planeType;
        return airplane;
    }

    static async createAsync(): Promise<AirPlane | null> {
        const node = await ViewUtil.createPrefabAsync(Prefabs.AirPlane);
        if (!node) return null;
        return node.getComponent(AirPlane)!;
    }

    @property(Sprite)
    private planeSp: Sprite = null!;

    private _plane: AirPlaneType = AirPlaneType.Red;
    private _direction: Directions = Directions.Right;

    public get plane(): AirPlaneType {
        return this._plane;
    }

    public set plane(value: AirPlaneType) {
        this._plane = value;
        const path = `airplane_${value}`;

        ViewUtil.setTexture(this.planeSp, Textures.UI_GAME_MAP, path);
    }

    public set direction(value: Directions) {
        this._direction = value;
        if (value === Directions.Left) {
            this.planeSp.node.angle = 180;
        } else if (value === Directions.Top) {
            this.planeSp.node.angle = 90;
        } else if (value === Directions.Bottom) {
            this.planeSp.node.angle = -90;
        } else {
            this.planeSp.node.angle = 0;
        }
    }

    public get direction(): Directions {
        return this._direction;
    }

    private turnDirection(index: number) {
        if (this.plane === AirPlaneType.Red) {
            if (index === 0) this.direction = Directions.Right;
            else if (index >= 2 && index < 6) this.direction = Directions.Top;
            else if (index >= 6 && index < 12) this.direction = Directions.Right;
            else if (index >= 12 && index < 17) this.direction = Directions.Bottom;
            else if (index >= 17 && index < 19) this.direction = Directions.Right;
            else if (index >= 19 && index < 25) this.direction = Directions.Bottom;
            else if (index >= 25 && index < 28) this.direction = Directions.Left;
            else if (index >= 28 && index < 32) this.direction = Directions.Bottom;
            else if (index >= 32 && index < 38) this.direction = Directions.Left;
            else if (index >= 38 && index < 41) this.direction = Directions.Top;
            else if (index >= 41 && index < 45) this.direction = Directions.Left;
            else if (index >= 45 && index < 48) this.direction = Directions.Top;
            else if (index >= 48) this.direction = Directions.Right;
        } else if (this.plane === AirPlaneType.Yellow) {
            if (index >= 13 && index < 15) this.direction = Directions.Bottom;
            else if (index >= 15 && index < 19) this.direction = Directions.Right;
            else if (index >= 19 && index < 25) this.direction = Directions.Bottom;
            else if (index >= 25 && index < 28) this.direction = Directions.Left;
            else if (index >= 28 && index < 32) this.direction = Directions.Bottom;
            else if (index >= 32 && index < 38) this.direction = Directions.Left;
            else if (index >= 38 && index < 41) this.direction = Directions.Top;
            else if (index >= 41 && index < 45) this.direction = Directions.Left;
            else if (index >= 45 && index < 51) this.direction = Directions.Top;
            else if (index === 51 || (index >= 0 && index < 2)) this.direction = Directions.Right;
            else if (index >= 2 && index < 6) this.direction = Directions.Top;
            else if (index >= 6 && index < 9) this.direction = Directions.Right;
            else if (index === 9 || index > 51) this.direction = Directions.Bottom;
        } else if (this.plane === AirPlaneType.Blue) {
            if (index >= 26 && index < 28) this.direction = Directions.Left;
            else if (index >= 28 && index < 32) this.direction = Directions.Bottom;
            else if (index >= 32 && index < 38) this.direction = Directions.Left;
            else if (index >= 38 && index < 41) this.direction = Directions.Top;
            else if (index >= 41 && index < 45) this.direction = Directions.Left;
            else if (index >= 45 && index < 51) this.direction = Directions.Top;
            else if (index === 51 || (index >= 0 && index < 2)) this.direction = Directions.Right;
            else if (index >= 2 && index < 6) this.direction = Directions.Top;
            else if (index >= 6 && index < 12) this.direction = Directions.Right;
            else if (index >= 12 && index < 15) this.direction = Directions.Bottom;
            else if (index >= 15 && index < 19) this.direction = Directions.Right;
            else if (index >= 19 && index < 22) this.direction = Directions.Bottom;
            else if (index === 22 || index > 51) this.direction = Directions.Left;
        }
        if (this.plane === AirPlaneType.Green) {
            if (index >= 39 && index < 41) this.direction = Directions.Top;
            else if (index >= 41 && index < 45) this.direction = Directions.Left;
            else if (index >= 45 && index < 51) this.direction = Directions.Top;
            else if (index === 51 || (index >= 0 && index < 2)) this.direction = Directions.Right;
            else if (index >= 2 && index < 6) this.direction = Directions.Top;
            else if (index >= 6 && index < 12) this.direction = Directions.Right;
            else if (index >= 12 && index < 15) this.direction = Directions.Bottom;
            else if (index >= 15 && index < 19) this.direction = Directions.Right;
            else if (index >= 19 && index < 25) this.direction = Directions.Bottom;
            else if (index >= 25 && index < 28) this.direction = Directions.Left;
            else if (index >= 28 && index < 32) this.direction = Directions.Bottom;
            else if (index >= 32 && index < 35) this.direction = Directions.Left;
            else if (index === 35 || index > 51) this.direction = Directions.Top;
        }
    }

    private _flyTo(index: number) {
        const position = gameData.gameMap.getPositionByIndex(index);
        if (!position) {
            return;
        }
        if (this.node.parent !== gameData.gameMap.sky) {
            if (this.node.parent) {
                this.node.parent.removeChild(this.node);
            }
            gameData.gameMap.sky.addChild(this.node);
        }
        this.turnDirection(index);
        this.node.setPosition(position);
    }

    public getTargetPoint(): number {
        let targetPoint = -1;
        if (this.plane === AirPlaneType.Red) {
            targetPoint = 52;
        } else if (this.plane === AirPlaneType.Yellow) {
            targetPoint = 58;
        } else if (this.plane === AirPlaneType.Blue) {
            targetPoint = 64;
        } else if (this.plane === AirPlaneType.Green) {
            targetPoint = 70;
        }
        return targetPoint;
    }

    public landToAirPort(airport: Node) {
        if (this.plane === AirPlaneType.Red) {
            this.direction = Directions.Bottom;
        } else if (this.plane === AirPlaneType.Yellow) {
            this.direction = Directions.Left;
        } else if (this.plane === AirPlaneType.Blue) {
            this.direction = Directions.Top;
        } else if (this.plane === AirPlaneType.Green) {
            this.direction = Directions.Right;
        }

        if (this.node.parent !== airport) {
            if (this.node.parent) {
                this.node.parent.removeChild(this.node);
            }
            this.node.position = math.v3(0, 0);
            airport.addChild(this.node);
        }
    }

    public flyTo(index: number) {
        if (index === FLY_TO_AIRPORT) {
            const airport = AirPort.findParkingPortByAirPlane(this);
            airport && this.landToAirPort(airport);
        } else {
            this._flyTo(index);
        }
    }

    // TODO with animation
    public fly(from: number, to: number) {
        this.flyTo(to);
    }
}

import { registerMediaResources } from './Resources';

export enum Prefabs {
    GameMap = 'common/prefab/gamemap',
    AirPlane = 'common/prefab/airplane',
}
registerMediaResources(Prefabs);

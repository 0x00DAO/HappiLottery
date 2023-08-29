import {
    Node,
    Prefab,
    Sprite,
    SpriteAtlas,
    SpriteFrame,
    UITransform,
    Vec3,
    assetManager,
    instantiate,
} from 'cc';
import { resLoader } from '../loader/ResLoader';

export class ViewUtil {
    public static createPrefabNode(name: string): Node {
        let p = resLoader.get(name, Prefab)!;
        return instantiate(p);
    }

    public static createPrefabAsync(name: string): Promise<Node | null> {
        return new Promise((resolve, reject) => {
            assetManager.resources!.load(name, Prefab, (err, data) => {
                if (!err) resolve(instantiate(data));

                resolve(null);
            });
        });
    }

    public static calculateASpaceToBSpacePos(a: Node, b: Node, aPos?: Vec3): Vec3 {
        const world: Vec3 = a
            .parent!.getComponent(UITransform)!
            .convertToWorldSpaceAR(aPos ?? a.position);
        const space: Vec3 = b.getComponent(UITransform)!.convertToNodeSpaceAR(world);
        return space;
    }

    static setTexture(sprite: Sprite, path: string, texture: string, callback?: Function) {
        const name = `${path}/${texture}`;
        const spFrame: SpriteFrame | null = resLoader.get(name, SpriteFrame);

        const __setFrame = (frame: SpriteFrame) => {
            if (sprite) {
                sprite.spriteFrame = frame;
            }
            callback && callback(sprite);
        };

        if (!spFrame) {
            resLoader.load(path, SpriteAtlas, (err: any, res: any) => {
                if (err) {
                    return;
                }
                __setFrame(res.getSpriteFrame(texture));
            });
        } else {
            __setFrame(spFrame);
        }
    }

    static findNodeInChildren(node: Node, name: string): Node | null {
        if (node.name === name) {
            return node;
        }

        const children = node.children;
        for (let i = 0; i < children.length; i++) {
            const result = this.findNodeInChildren(children[i], name);
            if (result) {
                return result;
            }
        }

        return null;
    }
}

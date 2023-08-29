import { Node, resources } from 'cc';
import { GameObject } from '../../core/game/GameObject';
import { UICallbacks } from '../../core/layout/Defines';
import { ILayout } from '../../core/layout/ILayout';
import { LayerType, UIConfig } from '../../core/layout/LayerManager';
import { CompleteCallback, ProgressCallback } from '../../core/loader/ResLoader';
import { gameManager } from '../../core/manager/GameManager';
import { layouts } from '../components/GameUI';

export abstract class LayoutCom extends GameObject implements ILayout {
    static bundle(): string {
        //@ts-ignore
        return resources.config.name;
    }

    static layoutPath(): string {
        return `common/prefab/${this.prefabName().toLowerCase()}`;
    }

    static layer(): LayerType {
        return LayerType.UI;
    }

    public static layoutUUID(): number {
        return layouts.findIndex((layout: any) => layout.prefabName() === this.prefabName());
    }

    public static get UIConfig(): UIConfig {
        let config: UIConfig = {
            layer: this.layer(),
            prefab: this.layoutPath(),
        };
        if (this.bundle()) {
            config['bundle'] = this.bundle();
        }

        return config;
    }

    /**
     * @param onProgress
     * @param onComplete
     */
    static preload(
        onProgress?: ProgressCallback | null,
        onComplete?: CompleteCallback | null
    ): void {
        gameManager.gui.uiLayer.preload(
            this.layoutPath(),
            { bundle: this.bundle() },
            true,
            onProgress,
            onComplete
        );
    }

    static getNode(): Node | null {
        return gameManager.gui.getByPath(this.layoutPath(), this.layer());
    }

    static getCom<T extends LayoutCom>(): T | null {
        const node: Node | null = this.getNode();
        if (!node) {
            return null;
        }
        const com: any = node.getComponent(this.prefabName());
        if (com) {
            return com as T;
        }
        const canvas: Node | null = node.getChildByName('Canvas');
        return canvas ? (canvas.getComponent(this.prefabName()) as T) : null;
    }

    static open(callbacks?: UICallbacks, uiArgs: any = null): void {
        if (!callbacks) {
            callbacks = { onBeforeRemove: this.actionOnRemove };
        } else if (callbacks && !callbacks.onBeforeRemove) {
            callbacks.onBeforeRemove = this.actionOnRemove;
        } else if (callbacks && callbacks.onBeforeRemove) {
            const onBeforeRemoveOld: any = callbacks.onBeforeRemove;
            callbacks.onBeforeRemove = (node: Node, next: Function) =>
                onBeforeRemoveOld(node, () => this.actionOnRemove(node, next));
        }

        gameManager.gui.open(this.layoutUUID(), uiArgs, callbacks);
    }

    static remove(isDestroy: boolean = true): void {
        gameManager.gui.remove(this.layoutUUID(), isDestroy);
    }

    protected static actionOnRemove(node: Node, next?: Function) {
        next && next();
    }

    protected get titleNode(): Node | null {
        return null;
    }
}

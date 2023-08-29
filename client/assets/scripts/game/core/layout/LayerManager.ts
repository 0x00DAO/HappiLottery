import { Node, warn, Widget } from 'cc';
import { UICallbacks } from './Defines';
import { DelegateComponent } from './DelegateComponent';
import { LayerDialog } from './LayerDialog';
import { LayerPopUp } from './LayerPopup';
import { LayerUI } from './LayerUI';
import { UIMap } from './UIMap';

export enum LayerType {
    UI = 'LayerUI',
    PopUp = 'LayerPopUp',
    Dialog = 'LayerDialog',
    Alert = 'LayerAlert',
    ForeGame = 'LayerForeGame',
}

export interface UIConfig {
    bundle?: string;
    layer: LayerType;
    prefab: string;
}

export class LayerManager {
    public game!: Node;
    public uiMap!: UIMap;

    private ui!: LayerUI;
    private foreGame!: LayerUI;
    private popup!: LayerPopUp;
    private dialog!: LayerDialog;
    private alert!: LayerDialog;

    private configs: { [key: number]: UIConfig } = {};

    private _root: Node = null!;

    public get root(): Readonly<Node> {
        return this._root;
    }

    public get uiLayer(): LayerUI {
        return this.ui;
    }

    public get popupLayer(): LayerPopUp {
        return this.popup;
    }

    public init(configs: { [key: number]: UIConfig }): void {
        this.configs = configs;
    }

    public setConfig(uiId: number, config: UIConfig): void {
        this.configs[uiId] = config;
    }

    public setUIMap(data: any) {
        if (this.uiMap === null) {
            this.uiMap = new UIMap();
        }
        this.uiMap.init(this, data);
    }

    public open(uiId: number, uiArgs: any = null, callbacks?: UICallbacks): void {
        var config = this.configs[uiId];
        if (config === null) {
            warn(`open layer [${uiId}] failed`);
            return;
        }

        switch (config.layer) {
            case LayerType.UI:
                this.ui.add(config.prefab, uiArgs, callbacks);
                break;
            case LayerType.ForeGame:
                this.foreGame.add(config.prefab, uiArgs, callbacks);
                break;
            case LayerType.PopUp:
                this.popup.add(config.prefab, uiArgs, callbacks);
                break;
            case LayerType.Dialog:
                this.dialog.add(config.prefab, uiArgs, callbacks);
                break;
            case LayerType.Alert:
                this.alert.add(config.prefab, uiArgs, callbacks);
                break;
        }
    }

    public has(uiId: number) {
        var config = this.configs[uiId];
        if (config === null) {
            warn(`open layer [${uiId}] failed`);
            return;
        }

        var result = false;
        switch (config.layer) {
            case LayerType.UI:
                result = this.ui.has(config.prefab);
                break;
            case LayerType.ForeGame:
                result = this.foreGame.has(config.prefab);
                break;
            case LayerType.PopUp:
                result = this.popup.has(config.prefab);
                break;
            case LayerType.Dialog:
                result = this.dialog.has(config.prefab);
                break;
            case LayerType.Alert:
                result = this.alert.has(config.prefab);
                break;
        }
        return result;
    }

    public remove(uiId: number, isDestroy = true) {
        var config = this.configs[uiId];
        if (config === null) {
            warn(`delete layer [${uiId}] failed`);
            return;
        }

        switch (config.layer) {
            case LayerType.UI:
                this.ui.remove(config.prefab, isDestroy);
                break;
            case LayerType.ForeGame:
                this.foreGame.remove(config.prefab, isDestroy);
                break;
            case LayerType.PopUp:
                this.popup.remove(config.prefab, isDestroy);
                break;
            case LayerType.Dialog:
                this.dialog.remove(config.prefab, isDestroy);
                break;
            case LayerType.Alert:
                this.alert.remove(config.prefab, isDestroy);
                break;
        }
    }

    public getByPath(path: string, type: LayerType = LayerType.UI): Node | null {
        let node: Node | null = null;
        switch (type) {
            case LayerType.UI:
                node = this.ui.getByUuid(this.ui.getUuid(path));
                break;
            case LayerType.ForeGame:
                node = this.foreGame.getByUuid(this.ui.getUuid(path));
                break;
            case LayerType.PopUp:
                node = this.popup.getByUuid(this.popup.getUuid(path));
                break;
            case LayerType.Dialog:
                node = this.dialog.getByUuid(this.dialog.getUuid(path));
                break;
            case LayerType.Alert:
                node = this.alert.getByUuid(this.alert.getUuid(path));
                break;
            default:
                break;
        }
        return node;
    }

    public removeByNode(node: Node, isDestroy: boolean = false) {
        if (node instanceof Node) {
            let comp = node.getComponent(DelegateComponent);
            if (comp && comp.viewParams) {
                (node.parent as LayerUI).removeByUuid(comp.viewParams.uuid, isDestroy);
            } else {
                warn(`the node removed was not managed by layerManager`);
                node.destroy();
            }
            return;
        }
    }

    public clear(isDestroy: boolean = false) {
        this.ui.clear(isDestroy);
        this.clearAllPopUp(isDestroy);
        this.dialog.clear(isDestroy);
        this.alert.clear(isDestroy);
        this.foreGame.clear(isDestroy);
    }

    public constructor(root: Node) {
        this._root = root;
        this.game = new Node('LayerGame');
        var widget: Widget = this.game.addComponent(Widget);
        widget.isAlignLeft = widget.isAlignRight = widget.isAlignTop = widget.isAlignBottom = true;
        widget.left = widget.right = widget.top = widget.bottom = 0;
        widget.alignMode = 2;
        widget.enabled = true;

        this.ui = new LayerUI(LayerType.UI);
        this.foreGame = new LayerUI(LayerType.ForeGame);
        this.popup = new LayerPopUp(LayerType.PopUp);
        this.dialog = new LayerDialog(LayerType.Dialog);
        this.alert = new LayerDialog(LayerType.Alert);

        root.addChild(this.game);
        root.addChild(this.ui);
        root.addChild(this.foreGame);
        root.addChild(this.popup);
        root.addChild(this.dialog);
        root.addChild(this.alert);
    }

    public clearAllPopUp(isDestroy: boolean = true) {
        this.popup.clear(isDestroy);
    }
}

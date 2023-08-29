import {
  AssetManager,
  assetManager,
  error,
  instantiate,
  isValid,
  Node,
  Prefab,
  warn,
  Widget,
} from 'cc';
import {
  CompleteCallback,
  ProgressCallback,
  resLoader,
} from '../loader/ResLoader';
import { UICallbacks, ViewParams } from './Defines';
import { DelegateComponent } from './DelegateComponent';

export class LayerUI extends Node {
  protected ui_nodes: Map<string, ViewParams> = new Map<string, ViewParams>();

  constructor(name: string) {
    super(name);

    var widget: Widget = this.addComponent(Widget);
    widget.isAlignLeft =
      widget.isAlignRight =
      widget.isAlignTop =
      widget.isAlignBottom =
        true;
    widget.left = widget.right = widget.top = widget.bottom = 0;
    widget.alignMode = 2;
    widget.enabled = true;
  }

  public getUuid(prefabPath: string): string {
    var uuid = `${this.name}_${prefabPath}`;
    return uuid.replace(/\//g, '_');
  }

  add(prefabPath: string, params?: any, callbacks?: UICallbacks): string {
    var uuid = this.getUuid(prefabPath);
    var viewParams = this.ui_nodes.get(uuid);
    if (viewParams && viewParams.valid) {
      warn(`prefab [${prefabPath}] loaded duplicated: ${uuid}`);
      return '';
    }

    if (!viewParams) {
      viewParams = new ViewParams();
      viewParams.uuid = uuid;
      viewParams.prefabPath = prefabPath;
      viewParams.params = params || {};
      viewParams.callbacks = callbacks || {};
      viewParams.valid = true;
      this.ui_nodes.set(viewParams.uuid, viewParams);
    } else if (viewParams.preloaded) {
      viewParams.valid = true;
      viewParams.params = params || {};
      viewParams.callbacks = callbacks || {};
    }

    this.load(viewParams);

    return uuid;
  }

  protected load(viewParams: ViewParams) {
    var vp: ViewParams = this.ui_nodes.get(viewParams.uuid)!;
    if (vp && vp.node) {
      this.createNode(null, vp);
    } else {
      resLoader.load(
        viewParams.prefabPath,
        (err: Error | null, res: Prefab) => {
          if (err) {
            error(err);
          }

          let childNode: Node = instantiate(res);
          viewParams.node = childNode;

          let comp: DelegateComponent =
            childNode.addComponent(DelegateComponent);
          comp.viewParams = viewParams;

          this.createNode(res, viewParams);
        }
      );
    }
  }

  /**
   * @param prefab
   * @param viewParams
   */
  protected createNode(prefab: Prefab | null, viewParams: ViewParams) {
    viewParams.valid = true;
    let childNode: Node | null = viewParams!.node!;
    let comp: DelegateComponent | null =
      childNode.getComponent(DelegateComponent);
    childNode.parent = this;
    comp!.add();

    return childNode;
  }

  public preload(
    prefabPath: string,
    options?: any,
    loaded?: boolean,
    onProgress?: ProgressCallback | null,
    onComplete?: CompleteCallback | null
  ) {
    const uuid = this.getUuid(prefabPath);
    let viewParams = this.ui_nodes.get(uuid);

    const loadFunc: Function = loaded
      ? assetManager.loadAny
      : assetManager.preloadAny;

    if (viewParams && viewParams.node) {
      error(`component [${prefabPath}] loaded complete`);
      return;
    }

    if (viewParams && viewParams.valid) {
      error(`component [${prefabPath}] loaded duplicated`);
      return;
    }

    if (!viewParams) {
      viewParams = new ViewParams();
      viewParams.uuid = uuid;
      viewParams.prefabPath = prefabPath;
      viewParams.preloaded = true;
      viewParams.valid = false;
      this.ui_nodes.set(viewParams.uuid, viewParams);
    }

    loadFunc(
      { path: viewParams.prefabPath },
      options,
      (finished: number, total: number, item: AssetManager.RequestItem) =>
        onProgress && onProgress(finished, total, item),
      (err: Error | null, res: any) => onComplete && onComplete(err, res)
    );
  }

  removeByUuid(uuid: string, isDestroy: boolean): void {
    var viewParams = this.ui_nodes.get(uuid);
    if (viewParams) {
      if (isDestroy) this.ui_nodes.delete(viewParams.uuid);

      var childNode = viewParams.node;
      var comp = childNode?.getComponent(DelegateComponent)!;
      comp.remove(isDestroy);
    }
  }

  /**
   * @param prefabPath
   */
  remove(prefabPath: string, isDestroy: boolean): void {
    let children = this.__nodes();
    for (let i = 0; i < children.length; i++) {
      let viewParams = children[i].viewParams!;
      if (viewParams.prefabPath === prefabPath) {
        if (isDestroy) this.ui_nodes.delete(viewParams.uuid);

        this.ui_nodes.delete(viewParams.uuid);
        children[i].remove(isDestroy);
        viewParams.valid = false;
      }
    }
  }

  /**
   * @param uuid
   */
  getByUuid(uuid: string): Node | null {
    let children = this.__nodes();
    for (let comp of children) {
      if (comp.viewParams && comp.viewParams.uuid === uuid) {
        return comp.node;
      }
    }
    return null;
  }

  /**
   * @param prefabPath
   */
  get(prefabPath: string): Array<Node> {
    let arr: Array<Node> = [];
    let children = this.__nodes();
    for (let comp of children) {
      if (comp.viewParams!.prefabPath === prefabPath) {
        arr.push(comp.node);
      }
    }
    return arr;
  }

  has(prefabPathOrUUID: string): boolean {
    let children = this.__nodes();
    for (let comp of children) {
      if (
        comp.viewParams!.uuid === prefabPathOrUUID ||
        comp.viewParams!.prefabPath === prefabPathOrUUID
      ) {
        return true;
      }
    }
    return false;
  }

  find(prefabPathReg: RegExp): Node[] {
    let arr: Node[] = [];
    let children = this.__nodes();
    for (let comp of children) {
      if (prefabPathReg.test(comp.viewParams!.prefabPath)) {
        arr.push(comp.node);
      }
    }
    return arr;
  }

  protected __nodes(): Array<DelegateComponent> {
    let result: Array<DelegateComponent> = [];
    let children = this.children;
    for (let i = 0; i < children.length; i++) {
      let comp = children[i].getComponent(DelegateComponent);
      if (comp && comp.viewParams && comp.viewParams.valid && isValid(comp)) {
        result.push(comp);
      }
    }
    return result;
  }

  size(): number {
    return this.children.length;
  }

  clear(isDestroy: boolean): void {
    this.ui_nodes.forEach((value: ViewParams, key: string) => {
      this.removeByUuid(value.uuid, isDestroy);
      value.valid = false;
    });
    this.ui_nodes.clear();
  }
}

import { BlockInputEvents, Layers } from 'cc';
import { PopViewParams } from './Defines';
import { LayerUI } from './LayerUI';

export class LayerPopUp extends LayerUI {
  private block!: BlockInputEvents;
  private stack: Map<string, string> = new Map();

  public get isCleared(): boolean {
    return this.stack.size === 0;
  }

  constructor(name: string) {
    super(name);
    this.init();
  }

  private init() {
    this.layer = Layers.Enum.UI_2D;
    this.block = this.addComponent(BlockInputEvents);
    this.block.enabled = false;
  }

  add(prefabPath: string, params: any, popParams?: PopViewParams): string {
    this.stack.set(prefabPath, prefabPath);
    this.block.enabled = true;
    return super.add(prefabPath, params, popParams);
  }

  remove(prefabPath: string, isDestroy: boolean): void {
    super.remove(prefabPath, isDestroy);
    this.block.enabled = false;
    if (this.stack.has(prefabPath)) {
      this.stack.delete(prefabPath);
    }
  }

  removeByUuid(prefabPath: string, isDestroy: boolean): void {
    super.removeByUuid(prefabPath, isDestroy);
    this.block.enabled = false;
    if (this.stack.has(prefabPath)) {
      this.stack.delete(prefabPath);
    }
  }

  clear(isDestroy: boolean) {
    super.clear(isDestroy);
    this.block.enabled = false;
    this.stack.clear();
  }
}

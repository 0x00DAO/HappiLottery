import { Node } from 'cc';

/**
 * @param Layout
 * @returns
 */
export function onAddedPromise<T extends any>(Layout: any, params?: any) {
  return new Promise<T>((resolve, reject) => {
    Layout.open({
      onAdded(node: Node) {
        const component = node.getComponent(Layout.prefabName())! as T;
        resolve(component);
      },
    });
  });
}

export function onRemovedPromise(Layout: any) {
  return new Promise<void>((resolve, reject) => {
    Layout.open({
      onRemoved() {
        resolve();
      },
    });
  });
}

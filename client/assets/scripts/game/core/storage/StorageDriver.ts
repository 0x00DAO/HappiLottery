import { error } from 'cc';
import { GameObject } from '../game/GameObject';
import { gameManager } from '../manager/GameManager';

export class StorageDriver extends GameObject {
  protected _storageData: any = {};

  private _cacheVersion: string = 'unknown';

  public set cacheVersion(value: string) {
    this._cacheVersion = value;
  }

  constructor(...args: any[]) {
    super(...args);
    this.eventsOn();
  }

  protected error() {
    error('class does not implement!!');
  }

  protected formatStorageKey(key: string) {
    return `airvoyage:${gameManager.gameId}:${this._cacheVersion}:` + key;
  }

  /**
   *
   * @param key
   * @param defaultValue
   * @returns {Promise<T>}
   */
  getItem<T>(key: string, defaultValue: T | null = null): Promise<T> {
    return new Promise((resolve, reject) => {
      this.error();
      reject();
    });
  }

  /**
   *
   * @param key
   * @param value
   * @returns {Promise<T>}
   */
  setItem<T>(key: string, value: T): Promise<T> {
    return new Promise((resolve, reject) => {
      this.error();
      reject();
    });
  }

  /**
   *
   * @param key
   * @returns {Promise<any>}
   */
  removeItem(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.error();
      reject();
    });
  }

  getItemSync<T>(key: string, defaultValue: T | null = null): T {
    this.error();
    //@ts-ignore
    return undefined;
  }

  setItemSync<T>(key: string, value: T): void {
    this.error();
  }

  removeItemSync(key: string): void {
    this.error();
  }

  public init(): StorageDriver {
    return this;
  }

  public save() {}

  public loadFromCache() {}

  public loadFromRemote(callback?: Function) {
    callback && callback(true);
  }
}

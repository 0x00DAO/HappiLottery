import { Singleton } from '../game/Singleton';
import { StorageDefault } from './StorageDefault';
import { StorageDriver } from './StorageDriver';

export class Storage extends Singleton {
  private _driver: StorageDriver | null = null;

  public get driver(): StorageDriver {
    return this._driver;
  }

  public initDriver(cacheVersion: string) {
    if (this._driver) {
      return;
    }
    this._driver = new StorageDefault();
    this._driver.cacheVersion = cacheVersion;
    this._driver.init();
  }
}

export const storage: Readonly<Storage> = Storage.getInstance();

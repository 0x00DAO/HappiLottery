import { StorageDriver } from './StorageDriver';
import { StorageDriverLocalStorage } from './StorageDriverLocalStorage';

export class StorageDefault extends StorageDriverLocalStorage {
  private cacheKey(): string {
    return 'DB';
  }

  public getItemSync<T>(
    key: string,
    defaultValue: T | null = null,
    singleKeyStore: boolean = false
  ): T {
    if (singleKeyStore) {
      return super.getItemSync<T>(key, defaultValue);
    }

    if (this._storageData[key] !== undefined) {
      return this._storageData[key];
    }
    // @ts-ignore
    return defaultValue;
  }

  public setItemSync<T>(
    key: string,
    value: T,
    singleKeyStore: boolean = false
  ): void {
    if (!singleKeyStore) {
      this._storageData[key] = value;
      super.setItemSync(this.cacheKey(), this._storageData);
    } else {
      super.setItemSync(key, value);
    }

    this.save();
  }

  public removeItemSync(key: string): void {
    if (this._storageData[key] !== undefined) {
      delete this._storageData[key];
      if (!this._storageData) {
        this._storageData = {};
      }
      super.setItemSync(this.cacheKey(), this._storageData);
      this.save();
    }
  }

  public loadFromCache() {
    this._storageData = super.getItemSync(this.cacheKey(), {});
  }

  public loadFromRemote(callback?: Function) {}

  public init(): StorageDriver {
    this.loadFromCache();
    return this;
  }
}

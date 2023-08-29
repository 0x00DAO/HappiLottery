import { sys } from 'cc';
import { StorageDriver } from './StorageDriver';

export class StorageDriverLocalStorage extends StorageDriver {
  /**
   *
   * @param key
   * @param {*} defaultValue
   * @returns {Promise<T>}
   */
  getItem<T>(key: string, defaultValue: T | null = null): Promise<T> {
    return new Promise((resolve, reject) => {
      let value = this.getItemSync(key, defaultValue);
      if (value !== undefined) {
        resolve(value);
      } else {
        //@ts-ignore
        resolve(defaultValue !== undefined ? defaultValue : undefined);
      }
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
      this.setItemSync(key, value);
      resolve(value);
    });
  }

  /**
   *
   * @param key
   * @returns {Promise<T>}
   */
  removeItem(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.removeItemSync(key);
      resolve(key);
    });
  }

  getItemSync<T>(key: string, defaultValue: T | null = null): T {
    let value: string | null = null;
    const formatKey = this.formatStorageKey(key);
    value = sys.localStorage.getItem(formatKey);
    if (value) {
      return this.decodeValue(formatKey, value);
    }
    return defaultValue as T;
  }

  setItemSync<T>(key: string, value: T): void {
    const formatKey = this.formatStorageKey(key);
    sys.localStorage.setItem(formatKey, this.encodeValue(formatKey, value));
  }

  removeItemSync(key: string): void {
    sys.localStorage.removeItem(this.formatStorageKey(key));
  }

  private encodeValue(key: string, value: any): string {
    const v = JSON.stringify(value);
    return v;
  }

  private decodeValue(key: string, value: string): any {
    return JSON.parse(value);
  }
}

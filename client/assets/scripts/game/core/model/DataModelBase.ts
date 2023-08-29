import { js } from 'cc';
import { Singleton } from '../game/Singleton';
import { GameConfigManager } from '../manager/GameConfigManager';
import { gameManager } from '../manager/GameManager';
import { AfterConfigDataLoad, AfterDataLoad, AfterDataSaved } from './DataDecorators';
import { DataView, IDataModel } from './IDataModel';

export abstract class DataModelBase extends Singleton implements IDataModel {
    private _data: DataView = {};
    private _csvData: any = [];

    protected get data(): any {
        return this._data ?? {};
    }

    protected set data(data: any) {
        this._data = data;
    }

    protected get dataCacheKey(): string {
        return '';
    }

    protected get defaultData(): any {
        return null;
    }

    protected get storage(): any {
        if (!gameManager.storage) {
            return null;
        }
        return gameManager.storage.driver;
    }

    @AfterConfigDataLoad
    preload() {
        if (this.dataCacheKey === '') {
            return;
        }
        const defaultData = this.defaultData ?? {};
        const data = this.storage.getItemSync(this.dataCacheKey, defaultData);
        if (data instanceof Object) {
            this.data = JSON.parse(JSON.stringify(data));
        } else {
            this.data = data;
        }
    }

    protected getCsvData<T>(): T[] {
        return this._csvData as T[];
    }

    protected csvFile(): string {
        return '';
    }

    protected setCsvData<T>(data: T[]) {
        if (!data) {
            this._csvData = [];
        } else {
            this._csvData = data;
        }
    }

    protected loadCsv<T>(fileName?: string): T[] {
        fileName = fileName || this.csvFile();
        if (!js.isString(fileName) || fileName === '') {
            return [];
        }
        const game: GameConfigManager = GameConfigManager.getInstance();
        const configs: T[] = game.getConfigFile<T[]>(fileName);
        if (!configs || configs.length === 0) {
            return [];
        }
        return configs;
    }

    protected configLoaded() {
        const data: any = this.loadCsv<any>();
        this.setCsvData(data);
    }

    protected clearData() {}

    protected unSerializeData(): any {
        return this.data;
    }

    @AfterDataLoad
    public async loadData() {
        return await Promise.resolve();
    }

    @AfterDataSaved
    public saveData() {
        if (this.dataCacheKey === '') {
            return;
        }
        if (!this.storage) {
            return;
        }
        let data = this.unSerializeData();
        let cache = this.storage.getItemSync(this.dataCacheKey, null);
        if (data === null && cache === null) {
            return;
        }

        let needCache = true;
        if (data instanceof Object) {
            const jsonObj = JSON.stringify(data);
            if (cache !== null) {
                // needCache = md5(JSON.stringify(cache)) !== md5(jsonObj);
                needCache = true;
            }
            needCache ? (data = JSON.parse(jsonObj)) : null;
        } else {
            if (cache !== null) {
                needCache = cache !== data;
            }
        }
        if (needCache) {
            this.storage.setItemSync(this.dataCacheKey, data);
        }
    }
}

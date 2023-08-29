import { Singleton } from '../game/Singleton';
import { language } from '../i18n/Language';

export class GameConfigManager extends Singleton {
    private _data: any = new Map();

    public setConfigs(config: any) {
        let data = config;
        this._data = Object.freeze(data);
        if (this._data.get('language')) {
            language.setLangData(this._data.get('language'));
        }
    }

    public getConfigFile<T extends any>(key: string): T {
        return this._data.get(key) as T;
    }
}

export interface IDataModel {
    preload(): void;
    loadData(): void;
    saveData(): void;
}

export type DataViewAny = {};

export type DataView = { [key: string]: any };

export enum DataModelEvents {
    DATA_LOADED = 'DataModelEvents.DATA_LOADED',
    CONFIG_DATA_LOAD_COMPLETE = 'DataModelEvents.CONFIG_DATA_LOAD_COMPLETE',
    DATA_SAVED = 'DataModelEvents.DATA_SAVED',
}

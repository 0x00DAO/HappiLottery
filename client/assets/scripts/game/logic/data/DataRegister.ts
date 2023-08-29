import { IDataModel } from '../../core/model/IDataModel';

const DataCache: IDataModel[] = [];

export const registerDataModel = (dataModel: IDataModel) => {
    DataCache.push(dataModel);
};

export const dataModels = DataCache;

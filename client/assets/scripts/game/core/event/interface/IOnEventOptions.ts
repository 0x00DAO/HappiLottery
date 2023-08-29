export interface OnOptions {
    async?: boolean;
    promisify?: boolean;
    nextTick?: boolean;
    objectify?: boolean;
}

export declare type OnEventOptions = OnOptions & {
    prependListener?: boolean;
};

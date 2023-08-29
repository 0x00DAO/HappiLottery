const flatMediaEnum = (enumObj: any): string[] => {
    return Object.keys(enumObj).map((key) => `${enumObj[key]}`);
};

export const MEDIA_RESOURCES: string[] = [];

export const registerMediaResources = (enumObj: any) => {
    MEDIA_RESOURCES.push(...flatMediaEnum(enumObj));
};

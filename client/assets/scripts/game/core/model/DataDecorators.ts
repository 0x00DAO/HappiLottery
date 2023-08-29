import { eventBus } from '../event/EventBus';
import { DataModelEvents } from './IDataModel';

export const AfterDataLoad = (
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
) => {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        await method!.apply(this, args);
        eventBus.emit(DataModelEvents.DATA_LOADED, this);
    };
};

export const AfterDataSaved = (
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
) => {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        method!.apply(this, args);
        eventBus.emit(DataModelEvents.DATA_SAVED, this);
    };
};

export const AutoLockedAsync = (
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
) => {
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        // @ts-ignore
        if (this.lock instanceof Function) {
            // @ts-ignore
            if (!this.isLocked) {
                // @ts-ignore
                this.lock();
                await method!.apply(this, args);
                // @ts-ignore
                this.unlock();
            } else {
                console.log('auto lock async: click too frequently');
            }
        } else {
            await method!.apply(this, args);
        }
    };
};

export const LockWithTime =
    (lockTime: number = 0.5, freqCallback?: Function) =>
    (
        target: any,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
    ) => {
        const method = descriptor.value;
        descriptor.value = function (...args: any[]) {
            // @ts-ignore
            if (this.lockWithTime instanceof Function) {
                // @ts-ignore
                if (this.isLockedWithTime(propertyName, lockTime * 1000)) {
                    freqCallback
                        ? freqCallback()
                        : console.log('lock with time: click too frequently');
                } else {
                    // @ts-ignore
                    this.lockWithTime(propertyName);
                    method!.apply(this, args);
                }
            } else {
                method!.apply(this, args);
            }
        };
    };

export const LockWithEvent =
    (event: string, defaultLockTime: number = 5, freqCallback?: Function) =>
    (
        target: any,
        propertyName: string,
        descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
    ) => {
        const method = descriptor.value;
        descriptor.value = function (...args: any[]) {
            // @ts-ignore
            let isLockedWithEvent = this.isLockedWithEvent(event, propertyName);
            if (isLockedWithEvent) {
                // @ts-ignore
                const lockedTime = this.timeLengthLockedWithEvent(event, propertyName);
                isLockedWithEvent = lockedTime < defaultLockTime;
            }
            if (isLockedWithEvent) {
                freqCallback
                    ? freqCallback()
                    : console.warn('lock with event: click too frequently');
            } else {
                // @ts-ignore
                this.lockWithEvent(event, propertyName);
                method!.apply(this, args);
            }
        };
    };

export const AfterConfigDataLoad = (
    target: any,
    propertyName: string,
    descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
) => {
    const method = descriptor.value;
    descriptor.value = function (...args: any[]) {
        method!.apply(this, args);
        eventBus.emit(DataModelEvents.CONFIG_DATA_LOAD_COMPLETE, this);
    };
};

export const PropertyType =
    <T>(token?: T, isMap?: boolean) =>
    (target: object, key: string) => {
        Object.defineProperty(target, `_${key}Type`, {
            value: {
                cls: token,
                isMap: isMap,
            },
        });
    };

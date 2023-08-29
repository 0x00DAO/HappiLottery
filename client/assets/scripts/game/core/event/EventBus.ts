import { Node, NodeEventType, __private } from 'cc';
import { IEventRegisterProps } from './IEvent';

interface EventObject {
    target?: any;
    event: string;
    callback: __private._types_globals__AnyFunction;
    useCapture?: any;
}

export class EventBus extends Node {
    private _events: EventObject[] = [];

    private static _instance: EventBus | null = null;

    public static instance(): EventBus {
        if (EventBus._instance === null) {
            EventBus._instance = new EventBus();
        }
        return EventBus._instance;
    }

    private isGameEvent(event: string): boolean {
        return event !== null && event !== undefined && event.split('.').length > 1;
    }

    private _addEvent(
        type: string | NodeEventType,
        callback: __private._types_globals__AnyFunction,
        target: any,
        useCapture?: any
    ): boolean {
        const filter: EventObject | undefined = this._events.find((v) => {
            return v.event === type && v.target === target;
        });
        if (filter) {
            return false;
        }
        this._events.push({
            target: target,
            event: type,
            callback: callback,
            useCapture: useCapture,
        });
        return true;
    }

    offAllEventsOfTarget(target: any) {
        const events: EventObject[] = this._events.filter((v) => {
            const targetNotThis: boolean = v.target !== target;
            if (!targetNotThis) {
                this.off(v.event);
            }
            return targetNotThis;
        });

        this._events = events ?? [];
    }

    on(
        type: string | NodeEventType,
        callback: __private._types_globals__AnyFunction,
        target: any,
        useCapture?: any
    ) {
        if (this.isGameEvent(type)) {
            const __callback = (...args: any) => {
                if (target && target.isBindMessageActive) {
                    if (target.isValid) {
                        if (target.node) {
                            if (target.node.active) {
                                callback.call(target, ...args);
                            }
                        } else {
                            callback.call(target, ...args);
                        }
                    }
                } else {
                    callback.call(target, ...args);
                }
            };
            if (!this._addEvent(type, __callback, target, useCapture)) {
                return;
            }

            super.on(type, __callback, target, useCapture);
        } else {
            super.on(type, callback, target, useCapture);
        }
    }

    off(
        type: string,
        callback?: __private._types_globals__AnyFunction,
        target?: unknown,
        useCapture?: any
    ): void {
        if (this.isGameEvent(type)) {
            const event: EventObject | undefined = this._events.find(
                (v) => v.event === type && v.target === target
            );
            if (!event) {
                return;
            }
            super.off(event.event, event.callback, event.target, event.useCapture);
            this._events = this._events.filter((v) => v.event !== type) ?? [];
        } else {
            super.off(type, callback, target, useCapture);
        }
    }
}

export const createEvent = (
    event: string,
    listener: Function,
    subscriber?: any,
    target?: any
): IEventRegisterProps => {
    return {
        event: event,
        listener: listener,
        target: target,
        subscriber: subscriber,
    };
};

export const eventBus: Readonly<EventBus> = EventBus.instance();

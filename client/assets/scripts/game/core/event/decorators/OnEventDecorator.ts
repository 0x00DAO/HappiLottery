import { COMPONENT_EVENT_REGISTER_LIST_KEY } from '../constants';
import { OnEventOptions } from '../interface/IOnEventOptions';

export interface OnEventMetadata {
    event: string | symbol | Array<string | symbol>;
    options?: OnEventOptions;
}

export const OnEvent = (event: string | any, options?: OnEventOptions): MethodDecorator => {
    return (target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        let eventName: string | null = null;
        if (typeof event === 'string') {
            eventName = `${event}`;
        } else if (event instanceof Object && event.event) {
            eventName = event.name;
        }
        if (eventName) {
            const componentEvent = Reflect.get(target, COMPONENT_EVENT_REGISTER_LIST_KEY) || [];
            componentEvent.push({ event: eventName, method: descriptor.value });
            Reflect.set(target, COMPONENT_EVENT_REGISTER_LIST_KEY, componentEvent);
        }
    };
};

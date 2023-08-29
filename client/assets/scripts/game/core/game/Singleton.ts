import { GameObject } from './GameObject';

export class Singleton extends GameObject {
    public constructor() {
        super();
        if (this._autoRegisterEvents) {
            this._events = this.events();
            this.eventsOn();
        }
    }

    public static getInstance(): any {
        let Class: any = this;
        if (!Class._Instance) {
            Class._Instance = new Class();
            if (Class._Instance.initialize) {
                Class._Instance.initialize();
            }
        }
        return Class._Instance;
    }
}

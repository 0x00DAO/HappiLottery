import { assert } from 'cc';
import { eventBus } from './EventBus';
import { IGameEventListener } from './IGameEventListener';

export abstract class GameEventBaseDTO implements IGameEventListener {
    public static readonly event: string = 'core.game.event.base';
    public static get eventAsync(): string {
        return `${this.event}_await`;
    }

    public get subject(): string {
        assert(false, 'GameEventBaseDTO.subject not implemented');
        return GameEventBaseDTO.event;
    }

    public async exec(eventData: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) {}

    public async execAsync(eventData: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any) {
        try {
            await this.exec(eventData, arg2, arg3, arg4, arg5);
            eventBus.emit(`${this.subject}_await`, eventData, arg2, arg3, arg4, arg5);
        } catch (e) {
            console.log('reject event', this.subject, e);
        }
    }
}

import { SceneState } from './SceneState';

export class FsmStateEventData {
    constructor(_stateName: string | null) {
        if (!_stateName) {
            throw new Error('stateName is null');
        }
        this._stateName = _stateName;
    }

    private _stateName: string = SceneState.NONE;

    public get stateName(): string {
        return this._stateName;
    }

    static create(name: string | null) {
        return new FsmStateEventData(name);
    }
}

export enum FsmStateEvents {
    STATE_ENTER = 'FsmStateEvents.STATE_ENTER',
    STATE_EXIT = 'FsmStateEvents.STATE_EXIT',
}

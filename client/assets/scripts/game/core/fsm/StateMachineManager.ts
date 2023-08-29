import { assert, warn } from 'cc';
import { FsmState } from '../fsm/FsmState';
import { IState } from '../fsm/IState';
import { SceneState } from '../fsm/SceneState';
import { Singleton } from '../game/Singleton';

type TransactionMap = {
    [key: string]: FsmState;
};

export class StateMachineManager extends Singleton {
    private _transactionMap: TransactionMap = {};

    private _forceStop: boolean = false;

    private _current: FsmState | null = null;
    private _last: FsmState | null = null;

    public get currentState(): FsmState | null {
        return this._current;
    }

    constructor() {
        super();
        this.shutdown();
    }

    start() {
        assert(this._current, 'the default state is null');
        this._current.enter(null);
        this.restart();
    }

    public setDefaultState(state: IState) {
        this._current = state as FsmState;
    }

    tick(dt: number) {
        if (!this._current || this._forceStop) return;
        const result: string = this._current.checkTransaction();
        if (result != SceneState.NONE) {
            const target: FsmState = this._transactionMap[result];
            this._last = this._current;
            this._current = target;
            this._last.exit();
            this.shutdown();
            console.log(`state change: ${this._last.stateName} => ${this._current.stateName}`);
            this.enterNextState();
            this.restart();
        } else {
            this._current.tick();
        }
    }

    private enterNextState() {
        if (this._current) this._current.enter(this._last ? this._last.stateName : null);
    }

    public addSceneState(state: FsmState) {
        if (!state.stateName || state.stateName === '') {
            warn('the state name is empty');
            return;
        }

        if (this._transactionMap[state.stateName]) {
            warn('the state is already in machine : ' + state.stateName);
            return;
        }

        this._transactionMap[state.stateName] = state;
    }

    public removeSceneState(stateName: string) {
        if (!stateName || stateName === '') {
            warn('state name is empty');
            return;
        }

        if (this._transactionMap[stateName]) {
            delete this._transactionMap[stateName];
        } else {
            warn('can not find your state by name' + stateName);
        }
    }

    shutdown() {
        this._forceStop = true;
    }

    restart() {
        this._forceStop = false;
    }
}

export const stateMachine: Readonly<StateMachineManager> = StateMachineManager.getInstance();

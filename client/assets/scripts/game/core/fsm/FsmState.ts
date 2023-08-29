import { eventBus } from '../event/EventBus';
import { Singleton } from '../game/Singleton';
import { FsmStateEventData, FsmStateEvents } from './FsmStateEvents';
import { IState } from './IState';
import { SceneState } from './SceneState';
import { StateMachineManager } from './StateMachineManager';
import { TransactionPipe } from './TransactionPipe';

export abstract class FsmState extends Singleton implements IState {
    protected _isRunning: boolean = false;

    protected _stateName: string | null = null;

    private _pipes: TransactionPipe[] = [];

    protected _owner: StateMachineManager | null = null;

    public get stateName(): string | null {
        return this._stateName;
    }

    constructor(stateName: string, owner?: StateMachineManager) {
        super();
        this._stateName = stateName;
        this._owner = owner ? owner : null;
        this.init();
    }

    protected init() {}

    setOwner(owner: StateMachineManager): FsmState {
        this._owner = owner;
        return this;
    }

    enter(from: string | null) {
        this._isRunning = true;
        this.onEnter(from);
        eventBus.emit(FsmStateEvents.STATE_ENTER, FsmStateEventData.create(this.stateName), this);
    }

    exit() {
        this._isRunning = false;
        this.onExit();
        eventBus.emit(FsmStateEvents.STATE_EXIT, FsmStateEventData.create(this.stateName), this);
    }

    abstract onEnter(from: string | null): void;

    abstract tick(): void;

    abstract onExit(): void;

    checkTransaction(): string {
        for (let i: number = 0; i < this._pipes.length; i++) {
            const pipe: TransactionPipe = this._pipes[i];
            if (
                pipe.condition &&
                (pipe.executor ? pipe.condition.apply(pipe.executor) : pipe.condition())
            )
                return pipe.target;
        }
        return SceneState.NONE;
    }

    addPipe(tp: TransactionPipe): void {
        const pipe: TransactionPipe | undefined = this._pipes.find(
            (p: TransactionPipe) => p.uuid === tp.uuid
        );
        if (pipe) return;

        this._pipes.push(tp);
    }
}

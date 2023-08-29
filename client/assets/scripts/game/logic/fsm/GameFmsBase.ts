import { FsmState } from '../../core/fsm/FsmState';
import { TransactionPipe } from '../../core/fsm/TransactionPipe';
import { SceneState } from './SceneState';

export abstract class GameFsmBase extends FsmState {
    protected _stateCompleted: boolean = false;

    protected abstract get nextState(): SceneState;

    constructor(stateName: SceneState, owner: any) {
        super(stateName, owner);
    }

    protected init() {
        const checker = new TransactionPipe(this.nextState, this.toNextState, this);
        this.addPipe(checker);
    }

    protected toNextState(): boolean {
        return this._stateCompleted;
    }

    protected updateComplete() {
        this._stateCompleted = true;
    }

    async onEnter(): Promise<void> {}

    onExit(): void {}

    tick(): void {}
}

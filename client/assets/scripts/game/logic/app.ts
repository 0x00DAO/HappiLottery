import { _decorator, game, profiler } from 'cc';
import { Root } from '../core/engine/Root';
import { stateMachine } from '../core/fsm/StateMachineManager';
import { GAME_ID, VERSION } from './const/Game';
import { stateGameOver } from './fsm/GameStateGameOver';
import { stateGaming } from './fsm/GameStateGaming';
import { stateGameIdle } from './fsm/GameStateIdle';
import { stateGameInit } from './fsm/GameStateInit';
const { ccclass, menu } = _decorator;

@ccclass('app')
@menu('app')
export class app extends Root {
    protected launched: boolean = false;

    public get gameId(): number {
        return GAME_ID;
    }

    public get cacheVersion(): string {
        return VERSION.cacheVersion;
    }

    protected init() {
        super.init();

        const owner = stateMachine as any;
        stateMachine.addSceneState(stateGameIdle.setOwner(owner));
        stateMachine.addSceneState(stateGameInit.setOwner(owner));
        stateMachine.addSceneState(stateGaming.setOwner(owner));
        stateMachine.addSceneState(stateGameOver.setOwner(owner));

        stateMachine.setDefaultState(stateGameIdle);
    }

    start() {
        game.frameRate = 60;

        profiler.hideStats();
    }
}

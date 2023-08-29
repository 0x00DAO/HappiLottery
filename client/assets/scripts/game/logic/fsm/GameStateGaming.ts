import { GameFsmBase } from './GameFmsBase';
import { SceneState } from './SceneState';

export class GameStateGaming extends GameFsmBase {
    constructor(owner: any) {
        super(SceneState.GAME_GAMING, owner);
    }

    protected get nextState(): SceneState {
        return SceneState.GAME_OVER;
    }
}

export const stateGaming: Readonly<GameStateGaming> = GameStateGaming.getInstance();

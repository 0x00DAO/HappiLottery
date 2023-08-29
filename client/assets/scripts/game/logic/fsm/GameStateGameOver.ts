import { GameFsmBase } from './GameFmsBase';
import { SceneState } from './SceneState';

export class GameStateGameOver extends GameFsmBase {
    constructor(owner: any) {
        super(SceneState.GAME_OVER, owner);
    }

    protected get nextState(): SceneState {
        return SceneState.GAME_GAMING;
    }
}

export const stateGameOver: Readonly<GameStateGameOver> = GameStateGameOver.getInstance();

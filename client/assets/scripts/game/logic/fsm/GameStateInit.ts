import { onAddedPromise } from '../../core/layout/LayerHelper';
import { gameManager } from '../../core/manager/GameManager';
import { AirPlane } from '../components/AirPlane/AirPlane';
import { Login } from '../components/Login/Login';
import { Main } from '../components/Main/Main';
import { Toast } from '../components/Toast/Toast';
import { dataModels } from '../data/DataRegister';
import { walletData } from '../data/WalletData';
import { GameFsmBase } from './GameFmsBase';
import { SceneState } from './SceneState';

export class GameStateGameInit extends GameFsmBase {
    constructor(owner: any) {
        super(SceneState.GAME_INIT, owner);
    }

    protected get nextState(): SceneState {
        return SceneState.GAME_GAMING;
    }

    async onEnter(): Promise<void> {
        if (!walletData.hasProvider) {
            Toast.showMessage(`there's no provider has been found, please install metamask first`);
            return Promise.resolve();
        }

        await this._loadDataModels();

        await this._loadResources();

        this.updateComplete();
    }

    async onExit(): Promise<void> {
        const startScreen = gameManager.canvas.getComponentInChildren('StartScreen');
        await onAddedPromise(Main);
        if (startScreen && startScreen.node) {
            startScreen.node.destroy();
        }
        Login.remove();
    }

    private async _loadDataModels() {
        for (let i = 0; i < dataModels.length; i++) {
            const v = dataModels[i];
            v.preload && v.preload();

            if (v && v.loadData) {
                await v.loadData();
            }
        }
    }

    private async _loadResources() {
        // init cache
        const plane = await AirPlane.createAsync();
        if (plane) {
            gameManager.persistRootNode?.addChild(plane.node);
        }
    }
}

export const stateGameInit: Readonly<GameStateGameInit> = GameStateGameInit.getInstance();

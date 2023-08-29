import { stateMachine } from '../fsm/StateMachineManager';
import { language } from '../i18n/Language';
import { LayerManager } from '../layout/LayerManager';
import { AudioManager } from '../manager/AudioManager';
import { gameManager } from '../manager/GameManager';
import { TimerManager } from '../manager/TimerManager';
import { storage } from '../storage/Storage';
import { Root } from './Root';

export class Engine {
    public init(root: Root): Engine {
        gameManager.setGameId(root.gameId);
        storage.initDriver(root.cacheVersion);

        gameManager.setRootNode(root.node!);
        gameManager.setI18n(language);
        gameManager.setTimer(new TimerManager(root));
        gameManager.setGui(new LayerManager(root.guiNode!));
        gameManager.setCanvas(root.gameCanvas!);
        gameManager.setCamera(root.gameCamera!);
        gameManager.setStorage(storage);
        gameManager.setAudioManager(AudioManager.instance);

        return this;
    }

    public start() {
        stateMachine.start();
    }
}

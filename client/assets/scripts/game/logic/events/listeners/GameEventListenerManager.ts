import { eventBus } from '../../../core/event/EventBus';
import { IGameEventListener } from '../../../core/event/IGameEventListener';
import { mainLoopUpdater } from '../../../core/game/MainLoopUpdater';
import { Singleton } from '../../../core/game/Singleton';
import { GameEventContractAirVoyageDiceRolled } from '../../contracts/events/GameEventContractAirVoyageDiceRolled';
import { GameEventContractAirVoyageGameCreated } from '../../contracts/events/GameEventContractAirVoyageGameCreated';
import { GameEventContractAirVoyageGameFinished } from '../../contracts/events/GameEventContractAirVoyageGameFinished';
import { GameEventContractAirVoyageGameJoined } from '../../contracts/events/GameEventContractAirVoyageGameJoined';
import { GameEventContractAirVoyageGameStarted } from '../../contracts/events/GameEventContractAirVoyageGameStarted';
import { GameEventContractAirVoyagePieceFinished } from '../../contracts/events/GameEventContractAirVoyagePieceFinished';
import { GameEventContractAirVoyagePieceMoved } from '../../contracts/events/GameEventContractAirVoyagePieceMoved';
import { GameEventContractAirVoyagePlayerFinished } from '../../contracts/events/GameEventContractAirVoyagePlayerFinished';
import { GameEventContractGameBonusSystemDeposit } from '../../contracts/events/GameEventContractGameBonusSystemDeposit';
import { GameEventContractGameBonusSystemRewardBonus } from '../../contracts/events/GameEventContractGameBonusSystemRewardBonus';
import { GameEventContractGameBonusSystemWinBonus } from '../../contracts/events/GameEventContractGameBonusSystemWinBonus';
import { GameEventGameOpened } from '../GameEventGameOpened';
import { GameEventWalletAccountChanged } from '../GameEventWalletAccountChanged';
import { GameEventWalletChainChanged } from '../GameEventWalletChainChanged';
import { GameEventWalletDisconnect } from '../GameEventWalletDisconnect';

interface IQueueItem {
    event: string;
    data: any[];
}

export class GameEventListenerManager extends Singleton {
    public _eventsQueue: IQueueItem[] = [];

    public initialize() {
        this.addListeners([
            new GameEventWalletAccountChanged(),
            new GameEventWalletChainChanged(),
            new GameEventWalletDisconnect(),
            new GameEventContractAirVoyageDiceRolled(),
            new GameEventContractAirVoyageGameCreated(),
            new GameEventContractAirVoyageGameFinished(),
            new GameEventContractAirVoyageGameJoined(),
            new GameEventContractAirVoyageGameStarted(),
            new GameEventContractAirVoyagePieceFinished(),
            new GameEventContractAirVoyagePieceMoved(),
            new GameEventContractAirVoyagePlayerFinished(),
            new GameEventContractGameBonusSystemDeposit(),
            new GameEventContractGameBonusSystemRewardBonus(),
            new GameEventContractGameBonusSystemWinBonus(),
            new GameEventGameOpened(),
        ]);

        mainLoopUpdater.registerUpdater(this);

        this.scheduleOnce(() => this.addEventToQueue('eeee', ['a', 1, 'xxxx', new Object()]), 5);
    }

    public addListeners(listeners: IGameEventListener[]) {
        listeners.forEach((listener) => this.addListener(listener));
    }

    public addListener(listener: IGameEventListener) {
        eventBus.on(listener.subject, listener.execAsync, listener);
    }

    public update(dt: number) {
        if (this._eventsQueue.length === 0) {
            return;
        }
        const item: IQueueItem = this._eventsQueue.shift()!;
        eventBus.emit(item.event, ...item.data);
    }

    public addEventToQueue(event: string, data: any[]) {
        this._eventsQueue.push({ event, data });
    }
}

export const gameEventListenerManager: Readonly<GameEventListenerManager> =
    GameEventListenerManager.getInstance();

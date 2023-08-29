import { Camera, Canvas, Node, _decorator } from 'cc';
import { stateMachine } from '../fsm/StateMachineManager';
import { GameObject } from '../game/GameObject';
import { mainLoopUpdater } from '../game/MainLoopUpdater';
import { Engine } from './Engine';

const { property } = _decorator;

export class Root extends GameObject {
    @property({
        type: Node,
        tooltip: 'logicNode',
    })
    public gameNode: Node | null = null;

    @property({
        type: Node,
        tooltip: 'uiNode',
    })
    public guiNode: Node | null = null;

    @property({
        type: Canvas,
        tooltip: 'canvas',
    })
    public gameCanvas: Canvas | null = null;

    @property({
        type: Camera,
        tooltip: 'camera',
    })
    public gameCamera: Camera | null = null;

    private _engine: Engine | null = null;

    public get gameId(): number {
        return -1;
    }

    public get engine(): Engine | null {
        return this._engine;
    }

    public get cacheVersion(): string {
        return 'default_unknown';
    }

    protected load() {
        this.init();
        this.run();
    }

    protected init() {
        this._engine = new Engine().init(this);
    }

    protected run() {
        this._engine && this._engine.start();
    }

    update(dt: number) {
        stateMachine.tick(dt);
        mainLoopUpdater.update(dt);
    }
}

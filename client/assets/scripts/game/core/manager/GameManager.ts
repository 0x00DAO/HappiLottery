import { Camera, Canvas, Component, Node, director, error } from 'cc';
import { IEnginePlugin } from '../engine/IEnginePlugin';
import { eventBus } from '../event/EventBus';
import { GameEventGameOver } from '../game/events/GameEventGameOver';
import { GameEventGameRestart } from '../game/events/GameEventGameRestart';
import { GameEventGameStart } from '../game/events/GameEventGameStart';
import { LanguageManager } from '../i18n/Language';
import { LayerManager } from '../layout/LayerManager';
import { TimerManager } from './TimerManager';

export class GameManager extends Component implements IEnginePlugin {
  private _rootNode: Node | null = null;
  private _gui: LayerManager | null = null;
  private _canvas: Canvas | null = null;
  private _i18n: LanguageManager | null = null;
  private _timer: TimerManager | null = null;
  private _storage: any = null;
  private _audioMgr: any = null;
  private _camera: Camera | null = null;

  private _gameId: number = 0;

  public get persistRootNode(): Node | null {
    return this._rootNode;
  }

  public get gui(): LayerManager {
    return this._gui!;
  }

  public get i18n(): LanguageManager {
    return this._i18n!;
  }

  public get timer(): TimerManager {
    return this._timer!;
  }

  public get gameId(): number {
    return this._gameId;
  }

  public get storage(): any {
    return this._storage;
  }

  public get canvas(): Canvas {
    return this._canvas!;
  }

  public get camera(): Camera {
    return this._camera!;
  }

  public setGameId(id: number) {
    this._gameId = id;
  }

  public setRootNode(node: Node) {
    if (!node) {
      error('GameManager.setRootNode node is null');
      return;
    }
    this._rootNode = node;
    director.addPersistRootNode(this._rootNode);
  }

  public setGui(gui: LayerManager) {
    this._gui = gui;
  }

  public setCanvas(canvas: Canvas) {
    this._canvas = canvas;
  }

  public setCamera(camera: Camera) {
    this._camera = camera;
  }

  public setI18n(i18n: LanguageManager) {
    this._i18n = i18n;
  }

  public setTimer(timer: TimerManager) {
    this._timer = timer;
  }

  public setStorage(storage: any) {
    this._storage = storage;
  }

  public setAudioManager(audioManager: any) {
    this._audioMgr = audioManager;
  }

  public getAudioManager(): any {
    return this._audioMgr;
  }

  public getName(): string {
    return GameManager.toString();
  }

  public gameStart() {
    eventBus.emit(GameEventGameStart.event);
  }

  public gameOver() {
    eventBus.emit(GameEventGameOver.event);
  }

  public gameRestart() {
    eventBus.emit(GameEventGameRestart.event);
  }
}

export const gameManager: Readonly<GameManager> = new GameManager();

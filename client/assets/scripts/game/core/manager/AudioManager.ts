import { Game, game, Node, sys } from 'cc';
import { AudioEffect } from '../audio/AudioEffect';
import { AudioMusic } from '../audio/AudioMusic';
import { createEvent } from '../event/EventBus';
import { IEventRegisterProps } from '../event/IEvent';
import { GameObject } from '../game/GameObject';
import { gameManager } from './GameManager';

const LOCAL_STORE_KEY = 'game_audio';

export class AudioManager extends GameObject {
  private static _instance: AudioManager | null = null;
  public static get instance(): AudioManager {
    if (this._instance === null) {
      let node = gameManager.persistRootNode;
      if (!node) {
        node = new Node('UIAudioManager');
        gameManager.setRootNode(node);
      }
      this._instance = node.addComponent(AudioManager);
      this._instance.init();

      let music = new Node('UIMusic');
      music.parent = node;
      this._instance.music = music.addComponent(AudioMusic);

      let effect = new Node('UIEffect');
      effect.parent = node;
      this._instance.effect = effect.addComponent(AudioEffect);
    }
    return this._instance;
  }

  private local_data: any = {};

  private music!: AudioMusic;
  private effect!: AudioEffect;

  private _volume_music: number = 1;
  private _volume_effect: number = 1;
  private _switch_music: boolean = true;
  private _switch_effect: boolean = true;

  private _uuid: string = '998877';

  private _localStorageTag: string = '';

  private init() {
    let data = sys.localStorage.getItem(this._localStorageTag);
    if (data) {
      try {
        this.local_data = JSON.parse(data);
        this._volume_music = this.local_data.volume_music;
        this._volume_effect = this.local_data.volume_effect;
        this._switch_music = this.local_data.switch_music;
        this._switch_effect = this.local_data.switch_effect;
      } catch (e) {
        this.local_data = {};
        this._volume_music = 1;
        this._volume_effect = 1;
        this._switch_music = true;
        this._switch_effect = true;
      }

      this.music.volume = this._volume_music;
      this.effect.volume = this._volume_effect;
    }
  }

  protected events(): IEventRegisterProps[] {
    return [
      ...super.events(),
      createEvent(Game.EVENT_HIDE, this.onGameHide, game),
      createEvent(Game.EVENT_SHOW, this.onGameShow, game),
    ];
  }

  private onGameHide() {
    this.pauseAll();
  }

  private onGameShow() {
    this.resumeAll();
  }

  /**
   * @param value
   */
  public setUuid(value: string) {
    this._uuid = value;
    this._localStorageTag = `${LOCAL_STORE_KEY}_${this._uuid}`;
  }

  playMusic(url: string, callback: Function | null = null) {
    if (this._switch_music) {
      this.music.load(url);
      this.music.onComplete = callback;
    }
  }

  playEffect(url: string) {
    if (this._switch_effect) {
      this.effect.load(url);
    }
  }

  public get musicVolume(): number {
    return this._volume_music;
  }
  public set musicVolume(value: number) {
    this._volume_music = value;
    this.music.volume = value;
  }

  public get effectVolume(): number {
    return this._volume_effect;
  }
  public set effectVolume(value: number) {
    this._volume_effect = value;
    this.effect.volume = value;
  }

  public getSwitchMusic(): boolean {
    return this._switch_music;
  }
  public setSwitchMusic(value: boolean) {
    this._switch_music = value;

    if (!value) this.music.stop();
  }

  public getSwitchEffect(): boolean {
    return this._switch_effect;
  }
  public setSwitchEffect(value: boolean) {
    this._switch_effect = value;
    if (!value) this.effect.stop();
  }

  public resumeAll() {
    if (this.music) {
      this.music.play();
      this.effect.play();
    }
  }

  public pauseAll() {
    if (this.music) {
      this.music.pause();
      this.effect.pause();
    }
  }

  public stopAll() {
    if (this.music) {
      this.music.stop();
      this.effect.stop();
    }
  }

  public save() {
    this.local_data.volume_music = this._volume_music;
    this.local_data.volume_effect = this._volume_effect;
    this.local_data.switch_music = this._switch_music;
    this.local_data.switch_effect = this._switch_effect;

    let data = JSON.stringify(this.local_data);
    sys.localStorage.setItem(this._localStorageTag, data);
  }
}

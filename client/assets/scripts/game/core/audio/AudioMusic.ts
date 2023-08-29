import { AudioClip, AudioSource, _decorator, error } from 'cc';
import { resLoader } from '../loader/ResLoader';
const { ccclass, menu } = _decorator;

@ccclass('AudioMusic')
@menu('core/audio/AudioMusic')
export class AudioMusic extends AudioSource {
  public onComplete: Function | null = null;

  private _progress: number = 0;
  private _isPlay: boolean = false;

  private _musics: Map<string, AudioClip> = new Map<string, AudioClip>();

  public get progress() {
    this._progress = this.currentTime / this.duration;
    return this._progress;
  }
  public set progress(value: number) {
    this._progress = value;
    this.currentTime = value * this.duration;
  }

  public load(url: string, callback?: Function) {
    if (this._musics.has(url)) {
      this.playFromMusic(url, callback);
    } else {
      const res: AudioClip | null = resLoader.get(url);
      if (res) {
        this._musics.set(url, res);
        this.playFromMusic(url, callback);
      } else {
        resLoader.load(url, AudioClip, (err: Error | null, data: AudioClip) => {
          if (err) {
            error(err);
          }

          this._musics.set(url, data);
          this.playFromMusic(url, callback);
        });
      }
    }
  }

  private playFromMusic(url: string, callback?: Function) {
    if (this.playing) {
      this.stop();
    }
    this.clip = this._musics.get(url)!;
    this.currentTime = 0;
    this.play();
    callback && callback();
  }

  update(dt: number) {
    if (this.currentTime > 0) {
      this._isPlay = true;
    }

    if (this._isPlay && !this.playing) {
      this._isPlay = false;
      this.onComplete && this.onComplete();
    }
  }

  release() {
    for (let key in this._musics) {
      resLoader.release(key);
    }
    this._musics.clear();
  }
}

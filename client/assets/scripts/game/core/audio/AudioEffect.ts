import { AudioClip, AudioSource, _decorator, error } from 'cc';
import { resLoader } from '../loader/ResLoader';
const { ccclass, menu } = _decorator;

@ccclass('AudioEffect')
@menu('core/audio/AudioEffect')
export class AudioEffect extends AudioSource {
  private effects: Map<string, AudioClip> = new Map<string, AudioClip>();

  public load(url: string, callback?: Function) {
    if (this.effects.has(url)) {
      this.playFromEffect(url, callback);
    } else {
      const res: AudioClip | null = resLoader.get(url);
      if (res) {
        this.effects.set(url, res);
        this.playFromEffect(url, callback);
      }
      resLoader.load(url, AudioClip, (err: Error | null, data: AudioClip) => {
        if (err) {
          error(err);
        }

        this.effects.set(url, data);
        this.playFromEffect(url, callback);
      });
    }
  }

  private playFromEffect(url: string, callback?: Function) {
    this.playOneShot(this.effects.get(url)!, this.volume);
    callback && callback();
  }

  release() {
    for (let key in this.effects) {
      resLoader.release(key);
    }
    this.effects.clear();
  }
}

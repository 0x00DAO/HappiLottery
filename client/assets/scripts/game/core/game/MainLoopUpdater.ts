import { GameObject } from './GameObject';
import { Singleton } from './Singleton';

export class MainLoopUpdater extends Singleton {
  private _updaters: GameObject[] = [];
  private _pausing: boolean = false;

  protected pause() {
    this._pausing = true;
  }

  protected resume() {
    this._pausing = false;
  }

  public registerUpdater(updater: GameObject) {
    this.pause();
    this._updaters.push(updater);
    this.resume();
  }

  public unregisterUpdater(updater: GameObject) {
    this.pause();
    this._updaters = this._updaters.filter((item) => item !== updater);
    this.resume();
  }

  update(dt: number) {
    if (this._pausing || this._updaters.length === 0) {
      return;
    }

    //@ts-ignore
    this._updaters.forEach((updater) => updater.update(dt));
  }
}

export const mainLoopUpdater: Readonly<MainLoopUpdater> =
  MainLoopUpdater.getInstance();

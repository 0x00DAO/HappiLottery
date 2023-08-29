import { Component, __private, sys } from 'cc';
import { createEvent, eventBus } from '../event/EventBus';
import { IEventRegisterProps } from '../event/IEvent';
import { COMPONENT_EVENT_REGISTER_LIST_KEY } from '../event/constants';

export abstract class GameObject extends Component {
  static prefabName(): string {
    return '';
  }

  private _isBindMessageActive: boolean = true;

  protected _autoRegisterEvents: boolean = true;

  protected _events: IEventRegisterProps[] = [];

  protected get ctx(): any {
    //@ts-ignore
    return globalThis;
  }

  public get isBindMessageActive(): boolean {
    return this._isBindMessageActive;
  }

  protected events(): IEventRegisterProps[] {
    const componentEvents =
      Reflect.get(this, COMPONENT_EVENT_REGISTER_LIST_KEY) || [];
    const events: IEventRegisterProps[] = [];
    //@ts-ignore
    componentEvents.forEach((eventObj: any) => {
      events.push(createEvent(eventObj.event, eventObj.method.bind(this)));
    });
    return events;
  }

  protected eventsOn() {
    this._events.forEach((v: IEventRegisterProps) => {
      const subscriber: any = v.subscriber ? v.subscriber : eventBus;
      subscriber.on(v.event, v.listener, v.target ? v.target : this);
    });
  }

  protected eventsOff() {
    this._events.forEach((v: IEventRegisterProps) => this.removeEvent(v));
    eventBus.offAllEventsOfTarget(this);
  }

  private addEvent(event: IEventRegisterProps) {
    this._events.push(event);
    const subscriber: any = event.subscriber ? event.subscriber : eventBus;
    subscriber.on(
      event.event,
      event.listener,
      event.target ? event.target : this
    );
  }

  private removeEvent(event: IEventRegisterProps) {
    const subscriber: any = event.subscriber ? event.subscriber : eventBus;
    if (subscriber === this || subscriber === this.node) {
      const target: any = event.target ? event.target : this;
      subscriber.off(event.event, event.listener, target);
    }
  }

  protected load() {}

  protected beforeDealloc() {}

  protected dealloc() {}

  protected beforeLoad() {}

  protected afterLoad() {}

  protected destroyComponent<T extends Component>(
    classConstructor: __private._types_globals__Constructor<T>
  ) {
    let component: any = this.getComponent(classConstructor);
    if (component) {
      component.destroy();
      component = null;
    }
  }

  public bindMessageActive() {
    this._isBindMessageActive = true;
  }

  public unbindMessageActive() {
    this._isBindMessageActive = false;
  }

  onLoad() {
    if (this._autoRegisterEvents) {
      this._events = this.events();
      this.eventsOn();
    }
    this.addUIStatus();
    this.beforeLoad();
    this.load();
    this.afterLoad();
  }

  onDestroy() {
    this.eventsOff();
    this.beforeDealloc();
    this.dealloc();

    this._lockWithTimeMap.clear();
    this._lockerWithEventMap.clear();
  }

  private addUIStatus() {}

  private _lock: boolean = false;
  protected lock() {
    this._lock = true;
  }
  protected unlock() {
    this._lock = false;
  }
  protected get isLocked(): boolean {
    return this._lock;
  }

  /**
   * lock with time
   *
   */
  private _lockWithTimeMap: Map<string, number> = new Map();
  protected isLockedWithTime(methodName: string, interval: number): boolean {
    const lastLockTime = this._lockWithTimeMap.get(methodName) || 0;
    return sys.now() - lastLockTime < interval;
  }
  protected lockWithTime(methodName: string) {
    this._lockWithTimeMap.set(methodName, sys.now());
  }

  /**
   *  lock with event
   *
   */
  private _lockerWithEventMap: Map<
    string,
    { methodName: string; lastLockTime: number }[]
  > = new Map();
  private lockWithEventMethodKey(methodName: string): string {
    return `${this.uuid}_${methodName}`;
  }
  private lockWithEvent(event: string, methodName: string) {
    const lockers: { methodName: string; lastLockTime: number }[] =
      this._lockerWithEventMap.get(event) || [];
    const key = this.lockWithEventMethodKey(methodName);
    lockers.push({
      methodName: key,
      lastLockTime: sys.now(),
    });
    this._lockerWithEventMap.set(event, lockers);
    this.addEvent(
      createEvent(event, this.unlockWithEvent.bind(this, event, methodName))
    );
  }
  private unlockWithEvent(event: string, methodName: string) {
    const eventFound = this._events.find((v) => v.event === event);
    if (eventFound) {
      this.removeEvent(eventFound);
      this._events = this._events.filter((e) => e.event !== event);
    }
    const lockers: { methodName: string; lastLockTime: number }[] =
      this._lockerWithEventMap.get(event) || [];
    const key = this.lockWithEventMethodKey(methodName);
    const index: number = lockers.findIndex(
      (locker) => locker.methodName === key
    );
    if (index >= 0) {
      lockers.splice(index, 1);
    }
    this._lockerWithEventMap.set(event, lockers);
  }
  private isLockedWithEvent(event: string, methodName: string): boolean {
    const lockers: { methodName: string; lastLockTime: number }[] =
      this._lockerWithEventMap.get(event) || [];
    const key = this.lockWithEventMethodKey(methodName);
    const index: number = lockers.findIndex(
      (locker) => locker.methodName === key
    );
    return index >= 0;
  }
  private timeLengthLockedWithEvent(event: string, methodName: string): number {
    const lockers: { methodName: string; lastLockTime: number }[] =
      this._lockerWithEventMap.get(event) || [];
    const key = this.lockWithEventMethodKey(methodName);
    const index: number = lockers.findIndex(
      (locker) => locker.methodName === key
    );
    return index >= 0
      ? (sys.now() - lockers[index].lastLockTime) / 1000
      : 9999999999;
  }
}

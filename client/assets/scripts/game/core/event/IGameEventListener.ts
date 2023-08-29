export interface IGameEventListener {
    get subject(): string;
    exec(eventData: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any;
    execAsync(eventData: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any): any;
}

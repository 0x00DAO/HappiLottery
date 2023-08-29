export interface IEventRegisterProps {
  event: string;
  listener: Function;
  target: any;
  subscriber?: any;
}

import { GameObject } from '../game/GameObject';

export type TransactionPipeCheck = () => boolean;

export class TransactionPipe extends GameObject {
  private _condition: TransactionPipeCheck | null;

  private _executor: any;

  private _target: string;

  get condition(): TransactionPipeCheck | null {
    return this._condition;
  }

  get executor(): any {
    return this._executor;
  }

  get target(): string {
    return this._target;
  }

  constructor(
    target: string,
    condition: TransactionPipeCheck | null,
    executor: any
  ) {
    super();
    this._target = target;
    this._condition = condition;
    this._executor = executor;
  }
}

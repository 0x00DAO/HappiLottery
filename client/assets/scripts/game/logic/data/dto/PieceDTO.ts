import { FLY_TO_AIRPORT, PieceStatus } from '../../../const/GameConst';
import { BaseDTO } from '../../../core/model/BaseDTO';
import { AirPlane } from '../../components/AirPlane/AirPlane';

export class PieceDTO extends BaseDTO {
    player: string = '';
    seatIndex: any = -1;
    localPosition: any = -1;
    globalPosition: any = -1;
    status: PieceStatus = PieceStatus.Idle;

    private _airplane: AirPlane | null = null;
    public get airplane(): AirPlane {
        if (this._airplane === null) {
            this._airplane = AirPlane.create(this.seatIndex);
        }
        return this._airplane;
    }

    public get isValid(): boolean {
        return this.player !== '0x0000000000000000000000000000000000000000';
    }

    public get isInAirPort(): boolean {
        return this.status === PieceStatus.Idle && this.localPosition === 0;
    }

    public get isFlying(): boolean {
        return this.status === PieceStatus.Playing && this.localPosition >= 0;
    }

    public get isLanded(): boolean {
        return this.status === PieceStatus.Finished;
    }

    public flyTo(index: number) {
        this.airplane.flyTo(index);
    }

    public landToAirport() {
        this.flyTo(FLY_TO_AIRPORT);
    }

    public gotoInitPosition() {
        if (this.isInAirPort) {
            this.landToAirport();
        } else {
            this.flyTo(this.globalPosition);
        }
    }

    public destroyAirplane() {
        if (!this._airplane) {
            return;
        }

        if (this._airplane.node.parent) {
            this._airplane.node.removeFromParent();
        }
        this._airplane = null;
    }
}

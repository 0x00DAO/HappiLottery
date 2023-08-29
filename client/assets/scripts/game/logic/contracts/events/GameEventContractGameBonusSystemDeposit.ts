import { GameEventBaseDTO } from '../../../core/event/GameEventBaseDTO';
import { gameAccountData } from '../../data/GameAccountData';

export class GameEventContractGameBonusSystemDeposit extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.game_bonus_system_deposit';

    public get subject(): string {
        return GameEventContractGameBonusSystemDeposit.event;
    }

    public async exec(from: any, amount: any) {
        console.log(this.subject, from, amount);
        if (from !== gameAccountData.address) {
            return Promise.reject();
        }
        return Promise.resolve();
    }
}

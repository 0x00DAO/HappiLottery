import { GameEventBaseDTO } from '../../../core/event/GameEventBaseDTO';
import { gameAccountData } from '../../data/GameAccountData';

export class GameEventContractGameBonusSystemWinBonus extends GameEventBaseDTO {
    public static readonly event: string = 'core.game.event.game_bonus_system_win_bonus';

    public get subject(): string {
        return GameEventContractGameBonusSystemWinBonus.event;
    }

    public async exec(from: any, amount: any) {
        console.log(this.subject, from, amount);
        if (from !== gameAccountData.address) {
            return Promise.reject();
        }
        return Promise.resolve();
    }
}

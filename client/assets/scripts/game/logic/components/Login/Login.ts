import { Label, _decorator } from 'cc';
import { OnEvent } from '../../../core/event/decorators/OnEventDecorator';
import { LayerType } from '../../../core/layout/LayerManager';
import { VERSION } from '../../const/Game';
import { GameEventResourceLoading } from '../../events/GameEventResourceLoading';
import { LayoutCom } from '../../layout/LayoutCom';
import { registerLayout } from '../GameUI';
const { menu, ccclass, property } = _decorator;

@ccclass('Login')
@menu('game/logic/components/Login')
export class Login extends LayoutCom {
    static prefabName(): string {
        return 'Login';
    }

    static layer(): LayerType {
        return LayerType.Dialog;
    }

    @property(Label)
    private loadingLabel: Label = null!;

    @property(Label)
    private versionLabel: Label = null!;

    protected load() {
        this.versionLabel.string = `version: ${VERSION.version}.${
            VERSION.buildVersion.split('.')[1]
        }`;
    }

    @OnEvent(GameEventResourceLoading.event)
    public updateProgress(progress: number, total: number) {
        if (!this.loadingLabel) {
            return;
        }

        const percent = Math.floor((progress / total) * 100);
        this.loadingLabel.string = `loading....${percent}%`;
    }
}

registerLayout(Login);

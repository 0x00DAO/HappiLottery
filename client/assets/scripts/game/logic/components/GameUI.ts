import { ILayout } from '../../core/layout/ILayout';
import { UIConfig } from '../../core/layout/LayerManager';

const GameUI: ILayout[] = [];

export const uiConfigs = (): { [key: number]: UIConfig } => {
  let configs: { [key: number]: UIConfig } = {};
  GameUI.forEach((ui: any) => {
    if (ui.layoutUUID && ui.UIConfig) {
      configs[ui.layoutUUID()] = ui.UIConfig;
    }
  });
  return configs;
};

export const registerLayout = (layout: ILayout) => {
  GameUI.push(layout);
};

export const layouts = GameUI;

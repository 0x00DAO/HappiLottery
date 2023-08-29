import { Singleton } from '../game/Singleton';

export enum LanguageEvent {
  CHANGE = 'LanguageEvent.CHANGE',
  RELEASE_RES = 'LanguageEvent.RELEASE_RES',
}

export class LanguageManager extends Singleton {
  private _languageData: any;

  private _currentLang: string = '';
  private _supportLanguages: Array<string> = ['zh-CN', 'en'];

  private _hasInit: boolean = false;

  constructor() {
    super();
    this._currentLang = this.defaultLang;
  }

  public get defaultLang(): string {
    return 'en';
  }

  public get hasInit(): boolean {
    return this._hasInit;
  }

  public set supportLanguages(supportLanguages: Array<string>) {
    this._supportLanguages = supportLanguages;
  }

  public get supportLanguages(): Array<string> {
    return this._supportLanguages;
  }

  public get currentLanguage(): string {
    return this._currentLang;
  }

  public get languages(): string[] {
    return this._supportLanguages;
  }

  public isExist(lang: string): boolean {
    return this.languages.indexOf(lang) > -1;
  }

  public setLangData(data: any) {
    if (!data) {
      return;
    }

    Object.keys(data).forEach((key) => {
      if (key !== 'zh-CN') {
        const langs = data[key];
        Object.keys(langs).forEach(
          (langKey) =>
            (langs[langKey] = langs[langKey]
              ? langs[langKey].replace(/，/g, ',')
              : langKey)
        );
      }
    });

    this.supportLanguages = Object.keys(data);
    this._languageData = Object.freeze(data);

    this._hasInit = true;
  }

  public setLanguage(language: string, callback: (success: boolean) => void) {
    if (!language) {
      language = this.defaultLang;
    }
    language = language.toLowerCase();
    let index = this.languages.indexOf(language);
    if (index < 0) {
      language = this.defaultLang;
    }
    if (language === this._currentLang) {
      callback(false);
      return;
    }
  }

  public getLang(key: string, params?: any, defaultLang?: string): string {
    const lang = this._languageData[this._currentLang];
    if (!lang) {
      return defaultLang ?? key;
    }

    let txt: string = lang[key] ?? defaultLang ?? key;
    if (params) {
      const keys: string[] = Object.keys(params);
      keys.forEach((key) => {
        txt = txt.replace(`{${key}}`, params[key]);
      });
    }
    return txt;
  }
}

export const language: LanguageManager = LanguageManager.getInstance();

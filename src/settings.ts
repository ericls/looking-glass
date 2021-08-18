/// <reference path="./global.d.ts" />
export default class Settings {
  static getSettings() {
    return Settings.data;
  }
  static set(data: SiteSettings) {
    if (Settings._set > 0) {
      console.warn("Settings has already being initialized");
    }
    Settings.data = data;
    Settings._set += 1;
  }
  private static _set = 0;
  static data: SiteSettings = {
    siteTitle: "",
    serverLocation: "",
    sitePageHeader: "",
    ipAddress: [],
    links: [],
    jsVer: "",
  };
}

import React from "react";

export interface ElectronAPI {
  isElectron: boolean;
  createTab: (tabId: string, url: string) => void;
  navigate: (tabId: string, url: string) => void;
  goBack: (tabId: string) => void;
  goForward: (tabId: string) => void;
  reload: (tabId: string) => void;
  stop: (tabId: string) => void;
  switchTab: (tabId: string) => void;
  closeTab: (tabId: string) => void;
  updateBounds: (tabId: string, bounds: { x: number; y: number; width: number; height: number }) => void;
  onNavigate: (callback: (data: { tabId: string; url: string }) => void) => () => void;
  onTitleUpdate: (callback: (data: { tabId: string; title: string }) => void) => () => void;
  onFaviconUpdate: (callback: (data: { tabId: string; favicon: string }) => void) => () => void;
  onLoadingState: (callback: (data: { tabId: string; isLoading: boolean }) => void) => () => void;
  onNewWindowTab: (callback: (data: { url: string }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export interface MacActions {
  setLogin: (value: boolean | ((prevVar: boolean) => boolean)) => void;
  shutMac: (e: React.MouseEvent) => void;
  restartMac: (e: React.MouseEvent) => void;
  sleepMac: (e: React.MouseEvent) => void;
}

export {
  AppsData,
  BearMdData,
  BearData,
  LaunchpadData,
  MusicData,
  TerminalData,
  UserData,
  WallpaperData,
  WebsitesData,
  SiteSectionData,
  SiteData
} from "./configs";

import defaultSettings from '@/settings';
import { useDynamicTitle } from '@/utils/dynamicTitle';
import { defineStore } from 'pinia';

const { sideTheme, showSettings, topNav, tagsView, fixedHeader, sidebarLogo, dynamicTitle } = defaultSettings;

// 设置相关的类型定义
export interface SettingsState {
  title: string;
  darkMode: boolean;
  theme: string;
  sideTheme: string;
  showSettings: boolean;
  topNav: boolean;
  tagsView: boolean;
  fixedHeader: boolean;
  sidebarLogo: boolean;
  dynamicTitle: boolean;
}

export interface LayoutSetting {
  darkMode?: boolean;
  theme?: string;
  sideTheme?: string;
  topNav?: boolean;
  tagsView?: boolean;
  fixedHeader?: boolean;
  sidebarLogo?: boolean;
  dynamicTitle?: boolean;
}

export interface SettingChangeData {
  key: keyof SettingsState;
  value: any;
}

// 在客户端环境下才访问localStorage
const storageSetting: LayoutSetting = process.client 
  ? (JSON.parse(localStorage.getItem('layout-setting-new') || '{}') || {}) 
  : {};

const useSettingsStore = defineStore('settings', {
  state: (): SettingsState => ({
    title: '',
    darkMode: storageSetting.darkMode ?? false,
    theme: storageSetting.theme ?? '#165DFF',
    sideTheme: storageSetting.sideTheme ?? sideTheme,
    showSettings: showSettings,
    topNav: storageSetting.topNav ?? topNav,
    tagsView: storageSetting.tagsView ?? tagsView,
    fixedHeader: storageSetting.fixedHeader ?? fixedHeader,
    sidebarLogo: storageSetting.sidebarLogo ?? sidebarLogo,
    dynamicTitle: storageSetting.dynamicTitle ?? dynamicTitle
  }),
  actions: {
    // 修改布局设置
    changeSetting(data: SettingChangeData): void {
      const { key, value } = data;
      if (key in this) {
        (this as any)[key] = value;
      }
    },
    
    // 设置网页标题
    setTitle(title: string): void {
      this.title = title;
      if (process.client) {
        useDynamicTitle();
      }
    }
  }
});

export default useSettingsStore; 
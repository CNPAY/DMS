import Cookies from 'js-cookie';
import { defineStore } from 'pinia';

// App Store 相关的类型定义
export interface SidebarState {
  opened: boolean;
  withoutAnimation: boolean;
  hide: boolean;
}

export interface AppState {
  sidebar: SidebarState;
  device: 'desktop' | 'mobile';
  size: 'large' | 'default' | 'small';
}

export interface SidebarToggleOptions {
  withoutAnimation?: boolean;
}

const useAppStore = defineStore('app', {
  state: (): AppState => ({
    sidebar: {
      opened: Cookies.get('sidebarStatus') ? !!Number(Cookies.get('sidebarStatus')) : true,
      withoutAnimation: false,
      hide: false
    },
    device: 'desktop',
    size: (Cookies.get('size') as AppState['size']) || 'default'
  }),
  actions: {
    toggleSideBar(withoutAnimation?: boolean): boolean | void {
      if (this.sidebar.hide) {
        return false;
      }
      this.sidebar.opened = !this.sidebar.opened;
      this.sidebar.withoutAnimation = withoutAnimation || false;
      if (this.sidebar.opened) {
        Cookies.set('sidebarStatus', '1');
      } else {
        Cookies.set('sidebarStatus', '0');
      }
    },
    
    closeSideBar({ withoutAnimation }: SidebarToggleOptions = {}): void {
      Cookies.set('sidebarStatus', '0');
      this.sidebar.opened = false;
      this.sidebar.withoutAnimation = withoutAnimation || false;
    },
    
    toggleDevice(device: AppState['device']): void {
      this.device = device;
    },
    
    setSize(size: AppState['size']): void {
      this.size = size;
      Cookies.set('size', size);
    },
    
    toggleSideBarHide(status: boolean): void {
      this.sidebar.hide = status;
    }
  }
});

export default useAppStore; 
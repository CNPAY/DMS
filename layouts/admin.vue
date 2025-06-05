<template>
  <ElConfigProvider :locale="elementLocale">
    <div v-if="device === 'mobile' && sidebar.opened" class="drawer-bg" @click="handleClickOutside" />
    <sidebar v-if="!sidebar.hide" class="sidebar-container" />
    <div :class="{ hasTagsView: needTagsView, sidebarHide: sidebar.hide }" class="main-container">
      <div :class="{ 'fixed-header': fixedHeader }">
        <navbar @setLayout="setLayout" />
        <tags-view v-if="needTagsView" />
      </div>
      <section class="app-main">
        <slot />
        <!-- <iframe-toggle /> -->
      </section>
      <settings ref="settingRef" />
    </div>
  </ElConfigProvider>
</template>

<script setup>
import { useWindowSize } from '@vueuse/core';
import Sidebar from './layout/components/Sidebar/index.vue';
import {  Navbar, Settings, TagsView } from './layout/components';
// import defaultSettings from '@/settings';

import useAppStore from '~/store/modules/app';
import useSettingsStore from '~/store/modules/settings';
import useTagsViewStore from '~/store/modules/tagsView';

// Element Plus 国际化
import { ElConfigProvider } from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import en from 'element-plus/es/locale/lang/en';
import { useI18n } from 'vue-i18n';

const tagsViewStore = useTagsViewStore();
const settingsStore = useSettingsStore();
const { locale } = useI18n();

// Element Plus 语言配置
const elementLocale = computed(() => {
  const currentLocale = locale.value.toLowerCase();
  if (currentLocale === 'zh' || currentLocale === 'zh-cn') {
    return zhCn;
  }
  return en;
});
const theme = computed(() => settingsStore.theme);
const sideTheme = computed(() => settingsStore.sideTheme);
const sidebar = computed(() => useAppStore().sidebar);
const device = computed(() => useAppStore().device);
const needTagsView = computed(() => settingsStore.tagsView);
const fixedHeader = computed(() => settingsStore.fixedHeader);

const classObj = computed(() => ({
  hideSidebar: !sidebar.value.opened,
  openSidebar: sidebar.value.opened,
  withoutAnimation: sidebar.value.withoutAnimation,
  mobile: device.value === 'mobile'
}));

const { width, height } = useWindowSize();
const WIDTH = 992; // refer to Bootstrap's responsive design

watchEffect(() => {
  if (device.value === 'mobile' && sidebar.value.opened) {
    useAppStore().closeSideBar({ withoutAnimation: false });
  }
  if (width.value - 1 < WIDTH) {
    useAppStore().toggleDevice('mobile');
    useAppStore().closeSideBar({ withoutAnimation: true });
  } else {
    useAppStore().toggleDevice('desktop');
  }
});

function handleClickOutside() {
  useAppStore().closeSideBar({ withoutAnimation: false });
}

const settingRef = ref(null);
function setLayout() {
  settingRef.value.openSetting();
}
</script>

<style lang="scss">
// 导入管理后台专用的完整样式
@use '~/assets/styles/admin.scss' as *;
</style>

<style lang="scss" scoped>
@use '@/assets/styles/mixin.scss' as *;
@use '@/assets/styles/variables.module.scss' as *;

.app-wrapper {
  @include clearfix;
  position: relative;
  height: 100%;
  width: 100%;

  &.mobile.openSidebar {
    position: fixed;
    top: 0;
  }
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}

.fixed-header {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 9;
  width: calc(100% - #{$base-sidebar-width});
  transition: width 0.28s;
}

.hideSidebar .fixed-header {
  width: calc(100% - 54px);
}

.sidebarHide .fixed-header {
  width: 100%;
}

.mobile .fixed-header {
  width: 100%;
}

.app-main {
  /* 50= navbar  50  */
  min-height: calc(100vh - 50px);
  width: 100%;
  position: relative;
  overflow: hidden;
}

.fixed-header + .app-main {
  padding-top: 50px;
}

.hasTagsView {
  .app-main {
    /* 84 = navbar + tags-view = 50 + 34 */
    min-height: calc(100vh - 84px);
  }

  .fixed-header + .app-main {
    padding-top: 84px;
  }
}
</style>

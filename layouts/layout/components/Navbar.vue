<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="appStore.sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" v-if="!settingsStore.topNav" />
    <top-nav id="topmenu-container" class="topmenu-container" v-if="settingsStore.topNav" />

    <div class="right-menu">
      <template v-if="appStore.device !== 'mobile'">
        <!-- <header-search id="header-search" class="right-menu-item" /> -->
        <div class="header-search2">
          <input class="header-search2-input" placeholder="输入内容查询" />
          <svg-icon class-name="header-search2-icon" icon-class="search" />
        </div>
        <div class="round-item">
          <svg-icon icon-class="n-notification" style="height: 15px; width: 15px" />
        </div>
        
        <!-- 语言切换器 -->
        <el-dropdown @command="handleLanguageChange" trigger="click">
          <div class="round-item">
            {{ locale === 'en' ? '🇺🇸' : '🇨🇳' }}
         </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="en">English</el-dropdown-item>
              <el-dropdown-item command="zh">中文</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        
        <screenfull id="screenfull" class="right-menu-item hover-effect round-item" />

        <!-- <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip> -->
      </template>
      <div class="avatar-container">
        <el-dropdown @command="handleCommand" class="right-menu-item hover-effect" trigger="click">
          <div class="avatar-wrapper">
            <!-- <img :src="userStore.avatar" class="user-avatar" /> -->
            <span class="user-avatar round-item">{{ "A" }}</span>
            <span class="user-name">{{ userStore.name }}</span>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <router-link to="/admin/user/profile">
                <el-dropdown-item>个人中心</el-dropdown-item>
              </router-link>
              <el-dropdown-item command="setLayout" v-if="settingsStore.showSettings">
                <span>布局设置</span>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <span>退出登录</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ElMessageBox } from 'element-plus';
import Breadcrumb from '~/components/Breadcrumb';
import TopNav from '~/components/TopNav';
import Hamburger from '~/components/Hamburger';
import Screenfull from '~/components/Screenfull';
import SizeSelect from '~/components/SizeSelect';
import HeaderSearch from '~/components/HeaderSearch';
import useAppStore from '~/store/modules/app';
import useUserStore from '~/store/modules/user';
import useSettingsStore from '~/store/modules/settings';
import { useI18n } from 'vue-i18n';

const appStore = useAppStore();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const { locale, setLocale } = useI18n();
 

function toggleSideBar() {
  appStore.toggleSideBar();
}
function dartModeChange() {
  settingsStore.darkMode = !settingsStore.darkMode;
  debugger;
  var dark = settingsStore.darkMode;
  let html = document.documentElement;
  if (dark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }
}
function handleCommand(command) {
  switch (command) {
    case 'setLayout':
      setLayout();
      break;
    case 'logout':
      logout();
      break;
    default:
      break;
  }
}

// 处理语言切换
function handleLanguageChange(lang) {
  console.log(`🌐 Switching language to: ${lang}`);
  setLocale(lang);
    // 只需简单设置locale值，Nuxt i18n会自动处理cookie
    locale.value = lang;
}
function getRoles() {
  var roles = userStore.roles;
  var r = '';
  for (var i = 0; i < roles.length; i++) {
    if (roles[i] === 'admin') {
      r = r + '管理员';
    }
    if (roles[i] === 'group') {
      r = r + '' + (userStore.groupName ? userStore.groupName : '');
    }
    if (roles[i] === 'store') {
      r = r + '' + (userStore.storeName ? userStore.storeName : '');
    }
    if (roles[i] === 'superadmin') {
      r = r + '超级管理员';
    }
  }
  return r;
}
function logout() {
  ElMessageBox.confirm('确定注销并退出系统吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      userStore.logOut().then(() => {
        location.href = '/admin/';
      });
    })
    .catch(() => {});
}

const emits = defineEmits(['setLayout']);
function setLayout() {
  emits('setLayout');
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background 0.3s;
    -webkit-tap-highlight-color: transparent;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .topmenu-container {
    position: absolute;
    left: 50px;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;
    display: flex;
    align-items: center;
    gap: 16px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background 0.3s;

        &:hover {
          background: rgba(0, 0, 0, 0.025);
        }
      }
    }

    .avatar-container {
      margin-right: 16px;
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      .avatar-wrapper {
        position: relative;
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;

        .user-avatar {
          cursor: pointer;
          width: 32px;
          height: 32px;
          border-radius: 32px;
        }
        .user-name {
          color: #4e5969;
          font-size: 14px;
        }

        i {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
.header-search2 {
  //转换为css
  background: #f2f3f5;
  height: 32px;
  border: none;
  color: black;
  border-radius: 25px;
  box-shadow: 0 0 0 0px;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 200px;
  padding-right: 10px;
  .header-search2-input {
    background: none;
    width: 100%;
    height: 100%;
    border: none;
    padding-right: 30px;
    padding-left: 15px;
    outline: none;
  }
  i {
    font-size: 18px;
    color: black;
    cursor: pointer;
    width: 14px;
    height: 14px;
  }
}
.round-item {
  display: flex !important;
  flex-direction: row;
  align-items: center;
  width: 32px;
  height: 32px !important;
  border-radius: 32px;
  background: #f2f3f5;
  justify-content: center;
  .svg-icon {
    width: 15px !important;
    height: 15px !important;
  }
}
.user-type {
  font-size: 14px;
}
</style>

// import { login, logout, getInfo, loginOuth } from '@/api/login';
import { getToken, setToken, removeToken } from '@/utils/auth';
import defAva from '';
import { defineStore } from 'pinia';

// 用户相关的类型定义
export interface UserInfo {
  userId: string;
  userName: string;
  avatar: string;
  groupId: string | null;
  storeId: string | null;
  groupName: string | null;
  storeName: string | null;
  brand: string | null;
  industry: string | null;
}

export interface LoginUserInfo {
  username: string;
  password: string;
  code: string;
  uuid: string;
}

export interface LoginResponse {
  data: {
    access_token: string;
  };
}

export interface UserInfoResponse {
  user: UserInfo;
  roles: string[];
  permissions: string[];
}

export interface UserState {
  token: string;
  id: string;
  name: string;
  avatar: string;
  roles: string[];
  permissions: string[];
  groupId: string | null;
  storeId: string | null;
  groupName: string | null;
  storeName: string | null;
  brand: string | null;
  industry: string | null;
}

const useUserStore = defineStore('user', {
  state: (): UserState => ({
    token: getToken() || '',
    id: '',
    name: '',
    avatar: '',
    roles: [], // 角色
    permissions: [],
    groupId: null, // 集团id
    storeId: null, // 门店id
    groupName: null, // 集团名称
    storeName: null, // 门店名称
    brand: null, // 品牌
    industry: null // 行业
  }),
  actions: {
    // 登录
    login(userInfo: LoginUserInfo): Promise<void> {
      const username = userInfo.username.trim();
      const password = userInfo.password;
      const code = userInfo.code;
      const uuid = userInfo.uuid;
      return new Promise((resolve, reject) => {
        // TODO: 取消注释并实现 login API
        // login(username, password, code, uuid)
        //   .then((res: LoginResponse) => {
        //     const data = res.data;
        //     setToken(data.access_token);
        //     this.token = data.access_token;
        //     resolve();
        //   })
        //   .catch((error) => {
        //     reject(error);
        //   });
        // 临时实现
        resolve();
      });
    },
    
    // 单点登录
    loginOuth(code: string): Promise<void> {
      return new Promise((resolve, reject) => {
        // TODO: 取消注释并实现 loginOuth API
        // loginOuth({ code: code })
        //   .then((res: LoginResponse) => {
        //     const data = res.data;
        //     setToken(data.access_token);
        //     this.token = data.access_token;
        //     resolve();
        //   })
        //   .catch((error) => {
        //     reject(error);
        //   });
        // 临时实现
        resolve();
      });
    },
    
    // 获取用户信息
    getInfo(): Promise<UserInfoResponse> {
      return new Promise((resolve, reject) => {
        // TODO: 取消注释并实现 getInfo API
        // getInfo()
        //   .then((res: UserInfoResponse) => {
        //     const user = res.user;
        //     const avatar = user.avatar === '' || user.avatar === null ? defAva : user.avatar;

        //     if (res.roles && res.roles.length > 0) {
        //       // 验证返回的roles是否是一个非空数组
        //       this.roles = res.roles;
        //       this.permissions = res.permissions;
        //     } else {
        //       this.roles = ['ROLE_DEFAULT'];
        //     }
        //     this.id = user.userId;
        //     this.name = user.userName;
        //     this.avatar = avatar;
        //     this.groupId = user.groupId;
        //     this.storeId = user.storeId;
        //     this.groupName = user.groupName;
        //     this.storeName = user.storeName;
        //     this.brand = user.brand;
        //     this.industry = user.industry;
        //     resolve(res);
        //   })
        //   .catch((error) => {
        //     reject(error);
        //   });
        
        // 临时实现
        const mockResponse: UserInfoResponse = {
          user: {
            userId: '1',
            userName: 'admin',
            avatar: defAva,
            groupId: null,
            storeId: null,
            groupName: null,
            storeName: null,
            brand: null,
            industry: null
          },
          roles: ['admin'],
          permissions: ['*:*:*']
        };
        resolve(mockResponse);
      });
    },
    
    // 设置用户信息
    setUserInfo(user: any,token: string): Promise<void> {
      return new Promise((resolve) => {
        this.id = user.id?.toString() || '';
        this.name = user.username || user.name || '';
        this.avatar = user.avatar || defAva;
        this.roles = user.roles || ['admin'];
        this.permissions = user.permissions || ['*:*:*'];
        this.token = token || '';
        setToken(token);
        resolve();
      });
    },

    // 退出系统
    logOut(): Promise<void> {
      return new Promise((resolve, reject) => {
        // TODO: 取消注释并实现 logout API
        // logout(this.token)
        //   .then(() => {
        //     this.token = '';
        //     this.roles = [];
        //     this.permissions = [];
        //     removeToken();
        //     resolve();
        //   })
        //   .catch((error) => {
        //     reject(error);
        //   });
        
        // 临时实现
        this.token = '';
        this.roles = [];
        this.permissions = [];
        removeToken();
        resolve();
      });
    }
  }
});

export default useUserStore; 
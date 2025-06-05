// import auth from '@/plugins/auth';
// import router, { constantRoutes, dynamicRoutes } from '@/router';
// import { getRouters } from '@/api/menu';
// import Layout from '@/layout/index';
// import ParentView from '@/components/ParentView';
// import InnerLink from '@/layout/components/InnerLink';
import { defineStore } from 'pinia';
import type { Component } from 'vue';

// 权限路由相关的类型定义
export interface RouteMetaInfo {
  title?: string;
  icon?: string;
  noCache?: boolean;
  affix?: boolean;
  hidden?: boolean;
  alwaysShow?: boolean;
  breadcrumb?: boolean;
  activeMenu?: string;
  permissions?: string[];
  roles?: string[];
}

export interface RouteInfo {
  path: string;
  name?: string;
  component?: string | Component;
  redirect?: string;
  meta?: RouteMetaInfo;
  children?: RouteInfo[];
  permissions?: string[];
  roles?: string[];
}

export interface PermissionState {
  routes: RouteInfo[];
  addRoutes: RouteInfo[];
  defaultRoutes: RouteInfo[];
  topbarRouters: RouteInfo[];
  sidebarRouters: RouteInfo[];
}

export interface RoutersResponse {
  data: RouteInfo[];
}

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue');

const usePermissionStore = defineStore('permission', {
  state: (): PermissionState => ({
    routes: [],
    addRoutes: [],
    defaultRoutes: [],
    topbarRouters: [],
    sidebarRouters: []
  }),
  actions: {
    setRoutes(routes: RouteInfo[]): void {
      this.addRoutes = routes;
      // this.routes = constantRoutes.concat(routes);
    },
    
    setDefaultRoutes(routes: RouteInfo[]): void {
      // this.defaultRoutes = constantRoutes.concat(routes);
    },
    
    setTopbarRoutes(routes: RouteInfo[]): void {
      this.topbarRouters = routes;
    },
    
    setSidebarRouters(routes: RouteInfo[]): void {
      this.sidebarRouters = routes;
    },
    
    renameComponetNames(routes: RouteInfo[]): RouteInfo[] {
      // 遍历路由，如果是一级路由name不变，如果是二级child中的路由，name加上父级路由的name
      routes.forEach((route) => {
        if (route.children && route.children.length) {
          route.children.forEach((child) => {
            if (route.name && child.name) {
              child.name = route.name + child.name;
            }
            if (child.children && child.children.length) {
              child.children.forEach((c) => {
                if (route.name && child.name && c.name) {
                  c.name = route.name + child.name + c.name;
                }
              });
            }
          });
        }
      });
      return routes;
    },
    
    generateRoutes(roles: string[]): Promise<RouteInfo[]> {
      return new Promise((resolve) => {
        // TODO: 取消注释并实现 getRouters API
        // getRouters().then((res: RoutersResponse) => {
        //   res.data = this.renameComponetNames(res.data);
        //   const sdata = JSON.parse(JSON.stringify(res.data));
        //   const rdata = JSON.parse(JSON.stringify(res.data));
        //   const defaultData = JSON.parse(JSON.stringify(res.data));
        //   const sidebarRoutes = filterAsyncRouter(sdata);
        //   const rewriteRoutes = filterAsyncRouter(rdata, false, true);
        //   const defaultRoutes = filterAsyncRouter(defaultData);
        //   const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
        //   asyncRoutes.forEach((route) => {
        //     router.addRoute(route);
        //   });
        //   this.setRoutes(rewriteRoutes);
        //   this.setSidebarRouters(constantRoutes.concat(sidebarRoutes));
        //   this.setDefaultRoutes(sidebarRoutes);
        //   this.setTopbarRoutes(defaultRoutes);
        //   resolve(rewriteRoutes);
        // });
        
        // 临时实现
        const mockRoutes: RouteInfo[] = [];
        resolve(mockRoutes);
      });
    }
  }
});

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap: RouteInfo[], lastRouter: RouteInfo | false = false, type: boolean = false): RouteInfo[] {
  return asyncRouterMap.filter((route) => {
    if (type && route.children) {
      route.children = filterChildren(route.children);
    }
    if (route.component) {
      // Layout ParentView 组件特殊处理
      if (route.component === 'Layout') {
        // route.component = Layout;
      } else if (route.component === 'ParentView') {
        // route.component = ParentView;
      } else if (route.component === 'InnerLink') {
        // route.component = InnerLink;
      } else {
        route.component = loadView(route.component as string);
      }
    }
    if (route.children != null && route.children && route.children.length) {
      route.children = filterAsyncRouter(route.children, route, type);
    } else {
      delete (route as any)['children'];
      delete (route as any)['redirect'];
    }
    return true;
  });
}

function filterChildren(childrenMap: RouteInfo[], lastRouter: RouteInfo | false = false): RouteInfo[] {
  let children: RouteInfo[] = [];
  childrenMap.forEach((el, index) => {
    if (el.children && el.children.length) {
      if (el.component === 'ParentView' && !lastRouter) {
        el.children.forEach((c) => {
          c.path = el.path + '/' + c.path;
          if (c.children && c.children.length) {
            children = children.concat(filterChildren(c.children, c));
            return;
          }
          children.push(c);
        });
        return;
      }
    }
    if (lastRouter) {
      el.path = lastRouter.path + '/' + el.path;
      if (el.children && el.children.length) {
        children = children.concat(filterChildren(el.children, el));
        return;
      }
    }
    children = children.concat(el);
  });
  return children;
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes: RouteInfo[]): RouteInfo[] {
  const res: RouteInfo[] = [];
  routes.forEach((route) => {
    // if (route.permissions) {
    //   if (auth.hasPermiOr(route.permissions)) {
    //     res.push(route);
    //   }
    // } else if (route.roles) {
    //   if (auth.hasRoleOr(route.roles)) {
    //     res.push(route);
    //   }
    // }
  });
  return res;
}

export const loadView = (view: string): (() => Promise<Component>) | undefined => {
  let res: (() => Promise<Component>) | undefined;
  for (const path in modules) {
    const dir = path.split('views/')[1].split('.vue')[0];
    if (dir === view) {
      res = () => modules[path]() as Promise<Component>;
    }
  }
  return res;
};

export default usePermissionStore; 
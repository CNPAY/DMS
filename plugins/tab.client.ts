import useTagsViewStore from '~/store/modules/tagsView';
import type { TagView } from '~/store/modules/tagsView';

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();
  const route = useRoute();
  
  // 路由转换为TagView格式的辅助函数
  const routeToTagView = (routeObj: any): TagView => {
    return {
      path: routeObj.path,
      fullPath: routeObj.fullPath,
      name: typeof routeObj.name === 'string' ? routeObj.name : String(routeObj.name || ''),
      title: routeObj.meta?.title || 'no-name',
      meta: routeObj.meta || {},
      query: routeObj.query,
      params: routeObj.params
    };
  };
  
  const $tab = {
    // 刷新当前tab页签
    refreshPage(obj?: any) {
      const { path, query, matched } = obj || route;
      let targetObj = obj;
      
      if (targetObj === undefined) {
        matched.forEach((m: any) => {
          if (m.components && m.components.default && m.components.default.name) {
            if (!['Layout', 'ParentView'].includes(m.components.default.name)) {
              targetObj = { name: m.components.default.name, path: path, query: query };
            }
          }
        });
      }
      
      return useTagsViewStore()
        .delCachedView(targetObj)
        .then(() => {
          const { path, query } = targetObj;
          router.replace({
            path: '/redirect' + path,
            query: query
          });
        });
    },
    
    // 关闭当前tab页签，打开新页签
    closeOpenPage(obj?: any) {
      const currentView = routeToTagView(route);
      useTagsViewStore().delView(currentView);
      if (obj !== undefined) {
        return router.push(obj);
      }
    },
    
    // 关闭指定tab页签
    closePage(obj?: any) {
      if (obj === undefined) {
        const currentView = routeToTagView(route);
        return useTagsViewStore()
          .delView(currentView)
          .then(({ visitedViews }) => {
            const latestView = visitedViews.slice(-1)[0];
            if (latestView && latestView.fullPath) {
              return router.push(latestView.fullPath);
            }
            return router.push('/');
          });
      }
      
      // 确保obj是TagView格式
      const tagView = typeof obj.meta !== 'undefined' ? obj : routeToTagView(obj);
      
      return useTagsViewStore().delView(tagView).then((result) => {
        return {
          visitedViews: result.visitedViews
        };
      });
    },
    
    // 关闭所有tab页签
    closeAllPage() {
      return useTagsViewStore().delAllViews();
    },
    
    // 关闭左侧tab页签
    closeLeftPage(obj?: any) {
      return useTagsViewStore().delLeftTags(obj || route);
    },
    
    // 关闭右侧tab页签
    closeRightPage(obj?: any) {
      return useTagsViewStore().delRightTags(obj || route);
    },
    
    // 关闭其他tab页签
    closeOtherPage(obj?: any) {
      return useTagsViewStore().delOthersViews(obj || route);
    },
    
    // 打开tab页签
    openPage(url: string) {
      return router.push(url);
    },
    
    // 修改tab页签
    updatePage(obj: any) {
      return useTagsViewStore().updateVisitedView(obj);
    }
  };

  // 提供全局访问
  nuxtApp.provide('tab', $tab);

  return {
    provide: {
      $tab
    }
  };
}); 
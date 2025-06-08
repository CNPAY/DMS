import { defineStore } from 'pinia';

// TagsView 相关的类型定义
export interface TagView {
  path: string;
  fullPath?: string;
  name?: string;
  title?: string;
  meta: {
    title?: string;
    affix?: boolean;
    noCache?: boolean;
    link?: string;
    [key: string]: any;
  };
  query?: Record<string, any>;
  params?: Record<string, any>;
}

export interface TagsViewState {
  visitedViews: TagView[];
  cachedViews: string[];
  iframeViews: TagView[];
}

export interface TagsViewResult {
  visitedViews: TagView[];
  cachedViews: string[];
}

const useTagsViewStore = defineStore('tags-view', {
  state: (): TagsViewState => ({
    visitedViews: [],
    cachedViews: [],
    iframeViews: []
  }),
  actions: {
    addView(view: TagView): void {
      this.addVisitedView(view);
      this.addCachedView(view);
    },
    
    addIframeView(view: TagView): void {
      if (this.iframeViews.some((v) => v.path === view.path)) return;
      this.iframeViews.push({
        ...view,
        title: view.meta.title || 'no-name'
      });
    },
    
    addVisitedView(view: TagView): void {
      const existingView = this.visitedViews.find((v) => v.fullPath === view.fullPath);
      if (existingView) {
        Object.assign(existingView, view);
        return;
      }
      this.visitedViews.push({
        ...view,
        title: view.meta.title || 'no-name'
      });
    },
    
    addCachedView(view: TagView): void {
      if (!view.name || this.cachedViews.includes(view.name)) return;
      if (!view.meta.noCache) {
        this.cachedViews.push(view.name);
      }
    },
    
    delView(view: TagView): Promise<TagsViewResult> {
      return new Promise((resolve) => {
        this.delVisitedView(view);
        this.delCachedView(view);
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        });
      });
    },
    
    delVisitedView(view: TagView): Promise<TagView[]> {
      return new Promise((resolve) => {
        // 使用findIndex和splice确保响应式更新
        const index = this.visitedViews.findIndex(v => 
          (view.fullPath && v.fullPath === view.fullPath) || v.path === view.path
        );
        
        if (index > -1) {
          // 使用splice触发响应式更新
          this.visitedViews.splice(index, 1);
        }
        
        // 同时清理iframe视图
        this.iframeViews = this.iframeViews.filter((item) => 
          (view.fullPath && item.fullPath !== view.fullPath) || item.path !== view.path
        );
        
        resolve([...this.visitedViews]);
      });
    },
    
    delIframeView(view: TagView): Promise<TagView[]> {
      return new Promise((resolve) => {
        this.iframeViews = this.iframeViews.filter((item) => item.path !== view.path);
        resolve([...this.iframeViews]);
      });
    },
    
    delCachedView(view: TagView): Promise<string[]> {
      return new Promise((resolve) => {
        if (view.name) {
          const index = this.cachedViews.indexOf(view.name);
          index > -1 && this.cachedViews.splice(index, 1);
        }
        resolve([...this.cachedViews]);
      });
    },
    
    delOthersViews(view: TagView): Promise<TagsViewResult> {
      return new Promise((resolve) => {
        this.delOthersVisitedViews(view);
        this.delOthersCachedViews(view);
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        });
      });
    },
    
    delOthersVisitedViews(view: TagView): Promise<TagView[]> {
      return new Promise((resolve) => {
        this.visitedViews = this.visitedViews.filter((v) => {
          return v.meta.affix || v.path === view.path;
        });
        this.iframeViews = this.iframeViews.filter((item) => item.path === view.path);
        resolve([...this.visitedViews]);
      });
    },
    
    delOthersCachedViews(view: TagView): Promise<string[]> {
      return new Promise((resolve) => {
        if (view.name) {
          const index = this.cachedViews.indexOf(view.name);
          if (index > -1) {
            this.cachedViews = this.cachedViews.slice(index, index + 1);
          } else {
            this.cachedViews = [];
          }
        } else {
          this.cachedViews = [];
        }
        resolve([...this.cachedViews]);
      });
    },
    
    delAllViews(view?: TagView): Promise<TagsViewResult> {
      return new Promise((resolve) => {
        this.delAllVisitedViews(view);
        this.delAllCachedViews(view);
        resolve({
          visitedViews: [...this.visitedViews],
          cachedViews: [...this.cachedViews]
        });
      });
    },
    
    delAllVisitedViews(view?: TagView): Promise<TagView[]> {
      return new Promise((resolve) => {
        const affixTags = this.visitedViews.filter((tag) => tag.meta.affix);
        this.visitedViews = affixTags;
        this.iframeViews = [];
        resolve([...this.visitedViews]);
      });
    },
    
    delAllCachedViews(view?: TagView): Promise<string[]> {
      return new Promise((resolve) => {
        this.cachedViews = [];
        resolve([...this.cachedViews]);
      });
    },
    
    updateVisitedView(view: TagView): void {
      for (let v of this.visitedViews) {
        if ((view.fullPath && v.fullPath === view.fullPath) || v.path === view.path) {
          Object.assign(v, view);
          break;
        }
      }
    },
    
    delRightTags(view: TagView): Promise<TagView[]> {
      return new Promise((resolve) => {
        const index = this.visitedViews.findIndex((v) => v.path === view.path);
        if (index === -1) {
          resolve([...this.visitedViews]);
          return;
        }
        this.visitedViews = this.visitedViews.filter((item, idx) => {
          if (idx <= index || (item.meta && item.meta.affix)) {
            return true;
          }
          if (item.name) {
            const i = this.cachedViews.indexOf(item.name);
            if (i > -1) {
              this.cachedViews.splice(i, 1);
            }
          }
          if (item.meta.link) {
            const fi = this.iframeViews.findIndex((v) => v.path === item.path);
            if (fi > -1) {
              this.iframeViews.splice(fi, 1);
            }
          }
          return false;
        });
        resolve([...this.visitedViews]);
      });
    },
    
    delLeftTags(view: TagView): Promise<TagView[]> {
      return new Promise((resolve) => {
        const index = this.visitedViews.findIndex((v) => v.path === view.path);
        if (index === -1) {
          resolve([...this.visitedViews]);
          return;
        }
        this.visitedViews = this.visitedViews.filter((item, idx) => {
          if (idx >= index || (item.meta && item.meta.affix)) {
            return true;
          }
          if (item.name) {
            const i = this.cachedViews.indexOf(item.name);
            if (i > -1) {
              this.cachedViews.splice(i, 1);
            }
          }
          if (item.meta.link) {
            const fi = this.iframeViews.findIndex((v) => v.path === item.path);
            if (fi > -1) {
              this.iframeViews.splice(fi, 1);
            }
          }
          return false;
        });
        resolve([...this.visitedViews]);
      });
    }
  }
});

export default useTagsViewStore; 
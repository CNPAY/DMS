// DMS 域名管理系统静态路由配置

export interface RouteMeta {
  title: string;
  icon?: string;
  affix?: boolean;
  noCache?: boolean;
  activeMenu?: string;
  link?: string;
}

export interface RouteChild {
  path: string;
  component: string;
  name: string;
  meta: RouteMeta;
}

export interface SidebarRoute {
  path: string;
  component: string;
  redirect?: string;
  meta: RouteMeta;
  children?: RouteChild[];
}

export const sidebarRoutes: SidebarRoute[] = [
  {
    path: '/admin/dashboard',
    component: 'Layout',
    redirect: '/admin/dashboard/index',
    meta: {
      title: '仪表盘',
      icon: 'dashboard'
    },
    children: [{
      path: 'index',
      component: 'dashboard/index',
      name: 'Dashboard',
      meta: {
        title: '仪表盘',
        icon: 'dashboard'
      }
    }]
  },
  {
    path: '/admin/domain',
    component: 'Layout',
    redirect: '/admin/domain/list',
    meta: {
      title: '域名管理',
      icon: 'user'
    },
    children: [
      {
        path: 'list',
        component: 'domain/list/index',
        name: 'DomainList',
        meta: {
          title: '域名信息管理',
          icon: 'list'
        }
      },
      {
        path: 'category',
        component: 'domain/category/index',
        name: 'DomainCategory',
        meta: {
          title: '分类管理',
          icon: 'component'
        }
      },
      {
        path: 'tag',
        component: 'domain/tag/index',
        name: 'DomainTag',
        meta: {
          title: '标签管理',
          icon: 'star'
        }
      },
      {
        path: 'expiry',
        component: 'domain/expiry/index',
        name: 'DomainExpiry',
        meta: {
          title: '到期管理',
          icon: 'date'
        }
      },
      {
        path: 'cost',
        component: 'domain/cost/index',
        name: 'DomainCost',
        meta: {
          title: '成本与续费',
          icon: 'money'
        }
      },
      {
        path: 'register',
        component: 'domain/register/index',
        name: 'DomainRegister',
        meta: {
          title: '注册新域名',
          icon: 'edit'
        }
      }
    ]
  },
  {
    path: '/admin/inquiry',
    component: 'Layout',
    redirect: '/admin/inquiry/list',
    meta: {
      title: '询盘管理',
      icon: 'message'
    },
    children: [
      {
        path: 'list',
        component: 'inquiry/list/index',
        name: 'InquiryList',
        meta: {
          title: '询盘管理',
          icon: 'message'
        }
      }
    ]
  },
  {
    path: '/admin/portfolio',
    component: 'Layout',
    redirect: '/admin/portfolio/list',
    meta: {
      title: '米表管理',
      icon: 'table'
    },
    children: [
      {
        path: 'list',
        component: 'portfolio/list/index',
        name: 'PortfolioList',
        meta: {
          title: '米表管理',
          icon: 'table'
        }
      }
    ]
  },
  {
    path: '/admin/watch',
    component: 'Layout',
    redirect: '/admin/watch/index',
    meta: {
      title: '域名关注',
      icon: 'eye'
    },
    children: [{
      path: 'index',
      component: 'watch/index',
      name: 'DomainWatch',
      meta: {
        title: '域名关注',
        icon: 'eye'
      }
    }]
  },
  {
    path: '/admin/whois',
    component: 'Layout',
    redirect: '/admin/whois/index',
    meta: {
      title: 'WHOIS 查询',
      icon: 'search'
    },
    children: [{
      path: 'index',
      component: 'whois/index',
      name: 'WhoisQuery',
      meta: {
        title: 'WHOIS 查询',
        icon: 'search'
      }
    }]
  },
  {
    path: '/admin/report',
    component: 'Layout',
    redirect: '/admin/report/sales',
    meta: {
      title: '数据报表',
      icon: 'chart'
    },
    children: [
      {
        path: 'sales',
        component: 'report/sales/index',
        name: 'SalesReport',
        meta: {
          title: '销售报表',
          icon: 'shopping'
        }
      },
      {
        path: 'cost',
        component: 'report/cost/index',
        name: 'CostReport',
        meta: {
          title: '成本报表',
          icon: 'money'
        }
      },
      {
        path: 'visitor',
        component: 'report/visitor/index',
        name: 'VisitorReport',
        meta: {
          title: '访问与询盘分析',
          icon: 'monitor'
        }
      }
    ]
  },
  {
    path: '/admin/ai',
    component: 'Layout',
    redirect: '/admin/ai/config',
    meta: {
      title: 'AI 助手',
      icon: 'build'
    },
    children: [
      {
        path: 'config',
        component: 'ai/config/index',
        name: 'AIConfig',
        meta: {
          title: 'AI 服务配置',
          icon: 'system'
        }
      },
      {
        path: 'prompt',
        component: 'ai/prompt/index',
        name: 'AIPrompt',
        meta: {
          title: '提示词管理',
          icon: 'edit'
        }
      },
      {
        path: 'chatbot',
        component: 'ai/chatbot/index',
        name: 'AIChatBot',
        meta: {
          title: 'ChatBot',
          icon: 'message'
        }
      }
    ]
  },
  {
    path: '/admin/system',
    component: 'Layout',
    redirect: '/admin/system/registrar',
    meta: {
      title: '系统配置',
      icon: 'system'
    },
    children: [
      {
        path: 'registrar',
        component: 'system/registrar/index',
        name: 'RegistrarManage',
        meta: {
          title: '注册商管理',
          icon: 'server'
        }
      },
      {
        path: 'backup',
        component: 'system/backup/index',
        name: 'SystemBackup',
        meta: {
          title: '数据导出与备份',
          icon: 'download'
        }
      },
      {
        path: 'theme',
        component: 'system/theme/index',
        name: 'ThemeConfig',
        meta: {
          title: '界面个性化',
          icon: 'theme'
        }
      },
      {
        path: 'notification',
        component: 'system/notification/index',
        name: 'NotificationConfig',
        meta: {
          title: '通知设置',
          icon: 'message'
        }
      },
      {
        path: 'security',
        component: 'system/security/index',
        name: 'SecurityConfig',
        meta: {
          title: '账户安全',
          icon: 'lock'
        }
      },
      {
        path: 'icons',
        component: 'admin/system/icons',
        name: 'IconLibrary',
        meta: {
          title: '图标库',
          icon: 'star'
        }
      }
    ]
  }
];

export default sidebarRoutes; 
// DMS 域名管理系统静态路由配置

export interface RouteMeta {
  title: string; // 支持国际化键，如 'routes.dashboard'
  icon?: string;
  affix?: boolean;
  noCache?: boolean;
  activeMenu?: string;
  link?: string;
}

export interface RouteChild {
  path: string;
  name: string;
  meta: RouteMeta;
  hidden?: boolean;
}

export interface SidebarRoute {
  path: string;
  redirect?: string;
  meta: RouteMeta;
  hidden?: boolean;
  children?: RouteChild[];
}

export const sidebarRoutes: SidebarRoute[] = [
  {
    path: '/admin/',
    redirect: '/admin/index',
    meta: {
      title: 'routes.dashboard',
      icon: 'dashboard'
    },
    children: [
      {
        path: 'index',
        name: 'AdminIndex',
        hidden: true,
        meta: {
          title: 'routes.dashboard',
          icon: 'dashboard'
        }
      },
      ]
  },
  {
    path: '/admin/domain',
    redirect: '/admin/domain/list',
    meta: {
      title: 'routes.domainManagement',
      icon: 'user'
    },
    children: [
      {
        path: 'list',
        name: 'DomainList',
        meta: {
          title: 'routes.domainList',
          icon: 'list'
        }
      },
      {
        path: 'category',
        name: 'DomainCategory',
        meta: {
          title: 'routes.domainCategory',
          icon: 'component'
        }
      },
      {
        path: 'tag',
        name: 'DomainTag',
        meta: {
          title: 'routes.domainTag',
          icon: 'star'
        }
      },
      {
        path: 'expiry',
        name: 'DomainExpiry',
        meta: {
          title: 'routes.domainExpiry',
          icon: 'date'
        }
      },
      {
        path: 'cost',
        name: 'DomainCost',
        meta: {
          title: 'routes.domainCost',
          icon: 'money'
        }
      },
      {
        path: 'register',
        name: 'DomainRegister',
        meta: {
          title: 'routes.domainRegister',
          icon: 'edit'
        }
      }
    ]
  },
  {
    path: '/admin/inquiries',
    meta: {
      title: 'routes.inquiryManagement',
      icon: 'message'
    },
    children: [
      {
        path: '/',
        name: 'InquiryList',
        meta: {
          title: 'routes.inquiryManagement',
          icon: 'message'
        }
      }
    ]
  },
  {
    path: '/admin/portfolio',
    redirect: '/admin/portfolio/list',
    meta: {
      title: 'routes.portfolioManagement',
      icon: 'table'
    },
    children: [
      {
        path: 'list',
        name: 'PortfolioList',
        meta: {
          title: 'routes.portfolioManagement',
          icon: 'table'
        }
      }
    ]
  },
  {
    path: '/admin/watch',
    meta: {
      title: 'routes.domainWatch',
      icon: 'eye'
    },
    children: [{
      path: '/',
      name: 'DomainWatch',
      meta: {
        title: 'routes.domainWatch',
        icon: 'eye'
      }
    }]
  },
  {
    path: '/admin/whois',
    meta: {
      title: 'routes.whoisQuery',
      icon: 'search'
    },
    children: [{
      path: '/',
      name: 'WhoisQuery',
      meta: {
        title: 'routes.whoisQuery',
        icon: 'search'
      }
    }]
  },
  {
    path: '/admin/report',
    redirect: '/admin/report/sales',
    meta: {
      title: 'routes.dataReports',
      icon: 'chart'
    },
    children: [
      {
        path: 'sales',
        name: 'SalesReport',
        meta: {
          title: 'routes.salesReport',
          icon: 'shopping'
        }
      },
      {
        path: 'costs',
        name: 'CostReport',
        meta: {
          title: 'routes.costReport',
          icon: 'money'
        }
      },
      {
        path: 'visitor',
        name: 'VisitorReport',
        meta: {
          title: 'routes.visitorReport',
          icon: 'monitor'
        }
      }
    ]
  },
  {
    path: '/admin/ai',
    redirect: '/admin/ai/config',
    meta: {
      title: 'routes.aiAssistant',
      icon: 'build'
    },
    children: [
      {
        path: 'config',
        name: 'AIConfig',
        meta: {
          title: 'routes.aiConfig',
          icon: 'system'
        }
      },
      {
        path: 'prompts',
        name: 'AIPrompt',
        meta: {
          title: 'routes.aiPrompt',
          icon: 'edit'
        }
      },
      {
        path: 'chatbot',
        name: 'AIChatBot',
        meta: {
          title: 'routes.aiChatbot',
          icon: 'message'
        }
      }
    ]
  },
  {
    path: '/admin/system',
    redirect: '/admin/system/registrar',
    meta: {
      title: 'routes.systemConfig',
      icon: 'system'
    },
    children: [
      {
        path: 'registrar',
        name: 'RegistrarManage',
        meta: {
          title: 'routes.registrarManage',
          icon: 'server'
        }
      },
      {
        path: 'backup',
        name: 'SystemBackup',
        meta: {
          title: 'routes.systemBackup',
          icon: 'download'
        }
      },
      {
        path: 'notification',
        name: 'NotificationConfig',
        meta: {
          title: 'routes.notificationConfig',
          icon: 'message'
        }
      },
      {
        path: 'profile',
        name: 'SecurityConfig',
        meta: {
          title: 'routes.securityConfig',
          icon: 'lock'
        }
      },
      {
        path: 'icons',
        name: 'IconLibrary',
        meta: {
          title: 'routes.iconLibrary',
          icon: 'star'
        }
      },
      {
        path: 'landing',
        name: 'LandingConfig',
        meta: {
          title: 'routes.landingConfig',
          icon: 'monitor'
        }
      }
    ]
  }
];

export default sidebarRoutes; 
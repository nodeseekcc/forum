import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    meta: {
      title: '首页',
      keepAlive: true,
    },
    component: () => import('@/views/Home.vue'),
  },
  {
    path: '/post/:id',
    name: 'post',
    meta: {
      title: '帖子',
    },
    component: () => import('@/views/Post.vue'),
  },
  {
    path: '/post/:id/edit',
    name: 'editPost',
    meta: {
      title: '编辑帖子',
    },
    component: () => import('@/views/EditPost.vue'),
  },
  {
    path: '/topics',
    name: 'topics',
    meta: {
      title: '话题',
    },
    component: () => import('@/views/Topic.vue'),
  },
  {
    path: '/topic/:id',
    name: 'topic',
    meta: {
      title: '话题详情',
    },
    component: () => import('@/views/Topic.vue'),
  },
  {
    path: '/anouncement',
    name: 'anouncement',
    meta: {
      title: '公告',
    },
    component: () => import('@/views/Anouncement.vue'),
  },
  {
    path: '/profile',
    name: 'profile',
    meta: {
      title: '我的',
    },
    component: () => import('@/views/Profile.vue'),
  },
  {
    path: '/u/:username',
    name: 'user',
    meta: {
      title: '用户详情',
    },
    component: () => import('@/views/User.vue'),
  },
  {
    path: '/messages/:id?',
    name: 'messages',
    meta: {
      title: '消息',
    },
    component: () => import('@/views/Messages.vue'),
  },
  {
    path: '/collection',
    name: 'collection',
    meta: {
      title: '收藏',
    },
    component: () => import('@/views/Collection.vue'),
  },
  {
    path: '/contacts',
    name: 'contacts',
    meta: {
      title: '好友',
    },
    component: () => import('@/views/Contacts.vue'),
  },
  {
    path: '/following',
    name: 'following',
    meta: {
      title: '关注',
    },
    component: () => import('@/views/Following.vue'),
  },
  {
    path: '/wallet',
    name: 'wallet',
    meta: {
      title: '钱包',
    },
    component: () => import('@/views/Wallet.vue'),
  },
  {
    path: '/setting',
    name: 'setting',
    meta: {
      title: '设置',
    },
    component: () => import('@/views/Setting.vue'),
  },
  {
    path: '/404',
    name: '404',
    meta: {
      title: '404',
    },
    component: () => import('@/views/404.vue'),
  },
  {
    path: '/:pathMatch(.*)',
    redirect: '/404',
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.name === 'home') {
    document.title = 'NodeSeek - A place for lovely people';
  } else {
    document.title = `${to.meta.title} | NodeSeek - A place for lovely people`;
  }
  
  // 设置页面描述
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', 'NodeSeek is a place for people who love web development, hosting, vps / server and other geek things');
  }
  
  next();
});

export default router;

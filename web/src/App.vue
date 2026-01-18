<template>
    <n-config-provider :theme="theme">
        <n-message-provider>
            <n-dialog-provider>
                <div
                    class="app-container"
                    :class="{ dark: theme?.name === 'dark', mobile: !store.state.desktopModelShow }"
                >
                    <div has-sider class="main-wrap" position="static" >
                        <!-- 侧边栏 -->
                        <div v-if="store.state.desktopModelShow">
                            <sidebar />
                        </div>

                        <div class="content-wrap">
                            <router-view
                                class="app-wrap"
                                v-slot="{ Component }"
                            >
                                <keep-alive>
                                    <component
                                        v-if="$route.meta.keepAlive"
                                        :is="Component"
                                    />
                                </keep-alive>
                                <component
                                    v-if="!$route.meta.keepAlive"
                                    :is="Component"
                                />
                            </router-view>
                        </div>

                        <!-- 右侧 -->
                        <rightbar />
                    </div>
                    <!-- 登录/注册公共组件 -->
                    <auth />
                </div>
            </n-dialog-provider>
        </n-message-provider>
        <n-global-style />
    </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useStore } from 'vuex';
import { darkTheme } from 'naive-ui';
import { getSiteProfile } from '@/api/site';

const store = useStore();
const theme = computed(() => (store.state.theme === 'dark' ? darkTheme : null));

function loadSiteProfile() {
  store.commit('loadDefaultSiteProfile');
  if (import.meta.env.VITE_USE_WEB_PROFILE.toLowerCase() === 'true') {
    getSiteProfile()
      .then((res) => {
        store.commit('updateSiteProfile', res);
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

onMounted(() => {
  loadSiteProfile();
});
</script>

<style lang="less">
@import '@/assets/css/main.less';
@import 'md-editor-v3/lib/style.css';

// 覆盖 md-editor-v3 的背景色
.md-editor {
  --md-bk-color: transparent !important;
  background-color: transparent !important;
  border: none !important;
}

.md-editor-preview-wrapper,
.md-editor-preview {
  background-color: transparent !important;
}

// 修复下拉菜单的z-index和背景
.md-editor-dropdown,
.md-editor-modal-container {
  z-index: 9999 !important;
}

.md-editor-dropdown-overlay {
  background-color: #fff !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.dark {
  .md-editor-dropdown-overlay {
    background-color: #18181c !important;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
  }
}
</style>
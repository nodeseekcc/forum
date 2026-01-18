<template>
    <n-modal
        v-model:show="store.state.authModalShow"
        class="auth-card"
        preset="card"
        size="small"
        :mask-closable="false"
        :bordered="false"
        :style="{
            width: '360px',
        }"
    >
        <div class="auth-wrap">
            <n-card :bordered="false">
                <div v-if="!store.state.profile.allowUserRegister">
                    <n-space justify="center"><n-h3><n-text type="success">账号登录</n-text></n-h3></n-space>
                    <n-form
                            ref="loginRef"
                            :model="loginForm"
                            :rules="{
                                username: {
                                    required: true,
                                    message: '请输入账户名',
                                },
                                password: {
                                    required: true,
                                    message: '请输入密码',
                                },
                            }"
                        >
                            <n-form-item-row label="账户" path="username">
                                <n-input
                                    v-model:value="loginForm.username"
                                    placeholder="请输入用户名"
                                    @keyup.enter.prevent="handleLogin"
                                />
                            </n-form-item-row>
                            <n-form-item-row label="密码" path="password">
                                <n-input
                                    type="password"
                                    show-password-on="mousedown"
                                    v-model:value="loginForm.password"
                                    placeholder="请输入账户密码"
                                    @keyup.enter.prevent="handleLogin"
                                />
                            </n-form-item-row>
                            <n-form-item-row label="验证" path="turnstileToken">
                                <div id="cf-turnstile-login" class="cf-turnstile"></div>
                            </n-form-item-row>
                        </n-form>
                        <n-button
                            type="primary"
                            block
                            secondary
                            strong
                            :loading="loading"
                            @click="handleLogin"
                        >
                            登录
                        </n-button>
                </div>
                <n-tabs
                    v-if="store.state.profile.allowUserRegister" 
                    :default-value="store.state.authModelTab"
                    size="large"
                    justify-content="space-evenly"
                >
                    <n-tab-pane name="signin" tab="登录" :key="'signin-tab'">
                        <n-form
                            ref="loginRef"
                            :model="loginForm"
                            :rules="{
                                username: {
                                    required: true,
                                    message: '请输入账户名',
                                },
                                password: {
                                    required: true,
                                    message: '请输入密码',
                                },
                            }"
                        >
                            <n-form-item-row label="账户" path="username">
                                <n-input
                                    v-model:value="loginForm.username"
                                    placeholder="请输入用户名"
                                    @keyup.enter.prevent="handleLogin"
                                />
                            </n-form-item-row>
                            <n-form-item-row label="密码" path="password">
                                <n-input
                                    type="password"
                                    show-password-on="mousedown"
                                    v-model:value="loginForm.password"
                                    placeholder="请输入账户密码"
                                    @keyup.enter.prevent="handleLogin"
                                />
                            </n-form-item-row>
                            <n-form-item-row label="验证" path="turnstileToken">
                                <div id="cf-turnstile-login" class="cf-turnstile"></div>
                            </n-form-item-row>
                        </n-form>
                        <n-button
                            type="primary"
                            block
                            secondary
                            strong
                            :loading="loading"
                            @click="handleLogin"
                        >
                            登录
                        </n-button>
                    </n-tab-pane>
                    <n-tab-pane name="signup" tab="注册" :key="'signup-tab'">
                        <n-form
                            ref="registerRef"
                            :model="registerForm"
                            :rules="registerRule"
                        >
                            <n-form-item-row label="用户名" path="username">
                                <n-input
                                    v-model:value="registerForm.username"
                                    placeholder="用户名注册后无法修改"
                                />
                            </n-form-item-row>
                            <n-form-item-row label="密码" path="password">
                                <n-input
                                    type="password"
                                    show-password-on="mousedown"
                                    placeholder="密码不少于6位"
                                    v-model:value="registerForm.password"
                                    @keyup.enter.prevent="handleRegister"
                                />
                            </n-form-item-row>
                            <n-form-item-row label="重复密码" path="repassword">
                                <n-input
                                    type="password"
                                    show-password-on="mousedown"
                                    placeholder="请再次输入密码"
                                    v-model:value="registerForm.repassword"
                                    @keyup.enter.prevent="handleRegister"
                                />
                            </n-form-item-row>
                            <n-form-item-row label="验证" path="turnstileToken" key="register-turnstile">
                                <div id="cf-turnstile-register" class="cf-turnstile" :key="'register-' + Date.now()"></div>
                            </n-form-item-row>
                        </n-form>
                        <n-button
                            type="primary"
                            block
                            secondary
                            strong
                            :loading="loading"
                            @click="handleRegister"
                        >
                            注册
                        </n-button>
                    </n-tab-pane>
                </n-tabs>
            </n-card>
        </div>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { userLogin, userRegister, userInfo } from '@/api/auth';
import type { FormInst, FormItemRule } from 'naive-ui';

const store = useStore();

const loading = ref(false);
const loginRef = ref<FormInst>();
const loginForm = reactive({
  username: '',
  password: '',
  turnstileToken: '',
});
const registerRef = ref<FormInst>();
const registerForm = reactive({
  username: '',
  password: '',
  repassword: '',
  turnstileToken: '',
});

let loginWidgetId: string | null = null;
let registerWidgetId: string | null = null;

const initTurnstile = () => {
  setTimeout(() => {
    if (typeof (window as any).turnstile === 'undefined') {
      initTurnstile();
      return;
    }

    const turnstile = (window as any).turnstile;
    
    // Initialize login widget
    const loginEl = document.getElementById('cf-turnstile-login');
    if (loginEl && !loginWidgetId) {
      try {
        loginWidgetId = turnstile.render('#cf-turnstile-login', {
          sitekey: '0x4AAAAAACNE5LticGNQrjTu',
          callback: (token: string) => {
            loginForm.turnstileToken = token;
          },
          'error-callback': () => {
            loginForm.turnstileToken = '';
          },
        });
        console.log('Login turnstile initialized:', loginWidgetId);
      } catch (e) {
        console.error('Login turnstile render error:', e);
      }
    }

    // Initialize register widget
    const registerEl = document.getElementById('cf-turnstile-register');
    if (registerEl && !registerWidgetId && store.state.profile.allowUserRegister) {
      try {
        registerWidgetId = turnstile.render('#cf-turnstile-register', {
          sitekey: '0x4AAAAAACNE5LticGNQrjTu',
          callback: (token: string) => {
            registerForm.turnstileToken = token;
          },
          'error-callback': () => {
            registerForm.turnstileToken = '';
          },
        });
        console.log('Register turnstile initialized:', registerWidgetId);
      } catch (e) {
        console.error('Register turnstile render error:', e);
      }
    }
  }, 300);
};

const resetTurnstile = () => {
  if (typeof (window as any).turnstile !== 'undefined') {
    const turnstile = (window as any).turnstile;
    if (loginWidgetId) {
      try {
        turnstile.reset(loginWidgetId);
      } catch (e) {}
      loginForm.turnstileToken = '';
    }
    if (registerWidgetId) {
      try {
        turnstile.reset(registerWidgetId);
      } catch (e) {}
      registerForm.turnstileToken = '';
    }
  }
};

const cleanupTurnstile = () => {
  if (typeof (window as any).turnstile !== 'undefined') {
    const turnstile = (window as any).turnstile;
    if (loginWidgetId) {
      try {
        turnstile.remove(loginWidgetId);
      } catch (e) {}
      loginWidgetId = null;
      loginForm.turnstileToken = '';
    }
    if (registerWidgetId) {
      try {
        turnstile.remove(registerWidgetId);
      } catch (e) {}
      registerWidgetId = null;
      registerForm.turnstileToken = '';
    }
  }
};

watch(() => store.state.authModalShow, (newVal) => {
  if (newVal) {
    initTurnstile();
  } else {
    cleanupTurnstile();
  }
});

watch(() => store.state.authModelTab, () => {
  // Tab panes have keys, so Vue will rebuild DOM automatically
  // Just need to reinitialize
  if (store.state.authModalShow) {
    setTimeout(() => {
      initTurnstile();
    }, 350);
  }
});

const registerRule = {
  username: {
    required: true,
    message: '请输入账户名',
  },
  password: {
    required: true,
    message: '请输入密码',
  },
  repassword: [
    {
      required: true,
      message: '请输入密码',
    },
    {
      validator: (rule: FormItemRule, value: any) => {
        return (
          !!registerForm.password &&
          registerForm.password.startsWith(value) &&
          registerForm.password.length >= value.length
        );
      },
      message: '两次密码输入不一致',
      trigger: 'input',
    },
  ],
};
const handleLogin = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  loginRef.value?.validate((errors) => {
    if (!errors) {
      if (!loginForm.turnstileToken) {
        window.$message.error('请完成人机验证');
        return;
      }

      loading.value = true;

      userLogin({
        username: loginForm.username,
        password: loginForm.password,
        turnstile_token: loginForm.turnstileToken,
      })
        .then((res) => {
          const token = res?.token || '';
          // 写入用户信息
          localStorage.setItem('PAOPAO_TOKEN', token);

          return userInfo(token);
        })
        .then((res) => {
          window.$message.success('登录成功');
          loading.value = false;

          store.commit('updateUserinfo', res);
          store.commit('triggerAuth', false);
          store.commit('refresh');
          loginForm.username = '';
          loginForm.password = '';
          loginForm.turnstileToken = '';
          resetTurnstile();
        })
        .catch((err) => {
          loading.value = false;
          resetTurnstile();
        });
    }
  });
};

const handleRegister = (e: Event) => {
  e.preventDefault();
  e.stopPropagation();

  registerRef.value?.validate((errors) => {
    if (!errors) {
      if (!registerForm.turnstileToken) {
        window.$message.error('请完成人机验证');
        return;
      }

      loading.value = true;

      userRegister({
        username: registerForm.username,
        password: registerForm.password,
        turnstile_token: registerForm.turnstileToken,
      })
        .then((res) => {
          return userLogin({
            username: registerForm.username,
            password: registerForm.password,
            turnstile_token: registerForm.turnstileToken,
          });
        })
        .then((res) => {
          const token = res?.token || '';
          // 写入用户信息
          localStorage.setItem('PAOPAO_TOKEN', token);

          return userInfo(token);
        })
        .then((res) => {
          window.$message.success('注册成功');
          loading.value = false;

          store.commit('updateUserinfo', res);
          store.commit('triggerAuth', false);
          registerForm.username = '';
          registerForm.password = '';
          registerForm.repassword = '';
          registerForm.turnstileToken = '';
          resetTurnstile();
        })
        .catch((err) => {
          loading.value = false;
          resetTurnstile();
        });
    }
  });
};

onMounted(() => {
  const token = localStorage.getItem('PAOPAO_TOKEN') || '';
  if (token) {
    userInfo(token)
      .then((res) => {
        store.commit('updateUserinfo', res);
        store.commit('triggerAuth', false);
      })
      .catch((err) => {
        store.commit('userLogout');
      });
  } else {
    store.commit('userLogout');
  }
});
</script>

<style lang="less" scoped>
.auth-wrap {
    margin-top: -30px;
}
.cf-turnstile {
    width: 100%;
    display: flex;
    justify-content: center;
}
.dark {
    .auth-wrap {
        background-color: rgba(16, 16, 20, 0.75);
    }
}
</style>
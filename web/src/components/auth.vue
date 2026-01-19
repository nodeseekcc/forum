<template>
    <!-- Login Modal -->
    <n-modal
        v-model:show="showLoginModal"
        class="auth-card"
        preset="card"
        size="small"
        title="账号登录"
        :mask-closable="false"
        :bordered="false"
        :style="{
            width: '360px',
        }"
    >
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
        <div v-if="store.state.profile.allowUserRegister" style="text-align: center; margin-top: 16px;">
            <n-button text @click="switchToRegister">没有账号？立即注册</n-button>
        </div>
    </n-modal>

    <!-- Register Modal -->
    <n-modal
        v-model:show="showRegisterModal"
        class="auth-card"
        preset="card"
        size="small"
        title="用户注册"
        :mask-closable="false"
        :bordered="false"
        :style="{
            width: '360px',
        }"
    >
        <n-form
            ref="registerRef"
            :model="registerForm"
            :rules="registerRule"
        >
            <n-form-item-row label="用户名" path="username">
                <n-input
                    v-model:value="registerForm.username"
                    placeholder="3-12位字母或数字"
                    @input="handleUsernameInput"
                />
            </n-form-item-row>
            <n-form-item-row label="密码" path="password">
                <n-input
                    type="password"
                    show-password-on="mousedown"
                    placeholder="6-16位字符"
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
            <n-form-item-row label="验证" path="turnstileToken">
                <div id="cf-turnstile-register" class="cf-turnstile"></div>
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
        <div style="text-align: center; margin-top: 16px;">
            <n-button text @click="switchToLogin">已有账号？立即登录</n-button>
        </div>
    </n-modal>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
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

// Computed properties to sync with store
const showLoginModal = computed({
  get: () => store.state.authModalShow && store.state.authModelTab === 'signin',
  set: (val) => {
    if (!val) {
      store.commit('triggerAuth', false);
    }
  }
});

const showRegisterModal = computed({
  get: () => store.state.authModalShow && store.state.authModelTab === 'signup',
  set: (val) => {
    if (!val) {
      store.commit('triggerAuth', false);
    }
  }
});

const switchToRegister = () => {
  store.commit('triggerAuthKey', 'signup');
};

const switchToLogin = () => {
  store.commit('triggerAuthKey', 'signin');
};

const initLoginTurnstile = () => {
  setTimeout(() => {
    if (typeof (window as any).turnstile === 'undefined') {
      initLoginTurnstile();
      return;
    }

    const turnstile = (window as any).turnstile;
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
      } catch (e) {
        console.error('Login turnstile error:', e);
      }
    }
  }, 300);
};

const initRegisterTurnstile = () => {
  setTimeout(() => {
    if (typeof (window as any).turnstile === 'undefined') {
      initRegisterTurnstile();
      return;
    }

    const turnstile = (window as any).turnstile;
    const registerEl = document.getElementById('cf-turnstile-register');
    if (registerEl && !registerWidgetId) {
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
      } catch (e) {
        console.error('Register turnstile error:', e);
      }
    }
  }, 300);
};

const cleanupLoginTurnstile = () => {
  if (typeof (window as any).turnstile !== 'undefined' && loginWidgetId) {
    try {
      (window as any).turnstile.remove(loginWidgetId);
    } catch (e) {}
    loginWidgetId = null;
    loginForm.turnstileToken = '';
  }
};

const cleanupRegisterTurnstile = () => {
  if (typeof (window as any).turnstile !== 'undefined' && registerWidgetId) {
    try {
      (window as any).turnstile.remove(registerWidgetId);
    } catch (e) {}
    registerWidgetId = null;
    registerForm.turnstileToken = '';
  }
};

watch(showLoginModal, (newVal) => {
  if (newVal) {
    initLoginTurnstile();
  } else {
    cleanupLoginTurnstile();
  }
});

watch(showRegisterModal, (newVal) => {
  if (newVal) {
    initRegisterTurnstile();
  } else {
    cleanupRegisterTurnstile();
  }
});

const handleUsernameInput = (value: string) => {
  // 只保留字母和数字
  registerForm.username = value.replace(/[^a-zA-Z0-9]/g, '');
};

const registerRule = {
  username: [
    {
      required: true,
      message: '请输入用户名',
    },
    {
      validator: (rule: FormItemRule, value: string) => {
        if (!value) return true;
        if (value.length < 3 || value.length > 12) {
          return false;
        }
        return /^[a-zA-Z0-9]+$/.test(value);
      },
      message: '用户名为3-12位字母或数字',
      trigger: 'blur',
    },
  ],
  password: [
    {
      required: true,
      message: '请输入密码',
    },
    {
      validator: (rule: FormItemRule, value: string) => {
        if (!value) return true;
        return value.length >= 6 && value.length <= 16;
      },
      message: '密码长度为6-16位',
      trigger: 'blur',
    },
  ],
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
        })
        .catch((err) => {
          loading.value = false;
          cleanupLoginTurnstile();
          initLoginTurnstile();
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
          // 注册成功，后端已返回token，直接使用
          const token = res?.token || '';
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
        })
        .catch((err) => {
          // 注册失败
          loading.value = false;
          cleanupRegisterTurnstile();
          initRegisterTurnstile();
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
.cf-turnstile {
    width: 100%;
    display: flex;
    justify-content: center;
}
</style>

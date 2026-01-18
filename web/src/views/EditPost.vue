<template>
    <div>
        <main-nav title="编辑帖子" :back="true" />

        <n-list class="main-content-wrap edit-post-wrap" bordered>
            <n-spin :show="loading">
                <div class="editor-container" v-if="!loading">
                    <md-editor
                        v-model="content"
                        :theme="isDark ? 'dark' : 'light'"
                        language="zh-CN"
                        :toolbars="toolbars"
                        :preview="true"
                        placeholder="在这里输入您的内容，支持Markdown语法..."
                        style="height: 600px;"
                        @onUploadImg="handleUploadImg"
                    />
                    
                    <div class="action-bar">
                        <n-space>
                            <n-button @click="handleCancel">取消</n-button>
                            <n-button 
                                type="primary" 
                                @click="handleSave"
                                :loading="saving"
                            >
                                保存
                            </n-button>
                        </n-space>
                    </div>
                </div>
            </n-spin>
        </n-list>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getPost, updatePost } from '@/api/post';
import { MdEditor } from 'md-editor-v3';
import { useStore } from 'vuex';
import { request } from '@/utils/request';

const route = useRoute();
const router = useRouter();
const store = useStore();
const loading = ref(true);
const saving = ref(false);
const content = ref('');
const postId = computed(() => +(route.params.id as string));
const isDark = computed(() => store.state.theme === 'dark');
const uploadGateway = import.meta.env.VITE_HOST + '/v1/attachment';
const uploadToken = computed(() => 'Bearer ' + localStorage.getItem('PAOPAO_TOKEN'));

// 配置工具栏
const toolbars = [
    'bold',
    'underline',
    'italic',
    '-',
    'title',
    'strikeThrough',
    'sub',
    'sup',
    'quote',
    'unorderedList',
    'orderedList',
    'task',
    '-',
    'codeRow',
    'code',
    'link',
    'image',
    'table',
    '-',
    'revoke',
    'next',
    '=',
    'pageFullscreen',
    'fullscreen',
    'preview',
    'catalog',
];

const loadPost = () => {
    loading.value = true;
    getPost({
        id: postId.value,
    })
        .then((res) => {
            console.log('getPost response:', res);
            console.log('res type:', typeof res);
            console.log('res.contents:', res.contents);
            console.log('res.contents type:', typeof res.contents);
            console.log('is array?', Array.isArray(res.contents));
            console.log('length:', res.contents?.length);
            
            // res 直接就是 PostProps 对象，不是 { content: PostProps }
            // PostProps 有 contents 数组，里面 type=1或2 的是文本内容
            if (res?.contents && Array.isArray(res.contents) && res.contents.length > 0) {
                console.log('进入 contents 处理');
                const textContent = res.contents.find(
                    (item: any) => {
                        const itemType = +item.type;
                        console.log('检查 item:', item, 'type:', itemType);
                        return itemType === 1 || itemType === 2;
                    }
                );
                console.log('found textContent:', textContent);
                if (textContent?.content) {
                    console.log('原始内容:', textContent.content);
                    console.log('内容长度:', textContent.content.length);
                    console.log('是否包含\\n字符串:', textContent.content.includes('\\n'));
                    console.log('是否包含换行符:', textContent.content.includes('\n'));
                    console.log('前100个字符:', textContent.content.substring(0, 100));
                    
                    content.value = textContent.content;
                    console.log('设置内容成功，长度:', content.value.length);
                } else {
                    console.warn('textContent 没有 content 字段');
                }
            } else {
                console.warn('条件不满足');
                console.warn('res存在?', !!res);
                console.warn('res.contents存在?', !!res?.contents);
                console.warn('是数组?', Array.isArray(res?.contents));
                console.warn('长度>0?', res?.contents?.length > 0);
            }
            loading.value = false;
        })
        .catch((err) => {
            console.error('Load post error:', err);
            window.$message.error('加载帖子失败');
            loading.value = false;
            router.back();
        });
};

const handleSave = () => {
    if (!content.value.trim()) {
        window.$message.warning('内容不能为空');
        return;
    }
    
    saving.value = true;
    
    // 调试：检查内容中的换行符
    console.log('原始内容:', content.value);
    console.log('内容长度:', content.value.length);
    console.log('是否包含\\n:', content.value.includes('\\n'));
    console.log('是否包含实际换行:', content.value.includes('\n'));
    console.log('前50个字符:', content.value.substring(0, 50));
    
    const payload = {
        id: postId.value,
        contents: [{
            content: content.value,
            type: 2, // TEXT 类型
            sort: 100,
        }],
        attachment_price: 0,
    };
    console.log('发送更新请求:', payload);
    
    updatePost(payload)
        .then((res) => {
            console.log('更新成功:', res);
            window.$message.success('保存成功');
            saving.value = false;
            router.push({
                name: 'post',
                params: { id: String(postId.value) }
            });
        })
        .catch((err) => {
            console.error('更新失败:', err);
            saving.value = false;
            window.$message.error('保存失败: ' + (err.msg || err.message || '未知错误'));
        });
};

const handleCancel = () => {
    router.back();
};

// 处理图片上传
const handleUploadImg = async (files: File[], callback: (urls: string[]) => void) => {
    const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'public/image');
        
        try {
            const response = await fetch(uploadGateway, {
                method: 'POST',
                headers: {
                    'Authorization': uploadToken.value,
                },
                body: formData,
            });
            
            const result = await response.json();
            
            if (result.code === 0) {
                return result.data.content;
            } else {
                window.$message.error('上传失败: ' + (result.msg || '未知错误'));
                return '';
            }
        } catch (error) {
            console.error('Upload error:', error);
            window.$message.error('上传失败');
            return '';
        }
    });
    
    const urls = await Promise.all(uploadPromises);
    callback(urls.filter(url => url !== ''));
};

onMounted(() => {
    loadPost();
});
</script>

<style lang="less" scoped>
.edit-post-wrap {
    padding: 20px;
    min-height: calc(100vh - 60px);
}

.editor-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.action-bar {
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
    border-top: 1px solid #e0e0e0;
}

.dark {
    .action-bar {
        border-top-color: #3b434b;
    }
}
</style>

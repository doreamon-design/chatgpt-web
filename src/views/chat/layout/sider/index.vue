<script setup lang='ts'>
import type { CSSProperties } from 'vue'
import { computed, ref, watch } from 'vue'
import doreamon from '@zodash/doreamon'
import { NLayoutSider } from 'naive-ui'
import List from './List.vue'
import Footer from './Footer.vue'
import { useAppStore, useChatStore } from '@/store'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { PromptStore } from '@/components/common'

const appStore = useAppStore()
const chatStore = useChatStore()

// const dialog = useDialog()

const { isMobile } = useBasicLayout()
const show = ref(false)

const collapsed = computed(() => appStore.siderCollapsed)

function handleAdd() {
  chatStore.addHistory({ title: 'New Chat', uuid: doreamon.uuid(), isEdit: false })
}

function handleUpdateCollapsed() {
  appStore.setSiderCollapsed(!collapsed.value)
}

const getMobileClass = computed<CSSProperties>(() => {
  if (isMobile.value) {
    return {
      position: 'fixed',
      zIndex: 50,
    }
  }
  return {}
})

const mobileSafeArea = computed(() => {
  if (isMobile.value) {
    return {
      paddingBottom: 'env(safe-area-inset-bottom)',
    }
  }
  return {}
})

const isInIframe = computed(() => {
  try {
    return window.self !== window.top
  }
  catch (e) {
    return true
  }
})

watch(
  isMobile,
  (val) => {
    appStore.setSiderCollapsed(val)
  },
  {
    immediate: true,
    flush: 'post',
  },
)
</script>

<template>
  <NLayoutSider
    :collapsed="collapsed"
    :collapsed-width="0"
    :width="260"
    :show-trigger="isMobile ? false : 'arrow-circle'"
    collapse-mode="transform"
    position="absolute"
    bordered
    :style="getMobileClass"
    @update-collapsed="handleUpdateCollapsed"
  >
    <div class="flex flex-col h-full" :style="mobileSafeArea">
      <main class="flex flex-col flex-1 min-h-0">
        <div class="p-4">
          <!-- <NButton dashed block @click="handleAdd">
            {{ $t('chat.newChatButton') }}
          </NButton> -->
          <button
            class="new-chat-btn"
            @click="handleAdd"
          >
            {{ $t('chat.newChatButton') }}
          </button>
        </div>
        <div class="flex-1 min-h-0 pb-4 overflow-hidden">
          <List />
        </div>
        <div class="p-4">
          <!-- <NButton block @click="show = true">
            {{ $t('store.siderButton') }}
          </NButton> -->

          <button class="prompt-store-btn" @click="show = true">
            {{ $t('store.siderButton') }}
          </button>
        </div>
      </main>
      <Footer v-if="!isInIframe" />
    </div>
  </NLayoutSider>
  <template v-if="isMobile">
    <div v-show="!collapsed" class="fixed inset-0 z-40 w-full h-full bg-black/40" @click="handleUpdateCollapsed" />
  </template>
  <PromptStore v-model:visible="show" />
</template>

<style lang="less" scoped>
  .new-chat-btn {
    height: 34px;
    width: 100%;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;

    &:hover {
      color: #40a9ff;
      border-color: #40a9ff;
    }
  }

  .prompt-store-btn {
    height: 34px;
    width: 100%;
    border: 1px solid #d9d9d9;
    border-radius: 4px;

    &:hover {
      color: #40a9ff;
      border-color: #40a9ff;
    }
  }
</style>

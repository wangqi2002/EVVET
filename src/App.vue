<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="main-container flex">
      <!-- <BaseSide /> -->
      <div w="full">
        <!-- <RouterView /> -->
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </el-config-provider>
</template>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.main-container {
  height: calc(100vh - var(--ep-menu-item-height) - 4px);
  overflow: auto;
}
</style>

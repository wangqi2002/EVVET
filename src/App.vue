<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="main-container flex">
      <BaseSide />
      <div w="full" py="4">
        <RouterView />
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

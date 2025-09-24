<template>
  <div
    v-if="visible"
    class="floating-window"
    :style="{
      left: pos.x + 'px',
      top: pos.y + 'px',
      zIndex: zIndex,
      width: width + 'px',
    }"
    @mousedown.stop
  >
    <div class="fw-header" @pointerdown.prevent="onPointerDown">
      <div class="fw-title"><slot name="title">Floating Window</slot></div>
      <div class="fw-actions">
        <button class="fw-close" @click="close">×</button>
      </div>
    </div>
    <div class="fw-body" :style="{ maxHeight: maxHeight + 'px' }">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed } from "vue";

const props = defineProps<{
  width?: number;
  maxHeight?: number;
  initialX?: number;
  initialY?: number;
  z?: number;
}>();

const visible = ref(true);
const width = computed(() => props.width ?? 320);
const maxHeight = computed(() => props.maxHeight ?? 400);
const pos = ref({ x: props.initialX ?? 120, y: props.initialY ?? 120 });
const zIndex = ref(props.z ?? 9999);

let dragging = false;
let startX = 0;
let startY = 0;
let startLeft = 0;
let startTop = 0;

function onPointerDown(e: PointerEvent) {
  const el = e.target as HTMLElement;
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
  startLeft = pos.value.x;
  startTop = pos.value.y;
  try {
    el.setPointerCapture?.((e as PointerEvent).pointerId);
  } catch (e) {}
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
}

function onPointerMove(e: PointerEvent) {
  if (!dragging) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;
  pos.value.x = Math.round(startLeft + dx);
  pos.value.y = Math.round(startTop + dy);
}

function onPointerUp() {
  dragging = false;
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
}

function close() {
  visible.value = false;
}

onBeforeUnmount(() => {
  window.removeEventListener("pointermove", onPointerMove);
  window.removeEventListener("pointerup", onPointerUp);
});
</script>

<style scoped lang="scss">
.floating-window {
  position: fixed;
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  overflow: hidden;
  user-select: none;
}
.fw-header {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  cursor: grab;
  background: linear-gradient(90deg, #f5f7fa, #eef3ff);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
.fw-title {
  font-weight: 600;
  font-size: 13px;
  color: #333;
}
.fw-actions {
  display: flex;
  align-items: center;
}
.fw-close {
  border: none;
  background: transparent;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
}
.fw-body {
  padding: 12px;
  min-height: 60px;
  overflow-y: auto;
  box-sizing: border-box;
}
</style>

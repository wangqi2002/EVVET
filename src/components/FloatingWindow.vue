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
      <div v-if="isObject(dataSrc)">
        <JsonTree :data="dataSrc" />
      </div>
      <div v-else class="json-leaf">
        {{ String(dataSrc) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount, computed, defineComponent, h } from "vue";

const props = defineProps<{
  width?: number;
  maxHeight?: number;
  initialX?: number;
  initialY?: number;
  z?: number;
  data?: Record<string, any> | any[] | null;
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
  } catch {}
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

const dataSrc = computed(() => props.data ?? {});

function isObject(v: any) {
  return v !== null && typeof v === "object";
}

// 递归树组件：使用 <details>/<summary> 提供折叠交互
const JsonTree = defineComponent({
  name: "JsonTree",
  props: {
    data: { type: [Object, Array], required: true },
    depth: { type: Number, default: 0 },
  },
  setup(props) {
    const renderNode = (key: string | number | null, val: any, depth = 0) => {
      const nodeKey = key === null ? "" : String(key);
      if (val === null || typeof val !== "object") {
        return h(
          "div",
          { class: "json-leaf", style: { paddingLeft: `${depth * 12}px` } },
          [
            nodeKey ? h("span", { class: "kv-key" }, nodeKey + ": ") : null,
            h("span", { class: "kv-val" }, String(val)),
          ]
        );
      } else {
        const summaryText = nodeKey
          ? `${nodeKey}: ${Array.isArray(val) ? "[Array]" : "{Object}"}`
          : Array.isArray(val)
            ? "[Array]"
            : "{Object}";
        return h("details", { class: "json-node" }, [
          h(
            "summary",
            { style: { paddingLeft: `${depth * 12}px` } },
            summaryText
          ),
          h(
            "div",
            { class: "json-children" },
            Object.entries(val).map(([k, v]) => renderNode(k, v, depth + 1))
          ),
        ]);
      }
    };

    return () => {
      const root = props.data;
      if (root === null || typeof root !== "object") {
        return h("div", { class: "json-leaf" }, String(root));
      }
      return h(
        "div",
        { class: "json-tree" },
        Object.entries(root).map(([k, v]) => renderNode(k, v, props.depth))
      );
    };
  },
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
  /* 改动：内容左对齐 */
  text-align: left;
}

/* 树形样式 */
.json-tree {
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
  font-size: 13px;
  color: #222;
  /* 确保树内文本左对齐 */
  text-align: left;
}
.json-node summary {
  cursor: pointer;
  list-style: none;
  outline: none;
  padding: 4px 0;
  font-weight: 600;
  /* 改动：将 summary 块级化以避免居中或内联对齐问题 */
  display: block;
}
.json-leaf {
  padding: 2px 0;
  /* 确保叶子节点左对齐 */
  text-align: left;
}
.kv-key {
  color: #444;
  margin-right: 6px;
}
.kv-val {
  color: #1a1a1a;
}
</style>

<script setup lang="ts">
import { ElMessage } from "element-plus";
import { ref } from "vue";

defineProps<{ msg: string }>();

const count = ref(0);
const input = ref("element-plus");

const curDate = ref("");

function toast() {
  ElMessage.success("Hello");
}

const value1 = ref(true);
</script>

<template>
  <h2 color="$ep-color-primary">
    electron + Vite + Vue3 + element plus + TypeScript
  </h2>

  <p>
    See
    <a href="https://chat.deepseek.com/" target="_blank">AI-Assistant! EVVET</a>
    for more information.
  </p>

  <!-- example components -->
  <div class="mb-4">
    <el-button size="large" @click="toast"> El Message </el-button>

    <MessageBoxDemo />
  </div>

  <div class="my-2 flex flex-wrap items-center justify-center text-center">
    <el-button @click="count++"> count is: {{ count }} </el-button>
    <el-button type="primary" @click="count++">
      count is: {{ count }}
    </el-button>
    <el-button type="success" @click="count++">
      count is: {{ count }}
    </el-button>
    <el-button type="warning" @click="count++">
      count is: {{ count }}
    </el-button>
    <el-button type="danger" @click="count++">
      count is: {{ count }}
    </el-button>
    <el-button type="info" @click="count++"> count is: {{ count }} </el-button>
  </div>

  <div>
    <el-tag type="success" class="m-1"> Tag 1 </el-tag>
    <el-tag type="warning" class="m-1"> Tag 1 </el-tag>
    <el-tag type="danger" class="m-1"> Tag 1 </el-tag>
    <el-tag type="info" class="m-1"> Tag 1 </el-tag>
  </div>

  <div>
    <el-switch v-model="value1" />
    <el-switch
      v-model="value1"
      class="m-2"
      style="--ep-switch-on-color: black; --ep-switch-off-color: gray"
    />
  </div>

  <div class="my-2">
    <el-input v-model="input" class="m-2" style="width: 200px" />
    <el-date-picker
      v-model="curDate"
      class="m-2"
      type="date"
      placeholder="Pick a day"
    />
  </div>
</template>

<style>
.ep-button {
  margin: 4px;
}
.ep-button + .ep-button {
  margin-left: 0;
  margin: 4px;
}
</style>

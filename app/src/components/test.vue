<template>
  <div class="grid-container">
    <div v-for="(item, index) in items" :key="index" class="grid-item" :class="{ selected: selectedItem === item }"
      @click.prevent="selectItem(item)">
      {{ item }}
    </div>
  </div>
</template>
<script></script>
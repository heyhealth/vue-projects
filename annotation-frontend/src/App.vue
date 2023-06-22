<template>
  <div>
    <a-config-provider :locale="zh_CN">
      <div id="app">
        <router-view/>
      </div>
    </a-config-provider>
  </div>
</template>

<script>
import zh_CN from "ant-design-vue/lib/locale-provider/zh_CN";

export default {
  name: "App",
  data() {
    return {
      zh_CN,
    };
  },
};
</script>
<style lang="less">
#app {
  font-family: MicrosoftYaHei, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: white;
  width: 100%;
  height: 100%;
  min-width: 1360px; /*no*/
  overflow: hidden;
  overflow-x: auto;
  // background:@shense-color;
  ::v-deep .ant-select-selection {
    background: #203c72 !important;
    border: 0;
  }
}
</style>

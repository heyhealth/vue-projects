import 'ant-design-vue/dist/antd.css';
import VueQuillEditor  from 'vue-quill-editor'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
import './utils/rem'; // rem自适应
import Vue from 'vue';
import App from './App.vue';
import VueRouter from "vue-router";
import * as echarts from 'echarts';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import router from './router/index'
Vue.prototype.$bus = new Vue()
Vue.use(ElementUI);
Vue.use(VueQuillEditor);
Vue.use(VueRouter)
Vue.config.productionTip = false;

Vue.prototype.router = router;
Vue.prototype.$echarts = echarts;
//Vue.prototype.$confirm = MessageBox.confirm;
// Vue.prototype.$md5 = md5;
//Vue.use(Antd);
new Vue({
    router,
    el:'#app',
    render: (h) => h(App),
}).$mount("#app");


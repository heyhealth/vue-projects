// 该文件专门用于创建整个应用的路由器

// 引入路由器
import VueRouter from 'vue-router'
// 引入登录组件
import AudioLabel from '../views/audioLabel/index.vue'
import AudioUpLoad from '../views/audioUpLoad/index.vue'
// 创建并且暴露文件一个路由器
export default new VueRouter({
    // 配置路由 本质是一个数组，在里面配置多组路由，每一个路由都是一个key和value映射对象
    routes: [
        // 路由默认跳转
        {
            // path: '/', // 如果路由为/
            path: '*', // 如果路由为*
            redirect: '/audioLabel' //重定向到音频标注组件
        },
        // 音频标注组件路由
        {
            path: '/audioLabel',
            component: AudioLabel,
            name: "AudioLabel"
        },
        // 音频上传预览组件路由
        {
            path: '/audioUpLoad',
            component: AudioUpLoad,
            name: "AudioUpLoad"
        },

    ]
})


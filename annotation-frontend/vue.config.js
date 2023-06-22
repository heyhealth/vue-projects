// vue.config.js vue配置项
const path = require('path');
//cnpm install --save-dev compression-webpack-plugin插件需要npm安装
// const CompressionPlugin = require('compression-webpack-plugin');
const webpack = require('webpack')
function resolve (dir) {
  return path.join(__dirname, dir)
}
// 全局less样式
const theme = path.resolve(__dirname, './src/styles/theme.less');
// 引入等比适配插件
const px2rem = require('postcss-px2rem')
// 配置基本大小
const postcss = px2rem({
  // 基准大小 baseSize，需要和rem.js中相同
  remUnit: 100
})
module.exports = {
  /**
   * 基本路径, 
   * 为空: ""
   * 相对路径: "./"
   * 配置根路径: "/my-app/", https://www.foobar.com/my-app/
   * 开发和打包环境区分配置: process.env.NODE_ENV === 'production'? '/my-app/':'./'    /emotion/xbox    /trial-service
   */
  publicPath: "/annotation-service",
  // 构建输出目录
  outputDir: "dist",
  // 放置静态资源的目录
  assetsDir: "static",
  // html 输出路径
  indexPath: "index.html",
  // 文件名hash
  filenameHashing: true,
  // 编译时是否检测, true,false,error(会报错编译失败)
  lintOnSave: true,
  // 是否生成map文件
  productionSourceMap: true,
  // webpack相关配置
  chainWebpack: (config) => {
    //svg相关配置
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()
    // 第1个参数：别名，第2个参数：路径  （设置路径别名）
    config.resolve.alias
      .set('@', resolve('src'))
      .set('@store', resolve('./src/store'))
      .set('assets', resolve('src/assets'))
      .set('components', resolve('src/components'))
    // 省略后缀名，如果这样  import 'index',那么首先找‘index.js’,找不到后会找‘index.vue’,以此类推
    config.resolve.extensions.merge(['.js', '.vue', '.json']);
    // 引入全局less文件
    const types = ['vue-modules', 'vue', 'normal-modules', 'normal']
    types.forEach(type => {
      config.module.rule('less').oneOf(type)
        .use('style-resource')
        .loader('style-resources-loader')
        .options({
          patterns: [theme]
        })
    });
  },
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        $: 'jquery',
        jquery: 'jquery',
        jQuery: 'jquery',
        'windows.jQuery': 'jquery'
      })
    ],

    // output: {
    //   /*通过devtoolModuleFilenameTemplate，分离出要调试的源代码,方便查看和调试*/
    //   devtoolModuleFilenameTemplate: (info) => {
    //     const resPath = info.resourcePath;
    //     if ((/\.vue$/.test(resPath) && info.allLoaders !== '') || /node_modules/.test(resPath)) {
    //       return `webpack:///${resPath}?${info.hash}`;
    //     }
    //     return `webpack:///${resPath.replace('./src', 'SouceCode')}`;
    //   },
    // }
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [postcss]
      }
    }
  },

  // 代理
   devServer: 
   {
      port: 8899,//自己的接口
      open: true,
      overlay: 
	  {
        warnings: false,
        errors: true
      },
      proxy:
		{
        '/api/*':
		{ 
            target:"http://music.163.com",///song/media/outer/url?id=447925558.mp3",//对应后台接口
            changeOrigin:true,//是否跨域
            ws:true,
            pathRewrite:
			{//重定向
                '^/api':""
            },
        },
    },
	},
}
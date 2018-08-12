// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import router from './router'
import App from './App'
import axios from 'axios'
import VueLazyLoad from 'vue-lazyload';
import ElementUI from 'element-ui';
import '@/assets/js/flexible'
import '@/assets/css/style.css'
import '@/assets/js/xy.js'
import service from '@/assets/js/service.js'
import 'element-ui/lib/theme-chalk/index.css'

//加载element-ui
Vue.use(ElementUI)
//公用方法
Vue.use(service)
//注册axios
Vue.prototype.$http = axios
//懒加载图片
Vue.use(VueLazyLoad,{
  error:'./static/error.png',
  loading:'./static/loading.png'
})
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: h => h(App)
})

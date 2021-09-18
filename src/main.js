// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
//引入element 按需引入
import 'element-ui/lib/theme-chalk/index.css'
import './plugins/element'
//引入axios
import axios from 'axios'
//通过一个vue实例实现跨组件数据通信
import instance from './plugins/instance'
//通过观察者实现跨组件数据传递
import Observe from './plugins/Observe'
//引入全局函数
import {Utils} from './utils'
//引入vuex
import store from './store'
//引入markdown富文本编辑器 mavon-editor
import mavonEditor from 'mavon-editor'
import 'mavon-editor/dist/css/index.css'

Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.prototype.$bus = Observe;

Vue.use(instance);
Vue.use(Utils);
Vue.use(mavonEditor);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})

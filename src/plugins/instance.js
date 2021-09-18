/*
通过一个vue实例实现跨组件数据通信 仅适用于1个对一个，对一对多不使用，原因：一对多时，一个解绑，全部解绑了
*/

const instance = {
    install(Vue,options){
        Vue.prototype.$instance = new Vue();
    }
};

export default instance;
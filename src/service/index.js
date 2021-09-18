/*
* axios请求全局配置
* */
import Vue from 'vue';
import axios from 'axios';
import config from './config'

const isDev = process.env.NODE_ENV === "development"

//创建一个axios
const service = axios.create(config);

//请求拦截
service.interceptors.request.use((config) => {
  console.log("config========>",config);
  return config;
},(error) => {
  return Promise.reject(error);
});

//返回状态判断/相应拦截
service.interceptors.response.use((res) => {
  const Notification = Vue.prototype.$notify;
  let _data = null;
  console.info('====>', '返回状态判断');
  if (res.data.code || res.data.code === 0 || res.data.data || res.data.data === 0) {
    switch (res.data.code) {
      case 200:
            _data = res.data.data;
        break;
      case -1:
        console.error(`请求失败: ${res.config.url} ${JSON.stringify(res.config)}`);
        _data = Promise.reject(res.data);
        break;
      default:
        _data = Promise.reject(res.data);
        break;
    }
  } else {
    _data = res.data;
  }

  return _data;
}, (error) => {
  const Notification = Vue.prototype.$notify

  if (error.response) {
    // http请求状态码
    let httpStateCode = getHttpStateCode(error);

    Notification({
      title: error.response.status,
      message: httpStateCode[error.response.status],
      type: 'warning',
      offset: 100
    });
  } else {
    if (error instanceof axios.Cancel) return;
    Notification({
      title: '网络错误',
      message: '请检查网络是否正常连接！',
      type: 'error',
      offset: 100
    });
  }
  return Promise.reject(error);
});

//get请求
export const GET = (url,params) => {
  let _service = service;
  if(isDev) {
    url = '/api'+url;
  }else {
    url = 'http://localhost:8088/'+url;
  }
  let serviceOptions = {
    method: 'get',
    url,                     //参数必须是url,params，不能是其他的
    params
  };
  return _service(serviceOptions);
};

//post请求 JSON格式数据
export const POST = (url,params) => {
  let _service = service;
  if(isDev) {
    url = '/api'+url;
  }else {
    url = 'http://localhost:8088/'+url;
  }
  let serviceOptions = {
    method: 'post',
    url,
    data:params,
    headers: {
      post: {
        "Content-Type": "application/json"
      }
    }
  };
  return _service(serviceOptions);
};

//post请求 FormData格式数据 比如上传文件，比如提交的数据有JSON（转成字符串）数据，又有文件 比如form表单数据
export const POSTFORM = (url,params) => {
  let _service = service;
  if(isDev) {
    url = '/api'+url;
  }else {
    url = 'http://localhost:8088/'+url;
  }
  let serviceOptions = {
    method: 'post',
    url,
    data:params,
    headers: {
      post: {
        'Content-Type': 'multipart/form-data'
      }
    }
  };
  return _service(serviceOptions);
}

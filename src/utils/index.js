import Vue from 'vue'

//local读写操作
export const localSave = {
    set:function (key, value) {
        value = JSON.stringify(value);
        localStorage.setItem(key,value);
    },
    get:function (key) {
        let value = localStorage.getItem(key);
        try {
          value = JSON.parse(localStorage.getItem(key))
        }catch (err) {
          console.log(err);
        }
        return value;
    },
    delete:function(key){
        localStorage.removeItem(key);
    }
}

//cookie读写操作
export const cookieSave = {
    set:function(c_name, value, expiredays){
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = c_name + "=" + escape(JSON.stringify(value)) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString());
    },
    get:function(name){
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
            return (JSON.parse(unescape(arr[2])));
        else
            return null;
    },
    delete:function(name){
        var exp = new Date();
        exp.setTime(exp.getTime() - 1);
        var cval = cookieSave.get(name);
        if (cval != null)
            document.cookie = name + "=" + cval + ";expires=" + exp.toGMTString();
    }
}

//session读写操作
export const sessionSave = {
    set:function(key,value){
        value = JSON.stringify(value);
        sessionStorage.setItem(key,value);
    },
    get:function(key){
        let value = sessionStorage.getItem(key);
        try {
            value = JSON.parse(sessionStorage.getItem(key));
        }catch (err) {
            console.log(err);
        }
        return value;
    }
}

//对象深层复制（深拷贝）
export const deepClone = (data) => {
    return JSON.parse(JSON.stringify(data));
}

/**格式化时间 2020-05-17T23:43:38.000+0000*/
export const formatTime = (timeStr) => {
    var dateee = new Date(timeStr).toJSON();
    return new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '')
};
// 时间戳转为小时   3600000 => 01:00:00
export const timeStampToHour = (timeStr) => {
    var time;
    if (timeStr > -1) {
        timeStr = timeStr / 1000;  // 转化为秒
        var hour = Math.floor(timeStr / 3600);
        var min = Math.floor(timeStr / 60) % 60;
        var sec = timeStr % 60;
        if (hour < 10) {
            time = '0' + hour + ":";
        } else {
            time = hour + ":";
        }

        if (min < 10) { time += "0"; }
        time += min + ":";
        if (sec < 10) { time += "0"; }
        time += sec.toFixed(2);
        time = time.substring(0, time.length - 3);
    } else {
        time = '00:00:00';
    }

    return time;
};

//获取博客类型名
export const getTypeNameById = (id,blogTypeList) => {
    return blogTypeList[id];
}

export const Utils = {
    install : function(Vue,options){
      //local读写操作
      Vue.prototype.$localSave = localSave;
      //cookie读写操作
      Vue.prototype.$cookieSave = cookieSave;
      //session读写操作
      Vue.prototype.$sessionSave = sessionSave;
      //对象深层复制
      Vue.prototype.$deepClone = deepClone;
      //格式化时间
      Vue.prototype.$formatTime = formatTime;
      //时间戳转为小时
      Vue.prototype.$timeStampToHour = timeStampToHour;
      //获取博客类型名
      Vue.prototype.$getTypeNameById = getTypeNameById;
    }
}
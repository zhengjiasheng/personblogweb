var wincore = wincore || { version: '1.0.0-beta1' };
if (typeof exports !== 'undefined') {
    exports.wincore = wincore;
}
if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    wincore.document = document;
    wincore.window = window;
    window.wincore = wincore;
}

wincore.cef = {
    get_method_id: function(that, method_name, sync_async) {
        return 'wincore.' + that.module_name + ':' + sync_async + ':' + method_name + ':' + that.uuid;
    },
    aSyncSendMessage: function(that, method_name, tag, msg) {
        try {
            if (cef != undefined) {
                var method_id = wincore.cef.get_method_id(that, method_name, 'async');
                cef.message.sendMessage(method_id, [msg, tag]);
                console.log("aSyncSendMessage, " + method_id + ", " + msg);
            }
        } catch (e) {
            console.log("aSyncSendMessage error: " + e);
        }
    },
    syncSendMessage: function(that, method_name, tag, msg) {
        try {
            if (cef != undefined) {
                var method_id = wincore.cef.get_method_id(that, method_name, 'sync');
                var result = cef.message.sendMessage(method_id, [msg, tag]);
                console.log("syncSendMessage, " + method_id + ", " + msg + ", result: " + result);

                return result;
            }
        } catch (e) {
            console.log("syncSendMessage error: " + e);
        }

        return "";
    },
    get_message_json: function(uuid, name, value, uMsg, param0, param1) {
        var param = { uuid: uuid, uMsg: uMsg };
        param[name] = value;
        if (typeof param0 === 'string')
            param['data_s0'] = param0;
        else
            param['data_i0'] = parseInt(param0);
        if (typeof param1 === 'string')
            param['data_s1'] = param1;
        else
            param['data_i1'] = parseInt(param1);
        return param;
    }
};

wincore.JSONParse = function(data) {
    try {
        var obj = JSON.parse(data);
        if (obj) {
            obj.data = obj.data || {};
            return obj;
        }
    } catch (e) { console.log('JSONParse: ' + data); }
    return { error: -1, data: {} };
};

var wincore_oo_index = new Date().getTime(),
    wincore_event_index = new Date().getTime();

wincore.oo = {};
wincore.util = {};

(function() {
    function max(array, byProperty) {
        return find(array, byProperty, function(value1, value2) {
            return value1 >= value2;
        });
    }

    function min(array, byProperty) {
        return find(array, byProperty, function(value1, value2) {
            return value1 < value2;
        });
    }

    function fill(array, value) {
        var k = array.length;
        while (k--) {
            array[k] = value;
        }
        return array;
    }

    wincore.util.array = {
        fill: fill,
        //invoke: invoke,
        min: min,
        max: max
    };
})();

(function() {

    var slice = Array.prototype.slice,
        emptyFunction = function() {},

        IS_DONTENUM_BUGGY = (function() {
            for (var p in { toString: 1 }) {
                if (p === 'toString') {
                    return false;
                }
            }
            return true;
        })(),

        /** @ignore */
        addMethods = function(klass, source, parent) {
            for (var property in source) {

                if (property in klass.prototype &&
                    typeof klass.prototype[property] === 'function' &&
                    (source[property] + '').indexOf('callSuper') > -1) {

                    klass.prototype[property] = (function(property) {
                        return function() {

                            var superclass = this.constructor.superclass;
                            this.constructor.superclass = parent;
                            var returnValue = source[property].apply(this, arguments);
                            this.constructor.superclass = superclass;

                            if (property !== 'initialize') {
                                return returnValue;
                            }
                        };
                    })(property);
                } else {
                    klass.prototype[property] = source[property];
                }

                if (IS_DONTENUM_BUGGY) {
                    if (source.toString !== Object.prototype.toString) {
                        klass.prototype.toString = source.toString;
                    }
                    if (source.valueOf !== Object.prototype.valueOf) {
                        klass.prototype.valueOf = source.valueOf;
                    }
                }
            }
        };

    function Subclass() {}

    function callSuper(methodName) {
        var parentMethod = null,
            _this = this;

        // climb prototype chain to find method not equal to callee's method
        while (_this.constructor.superclass) {
            var superClassMethod = _this.constructor.superclass.prototype[methodName];
            if (_this[methodName] !== superClassMethod) {
                parentMethod = superClassMethod;
                break;
            }
            // eslint-disable-next-line
            _this = _this.constructor.superclass.prototype;
        }

        if (!parentMethod) {
            return console.log('tried to callSuper ' + methodName + ', method not found in prototype chain', this);
        }

        return (arguments.length > 1) ?
            parentMethod.apply(this, slice.call(arguments, 1)) :
            parentMethod.call(this);
    }

    /**
     * Helper for creation of "classes".
     * @memberOf wincore.util
     * @param {Function} [parent] optional "Class" to inherit from
     * @param {Object} [properties] Properties shared by all instances of this class
     *                  (be careful modifying objects defined here as this would affect all instances)
     */
    function createClass() {
        var parent = null,
            properties = slice.call(arguments, 0);

        if (typeof properties[0] === 'function') {
            parent = properties.shift();
        }

        function klass() {
            this.initialize.apply(this, arguments);
            // added by gclu
            this.type = this.__proto__.type;
        }

        klass.superclass = parent;
        klass.subclasses = [];

        if (parent) {
            Subclass.prototype = parent.prototype;
            klass.prototype = new Subclass();
            parent.subclasses.push(klass);
        }
        for (var i = 0, length = properties.length; i < length; i++) {
            addMethods(klass, properties[i], parent);
        }
        if (!klass.prototype.initialize) {
            klass.prototype.initialize = emptyFunction;
        }
        klass.prototype.constructor = klass;
        klass.prototype.callSuper = callSuper;
        return klass;
    }

    wincore.util.createClass = createClass;
})();

(function() {

    function _removeEventListener(eventName, handler) {
        if (!this.__eventListeners[eventName]) {
            return;
        }
        var eventListener = this.__eventListeners[eventName];
        if (handler) {
            eventListener[eventListener.indexOf(handler)] = false;
        } else {
            wincore.util.array.fill(eventListener, false);
        }
    }

    function observe(eventName, handler) {
        if (!this.__eventListeners) {
            this.__eventListeners = {};
        }
        // one object with key/value pairs was passed
        if (arguments.length === 1) {
            for (var prop in eventName) {
                this.on(prop, eventName[prop]);
            }
        } else {
            if (!this.__eventListeners[eventName]) {
                this.__eventListeners[eventName] = [];
            }
            this.__eventListeners[eventName].push(handler);
        }
        return this;
    }

    function stopObserving(eventName, handler) {
        if (!this.__eventListeners) {
            return;
        }

        // remove all key/value pairs (event name -> event handler)
        if (arguments.length === 0) {
            for (eventName in this.__eventListeners) {
                _removeEventListener.call(this, eventName);
            }
        }
        // one object with key/value pairs was passed
        else if (arguments.length === 1 && typeof arguments[0] === 'object') {
            for (var prop in eventName) {
                _removeEventListener.call(this, prop, eventName[prop]);
            }
        } else {
            _removeEventListener.call(this, eventName, handler);
        }
        return this;
    }

    function fire(eventName, options) {
        if (!this.__eventListeners) {
            return;
        }

        var listenersForEvent = this.__eventListeners[eventName];
        if (!listenersForEvent) {
            return;
        }

        for (var i = 0, len = listenersForEvent.length; i < len; i++) {
            listenersForEvent[i] && listenersForEvent[i].call(this, options || {});
        }
        this.__eventListeners[eventName] = listenersForEvent.filter(function(value) {
            return value !== false;
        });
        return this;
    }
    // 增加单次订阅者
    function once(key, fn) {
        let self = this;

        function one() {
            //在one函数运行原来的函数，只有将one清空
            fn.apply(self, arguments);
            //先绑定 执行后再删除
            self.stopObserving(key, one);
        }

        this.observe(key, one);
    };

    wincore.Observable = {
        observe: observe,
        stopObserving: stopObserving,
        fire: fire,

        on: observe,
        once: once,
        off: stopObserving,
        trigger: fire
    };
})();

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.System) {
        wincore.warn('wincore.oo.System is already defined');
        return;
    }

    wincore.oo.System = wincore.util.createClass(wincore.Observable, {
        module_name: 'System',
        name: 'System',
        uuid: '',
        current_path: '',
        initialize: function(data) {
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: this.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.screen_x = obj.data.screen_x, this.screen_y = obj.data.screen_y;
            this.work_x = obj.data.work_x, this.work_y = obj.data.work_y, this.work_cx = obj.data.work_cx, this.work_cy = obj.data.work_cy;
            this.current_path = obj.data.current_path;
            console.log("System initialize uuid: " + this.name + ", " + this.uuid);
            //if (this.is_init()) this.init_media();//initH264不在自动执行，改为按需调用
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        is_init() {
            return this.uuid !== undefined && this.uuid !== '';
        },
        get_pos: function() {
            var result = wincore.cef.syncSendMessage(this, 'get_pos', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            return wincore.JSONParse(result).data;
        },
        get_work_pos: function() {
            var result = wincore.cef.syncSendMessage(this, 'get_work_pos', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            return wincore.JSONParse(result).data;
        },
        close_all_window: function() {
            wincore.cef.aSyncSendMessage(this, 'close_all_window', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        init_media: function() {
            wincore.cef.aSyncSendMessage(this, 'init_media', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        get_net_name: function() {
            var data = { uuid: this.uuid, name: this.name };
            var result = wincore.cef.syncSendMessage(this, 'get_net_name', '', JSON.stringify(data));
            return wincore.JSONParse(result).data.value;
        },
        get_device_code: function() {
            var data = { uuid: this.uuid, name: this.name };
            var result = wincore.cef.syncSendMessage(this, 'get_device_code', '', JSON.stringify(data));
            return wincore.JSONParse(result).data.value;
        },
        create_guid: function() {
            var data = { uuid: this.uuid, name: this.name };
            var result = wincore.cef.syncSendMessage(this, 'create_guid', '', JSON.stringify(data));
            return wincore.JSONParse(result).data.value;
        },
        screen_shot: function(huuid, savepath, rc) { //窗口uuid，为空则桌面截图
            wincore.cef.aSyncSendMessage(this, 'screen_shot', '', JSON.stringify({
                uuid: this.uuid,
                form_id: huuid,
                save_path: savepath,
                x: rc && rc.x | 0,
                y: rc && rc.y | 0,
                cx: rc && rc.cx | 0,
                cy: rc && rc.cy | 0
            }));
        },
        get_exe_path: function() {
            var result = wincore.cef.syncSendMessage(this, 'get_exe_path', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            return wincore.JSONParse(result).data.value;
        },
        goto_desktop: function() {
            wincore.cef.aSyncSendMessage(this, 'goto_desktop', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        /**
         * 启动应用
         * @param filepath 应用路径
         * @param filename 如果有值则判断是否已经存在进程，从而不重复启动；无值则不判断
         * @param params 进程命令行参数
         * @param wshowwindow 进程启动WindowCommands，传入：SW_HIDE\SW_SHOWNORMAL\SW_NORMAL\SW_MAXIMIZE等
         */
        launch_process: function(filepath, filename, params, wshowwindow) {
            var param = { filepath: filepath };
            if (filename) param['filename'] = filename;
            if (params) param['params'] = params;
            if (wshowwindow) param['wshowwindow'] = wshowwindow;
            param['uuid'] = this.uuid;
            param['name'] = this.name;
            wincore.cef.aSyncSendMessage(this, 'launch_process', '', JSON.stringify(param));
        },
        shell_execute: function(exePath, params, cmd, shut_redirect) {
            var param = { url: encodeURIComponent(exePath) };
            if (params) param['param'] = params;
            if (cmd) param['cmd'] = cmd;
            if (shut_redirect) param['shut_redirect'] = shut_redirect;
            //wincore.cef.aSyncSendMessage(this, 'shell_execute', '', JSON.stringify(param));
            param['uuid'] = this.uuid;
            param['name'] = this.name;
            var result = wincore.cef.syncSendMessage(this, 'shell_execute', '', JSON.stringify(param));
            return wincore.JSONParse(result).data;
        },
        show_toast: function(title, time, width, height, type) { //type:success,error,warn
            wincore.cef.aSyncSendMessage(this, 'show_toast', '', JSON.stringify({ title: title, time: time, width: width, height: height, type: type }));
        },
        get_software_info: function() {
            var result = wincore.cef.syncSendMessage(this, 'get_software_info', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            return wincore.JSONParse(result).data.data;
        },
        reg_read: function(hkey, hsubkey, hdatakey, callback) {
            var data = {
                uuid: this.uuid,
                name: this.name,
                hkey: hkey,
                hsubkey: hsubkey,
                hdatakey: hdatakey
            };
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'reg_read', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__reg_read_" + event_name, callback);
            }
            wincore_event_index++;
        },
        reg_write: function(hkey, hsubkey, hdatakey, hdatavalue, hparatype, callback) {
            var data = {
                uuid: this.uuid,
                name: this.name,
                hkey: hkey,
                hsubkey: hsubkey,
                hdatakey: hdatakey,
                hdatavalue: hdatavalue,
                hparatype: hparatype
            };
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'reg_write', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__reg_write_" + event_name, callback);
            }
            wincore_event_index++;
        },
        reg_delete: function(hkey, hsubkey, hdatakey, callback) {
            var data = {
                uuid: this.uuid,
                name: this.name,
                hkey: hkey,
                hsubkey: hsubkey,
                hdatakey: hdatakey
            };
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'reg_delete', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__reg_delete_" + event_name, callback);
            }
            wincore_event_index++;
        },
        show_register: function(active_type_) {
            wincore.cef.aSyncSendMessage(this, 'show_register', '', JSON.stringify({ active_type: active_type_ }));
        },
        get_file_ext_open_path: function(file_ext, callback) {
            var data = {
                uuid: this.uuid,
                name: this.name,
                file_ext: file_ext
            };
            wincore.cef.aSyncSendMessage(this, 'get_file_ext_open_path', '', JSON.stringify(data));
            if (callback) {
                this.on("callback__get_file_ext_open_path", callback);
            }
        },
        get_scale_dpi: function() {
            var data = { uuid: this.uuid, name: this.name };
            var result = wincore.cef.syncSendMessage(this, 'get_scale_dpi', '', JSON.stringify(data));
            return wincore.JSONParse(result).data.value;
        }
    });
})(typeof exports !== 'undefined' ? exports : this);

wincore.System = new wincore.oo.System();

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.Mutlicaster) {
        wincore.warn('wincore.oo.Mutlicaster is already defined');
        return;
    }

    wincore.Mutlicaster = {};
    wincore.oo.Mutlicaster = wincore.util.createClass(wincore.Observable, {
        module_name: 'Mutlicaster',
        name: '',
        uuid: '',
        screen_x: 0,
        screen_y: 0,
        start_service: false,
        initialize: function(data) {
            data = data || {};
            data.udp_port = data.udp_port || 5156;
            data.name = data.name || ('Mutlicaster_' + wincore_oo_index++);
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: data.name, udp_port: data.udp_port }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            wincore.Mutlicaster[this.name] = this;
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                this.stop();
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.Mutlicaster[this.name];
                this.uuid = this.name = null;
            }
        },
        set_port: function(udp_port) {
            wincore.cef.aSyncSendMessage(this, 'set_port', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                port: udp_port
            }));
        },
        set_remote_address: function(ip, port) {
            wincore.cef.aSyncSendMessage(this, 'set_remote_address', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                ip: ip,
                port: port
            }));
        },
        start: function() {
            if (!this.start_service) {
                wincore.cef.aSyncSendMessage(this, 'start', '', JSON.stringify({
                    uuid: this.uuid
                }));
                this.start_service = true;
            }
        },
        stop: function() {
            if (this.start_service) {
                wincore.cef.aSyncSendMessage(this, 'stop', '', JSON.stringify({
                    uuid: this.uuid,
                    name: this.name
                }));
                this.start_service = false;
            }
        },
        send: function(data) {
            wincore.cef.aSyncSendMessage(this, 'send', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                data: data
            }));
        },
        subscribe: function(sub_module_name, sub_name, sub_events) {
            var data = { uuid: this.uuid, name: this.name, sub_module_name: sub_module_name, sub_name: sub_name };
            if (data) data['sub_events'] = sub_events;
            wincore.cef.aSyncSendMessage(this, 'subscribe', '', JSON.stringify(data));
        },
        unsubscribe: function(sub_module_name, sub_name) {
            var data = { uuid: this.uuid, name: this.name, sub_module_name: sub_module_name, sub_name: sub_name };
            wincore.cef.aSyncSendMessage(this, 'unsubscribe', '', JSON.stringify(data));
        },
    });
})(typeof exports !== 'undefined' ? exports : this);

//new wincore.oo.Mutlicaster({ name: 'mutlicaster', udp_port: 5156});
//wincore.Mutlicaster.mutlicaster.subscribe('BrowserForm', 'login_form', 'on_mutlicaster_recv,on_xxxx');
//wincore.Mutlicaster.mutlicaster.start();
//wincore.BrowserForm.login_form.on('on_mutlicaster_recv', function(e) { console.log('login_form on_mutlicaster_recv');});

/*httputils*/
/*var httputils = new wincore.oo.HttpUtils({name:'test'});
httputils.http_post('https://zjy2.icve.com.cn/screenAPI/BigscreenLogin/login?userName=20190114&userPwd=Ceshi123&logintype=1&userType=1','')
httputils.on('on_complete',function(e){console.log('on_complete');});
httputils.on('on_failed',function(e){console.log('on_failed');});*/
(function(global) {
    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    wincore.HttpUtils = {};
    wincore.oo.HttpUtils = wincore.util.createClass(wincore.Observable, {
        module_name: 'HttpUtils',
        name: '',
        uuid: '',
        initialize: function(data) {
            data.name = data.name || ('HttpUtils' + wincore_oo_index++);
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: data.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            wincore.HttpUtils[this.name] = this;
        },
        http_get: function(url) {
            var data = { uuid: this.uuid, name: this.name, url: url, type: 'http_get' };
            wincore.cef.aSyncSendMessage(this, 'http_get', '', JSON.stringify(data));
        },

        http_post: function(url, params) {
            var data = { uuid: this.uuid, name: this.name, url: url, params: params, type: 'http_post' };
            wincore.cef.aSyncSendMessage(this, 'http_post', '', JSON.stringify(data));
        },

        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.HttpUtils[this.name];
                this.uuid = this.name = null;
            }
        },
        on_complete: function(options) {
            this.trigger("on_complete", options);
            console.log("HttpUtils, on_complete: ");
            this.release();
        },
        on_failed: function(options) {
            this.trigger("on_failed", options);
            console.log("HttpUtils, on_failed: ");
            this.release();
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

/*httpdownload*/
(function(global) {
    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    wincore.HttpDownload = {};
    wincore.oo.HttpDownload = wincore.util.createClass(wincore.Observable, {
        module_name: 'HttpDownload',
        name: '',
        uuid: '',
        initialize: function(data) {
            data.url = data.url;
            data.path = data.path;
            data.name = data.name || ('HttpDownload' + wincore_oo_index++);
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: data.name, url: data.url, path: encodeURIComponent(data.path) }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            wincore.HttpDownload[this.name] = this;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.HttpDownload[this.name];
                this.uuid = this.name = null;
            }
        },
        stop_download: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'stop_download', '', JSON.stringify({ id: this.uuid, name: this.name }));
                this.release();
            }
        },
        on_progress: function(options) {
            this.trigger("on_progress", options);
            //console.log("HttpDownload, on_progress: ");
        },
        on_complete: function(options) {
            this.trigger("on_complete", options);
            this.trigger("on_finish", { type: 'complete' });
            console.log("HttpDownload, on_complete: ");
            this.release();
        },
        on_failed: function(options) {
            this.trigger("on_failed", options);
            this.trigger("on_finish", { type: 'failed' });
            console.log("HttpDownload, on_failed: ");
            this.release();
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

/*ossupload*/
(function(global) {
    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    wincore.OSSUpload = {};
    wincore.oo.OSSUpload = wincore.util.createClass(wincore.Observable, {
        module_name: 'OSSUpload',
        name: '',
        uuid: '',
        initialize: function(data) {
            data.filePath = data.filePath;
            data.bucket = data.bucket;
            data.urlpath = data.urlpath;
            data.accessId = data.accessId;
            data.accessSecret = data.accessSecret;
            data.name = data.name || ('OSSUpload' + wincore_oo_index++);
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: data.name, filePath: data.filePath, bucket: data.bucket, urlpath: data.urlpath, accessId: data.accessId, accessSecret: data.accessSecret }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            wincore.OSSUpload[this.name] = this;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.OSSUpload[this.name];
                this.uuid = this.name = null;
            }
        },
        on_progress: function(options) {
            this.trigger("on_progress", options);
            console.log("OSSUpload, on_progress: ");
        },
        on_complete: function(options) {
            this.trigger("on_complete", options);
            console.log("OSSUpload, on_complete: ");
            this.release();
        },
        on_failed: function(options) {
            this.trigger("on_failed", options);
            console.log("OSSUpload, on_failed: ");
            this.release();
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

/*ossdownload*/
(function(global) {
    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    wincore.OSSDownload = {};
    wincore.oo.OSSDownload = wincore.util.createClass(wincore.Observable, {
        module_name: 'OSSDownload',
        name: '',
        uuid: '',
        initialize: function(data) {
            data.filePath = data.filePath;
            data.bucket = data.bucket;
            data.key = data.key;
            data.accessId = data.accessId;
            data.accessSecret = data.accessSecret;
            data.name = data.name || ('OSSDownload' + wincore_oo_index++);
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: data.name, filePath: data.filePath, bucket: data.bucket, key: data.key, accessId: data.accessId, accessSecret: data.accessSecret }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            wincore.OSSDownload[this.name] = this;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.OSSDownload[this.name];
                this.uuid = this.name = null;
            }
        },
        on_progress: function(options) {
            this.trigger("on_progress", options);
            console.log("OSSDownload, on_progress: ");
        },
        on_complete: function(options) {
            this.trigger("on_complete", options);
            console.log("OSSDownload, on_complete: ");
            this.release();
        },
        on_failed: function(options) {
            this.trigger("on_failed", options);
            console.log("OSSDownload, on_failed: ");
            this.release();
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.Disk) {
        wincore.warn('wincore.oo.Disk is already defined');
        return;
    }

    wincore.Disk = {};
    wincore.oo.Disk = wincore.util.createClass(wincore.Observable, {
        module_name: 'Disk',
        name: 'disk',
        uuid: '',
        initialize: function(data) {
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: this.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            console.log("Disk initialize uuid: " + this.name + ", " + this.uuid);
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        read_config: function(file_name, section, key, default_value) {
            var data = { uuid: this.uuid, name: this.name, file_name: file_name, section: section, key: key };
            if (default_value) data['default_value'] = default_value;
            var result = wincore.cef.syncSendMessage(this, 'read_config', '', JSON.stringify(data));
            return wincore.JSONParse(result).data.value;
        },
        write_config: function(file_name, section, key, value, callback) {
            var data = { uuid: this.uuid, name: this.name, file_name: file_name, section: section, key: key, value: value };
            wincore.cef.aSyncSendMessage(this, 'write_config', '', JSON.stringify(data));
            if (callback) {
                this.on("callback__write_config", callback);
            }
        },
        global_get_value: function(key) {
            var data = { uuid: this.uuid, name: this.name, key: key };
            var result = wincore.cef.syncSendMessage(this, 'global_get_value', '', JSON.stringify(data));
            return wincore.JSONParse(result).data.value;
        },
        global_set_value: function(key, value) {
            var data = { uuid: this.uuid, name: this.name, key: key, value: value };
            wincore.cef.aSyncSendMessage(this, 'global_set_value', '', JSON.stringify(data));
        },
        read_mutli_config: function(file_name, sections, keys) {
            var data = { uuid: this.uuid, name: this.name, file_name: file_name, data: [] };
            for (var i = 0; i < sections.length && i < keys.length; i++) {
                data.data.push({ section: sections[i], key: keys[i] });
            }
            var result = wincore.cef.syncSendMessage(this, 'read_mutli_config', '', JSON.stringify(data));
            return wincore.JSONParse(result).data;
        },
        sync_read_file: function(file_name) {
            var data = { uuid: this.uuid, name: this.name, file_name: file_name };
            var result = wincore.cef.syncSendMessage(this, 'read_file', '', JSON.stringify(data));
            var data = wincore.JSONParse(result).data;
            if (data.ret == 0) {
                if (window.Base64) {
                    var base64 = new Base64();
                    return base64.decode(data.data);
                }
                return data.data
            }

            return '';
        },
        async_read_file: function(file_name, callback) {
            var event_name = '' + wincore_event_index;
            var data = { uuid: this.uuid, name: this.name, file_name: file_name };
            wincore.cef.aSyncSendMessage(this, 'read_file', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__read_file_" + event_name, callback);
            }
            wincore_event_index++;
        },
        write_file: function(file_name, data, format, callback) {
            var data = { uuid: this.uuid, name: this.name, file_name: file_name, data: data };
            var event_name = '' + wincore_event_index;
            if (format) data['format'] = format;
            wincore.cef.aSyncSendMessage(this, 'write_file', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__write_file_" + event_name, callback);
            }
            wincore_event_index++;
        },
        delete_file: function(file_name, callback) {
            var data = { uuid: this.uuid, name: this.name, file_name: file_name };
            wincore.cef.aSyncSendMessage(this, 'delete_file', '', JSON.stringify(data));
            if (callback) {
                this.on("callback__delete_file", callback);
            }
        },
        copy_file: function(src_file, dest_file, callback) {
            var data = { uuid: this.uuid, name: this.name, src_file: src_file, dest_file: dest_file };
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'copy_file', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__copy_file_" + event_name, callback);
            }
            wincore_event_index++;
        },
        copy_img_toclipboard: function(file, callback) {
            var data = { uuid: this.uuid, name: this.name, file: file };
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'copy_img_toclipboard', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__copy_img_toclipboard" + event_name, callback);
            }
            wincore_event_index++;
        },
        get_file_md5: function(file_name, callback) {
            var data = { uuid: this.uuid, name: this.name, file_name: file_name };
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'get_file_md5', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__get_file_md5_" + event_name, callback);
            }
            wincore_event_index++;
        },

        get_file_size: function(file_name, callback) {
            var event_name = '' + wincore_event_index;
            var data = { uuid: this.uuid, name: this.name, file_name: file_name };
            wincore.cef.aSyncSendMessage(this, 'get_file_size', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__get_file_size_" + event_name, callback);
            }
            wincore_event_index++;
        },

        get_dir_size: function(dir_path, callback) {
            var event_name = '' + wincore_event_index;
            var data = { uuid: this.uuid, name: this.name, dir_path: dir_path };
            wincore.cef.aSyncSendMessage(this, 'get_dir_size', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__get_dir_size_" + event_name, callback);
            }
            wincore_event_index++;
        },

        get_files_folders: function(path, callback) {
            var event_name = '' + wincore_event_index;
            var data = { uuid: this.uuid, name: this.name, path: path };
            wincore.cef.aSyncSendMessage(this, 'get_files_folders', event_name, JSON.stringify(data));
            if (callback) {
                this.on("callback__get_files_folders_" + event_name, callback);
            }
            wincore_event_index++;
        },
        sync_get_files_folders: function(path, callback) {
            var data = { uuid: this.uuid, name: this.name, path: path };
            var result = wincore.cef.syncSendMessage(this, 'get_files_folders', '', JSON.stringify(data));
            return wincore.JSONParse(result).data;
        },
        get_all_drive: function() {
            var result = wincore.cef.syncSendMessage(this, 'get_all_drive', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name
            }));
            return wincore.JSONParse(result).data;
        },
        get_drive_freespace: function(drivename) {
            var result = wincore.cef.syncSendMessage(this, 'get_drive_freespace', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                drivename: drivename
            }));
            return wincore.JSONParse(result).data;

        },
        make_dir: function(dirpath, callback) {
            var data = { uuid: this.uuid, name: this.name, path: dirpath };
            wincore.cef.aSyncSendMessage(this, 'make_dir', dirpath, JSON.stringify(data));
            if (callback) {
                this.on("callback__make_dir", callback);
            }
        },
        remove_dir_allfile: function(dirpath) {
            var data = { uuid: this.uuid, name: this.name, path: dirpath };
            wincore.cef.aSyncSendMessage(this, 'remove_dir_allfile', '', JSON.stringify(data));
        },
        remove_dir: function(dirpath) {
            var data = { uuid: this.uuid, name: this.name, path: dirpath };
            wincore.cef.aSyncSendMessage(this, 'remove_dir', '', JSON.stringify(data));
        },
        rename_file: function(srcpath, destpath) {
            var data = { uuid: this.uuid, name: this.name, path_src: srcpath, path_dest: destpath };
            wincore.cef.aSyncSendMessage(this, 'rename_file', '', JSON.stringify(data));
        },
        exist_file: function(filepath) {
            var data = { uuid: this.uuid, name: this.name, filepath: encodeURIComponent(filepath) };
            var result = wincore.cef.syncSendMessage(this, 'exist_file', '', JSON.stringify(data));
            return wincore.JSONParse(result).data.ret == "1";
        },
        mutli_exist_file: function(file_sections) {
            var data = { uuid: this.uuid, name: this.name, data: [] };
            for (var i = 0; i < file_sections.length; i++) {
                data.data.push({ filename: file_sections[i] });
            }
            var result = wincore.cef.syncSendMessage(this, 'mutli_exist_file', '', JSON.stringify(data));
            return wincore.JSONParse(result).data;
        },
        exist_dir: function(filepath) {
            var data = { uuid: this.uuid, name: this.name, filepath: filepath };
            var result = wincore.cef.syncSendMessage(this, 'exist_dir', '', JSON.stringify(data));
            return wincore.JSONParse(result).data.ret == "1";
        },
        //addpath=""，压缩包内不带当前目录
        //addinpath="test\\"，压缩包内带有test目录
        compress_file: function(srcfile, destfile, addpath, callback) {
            wincore.cef.aSyncSendMessage(this, 'compress_file', '', JSON.stringify({
                srcfile: srcfile,
                destfile: destfile,
                addpath: addpath
            }));
            if (callback) {
                this.on("callback__compress_file", callback);
            }
        },
        //不删除源文件，有需要手动调用删除方法
        uncompress_file: function(srcfile, destfile, callback) {
            wincore.cef.aSyncSendMessage(this, 'uncompress_file', '', JSON.stringify({
                srcfile: srcfile,
                destfile: destfile
            }));
            if (callback) {
                this.on("callback__uncompress_file", callback);
            }
        },
        sync_getspecialfolder_path: function(foldername, callback) {
            var data = { uuid: this.uuid, name: this.name, folder_name: foldername };
            var result = wincore.cef.syncSendMessage(this, 'get_specialfolder_path', '', JSON.stringify(data));
            console.log("get_specialfolder_path result:", result);

            return wincore.JSONParse(result).data;
        },
        //apptype //1大屏,4智能PC,7职教云大屏,8职教桌面,9职教学生端
        //os //-1默认pc
        track_point: function(action_code_, data_, os_, apptype_) {
            var value = { action_code: action_code_, data: data_, os: os_, apptype: apptype_ };
            wincore.cef.aSyncSendMessage(this, 'track_point', '', JSON.stringify(value));
            console.log("track_point", value);
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

if (wincore.System.is_init()) wincore.Disk = new wincore.oo.Disk();
//wincore.Disk.get_files_folders('E:\\Project\\datedu-eclass\\trunk\\live_study\\build\\Release');

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.BrowserForm) {
        wincore.warn('wincore.oo.BrowserForm is already defined');
        return;
    }

    wincore.BrowserForm = {};
    // 最近打开的cef名称
    wincore.lastCefname = '';
    wincore.oo.BrowserForm = wincore.util.createClass(wincore.Observable, {
        module_name: 'BrowserForm',
        name: '',
        uuid: '',
        URI: '',
        page_on_create: false,
        create_rc: { x: 0, y: 0, cx: 0, cy: 0 },
        initialize: function(data) {
            data = data || {};
            data.close_all = data.close_all || false;
            data.name = data.name || ('BrowserForm_' + wincore_oo_index++);
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify(data));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            this.create_rc.x = obj.data.x, this.create_rc.y = obj.data.y,
                this.create_rc.cx = obj.data.cx, this.create_rc.cy = obj.data.y;
            this.URI = data.URI;
            wincore.BrowserForm[this.name] = this;
            wincore.lastCefname = this.name;
            console.log("BrowserForm initialize name: " + this.name + ", " + this.URI);
        },
        reload_uri: function(uri, callback) {
            wincore.cef.syncSendMessage(this, 'reload_uri', '', JSON.stringify({ uuid: this.uuid, name: this.name, uri: uri }));
            if (callback) {
                this.on("callback__reload_uri", callback);
            }
        },
        //只监听一次，回调处理后自动取消监听
        listen_once(key, callback) {
            var self = this;
            //在one函数运行原来的函数
            function one() {
                //先绑定 执行后再删除
                callback.apply(self, arguments);
                self.off(key);
            }
            this.on(key, one);
        },
        //event_name：go_back,go_forward,can_go_back,can_go_forward
        browser_event: function(event_name_, event_msg_, callback) {
            wincore.cef.aSyncSendMessage(this, 'browser_event', '', JSON.stringify({ event_name: event_name_, event_msg: event_msg_ }));
            if (callback) {
                this.listen_once(event_name_ + "_callback", callback);
            }
        },
        set_cookie: function(domain, key, value, httponly) {
            wincore.cef.syncSendMessage(this, 'set_cookie', '', JSON.stringify({ uuid: this.uuid, name: this.name, domain: domain, key: key, value: value, httponly: httponly }));
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                //wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.BrowserForm[this.name];
                this.uuid = this.name = null;
            }
        },
        get_pos: function(id) {
            var result = wincore.cef.syncSendMessage(this, 'get_pos', '', JSON.stringify({ uuid: this.uuid, name: this.name, id: id ? id : '' }));
            return wincore.JSONParse(result).data;
        },
        set_pos: function(id, rc, callback) {
            var iid = '',
                irc, icallback;
            if (typeof id === 'string') {
                iid = id;
                irc = rc;
                icallback = callback;
            } else {
                irc = id;
                icallback = rc;
            }
            wincore.cef.aSyncSendMessage(this, 'set_pos', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                id: iid,
                x: irc.x,
                y: irc.y,
                cx: irc.cx,
                cy: irc.cy
            }));
            if (icallback) {
                this.on("callback__set_pos", icallback);
            }
        },

        is_visible: function(id) {
            var result = wincore.cef.syncSendMessage(this, 'is_visible', '', JSON.stringify({ uuid: this.uuid, id: this.id }));
            var data = wincore.JSONParse(result).data;
            return data && data.value ? data.value == "true" : false;
        },
        set_visible: function(id, value, callback) {
            wincore.cef.aSyncSendMessage(this, 'set_visible', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                id: id,
                value: value
            }));
            if (callback) {
                this.on("callback__set_visible", callback);
            }
        },
        is_enable: function(id) {
            var result = wincore.cef.syncSendMessage(this, 'is_enable', '', JSON.stringify({ uuid: this.uuid, id: id }));
            var data = wincore.JSONParse(result).data;
            return data && data.value ? true : false;
        },
        set_enable: function(id, value, callback) {
            wincore.cef.aSyncSendMessage(this, 'set_enable', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                id: id,
                value: value
            }));
            if (callback) {
                this.on("callback__set_enable", callback);
            }
        },
        set_minisize: function(callback) {
            wincore.cef.aSyncSendMessage(this, 'set_minisize', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name
            }));
            if (callback) {
                this.on("callback__set_minisize", callback);
            }
        },
        set_maxsize: function(callback) { //还原
            wincore.cef.aSyncSendMessage(this, 'set_maxsize', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name
            }));
            if (callback) {
                this.on("callback__set_maxsize", callback);
            }
        },
        set_text: function(id, text, color, bk_color, callback) {
            var json = {};
            json['uuid'] = this.uuid;
            json['id'] = this.id;
            if (text) json['ctl_text'] = text;
            if (color) json['ctl_textcolor'] = color;
            if (bk_color) json['ctl_bkcolor'] = bk_color;
            wincore.cef.aSyncSendMessage(this, 'set_attribute', '', JSON.stringify(json));
            if (callback) {
                this.on("callback__set_text", callback);
            }
        },
        set_foreground: function(action, callback) {
            wincore.cef.aSyncSendMessage(this, 'set_foreground', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                value: action
            }));
            if (callback) {
                this.on("callback__set_foreground", callback);
            }
        },
        post_message2id(target_id, uMsg, param0, param1) {
            var param = wincore.cef.get_message_json(this.uuid, 'target_id', target_id, uMsg, param0, param1);
            wincore.cef.aSyncSendMessage(this, 'post_messsage', '', JSON.stringify(param));
        },
        post_message2name(target_name, uMsg, param0, param1) {
            var param = wincore.cef.get_message_json(this.uuid, 'target_name', target_name, uMsg, param0, param1);
            wincore.cef.aSyncSendMessage(this, 'post_messsage', '', JSON.stringify(param));
        },
        close: function(callback) {
            wincore.cef.aSyncSendMessage(this, 'close', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            if (callback) {
                this.on("callback__close", callback);
            }
        },
        on_kindwindow_event(method) {
            wincore.cef.aSyncSendMessage(this, 'on_kindwindow_event', '', JSON.stringify({ uuid: this.uuid, name: this.name, data: method }));
        },
        set_dpi: function(value) {
            wincore.cef.aSyncSendMessage(this, 'set_dpi', '', JSON.stringify({ uuid: this.uuid, name: this.name, value: value }));
        },
        send_subscribe: function(method, data) {
            wincore.cef.aSyncSendMessage(this, 'send_subscribe', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                method: method,
                data: data
            }));
        },
        send_message2core: function(module_name, target_name, method, data) {
            wincore.cef.aSyncSendMessage(this, 'send_message2core', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                module_name: module_name,
                target_name: target_name,
                method: method,
                data: data
            }));
        },
        on_create: function(options) {
            if (!this.page_on_create) {
                this.trigger("on_create", options);
                wincore.System.trigger(this.name + ".on_create", options);
                wincore.cef.aSyncSendMessage(this, 'on_notify_create', '', JSON.stringify({ uuid: this.uuid }));
                this.page_on_create = true;
                console.log("BrowserForm, on_create: ");
            }
        },
        on_close: function(options) {
            this.trigger("on_close", options);
            wincore.System.trigger(this.name + ".on_close", options);
            wincore.System.trigger("on_close", options);
            this.release();
        },
        on_wnd_restore: function(options) {
            this.trigger("on_wnd_restore", options);
        },
    });

})(typeof exports !== 'undefined' ? exports : this);

//wincore.System.on("login_form.on_create", function(e) {
//  wincore.BrowserForm.login_form.send_message2core('BrowserForm', 'login_form', 'on_close', '12345');
//});

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.WindowForm) {
        wincore.warn('wincore.oo.WindowForm is already defined');
        return;
    }

    wincore.WindowForm = {};
    wincore.oo.WindowForm = wincore.util.createClass(wincore.Observable, {
        module_name: 'WindowForm',
        name: '',
        uuid: '',
        URI: '',
        visible: true,
        create_rc: { x: 0, y: 0, cx: 0, cy: 0 },
        initialize: function(data) {
            data = data || {};
            data.close_all = data.close_all || false;
            data.name = data.name || ('WindowForm_' + wincore_oo_index++);
            if (!data.xml || data.xml == '') {
                console.log("WindowForm initialize name: " + data.name + "xml must defined");
                return;
            }

            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify(data));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            this.create_rc.x = obj.data.x, this.create_rc.y = obj.data.y,
                this.create_rc.cx = obj.data.cx, this.create_rc.cy = obj.data.y;
            wincore.WindowForm[this.name] = this;
            console.log("WindowForm initialize name: " + this.name);
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.WindowForm[this.name];
                this.uuid = this.name = null;
            }
        },
        get_pos: function(id) {
            var result = wincore.cef.syncSendMessage(this, 'get_pos', '', JSON.stringify({ uuid: this.uuid, name: this.name, id: id ? id : '' }));
            return wincore.JSONParse(result).data;
        },
        set_pos: function(id, rc, callback) {
            var iid = '',
                irc;
            if (typeof id === 'string') {
                iid = id;
                irc = rc;
            } else {
                irc = id;
            }
            wincore.cef.aSyncSendMessage(this, 'set_pos', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                id: iid,
                x: irc.x,
                y: irc.y,
                cx: irc.cx,
                cy: irc.cy
            }));
            if (callback) {
                this.on("callback__set_pos", callback);
            }
        },
        is_visible: function(id) {
            var result = wincore.cef.syncSendMessage(this, 'is_visible', '', JSON.stringify({ uuid: this.uuid, id: id }));
            var data = wincore.JSONParse(result).data;
            return data && data.value ? data.value == "true" : false;
        },
        set_visible: function(id, value, callback) {
            if ((!id || id == '')) {
                if (this.visible == value) {
                    if (callback) callback();
                    return;
                }
                this.visible = value;
            }
            wincore.cef.aSyncSendMessage(this, 'set_visible', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                id: id,
                value: value
            }));
            if (callback) {
                this.on("callback__set_visible", callback);
            }
        },
        is_enable: function(id) {
            var result = wincore.cef.syncSendMessage(this, 'is_enable', '', JSON.stringify({ uuid: this.uuid, id: id }));
            var data = wincore.JSONParse(result).data;
            return data && data.value ? true : false;
        },
        set_enable: function(id, value, callback) {
            wincore.cef.aSyncSendMessage(this, 'set_enable', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                id: id,
                value: value
            }));
            if (callback) {
                this.on("callback__set_enable", callback);
            }
        },
        set_text: function(id, text, color, bk_color, bk_image, callback) {
            var json = {};
            json['uuid'] = this.uuid;
            json['id'] = id;
            if (text) json['ctl_text'] = text;
            if (color) json['ctl_textcolor'] = color;
            if (bk_color) json['ctl_bkcolor'] = bk_color;
            if (bk_image) json['ctl_bkimage'] = bk_image;
            wincore.cef.aSyncSendMessage(this, 'set_attribute', '', JSON.stringify(json));
            if (callback) {
                this.on("callback__set_text", callback);
            }
        },
        selected: function(id, value) {
            var json = { uuid: this.uuid, id: id, ctl_selected: value ? 'true' : 'false' };
            wincore.cef.aSyncSendMessage(this, 'set_attribute', '', JSON.stringify(json));
        },
        set_foreground: function(action, callback) {
            wincore.cef.aSyncSendMessage(this, 'set_foreground', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                value: action
            }));
            if (callback) {
                this.on("callback__set_foreground", callback);
            }
        },
        get_progress_value(id) {
            return parseInt(this.get_value('progress', id, 'value'));
        },
        set_progress_value(id, value) {
            var json = { uuid: this.uuid, id: id, ctl_value: value };
            wincore.cef.aSyncSendMessage(this, 'set_attribute', '', JSON.stringify(json));
        },
        get_slider_step(id) {
            return parseInt(this.get_value('progress', id, 'change_step'));
        },
        get_value(ctl_name, id, key) {
            var result = wincore.cef.syncSendMessage(this, 'get_attribute', '', JSON.stringify({ uuid: this.uuid, id: id, ctl_name: ctl_name, key: key }));
            var data = wincore.JSONParse(result).data;
            return data && data.value ? data.value : '';
        },
        get_sub_value(ctl_name, id, sub_id, key) {
            var result = wincore.cef.syncSendMessage(this, 'get_sub_attribute', '', JSON.stringify({ uuid: this.uuid, id: id, sub_id: sub_id, ctl_name: ctl_name, key: key }));
            var data = wincore.JSONParse(result).data;
            return data && data.value ? data.value : '';
        },
        close: function(callback) {
            wincore.cef.aSyncSendMessage(this, 'close', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            if (callback) {
                this.on("callback__close", callback);
            }
            //this.uuid = '';
        },
        set_dpi: function(value) {
            wincore.cef.aSyncSendMessage(this, 'set_dpi', '', JSON.stringify({ uuid: this.uuid, name: this.name, value: value }));
        },
        send_subscribe: function(method, data) {
            wincore.cef.aSyncSendMessage(this, 'send_subscribe', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                method: method,
                data: data
            }));
        },
        send_message2core: function(module_name, target_name, method, data) {
            wincore.cef.aSyncSendMessage(this, 'send_message2core', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                module_name: module_name,
                target_name: target_name,
                method: method,
                data: data
            }));
        },
        post_message2id(target_id, uMsg, param0, param1) {
            var param = wincore.cef.get_message_json(this.uuid, 'target_id', target_id, uMsg, param0, param1);
            wincore.cef.aSyncSendMessage(this, 'post_messsage', '', JSON.stringify(param));
        },
        post_message2name(target_name, uMsg, param0, param1) {
            var param = wincore.cef.get_message_json(this.uuid, 'target_name', target_name, uMsg, param0, param1);
            wincore.cef.aSyncSendMessage(this, 'post_messsage', '', JSON.stringify(param));
        },
        add_control(id, sub_id, xml) {
            wincore.cef.aSyncSendMessage(this, 'add_control', '', JSON.stringify({ uuid: this.uuid, id: id, sub_id: sub_id, xml: xml }));
        },
        remove_control(id, sub_id) {
            wincore.cef.aSyncSendMessage(this, 'remove_control', '', JSON.stringify({ uuid: this.uuid, id: id, sub_id: sub_id }));
        },
        set_listbox(id, list) {
            wincore.cef.aSyncSendMessage(this, 'set_listbox', '', JSON.stringify({ uuid: this.uuid, id: id, data: list }));
        },
        set_attribute(id, key, value) {
            var param = { uuid: this.uuid, id: id };
            param['ctl_' + key] = value;
            // if (ctl_name) param['ctl_name'] = ctl_name;
            wincore.cef.aSyncSendMessage(this, 'set_attribute', '', JSON.stringify(param));
        },
        set_sub_attribute(id, sub_id, key, value, ctl_name) {
            var param = { uuid: this.uuid, id: id, sub_id: sub_id };
            param['ctl_' + key] = value;
            if (ctl_name) param['ctl_name'] = ctl_name;
            wincore.cef.aSyncSendMessage(this, 'set_sub_attribute', '', JSON.stringify(param));
        },
        on_create: function(options) {
            this.trigger("on_create", options);
            wincore.System.trigger(this.name + ".on_create", options);
            console.log("WindowForm, on_create: ");
        },
        on_close: function(options) {
            this.trigger("on_close", options);
            wincore.System.trigger(this.name + ".on_close", options);
            this.release();
        },
        on_click: function(options) {
            if (options.data && options.data.ctl_id) {
                this.trigger(options.data.ctl_id + ".click", options);
                console.log("WindowForm, on_click: " + options.data.ctl_id);
            }
        },
        on_kill_focus: function(options) {
            this.trigger("on_kill_focus", options);
        },
        on_notify_event: function(options) {
            if (options.data && options.data.ctl_id && options.data.event_name) {
                //this.trigger(options.data.ctl_id + "." + options.data.event_name, options);
                this.trigger("on_notify_event", options);
                console.log("WindowForm, on_notify_event: " + options.data.ctl_id);
            }
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

//var live_player = new wincore.oo.WindowForm({name: 'live_player', xml: 'live_study/player_view.xml'});
//wincore.WindowForm.live_player.on("btnclose.click", function(e) {
//  e.target.close();
//e.target.set_text('btnclose', 'set_text', '#FFFFFF00');
//});

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.InkView) {
        wincore.warn('wincore.oo.InkView is already defined');
        return;
    }

    wincore.InkView = {};
    wincore.oo.InkView = wincore.util.createClass(wincore.Observable, {
        module_name: 'InkView',
        name: '',
        uuid: '',
        initialize: function(data) {
            data = data || {};
            data.name = data.name || ('InkView_' + wincore_oo_index++);
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify(data));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            wincore.InkView[this.name] = this;
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.InkView[this.name];
                this.uuid = this.name = null;
            }
        },
        show: function(param) {
            param = param || {};
            param['uuid'] = this.uuid;
            param['name'] = this.name;
            if (param.color) param.color = parseInt(param.color);
            wincore.cef.aSyncSendMessage(this, 'show', '', JSON.stringify(param));
        },
        close: function() {
            wincore.cef.aSyncSendMessage(this, 'close', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        set_cursor: function() {
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify({ uuid: this.uuid, name: this.name, action: 'cursor' }));
        },
        set_pen: function(width, action) {
            action = action || 'pen';
            var param = { uuid: this.uuid, name: this.name, action: action, type: action };
            if (width) param['width'] = width;
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify(param));
        },
        set_eraser: function(width, height) {
            var param = { uuid: this.uuid, name: this.name, action: 'eraser' };
            if (width) param['width'] = width;
            if (height) param['height'] = height;
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify(param));
        },
        set_color: function(color) {
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify({ uuid: this.uuid, name: this.name, color: parseInt(color) }));
        },
        set_pos: function(param) {
            param = param || {};
            param['uuid'] = this.uuid;
            param['name'] = this.name;
            wincore.cef.aSyncSendMessage(this, 'set_pos', '', JSON.stringify(param));
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.WBForm) {
        wincore.warn('wincore.oo.WBForm is already defined');
        return;
    }

    wincore.WBForm = {};
    wincore.oo.WBForm = wincore.util.createClass(wincore.Observable, {
        module_name: 'WBForm',
        name: 'WhiteBoardDrawWnd',
        uuid: '',
        initialize: function(data) {},
        create: function(uid, uname, role) {
            if (this.uuid != '') return;

            var param = { name: this.name };
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify(param));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        show: function(visible, action, rc, callback) {
            action = action || 'pen';
            var param = { uuid: this.uuid, name: this.name, visible: visible === false ? 'false' : 'true', action: action };
            if (rc && typeof rc === 'string') param['show'] = rc;
            wincore.cef.aSyncSendMessage(this, 'show', '', JSON.stringify(param));
            if (callback) {
                this.on("callback__show", callback);
            }
        },
        close: function() {
            if (this.uuid != '') {
                wincore.cef.aSyncSendMessage(this, 'close', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = '';
            }
        },
        set_cursor: function() {
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify({ uuid: this.uuid, name: this.name, action: 'cursor' }));
        },
        set_pen: function(width, action) {
            action = action || 'pen';
            var param = { uuid: this.uuid, name: this.name, action: action, type: action };
            if (width) param['width'] = width;
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify(param));
        },
        set_eraser: function(width, height) {
            var param = { uuid: this.uuid, name: this.name, action: 'eraser' };
            if (width) param['width'] = width;
            if (height) param['height'] = height;
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify(param));
        },
        set_pen_state: function(data, action) {
            action = action || 'pen';
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify({ uuid: this.uuid, name: this.name, action: action, data: data }));
        },
        set_color: function(color) {
            wincore.cef.aSyncSendMessage(this, 'set_ink', '', JSON.stringify({ uuid: this.uuid, name: this.name, color: parseInt(color) }));
        },
        get_color: function() {
            var result = wincore.cef.syncSendMessage(this, 'get_color', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            var obj = wincore.JSONParse(result);
            return parseInt(obj.data.color);
        },
        get_pen_state: function() {
            var result = wincore.cef.syncSendMessage(this, 'get_pen_state', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            var obj = wincore.JSONParse(result);
            return obj;
        },
        undo: function() {
            wincore.cef.aSyncSendMessage(this, 'undo', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        clear_pen: function() {
            wincore.cef.aSyncSendMessage(this, 'clear_pen', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        clear_all_page: function() {
            wincore.cef.aSyncSendMessage(this, 'clear_all_page', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        erase_area: function() {
            wincore.cef.aSyncSendMessage(this, 'erase_area', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        load_teach_core: function() {
            if (this.uuid == '') this.create();
            wincore.Disk.global_set_value('module_name', 'teach_core.dll');
            wincore.cef.aSyncSendMessage(this, 'load_teach_core', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        start_teach_core: function() {
            var result = wincore.cef.syncSendMessage(this, 'start_teach_core', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            return wincore.JSONParse(result).data;
        },
        stop_teach_window: function() {
            var result = wincore.cef.syncSendMessage(this, 'stop_teach_window', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
            return wincore.JSONParse(result).data;
        },
        stop_teach_core: function() {
            if (this.uuid && this.uuid != '') {
                var result = wincore.cef.syncSendMessage(this, 'stop_teach_core', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                return wincore.JSONParse(result).data;
            }
            return {};
        },
        show_teach_childwindow: function(args) {
            wincore.cef.aSyncSendMessage(this, 'show_teach_childwindow', '', JSON.stringify({ uuid: this.uuid, name: this.name, param: args }));
        },
        send_teachcore_message: function(args) {
            wincore.cef.aSyncSendMessage(this, 'send_teachcore_message', '', JSON.stringify({ uuid: this.uuid, name: this.name, param: args }));
        },
        on_open_window: function(options) {
            this.trigger(options.data.win_name + ".open", options);
            console.log("WBForm, on_open_window: " + options.data.win_name);
        },
        on_close_window: function(options) {
            if (options.data.win_name == 'WhiteBoardDrawWnd') {
                this.uuid = '';
            }
            this.trigger(options.data.win_name + ".close", options);
            console.log("WBForm, on_close_window: " + options.data.win_name);
        },
        on_window_event: function(options) {
            this.trigger(options.data.win_name + ".windowevent", options);
            console.log("WBForm, on_window_event: " + options.data.win_name);
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

wincore.WBForm = new wincore.oo.WBForm();
//wincore.WBForm.create();
//wincore.WBForm.show();

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.EBookForm) {
        wincore.warn('wincore.oo.EBookForm is already defined');
        return;
    }

    wincore.EBookForm = {};
    wincore.oo.EBookForm = wincore.util.createClass(wincore.Observable, {
        module_name: 'EBookForm',
        name: 'EbookWnd',
        uuid: '',
        initialize: function(data) {},
        create: function() {
            var param = { name: this.name };
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify(param));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        show: function(visible, cx, cy) {
            var param = { uuid: this.uuid, name: this.name, visible: visible === false ? 'false' : 'true', create: 'true', cx: cx, cy: cy };
            wincore.cef.aSyncSendMessage(this, 'show', '', JSON.stringify(param));
        },
        open_book: function(bookid) {
            var param = { uuid: this.uuid, name: this.name, bookid: bookid };
            wincore.cef.aSyncSendMessage(this, 'open_book', '', JSON.stringify(param));
        },
        close: function() {
            wincore.cef.aSyncSendMessage(this, 'close', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        },
        pack_book: function(packpath, savepath, callback) {
            var param = { uuid: this.uuid, name: this.name, packpath: packpath, savepath: savepath };
            wincore.cef.aSyncSendMessage(this, 'pack_book', '', JSON.stringify(param));
            if (callback) {
                this.off('On_ZipBook.' + bookid);
                this.on('On_ZipBook.' + bookid, callback);
            }
        },
        unzip_book: function(path, bookid, callback) {
            var param = { uuid: this.uuid, name: this.name, path: path, bookid: bookid };
            wincore.cef.aSyncSendMessage(this, 'unzip_book', '', JSON.stringify(param));
            if (callback) {
                this.off('On_UnZipBookItems.' + bookid);
                this.on('On_UnZipBookItems.' + bookid, callback);
            }
        },
        unzip_book_resource: function(path, uid, bookid) {
            var param = { uuid: this.uuid, name: this.name, path: path, uid: uid, bookid: bookid };
            wincore.cef.aSyncSendMessage(this, 'unzip_book_resource', '', JSON.stringify(param));
        },
        get_work_path: function(bookid) {
            var param = { uuid: this.uuid, name: this.name, bookid: bookid };
            var result = wincore.cef.syncSendMessage(this, 'get_work_path', '', JSON.stringify(param));
            var obj = wincore.JSONParse(result).data;
            return obj.path ? obj.path : '';
        },
        On_UnZipBookItems: function(e) {
            var name = e.data.name + '.' + e.data.bookid;
            this.trigger(name, e);
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

wincore.EBookForm = new wincore.oo.EBookForm();

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.SQLite) {
        wincore.warn('wincore.oo.SQLite is already defined');
        return;
    }

    wincore.SQLite = {};
    wincore.oo.SQLite = wincore.util.createClass(wincore.Observable, {
        module_name: 'SQLite',
        name: '',
        uuid: '',
        path: '',
        create_tables_sql: [],
        initialize: function(data) {
            data = data || {};
            data.name = data.name || ('SQLite_' + wincore_oo_index++);
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: data.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
            this.name = data.name;
            wincore.SQLite[this.name] = this;
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                delete wincore.SQLite[this.name];
                this.uuid = this.name = null;
            }
        },
        open: function(file_name, callback) {
            wincore.cef.aSyncSendMessage(this, 'open', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name,
                file_name: file_name
            }));
            if (callback) {
                this.on("callback__open", callback);
            }
        },
        close: function(callback) {
            wincore.cef.aSyncSendMessage(this, 'close', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name
            }));
            if (callback) {
                this.on("callback__close", callback);
            }
        },
        execute_query: function(sql, callback) {
            var param = { uuid: this.uuid, name: this.name, sql: sql };
            if (callback) {
                wincore.cef.aSyncSendMessage(this, 'execute_query', '', JSON.stringify(param));
                if (callback) {
                    this.on("callback__execute_query", callback);
                }
                return;
            }

            var result = wincore.cef.syncSendMessage(this, 'execute_query', '', JSON.stringify(param));
            return wincore.JSONParse(result).data;
        },
        execute_noquery: function(sql, commit, callback) {
            var param = { uuid: this.uuid, name: this.name, sql: sql };
            if (commit) param['commit'] = 1;
            wincore.cef.aSyncSendMessage(this, 'execute_noquery', '', JSON.stringify(param));
            if (callback) {
                this.on("callback__execute_noquery", callback);
            }
        },
        // execute_delete: function(sql, callback) {
        //     var param = { uuid: this.uuid, name: this.name, sql: sql };
        //     wincore.cef.aSyncSendMessage(this, 'execute_delete', '', JSON.stringify(param));
        //     if (callback) {
        //         this.on("callback__execute_delete", callback);
        //     }
        // },
        execute_command: function(sql, data, commit, callback) {
            var param = { uuid: this.uuid, name: this.name, sql: sql, data: [], count: data.length };
            for (var i = 0; i < data.length; i++) {
                param.data.push(data[i]);
            }
            if (commit) param['commit'] = 1;
            wincore.cef.aSyncSendMessage(this, 'execute_command', '', JSON.stringify(param));
            if (callback) {
                this.on("callback__execute_command", callback);
            }
        },
        begin_transaction: function(callback) {
            wincore.cef.aSyncSendMessage(this, 'begin_transaction', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name
            }));
            if (callback) {
                this.on("callback__begin_transaction", callback);
            }
        },
        commit: function(callback) {
            wincore.cef.aSyncSendMessage(this, 'commit', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name
            }));
            if (callback) {
                this.on("callback__commit", callback);
            }
        },
        rollback: function(callback) {
            wincore.cef.aSyncSendMessage(this, 'rollback', '', JSON.stringify({
                uuid: this.uuid,
                name: this.name
            }));
            if (callback) {
                this.on("callback__rollback", callback);
            }
        },
        add_create_table: function(check_sql, create_sql) {
            this.create_tables_sql.push({ id: this.create_tables_sql.length, check: check_sql, create: create_sql });
        },
        create_tables: function(callback) {
            if (this.create_tables_sql.length == 0)
                return;
            var param = { uuid: this.uuid, name: this.name, data: this.create_tables_sql };
            wincore.cef.aSyncSendMessage(this, 'create_tables', '', JSON.stringify(param));
            if (callback) {
                this.on("callback__create_tables", callback);
            }
            this.create_tables_sql = [];
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

//var sqlite =  new wincore.oo.SQLite();
//sqlite.open("user_db.db3");
//sqlite.add_create_table('SELECT * FROM user limit 1',
//'CREATE TABLE [user] ([userid] NVARCHAR(50) NOT NULL PRIMARY KEY,[username] NVARCHAR(100),[nickName] NVARCHAR(50),[schoolname] NVARCHAR(50), [age] INTEGER);');
//sqlite.add_create_table('SELECT * FROM settingdata limit 1',
//'CREATE TABLE [settingdata] ([userid] NVARCHAR(50) NOT NULL PRIMARY KEY,[key] NVARCHAR(100),[nickName] NVARCHAR(50),[name] NVARCHAR(50));');
//sqlite.create_tables();
//sqlite.execute_noquery('insert into user(userid, username, schoolname, age) values("0001", "test01", "school 01", 20)', true);
//sqlite.execute_command('insert into user(userid, username, schoolname) values(?, ?, ?)', ['0002', 'test02', 'school 02'], true);
//sqlite.execute_query('SELECT * FROM user');
//sqlite.release();

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.LiveBatchFile) {
        wincore.warn('wincore.oo.LiveBatchFile is already defined');
        return;
    }

    wincore.LiveBatchFile = {};
    wincore.oo.LiveBatchFile = wincore.util.createClass(wincore.Observable, {
        module_name: 'LiveBatchFile',
        node_name: '',
        node_uuid: '',
        live_session: null,
        live_boardcast: null,
        initialize: function(session, boardcast, data) {
            this.live_session = session;
            this.live_boardcast = boardcast;
            this.node_uuid = data.node_uuid;
            this.node_name = data.node_name;
        },
        get_uuid: function() {
            return this.node_uuid;
        },
        release: function() {
            if (this.node_uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify(this.get_param()));
                delete wincore.LiveBatchFile[this.node_name];
                this.node_uuid = null;
            }
        },
        set_cancel: function() {
            wincore.cef.aSyncSendMessage(this.live_session, 'cancel', '', JSON.stringify(this.get_param()));
        },
        on_upload_file: function(e) {
            this.trigger("on_upload_file", e);
            console.log("on_upload_file: " + e);
        },
        on_upload_progress: function(e) {
            this.trigger("on_upload_progress", e);
            console.log("on_upload_progress: " + e);
        },
        on_all_finish: function(e) {
            this.trigger("on_all_finish", e);
            this.release();
            console.log("on_all_finish: " + e);
        },
        on_cancel: function(e) {
            this.trigger("on_cancel", e);
            this.release();
            console.log("on_cancel: " + e);
        },
        get_param: function() {
            return {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
            };
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.LiveBoardcast) {
        wincore.warn('wincore.oo.LiveBoardcast is already defined');
        return;
    }

    wincore.LiveBoardcast = {};
    wincore.oo.LiveBoardcast = wincore.util.createClass(wincore.Observable, {
        module_name: 'LiveBoardcast',
        node_name: '',
        node_uuid: '',
        live_session: null,
        initialize: function(session, data) {
            this.live_session = session;
            this.node_uuid = data.node_uuid;
            this.node_name = data.node_name;
        },
        get_uuid: function() {
            return this.node_uuid;
        },
        send_boardcast: function(json, role, cache) {
            var data = '';
            if (typeof json === 'string')
                data = json;
            else
                data = JSON.stringify(json);
            var param = {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
                data: data,
                role: role,
                cache: cache ? "true" : "false"
            };
            wincore.cef.syncSendMessage(this.live_session, 'send_boardcast', '', JSON.stringify(param));
        },
        send_batch_files(files, uid, docType, docid, URI, isaliyun) {
            var param = {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
                child_name: 'LiveBatchFile',
                uid: uid,
                docType: docType,
                paths: files,
                isaliyun: isaliyun ? 'true' : 'false',
            };
            if (docid) param['docid'] = docid;
            if (URI) param['URI'] = URI;

            var result = wincore.cef.syncSendMessage(this.live_session, 'send_batch_files', '', JSON.stringify(param));
            var obj = wincore.JSONParse(result);
            if (obj.data.node_uuid) {
                var live_batch = new wincore.oo.LiveBatchFile(this.live_session, this, {
                    node_uuid: obj.data.child_uuid,
                    node_name: obj.data.child_name
                });
                wincore.LiveBatchFile[obj.data.child_name] = live_batch;
                return live_batch;
            }

            return null;
        },
        on_subsend_recv: function(data) {
            this.trigger("on_subsend_recv", data);
            console.log("LiveBoardcast, trigger on_subsend_recv: ");
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.LivePlayer) {
        wincore.warn('wincore.oo.LivePlayer is already defined');
        return;
    }

    wincore.LivePlayer = {};
    wincore.oo.LivePlayer = wincore.util.createClass(wincore.Observable, {
        module_name: 'LivePlayer',
        node_name: '',
        node_uuid: '',
        live_session: null,
        initialize: function(session, data) {
            this.live_session = session;
            this.node_uuid = data.node_uuid;
            this.node_name = data.node_name;
        },
        get_uuid: function() {
            return this.uuid;
        },
        send_setparameter: function(action, sortid, data, role, callback) {
            var param = {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
                action: action,
                sortid: sortid,
                data: data,
                role: role
            };
            wincore.cef.aSyncSendMessage(this.live_session, 'send_setparameter', '', JSON.stringify(param));
            if (callback) {
                this.on("callback__send_setparameter", callback);
            }
        },
        send_getparameter: function(sortid) {
            var param = {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
                sortid: sortid
            };
            wincore.cef.aSyncSendMessage(this.live_session, 'send_getparameter', '', JSON.stringify(param));
        },
        set_pos: function(rc) {
            var param = {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
                rc: rc
            };
            wincore.cef.aSyncSendMessage(this.live_session, 'set_pos', '', JSON.stringify(param));
            console.log("LivePlayer set_pos");
        },
        set_visible: function(flag) {
            var param = {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
                visible: flag
            };
            wincore.cef.aSyncSendMessage(this.live_session, 'set_visible', '', JSON.stringify(param));
            console.log("LivePlayer set_visible:" + flag);
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.LiveRecorder) {
        wincore.warn('wincore.oo.LiveRecorder is already defined');
        return;
    }

    wincore.LiveRecorder = {};
    wincore.oo.LiveRecorder = wincore.util.createClass(wincore.Observable, {
        module_name: 'LiveRecorder',
        node_name: '',
        node_uuid: '',
        live_session: null,
        initialize: function(session, data) {
            this.live_session = session;
            this.node_uuid = data.node_uuid;
            this.node_name = data.node_name;
        },
        get_uuid: function() {
            return this.uuid;
        },
        send_setparameter: function(action, sortid, data, role, callback) {
            var param = {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
                action: action,
                sortid: sortid,
                data: data,
                role: role
            };
            wincore.cef.aSyncSendMessage(this.live_session, 'send_setparameter', '', JSON.stringify(param));
            if (callback) {
                this.on("callback__send_setparameter", callback);
            }
        },
        send_getparameter: function(sortid) {
            var param = {
                uuid: this.live_session.uuid,
                name: this.live_session.name,
                node_uuid: this.node_uuid,
                node_name: this.node_name,
                sortid: sortid
            };
            wincore.cef.aSyncSendMessage(this.live_session, 'send_getparameter', '', JSON.stringify(param));
        },
    });

})(typeof exports !== 'undefined' ? exports : this);

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.LiveSession) {
        wincore.warn('wincore.oo.LiveSession is already defined');
        return;
    }

    wincore.LiveSession = {};
    wincore.oo.LiveSession = wincore.util.createClass(wincore.Observable, {
        module_name: 'LiveSession',
        name: 'live_session',
        uuid: '',
        initialize: function(data) {

        },
        get_uuid: function() {
            return this.uuid;
        },
        create: function(uid, uname, role) {
            var param = { name: this.name, uid: uid, uname: uname, role: role };
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify(param));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        start_boardcast: function(node_name, ip, room_id) {
            var param = { uuid: this.uuid, name: this.name, URI: ip, room_id: room_id, node_name: node_name };
            var result = wincore.cef.syncSendMessage(this, 'start_boardcast', '', JSON.stringify(param));
            var obj = wincore.JSONParse(result);
            if (obj.data.node_uuid) {
                var live_boardcast = new wincore.oo.LiveBoardcast(this, {
                    node_uuid: obj.data.node_uuid,
                    node_name: obj.data.node_name
                });
                wincore.LiveBoardcast[obj.data.node_name] = live_boardcast;
                return live_boardcast;
            }

            return null;
        },
        stop_boardcast: function(node_name) {
            if (wincore.LiveBoardcast.hasOwnProperty(node_name)) {
                var live_boardcast = wincore.LiveBoardcast[node_name];
                var param = { uuid: this.uuid, name: this.name, node_uuid: live_boardcast.node_uuid, node_name: live_boardcast.node_name };
                wincore.cef.aSyncSendMessage(this, 'stop_boardcast', '', JSON.stringify(param));
                delete wincore.LiveBoardcast[node_name];
            }
        },
        start_player: function(winForm, ip, stream_id, xml_path, ctl_name, audio, view_name) {
            //if (!winForm) return -1;
            var param = {
                uuid: this.uuid,
                name: this.name,
                URI: ip + '/' + stream_id + ".sdp",
                node_name: winForm ? winForm.name : 'video_view',
                view_name: view_name ? view_name : 'view',
                video: 'true',
            };
            param['parent'] = winForm ? winForm.get_uuid() : '';
            param['xml_path'] = xml_path;
            if (typeof ctl_name === 'string')
                param['ctl_name'] = ctl_name;
            else if (ctl_name && ctl_name.hasOwnProperty('x'))
                param['rc'] = ctl_name;
            param['audio'] = audio ? 'true' : 'false';
            var result = wincore.cef.syncSendMessage(this, 'start_player', '', JSON.stringify(param));
            var obj = wincore.JSONParse(result);
            if (obj.data.node_uuid) {
                var live_player = new wincore.oo.LivePlayer(this, {
                    node_uuid: obj.data.node_uuid,
                    node_name: obj.data.node_name
                });
                wincore.LivePlayer[obj.data.node_name] = live_player;
                console.log('start_player, name: ' + obj.data.node_name);
                return live_player;
            }

            return null;
        },
        stop_player: function(node_name) {
            if (wincore.LivePlayer.hasOwnProperty(node_name)) {
                console.log('stop_player, name: ' + node_name);
                var live_player = wincore.LivePlayer[node_name];
                var param = { uuid: this.uuid, name: this.name, node_uuid: live_player.node_uuid, node_name: live_player.node_name };
                wincore.cef.aSyncSendMessage(this, 'stop_player', '', JSON.stringify(param));
                delete wincore.LivePlayer[node_name];
            }
        },
        start_recorder: function(node_name, ip, stream_id, sent_audio, sent_rfb, device_mode, parent) {
            var param = {
                uuid: this.uuid,
                name: this.name,
                URI: ip + '/' + stream_id + ".sdp",
                node_name: node_name
            };
            param['sent_audio'] = sent_audio ? 'true' : 'false';
            param['sent_video'] = 'true';
            param['sent_rfb'] = sent_rfb ? 'true' : 'false';
            param['device_mode'] = device_mode ? device_mode : 1;
            if (parent) param['parent'] = parent.get_uuid();
            var result = wincore.cef.syncSendMessage(this, 'start_recorder', '', JSON.stringify(param));
            var obj = wincore.JSONParse(result);
            if (obj.data.node_uuid) {
                var live_recorder = new wincore.oo.LiveRecorder(this, {
                    node_uuid: obj.data.node_uuid,
                    node_name: obj.data.node_name
                });
                wincore.LiveRecorder[obj.data.node_name] = live_recorder;
                console.log('start_recorder, name: ' + obj.data.node_name);
                return live_recorder;
            }

            return null;
        },
        stop_recorder: function(node_name) {
            if (wincore.LiveRecorder.hasOwnProperty(node_name)) {
                console.log('stop_recorder, name: ' + node_name);
                var live_recorder = wincore.LiveRecorder[node_name];
                var param = { uuid: this.uuid, name: this.name, node_uuid: live_recorder.node_uuid, node_name: live_recorder.node_name };
                wincore.cef.aSyncSendMessage(this, 'stop_recorder', '', JSON.stringify(param));
                delete wincore.LiveRecorder[node_name];
            }
        },
    });

})(typeof exports !== 'undefined' ? exports : this);

wincore.LiveSession = new wincore.oo.LiveSession();
//wincore.LiveSession.create('0001', 'test01', 'student');
//wincore.LiveSession.start_player(wincore.WindowForm.live_player, 'rtsp://127.0.0.1:555', '123456', 'live_study/player.xml', 'media_player');
//wincore.LiveSession.start_boardcast('live_boardcast', 'ws://127.0.0.1:9021/', 'm_tea');
//wincore.LiveBoardcast.live_boardcast.on("on_connect", function(e) {
//    wincore.LiveBoardcast.live_boardcast.send_batch_files(['C:\\Users\\T480S\\Pictures\\20181015224313.jpg'], '0001', 'cls', '', '', false);
//);
//wincore.LiveBoardcast.live_boardcast.send_boardcast(JSON.stringify({sortid: 'pen', id: '1234567890'}), 'all', true);
//wincore.LiveSession.stop_boardcast('live_boardcast');
//wincore.LiveSession.start_recorder('live_recorder', 'rtsp://127.0.0.1:555', '123456');

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.VideoRecorder) {
        wincore.warn('wincore.oo.VideoRecorder is already defined');
        return;
    }

    wincore.VideoRecorder = {};
    wincore.oo.VideoRecorder = wincore.util.createClass({
        module_name: 'VideoRecorder',
        name: 'video_recorder',
        uuid: '',
        initialize: function(data) {},
        get_uuid: function() {
            return this.uuid;
        },
        create: function() {
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: this.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        start_record: function() {
            wincore.cef.aSyncSendMessage(this, 'start_record', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

wincore.VideoRecorder = new wincore.oo.VideoRecorder();
//wincore.VideoRecorder.create();

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.AsyncEvent) {
        wincore.warn('wincore.oo.AsyncEvent is already defined');
        return;
    }

    wincore.AsyncEvent = {};
    wincore.oo.AsyncEvent = wincore.util.createClass(wincore.Observable, {
        module_name: 'AsyncEvent',
        name: 'async_event',
        uuid: '',
        initialize: function(data) {},
        get_uuid: function() {
            return this.uuid;
        },
        create: function() {
            if (this.uuid != '') return;
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: this.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        //只监听一次，回调处理后自动取消监听
        listen_once(key, callback) {
            var self = this;
            //在one函数运行原来的函数
            function one() {
                //先绑定 执行后再删除
                callback.apply(self, arguments);
                self.off(key);
            }
            this.on(key, one);
        },
        random_string(len) {
            len = len || 32;
            let chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
            let maxPos = chars.length;
            let pwd = '';
            for (let i = 0; i < len; i++) {
                pwd += chars.charAt(Math.floor(Math.random() * maxPos));
            }
            return pwd;
        },
        compress_file: function(src, dest, callback) {
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'compress_file', event_name, JSON.stringify({ uuid: this.uuid, name: this.name, id: event_name, src: src, dest: dest }));
            if (callback) {
                this.listen_once('on_event_fire.' + event_name, callback);
            }
            wincore_event_index++;
        },
        uncompress_file: function(src, dest, callback) {
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'uncompress_file', event_name, JSON.stringify({ uuid: this.uuid, name: this.name, id: event_name, src: src, dest: dest }));
            if (callback) {
                this.listen_once("on_event_fire." + event_name, callback);
            }
            wincore_event_index++;
        },
        load_jscore_plus: function(module_name, path, callback) {
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'load_jscore_plus', event_name, JSON.stringify({ uuid: this.uuid, name: this.name, id: event_name, module_name: module_name, path: path }));
            if (callback) {
                this.listen_once('on_event_fire.' + event_name, callback);
            }
            wincore_event_index++;
        },
        copy_file: function(srcfile, destfile, callback) {
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'copy_file', event_name, JSON.stringify({ uuid: this.uuid, name: this.name, id: event_name, src: srcfile, dest: destfile }));
            if (callback) {
                this.listen_once('on_event_fire.' + event_name, callback);
            }
            wincore_event_index++;
        },
        unload_jscore_plus: function(module_name, path) {
            wincore.cef.aSyncSendMessage(this, 'unload_jscore_plus', '', JSON.stringify({ uuid: this.uuid, name: this.name, module_name: module_name }));
        },
        async_call: function(target, target_method, target_param, callback) {
            target_param['uuid'] = target.uuid;
            target_param['module_name'] = target.module_name;
            target_param['name'] = target.name;
            target_param['method'] = target_method;
            var event_name = '' + wincore_event_index;
            wincore.cef.aSyncSendMessage(this, 'async_call', event_name, JSON.stringify({ uuid: this.uuid, id: event_name, target_param: target_param }));
            if (callback) {
                this.listen_once('on_event_fire.' + event_name, callback);
            }
            wincore_event_index++;
        }
    });

})(typeof exports !== 'undefined' ? exports : this);

(function(global) {
    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.FFmpegCmd) {
        wincore.warn('wincore.oo.FFmpegCmd is already defined');
        return;
    }

    wincore.FFmpegCmd = {}
    wincore.oo.FFmpegCmd = wincore.util.createClass(wincore.Observable, {
        module_name: 'FFmpegCmd',
        name: 'ffmpeg_cmd',
        uuid: '',
        initialize: function(data) {},
        get_uuid: function() {
            return this.uuid;
        },
        create: function() {
            if (this.uuid != '') return;
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: this.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        _asyncMsg(method, data, callback) {
            data = {
                uuid: this.uuid,
                name: this.name,
                ...data
            };
            let result = wincore.cef.aSyncSendMessage(this, method, '', JSON.stringify(data));

            if (callback) this.on(`callback__${method}`, callback)

            return result;
        },
        handle_video(files_span, output_path) {
            let result = this._asyncMsg("handle_video", { files_span, output_path })
        },
        cut_video(file_path, output_path, begin, end) {
            let result = this._asyncMsg("cut_video", { file_path, output_path, begin, end }, callback)
        },
        merge_video(files_span, output_path) {
            let result = this._asyncMsg("merge_video", { files_span, output_path }, callback)
        },
        shot_video(file_path, output_path, time, callback) {
            let result = this._asyncMsg("shot_video", { file_path, output_path, time }, callback)
        },
        stop_handle(callback) {
            let result = this._asyncMsg("stop_handle", {}, callback)
        },
        on_process(options) {
            this.trigger("on_process", options);
        },
        on_complete(options) {
            this.trigger("on_complete", options);
        }
    });


})(typeof exports !== 'undefined' ? exports : this);

// wincore.AsyncEvent.async_call(pdfDocument, 'pdf_2_ebook', 
// { bookid: '1234',src: 'C:\\Users\\Administrator\\Desktop\\test\\合肥市政府信息公开网(3)(1).pdf', dest: 'D:\\Temp\\datedu resource\\ebook\\' },
// function(e) {
//   console.log('read_file');
// });

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.PdfDocument) {
        wincore.warn('wincore.oo.TestTask is already defined');
        return;
    }

    wincore.PdfDocument = {};
    wincore.oo.PdfDocument = wincore.util.createClass(wincore.Observable, {
        module_name: 'PdfDocument',
        name: 'PdfDocument',
        uuid: '',
        initialize: function(data) {
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: this.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
        },
        get_uuid: function() {
            return this.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        stop_all_task: function() {
            var result = wincore.cef.syncSendMessage(this, 'stop_all_task', '', JSON.stringify({ uuid: this.uuid }));
            var obj = wincore.JSONParse(result);
            return obj.data;
        },
        get_pdf_document: function(src) {
            var result = wincore.cef.syncSendMessage(this, 'get_pdf_document', '', JSON.stringify({ uuid: this.uuid, src: src }));
            var obj = wincore.JSONParse(result);
            return obj.data;
        },
        pdf_2_image: function(src, dest) {
            wincore.cef.aSyncSendMessage(this, 'pdf_2_image', '', JSON.stringify({ uuid: this.uuid, src: src, dest: dest }));
        },
        pdf_2_ebook: function(src, dest) {
            wincore.cef.aSyncSendMessage(this, 'pdf_2_ebook', '', JSON.stringify({ uuid: this.uuid, src: src, dest: dest }));
        },
    });

})(typeof exports !== 'undefined' ? exports : this);

wincore.PdfDocument = new wincore.oo.PdfDocument();

(function(global) {

    'use strict';
    var wincore = global.wincore || (global.wincore = {});

    if (wincore.oo.DiskSearch) {
        wincore.warn('wincore.oo.TestTask is already defined');
        return;
    }

    wincore.DiskSearch = {};
    wincore.oo.DiskSearch = wincore.util.createClass(wincore.Observable, {
        module_name: 'DiskSearch',
        name: 'DiskSearch',
        uuid: '',
        initialize: function(data) {},
        get_uuid: function() {
            return this.uuid;
        },
        create: function() {
            if (this.uuid != '') return;
            var result = wincore.cef.syncSendMessage(this, 'create', '', JSON.stringify({ name: this.name }));
            var obj = wincore.JSONParse(result);
            this.uuid = obj.data.uuid;
        },
        release: function() {
            if (this.uuid) {
                wincore.cef.syncSendMessage(this, 'release', '', JSON.stringify({ uuid: this.uuid, name: this.name }));
                this.uuid = null;
            }
        },
        //只监听一次，回调处理后自动取消监听
        listen_once(key, callback) {
            var self = this;
            //在one函数运行原来的函数
            function one() {
                //先绑定 执行后再删除
                callback.apply(self, arguments);
                self.off(key);
            }
            this.on(key, one);
        },
        init_search: function(callback) {
            wincore.cef.syncSendMessage(this, 'init_search', '', JSON.stringify({ uuid: this.uuid }));
            if (callback) {
                this.listen_once('init_search_callback', callback);
            }
        },
        file_search: function(search_string_, page_size_, page_num_, callback) {
            wincore.cef.syncSendMessage(this, 'file_search', '', JSON.stringify({ uuid: this.uuid, search_string: search_string_, page_size: page_size_, page_num: page_num_ }));
            if (callback) {
                this.listen_once('file_search_callback', callback);
            }
        },
    });

})(typeof exports !== 'undefined' ? exports : this);

wincore.AsyncEvent = new wincore.oo.AsyncEvent();
/*wincore.AsyncEvent.create();
wincore.AsyncEvent.load_jscore_plus('PdfDocument', 'jscore_office_plus.dll', function(e) {
    var pdfDocument = new wincore.oo.PdfDocument();
    wincore.AsyncEvent.async_call(pdfDocument, 'pdf_2_ebook', 
    { bookid: '1234',
      src: 'C:\\Users\\T480S\\Desktop\\slam.pdf', 
      dest: 'D:\\Temp\\datedu resource\\ebook\\' }, function(e) {
        console.log('read_file');
    });
});*/

wincore.onCallback = function(cmd, json, eventname) {
    var items = cmd.split(":");
    if (items.length < 3) return;

    var module_name = items[0];
    var method_name = items[1];
    console.log("onCallback, module_name: " + module_name + ", " + method_name + ',' + json);
    var objs = wincore[module_name];
    if (!objs) return;

    var object = null;
    var data = wincore.JSONParse(json).data;
    if (objs.hasOwnProperty(data.name)) {
        object = objs[data.name];
    } else if (data.node_name && objs.hasOwnProperty(data.node_name)) {
        object = objs[data.node_name];
    } else if (objs.__proto__.hasOwnProperty('name') && objs.name == data.name) {
        object = objs;
    }
    if (!object) {
        console.log("onCallback not found object, name: " + data.name + ", " + objs.name)
        return;
    }

    data['target'] = object;
    if (eventname == undefined || eventname == '')
        eventname = '';
    else
        eventname = '_' + eventname;
    if (object.trigger) {
        object.trigger("callback__" + method_name + eventname, data);
        object.off("callback__" + method_name + eventname);
    }
};

wincore.onAyncNotify = function(cmd, event, json) {
    var items = cmd.split(":");
    if (items.length < 3) return;

    var module_name = items[0];
    var method_name = items[1];
    console.log("onAyncNotify, module_name: " + module_name + ", " + method_name);
    var objs = wincore[module_name];
    if (!objs) return;

    var data = wincore.JSONParse(json).data;
    if (!objs.hasOwnProperty(data.name) && method_name == "on_close") {
        console.log(module_name + "." + data.name + " not exitst");
        return;
    }

    var object = null;
    if (objs.hasOwnProperty(data.name)) {
        object = objs[data.name];
    } else if (objs.__proto__.hasOwnProperty('name') && objs.name == data.name) {
        object = objs;
    }
    if (!object) {
        if (module_name == 'LivePlayer')
            object = new wincore.oo[module_name](wincore.LiveSession, data);
        else if (module_name == 'LiveRecorder')
            object = new wincore.oo[module_name](wincore.LiveSession, data);
        else if (method_name == 'on_create')
            object = new wincore.oo[module_name](data);
        else {
            console.log(cmd + "." + data.name + " not exitst");
            return;
        }
        objs[data.name] = object;
    }

    data['target'] = object;
    data['event'] = event;
    if (object.__proto__.hasOwnProperty(method_name)) {
        object[method_name](data);
    } else {
        object.trigger(method_name, data);
    }

    //console.log("onAyncNotify, " + cmd + ", " + event + ", " + json);
};
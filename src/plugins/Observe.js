/*
 * 观察者 通过观察者实现跨组件数据传递(自己封装)
 * _observeListList：用来保存观察者集合的数组
 * type：字符串，观察者类型/被观察对象
 * handle:函数，观察者内容/具体观察者
 * options:数据，跨组件数据传递传递的数据，任意类型
*/

 const Observe = {
    _observeListList : [],                                          
    //添加观察者/添加事件监听
    on:function(type,handle){                                       
        if(arguments.length !== 2){                                 
            throw new Error("参数个数有误！");                       
        }
        if(typeof type !== 'string' || typeof handle !== 'function'){
            throw new Error("参数类型有误！");
        }
        if(!this._observeListList[type]){
            this._observeListList[type] = [];
        }else{
            for(let item of this._observeListList[type]){
                if(item === handle){
                    throw new Error("该观察者已添加，不能重复添加！");
                }
            }
        }
        this._observeListList[type].push(handle);
        // console.log(this._observeListList);
        return this._observeListList;
    },
    //移除观察者/移除事件监听
    off:function(type,handle){
        if(arguments.length > 2){
            throw new Error("参数个数有误！");
        }
        //不传参数：把所有观察者清空 不要直接赋值为[],效率太低
        if(arguments.length===0){
            for(type in this._observeListList){
                _removeTypeObserve.call(this,type);
            }
        //传一个参数：限制是type,把这种类型的观察者清空   
        }else if(arguments.length===1){
            if(typeof type !== 'string'){
                throw new Error("参数类型有误！");
            }
            _removeTypeObserve.call(this,type);
        }else{
            if(typeof type !== 'string' || typeof handle !== 'function'){
                throw new Error("参数类型有误！");
            }
            _removeTypeObserve.call(this,type,handle);
        }
        // console.log(this._observeListList);
        return this._observeListList;
    },
    //触发观察者/触发事件监听
    trigger:function(type,options){
        if(arguments.length===0 || arguments.length>2){   //只能传一个参数或两个参数
            throw new Error("参数个数有误！");
        }
        if(typeof type !== 'string'){
            throw new Error("参数类型有误！"); 
        }
        if(this._observeListList[type] && this._observeListList[type].length!==0){
            //遍历出该被观察对象的所有观察者（函数），然后执行观察者（函数），同时把传递的数据作为参数传递到函数中（有三种方法，本质是一种，其实就是调用这个函数，有三种不同的书写方式而已）
            //方法1：遍历出数组中保存的函数，然后执行这个函数(),同时传递参数（注意：函数不加()这个函数不会执行）
            // for(let index=this._observeListList[type].length-1;index>=0;index--){
            //     this._observeListList[type][index](typeof options === 'boolean'|'number' ? options : (options ? options : undefined));
            // }
            //方法2：使用forEach遍历出数组中保存的函数，然后把这个函数作为forEach中的匿名函数的参数传入到匿名函数中，然后在匿名函数再调用这个函数
            this._observeListList[type].forEach(observe => {
                observe(typeof options === 'boolean'||'number' ? options : (options ? options : undefined));
            });
            //方法3：遍历出保存在数组中的函数，然后调用这个函数，调用的时候改变这个函数中的this指向，另外也传入参数，然后执行这样的函数（this指向好像没变）
            // for(let index=0;index<this._observeListList[type].length;index++){
            //     this._observeListList[type][index].call(this,typeof options === 'boolean'|'number' ? options : (options ? options : undefined));
            // }
        }else{
            throw new Error("观察者不存在！");
        }
        // console.log(this._observeListList);
        return this._observeListList;
    },
    //获取所有观察者
    getAllObserve:function(){
        return this._observeListList;
    },
    //获取某种类型的所有观察者/获取某个被观察对象的所有观察者
    getTypeObserve:function(type){
        return this._observeListList[type];
    },
 }

 //删除观察者
 //一个参数：清空一种类型的所有观察者/清空被观察对象的所有观察者   两个参数：清除一个观察者
 function _removeTypeObserve(type,handle){
    if(!this._observeListList[type] || this._observeListList[type].length === 0){
        return;
    }
    if(arguments.length === 1){
        this._observeListList[type].splice(0,this._observeListList[type].length);
    }else{
        if(this._observeListList[type].indexOf(handle)===-1){
            return;
        }
        this._observeListList[type].splice(this._observeListList[type].indexOf(handle),1);
    }
 }
 export default Observe;
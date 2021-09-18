<template>
    <div class="login-back" v-loading="loading" element-loading-text="登录中...">
        <div class="login-page">
            <div class="login-title">Personal Blog</div>
            <div class="login-form">
                <el-input class="login-username" v-model="loginInfo.user_name" @focus="inputGetFocus('el-icon-user-solid')" 
                    @blur="inputLoseFocus('el-icon-user-solid')" prefix-icon="el-icon-user-solid" placeholder="请输入用户名">
                </el-input>
                <el-input class="login-password" v-model="loginInfo.password" @focus="inputGetFocus('el-icon-s-goods')" 
                    @blur="inputLoseFocus('el-icon-s-goods')" prefix-icon="el-icon-s-goods" placeholder="请输入密码" show-password>
                </el-input>
                <el-checkbox class="save-pwd" v-model="loginInfo.isSavePwd">记住密码</el-checkbox>
                <div class="login-btn" @click="userLogin">登录</div>
            </div>
        </div>
    </div>
</template>

<script>
import {LoginBack} from '../../service/base';
let Base64 = require('js-base64').Base64;
export default {
    name:'login-back',
    components:{

    },
    data(){
        return {
            loginInfo:{                                                      //登录信息
                user_name:'',
                password:'',
                isSavePwd:false
            },
            loading  : false,                                               //加载中
        }
    },
    mounted(){
        if(this.$localSave.get('userInfo')){
            this.$router.push('/back');
        }
        this.getLoginInfo();
    },
    methods:{
        //input标签获取焦点：将图标颜色改为#0199ff
        inputGetFocus(name){
            let icon = document.getElementsByClassName(name)[0];
            icon.style.color = "#0199ff";
        },
        //input标签失去焦点：将图标颜色改为#C0C4CC
        inputLoseFocus(name){
            let icon = document.getElementsByClassName(name)[0];
            icon.style.color = "#C0C4CC";
        },
        //用户登录
        userLogin(){
            this.loading = true;
            if(!this.loginInfo.user_name || !this.loginInfo.password){
                this.$message({message:"用户名或密码不能为空",type:'error'});
                return;
            }
            let parmas = {
                user_name:this.loginInfo.user_name,
                password:this.loginInfo.password
            }
            LoginBack(parmas).then(res => {
                this.loading = false;
                this.$message({message:"登录成功",type:'success'});
                this.$router.push('/back');
                this.saveUserInfo(res);
                this.saveLoginInfo();
            }).catch(err => {
                this.loading = false;
                this.$message({message:err.msg,type:'error'});
            })
        },
        //保存用户信息
        saveUserInfo(userInfo){
            this.$localSave.set("userInfo",userInfo);
        },
        //删除用户信息
        removeUserInfo(){
            this.$localSave.delete("userInfo");
        },
        //保存登录信息
        saveLoginInfo(){
            let userInfo;
            if(this.loginInfo.isSavePwd){
                userInfo = {
                    userName: this.loginInfo.user_name,
                    passWord: Base64.encode(this.loginInfo.password),
                    isSavePwd: this.loginInfo.isSavePwd
                }
            }else{
                userInfo = {
                    userName: this.loginInfo.user_name,
                    isSavePwd: this.loginInfo.isSavePwd
                }
            }
            this.$cookieSave.set("user",userInfo,3);
        },
        //获取登录信息
        getLoginInfo(){
            let userInfo = this.$cookieSave.get("user");
            if(!userInfo){
                return;
            }
            if(userInfo.isSavePwd){
                this.loginInfo.user_name = userInfo.userName;
                this.loginInfo.password = Base64.decode(userInfo.passWord);
                this.loginInfo.isSavePwd = userInfo.isSavePwd;
            }else{
                this.loginInfo.user_name = userInfo.userName;
                this.loginInfo.isSavePwd = userInfo.isSavePwd;
            }
        }
    }
}
</script>

<style lang="scss" scoped>
@import '../../styles/variables.scss';

.login-back {
    position           : fixed;
    top                : 0;
    left               : 0;
    width              : 100%;
    height             : 100%;
    zoom               : 1;
    background-color   : white;
    background         : url(../../assets/login-background.jpg) no-repeat;
    background-size    : cover;
    background-position: center 0;
    .login-page {
        @include stretch(50%,0,0,50%);
        transform: translate(-50%, -50%);
        width        : 320px;
        height       : 340px;
        padding      : 26px;
        background   : #FFFFFF;
        border-radius: 8px;
        .login-title {
            margin    : 0 auto 38px;
            font-size : 26px;
            color     : #0199ff;
            text-align: center;
        }
        .login-form {
            width : 252px;
            margin: 0 auto;
            .login-username {
                margin-bottom: 12px;
            }
            .login-password{
                margin-bottom: 12px;
            }
            .save-pwd {
                margin-bottom: 38px;
                font-size    : 12px;
            }
            .login-btn {
                margin       : 0 auto;
                text-align   : center;
                height       : 45px;
                line-height  : 45px;
                border-radius: 4px;
                font-size    : 18px;
                border       : 1px solid #dcdfe6;
                &:hover {
                    cursor: pointer;
                }
            }
        }
    }
}
</style>

<style lang="scss">
@import '../../styles/variables.scss';

.login-page {
    .el-input {
        height   : 50px;
        font-size: 15px;
        .el-input__inner {
           height: 50px; 
        }
    }
    .el-input__prefix .el-input__icon{
        display    : flex;
        align-items: center;
        width      : 25px;
        line-height: 34px;
    }
    .el-input .el-input__clear{
        display    : flex;
        align-items: center;
        font-size  : 15px;
    }
}
.el-message {
        top      : 30% !important;
        min-width: 316px;
}
</style>
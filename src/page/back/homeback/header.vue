<template>
    <div class="header-back">
        <div class="header-icon">Person Blog</div>
        <div class="header-title">博客后台管理</div>
        <div class="user-box">
            <div class="user-avatars-nick">
                <img :src="userInfo.img_url || avatarsImg" class="user-avatars" alt="avatars">
                <el-dropdown>
                    <span class="user-nick">{{userInfo.nick_name || "未添加昵称"}}</span>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item @click.native="jumpFront">跳转前台</el-dropdown-item>
                        <el-dropdown-item @click.native="loginBack">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
            
            
        </div>
    </div>
</template>

<script>
import {RemoveImg} from '../../../service/base'
import {Events} from '../../../module/eventTypeList'
export default {
    name:'header-back',
    components:{

    },
    data(){
        return {
            userInfo  : {},                                                 //用户信息
            avatarsImg: require('../../../assets/default-avatars.jpg'),     //默认头像
        }
    },
    mounted(){
        this.getUserInfo();
        this.initEventListen();
    },
    beforeDestroy(){
        this.offEventListen();
    },
    methods:{
        //初始化事件监听（绑定观察者）
        initEventListen(){
            this.$bus.on(Events.USERINFO_UPDATE,this.getUserInfo);
        },
        //监听事件解绑
        offEventListen(){
            this.$bus.off(Events.USERINFO_UPDATE,this.getUserInfo);
        },
        //获取用户信息
        getUserInfo(){
            this.userInfo = this.$localSave.get('userInfo');
        },
        //退出登录
        loginBack(){
            this.$router.push('/login');
            this.$message({message:"退出成功",type:'success'});
            this.$localSave.delete('userInfo');
            this.deleteOldUploadImg();
        },
        //跳转到前台
        jumpFront(){
            this.$router.push('/front');
        },
        //删除旧的上传的图片并清除local
        deleteOldUploadImg(){
            let oldUploadImg = this.$localSave.get('oldUploadImg');
            if(oldUploadImg){
                let oldImgName = oldUploadImg.img_url.split('/')[4];
                RemoveImg({fileName:oldImgName}).then(res => {
                    console.log("删除图片====>","删除成功");
                }).catch(err => {
                    console.log("删除图片====>",err.msg);
                });
                this.$localSave.delete('oldUploadImg');
            }
        },
    }
}
</script>

<style lang="scss" scoped>
.header-back {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    .header-icon {
        font-size : 26px;
        color     : #0199ff;
    }
    .header-title {
        font-size : 26px;
    }
    .user-box {
        .user-avatars-nick {
            display    : flex;
            align-items: center;
            line-height: 40px;
            .user-avatars {
                width        : 32px;
                height       : 32px;
                border-radius: 50%;
                margin-right : 10px;   
            }
            .user-nick {
                font-size: 16px;
                &:hover{
                    cursor: default;
                }
            }
        }
    }   
}
</style>

<style lang="scss">

</style>
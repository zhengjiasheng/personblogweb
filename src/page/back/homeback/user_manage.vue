<template>
    <div class="user_manage">
        <main-title title="个人信息"></main-title>
        <div class="user-content-show" @mouseover="isShowEditBtn = true" @mouseout="isShowEditBtn = false"
         @click="isEdit = true" v-if="!isEdit">
            <div class="turn-edit" v-show="isShowEditBtn">
                <i class="el-icon-edit"></i>
                <span>编辑</span>
            </div>
            <ul class="show-list">
                <li>用户名：{{userInfo.user_name}}</li>
                <li>密码：{{userInfo.password}}</li>
                <li>昵称：{{userInfo.nick_name || '未添加'}}</li>
                <li>个性签名：{{userInfo.sign || '未添加'}}</li>
                <li>头像地址：{{userInfo.img_url || '未添加'}}</li>
                <li>个人简介：{{userInfo.profile || '未添加'}}</li>
            </ul>  
        </div>
        <div class="user-content-edit" v-else>
            <!-- 文件上传组件 -->
            <file-upload ref="fileUpload" @uploadSuccess="uploadSuccess"></file-upload>
            <div class="edit-content">
                <el-form ref="userInfo" :model="userInfo" label-width="90px">
                    <el-form-item label="用户名:">
                        <el-input v-model="userInfo.user_name" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="密码:">
                        <el-input v-model="userInfo.password" show-word-limit maxlength="32" placeholder="请输入密码"></el-input>
                        <span class="password-tip" v-show="!userInfo.password">*密码不能为空</span>
                    </el-form-item>
                    <el-form-item label="昵称:">
                        <el-input v-model="userInfo.nick_name" show-word-limit maxlength="40" placeholder="请输入昵称"></el-input>
                    </el-form-item>
                    <el-form-item label="个性签名:">
                        <el-input v-model="userInfo.sign" show-word-limit maxlength="40" placeholder="请输入个性签名"></el-input>
                    </el-form-item>
                    <el-form-item label="头像地址:">
                        <el-input v-model="userInfo.img_url" @click.native="openFileUpload" placeholder="请选择头像" title="上传图片" class="img-url-input" readonly>
                        </el-input>
                        <el-button icon="el-icon-close" size="mini" circle @click.native="clearAll"></el-button>
                    </el-form-item>
                    <el-form-item label="个人简介:">
                        <el-input v-model="userInfo.profile" type="textarea" placeholder="请输入个人简介"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="small" type="primary" @click="updateUserInfo">确定</el-button>
                        <el-button size="small" @click="backShow">取消</el-button>
                    </el-form-item>
                </el-form>
            </div>   
        </div>
    </div>
</template>

<script>
import {RemoveImg,GetBloggerInfoById,UpdateBloggerInfo} from '../../../service/base'
import MainTitle from '../../../components/MainTitle'
import FileUpload from '../../../components/FileUpload'
import {Events} from '../../../module/eventTypeList'
export default {
    name:'user_manage',
    components:{
        FileUpload,
        MainTitle
    },
    data(){
        return {
            userInfo :{                                                     //用户信息
                blogger_id :0,
                user_name  :'',
                password   :'',
                nick_name  :'',
                sign       :'',
                img_url    :'',
                profile    :''
            },
            isShowEditBtn : false,                                         //是否显示编辑按钮
            isEdit        : false,                                         //是否编辑
        }

    },
    computed:{

    },
    mounted(){
        this.getUserInfo();
        this.deleteOldUploadImg();
    },
    beforeDestroy(){
        this.deleteOldUploadImg();
    },
    methods:{
        //修改用户(博主)信息
        updateUserInfo(){
            if(!this.userInfo.password){
                this.$message.error("密码不能为空");
                return;
            }
            UpdateBloggerInfo(this.userInfo).then(res => {
                this.$message.success("修改成功");
                this.$localSave.delete('oldUploadImg');
                this.getUpdatedUserInfo();
            }).catch(err => {
                this.$message.error(err.msg);
                console.log("用户信息修改失败===>",err);
            })
        },
        //获取修改后的用户信息
        getUpdatedUserInfo(){
            let params = {
                blogger_id : this.userInfo.blogger_id
            }
            GetBloggerInfoById(params).then(res => {
                this.userInfo = res;
                this.isEdit = false;
                this.$localSave.set("userInfo",res);
                this.$bus.trigger(Events.USERINFO_UPDATE);
            }).catch(err => {
                console.log(err);
            })
        },
        //打开文件上传
        openFileUpload(){
           this.$refs.fileUpload.openFileUpload();
        },
        //返回展示页面
        backShow(){
            this.getUserInfo();
            this.isEdit = false;
            this.deleteOldUploadImg();
        },
        //获取用户信息
        getUserInfo(){
            this.userInfo = this.$localSave.get('userInfo');
        },
        //文件上传成功
        uploadSuccess(data){
            this.removeOldUploadImg();
            //保存当前上传成功的图片域名，用于下次上传图片成功后把这个旧图片删除
            this.$localSave.set('oldUploadImg',{img_url:data.img_url});
            this.userInfo.img_url = data.img_url;
        },
        // 删除之前上传的图片
        removeOldUploadImg(){
            let oldUploadImg = this.$localSave.get('oldUploadImg');
            if(oldUploadImg){
                let oldImgName = oldUploadImg.img_url.split('/')[4];
                RemoveImg({fileName:oldImgName}).then(res => {
                    console.log("删除图片====>","删除成功");
                }).catch(err => {
                    console.log("删除图片====>",err.msg);
                });
            }
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
        //清空图片路径
        clearAll(){
            this.userInfo.img_url = '';
            this.deleteOldUploadImg();
        }
    }
}
</script>

<style lang="scss" scoped>
.user_manage {
    width : 100%;
    height: 100%;
    .user-content-show {
        width : 98%;
        height: calc(100% - 42px);
        margin: 20px 0 0 0;  
        .show-list {
            list-style-type: none;
            padding        : 10px 0 10px 10px;
            font-size      : 15px;
            &:hover {
                background: #E4E7ED;
                cursor    : pointer;
            }
            li {
                margin-bottom: 40px;
            }
        }
        .turn-edit {
            float : right;
            margin: 10px 10px 0 0;
            color : #0199ff;
        }
    }
    .user-content-edit {
        width     : 100%;
        height    : calc(100% - 42px);
        background: #f8f8f8;
        .edit-content {
            margin: 0 0 0 15%;
            width : 80%; 
        }
        .password-tip {
            color    : #f56353;
            font-size: 12px;
        }
    }
}

</style>

<style lang="scss">
.user-content-edit {
    .el-form{   
        padding-top: 10px;
        &>div:last-child {
           .el-button:first-child {
               margin: 0 0 0 20%;
           }
           .el-button:last-child{
               margin: 0 0 0 20%;
           }
        }
        .el-form-item {
            margin-bottom: 19px;
            .el-form-item__label {
                font-size: 15px;
            }
            .el-input {
                width: 80%;
            }
            .el-textarea__inner {
                width: 80%;
            }
            .img-url-input{
                .el-input__inner {
                    &:hover{
                        cursor: pointer;
                    }
                }
            }
        }
    }
}
</style>
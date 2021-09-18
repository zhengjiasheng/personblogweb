<template>
    <div class="file-upload" v-show="visiableUpload">
        <div class="upload-content">
            <div class="upload-head">
                <span>图片上传</span>
                <i class="el-icon-close" @click="closeFileUpload"></i>
            </div>
            <el-upload
                class="upload-body"
                ref="upload"
                name="file"
                :data="param ? param : null"
                action="http://localhost:8088/general/uploadImg"
                :file-list="fileList"
                accept="image/png,image/gif,image/jpg,image/jpeg"
                :limit="1"
                :before-upload="beforeUpload"
                :on-success="success"
                :on-error="error"
                :on-exceed="handleExceed"
                :on-change="fileChange"
                :on-remove="removeFile"
                :auto-upload="false">
                <i class="el-icon-upload" slot="trigger"></i>
                <div slot="tip" class="el-upload__tip">只能上传图片，且不超过2MB</div>
                <div class="upload-footer">
                    <el-button @click="closeFileUpload" size="small">取消</el-button>
                    <el-button type="primary" @click="submitUpload" size="small">确定</el-button>
                </div>
            </el-upload>
        </div>     
    </div>
</template>

<script>
export default {
    name:'file-upload',
    props:['param'],
    data(){
        return {
            fileList      : [],                            //上传文件列表
            visiableUpload: false,                         //文件上传组件状态 是否显示
        }
    },
    computed:{

    },
    mounted(){
        
    },
    methods:{
        //打开文件上传
        openFileUpload(){
            this.visiableUpload = true;
        },
        //关闭文件上传
        closeFileUpload(){
            this.visiableUpload = false;
            this.fileList.splice(0,this.fileList.length);
        },
        //确定上传
        submitUpload() {
            if(this.fileList.length == 0){
                this.$message.warning("您还没有选择图片");
            }else {
                this.$refs.upload.submit();
            }
        },
        //文件上传成功的回调
        success(response,file,fileList){
            if(response.code === 200){
                this.$message.success("上传成功");
                this.visiableUpload = false;
                this.$emit('uploadSuccess',response.data);
            }else{
                this.$message.error(response.msg);
            }
        },
        //文件上传失败的回调
        error(err, file, fileList){
            this.$message.error('文件上传失败');
            console.log(err);
        },
        //文件超出个数限制
        handleExceed(file,fileList){
            this.$message.warning("一次只能上传一个文件");
        },
        //上传前
        beforeUpload(file){
            if(!this.isImage(file)){
                this.$message.error('文件格式不正确！');
            }
            if(!this.isSize(file)){
                this.$message.error('上传图片大小不能超过 2MB!');
            }
        },
        //文件类型判断
        isImage(file){
            if(file.type === 'image/png' || file.type === 'image/gif' || file.type === 'image/jpg' 
                || file.type === 'image/jpeg'){
                return true;
            }else{
                return false;
            }
        },
        //文件大小判断
        isSize(file){
            let size = file.size / 1024 / 1024;
            if(size < 2) {
                return true;
            }else{
                return false;
            }
        },
        //文件状态改变时的钩子，添加文件、上传成功和上传失败时都会被调用
        fileChange(file,fileList){
            if(this.fileList.length == 0){//添加文件
                this.fileList.push(file);
            }else {//上传成功和上传失败
                this.fileList.splice(0,this.fileList.length);
            }
        },
        //文件列表移除文件时的钩子
        removeFile(file,fileList){
            for(let index in this.fileList){
                if(this.fileList[index] == file){
                    this.fileList.splice(index,1);
                }
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.file-upload {
    position  : fixed;
    z-index   : 3000;
    top       : 0;
    left      : 0;
    bottom    : 0;
    right     : 0;
    width     : 100%;
    height    : 100%;
    background: rgba(0,0,0,0.4);
    .upload-content {
        position  : relative;
        top       : 50%;
        left      : 50%;
        transform : translate(-50%,-50%);
        width     : 400px;
        height    : 400px;
        background: #f7f7f7;
        .upload-head {
            position  : relative;
            text-align: center;
            padding   : 10px 0;
            font-size : 20px;
            i{
                position   : absolute;
                top        : 10px;
                left       : 365px;
                font-size  : 22px;
                font-weight: 700;
                color      : #d2d2d2;
                &:hover{
                    cursor: pointer;
                    color : #0199ff;
                }
            }
        }
    }
}

</style>

<style lang="scss">
.file-upload {
    .upload-body {
        position: relative;
        .el-upload {
            position: relative;
            margin  : 20px auto 40px;
            display : block;
            width   : 200px;
            height  : 200px;
            border  : 1px dashed;
            .el-icon-upload {
                position : absolute;
                top      : 50%;
                left     : 50%;
                transform: translate(-50%,-50%);
                font-size: 120px;
            }
        }
        .el-upload__tip {
            position : absolute;
            top      : 73%;
            left     : 50%;
            transform: translateX(-50%);
        }
        .el-upload-list {
            position  : absolute;
            width     : 60%;
            top       : 100%;
            left      : 50%;
            transform : translateX(-50%);
            margin-top: 10px;
        }
        .upload-footer {
            text-align: center;
            .el-button {
                margin: 0 20px;
            }
        }
    }
}
</style>
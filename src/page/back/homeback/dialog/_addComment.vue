<template>
    <div class="add-comment">
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :close-on-click-modal="false"
            custom-class="add-comment-dialog" width="500px" @close="$emit('closeDialog')"> 
            <el-form v-model="addCommentDate" label-width="100px">
                <el-form-item label="博客名称：">
                    <el-select v-model="addCommentDate.blog_id" placeholder="请选择博客" :disabled="type == 'replyComment'">
                        <el-option v-for="(item,index) in blogNmaeList" :key="index" :label="item.blog_name" :value="item.blog_id"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="回复：" v-if="type == 'replyComment'">
                    <el-input v-model="addCommentDate.reply_user" disabled></el-input>
                </el-form-item>
                <el-form-item :label="type == 'addComment' ? '评论内容：' : '回复内容：'">
                    <el-input v-model="addCommentDate.comment_content" type="textarea" maxlength="500" show-word-limit rows="3"
                     placeholder="请输入内容"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addOrUpdateLink" :disabled="!isClickDetermine">确定</el-button>
                <el-button class="cancel-btn" @click="$emit('closeDialog')">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {AddComment} from '../../../../service/base'
export default {
    name:'add-comment',
    props:['showDialog','type','publishBlogNameList','replyCommentDate'],
    data(){
        return{
            dialogTitle         : '',                                          //对话框标题
            dialogVisible       : false,                                       //对话框状态
            addCommentDate      : {                                            //对话框数据
                blog_id         : null,
                reply_user      : '',
                comment_content : ''
            },
            blogNmaeList        : [],                                          //博客名称列表
        }
    },
    computed:{
        //是否可以点击确定
        isClickDetermine(){
            if(this.addCommentDate.blog_id && this.addCommentDate.comment_content){
                return true;
            }else {
                return false;
            }
        }
    },
    mounted(){
        this.dialogVisible = this.showDialog;
        for(let index in this.publishBlogNameList){
            let blog = {
                blog_id     : parseInt(index),
                blog_name   : this.publishBlogNameList[index]
            }
            this.blogNmaeList.push(blog);
        }
        this.init();
    },
    methods:{
        //初始化对话框
        init(){
            if(this.type == 'addComment'){
                this.dialogTitle                = '添加评论';
            }else{
                this.dialogTitle                = '回复评论';
                this.addCommentDate.blog_id     = this.replyCommentDate.blog_id;
                this.addCommentDate.reply_user  = this.replyCommentDate.user_name;
            }
        },
        //添加或修改友情链接
        addOrUpdateLink(){
            let userInfo = this.$localSave.get("userInfo");
            let params = {
                user_ip : userInfo.user_name,
                user_name: userInfo.nick_name,
                blog_id  : this.addCommentDate.blog_id,
                comment_content : this.addCommentDate.comment_content
            }
            if(this.type == 'addComment'){
                AddComment(params).then(res => {
                    this.$message.success("添加成功");
                    this.$emit("closeDialog");
                }).catch(err => {
                    this.$message.error(err.msg);
                    console.log(err);
                })
            }else {
                params.parent_id   = this.replyCommentDate.comment_id;
                params.parent_user = this.addCommentDate.reply_user;
                AddComment(params).then(res => {
                    this.$message.success("回复成功");
                    this.$emit("closeDialog");
                }).catch(err => {
                    this.$message.error(err.msg);
                    console.log(err);
                })
            }
        },
    }
}
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
.add-comment-dialog {
    .el-dialog__footer {
        padding   : 10px 20px 28px;
        text-align: center;
        .el-button {
            margin: 0 20px;
        }
    }
    .el-dialog__headerbtn .el-dialog__close {
        font-size: 22px;
    }
    .el-dialog__body {
        padding: 30px 70px 20px 20px;
        .el-select {
            width: 100%;
        }
        .el-textarea .el-input__count {
            top: 54px;
            line-height: 20px;
        }
    }
}
</style>
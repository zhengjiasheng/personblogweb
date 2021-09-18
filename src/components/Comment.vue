<template>
    <div class="comment">
        <div class="title">评论</div>
        <div class="add-comment">
            <el-input v-if="!isOpenComment" placeholder="请添加评论" maxlength="500" show-word-limit  @focus="openComment">
                <template slot="append" v-if="!isOpenComment">评论</template>
            </el-input>
            <el-input v-model="comment.comment_content" ref="contentInput" type="textarea" v-else
                rows="4" placeholder="请输入评论" maxlength="500" show-word-limit>    
            </el-input>
            <div class="comment-operation" v-if="isOpenComment">
                <div class="email-input">
                    <el-input prefix-icon="el-icon-message" placeholder="邮箱" v-model="comment.user_ip"></el-input>
                </div>
                <div class="operation-btn" @click="shutComment">
                    取消
                </div>
                <div class="operation-btn" style="background:#fc5531;color:#FFFFFF" @click="publishComment">
                    发表
                </div>
            </div>
        </div>
        <div class="comment-content" v-if="commentList.length != 0">
            <div class="comment-item" v-for="(item,index) in commentList" :key="index">
                <div class="commentUser-avatars">
                    <img :src="getAvatarsUrl(item.comment.user_ip)" alt="">
                </div>
                <div class="content-detail">
                    <div class="detail-header">
                        <span style="font-weight:bold">{{item.comment.user_name}}</span>
                        <span v-if="item.comment.user_ip == bloggerInfo.user_name" style="border:1px solid #20B2AA;color:#20B2AA;zoom:0.7;margin-left:-5px">博主</span>
                        <span style="color:#909399;font-size:13px">{{$formatTime(item.comment.comment_date)}}</span>
                    </div>
                    <div class="detail-content">
                        <span>{{item.comment.comment_content}}</span>
                    </div>
                    <div class="reply">
                        <span @click="clickReply(item.comment)">回复</span>
                    </div>
                </div>
                <div class="reply-comment" v-if="isActiveReply == item.comment.comment_id">
                    <el-input v-model="comment.comment_content" type="textarea" :ref="'reply'+item.comment.comment_id"
                        rows="2" :placeholder="replyPlaceholder" maxlength="500" show-word-limit>
                    </el-input>
                    <div class="comment-operation">
                        <div class="email-input">
                            <el-input prefix-icon="el-icon-message" placeholder="邮箱" v-model="comment.user_ip"></el-input>
                        </div>
                        <div class="operation-btn" @click="shutComment">
                            取消
                        </div>
                        <div class="operation-btn" style="background:#fc5531;color:#FFFFFF" @click="publishComment">
                            发表
                        </div>
                    </div>
                </div>
                <ul class="comment-children">
                    <li class="comment-item" v-for="(childItem,childIndex) in item.children" :key="childIndex">
                        <div class="commentUser-avatars">
                            <img :src="getAvatarsUrl(childItem.user_ip)" alt="">
                        </div>
                        <div class="content-detail">
                            <div class="detail-header">
                                <span style="font-weight:bold">{{childItem.user_name}}</span>
                                <span v-if="childItem.user_ip == bloggerInfo.user_name" style="border:1px solid #20B2AA;color:#20B2AA;zoom:0.7;margin-left:-5px">博主</span>
                                <span style="color:#909399;font-size:13px">回复</span>
                                <span style="font-weight:bold" v-if="childItem.parent_id != item.comment.comment_id">{{childItem.parent_user}}</span>
                                <span style="color:#909399;font-size:13px">{{$formatTime(childItem.comment_date)}}</span>
                            </div>
                            <div class="detail-content">
                                <span>{{childItem.comment_content}}</span>
                            </div>
                            <div class="reply">
                                <span @click="clickReply(childItem)">回复</span>
                            </div>
                        </div>
                        <div class="reply-comment" v-if="isActiveReply == childItem.comment_id">
                            <el-input v-model="comment.comment_content" type="textarea" :ref="'reply'+childItem.comment_id"
                                rows="2" :placeholder="replyPlaceholder" maxlength="500" show-word-limit>
                            </el-input>
                            <div class="comment-operation">
                                <div class="email-input">
                                    <el-input prefix-icon="el-icon-message" placeholder="邮箱" v-model="comment.user_ip"></el-input>
                                </div>
                                <div class="operation-btn" @click="shutComment">
                                    取消
                                </div>
                                <div class="operation-btn" style="background:#fc5531;color:#FFFFFF" @click="publishComment">
                                    发表
                                </div>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import {FindCommentByBlogId,AddComment} from '../service/base'
export default {
    name:'comment',
    props:['blogId','bloggerInfo'],
    components:{

    },
    data(){
        return{
            comment            :{                                                    //评论内容
                user_ip        :'',
                user_name      :'',
                blog_id        :null,
                comment_content:''
            },
            isOpenComment      :false,                                               //是否开始评论
            commentList        :[],                                                  //评论列表
            isActiveReply      :null,                                                //活跃的回复
            replyPlaceholder   :'',                                                  //回复提示
            loadding           :null,                                                //加载中
        }
    },
    computed:{

    },
    mounted(){
        this.getCommentList();
    },
    methods:{
        //获取评论列表
        getCommentList(type){
            let params = {
                blog_id:this.blogId
            }
            FindCommentByBlogId(params).then(res => {
                this.commentList = res;
                // console.log(this.commentList);
                if(type){
                    this.closeLoading();
                }
            }).catch(err => {
                console.log(err);
            })
        },
        //获取焦点 开启评论
        openComment(){
            this.shutComment();
            this.isOpenComment = true;
            this.$nextTick(function(){
                this.$refs.contentInput.focus();
            });
        },
        //关闭开启评论
        shutComment(){
            this.comment = {                                                  
                user_ip        :'',
                user_name      :'',
                blog_id        :null,
                comment_content:''
            }
            if(this.isOpenComment){
                this.isOpenComment = false;
            }
            if(this.isActiveReply != null){
                this.isActiveReply = null;
            }
        },
        //发表评论
        publishComment(){
            this.comment.comment_content = this.removeSpace(this.comment.comment_content);
            if(!this.comment.comment_content){
                this.$message.error("评论内容不能为空");
                return;
            }
            this.comment.user_ip = this.removeSpace(this.comment.user_ip);
            if(!this.comment.user_ip){
                this.$message.error("邮箱不能为空");
                return;
            }
            if(this.emailValidation(this.comment.user_ip)){
                this.getTouristInfoByEmail(this.comment.user_ip);
            }else{
                this.$message.error("邮箱格式不正确，请输入正确邮箱");
            }
        },
        //通过qq邮箱获取游客qq昵称
        getTouristInfoByEmail(email){
            this.openLoading();
            let emailNum = email.split('@')[0];
            axios.get('https://api.hmister.cn/qq/',{
                params:{
                    type:'nick',
                    qq  :emailNum
                }
            }).then(res => {
               if(res.data.code && res.data.code == 200 && res.data.data){
                   this.comment.user_name = res.data.data;
                   this.comment.blog_id   = this.blogId;
                   this.addComment();
               }else {
                   this.closeLoading();
                   this.$message.error("发表失败，该邮箱不存在");
               }
            }).catch(err => {
                this.closeLoading();
                this.$message.error("QQ昵称获取失败");
                console.log(err);
            })
        },
        //添加评论到数据库
        addComment(){
            AddComment(this.comment).then(res => {
                this.$message.success("发表成功");
                this.shutComment();
                this.getCommentList('addComment');
            }).catch(err => {
                this.closeLoading();
                this.$message.error("发表失败");
                console.log(err);
            })
        },
        //禁止表情输入
        prohibitEmoji(inputStr){
            let transformInputStr = unescape(escape(inputStr).replace(/\%uD.{3}/g, ''));
            if (inputStr.length !== transformInputStr.length) {
                this.$message.error('暂不支持表情输入哦！');
            }
            this.addCourseDate.course = transformInputStr;
        },
        //去除前后空格
        removeSpace(dataStr) {
            return dataStr.replace(/(^\s*)|(\s*$)/g, "");
        },
        //判断邮箱格式
        emailValidation(email){
            var reg = /^([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|_|.]?)*[a-zA-Z0-9]+\.(?:com|cn)$/;
            // var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$");
            return reg.test(email);
        },
        //获取头像地址
        getAvatarsUrl(userIp){
            //博主
            if(userIp == this.bloggerInfo.user_name){
                return this.bloggerInfo.img_url;
            } else {
                let userQQ = userIp.split('@')[0];
                return 'http://q1.qlogo.cn/g?b=qq&nk='+userQQ+'&s=100';
            }
        },
        //点击回复
        clickReply(activeComment) {
            this.shutComment();
            this.isActiveReply       = activeComment.comment_id;
            this.comment.parent_id   = activeComment.comment_id;
            this.comment.parent_user = activeComment.user_name;
            this.replyPlaceholder    = '回复：'+activeComment.user_name;
            this.$nextTick(function() {
                this.$refs[`reply${activeComment.comment_id}`][0].focus();
            })
        },
        //打开加载中
        openLoading(){
            this.loadding = this.$loading({
                lock      : true,
                text      : 'Loading',
                spinner   : 'el-icon-loading',
                background: 'rgba(0, 0, 0, 0.7)'
            });
        },
        //关闭加载中
        closeLoading(){
            this.loadding.close();
        },
    }
}
</script>

<style lang="scss" scoped>
.comment {
    border      : 1.5px solid #E4E7ED;
    padding     : 0 10px;
    border-top  : 2px solid #20B2AA;
    .title {
        font-size       : 20px;
        font-weight     : bold;
        line-height     : 36px;
        border-bottom   : 1.5px solid #EBEEF5;
        margin-bottom   : 10px;
    }
    .add-comment {
        margin: 10px 0;
        .comment-operation {
            margin: 10px 0;
            .operation-btn {
                width           :60px;
                border          :1px solid #DCDFE6;
                border-radius   :12px;
                text-align      :center;
                display         : inline-block;
                font-size       : 16px;
                cursor          : pointer;
            }
        }
    }
    .comment-content {
        padding : 10px 0 0 0;
        margin  : 0 0 10px 0;
        border  : 1.5px solid #E4E7ED;
        .comment-item {
            position        : relative;
            margin-bottom   : 8px;
            .commentUser-avatars {
                margin-left : 10px;
                position    : absolute;
                img {
                    width        : 20px;
                    height       : 20px;
                    border-radius: 50%;
                }
            }
            .content-detail {
                font-size   : 14px;
                margin-left : 32px;
                .detail-header {
                    margin-bottom: 2px;
                    span {
                        margin   : 0 2px;
                    }
                }
                .detail-content {
                    font-family : -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
                    color       : #24292e; 
                    margin      : 0 0 2px 2px;
                }
                .reply {
                    margin: 0 0 2px 2px;
                    color : #5893c2;
                    span {
                        cursor: pointer;
                        &:hover {
                            color: #6495ED;
                        }
                    }
                }
            }
            .reply-comment {
                margin: 0 40px 0 30px;
                .comment-operation {
                    margin: 5px 0;
                    .operation-btn {
                        width           :45px;
                        border          :1px solid #DCDFE6;
                        border-radius   :12px;
                        text-align      :center;
                        display         : inline-block;
                        font-size       : 14px;
                        cursor          : pointer;
                    }
                }
            }
            .comment-children {
                list-style  : none;
                margin      : 10px 0;
                padding-left: 20px;
            }
        }
    }
}
</style>>

<style lang="scss">
.comment {
    .add-comment {
        .comment-operation {
            .email-input {
                display     : inline-block;
                margin-right: 40px;
                .el-input__inner{
                    line-height : 30px;
                    width       : 200px;
                    height      : 30px;
                }
                .el-icon-message {
                    line-height: 30px;
                }
            }
        }
        .el-textarea .el-input__count {
            transform: none !important;
        }
    }
    .comment-content {
        .comment-item {
            .reply-comment {
                .el-textarea__inner {
                    font-size: 14px;
                }
                .email-input {
                    display     : inline-block;
                    margin-right: 20px;
                    .el-input__inner{
                        font-size   : 14px;
                        line-height : 24px;
                        width       : 180px;
                        height      : 24px;
                    }
                    .el-icon-message {
                        line-height : 24px;
                    }
                }
            }
        }
    }
}
</style>
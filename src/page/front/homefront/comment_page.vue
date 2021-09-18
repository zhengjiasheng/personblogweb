<template>
    <div class="commment-page">
        <div class="commment-header">
            <span class="header-title">全部评论</span>
            <span class="header-num">
                共<span style="font-size:20px;margin-left:5px;margin-right:5px;color:red">{{total}}</span>条
            </span>
        </div>
        <div class="commment-body" :class="commentList.length==0 ? 'blank-content' : ''">
            <ul class="comment-list">
                <li v-for="(item,index) in commentList" :key="index" class="comment-item">
                    <div class="comment-content">
                        {{item.comment_content}}
                    </div>
                    <div class="comment-info">
                        <span class="blog-title" @click="openBlogDetail(item.blog_id,publishBlogNameList[item.blog_id])">
                            {{publishBlogNameList[item.blog_id]}}
                        </span>
                        <span class="comment-date">{{$formatTime(item.comment_date)}}</span>
                        <div class="comment-user">
                            <el-avatar size="small" :src="getAvatarsUrl(item.user_ip)"></el-avatar>
                            <span>{{item.user_name}}</span>
                            <span v-if="item.user_ip == bloggerInfo.user_name" style="border:1px solid #20B2AA;color:#20B2AA;zoom:0.7;margin-left:-5px">博主</span>
                        </div>
                    </div>
                </li>
            </ul>
            <prompt-page class="prompt-page" v-if="commentList.length == 0"></prompt-page>
        </div>
        <pagination :currentPage="currentPage" :pageSizeList="pageSizeList" :pageSize="pageSize" :total="total"
            @changePageSize="changePageSize" @changeCurrentPage="changeCurrentPage" v-if="commentList.length != 0">
        </pagination>
    </div>
</template>

<script>
import Pagination from '../../../components/Pagination'
import PromptPage from '../../../components/PromptPage'
import {FindAllCommentByPage,FindPublishBlogName,GetBloggerInfoById} from '../../../service/base'
export default {
    name:'link-page',
    components:{
        Pagination,
        PromptPage
    },
    data(){
        return {
            commentList         : [],                                                       //评论列表
            currentPage         : 1,                                                     //当前页
            pageSize            : 10,                                                    //页大小
            pageSizeList        : [5, 10, 15, 20],                                       //页大小列表
            total               :0,                                                     //数据总条数
            publishBlogNameList :[],                                                //发布博客名字列表
            bloggerInfo         :'',    
        }

    },
    computed:{

    },
    mounted(){
        this.getBloggerInfo();
        this.getPublishBlogList();
    },
    methods:{
        //获取发布博客列表
        getPublishBlogList(){
            FindPublishBlogName().then(res => {
                for(let item of res){
                    this.publishBlogNameList[item.blog_id] = item.blog_title;
                }
                console.log(this.publishBlogNameList);
                this.getCommentList();
            }).catch(err => {
                console.log(err);
            })
        },
        //获取评论列表
        getCommentList(){
            let params = {
                pageNum : this.currentPage,
                pageSize: this.pageSize
            }
            FindAllCommentByPage(params).then(res => {
                this.total       = res.total;
                this.commentList = res.list;
                console.log(this.commentList);
            }).catch(err => {
                console.log(err);
            })
        },
        //获取博主信息
        getBloggerInfo(){
            let params = {
                blogger_id : 1
            }
            GetBloggerInfoById(params).then(res => {
                this.bloggerInfo = res;
                // console.log("博主信息",res);
            }).catch(err => {
                console.log(err);   
            })
        },
        //改变页大小
        changePageSize(size) {
            this.pageSize = size;
            this.currentPage = 1;
            this.getCommentList();
        },
        //改变当前页
        changeCurrentPage(page) {
            this.currentPage = page;
            this.getCommentList();
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
        //打开博客详情页（新页面打开）
        openBlogDetail(blog_id,blog_title){
            let routerNewWindow = this.$router.resolve({
                path:'/front/blogDetail',
            })
            window.open(`${routerNewWindow.href}?blog_id=${blog_id}&blog_title=${blog_title}`,'_blank');
        }
    }
}
</script>

<style lang="scss" scoped>
.commment-page {
    border  : 1.5px solid #E4E7ED;
    width   : 800px;
    margin  : 20px auto;
    .commment-header {
        padding         : 10px 0;
        border-bottom   : 1.5px solid #E4E7ED;
        .header-title {
            margin      : 0 20px;
            font-size   : 18px;
            font-weight : bold;
            color       : #20B2AA;
        }
        .header-num {
            margin      : 0 32px 0 580px;
        }
    }
    .commment-body {
        padding         : 20px 30px;
        border-bottom   : 1.5px solid #E4E7ED;
        .comment-list {
            list-style  : none;
            margin      : 0;
            padding-left: 0;
            .comment-item {
                margin-bottom: 10px;
                .comment-content {
                    font-size: 17px;
                }
                .comment-info {
                    line-height: 32px;
                    .blog-title {
                        color: #84C1FF;
                        font-size: 15px;
                        cursor: pointer;
                        &:hover{
                            color: #409EFF;
                        }
                    }
                    .comment-date {
                        color: rgb(144, 147, 153);
                        font-size: 14px;
                    }
                    .comment-user {
                        float: right;
                        margin: -5px;
                    }
                }
            }
        }
    }
    .blank-content {
        height: 500px;
        .prompt-page {
            zoom: 1.5;
        }
    }
}

</style>

<style lang="scss">
.commment-page {
    .el-avatar {
        position: relative;
        top: 8px;
    }
}
</style>
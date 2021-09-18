<template>
    <el-container class="home-page" v-loading.fullscreen="loading" element-loading-text="加载中...">
        <el-main>
            <div class="page-content">
                <div class="content-header">
                    <span class="header-title">博客</span>
                    <el-checkbox class="is-type" v-model="isType" v-if="isType" @click.native="cancelType">分类</el-checkbox>
                    <span class="header-num">
                        共<span style="font-size:20px;margin-left:5px;margin-right:5px;color:red">{{total}}</span>篇
                    </span>
                    <el-select v-model="type" placeholder="请选择" @change="changeSortType">
                        <el-option key="publish_date" label="按时间" value="publish_date"></el-option>
                        <el-option key="click_num" label="按访问量" value="click_num"></el-option>
                        <el-option key="replace_num" label="按评论数" value="replace_num"></el-option>
                    </el-select>
                </div>
                <div class="content-body" :class="blogDataList.length==0 ? 'blank-content' : ''">
                    <blog-card v-for="(item,index) in blogDataList" :key="index" :blogInfo="item" 
                        :bloggerInfo="bloggerInfo" :blogTypeList="blogTypeList"></blog-card>
                    <prompt-page class="prompt-page" v-if="blogDataList.length == 0"></prompt-page>
                </div>
                <pagination :currentPage="currentPage" :pageSizeList="pageSizeList" :pageSize="pageSize" :total="total"
                    @changePageSize="changePageSize" @changeCurrentPage="changeCurrentPage" v-if="blogDataList.length != 0">
                </pagination>
            </div>
        </el-main>
        <el-aside>
            <!-- 博主信息 -->
            <div class="blogger-info aside-block">
                <div class="title">
                    <i class="el-icon-user"></i>
                    <span>博主</span>
                </div>
                <div class="blogger-content">
                    <img :src="bloggerInfo.img_url" alt="头像">
                    <div class="blogger-nick">{{bloggerInfo.nick_name}}</div>
                    <div class="blogger-sign">
                        <span>个性签名：</span>
                        <span style="font-size:14px">{{bloggerInfo.sign}}</span>
                    </div>
                    <div class="blogger-profile">
                        <span>个人信息：</span>
                        <span style="font-size:14px">{{bloggerInfo.profile}}</span>
                    </div>
                </div>
            </div>
            <!-- 分类信息 -->
            <div class="type-info aside-block">
                <div class="title">
                    <i class="el-icon-collection-tag"></i>
                    <span>分类</span>
                    <span class="more" @click="$router.push('typePage')">more<i class="el-icon-d-arrow-right"></i></span>
                </div>
                <div class="type-content">
                    <div class="type-item" v-for="(item,index) in blogNumOfTypeList" :key="index" @click="getBlogByTypeId(item.blogtype_id)">
                        <span>{{$getTypeNameById(item.blogtype_id,blogTypeList)}}</span>
                        <div class="type-sum">{{item.sum}}</div>
                    </div>
                </div>
            </div>
            <!-- 最新推荐 -->
            <div class="latest-blog aside-block">
                <div class="title">
                    <i class="el-icon-s-promotion"></i>
                    <span>最新推荐</span>
                </div>
                <div class="latest-content">
                    <div class="latest-item" v-for="(item,index) in latestBlogList" :key="index" @click="openBlogDetail(item.blog_id,item.blog_title)">
                        <span>{{item.blog_title}}</span>
                    </div>
                </div>
            </div>
            <!-- 友情链接 -->
            <div class="friend-link aside-block">
                <div class="title">
                    <i class="el-icon-share"></i>
                    <span>友链</span>
                    <span class="more" @click="$router.push('linkPage')">more<i class="el-icon-d-arrow-right"></i></span>
                </div>
                <div class="link-content">
                    <div class="link-item" v-for="(item,index) in friendLinkList" :key="index">
                        <el-link :href="item.link_url" target="_blank" :underline="false">{{item.link_name}}</el-link>
                    </div>  
                </div>
            </div>
        </el-aside>
    </el-container>
</template>

<script>
import {Events} from '../../../module/eventTypeList'
import Pagination from '../../../components/Pagination'
import BlogCard from './homepage/_blogInfoCard'
import PromptPage from '../../../components/PromptPage'
import {
    FindAllBlog,
    GetBloggerInfoById,
    FindAllBlogtype,
    GetBlogNumOfType,
    FindBlogByTypeId,
    FindLinkByPage
    } from '../../../service/base'

export default {
    name:'home-page',
    components:{
        Pagination,
        BlogCard,
        PromptPage
    },
    data(){
        return {
            loading         :true,
            blogDataList    :[],                                                    //博客数据列表
            type            :'publish_date',                                        //排序类型 publish_date click_num replace_num
            //分页数据
            currentPage     :1,                                                     //当前页
            pageSize        :10,                                                    //页大小
            pageSizeList    :[5, 10, 15, 20],                                       //页大小列表
            total           :0,                                                     //数据总条数
            //侧边栏显示数据
            bloggerInfo     :'',                                                    //博主信息
            blogTypeList    :[],                                                    //博客类型列表
            blogNumOfTypeList:[],                                                   //各种类型的博客数量列表
            isType          :false,                                                 //是否是分类
            blogtypeId      :null,                                                  //点击的侧边栏的分类
            latestBlogList  :[],                                                    //最新博客列表
            friendLinkList  :[],                                                    //侧边栏友情链接列表
            keyword         :'',                                                    //关键字查询
        }

    },
    computed:{

    },
    mounted(){
        this.getBlogtypeList();
        this.getBloggerInfo();
        this.getFriendLink();
        this.initEventListen();
    },
    beforeDestroy(){
        this.offEventListen();
    },
    methods:{
        //初始化事件监听（绑定观察者）
        initEventListen(){
            this.$bus.on(Events.KEYWORD_SEARCH,this.getBlogData);
        },
        //监听事件解绑
        offEventListen(){
            this.$bus.off(Events.KEYWORD_SEARCH,this.getBlogData);
        },
        //获取博客数据
        getBlogData(keyword){
            this.keyword = keyword;
            let params = {
                pageNum     : this.currentPage,
                pageSize    : this.pageSize,
                type        : this.type,
                blog_status : true,
                keyword     : this.keyword ? this.keyword : null
            }
            FindAllBlog(params).then(res => {
                this.total          = res.total;
                this.blogDataList   = res.list;
                this.loading        = false;
                if(this.latestBlogList.length == 0){
                    this.latestBlogList = res.list;
                }
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
        //获取博客类型列表
        getBlogtypeList(){
            FindAllBlogtype().then(res => {
                for(let item of res){
                    this.blogTypeList[item.blogtype_id] = item.type_name;
                }
                this.getBlogData();
                this.getBlogNumOfType();
            }).catch(err => {
                console.log(err);
            })
        },
        //获取各种类型的博客数量
        getBlogNumOfType(){
            GetBlogNumOfType().then(res => {
                this.blogNumOfTypeList = res;
                this.blogNumOfTypeList.splice(8,this.blogNumOfTypeList.length-8);
            }).catch(err => {
                console.log(err);
            })
        },
        //获取友情链接
        getFriendLink(){
            let params = {
                pageNum : 1,
                pageSize: 10
            }
            FindLinkByPage(params).then(res => {
                this.friendLinkList = res.list;
                // console.log(this.friendLinkList)
            }).catch(err => {
                console.log(err);
            })
        },
        //改变页大小
        changePageSize(size) {
            this.pageSize       = size;
            this.currentPage    = 1;
            this.changeSortType();
        },
        //改变当前页
        changeCurrentPage(page) {
            this.currentPage = page;
            this.changeSortType();
        },
        //分类查询博客
        getBlogByTypeId(blogtype_id){
            this.blogtypeId = blogtype_id;
            this.isType     = true;
            this.$bus.trigger(Events.DISABLE_SEARCH,true);
            let params      = {
                pageNum     : this.currentPage,
                pageSize    : this.pageSize,
                blogtype_id : blogtype_id,
                sort_type   : this.type,
                blog_status : 1
            }
            FindBlogByTypeId(params).then(res => {
                this.total          = res.total;
                this.blogDataList   = res.list;
            }).catch(err => {
                console.log(err);
            })
        },
        //改变排序方式
        changeSortType() {
            if(this.isType){
                this.getBlogByTypeId(this.blogtypeId);
            }else {
                this.getBlogData(this.keyword);
            }
        },
        //取消分类
        cancelType(){
            this.isType = false;
            this.$bus.trigger(Events.DISABLE_SEARCH,false);
            this.getBlogData(this.keyword);
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
.home-page {
    .el-main {
        padding: 20px 40px 20px 100px;
        .page-content {
            border: 1.5px solid #E4E7ED;
            .content-header {
                position        : relative;
                padding         : 10px 0;
                border-bottom   : 1.5px solid #E4E7ED;
                .is-type {
                    position: absolute;
                    top     : 20px;
                    left    : 440px;
                }
                .header-title {
                    margin      : 0 20px;
                    font-size   : 18px;
                    font-weight : bold;
                    color       : #20B2AA;
                }
                .header-num {
                    margin      : 0 32px 0 430px;
                }
                
            }
            .blank-content {
                height: 1450px;
                .prompt-page {
                    zoom: 2;
                }
            }
        }
    }
    .el-aside {
        width   : 380px !important;
        padding : 20px 100px 20px 20px;       
        .blogger-info {  
            .blogger-content {
                text-align      : center;
                img {
                    margin          : 10px 0 0 0;
                    width           : 60px;
                    height          : 60px;
                    border-radius   : 50%;
                }
                .blogger-nick {
                    font-size   : 14px;
                    color       : #6495ED;
                    font-weight : 600;
                }
                .blogger-sign,.blogger-profile {
                    padding     : 0 0 0 10px;
                    text-align  : left;
                    margin      : 8px 0;
                    font-size   : 15px;
                    color       : #606266;
                }
            }
        }
        .type-info {
            .type-content {
                padding : 0 10px;
                margin  : 10px;
                border  : 1.5px solid #EBEEF5;
                .type-item{
                    position        : relative;
                    font-size       : 15px;
                    line-height     : 28px;
                    border-bottom   : 1px solid #EBEEF5;
                    cursor: pointer;
                    &:hover {
                        color       : #409EFF;
                    }
                    .type-sum {
                        position    : absolute;
                        top         : 4px;
                        left        : 170px;
                        line-height : 16px;
                        padding     : 0 10px;
                        font-size   : 12px;
                        font-weight : 600;
                        border      : 1.5px solid #20B2AA;
                        color       : #20B2AA;
                    }
                }
                &>.type-item:last-child{
                    border: 0px;
                }
            }
        }
        .latest-blog {
            .latest-content {
                padding: 0 10px;
                .latest-item {
                    font-size       : 15px;
                    line-height     : 35px;
                    border-bottom   : 1px solid #EBEEF5;
                    cursor          : pointer;
                    &:hover {
                        color       : #409EFF;
                    }
                }
                &>.latest-item:last-child{
                    border: 0px;
                }
            }
        }
        .friend-link {
            .link-content {
                padding: 0 10px;
                .link-item {
                    margin          : 5px 0;
                    padding         : 0 0 10px 0;
                    border-bottom   : 1px solid #EBEEF5;
                }
                &>.link-item:last-child{
                    border: 0px;
                }
            }
        }
    }
}

</style>

<style lang="scss">
.home-page {
    .el-main {
        .content-header {
            .el-select .el-input__inner {
                width: 120px;
            }
        }
    }
    .el-aside {
        .title {
            line-height     : 50px;
            background      : #F8F8FF;
            padding         : 0 0 0 20px;
            border-bottom   : 1.5px solid #20B2AA;
            color           : #909399;
            .more {
                margin-left : 115px;
                cursor      : pointer;
                &:hover{
                    color   : #0199ff;
                }
            }
        }
        .aside-block {
            border: 1.5px solid #E4E7ED;
            margin: 0 0 30px 0;  
        }
    }
}
</style>
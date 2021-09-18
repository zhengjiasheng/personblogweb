<template>
    <div class="type-page" v-loading.fullscreen="loading" element-loading-text="加载中...">
        <div class="type-header">
            <span class="header-title">分类</span>
            <span class="header-num">
                共<span style="font-size:20px;margin-left:5px;margin-right:5px;color:red">{{blogNumOfTypeList.length}}</span>类
            </span>
            <el-select v-model="type" placeholder="请选择"  @change="changeSortType">
                <el-option key="publish_date" label="按时间" value="publish_date"></el-option>
                <el-option key="click_num" label="按访问量" value="click_num"></el-option>
                <el-option key="replace_num" label="按评论数" value="replace_num"></el-option>
            </el-select>
        </div>
        <div class="type-list">
            <el-row :gutter="24">
                <el-col :span="4">
                    <div class="type-item" :class="blogtypeId == 'all' ? 'isActive' : ''" @click="changeType('all')">
                        <span class="item-name">全部</span>
                        <span class="item-sum">{{blogTotal}}</span>
                    </div>
                </el-col>
                <el-col :span="4" v-for="(item,index) in blogNumOfTypeList" :key="index">
                    <div class="type-item" :class="blogtypeId == item.blogtype_id ? 'isActive' : ''"
                         @click="changeType(item.blogtype_id)">
                        <span class="item-name">{{$getTypeNameById(item.blogtype_id,blogTypeList)}}</span>
                        <span class="item-sum">{{item.sum}}</span>
                    </div>
                </el-col>
            </el-row>
        </div>
        <div class="type-body" :class="blogDataList.length==0 ? 'blank-content' : ''">
            <blog-card v-for="(item,index) in blogDataList" :key="index" :blogInfo="item" 
                :bloggerInfo="bloggerInfo" :blogTypeList="blogTypeList"></blog-card>
            <prompt-page class="prompt-page" v-if="blogDataList.length == 0"></prompt-page>
        </div>
        <pagination :currentPage="currentPage" :pageSizeList="pageSizeList" :pageSize="pageSize" :total="total"
            @changePageSize="changePageSize" @changeCurrentPage="changeCurrentPage" v-if="blogDataList.length != 0">
        </pagination>
    </div>
</template>

<script>
import Pagination from '../../../components/Pagination'
import BlogCard from './homepage/_blogInfoCard'
import PromptPage from '../../../components/PromptPage'
import {
    FindAllPublishBlog,
    GetBloggerInfoById,
    FindAllBlogtype,
    GetBlogNumOfType,
    FindBlogByTypeId,
    } from '../../../service/base'
export default {
    name:'type-page',
    components:{
        Pagination,
        BlogCard,
        PromptPage
    },
    data(){
        return {
            loading             :true,
            blogDataList        :[],                                                    //博客数据列表
            blogTotal           :null,                                                  //博客总数
            type                :'publish_date',                                        //排序类型 publish_date click_num replace_num
            //分页数据
            currentPage         :1,                                                     //当前页
            pageSize            :10,                                                    //页大小
            pageSizeList        :[5, 10, 15, 20],                                       //页大小列表
            total               :0,                                                     //数据总条数
            //侧边栏显示数据
            bloggerInfo         :'',                                                    //博主信息
            blogTypeList        :[],                                                    //博客类型列表
            blogNumOfTypeList   :[],                                                    //各种类型的博客数量列表
            isType              :false,                                                 //是否是分类查询 true:分类 false:全部
            blogtypeId          :'all',                                                 //点击的分类id
            activeClass         :'all'
        }

    },
    computed:{

    },
    mounted(){
        this.getBlogtypeList();
        this.getBloggerInfo();
    },
    methods:{
        //获取博客数据
        getBlogData(){
            this.isType = false;
            let params = {
                pageNum     : this.currentPage,
                pageSize    : this.pageSize,
                type        : this.type,
                blog_status : true
            }
            FindAllPublishBlog(params).then(res => {
                this.total          = res.total;
                this.blogDataList   = res.list;
                this.loading        = false;
                if(!this.blogTotal){
                    this.blogTotal  = res.total;
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
                // console.log(this.blogNumOfTypeList);
            }).catch(err => {
                console.log(err);
            })
        },
        //分类查询博客
        getBlogByTypeId(blogtype_id){
            this.blogtypeId = blogtype_id;
            this.isType = true;
            let params = {
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
        //改变排序方式
        changeSortType() {
            if(this.isType){
                this.getBlogByTypeId(this.blogtypeId);
            }else {
                this.getBlogData();
            }
        },
        changeType(type_id) {
            this.blogtypeId = type_id;
            if(type_id == 'all'){
                this.isType = false;
            }else {
                this.isType = true;
            }
            this.changeSortType();
        }
    }
}
</script>

<style lang="scss" scoped>
.type-page {
    border  : 1.5px solid #E4E7ED;
    width   : 800px;
    margin  : 20px auto;
    .type-header {
        padding         : 10px 0;
        border-bottom   : 1.5px solid #E4E7ED;
        .header-title {
            margin      : 0 20px;
            font-size   : 18px;
            font-weight : bold;
            color       : #20B2AA;
        }
        .header-num {
            margin      : 0 32px 0 470px;
        }
    }
    .type-list {
        padding         : 10px 10px;
        border-bottom   : 1.5px solid #E4E7ED;
        .type-item {
            margin          : 5px 0;
            line-height     : 25px;
            border          : 1.5px solid #20B2AA;
            border-radius   : 4px;
            text-align      : center;
            color           : #20B2AA;
            cursor          : pointer;
            .item-sum {
                font-size   : 12px;
                margin-left : 8px;
            }
        }
        .isActive {
            border          : 1.5px solid #409EFF;
            color           : #409EFF;
        }
    }
    .type-body {
        padding: 0 0 0 20px;
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
.type-page {
    .type-header {
        .el-select .el-input__inner {
            width: 120px;
        }
    }
}
</style>
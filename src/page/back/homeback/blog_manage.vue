<template>
    <div class="blog-manage">
        <main-title title="博客列表"></main-title>
        <div class="blog-content">
            <div class="blog-operation">
                <el-button type="primary" size="mini" @click.native="addBlog"><i class="el-icon-plus"></i>新增</el-button>
                <el-button type="success" size="mini" @click.native="updateBlog"><i class="el-icon-edit"></i>修改</el-button>
                <el-button type="danger" size="mini" @click.native="deleteBlog"><i class="el-icon-delete"></i>删除</el-button>
                <el-button type="danger" size="mini" @click.native="deleteBlogList"><i class="el-icon-delete-solid"></i>批量删除</el-button>
                <div class="blog-search">
                    <el-input placeholder="关键字搜索" v-model="keyword" @keydown.native.enter="getBlogInfo" clearable @clear="getBlogInfo"></el-input>
                </div>
            </div>
            <el-table :data="blogList" border style="width: 100%" height="340px" @select="handleSelect" class="blog-table">
                <el-table-column  type="selection" align="center" width="55"></el-table-column>
                <el-table-column type="index" align="center" label="序号" width="70"></el-table-column>
                <el-table-column prop="blog_title" align="center" label="标题"></el-table-column>
                <el-table-column align="center" label="预览图" width="160">
                    <template slot-scope="scope">
                        <img :src="scope.row.blog_imgurl" alt="预览图" class="preview-img">
                    </template>
                </el-table-column>
                <el-table-column prop="click_num" align="center" label="浏览量" width="65"></el-table-column>
                <el-table-column prop="replace_num" align="center" label="评论数" width="65"></el-table-column>
                <el-table-column align="center" label="博客分类" width="120">
                    <template slot-scope="scope">
                        <span>{{$getTypeNameById(scope.row.type_id,blogTypeList)}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="状态" width="120">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.blog_status" size="mini" type="success" title="已发表">发表</el-button>
                        <el-button v-else size="mini" type="warning" title="点击可发表" @click="publishBlog(scope.row.blog_id)">未发表</el-button>                     
                    </template>
                </el-table-column>
                <el-table-column prop="publish_date" align="center" label="发表时间" width="170">
                    <template slot-scope="scope">
                        <span v-if="scope.row.publish_date">{{$formatTime(scope.row.publish_date)}}</span>
                        <span v-else>未发表</span>
                    </template>
                </el-table-column>
            </el-table>
            <pagination :currentPage="currentPage" :pageSizeList="pageSizeList" :pageSize="pageSize" :total="total"
                @changePageSize="changePageSize" @changeCurrentPage="changeCurrentPage"></pagination>
        </div>
    </div>
</template>

<script>
import MainTitle from '../../../components/MainTitle'
import Pagination from '../../../components/Pagination'
import {FindAllBlog,PublishBlog,DeleteBlog,DeleteBlogList,FindAllBlogtype} from '../../../service/base'
export default {
    name:'blog-manage',
    components:{
        MainTitle,
        Pagination
    },
    data(){
        return {
            blogList:[],                                                     //表格数据列表
            selectdList:[],                                                  //选中的表格中的数据列
            //分页数据
            currentPage:1,                                                   //当前页
            pageSize:10,                                                     //页大小
            pageSizeList:[5, 10, 15, 20],                                    //页大小列表
            total:0,                                                         //数据总条数
            blogTypeList:[],                                                 //博客类型列表
            keyword:'',                                                      //关键字查询
        }

    },
    computed:{

    },
    mounted(){
        this.getBlogtypeList();
        this.$nextTick(function(){
            this.getBlogInfo();
        })
    },
    methods:{
        //获取博客信息
        getBlogInfo(){
            let params = {
                pageNum     : this.currentPage,
                pageSize    : this.pageSize,
                type        : 'publish_date',   //按照type排序  type取值publish_date/click_num/replace_num
                blog_status : false,
                keyword     : this.keyword
            }
            FindAllBlog(params).then(res => {
                this.total    = res.total;
                this.blogList = res.list;
                // console.log(this.blogList);
            }).catch(err => {
                console.log(err);
            })
        },
        //添加博客
        addBlog(){
            this.$router.push('addBlog');
        },
        //修改博客
        updateBlog(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一篇博客");
                return;
            }
            if(this.selectdList.length > 1){
                this.$message.error("一次只能修改一篇博客");
                return;
            }
            this.$router.push({path:'addBlog',query:{id:this.selectdList[0].blog_id}});
        },
        //删除博客
        deleteBlog(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一篇博客");
                return;
            }
            if(this.selectdList.length > 1){
                this.$message.error("一次只能删除一篇博客");
                return;
            }
            let params = {
                blog_id:this.selectdList[0].blog_id
            }
            DeleteBlog(params).then(res => {
                this.$message.success("删除成功");
                this.getBlogInfo();
                this.clearSelectList();
            }).catch(err => {
                this.$message.error(err.msg);
                console.log(err);
            })
        },
        //批量删除博客
        deleteBlogList(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一篇博客");
                return;
            }
            let params = [];
            this.selectdList.forEach(item => {
                params.push(item.blog_id);
            })
            DeleteBlogList(params).then(res => {
                this.$message.success("删除成功");
                this.getBlogInfo();
                this.clearSelectList();
            }).catch(err => {
                this.$message.error(err.msg);
                console.log(err);
            })
        },
        //勾选数据行触发
        handleSelect(selection, row){
            this.selectdList = selection;
            console.log("勾选数据行=====》",this.selectdList);
        },
        //改变页大小
        changePageSize(size) {
            this.clearSelectList();
            this.pageSize = size;
            this.currentPage = 1;
            this.getBlogInfo();
        },
        //改变当前页
        changeCurrentPage(page) {
            this.clearSelectList();
            this.currentPage = page;
            this.getBlogInfo();
        },
        //清空选中列表
        clearSelectList(){
            this.selectdList.splice(0,this.selectdList.length);
        },
        //获取博客类型列表
        getBlogtypeList(){
            FindAllBlogtype().then(res => {
                for(let item of res){
                    this.blogTypeList[item.blogtype_id] = item.type_name;
                }
            }).catch(err => {
                console.log(err);
            })
        },
        //发表博客
        publishBlog(id){
            let params = {
                blog_id:id
            }
            PublishBlog(params).then(res => {
                this.$message.success("发表成功");
                this.getBlogInfo();
            }).catch(err => {
                this.$message.error(err.msg);
                console.log(err);
            })
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';
.blog-manage {
    .blog-content {
        .blog-operation {
            display: flex;
            flex-direction: row;
            justify-content: start;
            margin: 10px 0;
            .blog-search {
                width: 200px;
                margin: 0 10px;
            }
        }
        .blog-table {
            .preview-img {
                width: 120px;
                height: 80px;
                background-size: cover;
            }
        }
    }
}

</style>

<style lang="scss">
.blog-manage {
    .blog-search {
        .el-input__inner{
           height: 32px;
        }
    }
}
</style>
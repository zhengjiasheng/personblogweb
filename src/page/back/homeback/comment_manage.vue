<template>
    <div class="comment_manage">
        <main-title title="评论管理"></main-title>
        <div class="comment-content">
            <div class="comment-operation">
                <el-button type="primary" size="mini" @click.native="addComment"><i class="el-icon-plus"></i>新增</el-button>
                <el-button type="success" size="mini" @click.native="replyComment"><i class="el-icon-edit"></i>回复</el-button>
                <el-button type="danger" size="mini" @click.native="deleteComment"><i class="el-icon-delete"></i>删除</el-button>
                <el-button type="danger" size="mini" @click.native="deleteCommentList"><i class="el-icon-delete-solid"></i>批量删除</el-button>
                <div class="comment-search">
                    <el-input placeholder="关键字搜索" v-model="keyword" @keydown.native.enter="getCommentList" clearable @clear="getCommentList"></el-input>
                </div>
            </div>
            <el-table :data="commentList" border style="width: 100%" height="340px" @select="handleSelect">
                <el-table-column type="selection" align="center" width="55"></el-table-column>
                <el-table-column type="index" align="center" label="序号" width="60"></el-table-column>
                <el-table-column prop="comment_id" align="center" label="评论编号" width="80"></el-table-column>
                <el-table-column align="center" label="评论人/回复人" width="120">
                    <template slot-scope="scope">
                        <span>{{scope.row.user_name}}</span>
                        <span v-if="scope.row.user_name == $localSave.get('userInfo').nick_name"
                            style="border:1px solid #20B2AA;color:#20B2AA;zoom:0.7">博主</span>
                    </template>
                </el-table-column>
                <el-table-column prop="comment_content" align="center" :show-overflow-tooltip="true" label="评论内容"></el-table-column>
                <el-table-column align="center" label="所属博客" :show-overflow-tooltip="true">
                    <template slot-scope="scope">
                        <span>{{publishBlogNameList[scope.row.blog_id]}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="回复编号" width="80">
                    <template slot-scope="scope">
                        <span v-if="scope.row.parent_id">{{scope.row.parent_id}}</span>
                        <span v-else style="color:#E6A23C">无</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="被回复者" width="120">
                    <template slot-scope="scope">
                        <span v-if="scope.row.parent_user">{{scope.row.parent_user}}</span>
                        <span v-else style="color:#E6A23C">一级评论</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="评论时间" width="160">
                    <template slot-scope="scope">
                        <span>{{$formatTime(scope.row.comment_date)}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <pagination :currentPage="currentPage" :pageSizeList="pageSizeList" :pageSize="pageSize" :total="total"
                @changePageSize="changePageSize" @changeCurrentPage="changeCurrentPage"></pagination>
        </div>
        <add-comment-dialog
            v-if="showDialog"
            :showDialog="showDialog"
            :type="type"
            :publishBlogNameList="publishBlogNameList"
            :replyCommentDate="replyCommentDate"
            @closeDialog="closeDialog">
        </add-comment-dialog>
    </div>
</template>

<script>
import MainTitle from '../../../components/MainTitle'
import Pagination from '../../../components/Pagination'
import addCommentDialog from './dialog/_addComment'
import {FindAllCommentByPage,FindPublishBlogName,DeleteComment,DeleteCommentList} from '../../../service/base'
export default {
    name:'comment_manage',
    components:{
        MainTitle,
        Pagination,
        addCommentDialog
    },
    data(){
        return {
            commentList         :[],                                                    //表格数据列表
            selectdList         :[],                                                    //选中的表格中的数据列
            //分页数据
            currentPage         :1,                                                     //当前页
            pageSize            :10,                                                    //页大小
            pageSizeList        :[5, 10, 15, 20],                                       //页大小列表
            total               :0,                                                     //数据总条数
            publishBlogNameList :[],                                                    //发布博客名字列表
            showDialog          :false,                                                 //是否显示对话框
            type                :'',                                                    //对话框类型
            replyCommentDate    :'',                                                    //要回复的那个评论的数据
            keyword:'',                                                      //关键字查询
        }
    },
    computed:{

    },
    mounted(){
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
                pageSize: this.pageSize,
                keyword : this.keyword
            }
            FindAllCommentByPage(params).then(res => {
                this.total       = res.total;
                this.commentList = res.list;
            }).catch(err => {
                console.log(err);
            })
        },
        //新增评论 博主新增一级评论
        addComment(){
            this.type = 'addComment';
            this.showDialog = true;
        },
        //回复评论
        replyComment(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一个评论");
                return;
            }
            if(this.selectdList.length > 1){
                this.$message.error("一次只能回复一个评论");
                return;
            }
            this.type = 'replyComment';
            this.showDialog = true;
            this.replyCommentDate = this.$deepClone(this.selectdList[0]);
        },
        //删除评论
        deleteComment(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一个评论");
                return;
            }
            if(this.selectdList.length > 1){
                this.$message.error("一次只能删除一个评论");
                return;
            }
            let params = {
                comment_id:this.selectdList[0].comment_id
            }
            DeleteComment(params).then(res => {
                this.$message.success("删除成功");
                this.getCommentList();
                this.clearSelectList();
            }).catch(err => {
                this.$message.error(err.msg);
                console.log(err);
            })
        },
        //批量删除评论
        deleteCommentList(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择评论");
                return;
            }
            let params = [];
            this.selectdList.forEach(item => {
                params.push(item.comment_id);
            });
            DeleteCommentList(params).then(res => {
                this.$message.success("删除成功");
                this.getCommentList();
                this.clearSelectList();
            }).catch(err => {
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
            this.pageSize    = size;
            this.currentPage = 1;
            this.getCommentList();
        },
        //改变当前页
        changeCurrentPage(page) {
            this.clearSelectList();
            this.currentPage = page;
            this.getCommentList();
        },
        //关闭对话框
        closeDialog(){
            this.showDialog = false;
            this.getCommentList();
            this.clearSelectList();
        },
        //清空选中列表
        clearSelectList(){
            this.selectdList.splice(0,this.selectdList.length);
        },
    }
}
</script>

<style lang="scss" scoped>
.comment_manage {
    .comment-content {
        .comment-operation {
            display: flex;
            flex-direction: row;
            justify-content: start;
            margin: 10px 0;
            .comment-search {
                width: 200px;
                margin: 0 10px;
            }
        }
    }
}
</style>

<style lang="scss">
.comment_manage {
   .comment-search {
       .el-input__inner{
           height: 32px;
       }
   }
}
</style>
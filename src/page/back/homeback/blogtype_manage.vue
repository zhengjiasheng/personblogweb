<template>
    <div class="blogtype_manage">
        <main-title title="分类管理"></main-title>
        <div class="blogtype-content">
            <div class="blogtype-operation">
                <el-button type="primary" size="mini" @click.native="addBlogtype"><i class="el-icon-plus"></i>新增</el-button>
                <el-button type="success" size="mini" @click.native="updateBlogtype"><i class="el-icon-edit"></i>修改</el-button>
                <el-button type="danger" size="mini" @click.native="deleteBlogtype"><i class="el-icon-delete"></i>删除</el-button>
                <el-button type="danger" size="mini" @click.native="deleteBlogtypeList"><i class="el-icon-delete-solid"></i>批量删除</el-button>
                <div class="blogtype-search">
                    <el-input placeholder="关键字搜索" v-model="keyword" @keydown.native.enter="getBlogtypeInfo" clearable @clear="getBlogtypeInfo"></el-input>
                </div>
            </div>
            <el-table :data="blogTypeList" border style="width: 100%" height="340px" @select="handleSelect">
                <el-table-column  type="selection" align="center" width="55"></el-table-column>
                <el-table-column type="index" align="center" label="序号" width="100"></el-table-column>
                <el-table-column prop="blogtype_id" align="center" label="类型编号"></el-table-column>
                <el-table-column prop="type_name" align="center" :show-overflow-tooltip="true" label="博客类型"></el-table-column>
                <el-table-column prop="order_no" align="center" label="排序"></el-table-column>
            </el-table>
            <pagination :currentPage="currentPage" :pageSizeList="pageSizeList" :pageSize="pageSize" :total="total"
                @changePageSize="changePageSize" @changeCurrentPage="changeCurrentPage"></pagination>
        </div>
        <add-blogtype-dialog
            v-if="showDialog"
            :showDialog="showDialog"
            :type="type"
            :updateBlogtypeInfo="updateBlogtypeInfo"
            @closeDialog="closeDialog">
        </add-blogtype-dialog>
    </div>
</template>

<script>
import MainTitle from '../../../components/MainTitle'
import Pagination from '../../../components/Pagination'
import addBlogtypeDialog from './dialog/_addBlogtype'
import {FindBlogtypeByPage,DeleteBlogtype,DeleteBlogtypeList} from '../../../service/base'
export default {
    name:'blogtype_manage',
    components:{
        MainTitle,
        Pagination,
        addBlogtypeDialog
    },
    data(){
        return {
            blogTypeList        :[],                                                //表格数据列表
            selectdList         :[],                                                //选中的表格中的数据列
            //分页数据
            currentPage         :1,                                                 //当前页
            pageSize            :10,                                                //页大小
            pageSizeList        :[5, 10, 15, 20],                                   //页大小列表
            total               :0,                                                 //数据总条数
            showDialog          :false,                                             //是否显示对话框
            type                :'',                                                //对话框类型
            updateBlogtypeInfo  :'',                                                //要修改的分类数据
            keyword:'',                                                      //关键字查询
        }
    },
    computed:{

    },
    mounted(){
        this.getBlogtypeInfo();
    },
    methods:{
        //获取博客类型数据
        getBlogtypeInfo(){
            let params = {
                pageNum :this.currentPage,
                pageSize:this.pageSize,
                keyword :this.keyword
            }
            FindBlogtypeByPage(params).then(res => {
                this.total        = res.total;
                this.blogTypeList = res.list;
            }).catch(err => {
                console.log(err);
            })
        },
        //添加博客类型
        addBlogtype(){
            this.type = 'addBlogtype';
            this.showDialog = true;
        },
        //修改博客类型
        updateBlogtype(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一个分类");
                return;
            }
            if(this.selectdList.length > 1){
                this.$message.error("一次只能修改一个分类");
                return;
            }
            this.type = 'updateBlogtype';
            this.showDialog = true;
            this.updateBlogtypeInfo = this.$deepClone(this.selectdList[0]);
        },
        //删除博客类型
        deleteBlogtype(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一个分类");
                return;
            }
            if(this.selectdList.length > 1){
                this.$message.error("一次只能删除一个分类");
                return;
            }
            let params = {
                blogtype_id:this.selectdList[0].blogtype_id
            }
            DeleteBlogtype(params).then(res => {
                this.$message.success("删除成功");
                this.getBlogtypeInfo();
                this.clearSelectList();
            }).catch(err => {
                this.$message.error(err.msg);
                console.log(err);
            })
        },
        //批量删除博客类型
        deleteBlogtypeList(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择分类");
                return;
            }
            let params = [];
            this.selectdList.forEach(item => {
                params.push(item.blogtype_id);
            });
            DeleteBlogtypeList(params).then(res => {
                this.$message.success("删除成功");
                this.getBlogtypeInfo();
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
            this.pageSize = size;
            this.currentPage = 1;
            this.getBlogtypeInfo();
        },
        //改变当前页
        changeCurrentPage(page) {
            this.clearSelectList();
            this.currentPage = page;
            this.getBlogtypeInfo();
        },
        //关闭对话框
        closeDialog(){
            this.showDialog = false;
            this.getBlogtypeInfo();
            this.clearSelectList();
        },
        //清空选中列表
        clearSelectList(){
            this.selectdList.splice(0,this.selectdList.length);
        }
    }
}
</script>

<style lang="scss" scoped>
.blogtype_manage {
    .blogtype-content {
        .blogtype-operation {
            display: flex;
            flex-direction: row;
            justify-content: start;
            margin: 10px 0;
            .blogtype-search {
                width: 200px;
                margin: 0 10px;
            }
        }
    }
}

</style>

<style lang="scss">
.blogtype_manage {
   .blogtype-search {
       .el-input__inner{
           height: 32px;
       }
   }
}
</style>
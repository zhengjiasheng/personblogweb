<template>
    <div class="friend_link">
        <main-title title="友情链接"></main-title>
        <div class="link-content">
            <div class="link-operation">
                <el-button type="primary" size="mini" @click.native="addLink"><i class="el-icon-plus"></i>新增</el-button>
                <el-button type="success" size="mini" @click.native="updateLink"><i class="el-icon-edit"></i>修改</el-button>
                <el-button type="danger" size="mini" @click.native="deleteLink"><i class="el-icon-delete"></i>删除</el-button>
                <el-button type="danger" size="mini" @click.native="deleteLinkList"><i class="el-icon-delete-solid"></i>批量删除</el-button>
                <div class="link-search">
                    <el-input placeholder="关键字搜索" v-model="keyword" @keydown.native.enter="getLinkInfo" clearable @clear="getLinkInfo"></el-input>
                </div>
            </div>
            <el-table :data="linkList" border style="width: 100%" height="340px" @select="handleSelect">
                <el-table-column  type="selection" align="center" width="55"></el-table-column>
                <el-table-column type="index" align="center" label="序号" width="100"></el-table-column>
                <el-table-column prop="link_name" align="center" label="链接名称" width="300"></el-table-column>
                <el-table-column prop="link_url" align="center" label="链接地址"></el-table-column>
                <el-table-column prop="order_no" align="center" label="排序" width="100"></el-table-column>
            </el-table>
            <pagination :currentPage="currentPage" :pageSizeList="pageSizeList" :pageSize="pageSize" :total="total"
                @changePageSize="changePageSize" @changeCurrentPage="changeCurrentPage"></pagination>
        </div>
        <add-link-dialog
            v-if="showDialog"
            :showDialog="showDialog"
            :type="type"
            :updateLinkInfo="updateLinkInfo"
            @closeDialog="closeDialog">
        </add-link-dialog>
    </div>
</template>

<script>
import MainTitle from '../../../components/MainTitle'
import Pagination from '../../../components/Pagination'
import addLinkDialog from './dialog/_addLink'
import {FindLinkByPage,DeleteLink,DeleteLinkList} from '../../../service/base'
export default {
    name:'friend_link',
    components:{
        MainTitle,
        Pagination,
        addLinkDialog
    },
    data(){
        return {
            linkList:[],                                                     //表格数据列表
            selectdList:[],                                                  //选中的表格中的数据列
            //分页数据
            currentPage:1,                                                   //当前页
            pageSize:10,                                                     //页大小
            pageSizeList:[5, 10, 15, 20],                                    //页大小列表
            total:0,                                                         //数据总条数
            showDialog:false,                                                //是否显示对话框
            type:'',                                                         //对话框类型
            updateLinkInfo:'',                                               //要修改的友情链接数据
            keyword:'',                                                      //关键字查询
        }

    },
    computed:{

    },
    mounted(){
        this.getLinkInfo();
    },
    methods:{
        //获取友情链接数据
        getLinkInfo(){
            let params = {
                pageNum :this.currentPage,
                pageSize:this.pageSize,
                keyword :this.keyword
            }
            FindLinkByPage(params).then(res => {
                this.total    = res.total;
                this.linkList = res.list;
            }).catch(err => {
                console.log(err);
            })
        },
        //添加友情链接
        addLink(){
            this.type = 'addLink';
            this.showDialog = true;
        },
        //修改友情链接
        updateLink(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一个链接");
                return;
            }
            if(this.selectdList.length > 1){
                this.$message.error("一次只能修改一个链接");
                return;
            }
            this.updateLinkInfo = this.$deepClone(this.selectdList[0]);
            this.type = 'updateLink';
            this.showDialog = true;
        },
        //删除友情链接
        deleteLink(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择一个链接");
                return;
            }
            if(this.selectdList.length > 1){
                this.$message.error("一次只能删除一个链接");
                return;
            }
            let params = {
                link_id:this.selectdList[0].link_id
            }
            DeleteLink(params).then(res => {
                this.$message.success("删除成功");
                this.getLinkInfo();
                this.clearSelectList();
            }).catch(err => {
                this.$message.error(err.msg);
                console.link_id(err);
            })
        },
        //批量删除友情链接
        deleteLinkList(){
            if(this.selectdList.length == 0){
                this.$message.error("请先选择链接");
                return;
            } 
            let params = [];
            this.selectdList.forEach(item => {
                params.push(item.link_id);
            })
            DeleteLinkList(params).then(res => {
                this.$message.success("删除成功");
                this.getLinkInfo();
                this.clearSelectList();
            }).catch(err => {
                console.log(err);
            })
        },
        //勾选数据行触发
        handleSelect(selection, row){
            this.selectdList = selection;
        },
        //改变页大小
        changePageSize(size) {
            this.clearSelectList();
            this.pageSize = size;
            this.currentPage = 1;
            this.getLinkInfo();
        },
        //改变当前页
        changeCurrentPage(page) {
            this.clearSelectList();
            this.currentPage = page;
            this.getLinkInfo();
        },
        //关闭对话框
        closeDialog(){
            this.showDialog = false;
            this.getLinkInfo();
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
.friend_link {
    .link-content {
        .link-operation {
            display: flex;
            flex-direction: row;
            justify-content: start;
            margin: 10px 0;
            .link-search {
                width: 200px;
                margin: 0 10px;
            }
        }
    }
}
</style>

<style lang="scss">
.friend_link {
    .link-search {
        .el-input__inner{
           height: 32px;
        }
    }
}
</style>
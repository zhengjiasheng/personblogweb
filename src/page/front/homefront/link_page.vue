<template>
    <div class="link-page">
        <div class="link-header">
            <span class="header-title">友情链接</span>
            <span class="header-num">
                共<span style="font-size:20px;margin-left:5px;margin-right:5px;color:red">{{total}}</span>个
            </span>
        </div>
        <div class="link-body" :class="friendLinkList.length==0 ? 'blank-content' : ''">
            <el-steps direction="vertical" :space="60">
                <el-step v-for="(item,index) in friendLinkList" :key="index" :class="activeLink == item.link_id ? 'isActive' : ''">
                    <span slot="description" :title="item.link_url">{{item.link_url}}</span>
                    <el-link slot="title" @click.native="checkActive(item.link_id)" :href="item.link_url" target="_blank" :underline="false">
                        {{item.link_name}}
                    </el-link>
                </el-step>
            </el-steps>
            <prompt-page class="prompt-page" v-if="friendLinkList.length == 0"></prompt-page>
        </div>
        <pagination :currentPage="currentPage" :pageSizeList="pageSizeList" :pageSize="pageSize" :total="total"
            @changePageSize="changePageSize" @changeCurrentPage="changeCurrentPage" v-if="friendLinkList.length != 0">
        </pagination>
    </div>
</template>

<script>
import Pagination from '../../../components/Pagination'
import PromptPage from '../../../components/PromptPage'
import {FindLinkByPage} from '../../../service/base'
export default {
    name:'link-page',
    components:{
        Pagination,
        PromptPage
    },
    data(){
        return {
            friendLinkList  :[],                                                    //友情链接列表
            currentPage     :1,                                                     //当前页
            pageSize        :10,                                                    //页大小
            pageSizeList    :[5, 10, 15, 20],                                       //页大小列表
            total           :0,                                                     //数据总条数
            activeLink      :null,                                                  //当前激活链接
        }

    },
    computed:{

    },
    mounted(){
        this.getFriendLink();
    },
    methods:{
        //获取友情链接
        getFriendLink(){
            let params = {
                pageNum : this.currentPage,
                pageSize: this.pageSize
            }
            FindLinkByPage(params).then(res => {
                this.friendLinkList = res.list;
                this.total          = res.total;
                // console.log(res);
            }).catch(err => {
                console.log(err);
            })
        },
        //改变页大小
        changePageSize(size) {
            this.pageSize = size;
            this.currentPage = 1;
            this.getFriendLink();
        },
        //改变当前页
        changeCurrentPage(page) {
            this.currentPage = page;
            this.getFriendLink();
        },
        //点击选中活跃链接
        checkActive(link_id){
            this.activeLink = link_id;
        }
    }
}
</script>

<style lang="scss" scoped>
.link-page {
    border  : 1.5px solid #E4E7ED;
    width   : 800px;
    margin  : 20px auto;
    .link-header {
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
    .link-body {
        padding         : 20px 30px;
        border-bottom   : 1.5px solid #E4E7ED;
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
.link-page {
    .link-body {
        .el-step__description.is-wait {
            word-break        : break-all;      //内容超过3行会隐藏，并用...代替
            text-overflow     : ellipsis;
            overflow          : hidden;
            -webkit-line-clamp: 1;             //需要控制的行数
            -webkit-box-orient: vertical;      //必需 ...
            display           : -webkit-box;
        }
        .el-steps {
            .isActive {
                .el-link.el-link--default {
                    color: #409EFF;
                }
            }
        }
    }
}
</style>
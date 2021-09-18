<template>
    <div class="front-header">
        <div class="header-icon">Person Blog</div>
        <el-menu :default-active="this.$route.path" :router="true" class="el-menu-vertical-demo" mode="horizontal"
            background-color="#333333" text-color="#fff" active-text-color="#ffd04b">
            <el-menu-item index="/front/homePage">首页</el-menu-item>
            <el-menu-item index="/front/typePage">分类</el-menu-item>
            <el-menu-item index="/front/linkPage">友链</el-menu-item>
            <el-menu-item index="/front/commentPage">评论</el-menu-item>
            <!-- <el-menu-item index="/front/aboutMe">关于我</el-menu-item> -->
        </el-menu>
        <div class="search-input" v-if="$route.path == '/front/homePage'">
            <el-input placeholder="关键字搜索" v-model="keyword" @keydown.native.enter="keyWordSearch" :disabled="isDisabledSearch">
                <div slot="suffix" class="el-icon-search" @click="keyWordSearch"></div>
            </el-input>
        </div>
    </div>
</template>

<script>
import {Events} from '../../../module/eventTypeList'
export default {
    name:'front-header',
    components:{

    },
    data(){
        return {
            keyword         :'',                                                    //关键字查询
            isDisabledSearch:false,                                                 //是否禁用搜索
        }

    },
    computed:{

    },
    mounted(){
        this.keyword = '';
        this.initEventListen();
    },
    beforeDestroy(){
        this.offEventListen();
    },
    methods:{
        //关键字搜索
        keyWordSearch(){
            this.$bus.trigger(Events.KEYWORD_SEARCH,this.keyword);
        },
        //初始化事件监听（绑定观察者）
        initEventListen(){
            this.$bus.on(Events.DISABLE_SEARCH,this.changeSearchStatus);
        },
        //监听事件解绑
        offEventListen(){
            this.$bus.off(Events.DISABLE_SEARCH,this.changeSearchStatus);
        },
        //改变搜索禁用状态
        changeSearchStatus(status){
            this.isDisabledSearch = status;
        }
    }
}
</script>

<style lang="scss" scoped>
.front-header {
    height        : 100%;
    display       : flex;
    flex-direction: row;
    align-items   : center;
    .header-icon {
        font-size : 26px;
        color     : #20B2AA;
        margin    : 0 80px 0 60px;
    }
    .search-input {
        width : 260px;
        margin: 0 0 0 320px;
    }
}

</style>

<style lang="scss">
.front-header {
    .el-menu {
        .el-menu-item {
            font-size: 16px;
        }
    }
    .search-input {
        .el-input--suffix .el-input__inner {
            height: 35px;
        }
        .el-input__suffix{
            display: flex;
            align-items: center;
            .el-icon-search {
                font-size: 16px;
                &:hover {
                    cursor: pointer;
                    font-size: 20px;
                }
            }
        }
    }
}
</style>
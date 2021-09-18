<template>
    <div class="aside-back">
        <div class="side-title">
            <span class="open-turn" @click="openOrTurnAside"><i class="el-icon-info"></i></span>
            <span v-show="!isCollapse">my blog</span>     
        </div>
        <div class="avatars">
            <img :src="userInfo.img_url || avatarsImg" alt="avatars">
            <span v-show="!isCollapse">{{userInfo.user_name ? userInfo.user_name : '未添加用户名'}}</span>
        </div>
        <el-menu :default-active="this.$route.path" :router="true" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
            background-color="#545c64" text-color="#fff" active-text-color="#ffd04b" :collapse="isCollapse">
            <el-menu-item index="/back/manageHome">
                    <i class="el-icon-s-home"></i>
                    <span slot="title">管理首页</span>
            </el-menu-item>
            <el-submenu index="blog">
                <template slot="title">
                    <i class="el-icon-document"></i>
                    <span slot="title">博客管理</span>
                </template>
                <el-menu-item index="/back/addBlog">新增博客</el-menu-item>
                <el-menu-item index="/back/manageBlog">博客列表</el-menu-item>
            </el-submenu>
            <el-menu-item index="/back/manageComment">
                <i class="el-icon-s-comment"></i>
                <span slot="title">评论管理</span>
            </el-menu-item>
            <el-menu-item index="/back/manageBlogType">
                <i class="el-icon-collection-tag"></i>
                <span slot="title">分类管理</span>
            </el-menu-item>
            <el-menu-item index="/back/friendLink">
                <i class="el-icon-share"></i>
                <span slot="title">友情链接</span>
            </el-menu-item>
            <el-menu-item index="/back/manageUser">
                <i class="el-icon-user"></i>
                <span slot="title">用户管理</span>
            </el-menu-item>
            <el-menu-item index="/back/jscoreStudy">
                <i class="el-icon-s-marketing"></i>
                <span slot="title">jscoreStudy</span>
            </el-menu-item>
        </el-menu>
    </div>
</template>

<script>
import {Events} from '../../../module/eventTypeList'
export default {
    name:'aside-back',
    components:{

    },
    data(){
        return {
            activeItem:'manageHome',                                        //默认菜单选项
            isCollapse: false,                                              //菜单是否收起
            userInfo  : {},                                                 //用户信息
            avatarsImg: require('../../../assets/default-avatars.jpg'),     //默认头像
        }
    },
    mounted(){
        this.getUserInfo();
        this.initEventListen();
    },
    beforeDestroy(){
        this.offEventListen();
    },
    methods:{
        //初始化事件监听（绑定观察者）
        initEventListen(){
            this.$bus.on(Events.USERINFO_UPDATE,this.getUserInfo);
        },
        //监听事件解绑
        offEventListen(){
            this.$bus.off(Events.USERINFO_UPDATE,this.getUserInfo);
        },
        //获取用户信息
        getUserInfo(){
            this.userInfo = this.$localSave.get('userInfo');
        },
        //展开或收起侧边栏
        openOrTurnAside(){
            this.siderTitle = '';
            this.isCollapse = !this.isCollapse;
            this.$emit('openOrTurnAside',this.isCollapse);
        },
        //展开指定的 sub-menu/能够展开的导航菜单
        handleOpen(key, keyPath) {
            console.log(key, keyPath);
        },
        //收起指定的 sub-menu/能够展开的导航菜单
        handleClose(key, keyPath) {
            console.log(key, keyPath);
        },
    }
}
</script>

<style lang="scss" scoped>
@import '../../../styles/variables.scss';
.aside-back {
    height    : 100%;
    .side-title {
        padding      : 0 20px;
        font-size    : 20px;
        color        : #C0C4CC;
        line-height  : 42px;
        border-bottom: 1px solid #F2F6FC;
        .open-turn {
            &:hover{
                color : #FFFFFF;
                cursor: pointer;
            }
        }
    }
    .avatars {
        display       : flex;
        align-items   : center;
        flex-direction: column;
        img {
            margin       : 8px 0 2px;
            width        : 38px;
            height       : 38px;
            border-radius: 50%;
        }
        span {
            color        : #C0C4CC;
            font-size    : 13px;
            margin-bottom: 5px;
        }
    }
}
</style>

<style lang="scss">
@import '../../../styles/variables.scss';

.aside-back {
    .el-menu {
        border-right: 0;
        // height: 100%;
    }
    .el-menu-item, .el-submenu__title {
        height     : 50px;
        line-height: 50px;
        font-size  : 15px;
    }
    .el-menu--inline {
        li {
            min-width: 174px;
        }
    }
}
.el-menu--vertical {
    .el-menu--collapse .el-menu .el-submenu, .el-menu--popup {
        min-width: 100px;
        li {
            height     : 32px;
            line-height: 32px;
        }
    }
}
</style>
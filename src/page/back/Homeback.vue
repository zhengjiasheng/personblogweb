<template>
    <el-container class="home-back">
        <el-header>
            <Header></Header>
        </el-header>
        <el-container>
            <el-aside :class="isCollapse ? 'turn-aside' : 'open-aside'">
                <Aside @openOrTurnAside="openOrTurnAside"></Aside>
            </el-aside>
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>
</template>

<script>
import Header from './homeback/header'
import Aside from './homeback/aside'
export default {
    name:'home-back',
    components:{
        Header,
        Aside
    },
    data(){
        return {
            isCollapse:false,
        }
    },
    mounted(){

    },
    methods:{
        //展开或收起侧边栏
        openOrTurnAside(isCollapse){
            this.isCollapse = isCollapse;
        }
    }
}
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
.home-back {
    width     : 1280px;
    margin    : 0 auto;
    height    : 100%;
    background: #F8F8FF;
    overflow  : hidden;
    .el-header {
        background-color: #dae2ec;
        color           : #333;
        height          : 64px !important;
    }
    .el-aside {
        background-color: #545c64;
        color           : #333;
        overflow-x      : hidden;
        margin-top      : 5px;
        border          : 1px solid #DCDFE6;

    }
    .open-aside {
        width: 180px !important;
    }
    .turn-aside {
        width               : 64px !important; 
        transition-duration : 0.4s;
    }
    .el-main {
        background-color: #FFFFFF;
        color           : #333;
        margin          : 5px 5px 0 15px;
        border-left     : 1.5px solid #EBEEF5;
        border-top      : 2px solid #0199ff;
        border-right    : 1.5px solid #EBEEF5;
        border-bottom   : 1.5px solid #EBEEF5;
    }
}
</style>
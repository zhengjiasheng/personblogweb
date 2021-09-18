<template>
    <el-container class="home-front">
        <el-header>
          <front-header></front-header>
        </el-header>
        <router-view class="front-content"></router-view>
        <el-footer>
            <front-footer></front-footer>
        </el-footer>
    </el-container>
</template>

<script>
import FrontHeader from './homefront/front_header'
import FrontFooter from './homefront/front_footer'
export default {
    name:'home-front',
    components:{
        FrontHeader,
        FrontFooter
    },
    data(){
        return {

        }

    },
    computed:{

    },
    mounted(){

    },
    methods:{

    }
}
</script>

<style lang="scss" scoped>
.home-front {
    width     : 1280px;
    height    : 100%;
    margin    : 0 auto;
    .el-header {
        background: #333333;
        color     : #EEEEEE;
    }
    .front-content {

    }
    .el-footer {
        height    : 180px !important;
        background: #333333;
        color     : #EEEEEE;
    }
}

</style>

<style lang="scss">

</style>
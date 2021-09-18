<template>
    <div class="home_manage">
        <main-title title="管理首页"></main-title>
        <div class="staticsitc">
            <el-row :gutter="24">
                <el-col :span="8" v-for="(item,index) in homeData" :key="index">
                    <div class="staticsitc-item" :class="item.className">
                        <div class="item-header">
                            <span v-if="item.content == 'blogNum'">{{staticsitc.blogNum}}</span>
                            <span v-if="item.content == 'commentNum'">{{staticsitc.commentNum}}</span>
                            <span v-if="item.content == 'blogtypeNum'">{{staticsitc.blogtypeNum}}</span>
                            <span v-if="item.content == 'linkNum'">{{staticsitc.linkNum}}</span>
                            <span v-if="item.content != 'blogNum' && item.content != 'commentNum' 
                            && item.content != 'blogtypeNum' && item.content != 'linkNum'">{{item.content}}</span>
                        </div>
                        <div class="item-body">
                            <span>{{item.title}}</span>
                        </div>
                        <div class="item-footer" @click="$router.push(item.router)" v-if="item.footertitle">
                            <span>{{item.footertitle}}</span>
                            <i class="el-icon-right"></i>
                        </div>
                        <div class="item-icon">
                            <i :class="item.itemIcon"></i>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>
    </div>
</template>

<script>
import MainTitle from '../../../components/MainTitle'
import {Staticsitc} from '../../../service/base'
export default {
    name:'home_manage',
    components:{
        MainTitle
    },
    data(){
        return {
            staticsitc      : {                                                        //统计数据
                blogNum     : null,
                blogtypeNum : null,
                commentNum  : null,
                linkNum     : null,
            },
            homeData:[{
                title       : '记录自己的所思所想',
                content     : '新增博客',
                className   : 'add-blog',
                router      : '/back/addBlog',
                itemIcon    : 'el-icon-edit-outline',
                footertitle : "let's go",
            },{
                title       : '博客数量',
                content     : 'blogNum',
                className   : 'blog-num',
                router      : '/back/manageBlog',
                itemIcon    : 'el-icon-date',
                footertitle : 'blog info',
            },{
                title       : '评论数量',
                content     : 'commentNum',
                className   : 'comment-num',
                router      : '/back/manageComment',
                itemIcon    : 'el-icon-s-comment',
                footertitle : 'comment info',
            },{
                title       : '分类数量',
                content     : 'blogtypeNum',
                className   : 'blogtype-num',
                router      : '/back/manageBlogType',
                itemIcon    : 'el-icon-collection-tag',
                footertitle : 'type info',
            },{
                title       : '友链数量',
                content     : 'linkNum',
                className   : 'link-num',
                router      : '/back/friendLink',
                itemIcon    : 'el-icon-share',
                footertitle : 'link info',
            },{
                title       : '期待后续开发',
                content     : '更多内容',
                className   : 'more',
                router      : '',
                itemIcon    : 'el-icon-coin',
                footertitle : '',
            }]
        }

    },
    computed:{

    },
    mounted(){
        this.getStaticsitc();
    },
    methods:{
        //获取统计数据
        getStaticsitc(){
            Staticsitc().then(res => {
                this.staticsitc = res;
            }).catch(err => {
                console.log(err);
            })
        }
    }
}
</script>

<style lang="scss" scoped>
.home_manage {
    .staticsitc {
        .staticsitc-item {
            position: relative;
            width: 100%;
            height: 100%;
            color: #fff;
            border-radius: 4px;
            .item-header {
                padding: 15px 0 0 10px;
                font-size: 32px;
                font-weight: bold;
            }
            .item-body {
                font-size: 16px;
                padding: 10px 0 31px 10px;
                font-weight: bold;
            }
            .item-footer {
                font-size: 16px;
                height: 30px;
                line-height: 30px;
                text-align: center;
                border-radius: 4px;
                cursor: pointer;
            }
            .item-icon {
                position: absolute;
                top: 0;
                left: 65%;
                font-size: 90px;
                color: rgba(0, 0, 0, .12);
            }
        }
        .add-blog{
            background: #00CACA;
            .item-footer {
                background: #00AEAE;
            }
        }
        .blog-num {
            background: #01B468;
            .item-footer {
                background: #019858;
            }
        }
        .comment-num {
            background: #0072E3;
            .item-footer {
                background: #005AB5;
            }
        }
        .blogtype-num {
            background: #EA0000;
            .item-footer {
                background: #CE0000;
            }
        }
        .link-num {
            background: #EAC100;
            .item-footer {
                background: rgb(133, 133, 4);
            }
        }
        .more {
            background: #408080;
            .item-footer {
                background: #336666;
            }
        }
    }
}
</style>

<style lang="scss">
.home_manage {
    .staticsitc {
        .el-row {
            .el-col {
                margin-top: 20px;
                height: 150px;
            }
        }
    }
}
</style>
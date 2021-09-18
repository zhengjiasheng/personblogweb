<template>
    <div class="blog-card" @click="openBlogDetail">
        <div class="card-title">{{blogInfo.blog_title}}</div>
        <div class="card-content">
            <div class="blog-summary">
                {{blogInfo.blog_summary}}
            </div>
            <img class="blog-img" :src="blogInfo.blog_imgurl" alt="预览图">
            <div class="card-footer">
                <img class="blogger-avatars" :src="bloggerInfo.img_url" alt="博主头像">
                <span class="blogger-nickName">{{bloggerInfo.nick_name}}</span>
                <span class="publish-date">{{$formatTime(blogInfo.publish_date)}}</span>
                <div class="click-num" title="访问量">
                    <i class="el-icon-s-flag"></i>
                    <span>{{blogInfo.click_num}}</span>
                </div>
                <div class="replace-num" title="评论数">
                    <i class="el-icon-s-comment"></i>
                    <span>{{blogInfo.replace_num}}</span>
                </div>
                <div class="blog-type">
                    {{$getTypeNameById(blogInfo.type_id,blogTypeList)}}
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name:'blog-card',
    props:['blogInfo','bloggerInfo','blogTypeList'],
    data(){
        return{
            
        }
    },
    mounted(){

    },
    methods:{
        //打开博客详情页（新页面打开）
        openBlogDetail(){
            let routerNewWindow = this.$router.resolve({
                path:'/front/blogDetail',
            })
            window.open(`${routerNewWindow.href}?blog_id=${this.blogInfo.blog_id}&blog_title=${this.blogInfo.blog_title}`,'_blank');
        }
    }
}
</script>

<style lang="scss" scoped>
.blog-card {
    padding : 0 40px;
    cursor  : pointer;
    .card-title {
        font-size   : 20px;
        font-weight : bold;
        margin      : 25px 0 5px 0;
    }
    .card-content {
        position        : relative;
        width           : 100%;
        height          : 140px;
        border-bottom   : 1.5px solid #EBEEF5;
        .blog-summary {
            width             : 450px;
            height            : 60px;
            padding           : 10px 0 0 0;
            word-break        : break-all;      //内容超过3行会隐藏，并用...代替
            text-overflow     : ellipsis;
            overflow          : hidden;
            -webkit-line-clamp: 3;             //需要控制的行数
            -webkit-box-orient: vertical;      //必需 ...
            display           : -webkit-box;
        }
        .blog-img {
            position: absolute;
            width   : 150px;
            height  : 100px;
            top     : 0;
            left    : 500px;
        }
        .card-footer {
            display     : flex;
            align-items : center;
            margin      : 15px 0 0 5px;
            .blogger-avatars {
                width        : 24px;
                height       : 24px;
                border-radius: 50%;
            }
            .blogger-nickName {
                font-size   : 13px;
                font-weight : 600;
                color       : #6495ED;
                margin      : 0 10px;
            }
            .publish-date {
                font-size   : 10px;
                color       : #909399;
            }
            .click-num {
                margin      : 0 0 0 110px;
                display     : inline-block;
                font-size   : 12px;
                color       : #909399;
            }
            .replace-num {
                margin      : 0 20px;
                display     : inline-block;
                font-size   : 12px;
                color       : #909399;
            }
            .blog-type {
                padding    : 0 2px;
                font-size  : 14px;
                color      : #20B2AA;
                border     : 1.5px solid #20B2AA;
                font-family: "微软雅黑","黑体","宋体";
            }
        }
    }
}
</style>

<style lang="scss">

</style>
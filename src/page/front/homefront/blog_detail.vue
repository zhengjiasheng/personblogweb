<template>
    <div class="blog-detail" v-loading.fullscreen="loading" element-loading-text="加载中...">
        <div class="blog-header">
            <div class="publish-time">
                <img class="blogger-avatars" :src="bloggerInfo.img_url" alt="">
                <span class="nick-name">{{bloggerInfo.nick_name}}</span>
                <span class="date-time"><i class="el-icon-date"></i>{{$formatTime(currentBlogInfo.publish_date)}}</span>
                <span class="click-sum" title="访问量"><i class="el-icon-s-flag"></i>{{currentBlogInfo.click_num}}</span>
                <span class="back-home" @click="backHome">返回首页</span>
            </div>
            <div class="blog-img">
                <img :src="currentBlogInfo.blog_imgurl" alt="预览图">
            </div>
            <div class="blog-info">
                <table class="info-table" cellspacing="10">
                    <tr>
                        <th>标题</th>
                        <td>{{currentBlogInfo.blog_title}}</td>
                    </tr>
                    <tr>
                        <th>摘要</th>
                        <td>{{currentBlogInfo.blog_summary}}</td>
                    </tr>
                    <tr>
                        <th>类型</th>
                        <td>{{$getTypeNameById(currentBlogInfo.type_id,blogTypeList)}}</td>
                    </tr>
                    <tr>
                        <th>标签</th>
                        <td>{{currentBlogInfo.key_word}}</td>
                    </tr>
                </table>
            </div>
        </div>
        <div class="blog-content">
            <mavon-editor
                class="md"
                :value="currentBlogInfo.blog_content"
                :subfield="false"
                :defaultOpen="'preview'"
                :toolbarsFlag="false"
                :editable="false"
                :scrollStyle="true"
                :ishljs="true"/>
        </div>
        <div class="blog-footer">
            <div class="footer-info">
                <ul>
                    <li>作者：{{bloggerInfo.nick_name}}</li>
                    <li>发表时间：{{$formatTime(currentBlogInfo.publish_date)}}</li>
                    <li>版权声明：自由转载-非商用-非衍生-保持署名</li>
                </ul>
                <img src="../../../assets/qr-code.jpg" alt="二维码名片">
            </div>
            <div class="blog-comment">
                <comment :blogId="currentBlogId" :bloggerInfo="bloggerInfo" v-if="isShowComment"></comment>
            </div>
        </div>
    </div>
</template>

<script>
import Comment from '../../../components/Comment'
import {FindBlogById,AddBlogClickNum,GetBloggerInfoById,FindAllBlogtype,} from '../../../service/base'
export default {
    name:'blog-detail',
    components:{
        Comment
    },
    data(){
        return{
            loading         :true,
            currentBlogId   :null,                                                  //当前博客id
            currentBlogInfo :'',                                                    //当前博客信息
            bloggerInfo     :'',                                                    //博主信息
            blogTypeList    :[],                                                    //博客类型列表
            isShowComment   :false,                                                 //是否显示评论
        }
    },
    computed:{

    },
    mounted(){
        document.title = this.$route.query.blog_title;
        this.currentBlogId = this.$route.query.blog_id;
        this.getBlogtypeList();
        this.getBloggerInfo();
    },
    beforeDestroy(){
        
    },
    methods:{
        //获取当前博客信息
        getCurrentBlogInfo(){
            let params = {
                blog_id : this.currentBlogId
            }
            FindBlogById(params).then(res => {
                this.currentBlogInfo = res;
                this.loading         = false;
                this.addBlogClickNum();
                console.log("当前博客信息",this.currentBlogInfo);
            }).catch(err => {
                console.log(err);
            })
        },
        //获取博主信息
        getBloggerInfo(){
            let params = {
                blogger_id : 1
            }
            GetBloggerInfoById(params).then(res => {
                this.bloggerInfo   = res;
                this.isShowComment = true;
                console.log("博主信息",res);
            }).catch(err => {
                console.log(err);   
            })
        },
        //获取博客类型列表
        getBlogtypeList(){
            FindAllBlogtype().then(res => {
                for(let item of res){
                    this.blogTypeList[item.blogtype_id] = item.type_name;
                }
                this.getCurrentBlogInfo();
                console.log("博客类型列表",this.blogTypeList);
            }).catch(err => {
                console.log(err);
            })
        },
        //增加博客点击数
        addBlogClickNum(){
            let params = {
                blog_id : this.currentBlogId
            }
            AddBlogClickNum(params).then(res => {

            }).catch(err => {
                console.log(err);
            })
        },
        //返回首页
        backHome(){
            this.$router.push('/front');
        }
    },
}
</script>

<style lang="scss" scoped>
.blog-detail {
    width   : 900px;
    margin  : 30px auto;
    .blog-header {
        border          : 1.5px solid #E4E7ED;
        margin-bottom   : 10px;
        .publish-time {
            border-bottom   : 1.5px solid #E4E7ED;
            padding         : 0 10px;
            line-height     : 40px;
            .blogger-avatars {
                width           : 20px;
                height          : 20px;
                border-radius   : 50%;
                position        : relative;
                top             : 4px;
            }
            .nick-name {
                font-size   : 16px;
                color       : #6495ED;
                font-weight : 600;
            }
            .date-time {
                font-size   : 14px;
                color       : #909399;
                margin      : 0 8px;
            }
            .click-sum {
                font-size   : 14px;
                color       : #909399;
            }
            .back-home {
                margin      : 0 0 0 520px;
                cursor      : pointer;
                font-size   : 14px;
                color       : #606266;
                &:hover {
                    color   : #6495ED;
                }
            }
        }
        .blog-img {
            padding         : 10px;
            height          : 550px;
            border-bottom   : 1.5px solid #E4E7ED;
            img {
                width   :100%;
                height  :100%;
            }
        }
        .blog-info {
            padding: 10px;
            .info-table {
                th {
                    width       : 50px;
                    font-size   : 16px;
                    color       : #20B2AA;
                    font-family : "微软雅黑","黑体","宋体";
                }
                td {
                    font-family : -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
                    font-size   : 14px;
                    color       : #24292e;
                }
            }
        }
    }
    .blog-content {
        box-shadow  : 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        width       : 100%;
    }
    .blog-footer {
        margin      : 20px 0 0 0;
        border      : 1.5px solid #E4E7ED;
        background  : #FFFFE0;
        .footer-info {
            border-bottom   : 1.5px solid #EBEEF5;
            position        : relative;
            font-family     : -apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";
            img {
                width   : 64px;
                height  : 64px;
                position: absolute;
                top     : 0;
                left    : 800px;
            }
        }
        .blog-comment {
            padding     : 20px;
            background  : #FFFFFF;
        }
    }
}
</style>

<style lang="scss">
.blog-detail {

}
</style>
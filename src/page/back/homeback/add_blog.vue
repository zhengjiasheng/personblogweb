<template>
    <div class="add-blog">
        <main-title :title="title"></main-title>
        <div class="add-blog-content">
            <file-upload ref="fileUpload" @uploadSuccess="uploadSuccess"></file-upload>
            <el-form :model="blogInfo" :rules="rules" ref="blogInfo" label-width="100px" class="blog-info">
                <el-form-item label="博客标题" prop="blog_title">
                    <el-input v-model="blogInfo.blog_title" style="width:50%" placeholder="请输入标题"></el-input>
                </el-form-item>
                <el-form-item label="博客摘要" prop="blog_summary">
                   <el-input type="textarea" v-model="blogInfo.blog_summary" style="width:50%" placeholder="请输入摘要"></el-input>
                </el-form-item>
                <el-form-item label="预览图" prop="blog_imgurl">
                    <el-input v-model="blogInfo.blog_imgurl" readonly @click.native="openFileUpload" style="width:50%" class="img-url-input" placeholder="请选择预览图" title="上传图片"></el-input>
                    <el-button icon="el-icon-close" size="mini" circle @click.native="clearAll"></el-button>
                </el-form-item>
                <el-form-item label="博客内容" prop="blog_content">
                    <mavon-editor v-model="blogInfo.blog_content"></mavon-editor>
                </el-form-item>
                <el-form-item label="博客类型" prop="type_id">
                    <el-select v-model="blogInfo.type_id" placeholder="请选择">
                        <el-option v-for="(item,index) in blogTypeList" :key="index" :value="item.blogtype_id" :label="item.type_name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="关键字" prop="key_word">
                    <el-input v-model="blogInfo.key_word" style="width:50%" placeholder="请输入关键字"></el-input>
                    <span class="key-word-tip">多个关键字之间用逗号隔开</span>
                </el-form-item>
                <el-form-item label="博客状态" prop="blog_status">
                    <el-select v-model="blogInfo.blog_status" placeholder="请选择">
                        <el-option :value="true" label="发布"></el-option>
                        <el-option :value="false" label="留存"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button size="medium" type="primary" @click="submitForm('blogInfo')">确定</el-button>
                    <el-button size="medium" @click="resetForm('blogInfo')" v-if="type=='addBlog'">重置</el-button>
                    <el-button size="medium" @click="backManageBlog" v-else>取消</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>

<script>
import MainTitle from '../../../components/MainTitle'
import FileUpload from '../../../components/FileUpload'
import {RemoveImg,FindAllBlogtype,FindBlogById,AddBlog,UpdateBlog} from '../../../service/base'
export default {
    name:'add-blog',
    components:{
        MainTitle,
        FileUpload
    },
    data(){
        return {
            title:'新增博客',                                              //标题
            blogInfo: {                                                   //博客信息
                blog_title  :'',
                blog_summary:'',
                blog_imgurl :'',
                blog_content:'',
                type_id     :null,
                key_word    :'',
                blog_status :null, 
            },
            rules: {                                                      //页面数据匹配规则
                blog_title: [
                    { required: true, message: '请输入博客标题', trigger: 'blur' },
                ],
                blog_summary: [
                    { required: true, message: '请输入博客摘要', trigger: 'blur' }
                ],
                blog_imgurl: [
                    { required:true, message: '请选择预览图', trigger: 'change' }
                ],
                blog_content: [
                    { required: true, message: '请输入博客内容', trigger: 'blur' }
                ],
                type_id: [
                    { required: true, message: '请选择博客类型', trigger: 'change' }
                ],
                key_word: [
                    { required: true, message: '请输入关键字', trigger: 'blur' }
                ],
                blog_status: [
                    { required: true, message: '请选择博客状态', trigger: 'change' }
                ]
            },
            blogTypeList:[],                                              //博客类型列表
            type        :'addBlog',                                       //类型  添加博客/修改博客
        }

    },
    computed:{

    },
    mounted(){
        this.getBlogtypeList();
        this.removeOldUploadImg();
        let id = this.$route.query.id;
        if(id){
            this.title = '修改博客';
            this.type  = 'updateBlog';
            let params = {
                blog_id:id
            }
            FindBlogById(params).then(res => {
                this.blogInfo = res;
            }).catch(err => {
                console.log(err);
            })
        }
    },
    beforeDestroy(){
        this.removeOldUploadImg();
    },
    methods:{
        //提交表单
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    if(this.type == 'addBlog'){
                        this.blogInfo.click_num = 0;
                        this.blogInfo.replace_num = 0;
                        AddBlog(this.blogInfo).then(res => {
                            this.$message.success("添加成功");
                            this.$localSave.delete('oldUploadImg');
                            this.$router.push('manageBlog');
                        }).catch(err => {
                            this.$message.error(err.msg);
                            console.log(err);
                        })
                    }else{
                        UpdateBlog(this.blogInfo).then(res => {
                            this.$message.success("修改成功");
                            this.$localSave.delete('oldUploadImg');
                            this.$router.push('manageBlog');
                        }).catch(err => {
                            this.$message.error(err.msg);
                            console.log(err);
                        })
                    }
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
        },
        //重置表单
        resetForm(formName) {
            this.removeOldUploadImg();
            this.$refs[formName].resetFields();
        },
        //打开文件上传
        openFileUpload(){
           this.$refs.fileUpload.openFileUpload();
        },
        //文件上传成功
        uploadSuccess(data){
            this.removeOldUploadImg();
            //保存当前上传成功的图片域名，用于下次上传图片成功后把这个旧图片删除
            this.$localSave.set('oldUploadImg',{img_url:data.img_url});
            this.blogInfo.blog_imgurl = data.img_url;
        },
        // 删除之前上传的图片
        removeOldUploadImg(){
            let oldUploadImg = this.$localSave.get('oldUploadImg');
            if(oldUploadImg){
                let oldImgName = oldUploadImg.img_url.split('/')[4];
                this.$localSave.delete('oldUploadImg');
                RemoveImg({fileName:oldImgName}).then(res => {
                    console.log("删除图片====>","删除成功");
                }).catch(err => {
                    console.log("删除图片====>",err.msg);
                });
            }
        },
        //清空图片路径
        clearAll(){
            this.blogInfo.blog_imgurl = '';
            this.removeOldUploadImg();
        },
        //获取博客类型列表
        getBlogtypeList(){
            FindAllBlogtype().then(res => {
                this.blogTypeList = res;
            }).catch(err => {
                console.log(err);
            })
        },
        //点击取消,返回博客列表
        backManageBlog(){
            this.$router.push('manageBlog');
        },
    }
}
</script>

<style lang="scss" scoped>
.add-blog {
    height  : 485px;
    overflow: scroll;
    &::-webkit-scrollbar {
        display: none;
    }
    .add-blog-content {
        margin: 10px 0 0 0;
        .blog-info {
            .key-word-tip {
                font-size: 12px;
                color: #f56353;
            }
        }
    }
}

</style>

<style lang="scss">
.add-blog {
    .el-form {
        .el-form-item {
            .el-form-item__label {
                font-size: 15px;
            }
            .img-url-input{
                .el-input__inner {
                    &:hover{
                        cursor: pointer;
                    }
                }
            }
        }
    }
}
</style>
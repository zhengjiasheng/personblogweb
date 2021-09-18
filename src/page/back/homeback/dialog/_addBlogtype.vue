<template>
    <div class="add-blogtype">
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :close-on-click-modal="false"
            custom-class="add-blogtype-dialog" width="500px" @close="$emit('closeDialog')"> 
            <el-form v-model="addBlogtypeDate" label-width="100px">
                <el-form-item label="类型编号：" v-if="type=='updateBlogtype'">
                    <el-input v-model="addBlogtypeDate.blogtype_id" disabled></el-input>
                </el-form-item>
                <el-form-item label="类型名称：">
                    <el-input v-model="addBlogtypeDate.type_name" placeholder="请输入类型名称"></el-input>
                </el-form-item>
                <el-form-item label="排序序号：">
                    <el-input v-model="addBlogtypeDate.order_no" placeholder="请输入排序序号"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addOrUpdateBlogtype" :disabled="!isClickDetermine">确定</el-button>
                <el-button class="cancel-btn" @click="$emit('closeDialog')">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {AddBlogtype,UpdateBlogtype} from '../../../../service/base'
export default {
    name:'add-blogtype',
    props:['showDialog','type','updateBlogtypeInfo'],
    data(){
        return{
            dialogTitle    : '',                                          //对话框标题
            dialogVisible  : false,                                       //对话框状态
            addBlogtypeDate: {                                            //对话框数据
                blogtype_id:null,
                type_name  :'',
                order_no   :null
            }
        }
    },
    computed:{
        //是否可以点击确定
        isClickDetermine(){
            if(this.addBlogtypeDate.type_name && this.addBlogtypeDate.order_no){
                return true;
            }else {
                return false;
            }
        }
    },
    mounted(){
        this.dialogVisible = this.showDialog;
        this.init();
    },
    methods:{
        //初始化对话框
        init(){
            if(this.type == 'addBlogtype'){
                this.dialogTitle = '新增分类';
            }else{
                this.dialogTitle = '修改分类';
                this.addBlogtypeDate = this.updateBlogtypeInfo;
            }
        },
        //添加或修改分类
        addOrUpdateBlogtype(){
            if(this.type == 'addBlogtype'){
                AddBlogtype(this.addBlogtypeDate).then(res => {
                    this.$message.success("添加成功");
                    this.$emit('closeDialog');
                }).catch(err => {
                    this.$message.error(err.msg);
                    console.log(err);
                })
            }else {
                UpdateBlogtype(this.addBlogtypeDate).then(res => {
                    this.$message.success("修改成功");
                    this.$emit('closeDialog');
                }).catch(err => {
                    this.$message.error(err.msg);
                    console.log(err);
                })
            }
        },
    }
}
</script>

<style lang="scss" scoped>

</style>

<style lang="scss">
.add-blogtype-dialog {
    .el-dialog__footer {
        padding   : 10px 20px 28px;
        text-align: center;
        .el-button {
            margin: 0 20px;
        }
    }
    .el-dialog__headerbtn .el-dialog__close {
        font-size: 22px;
    }
    .el-dialog__body {
        padding: 30px 70px 20px 20px;
    }
}
</style>
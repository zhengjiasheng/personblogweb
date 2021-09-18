<template>
    <div class="add-link">
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" :close-on-click-modal="false"
            custom-class="add-link-dialog" width="500px" @close="$emit('closeDialog')"> 
            <el-form v-model="addLinkDate" label-width="100px">
                <el-form-item label="链接编号：" v-if="type=='updateLink'">
                    <el-input v-model="addLinkDate.link_id" disabled></el-input>
                </el-form-item>
                <el-form-item label="链接名称：">
                    <el-input v-model="addLinkDate.link_name" placeholder="请输入链接名称"></el-input>
                </el-form-item>
                <el-form-item label="链接地址：">
                    <el-input v-model="addLinkDate.link_url" placeholder="请输入链接地址"></el-input>
                </el-form-item>
                <el-form-item label="排序序号：">
                    <el-input v-model="addLinkDate.order_no" placeholder="请输入排序序号"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="addOrUpdateLink" :disabled="!isClickDetermine">确定</el-button>
                <el-button class="cancel-btn" @click="$emit('closeDialog')">取消</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import {AddLink,UpdateLink} from '../../../../service/base'
export default {
    name:'add-link',
    props:['showDialog','type','updateLinkInfo'],
    data(){
        return{
            dialogTitle    : '',                                          //对话框标题
            dialogVisible  : false,                                       //对话框状态
            addLinkDate    : {                                            //对话框数据
                link_id    :null,
                link_name  :'',
                link_url   :'',
                order_no   :null
            }
        }
    },
    computed:{
        //是否可以点击确定
        isClickDetermine(){
            if(this.addLinkDate.link_name && this.addLinkDate.link_url && this.addLinkDate.order_no){
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
            if(this.type == 'addLink'){
                this.dialogTitle = '新增链接';
            }else{
                this.dialogTitle = '修改链接';
                this.addLinkDate = this.updateLinkInfo;
            }
        },
        //添加或修改友情链接
        addOrUpdateLink(){
            if(this.type == 'addLink'){
                AddLink(this.addLinkDate).then(res => {
                    this.$message.success("添加成功");
                    this.$emit('closeDialog');
                }).catch(err => {
                    this.$message.error(err.msg);
                    console.log(err);
                })
            }else {
               UpdateLink(this.addLinkDate).then(res => {
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
.add-link-dialog {
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
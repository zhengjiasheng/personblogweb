<template>
    <div class="pagination">
        <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="currentPage"
            :page-sizes="pageSizeList"
            :page-size="pageSize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
        </el-pagination>
    </div>
</template>

<script>
export default {
    name:'pagination',
    props:['currentPage','pageSizeList','pageSize','total'],
    data(){
        return {

        }
    },
    mounted(){

    },
    methods:{
        //改变页大小
        handleSizeChange(size) {
            this.$emit('changePageSize',size);
        },
        //改变当前页
        handleCurrentChange(page) {
            this.$emit('changeCurrentPage',page);
        }
    }
}
</script>

<style lang="scss" scoped>
.pagination {
    text-align: center;
    }
</style>
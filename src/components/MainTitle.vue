<template>
    <div class="main-title">
            {{title}}
        </div>
</template>

<script>
export default {
    name:'main-title',
    props:['title'],
}
</script>

<style lang="scss" scoped>
.main-title {
    height          : 40px;
    font-size       : 18px;
    border-bottom   : 1.5px solid #F2F6FC;
}
</style>
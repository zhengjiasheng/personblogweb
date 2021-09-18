<template>
    <div class="prompt-page">
        <img src="../assets/nodata.png" alt="">
    </div>
</template>

<script>
export default {
    name:'prompt-page'
}
</script>

<style lang="scss" scoped>
.prompt-page {
    width: 100%;
    height: 100%;
    position: relative;
    img{
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%,-50%);
    }
}
</style>
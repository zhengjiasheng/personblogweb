<template>
    <div class="front-footer">
        <div class="qr-code">
            <img src="../../../assets/qr-code.jpg" alt="二维码名片">
        </div>
        <div class="contact-information describe">
            <div>联系我</div>
            <div>Email: 970518040@qq.com</div>
            <div>QQ: 970518040</div>
        </div>
        <div class="system-introduction describe">
            <div>Person Blog</div>
            <div>这是我的个人博客，我会在此分享一些编程、思考、感悟的内容，希望能够给每一个来到这儿的人带来些帮助，
                也欢迎你们提出自己的看法和见解，希望我们能够相互学习、共同进步。
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name:'front-footer',
    components:{

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
.front-footer {
    display        : flex;
    flex-direction : row;
    align-items    : center;
    justify-content: space-between;
    height         : 100%;
    .qr-code {
        width       : 25%;
        border-right: 1.5px solid #606266;
        img{
            width : 100px;
            height: 100px;
            margin: 0 100px;
        }
    }
    .contact-information {
        width: 20%;    
        div {
            margin: 10px 0;
        }
    }
    .describe {
        text-align : center;
        font-size  : 0.83em;
        font-weight: 300;
        &>div:first-child {
            font-size  : 1em;
            font-weight: bold;
        }
    }
    .system-introduction {
        width      : 40%;
        border-left: 1.5px solid #606266;
        padding    : 0 40px;
        div {
            margin: 10px 0;
        }
    }
}
</style>

<style lang="scss">

</style>
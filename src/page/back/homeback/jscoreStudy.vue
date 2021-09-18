<template>
    <div class="jscore-study">
        <main-title title="jscoreStudy"></main-title>
        <div class="jscore-content">
            <div class="canvas-body">
                <span class="privious-img" @click="previosImg" v-if="true">&lt;</span>
                <canvas class="myCanvas" ref="myCanvas" width="700px" height="400px" @mousedown="beginDraw" @mousemove="drawing" @mouseup="endDraw" @mouseleave="endDraw"
                    :style="{backgroundImage:`url('${canvasbgList[canvasbgIndex]}')`}"></canvas>
                <span id="next-img" @click="nextImg" v-if="true">&gt;</span>
            </div>
            <div class="operation">
                <button @click="choosePaint">画笔</button>
                <button @click="clearAll">清空</button>
                <button @click="chooseEraser">橡皮擦</button>
                <button class="choose-paintColor" @click="choosePaintColor" :style="{backgroundColor:paintBrushColor}"></button>
                <el-slider class="choose-paintwidth" v-model="paintBrushWidth"></el-slider>
            </div>
            <ColorSelector v-show="isSelectShow" @receiveColor="receiveColor" @receiveStatus="receiveStatus"/>
        </div>
    </div>
</template>

<script>
import MainTitle from '../../../components/MainTitle'
import ColorSelector from './ColorSelector.vue'
export default {
    name:'jscore-study',
    components:{
        MainTitle,
        ColorSelector
    },
    data(){
        return {
            canvasbgList : [require('../../../assets/scenery16.jpeg'),
                            require('../../../assets/scenery17.gif'),
                            require('../../../assets/scenery18.jpeg'),
                            require('../../../assets/scenery19.jpeg'),
                            require('../../../assets/scenery20.jpeg')],
            canvasbgIndex : 0,
            paintBrushColor:"#000000",    //画笔颜色
            paintBrushWidth:2,            //画笔粗细
            ctx : null,
            isDraw : false,
            drawType:'draw',              //draw/eraser
            lineArr:[],                   //存储线条的数组
            line : {
                type : '',
                lineWidth : 0,
                lineColor : '',
                pointArr  : []
            },
            isSelectShow:false,           //颜色选择器的状态
        }
    },
    computed:{
        
    },
    mounted(){
        this.ctx = this.$refs.myCanvas.getContext("2d");//把画布变成二维       
    },
    methods:{
        receiveColor(selectColor,colorSelectorStatus){
            this.paintBrushColor = selectColor;
            this.isSelectShow = colorSelectorStatus;
        },
        receiveStatus(colorSelectorStatus){
            this.isSelectShow = colorSelectorStatus;
        },
        beginDraw(event){
            this.isDraw = true;
            let beginPoint = {
                x : event.clientX - event.target.offsetLeft,
                y : event.clientY - event.target.offsetTop
            }
            if(this.drawType == 'draw'){
                this.ctx.beginPath();
                this.ctx.lineWidth = this.paintBrushWidth;
                this.ctx.strokeStyle = this.paintBrushColor;
                this.ctx.lineCap="round";                  
                this.ctx.lineJoin="round";
                this.ctx.moveTo(beginPoint.x,beginPoint.y);
                this.line.type = 'draw';
            }else {
                this.ctx.clearRect(beginPoint.x, beginPoint.y, this.paintBrushWidth, this.paintBrushWidth);
                this.line.type = 'eraser';
            }
                this.line.lineWidth = this.paintBrushWidth;
                this.line.lineColor = this.paintBrushColor;
                this.line.pointArr.push(beginPoint);
        },
        drawing(event){
            if(this.isDraw){
                let drawPoint = {
                    x : event.clientX - event.target.offsetLeft,
                    y : event.clientY- event.target.offsetTop
                }
                if(this.drawType == 'draw'){
                    this.ctx.lineTo(drawPoint.x,drawPoint.y);
                    this.ctx.stroke();  
                }else {
                    this.ctx.clearRect(drawPoint.x, drawPoint.y, this.paintBrushWidth, this.paintBrushWidth);
                } 
                this.line.pointArr.push(drawPoint);
            }
        },
        endDraw(){
            if(this.isDraw){
                this.ctx.closePath();
                this.isDraw = false;
                this.lineArr.push(this.line);
                this.line = {
                    type : '',
                    lineWidth : 0,
                    lineColor : '',
                    pointArr  : []
                };
            }
        },
        previosImg(){
            if(this.canvasbgIndex > 0){
                let fileName = this.getFileName();
                let path = wincore.System.get_exe_path() + "data/imgLine/" + fileName + ".txt";
                console.log("文件路径=====》",path);
                wincore.Disk.write_file(path,JSON.stringify(this.lineArr),"utf-8","",function(e){
                    this.clearAll();
                    this.canvasbgIndex--;
                });  
            }
        },
        nextImg(){
            if(this.canvasbgIndex < this.canvasbgList.length - 1){
                let fileName = this.getFileName();
                let path = wincore.System.get_exe_path() + "data/imgLine/" + fileName + ".txt";
                console.log("文件路径=====》",path);
                wincore.Disk.write_file(path,JSON.stringify(this.lineArr),"utf-8","",function(e){
                    this.clearAll();
                    this.canvasbgIndex++;
                });  
            }
        },
        choosePaint(){
            this.drawType = 'draw';
        },
        chooseEraser(){
            this.drawType = 'eraser';
        },
        clearAll(){
            this.lineArr.splice(0,this.lineArr.length);
            this.ctx.clearRect(0,0,this.$refs.myCanvas.width,this.$refs.myCanvas.height);
        },
        choosePaintColor(){
            this.isSelectShow = true;
        },
        getFileName(){
            let imgName = this.canvasbgList[this.canvasbgIndex].split('/')[3];
            let fileName = imgName.split('.')[0];
            return fileName;
        }
    }
}
</script>

<style lang="scss" scoped>
.jscore-study {
    .jscore-content {
        .canvas-body {
            margin: 10px auto;
            display: flex;
            justify-content:center;
            align-items: center;
            .myCanvas {
                background-size: 100% 100%;
                 background-repeat:no-repeat;
            }
            span {
                margin: 0 10px;
                font-size: 40px;
                &:hover {
                    color: #6495ED;
                    cursor: pointer;
                }
            }
        }
        .operation {
            text-align: center;
            .choose-paintColor {
                height: 23px;
                width: 42px;
                position: relative;
                top: 3px;
            }
            .choose-paintwidth {
                width: 400px;
                margin-left: calc(50% - 200px);
            }
            button {
                margin: 0 5px;
            }
        }
    }
}
</style>

<style lang="scss">
.jscore-study {

}
</style>
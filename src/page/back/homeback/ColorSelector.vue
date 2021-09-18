<template>
    <div class="colorSelector" @mousedown="beginMove" @mousemove="moving" @mouseup="endMove" @mouseleave="endMove">
      <span class="colorSelectorTitle">颜色</span>
      <span class="colorSelectorQuitBtn" @click="quitColorSelect">x</span>
      <table border="0" class="colorTalbe" cellspacing="5px">
        <tr v-for="(item,index) in colors" :key="index">
          <td v-for="(color,index) in item" :key="index" :bgcolor="color" @click="chooseColor(color)"></td>
        </tr>
      </table>
    </div>
</template>

<script>
  export default {
    name:'ColorSelector',
    data(){
      return{
        colors:[
          ["#FFFFFF","#DDDDDD","#AAAAAA","#888888","#666666","#444444","#000000",
          "#FFB7DD","#FF88C2","#FF44AA","#FF0088","#C10066","#A20055","#8C0044"],
          ["#FFCCCC","#FF8888","#FF3333","#FF0000","#CC0000","#AA0000","#880000",
          "#FFC8B4","#FFA488","#FF7744","#FF5511","#E63F00","#C63300","#A42D00"],
          ["#FFDDAA","#FFBB66","#FFAA33","#FF8800","#EE7700","#CC6600","#BB5500",
          "#FFEE99","#FFDD55","#FFCC22","#FFBB00","#DDAA00","#AA7700","#886600"],
          ["#FFFFBB","#FFFF77","#FFFF33","#FFFF00","#EEEE00","#BBBB00","#888800",
          "#EEFFBB","#DDFF77","#CCFF33","#BBFF00","#99DD00","#88AA00","#668800"],
          ["#CCFF99","#BBFF66","#99FF33","#77FF00","#66DD00","#55AA00","#227700",
          "#99FF99","#66FF66","#33FF33","#00FF00","#00DD00","#00AA00","#008800"],
          ["#BBFFEE","#77FFCC","#33FFAA","#00FF99","#00DD77","#00AA55","#008844",
          "#AAFFEE","#77FFEE","#33FFDD","#00FFCC","#00DDAA","#00AA88","#008866"],
          ["#99FFFF","#66FFFF","#33FFFF","#00FFFF","#00DDDD","#00AAAA","#008888",
          "#CCEEFF","#77DDFF","#33CCFF","#00BBFF","#009FCC","#0088A8","#007799"],
          ["#CCDDFF","#99BBFF","#5599FF","#0066FF","#0044BB","#003C9D","#003377",
          "#CCCCFF","#9999FF","#5555FF","#0000FF","#0000CC","#0000AA","#000088"],
          ["#CCBBFF","#9F88FF","#7744FF","#5500FF","#4400CC","#2200AA","#220088",
          "#D1BBFF","#B088FF","#9955FF","#7700FF","#5500DD","#4400B3","#3A0088"],
          ["#E8CCFF","#D28EFF","#B94FFF","#9900FF","#7700BB","#66009D","#550088",
          "#F0BBFF","#E38EFF","#E93EFF","#CC00FF","#A500CC","#7A0099","#660077"],
        ],
        moveStatus:false,  
        colorSelectorInitSite:{
          left : 0,
          top  : 0
        },       
        diffPoint : {
          x : 0,
          y : 0
        },   
      }
    },
    mounted(){
      this.init();
    },
    methods:{
      init(){
        let initStyle;
        let colorSelector = document.getElementsByClassName("colorSelector")[0];
        if (colorSelector.currentStyle) {
          initStyle = ector.currentStyle;
        }else {
          initStyle = document.defaultView.getComputedStyle(colorSelector,null);
        }
        this.colorSelectorInitSite.left = parseInt(initStyle.left.split('p')[0]);
        this.colorSelectorInitSite.top  = parseInt(initStyle.top.split('p')[0]);
      },
      chooseColor(color) {
        this.$emit("receiveColor",color,false);
        let colorSelector = document.getElementsByClassName("colorSelector")[0];
        colorSelector.style.left = this.colorSelectorInitSite.left;
        colorSelector.style.top = this.colorSelectorInitSite.top;
      },
      quitColorSelect() {
        this.$emit("receiveStatus",false);
        let colorSelector = document.getElementsByClassName("colorSelector")[0];
        colorSelector.style.left = this.colorSelectorInitSite.left;
        colorSelector.style.top = this.colorSelectorInitSite.top;
      },
      beginMove(event) {
        this.moveStatus = true;
        this.diffPoint.x = event.clientX - this.colorSelectorInitSite.left;
        this.diffPoint.y = event.clientY - this.colorSelectorInitSite.top;
      },
      moving(event) {
        if (this.moveStatus) {
          let colorSelector = document.getElementsByClassName("colorSelector")[0];
          colorSelector.style.left = (event.clientX - this.diffPoint.x)+"px";
          colorSelector.style.top = (event.clientY - this.diffPoint.y)+"px";
        }
      },
      endMove() {
        this.moveStatus = false;
        this.init();
      },
    }
  }
</script>

<style lang="scss" scoped>
.colorSelector {
  position: absolute;
    z-index: 2021;
    border: 1px solid #BFBFBF;
    width: 408px;
    height: 319px;
    top: 100px;
    left: 221px;
    background-color: white;
  .colorSelectorTitle {
    position: absolute;
    top: 2px;
    left: 4px;
  }
  .colorSelectorQuitBtn {
    position: absolute;
    display: block;
    left: 383px;
    top: 0px;
    font-size: 17px;
    text-align: center;
    width: 25px;
    height: 26px;
    &:hover {
      background-color: red;
    }
  }
  .colorTalbe {
    background-color: #EDEDED;
    position: absolute;
    top: 27px;
    left: 1px;
    z-index: 1;
      td{
        width: 20px;
        height: 20px;
        border: 1px solid #AAAAAA;
      }
  }
}
</style>

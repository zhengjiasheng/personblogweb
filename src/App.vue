<template>
  <div class="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss" scoped>
  .app {
    width : 100%;
    height: 100%
  }
</style>

<style lang="scss">
@import './styles/variables.scss';

html {
  height: 100%;
  margin: 0px;
  padding: 0px;
    ::-webkit-scrollbar {
      width   : 5px;
      height  : 10px;
      overflow: auto;
      position: absolute;
    }
    ::-webkit-scrollbar-thumb {
      background-color: #c5cbd5;
      min-height      : 25px;
      min-width       : 25px;
      border          : 1 solid rgba(0, 0, 0, .08);
      border-radius   : 50px;
    }
  }
body{
  height: 100%;
  margin: 0px;
  padding: 0px;
  overflow-x: hidden;
}
</style>
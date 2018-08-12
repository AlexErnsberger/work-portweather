<template>
  <div id="app">
    <div class="header">
        <img src="./assets/images/toback.png"  @click="goBack"/>
        <span>港口天气</span>
    </div>
    <div class="main">
      <keep-alive>
        <router-view></router-view>
      </keep-alive>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'App',
    created:function(){
      this.history_go_back();
    },
    methods:{
      goBack:function(){
         this.historyGoBack();
      }
    }
  }
</script>

<style>
</style>

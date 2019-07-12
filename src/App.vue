<template>
  <div id="app">
    <!--
      路由组件是动态的，默认情况下切换都会销毁重建，状态丢失
      如果想要在切换的时候保留状态，说白了不要销毁，则使用 keep-alive 缓存就可以了
      参考文档：https://cn.vuejs.org/v2/guide/components-dynamic-async.html
     -->
    <keep-alive>
      <router-view/>
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped></style>

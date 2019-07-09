<template>
  <div class="login-wrap">
    <!-- 头部 -->
    <van-nav-bar title="登录"/>

    <!-- 表单 -->
    <form>
      <van-cell-group>
        <van-field
          v-model="user.mobile"
          required
          clearable
          label="手机号"
          placeholder="请输入手机号"
        />

        <van-field
          v-model="user.code"
          type="password"
          label="密码"
          placeholder="请输入密码"
          required
        />
      </van-cell-group>

      <div class="login-btn-box">
        <van-button
          class="login-btn"
          type="info"
          :loading="loginLoading"
          loading-text="登录中..."
          @click.prevent="handleLogin"
        >登录</van-button>
      </div>
    </form>
  </div>
</template>

<script>
import { login } from '@/api/user'

export default {
  name: 'LoginIndex',
  data () {
    return {
      user: { // 提交登录的表单数据
        mobile: '18801185985',
        code: '123456'
      },
      loginLoading: false // 控制登录按钮的 loading 状态
    }
  },

  methods: {
    async handleLogin () {
      this.loginLoading = true
      try {
        const data = await login(this.user)

        this.$store.commit('setUser', data)

        /**
         * 这里先简单粗暴的跳转到首页
         * 真实的业务要处理成跳转到之前过来的的页面
         */
        // this.$router.push({
        //   name: 'home'
        // })
      } catch (err) {
        console.log(err)
        console.log('登录失败')
      }
      this.loginLoading = false
    }
  }
}
</script>

<style lang="less" scoped>
.login-btn-box {
  padding: 20px;
  .login-btn {
    width: 100%;
  }
}
</style>

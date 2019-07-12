<template>
  <div>
    <!-- 头部 -->
    <van-nav-bar title="首页" fixed/>
    <!-- /头部 -->

    <!-- 频道标签 -->
    <van-tabs class="channel-tabs" v-model="activeChannelIndex">
      <!-- 这种元素不受作用域影响 -->
      <div slot="nav-right" class="wap-nav" @click="isChannelShow = true">
        <van-icon name="wap-nav" />
      </div>
      <van-tab
        v-for="channelItem in channels"
        :key="channelItem.id"
        :title="channelItem.name"
      >
        <!--
          下拉刷新组件
          isLoading 控制下拉的 loading 状态
          refresh 下拉之后触发的事件
         -->
        <van-pull-refresh
          v-model="channelItem.pullRefreshLoading"
          @refresh="onRefresh"
          :success-text="channelItem.pullSuccessText"
          :success-duration="1000"
        >
          <!--
            loading 控制加载更多的 loading 状态
            finished 控制是否已加载结束
            onLoad 事件会在滚动到底部区域的时候自动调用，每次 onLoad 它会自动让 loading 为 true
          -->
          <van-list
            v-model="channelItem.upLoading"
            :finished="channelItem.finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <!--
              列表中的内容
            -->
            <van-cell
              v-for="item in channelItem.articles"
              :key="item.art_id"
              :title="item.title"
            />
          </van-list>
        </van-pull-refresh>
      </van-tab>
    </van-tabs>
    <!-- /频道标签 -->

    <!-- 底部导航 -->
    <van-tabbar route>
      <van-tabbar-item icon="home-o" to="/">首页</van-tabbar-item>
      <van-tabbar-item icon="search" to="/qa">问答</van-tabbar-item>
      <van-tabbar-item icon="friends-o" to="/video">视频</van-tabbar-item>
      <van-tabbar-item icon="setting-o" to="my">我的</van-tabbar-item>
    </van-tabbar>
    <!-- /底部导航 -->

    <!-- 频道组件 -->
    <!--
      :value="isChannelShow"
     -->
    <home-channel v-model="isChannelShow" />
    <!-- /频道组件 -->
  </div>
</template>

<script>
import { getUserChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import HomeChannel from './components/channel'

export default {
  name: 'HomeIndex',
  components: {
    HomeChannel
  },
  data () {
    return {
      channels: [],
      activeChannelIndex: 0,
      list: [],
      loading: false,
      finished: false,
      pullRefreshLoading: false,
      isChannelShow: false // 控制频道面板的显示状态
    }
  },

  computed: {
    activeChannel () {
      return this.channels[this.activeChannelIndex]
    }
  },

  watch: {
    /**
     * 监视容器中的 user 的状态，只要 user 发生改变，那么就重新获取频道列表
     * 注意：凡是能 this. 点儿出来的东西都可以被监视
     */
    async '$store.state.user' () {
      // console.log('user 改变了')

      // 重新加载频道数据
      await this.loadChannels()

      // 由于重新加载了频道数据，所以文章内容也都被清空了
      // 而且上拉加载更多的 onLoad 没有主动触发。

      // 我们这里可以手动的触发上拉加载更多的 onLoad
      // 提示：只需要将当前激活频道的上拉 loading 设置为 true，它会自动调用自己的 onLoad 函数
      // 注意：这里肯定是有别的东西影响了，没有自动调用 onLoad
      this.activeChannel.upLoading = true

      // 正常的话上面设置 loading 之后，组件会自动去 onLoad
      // 这里它没有自己 onLoad，那我们就自己手动的 onLoad 以下。
      this.onLoad()
    }
  },

  async created () {
    console.log('组件重新 created 渲染了')
    // 加载频道列表
    await this.loadChannels()

    // 初始加载第1项频道的数据列表
    // 注意：务必在记载频道之后
    // this.loadArticles()
  },

  methods: {
    /**
     * 上拉加载更多，应该往频道的 articles 中最后 push 数据
     * onLoad 一上来就会自动调用，当请求的数据不够一屏的时候，它会多次调用
     * onLoad 会自动开启加载 loading 效果
     */
    async onLoad () {
      await this.$sleep(800)

      const articles = await this.loadArticles()

      // 将请求得到的数据放入频道文章列表中
      this.activeChannel.articles.push(...articles)

      // 数据加载好以后，让 loading 结束
      this.activeChannel.upLoading = false
    },

    /**
     * 下拉刷新
     */
    async onRefresh () {
      // 获取最新数据
      const data = await getArticles({
        channelId: this.activeChannel.id,
        timestamp: Date.now(),
        withTop: 1
      })

      // 如果有最新数据
      if (data.results.length) {
        // 将最新数据重置到当前频道
        this.activeChannel.articles = data.results
        this.activeChannel.timestamp = data.pre_timestamp

        this.activeChannel.pullSuccessText = '更新完成'

        // 因为最新数据无法撑满一页，所以使用加载更多再请求一次
        this.onLoad()
      }

      this.activeChannel.pullSuccessText = '暂无数据更新'

      // 无论如何，最后都关闭加载状态
      this.activeChannel.pullRefreshLoading = false
    },

    async loadChannels () {
      let channels = []
      // 1. 得到频道数据
      const { user } = this.$store.state

      // 如果已登录，则请求用户频道列表
      if (user) {
        channels = (await getUserChannels()).channels
      } else {
        // 如果没有登录
        // 判断是否有本地存储的频道列表
        const localChannels = JSON.parse(window.localStorage.getItem('channels'))
        // 如果有，则使用
        if (localChannels) {
          channels = localChannels
        } else {
          // 如果没有，则请求获取推荐的默认频道列表
          channels = (await getUserChannels()).channels
        }
      }

      // 2. 扩展频道数据满足其他业务需求
      channels.forEach(item => {
        item.articles = [] // 频道的文章
        item.timestamp = Date.now() // 用于下一页频道数据的时间戳
        item.finished = false // 控制该频道上拉加载是否已加载完毕
        item.upLoading = false // 控制该频道的下拉刷新 loading
        item.pullRefreshLoading = false // 控制频道列表的下拉刷新状态
        item.pullSuccessText = '' // 控制频道列表的下拉刷新成功提示文字
      })

      this.channels = channels
    },

    // async loadChannels () {
    //   try {
    //     let channels = []

    //     const localChannels = window.localStorage.getItem('channels')

    //     // 如果有本地存储的频道列表，则使用本地的
    //     if (localChannels) {
    //       channels = localChannels
    //     } else {
    //       channels = (await getUserChannels()).channels
    //     }

    //     // 对频道中的数据统一处理以供页面使用
    //     channels.forEach(item => {
    //       item.articles = [] // 频道的文章
    //       item.timestamp = Date.now() // 用于下一页频道数据的时间戳
    //       item.finished = false // 控制该频道上拉加载是否已加载完毕
    //       item.upLoading = false // 控制该频道的下拉刷新 loading
    //       item.pullRefreshLoading = false // 控制频道列表的下拉刷新状态
    //       item.pullSuccessText = '' // 控制频道列表的下拉刷新成功提示文字
    //     })

    //     this.channels = channels
    //   } catch (err) {
    //     console.log(err)
    //   }
    // },

    async loadArticles () {
      // 频道、时间戳
      const { id: channelId, timestamp } = this.activeChannel
      try {
        const data = await getArticles({
          channelId,
          timestamp,
          withTop: 1
        })

        // 如果没有最新数据，则请求上一次的数据
        if (data.pre_timestamp && data.results.length === 0) {
          // 将最近的推荐数据请求的时间戳更新到频道中
          this.activeChannel.timestamp = data.pre_timestamp
          return this.loadArticles()
        }

        if (data.results.length) {
          this.activeChannel.timestamp = data.pre_timestamp
          return data.results
        }
      } catch (err) {
        console.log(err)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.channel-tabs {
  margin-bottom: 100px;
}

// /deep/ 的作用（深度作用选择器）
// 参考文档：https://vue-loader.vuejs.org/zh/guide/scoped-css.html#%E6%B7%B1%E5%BA%A6%E4%BD%9C%E7%94%A8%E9%80%89%E6%8B%A9%E5%99%A8
// 注意：你在页面上测量的是设备像素，我们的样式规则转换是基于 75 进行转换的，所以在这里写的时候都 * 2
.channel-tabs /deep/ .van-tabs__wrap {
  position: fixed;
  top: 92px;
}

.channel-tabs /deep/ .van-tabs__content {
  margin-top: 92px;
}

.channel-tabs .wap-nav {
  position: sticky;
  right: 0;
  display: flex;
  align-items: center;
  background: #fff;
  opacity: .7;
}
</style>

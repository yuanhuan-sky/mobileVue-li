<template>
  <!--
    v-model 是：
      v-bind:value="数据"
      v-on:input="数据 = $event"
    lazy-render 关闭懒加载
   -->
  <van-popup
    :value="value"
    @input="$emit('input', $event)"
    position="bottom"
    get-container="body"
    :style="{ height: '95%' }"
  >
    <!-- 我的频道 -->
    <div class="channel">
      <div class="channel-head">
        <div>
          <span class="title">我的频道</span>
          <span class="desc">点击进入频道</span>
        </div>
        <div>
          <van-button
            type="danger"
            plain
            size="mini"
            @click="isEdit = !isEdit"
          >{{ isEdit ? '完成' : '编辑' }}</van-button>
        </div>
      </div>
      <van-grid class="channel-content" :gutter="10" clickable>
        <van-grid-item
          v-for="(item, index) in userChannels"
          :key="item.id"
          @click="handleUserChannelClick(item, index)"
        >
          <span
            class="text"
            :class="{ active: index === activeIndex && !isEdit }"
          >{{ item.name }}</span>
          <van-icon class="close-icon" v-show="isEdit" name="close" />
        </van-grid-item>
      </van-grid>
    </div>
    <!-- /我的频道 -->

    <!-- 推荐频道 -->
    <div class="channel">
      <div class="channel-head">
        <div>
          <span class="title">频道推荐</span>
          <span class="desc">点击添加频道</span>
        </div>
      </div>
      <van-grid class="channel-content" :gutter="10" clickable>
        <van-grid-item
          v-for="item in recommendChannels"
          :key="item.id"
          @click="handleAddChannel(item)"
        >
          <div class="info">
            <span class="text">{{ item.name }}</span>
          </div>
        </van-grid-item>
      </van-grid>
    </div>
    <!-- /推荐频道 -->
  </van-popup>
</template>

<script>
import { getAllChannels } from '@/api/channel'

export default {
  name: 'HomeChannel',

  props: {
    value: {
      type: Boolean,
      default: false
    },
    userChannels: {
      type: Array,
      default: () => []
    },
    activeIndex: {
      type: Number,
      default: 0
    }
  },

  data () {
    return {
      allChannels: [],
      isEdit: false
    }
  },

  computed: {
    /**
     * 该计算属性用于处理获取推荐数据（也就是不包含用户频道列表的其它所有频道列表）
     * 计算属性其实也拥有 watch 的功能，但它的作用是用于当数据改变之后重新计算返回一些数据供我们使用
     */
    recommendChannels () {
      // 拿到所有重复的数据 id
      const duplicates = this.userChannels.map(item => item.id)
      return this.allChannels.filter(item => !duplicates.includes(item.id))
    }
  },

  created () {
    this.loadAllChannels()
  },

  methods: {
    async loadAllChannels () {
      try {
        const data = await getAllChannels()

        // 将获取到的频道数据统一处理成我们需要的数据格式
        data.channels.forEach(item => {
          item.articles = [] // 频道的文章
          item.timestamp = Date.now() // 用于下一页频道数据的时间戳
          item.finished = false // 控制该频道上拉加载是否已加载完毕
          item.upLoading = false // 控制该频道的下拉刷新 loading
          item.pullRefreshLoading = false // 控制频道列表的下拉刷新状态
          item.pullSuccessText = '' // 控制频道列表的下拉刷新成功提示文字
        })

        this.allChannels = data.channels
      } catch (err) {
        console.log(err)
      }
    },

    handleAddChannel (item) {
      // userChannels 是 props 数据
      // props 数据有个原则：单向数据流
      //    数据只受父组件影响，但是反之不会
      //    但是引用类型除外
      //    即便是这样：也最好不要利用这个特点
      // 建议做法就是将数据传递给父组件，让组件自己去修改
      // this.userChannels.push(item)

      // 截取一个新的数组，操作这个数组，操作结束将结果传递给父组件，让父组件自己去修改
      // 始终记住一个原则：Props 数据是单向的，不要在子组件中修改它，始终由父组件去修改从而影响它
      const channels = this.userChannels.slice(0)
      channels.push(item)
      this.$emit('update:user-channels', channels)

      const { user } = this.$store.state

      // 如果登录已登录，则请求添加用户频道
      if (user) {
      } else {
        // 如果没有登录，则添加到本地存储
        // 没有就创建，有的直接覆盖
        // 注意：本地存储数据无法像 js 数据变量去修改，要想改变只能完全重写
        window.localStorage.setItem('channels', JSON.stringify(channels))
      }
    },

    handleUserChannelClick (item, index) {
      // 如果是非编辑状态，则是切换 tab 显示
      if (!this.isEdit) {
        this.$emit('update:active-index', index)
        this.$emit('input', false)
        return
      }

      // 如果是编辑状态，则是删除操作
      const channels = this.userChannels.slice(0)
      channels.splice(index, 1)
      this.$emit('update:user-channels', channels)

      const { user } = this.$store.state

      // 如果用户登录登录，则请求删除
      if (user) {
        return
      }

      // 如果用户没有登录， 则将数据保存到本地存储
      window.localStorage.setItem('channels', JSON.stringify(channels))
    }
  }
}
</script>

<style lang="less" scoped>
.channel {
  .channel-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 10px;
    .title {
      font-size: 30px;
      margin-right: 5px;
    }
    .desc {
      font-size: 12px;
    }
    .action {}
  }
  .channel-content {
    .text {
      font-size: 24px;
    }
    .active {
      color: red;
    }
    .close-icon {
      font-size: 40px;
      position: absolute;
      top: -5px;
      right: -5px;
      z-index: 999;
      background-color: #fff;
    }
    .info {
      display: flex;
      align-items: center;
    }
  }
}
</style>

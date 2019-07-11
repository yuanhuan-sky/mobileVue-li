/**
 * 文章相关接口封装模块
 */
import request from '@/utils/request'

export const getArticles = ({
  channelId, // 频道
  timestamp, // 时间戳，用于获取分页数据
  withTop // 是否置顶
}) => {
  return request({
    method: 'GET',
    url: '/app/v1_1/articles',
    params: {
      channel_id: channelId,
      timestamp,
      with_top: withTop
    }
  })
}

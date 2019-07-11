/**
 * 频道相关接口封装模块
 */
import request from '@/utils/request'

/**
 * 获取用户频道列表
 * 如果没有登录则返回默认推荐的频道列表
 * 如果登录了，则返回用户频道列表
 */
export const getUserChannels = () => {
  return request({
    method: 'GET',
    url: '/app/v1_0/user/channels'
  })
}

/**
 *
 * 重置用户频道列表
 */
export const resetUserChannels = channels => {
  return request({
    method: 'PUT',
    url: '/app/v1_0/user/channels',
    data: {
      channels
    }
  })
}

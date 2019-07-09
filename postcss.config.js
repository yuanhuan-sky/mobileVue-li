/**
 * 注意：当前文件是 Node.js 执行的，只能写 Node.js代码
 * post-css 是一个后处理器
 * 说白了就是你与预处理 less、sass 处理之后的 css 再进一步处理
 * 该文件是 post-css 的配置文件
 * 它有很多插件：
 *  autoprefixer 用来处理样式兼容前缀用的，你不用写兼容前缀
 *  postcss-pxtorem 用来将 px 转 rem 用的
 */
// const { sep } = require('path')

/**
 * 如果是 vant 的样式，则基于 37.5 去转（因为 vant 是基于 375 设备像素写的）px 像素
 * 如果是我们自己的，则基于 75 基准值去转换
 * 转换工具以样式文件为单位进行转换的
 * 每一个文件的转换都要调用这个函数，我们可以在这里为不同的文件设置不同的转换规则
 * file：文件信息对象
 *  dirname 也就是当前文件的目录路径
 *
 */
const { sep } = require('path')

module.exports = ({ file }) => {
  // path.sep 用于获取操作系统的路径分隔符
  const rootValue = file.dirname.indexOf(`node_modules${sep}vant`) !== -1
    ? 37.5 // vant 转换的基准值
    : 75 // 我们的设计稿转换的基准值

  return {
    plugins: {
      autoprefixer: {},
      'postcss-pxtorem': {
        rootValue,
        propList: ['*']
      }
    }
  }
}

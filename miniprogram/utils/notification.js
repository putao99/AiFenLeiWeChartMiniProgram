/**
 * notification
 * 缓存消息模块ID，处理小红点(未读、已读)，删除会引起该功能失效
 */

//初始化
function init(){
  let key = '__sl_notification'
  let __sl_notification_default = {
    version: '1.0.0',
    desc: '缓存消息模块ID，处理小红点(未读、已读)，删除会引起该功能失效',
    communityMessage: [],
    recoveryMessage: [],
    feedbackMessage: [],
    sysMessage: []
  }
  let __sl_notification = wx.getStorageSync(key)
  if (!__sl_notification) {
    wx.setStorageSync(key, __sl_notification_default)
  }
}

//更新已读
function add(type, notification){
  let key = '__sl_notification'
  let __sl_notification = wx.getStorageSync(key)
  if (!__sl_notification) return 
  __sl_notification[type].add(notification)
  wx.setStorageSync(key, __sl_notification)
}

//是否已读
function isReaded(type,id){
  let key = '__sl_notification'
  let __sl_notification = wx.getStorageSync(key)
  if (!__sl_notification) return false 
  return __sl_notification[type].filter(item => item.id === id).length > 0 ? true : false
}

//清理消息缓存
function clear(){
  let key = '__sl_notification'
  try{
    wx.removeStorageSync(key)
  }catch(err){

  }
}

//测试用
function display(){
  let key = '__sl_notification'
  let __sl_notification = wx.getStorageSync(key)
  console.log(JSON.stringify(__sl_notification,null,'\t'))
}

module.exports = {
  init,
  add,
  isReaded,
  clear,
  display
}
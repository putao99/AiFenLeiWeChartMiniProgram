
//获取应用实例  
var app = getApp()
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的初始数据
   */
  data: {
    isShow: false,
    showContent: ""
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //展示
    showView(showContent) {
      var that = this;
      that.setData({
        isShow: true,
        showContent: showContent
      });
      setTimeout(function () {
        that.setData({ isShow: false })
      }, 3000)
    },

  }


});

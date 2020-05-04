
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    title: {
      type: String,
      value: '提示'
    },
    istrue:{
      type:Boolean,
      value:false
    },
    primaryText:{ //主按钮文字
      type:String,
      value:'确定'
    },
    cancelText:{ //关闭按钮文字
      type: String,
      value: '取消'
    },
    showCancel: {//是否显示关闭按钮
      type:Boolean,
      value: true
    } 
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    closeDialog: function (event) {
      let _from = event.currentTarget.dataset.from
      this.triggerEvent('closeDialog', { from: _from})
    }
  },
  lifetimes: {
    ready: function () {
    }
  }
})

// components/tab-slider/tab-slider.js


Component({
  options:{
    multipleSlots: true,
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    tagList:{
      type:Array,
      value: []
    },
    currentIndex:{
      type:Number,
      value:0
    },
    height:{
      type: Number,
      value: 300
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    moveBarWidth: 0,
    moveBarTransform:0,
    eventType:'transition'
  },

  /**
   * 组件的方法列表
   */
  methods: {
    tagIndexChange:function(event){
      let _index = event.currentTarget.dataset.index
      this.setData({
        currentIndex: _index,
        eventType: event.type
      })
    },
    swiperChange:function(event){
    },
    transitionChange:function(event){
      //直接点击tab 也会触发此事件 需要过滤掉
      if (this.data.eventType !== event.type) return
      let w = ((this.data.currentIndex) * this.data.moveBarWidth) + (event.detail.dx * this.data.moveBarWidth / this.data.width)
      this.setData({ moveBarTransform:w})
    },
    animationfinishHandler:function(event){
      if (event.type === 'animationfinish'){
        //直接点击tab 直接设置滑动条距离
        if (this.data.eventType === 'tap') {
          this.setData({
            currentIndex: event.detail.current,
            moveBarTransform: event.detail.current * this.data.moveBarWidth,
            eventType: 'transition'
          })
        }else{
          this.setData({ currentIndex: event.detail.current })
        }
        wx.nextTick(() => this.tagChangeAction())
      }
    },
    scrolltolowerHandler:function(event){
      let myEventDetail = {
        index: this.data.currentIndex
      }
      this.triggerEvent('scrolltolower', myEventDetail)
    },
    scrolltoupperHandler: function (event) { 
      let myEventDetail = {
        index: this.data.currentIndex
      }
      this.triggerEvent('scrolltoupper', myEventDetail)
    },
    scrollHandler: function (event) { 

    },
    tagChangeAction: function () {
      let myEventDetail = {
        index: this.data.currentIndex
      }
      this.triggerEvent('tagChangeAction', myEventDetail)
    }
  },
  lifetimes:{
    ready:function(){
      const query = this.createSelectorQuery()
      var that = this;
      query.select('.tab-slider-hd').boundingClientRect(function (rect) {
        that.setData({ 
          width: rect.width,
          moveBarWidth: rect.width / that.data.tagList.length
        })
      }).exec();

      wx.nextTick(() => this.tagChangeAction())
    }
  }
  
})

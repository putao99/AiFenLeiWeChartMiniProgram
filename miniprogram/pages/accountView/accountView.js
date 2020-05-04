
const accounting = require('../../utils/accounting.min.js')
const debounce = require('../../utils/debounce.js')
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showTips:false,
    customerCountScore:0,
    negativeScore:0,
    positiveScore:0,
    busModel:0,
    filterData:[
      {
        key: 'idVOList',
        name: '选择类型',
        id: 0,
        state: 'up',
        data: []
      },
      {
        key: 'customers',
        name: '请选择人员',
        id: 0,
        state: 'up',
        data: []
      }
    ],
    filterbdHeight:0,
    filterbdData:[],
    selected:[],
    filterBdTop:0,
    contentHeight:0,
    subDataList:{
      pageNum:1,
      pageSize:10,
      noMore:false,
      noData:false,
      filterStr:'',
      data:[]
    },
    scrolltop: 0,
    scrollDebouncedHandler:null
  },
  filterItemTap:function(event){
    
    if (this.checkFilter()) return

    wx.nextTick(() => {
      let index = event.currentTarget.dataset.index
      let item = this.data.filterData[index]
      item.state = item.state === 'up' ? 'down' : 'up'

      this.setData({
        filterData: this.data.filterData,
        filterbdData: item.state === 'up' ? [] : item,
        filterbdHeight: item.state === 'up' ? 0 : 200,
        showTips:true
      })
    })



  },
  checkFilter:function(){
    let hasDown = false
    let filterData = this.data.filterData.map((item) => {
      if (item.state === 'down') {
        item.state = 'up'
        hasDown = true
      }
      return item
    })
    if (hasDown){
      this.setData({
        filterData: filterData,
        filterbdData: [],
        filterbdHeight: 0,
        showTips:false
      })
    }
    return hasDown
  },
  selectedItem:function(event){
    if(event.type !== 'tap') return 
    let key = event.currentTarget.dataset.key
    let index = Number(event.currentTarget.dataset.index)

    let filterData = this.data.filterData
    let typeIndex = filterData.findIndex(t => t.key === key)
    if(typeIndex >= 0){
      filterData[typeIndex].data.forEach((item,_index,arr) =>{
        item.selected = _index == index ? true : false
      })

      if (key === 'idVOList'){
        filterData[typeIndex].name = filterData[typeIndex].data[index].title
        filterData[typeIndex].id = filterData[typeIndex].data[index].id
      }else{
        filterData[typeIndex].name = filterData[typeIndex].data[index].nick
        filterData[typeIndex].id = filterData[typeIndex].data[index].id
      }
      


      this.setData({ filterData: filterData})

      wx.nextTick(() => this.checkFilter())
    }


    this.fetchSubData()
    // let selectedItems = this.getSelectedItems()
    // console.log(selectedItems)
  },
  getSelectedItems:function(){
    let result = {}
    let keyMap = {'customers':'user','idVOList':'status'}
    this.data.filterData.map(item =>{
      let {name,id,key} = item
      result[keyMap[key]] = { name, id, key }
    })
    return result
  },
  fetchData:function(){
    let that = this
    let baseUrl = app.appData.url
    let url = 'appHome/newGetScore'
    let fullUrl = `${baseUrl}${url}`

    wx.showLoading({title: '加载中...'})
    wx.request({
      url: fullUrl,
      data: {
        customerId: app.appData.userinfo.customerId,
        isWx: 1
      },
      success(res) {
        if (res.statusCode !== 200) {
          console.error('请求失败 url:' + fullUrl)
          return
        }
        let result = res.data
        if (result.errcode === 0) {
          //console.log(result)
          let { 
            customerCountScore, 
            negativeScore, 
            positiveScore,
            customers,
            idVOList
          } = result.data

          let filterData = that.data.filterData.map((item) =>{
            if (item.key === 'customers'){
              if (customers.length > 0){
                item.data = customers.map(customer => {
                  customer.selected = false
                  return customer
                })
                item.name = customers[0].nick
                item.id = customers[0].id
              }
            } else if (item.key === 'idVOList'){
              if (idVOList.length > 0) {
                item.data = idVOList.map(vo => {
                  vo.selected = false
                  return vo
                })
                item.name = idVOList[0].title
                item.id = idVOList[0].id
              }
            }
            return item
          })
          that.setData({
            filterData: filterData,
            customerCountScore: accounting.formatNumber(customerCountScore),
            negativeScore: accounting.formatNumber(negativeScore),
            positiveScore: accounting.formatNumber(positiveScore)
          })

          wx.nextTick(() =>{
            //console.log(that.data)
            that.fetchSubData()
          })
        } else {
          
        }
      },
      fail: function () {

      },
      complete: function () {
        wx.hideLoading()
      }
    })
  },
  fetchSubData:function(){
    let that = this
    let baseUrl = app.appData.url
    let url = 'appHome/newGetScoreListDetail'
    let fullUrl = `${baseUrl}${url}` 
    let { user:{id:userid}, status:{id:statusid} } = this.getSelectedItems()
    //console.log(userid, statusid)

    let filterStr = `${userid},${statusid}`

    let subDataList = that.data.subDataList

    let pageNum = that.data.subDataList.pageNum
    if (subDataList.filterStr.length === 0){
      subDataList.filterStr = filterStr
    }
    
    if (subDataList.filterStr === filterStr) {
      if (subDataList.noData || subDataList.noMore) return
    }

    if (subDataList.filterStr !== filterStr){
      that.setData({
        scrolltop:0,
        subDataList: {
          pageNum: 1,
          pageSize: 10,
          noMore: false,
          noData: false,
          filterStr: filterStr,
          data: []
        }
      })
    }


    wx.nextTick(() =>{
      pageNum = that.data.subDataList.pageNum
      //wx.showLoading({ title: '加载中...' })
      wx.request({
        url: fullUrl,
        data: {
          customerId: app.appData.userinfo.customerId,
          pageNum: pageNum,
          user: userid,
          status: statusid,
          isWx: 1
        },
        success(res) {
          if (res.statusCode !== 200) {
            console.error('请求失败 url:' + fullUrl)
            return
          }
          let result = res.data
          if (result.errcode === 0) {

            wx.nextTick(() =>{
              let subDataList = that.data.subDataList

              //大于零的积分 前面 添加 "+" 号
              let _resultData = result.data.map(item => {
                if (item.getScore > 0){
                  item.getScore = `+${item.getScore}`
                }
                if (item.sourceId === 4){
                  //item.title = `${item.title} ${item.weight === null ? '0' : item.weight }`
                  item.title = `${item.title}`
                }
                if (item.sourceId === 6){
                  item.title = '上门回收预约结算'
                }
                //处理 积分来源 icon
                item.iconPath = that.getIcon(item.sourceId)
                return item
              })

              subDataList.data = subDataList.data.concat(_resultData)

              if (result.data.length === 0 && subDataList.pageNum === 1) {
                subDataList.noData = true
              }
              
              if (result.data.length < subDataList.pageSize){
                subDataList.noMore = true
              }

              if (subDataList.noMore && pageNum > 1){
                wx.showToast({
                  title: '没有更多数据了',
                  icon: 'none',
                  duration: 2000
                })
              }



              wx.nextTick(() =>{
                that.setData({ subDataList: subDataList }) 
                // console.log(that.data.subDataList)

                // subDataList.data.map(item =>{
                //   console.log(`${item.title} - ${item.sourceId} - ${item.getScore} - ${item.date} - ${item.name}`)
                // })
              })
            })
            
          } else {

          }
        },
        fail: function () {

        },
        complete: function () {
          wx.hideLoading()
        }
      })

    })
  },
  scrolltolowerHandler:function(event){
    if (event.type !== 'scrolltolower') return 
    let subDataList = this.data.subDataList

    //subDataList.scrolltop = event.currentTarget.offsetTop
    subDataList.pageNum ++ 
    this.setData({ subDataList: subDataList})

    wx.nextTick(() =>{
      this.fetchSubData()
    })
  },
  scrollHandler:function(event){
    //this.data.scrollDebouncedHandler(event.detail.scrollTop)
    // if (this.data.scrollHandler === null){
    //   this.data.scrollHandler = setTimeout(function(){

    //   },100)
    // }
    // wx.nextTick(() => this.setData({ scrolltop: event.detail.scrollTop }))
    
  },
  getIcon:function(type){
    let basePath = '../../images/'
    let defaultIcon = basePath+'icon_rgkc@3x.png'
    let iconMap = {
      1: basePath+'icon_toudi@3x.png',
      2: basePath+'icon_duihuan@3x.png',
      3: basePath+'icon_rgkc@3x.png',
      5: basePath+'icon_duihuan@3x.png',
      6: basePath+'icon_smhs@3x.png',
      7: basePath+'icon_tixian@3x.png',
      8: basePath+'icon_ddqxth@3x.png'
    }
    return iconMap[type] ? iconMap[type] : defaultIcon
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (!wx.getStorageSync('isLogined')) {    // 如果未登陆
      wx.navigateTo({ url: "../login/login" })
      return
    }

    let that = this

    // this.setData({
    //   scrollDebouncedHandler: debounce(function (scrollTop){
    //     wx.nextTick(() => that.setData({ scrolltop: scrollTop }))
    //   }, 300)
    // })

    if (options.busModel) { //提现按钮控制
      this.setData({ busModel: options.busModel})
    }

    this.fetchData() //获取页面数据

    const query = this.createSelectorQuery()
    query.select('#top-main').boundingClientRect(function (rect) {
      that.setData({ filterBdTop: rect.height})  //初始化过滤条位置
      let sysInfo = wx.getSystemInfoSync()
      
      wx.getSystemInfo({
        success: function (res) {
          that.setData({ contentHeight: res.windowHeight - rect.height})
        },
      })

    }).exec();
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  gotoWallet: function () {
    wx.navigateTo({
      url: '/pages/wallet/wallet',
    })
  },
})
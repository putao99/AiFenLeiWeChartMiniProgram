// pages/myCourse/myCourse.js
// import * as DateTimeUtil from '../../utils/dateTime.js';
var app = getApp();
// var SystemConstant = require('../../utils/SystemConstant.js');
// var AjaxUtil = require('../../utils/AjaxUtil.js');
// var CommonUtil = require('../../utils/CommonUtil.js');
// var currentDate = DateTimeUtil.getCurrentDateTime('yyyy-MM-dd');
// var startDate = DateTimeUtil.formatTimestamp(Date.now() - (30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    hideBottom: true,
    now: 0,
    height: '',
    list: [],
    allPages: 0, //总页数
    currentPage: 1, // 当前选中页
    // 总条数
    total: 0,
    hasMoreData: false, // 是否有更多数据
    isLoading: true, // 是否加载中,
    // 当前日期
    // currentDate: currentDate,
    // 开始日期
    // startDate: startDate,
    // 结束日期
    // endDate: currentDate,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (ops) {
    let self = this;
    let now = this.data.now || 0;
    let mark = parseInt(ops.mark || now);
    // 避免初始化函数执行两次
    if(now === mark) {
      wx.showNavigationBarLoading();   //在当前页面显示导航条加载动画
      self.getListBypage(1);
    } else {
      self.setData({
        now: mark
      });
    }
  },
  onShow() {
   
  },
  // 滚动触底事件
  loadMore(e) {
    var self = this;
    // 当前页是最后一页
    if (!self.data.hasMoreData) {
      self.setData({
        hasMoreData: false,
        hideBottom: false,
        isLoading: false
      })
      return false;
    }
    var currentPage = self.data.currentPage;
    currentPage = currentPage + 1;
    self.setData({
      currentPage: currentPage,
      isLoading: true
    })
    self.getListBypage(currentPage);
  },
  /**
   * 获取列表分页数据
   */
  getListBypage(currentPage, callback){
     let {
      now,
      list,
      hideBottom,
      hasMoreData,
      allPages,
      isLoading,
      startDate,
      endDate,
    } = this.data;
    var requestUrl = SystemConstant.API_SERVER_URL + '/member/subject/memberCourseList.htm';
    var courseStatus = parseInt(now)+parseInt(1);
    var postData = {
      'pageResult.currentPage': currentPage,
      'pageResult.pageSize': SystemConstant.PAGE_SIZE,
      'condition.courseStatus': courseStatus,
    };
    if(now === 1) {
      postData['condition.startTime'] = startDate + ' 00:00:00';
      postData['condition.endTime'] = endDate + ' 00:00:00';
    }
    // 此处重新赋值为了防止嵌套的代码接收不到this
    var that = this;
    AjaxUtil.post(requestUrl, postData,
      (res) => {
        if (res.status !== "SUCCESS") {
          wx.showModal({
            title: '提示',
            content: '加载数据失败',
            showCancel: false,
            confirmColor: '#333',
            confirmText: '知道了'
          })
          return false;
        }
        let resultData = res.data;
        // 验证是否为第一页
        if (currentPage === 1) {
          // list = resultData.pageResult.resultList;
          list = resultData.pageResult.resultList.map(item => {
            return {
              ...item,
              startDate: DateTimeUtil.formatTimestamp(item.startDate, 'MM月dd日'),
              startTime: DateTimeUtil.formatTimestamp(item.startTime, 'HH:mm'),
              endTime: DateTimeUtil.formatTimestamp(item.endTime, 'HH:mm'),
            };
          });
        } else {
          list = list.concat(resultData.pageResult.resultList);
        }

        var allPages = resultData.pageResult["pageResult.allPages"];
        var total = resultData.pageResult["pageResult.rows"];
        if (allPages === 0) {    // 返回数据为空
          hideBottom = true;    // 不展示‘我是有底线的’
          hasMoreData = false;    // 不展示‘努力加载数据中...’
        } else {
          if (currentPage === allPages) {    // 如果是最后一页
            // hideBottom = (currentPage === 1) ? true : false;
            hideBottom = false;
            hasMoreData = false;
          } else {
            hideBottom = true;
            hasMoreData = true;
          }
        }
        that.setData({
          list: list,
          isLoading: false,
          hideBottom: hideBottom,
          hasMoreData: hasMoreData,
          currentPage: currentPage,
          allPages: allPages,
          total: total,

        });
      },
      (error) => {
        wx.showModal({
          title: '提示',
          content: '加载数据异常',
          showCancel: false,
          confirmColor: '#333',
          confirmText: '知道了'
        })
      },
      (complete) => {
        wx.hideLoading();
        wx.hideNavigationBarLoading();
        callback && callback();
      }
    );
  },
  /**
   * 点击tab标签页
   */
  onTabTap(e) {
    var that = this;
    let { current } = e.currentTarget.dataset
    if (this.data.now === current) {
      return false;
    } else {
      that.setData({
        now: current,
        startDate: startDate,
      })
    }
  },
  /**
   * 左右滑动切换标签页处理函数
   */
  onSwiperChange(e) {
    wx.showNavigationBarLoading();
    this.setData({
      now: e.detail.current,
      startDate: startDate,
      hideBottom: true,
      list: [],
      currentPage: 1, // 当前选中页
      hasMoreData: false, // 是否有更多数据
      isLoading: true, // 是否加载中
    })
    this.getListBypage(1);
  },
  onDetail(e) {
    let { id, courseId} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/pages/getCourse/getCourse?mark=' + 1 + '&id=' + e.currentTarget.dataset.id + '&courseId=' + courseId,
    })
  },
  onTeacher(e) {
    wx.navigateTo({
      url: '/pages/teacher/teacherDetail/teacherDetail?teacherId=' + e.currentTarget.dataset.id, 
      // appProductsExchange/ListExchangeGoods
    })
  },
  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    // wx.showNavigationBarLoading();
    this.getListBypage(1, () => {
      wx.stopPullDownRefresh();
    });
  },
  /**
   * 日期筛选 选择开始日期
   */
  startDateChange(event) {
    let { value } = event.detail;
    this.setData({
      startDate: value
    });
    this.getListBypage(1);

  },
  /**
   * 日期筛选 选择结束日期
   */
  endDateChange(event) {
    let { value } = event.detail;
    this.setData({
      endDate: value
    });
    this.getListBypage(1);

  },
})
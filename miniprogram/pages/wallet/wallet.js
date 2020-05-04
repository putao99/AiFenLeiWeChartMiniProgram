var app = getApp();
var util = require('../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    username: null,
    Score: 0,   //积分余额
    openid: '',
    nick: '',
    withDrawTxt: '提现', //提现按钮文字
    disabled: false, //提现按钮是否可用
    loading: false, //提现按钮是否显示loading...
    delay: 3, //支付成功后 多少秒后 出现支付结果
    cashCheckHandler: null,
    showTips: false, //提现loading...
    flag: true,
    WithdrawalAmount: 0,
    pageNum: 1,
    hiddenmodalput: true,
    cashAmount: 1,
    list_inner: 'list_inner',
    moneyMin:0,
    moneyMax:0,
    res:{
      "id":1,
      "orgId":2,
      "moneyMax":19500,
      "moneyMin":250,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //console.log(util)
    var that = this;
    if (!wx.getStorageSync('isLogined')) { // 如果未登陆
      wx.navigateTo({
        url: "../login/login"
      })
    } else {
      app.appData.userinfo = wx.getStorageSync('userinfo');
      this.setData({
        username: app.appData.userinfo.username
      })

      var userName = this.data.username

      wx.showLoading({
        title: '加载中...'
      })
      wx.request({
        url: app.appData.url + '/weChatApplet/chatCustCast',
        data: {
          userName: userName
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          that.setData({
            Score: res.data.data.score,
            WithdrawalAmount: res.data.data.score / 100
          })
        },
        fail() {
          console.log('请求数据失败。。。。。')
        },
        complete: function () {
          wx.hideLoading()
        }
      })
      that.startCheckStatus()
      that.setData({
        username: app.appData.userinfo.username
      });
      var userName = that.data.username;
      wx.showToast({
        title: "加载中...",
        icon: "loading"
      })
      that.getList((callback) => {
        var that = this;
        var {
          pageNum,
          phone
        } = this.data;
        console.log('当前页码数pageNum:' + pageNum)
        wx.request({
          url: app.appData.url + 'weChatApplet/wxChatCostDatil',    //提现记录接口
          data: {
            pageNum: pageNum,
            phone: app.appData.userinfo.username
          },
          header: {
            'content-type': 'application/json' // 默认值
          },
          success(res) {
            let { pageNum, errmsgList: prevList } = that.data;
            let errmsgList = res.data.errmsg || [];
           // let errmsgLength = res.data.errmsg.length;
           let errmsgLength = errmsgList.length;
            let errcode = res.data.errcode;
            let status = res.data.errmsg.status;

            if (errmsgLength === 0) {    //
              wx.showToast({
                title: '没有更多数据了~~~',
                icon: 'none',
                duration: 500
              })
            }
            if (pageNum > 1) {
              errmsgList = prevList.concat(errmsgList)
            }
            if (errcode == 1) {   //成功，有提现记录
              that.setData({
                disPlay: 'disNone',
                errmsgList: errmsgList,
                list_inner: 'list_inner'
              });
              if (errmsgLength === 0) {   //提现记录的订单长度为0，显示暂无提现记录
                that.setData({
                  errmsgList: errmsgList,
                });
                wx.showToast({
                  title: '没有更多数据了~~~',
                  icon: 'none',
                  duration: 500
                })
              }

            } else if (errcode == -1) { //失败，暂无提现记录
              that.setData({
                //disPlay: 'disBlock',
                //list_inner: 'no_list_inner'
              });
              wx.showToast({
                title: '没有更多数据了~~~',
                icon: 'none',
                duration: 500
              })
            } else {

            }
          },
          fail(error) {
            //请求接口失败
          },
          complete() {
            callback && callback()
          }
        })
      });
    }
  },

  //提现记录分页
  getList(callback) {
    var that = this;
    var {
      pageNum,
      phone
    } = this.data;
    wx.request({
      url: app.appData.url + 'weChatApplet/wxChatCostDatil', //提现记录接口
      data: {
        pageNum: pageNum,
        phone: app.appData.userinfo.username
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        let { pageNum, errmsgList: prevList } = that.data;
        let errmsgList = res.data.errmsg || [];
        let errmsgLength = res.data.errmsg.length;
        let errcode = res.data.errcode;
        let status = res.data.errmsg.status;

        if (errmsgLength === 0) {    //
          wx.showToast({
            title: '没有更多数据了~~~',
            icon: 'none',
            duration: 500
          })
        }
        if (pageNum > 1) {
          errmsgList = prevList.concat(errmsgList)
        }
        if (errcode == 1) {   //成功，有提现记录
          that.setData({
            disPlay: 'disNone',
            errmsgList: errmsgList,
            list_inner: 'list_inner'
          });
          if (errmsgLength === 0) {   //提现记录的订单长度为0，显示暂无提现记录
            that.setData({
              errmsgList: errmsgList,
            });
            wx.showToast({
              title: '没有更多数据了~~~',
              icon: 'none',
              duration: 500
            })
          }

        } else if (errcode == -1) { //失败，暂无提现记录
          that.setData({
            //disPlay: 'disBlock',
            //list_inner: 'no_list_inner'
          });
          wx.showToast({
            title: '没有更多数据了~~~',
            icon: 'none',
            duration: 500
          })
        } else {

        }
      },
      fail(error) {
        //请求接口失败
      },
      complete() {
        callback && callback()
      }
    })
  },
  startCheckStatus: function () {
    //console.log('开启侦听器...')
    let that = this
    if (this.data.cashCheckHandler !== null) {
      clearInterval(this.data.cashCheckHandler)
    }
    this.data.cashCheckHandler = setInterval(function () {
      that.checkCashStatus()
    }, 100)
  },
  clearCheckStatus: function () {
    //console.log('清空侦听器...')
    if (this.data.cashCheckHandler !== null) {
      clearInterval(this.data.cashCheckHandler)
    }
    try {
      wx.removeStorageSync('cashTime')
      wx.removeStorageSync('cashResult')
      this.setData({
        showTips: false
      })
    } catch (err) {

    }
  },
  checkCashStatus: function () {
    let cashTime = null,
      cashResult = null
    try {
      cashTime = wx.getStorageSync('cashTime')
      cashResult = JSON.parse(wx.getStorageSync('cashResult'))
    } catch (err) {

    }
    if (cashTime) {
      let __cashTime = Number(cashTime)
      let __prev = new Date(__cashTime).getTime()
      let __now = Date.now()
      if (cashResult !== null) {
        if (cashResult.result === 'fail') {
          //console.log('检测到结果 为 失败.')
          this.changeCash(true)
          this.clearCheckStatus()
        }
        if (cashResult.result === 'success') {
          if ((__now - __prev) / 1000 >= this.data.delay) {
            //console.log('检测到结果 为 成功.')
            //wx.showToast(cashResult.msg, 3000)
            this.setData({
              showTips: false
            })

            wx.nextTick(() => {
              wx.showToast({
                title: cashResult.msg,
                icon: 'none',
                success(res) {
                  if (res.confirm) {
                    //成功后跳转到首页
                    wx.switchTab({
                      url: '../index/index'
                    })
                  }
                }
              })
            })


            this.clearCheckStatus()
          } else {
            this.setData({
              showTips: true
            })
          }

        }
      }
    }
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
    var that = this;
    const money = that.data.Score / 100;
    const openid = wx.getStorageSync("openid");
    const nick = that.data.username;
    that.setData({
      money: that.data.Score / 100,
      openid: openid,
      nick: nick
    })

      //请求接口获取到后台设置的提现的最小金额和最大金额
      wx.request({
        url: app.appData.url + '/weChatApplet/withdrawalRules',
        data: {
          customerId: app.appData.userinfo.customerId
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success(res) {
          that.setData({
            moneyMax: res.data.moneyMax,
            moneyMin: res.data.moneyMin
          })
        },
        fail() {
          console.log('请求数据失败。。。。。')
        },
        complete: function () {
          wx.hideLoading()
        }
      })
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
    var {
      pageNum
    } = this.data;
    pageNum = pageNum + 1;
    this.setData({
      pageNum: pageNum,
    })

    wx.nextTick(() => this.getList())

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //下拉刷新
  onPullDownRefresh() {
    wx.setNavigationBarTitle({
      title: '刷新中……' //动态设置当前页面的标题
    })

    if (this.data.pageNum > 1) {
      setTimeout(function () {
        wx.stopPullDownRefresh()
        wx.setNavigationBarTitle({
          title: '我的钱包' //设置回去当前页面的标题
        })
      }, 1000)
    } else {
      this.setData({
        pageNum: 1
      })
      this.getList(() => {
        wx.stopPullDownRefresh()
        wx.setNavigationBarTitle({
          title: '我的钱包' //设置回去当前页面的标题
        })
      })
    }
  },
  changeCash: function (enable = false) {
    if (enable) {
      this.setData({
        withDrawTxt: '提现',
        disabled: false,
        loading: false
      })
    } else {
      // this.setData({
      //   withDrawTxt: '处理中...',
      //   disabled: true,
      //   loading: true
      // })
    }
  },
  //提现
  withDraw: function (e) {
    const self = this;
    // if (!self.canCash()) {
    //   wx.showModal({
    //     title: '提示',
    //     content: '每天可提现一次，不可重复提现，感谢您的配合！',
    //     showCancel: false
    //   })
    //   return
    // }
    let money = self.data.Score / 100;
    // 积分小于100不可提现
    if (self.data.Score < self.data.moneyMin) {
      wx.showModal({
        title: '提示',
        content: `您的积分不足${self.data.moneyMin}，不可提现`,
      })
      return
    }

    let msg = `每天可提现一次，一次提现不可超过${self.data.moneyMax}元，`
    if (money > 100 && money >= self.data.moneyMin) {  //可提现金额
      self.setData({
        hiddenmodalput: false
      })
    } else {
      msg += '本次提现按积分折算金额为: ' + money + ' 元'
      this.setData({
        cashAmount: money
      })
      this.doWithDraw(msg)
    }
  },
  //1元(最小提现金额moneyMin)<提现金额<200元（最大提现moneyMax）的金额输入框
  cancelM: function (e) { //取消
    this.setData({
      hiddenmodalput: true,
      cashAmount: ''
    })
  },

  //点击提现申请确认按钮
  confirmM: function () {
    this.setData({
      hiddenmodalput: true
    })
    const {
      cashAmount,
      Score
    } = this.data
    const cashAmountInt = parseInt(cashAmount)
      if (0 < cashAmountInt && moneyMin <cashAmountInt && cashAmountInt < moneyMax && cashAmountInt < 200 && cashAmountInt < (Score / 100).toFixed(0)) {
        const content = `本次申请提现金额为: ${cashAmount}元，剩余${((Score / 100) - cashAmount).toFixed(2)} 元`
        this.doWithDraw(content)
      } else {
      wx.showToast({
        title: `输入的值必须为大于${moneyMin}>1 || ${moneyMin})小于${moneyMax}的整数，并且不大于积分总额`,
        icon: 'none',
        time:5000
      })
      return
    }
    // const content = `本次申请提现金额为: ${cashAmount}元，剩余${(Score / 100) - cashAmount} 元`
    // this.doWithDraw(content)
  },

  isCashAmount: function (e) {
    // this.setData({
    //   cashAmount: e.detail.value
    // })
    let cashAmount = this.validateNumber(e.detail.value)
    this.setData({
      //   value,
      // cashAmount: e.detail.value
      cashAmount
    })
  },
  //大于1，小于200，整数,且要小于账户总额
  validateNumber(val) {
    //return val.replace(/^(0|[1-9][0-9]*)(\.\d*)?$/, '')
    const regExp = {
      nonNegativeNumber: /[^\d]/g
    }
    const reg = regExp.nonNegativeNumber
    if (reg.test(val)) {
      if (1 < val < 199 && val < this.data.Score / 100) {
        console.log('val是否大于1小于200', val)
      }
    } else {
      // wx.showToast({
      //   title: '输入的值不正确',
      //   icon: 'none'
      // })
      console.log('val是否大于1小于200，且不能大于积分总额')
    }
    return val
  },

  canCash: function () {
    let __now__ = Date.now.toString()
    let cashDate = wx.getStorageSync('__cashDate')
    if (!cashDate) {
      return true
    }
    let st = util.formatTime(new Date(cashDate))
    let now = util.formatTime(new Date())
    if (now.slice(0, 10) <= st.slice(0, 10)) {
      return false
    }
    return true
  },


  // 遮罩层显示
  show: function () {
    this.setData({
      flag: false
    })
  },
  // 遮罩层隐藏
  conceal: function () {
    this.setData({
      flag: true
    })
  },
  doWithDraw(content) {
    const self = this
    wx.showModal({
      title: '你确定要提现吗',
      content: content,
      success(res) {
        if (res.confirm) {

          self.changeCash(false)

          let __cashTime = Date.now().toString()
          let __result = {
            cashTime: __cashTime,
            result: 'loading',
            msg: ''
          }
          wx.setStorageSync('cashTime', __cashTime)
          wx.setStorageSync('cashResult', JSON.stringify(__result))

          wx.nextTick(() => self.startCheckStatus())

          wx.request({
            url: app.appData.url + 'wx/pcost', // 提现接口地址
            data: {
              openid: self.data.openid,
              money: self.data.cashAmount * 100,
              nick: self.data.nick
            },
            header: {
              'content-type': 'application/json' 
            },
            success(res) {
              if (res.data.errcode === 0) { //提现成功 

                __result.result = 'success'
                __result.msg = res.data.errmsg
                wx.setStorageSync('cashResult', JSON.stringify(__result))
                wx.setStorageSync('__cashDate', __cashTime)
                wx.showToast({
                  title: res.data.errmsg,
                  icon: 'none',
                  duration:5000,
                  mask: true
                });
                // //成功后跳转到首页
                // wx.switchTab({
                //   url: '../index/index'
                // })

//提现成功，刷新页面所有的东西 

                setTimeout(function () {
                  //1、刷新请求积分余额的接口
                  wx.request({
                    url: app.appData.url + '/weChatApplet/chatCustCast',
                    data: {
                      userName: app.appData.userinfo.username
                    },
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success(res) {
                      self.setData({
                        Score: res.data.data.score,
                        WithdrawalAmount: res.data.data.score / 100
                      })
                    },
                    fail() {
                      console.log('请求数据失败。。。。。')
                    },
                    complete: function () {
                      wx.hideLoading()
                    }
                  })
                }, 5000)

                setTimeout(function () {
                  //2、请求提现记录接口，页码为第1页
                  wx.request({
                    url: app.appData.url + 'weChatApplet/wxChatCostDatil', //提现记录接口
                    data: {
                      pageNum: 1,
                      phone: app.appData.userinfo.username
                    },
                    header: {
                      'content-type': 'application/json' // 默认值
                    },
                    success(res) {
                      let { pageNum, errmsgList: prevList } = self.data;
                      let errmsgList = res.data.errmsg || [];
                      let errmsgLength = res.data.errmsg.length;
                      let errcode = res.data.errcode;
                      let status = res.data.errmsg.status;

                      if (errmsgLength === 0) {    //
                        wx.showToast({
                          title: '没有更多数据了~~~',
                          icon: 'none',
                          duration: 500
                        })
                      }
                      if (pageNum > 1) {
                        errmsgList = prevList.concat(errmsgList)
                      }
                      if (errcode == 1) {   //成功，有提现记录
                        self.setData({
                          disPlay: 'disNone',
                          errmsgList: errmsgList,
                          list_inner: 'list_inner'
                        });
                        if (errmsgLength === 0) {   //提现记录的订单长度为0，显示暂无提现记录
                          self.setData({
                            //disPlay: 'disBlock',
                            errmsgList: errmsgList,
                            //list_inner: 'no_list_inner'
                          });
                          wx.showToast({
                            title: '没有更多数据了~~~',
                            icon: 'none',
                            duration: 500
                          })
                        }

                      } else if (errcode == -1) { //失败，暂无提现记录
                        wx.showToast({
                          title: '没有更多数据了~~~',
                          icon: 'none',
                          duration: 500
                        })
                      } else {

                      }
                    },
                    fail(error) {
                      //请求接口失败
                    },
                    complete() {

                    }
                  })
                }, 5000)
            



              } else { //提现账户异常
                wx.showToast({
                  title: res.data.errmsg,
                  icon: 'none',
                  duration: 3000,
                  mask: true
                })

                __result.result = 'fail'
                __result.msg = res.data.errmsg
                wx.setStorageSync('cashResult', JSON.stringify(__result))
              }
            },
            fail(error) {
              wx.showToast({
                title: '请求提现接口失败，请稍后再试',
                icon: 'none',
                duration: 3000,
                mask: true
              })

              self.changeCash(true)

            },
          })



        } else if (res.cancel) {
          console.log('用户点击取消')

        }
      }
    })
  }
})
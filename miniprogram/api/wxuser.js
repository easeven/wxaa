class wxuser {

  // 函数获取用户ID
  static getUserId() {

    return new Promise((resolve, reject) => {
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: cloudLoginRes => {
          if (cloudLoginRes) {
            let result = cloudLoginRes.result
            resolve(result);
          } else {
            reject("微信服务器没有返回正确的用户数据！");
          }
        },
        fail: err => {
          wx.showToast({
            icon: 'none',
            title: '获取 openid 失败，请检查是否有部署 login 云函数',
          })
          console.log('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：', err)
          reject('[云函数] [login] 获取 openid 失败，请检查是否有部署云函数，错误信息：' + err);
        }
      })
    });

  }

  /**
   * 调用wx.getUserInfo获取用户基本信息（次过程较慢）
   */
  static wxGetUserInfo() {
    return new Promise((resolve, reject) => {
      // 当前用户的认证设置
      wx.getSetting({
        success: (res) => {
          console.log("setting:", res.authSetting);

          let authSetting = res.authSetting;
          if (authSetting["scope.userInfo"] === true) {
            wx.getUserInfo({
              success: userInfoRes => {
                console.log("userinfo res:", userInfoRes);
                if (userInfoRes) {
                  // 返回结果有效
                  resolve(userInfoRes.userInfo);
                } else {
                  reject("[getUserInfo] 返回了无效的值");
                }
              },
              fail: err => {
                console.log(err);
                reject(err);
              }
            });
          } else {
            // 跳转用户手动同意认证
            wx.redirectTo({
              url: '/pages/user/login/index',
            });
          }
        },
        fail: error => {
          reject(error);
        }
      });
    });

  }

  /**
   * 获取当前用户信息
   */
  static getCurrentUser() {
  
  }

  // 保存用户信息到缓存里
  static saveStorageUser(userInfo) {
    let key = "userInfos";
    let storageInfos = wx.getStorageSync(key);
    let array = [];
    let expire_seconds = 120;

    for (let index = 0; index < storageInfos.length; index++) {
      var element = storageInfos[index];

      if (userInfo.openid === element.openid) {
        continue;
      } else {
        array.push(element);
      }

    }

    array.push({
      openid: userInfo.openid,
      nickName: userInfo.nickName,
      avatarUrl: userInfo.avatarUrl,
      expires_in: new Date().getTime() + expire_seconds * 1000
    });

    wx.setStorageSync(key, array)

    return true;

  }

  // 缓存中获取用户信息
  static getStorageUser(openid) {
    let key = "userInfos";
    let storageInfos = wx.getStorageSync(key);


    for (let index = 0; index < storageInfos.length; index++) {
      var element = storageInfos[index];

      if (element && element.openid === openid && element.expires_in >= new Date().getTime()) {
        return element;
      }

    }

    return null;
  }
}

export default wxuser;
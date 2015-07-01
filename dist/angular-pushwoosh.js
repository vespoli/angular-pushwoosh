//derived from https://github.com/t4deu/angular-pushwoosh

(function(angular) {
  'use strict';
  angular.module('pushwooshNotification', [])
  .provider('$pushNotification', function() {
    var isRegistered = false;
    var settings = {
      appId: null,
      appName: null,
      gcmProjectNumber: null,
      onPushNotification: null,
      onRegisterSuccess: null,
      onRegisterError: null
    };
    var registerSettings = {
      android: {},
      ios: {
        alert: true,
        badge: true,
        sound: true
      }
    };
    var api = {
      isAvailable: function() {
        return (typeof window.plugins !== 'undefined')
                && (typeof window.plugins.pushNotification !== 'undefined');
      },
      setTags: function(subscriptions) {
        if (isRegistered) {          
          var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");          
          pushNotification.setTags(subscriptions, function (status) {
            console.warn("Tags set.");
          }, function (status) {
            console.warn("Tags not set.");
          });
        } else {
          console.log('not registered');
        }
      }
    };    

    var registerPushwoosh = function(params, callback) {
      try {
        //set push notifications handler
        document.addEventListener('push-notification', function(e) {
          console.log(JSON.stringify(e.notification));
          if (settings.onPushNotification)          
           settings.onPushNotification(e);
        });

        //start register
        console.log('try to register for push');
        //api.pushNotification.onDeviceReady(params);

        api.pushNotification.registerDevice(function(status) {
          var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");

          if (device.platform == "Android") {
            pushNotification.onDeviceReady({ projectid: settings.gcmProjectNumber, appid: settings.appId });
            pushNotification.registerDevice(
              function (token) {
                isRegistered = true;
                console.warn("Device registered: " + JSON.stringify(token));
              },
              function (status) {
                console.warn("Registration error: " + JSON.stringify(status));
              }
            );
          }

          if (device.platform == "iPhone" || device.platform == "iOS") {
            pushNotification.onDeviceReady({ pw_appid: settings.appId });
            pushNotification.registerDevice(
              function (status) {
                isRegistered = true;
                console.warn("Device registered: " + JSON.stringify(status));
              },
              function (status) {
                console.warn('Registration error:' + JSON.stringify(status));
              }
            );
            pushNotification.setApplicationIconBadgeNumber(0);
          }

        });

      } catch(err) {
        console.log(err.message);
      }
    };

    var unregisterPushwoosh = function() {
      var pushNotification = cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification");
      pushNotification.unregisterDevice(function (status) {
        isRegistered = false;
        console.warn("Device unregistered: " + JSON.stringify(status));
      },
      function (status) {
        console.warn('Unregistration error:' + JSON.stringify(status));
      });
    }

    this.register = function(params) {
      if(!window.cordova){return;}
      angular.extend(settings, params);
      try {
        registerSettings.android.projectid = settings.gcmProjectNumber,
        registerSettings.android.appid = settings.appId;
        registerSettings.ios.pw_appid = settings.appId;

        console.log(JSON.stringify(settings));
        var init = function(){
          api.pushNotification = api.isAvailable() ? window.plugins.pushNotification : null;
          // console.log('is available', api.isAvailable());
          if(device.platform == "Android") {
            registerPushwoosh(registerSettings.android);
          }
          if(device.platform == "iPhone" || device.platform == "iOS") {
            registerPushwoosh(registerSettings.ios);
          }
        }
        if (api.isAvailable()) {
          init();
        } else {
          document.addEventListener('deviceready', init, false)
        }
      } catch(err) {
        console.log(err.message);
      }
    };

    this.$get = function() {
      return api; 
    }
  });
}(angular));

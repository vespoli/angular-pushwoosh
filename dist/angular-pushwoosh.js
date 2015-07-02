
(function(angular) {
  'use strict';
  angular.module('pushwooshNotification', [])
  .provider('$pushNotification', function() {

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
      isRegistered: false,
      isAvailable: function() {
        return (typeof window.plugins !== 'undefined')
                && (typeof window.plugins.pushNotification !== 'undefined');
      },
      setTags: function(subscriptions, callback) {
        try {       
          var pushNotification = cordova.require('com.pushwoosh.plugins.pushwoosh.PushNotification');          
          pushNotification.setTags(subscriptions, function (status) {
            console.warn('Tags set.');
            if(callback && typeof callback === 'function'){callback();}
          }, function (status) {
            console.warn('Tags not set.');
          });
        } catch(err) {
          console.warn(err.message);
          console.warn('Tags not set. api.isRegistered currently set to : ' + api.isRegistered);
        }
      }
    };    

    var registerPushwoosh = function(params, callback) {
      try {
        //set push notifications handler
        document.addEventListener('push-notification', function(e) {
          console.warn('Push Notification Event: ' + JSON.stringify(e.notification));
          if (settings.onPushNotification)          
           settings.onPushNotification(e);
        });
        
        if (device.platform == "Android") {
          api.pushNotification.onDeviceReady(params);
          api.pushNotification.registerDevice(
            function (token) {
              api.isRegistered = true;
              if(callback && typeof callback === 'function'){callback();}
              console.warn("Device registered: " + JSON.stringify(token));
            },
            function (status) {
              console.warn("Registration error: " + JSON.stringify(status));
            }
          );
        }

        if (device.platform == "iPhone" || device.platform == "iOS") {
          api.pushNotification.onDeviceReady(params);
          api.pushNotification.registerDevice(
            function (status) {
              api.isRegistered = true;
              if(callback && typeof callback === 'function'){callback();}
              console.warn("Device registered: " + JSON.stringify(status));
            },
            function (status) {
              console.warn('Registration error:' + JSON.stringify(status));
            }
          );
          api.pushNotification.setApplicationIconBadgeNumber(0);
        }

      } catch(err) {
        console.log(err.message);
      }
    };


    this.register = function(params, callback) {
      if(!window.cordova){return;}
      angular.extend(settings, params);
      try {
        registerSettings.android.projectid = settings.gcmProjectNumber,
        registerSettings.android.appid = settings.appId;
        registerSettings.ios.pw_appid = settings.appId;

        var init = function(){
          api.pushNotification = api.isAvailable() ? cordova.require("com.pushwoosh.plugins.pushwoosh.PushNotification") : null;
          if(device.platform == "Android") {
            registerPushwoosh(registerSettings.android, callback);
          }
          if(device.platform == "iPhone" || device.platform == "iOS") {
            registerPushwoosh(registerSettings.ios, callback);
          }
        };

        if (api.isAvailable()) {
          init();
        } else {
          document.addEventListener('deviceready', init, false);
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

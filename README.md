angular-pushwoosh
=================

A pushwoosh integration module for angular

Usage example:

    angular.module('app', ['pushwooshNotification'])
    .config(function($pushNotificationProvider) {
      $pushNotificationProvider.register({
        appId: '0EF2C-CCCFD',
        appName: null,
        gcmProjectNumber: '509541969118',
        onPushNotification: null,
        onRegisterSuccess: null,
        onRegisterError: null
      });
    });

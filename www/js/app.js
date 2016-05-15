'use strict';

var myApp = angular.module('starter', ['ionic', 'ionic.service.core', 'ngCordova']);

myApp.run(function ($ionicPlatform) {
  $ionicPlatform.ready(function () {
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if (window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});


myApp.controller('MapCtrl', function ($scope, $state, $cordovaGeolocation, $ionicModal, $http) {
  var options = { timeout: 10000, enableHighAccuracy: true };
  var latLng = {};

  $cordovaGeolocation.getCurrentPosition(options).then(function (position) {
    latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    $scope.map = new google.maps.Map(document.getElementById('map'), mapOptions);

    //Wait until the map is loaded
    google.maps.event.addListenerOnce($scope.map, 'idle', function () {

      var marker = new google.maps.Marker({
        position: latLng,
        map: $scope.map,
        title: 'Me',
        animation: google.maps.Animation.DROP
      });

      var infoWindow = new google.maps.InfoWindow({
        content: 'Me'
      });

      marker.addListener('click', function () {
        infoWindow.open($scope.map, marker);
      });
    });
  }, function (error) {
    console.log('Could not get location');
  });

  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function (modal) {
    $scope.modal = modal;
  });

  $scope.openModal = function () {
    $scope.modal.show();
  };
  $scope.closeModal = function () {
    $scope.modal.hide();
  };

  $scope.$on('$destroy', function () {
    $scope.modal.remove();
  });

  $scope.$on('modal.hidden', function () {
  });

  $scope.$on('modal.removed', function () {
  });

  $scope.user = {};
  $scope.registerUser = function (user) {
    $scope.modal.hide();
    user.loc = [];
    user.loc.push(latLng.lng()); // Important, longitude first
    user.loc.push(latLng.lat());

    $http({
      method: 'POST',
      url: 'http://ionicbackend-plaul.rhcloud.com/api/friends/register/' + user.distance,
      data: user
    }).then(function (data) {

      angular.forEach(data.data, function (item) {

        var latLng = new google.maps.LatLng(item.loc[1], item.loc[0]);

        var marker = new google.maps.Marker({
          position: latLng,
          map: $scope.map,
          title: item.userName,
          animation: google.maps.Animation.DROP

        });

        var infoWindow = new google.maps.InfoWindow({
          content: item.userName
        });

        marker.addListener('click', function () {
          infoWindow.open($scope.map, marker);
        });
      });
    }, function (error) {
      console.log(error);
    });
  };
});

myApp.config(function ($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('map', {
      url: '/',
      templateUrl: 'templates/map.html',
      controller: 'MapCtrl'
    });
  $urlRouterProvider.otherwise('/');
});


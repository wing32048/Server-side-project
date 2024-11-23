var myApp = angular.module('logoutApp', []);

myApp.controller('logoutController', ['$scope', '$interval', '$window', function ($scope, $interval, $window) {
  $scope.seconds = 5;
  $scope.loadingShowed = true;

  $interval(function () {
    $scope.seconds--;
    if ($scope.seconds <= 0) {
      $scope.loadingShowed = false;
      $scope.redirect();
    }
  }, 1000, 5);

  $scope.redirect = function () {
    $window.location.href = 'https://www.youtube.com/'; //change page path
  };
}]);

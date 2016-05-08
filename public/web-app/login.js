var login = angular.module('login', [
    'ngMaterial'
]);

login
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue")
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
            });
    });

login.controller('LoginCtrl', function($scope){
    $scope.vpcUrl =  "";
    $scope.ownerId = "";
    $scope.accessToker = "";


    $scope.reset = function(){
        $scope.vpcUrl =  "";
        $scope.ownerId = "";
        $scope.accessToker = "";
    }
});


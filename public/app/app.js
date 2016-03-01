var identity = angular.module("identity", ["ngRoute", 'ui.bootstrap', 'smart-table']);

identity.config(function ($routeProvider) {
    $routeProvider
        .when("/credentials", {
            templateUrl: "/views/credentials.html",
            controller: "CredentialsCtrl"
        })
        .when("/create/account", {
            templateUrl: "/views/create.html",
            controller: "NewCtrl"
        })
        .when("/create/bulk", {
            templateUrl: "/views/create.html",
            controller: "BulkCtrl"
        })
        .when("/import", {
            templateUrl: "/views/import.html",
            controller: "ImportCtrl"
        })
        .otherwise({
            redirectTo: "/list/"
        })
});


identity.factory("userTypesService", function () {
    var userTypes = [
        {name: "CLOUD_PPSK", selected: true},
        {name: "CLOUD_RADIUS", selected: true}
    ];
    return {
        getUserTypes: function () {
            return userTypes;
        }
    }
});

identity.factory("userGroupsService", function ($http) {
    var enableEmailApproval;
    var userGroups = [];
    var isLoaded = false;
    $http
        .get("/api/userGroup")
        .then(function (response) {
            enableEmailApproval = response.data.enableEmailApproval;
            response.data.userGroups.forEach(function (group) {
                group["selected"] = true;
                userGroups.push(group);
            });
            isLoaded = true;
        });
    return {
        getUserGroups: function () {
            return userGroups;
        },
        getEmailApprouval: function () {
            return enableEmailApproval;
        },
        isLoaded: function () {
            return isLoaded;
        }
    }
});

identity.factory("credentialsService", function ($http, $q, userTypesService, userGroupsService) {
    var credentials = [];
    $http
        .get("/api/credentials")
        .then(function(response) {
            response.data.forEach(function (credential){
                credentials.push(credential);
            });

        });
    return {
        getCredentials: function () {
            return credentials;
        }
    }
});

identity.controller("userTypesCtrl", function ($scope, userTypesService, userGroupsService) {
    $scope.change = function () {
        if (userGroupsService.isLoaded()) console.log(userTypesService.getUserTypes());
    };
});
identity.controller("userGroupsCtrl", function ($scope, userGroupsService) {
    $scope.change = function () {
        console.log(userGroupsService.getUserGroups());
    }
});
identity.controller("credentialsCtrl", function ($scope, credentialsService){
    $scope.change = function () {
        console.log(credentialsService.getCredentials());
    }
});
identity.controller("CredentialsCtrl", function ($scope, userTypesService, userGroupsService, credentialsService) {
    $scope.userTypes = userTypesService.getUserTypes();
    $scope.userGroups = userGroupsService.getUserGroups();
    $scope.credentials = credentialsService.getCredentials();

    $scope.userGroups.isLoaded = function () {
        return userGroupsService.isLoaded();
    };

    /*var displayedAccounts = [];
     listService.accounts.forEach(function (account) {
     if ((listService.userGroupFilter.length === 0 || listService.userGroupFilter.indexOf(account.userGroup))
     && (listService.userTypeFilter.length === 0 || listService.userTypeFilter.indexOf(account.credentialType)))
     {
     displayedAccounts.push(account);
     }
     })*/
});
identity.directive("sub-create", function () {

});

identity.controller("HeaderCtrl", function ($scope, $location) {
    $scope.appDetails = {};

    $scope.nav = {};
    $scope.nav.isActive = function (path) {
        if (path === $location.path()) return true;
        else return false;
    }
});
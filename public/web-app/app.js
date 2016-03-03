var identity = angular.module("identity", ["ngRoute", 'ui.bootstrap', 'smart-table', 'ngSanitize', 'ngCsv']);

identity.config(function ($routeProvider) {
    $routeProvider
        .when("/credentials", {
            templateUrl: "/web-app/views/credentials.html",
            controller: "CredentialsCtrl"
        })
        .when("/create/single", {
            templateUrl: "/web-app/views/create.html",
            controller: "NewCtrl"
        })
        .when("/create/bulk", {
            templateUrl: "/web-app/views/create.html",
            controller: "BulkCtrl"
        })
        .when("/import", {
            templateUrl: "/web-app/views/import.html",
            controller: "ImportCtrl"
        })
        .otherwise({
            redirectTo: "/credentials/"
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
        },
        getArrayForRequest: function () {
            var arrayForRequest = [];
            userTypes.forEach(function (userType) {
                if (userType.selected) arrayForRequest.push(userType.name);
            });
            if (arrayForRequest.length === userTypes.length) return [];
            else return arrayForRequest;
        }
    }
});

identity.factory("userGroupsService", function ($http) {
    var enableEmailApproval;
    var userGroups = [];
    var isLoaded = false;

    return {
        init: function () {
            return $http
                .post("/api/userGroup")
                .then(function (response) {
                    console.log(response);
                    if (response.data.error) return response.data;
                    else {
                        enableEmailApproval = response.data.enableEmailApproval;
                        response.data.userGroups.forEach(function (group) {
                            group["selected"] = true;
                            userGroups.push(group);
                        });
                        isLoaded = true;
                        return userGroups;
                    }
                });
        },
        getUserGroups: function () {
            return userGroups;
        },
        getEmailApprouval: function () {
            return enableEmailApproval;
        },
        getUserGroupName: function (groupId) {
            var groupName = "";
            userGroups.forEach(function (group) {
                if (group.id === groupId) groupName = group.name;
            });
            return groupName;
        },
        isLoaded: function () {
            return isLoaded;
        },
        getArrayForRequest: function () {
            var arrayForRequest = [];
            userGroups.forEach(function (userGroup) {
                if (userGroup.selected) arrayForRequest.push(userGroup.id);
            });
            if (arrayForRequest.length === userGroups.length) return [];
            else return arrayForRequest;
        }
    }
});

identity.factory("exportService", function () {
    var exportFields = [
        {name: 'userName', selected: true, display: "User Name"},
        {name: 'email', selected: true, display: "Email"},
        {name: 'phone', selected: true, display: "Phone"},
        {name: 'organization', selected: true, display: "Organization"},
        {name: 'groupId', selected: true, display: "Group ID"},
        {name: 'groupName', selected: true, display: "Group Name"},
        {name: 'credentialType', selected: true, display: "Credential Type"},
        {name: 'createTime', selected: true, display: "Create Time"},
        {name: 'activeTime', selected: true, display: "Active Time"},
        {name: 'expireTime', selected: true, display: "Expire Time"},
        {name: 'lifeTime', selected: true, display: "Life Time"},
        {name: 'ssids', selected: true, display: "SSIDs"},
        {name: 'visitPurpose', selected: true, display: "Visit Purpose"}
    ];
    return {
        getFields: function(){
            return exportFields;
        }
    }
});

identity.factory("credentialsService", function ($http, $q, userTypesService, userGroupsService) {
    var dataLoaded = false;

    function getCredentials() {
        var params = {
            credentialType: userTypesService.getArrayForRequest(),
            userGroup: userGroupsService.getArrayForRequest()
        };

        dataLoaded = false;

        var canceller = $q.defer();
        var request = $http({
            url: "/api/credentials",
            method: "GET",
            params: params,
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    var credentials = [];

                    response.data.forEach(function (credential) {
                        credential.groupName = userGroupsService.getUserGroupName(credential.groupId);
                        credentials.push(credential);
                    });
                    dataLoaded = true;
                    return credentials;
                }
            },
            function (response) {
                if (response.status >= 0) {
                    console.log("error");
                    console.log(response);
                    return ($q.reject("error"));
                }
            });

        promise.abort = function () {
            canceller.resolve();
        };
        promise.finally(function () {
            console.info("Cleaning up object references.");
            promise.abort = angular.noop;
            canceller = request = promise = null;
        });

        return promise;
    }


    return {
        getCredentials: getCredentials,
        isLoaded: function isLoaded() {
            return dataLoaded;
        }
    }
});


identity.controller("CredentialsCtrl", function ($scope, userTypesService, userGroupsService, credentialsService, exportService) {
    var requestForCredentials = null;
    var initialized = false;
    $scope.exportFields = exportService.getFields();
    $scope.userTypes = userTypesService.getUserTypes();

    userGroupsService.init().then(function (promise) {
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = promise;
            initialized = true;
            requestForCredentials = credentialsService.getCredentials();
            requestForCredentials.then(function (promise) {
                if (promise && promise.error) console.log(promise);
                else $scope.credentials = promise;
            });
        }
    });
    $scope.$watch('userTypes', function () {
        $scope.refresh();
    }, true);
    $scope.$watch('userGroups', function () {
        $scope.refresh();
    }, true);
    $scope.$watch("userGroups", function () {
        $scope.userGroupsLoaded = function () {
            return userGroupsService.isLoaded();
        };
    });
    $scope.$watch("credentials", function () {
        $scope.credentialsLoaded = function () {
            return credentialsService.isLoaded()
        };
    });
    $scope.refresh = function(){
        if (initialized) {
            requestForCredentials.abort();
            requestForCredentials = credentialsService.getCredentials();
            requestForCredentials.then(function (promise) {
                $scope.credentials = promise;
            });
        }
    };
    $scope.getExportHeader = function(){
        var header = [];
        $scope.exportFields.forEach(function(field){
            if (field.selected) header.push(field.name);
        });
        header[0] = '#'+header[0];
        return header;
    };
    $scope.export = function(){
      if ($scope.credentials) {
          var exportData = [];
          $scope.credentials.forEach(function(credential){
              var user = {};
              $scope.exportFields.forEach(function (field){
                    if (field.selected) user[field.name] = credential[field.name];
              });
              exportData.push(user);
          });
          return exportData;
      }
    };

});
identity.filter("ssidStringFromArray", function () {
    return function (input) {
        if (!input || input.length === 0) return "";
        else {
            var string = "";
            input.forEach(function (ssid) {
                string += ssid + ", ";
            });
            string = string.trim().slice(0, -1);
            return string;
        }
    }
});
identity.filter("userType", function () {
    return function (input) {
        if (input === "CLOUD_PPSK") return "PPSK";
        else if (input === "CLOUD_RADIUS") return "RADIUS";
        else return "";
    }
});



identity.directive("sub-create", function () {

});

identity.controller("HeaderCtrl", function ($scope, $location) {
    $scope.appDetails = {};

    $scope.nav = {};
    $scope.nav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[1]) return true;
        else return false;
    };
    $scope.subnav = {};
    $scope.subnav.isActive = function (path) {
        if (path === $location.path().toString().split("/")[2]) return true;
        else return false;
    }
});


identity.controller('ModalCtrl', function ($scope, $uibModal) {

    $scope.animationsEnabled = true;
    $scope.$on('apiError', function(event, apiError) {
        $scope.apiErrorStatus = apiError.status;
        $scope.apiErrorMessage = apiError.message;
        $scope.apiErrorCode = apiError.code;
        var modaleTemplateUrl = 'views/modalErrorContent.html';
        displayModel(modaleTemplateUrl);

    });
    $scope.open = function (template, size) {
        var modaleTemplateUrl = "";
        switch (template){
            case 'about':
                modaleTemplateUrl = 'modalAboutContent.html';
                break;
            case 'export':
                modaleTemplateUrl = 'views/modalExportContent.html';
                break;
        }
    displayModel(modaleTemplateUrl, size);

    };
    function displayModel(modaleTemplateUrl, size){
        var modalInstance = $uibModal.open({
            animation: $scope.animationsEnabled,
            templateUrl: modaleTemplateUrl,
            controller: 'ModalInstanceCtrl',
            scope: $scope,
            size: size
        });
    }

});

// Please note that $uibModalInstance represents a modal window (instance) dependency.
// It is not the same as the $uibModal service used above.

identity.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

    $scope.close = function () {
        $uibModalInstance.close('cancel');

    };
});

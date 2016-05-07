angular.module("CustomFilters", []);
angular.module('Monitor', []);
angular.module('Credentials', []);
angular.module("Create", []);
angular.module("Import", []);
var identity = angular.module("identity",
    ["ngRoute",
        'ui.bootstrap',
        'ngSanitize',
        'ngCsv',
        'ngMaterial',
        'ngMessages',
        'md.data.table',
        'CustomFilters',
        'Monitor',
        'Credentials',
        'Create',
        'Import']);

identity
    .config(function ($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette("blue")
            .accentPalette('green', {
                'default': '400' // by default use shade 400 from the pink palette for primary intentions
            });
    });


identity.factory("userTypesService", function () {
    var userTypes = [
        {name: "CLOUD_PPSK", selected: false},
        {name: "CLOUD_RADIUS", selected: false}
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

identity.factory("userGroupsService", function ($http, $q) {
    var enableEmailApproval;
    var userGroups;
    var isLoaded = false;

    function init() {
        userGroups = [];
    }

    init();

    function getUserGroups() {
        init();

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/userGroup",
            method: "POST",
            timeout: canceller.promise
        });

        var promise = request.then(
            function (response) {
                if (response.data.error) return response.data;
                else {
                    enableEmailApproval = response.data.enableEmailApproval;
                    response.data.userGroups.forEach(function (group) {
                        group["selected"] = false;
                        userGroups.push(group);
                    });
                    isLoaded = true;
                    return {userGroups: userGroups, reqId: response.data.reqId};
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
        getUserGroups: getUserGroups,
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
        getFields: function () {
            return exportFields;
        }
    }
});


identity.factory("deleteUser", function ($http, $q) {

    function deleteCredentials(ids) {

        var canceller = $q.defer();
        var request = $http({
            url: "/api/identity/credentials",
            method: "DELETE",
            params: {ids: ids},
            timeout: canceller.promise
        });
        var promise = request.then(
            function (response) {
                if (response && response.data && response.data.error) return response.data;
                else return response;
            },
            function (response) {
                if (response.status >= 0) {
                    console.log("error");
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
        deleteCredentials: deleteCredentials
    }
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
identity.directive('fileChange', ['$parse', function ($parse) {
    return {
        require: 'ngModel',
        restrict: 'A',
        link: function ($scope, element, attrs, ngModel) {
            var attrHandler = $parse(attrs['fileChange']);
            var handler = function (e) {
                $scope.$apply(function () {
                    attrHandler($scope, {$event: e, files: e.target.files});
                });
            };
            element[0].addEventListener('change', handler, false);
        }
    }
}]);


identity.controller('ModalCtrl', function ($scope, $mdDialog) {
    $scope.animationsEnabled = true;
    $scope.$on('apiError', function (event, apiError) {
        var test = $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'views/modalErrorContent.html',
            escapeToClose: false,
            locals: {
                items: {
                    apiErrorStatus: apiError.status,
                    apiErrorMessage: apiError.message,
                    apiErrorCode: apiError.code
                }
            }
        });
    });
    $scope.$on('apiWarning', function (event, apiWarning) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'views/modalWarningContent.html',
            escapeToClose: false,
            locals: {
                items: {
                    apiWarningStatus: apiWarning.status,
                    apiWarningMessage: apiWarning.message,
                    apiWarningCode: apiWarning.code
                }
            }
        });
    });
    $scope.$on('newSingle', function (event, account) {
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: 'views/modalSingleContent.html',
            escapeToClose: false,
            locals: {
                items: {
                    loginName: account.loginName,
                    password: account.password,
                    ssid: account.ssid,
                    startTime: account.startTime,
                    endTime: account.endTime,
                    authType: account.authType
                }
            }
        });
    });

    $scope.open = function (template) {
        var modalTemplateUrl = "";
        switch (template) {
            case 'about':
                modalTemplateUrl = 'modalAboutContent.html';
                break;
            case 'export':
                modalTemplateUrl = 'views/modalExportContent.html';
                break;
            case 'exportBulk':
                modalTemplateUrl = 'views/modalBulkContent.html';
                break;
        }
        $mdDialog.show({
            controller: 'DialogController',
            templateUrl: modalTemplateUrl,
            escapeToClose: false,
            locals: {
                items: {}
            }
        });
    };
});


identity.controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {
    $scope.close = function () {
        $uibModalInstance.close('close');
    };
});


angular.module('Modals').controller('ModalCtrl', function ($scope, $rootScope, $mdDialog) {
    $rootScope.displayed = false;
    $scope.$on('apiError', function (event, apiError) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: 'modals/modalErrorContent.html',
                escapeToClose: false,
                locals: {
                    items: {
                        apiErrorStatus: apiError.status,
                        apiErrorMessage: apiError.message,
                        apiErrorCode: apiError.code
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });
    $scope.$on('apiWarning', function (event, apiWarning) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogController',
                templateUrl: 'modals/modalWarningContent.html',
                escapeToClose: false,
                locals: {
                    items: {
                        apiWarningStatus: apiWarning.status,
                        apiWarningMessage: apiWarning.message,
                        apiWarningCode: apiWarning.code
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });
    $scope.$on('createSingle', function (event, account) {
        if (!$rootScope.displayed) {
            $rootScope.displayed = true;
            $mdDialog.show({
                controller: 'DialogSingleController',
                templateUrl: 'modals/modalSingleContent.html',
                locals: {
                    items: {
                        account: account
                    }
                }
            }).then(function () {
                $rootScope.displayed = false;
            });
        }
    });

    $scope.open = function (template, items) {
        var modalTemplateUrl = "";
        var controller = "";
        switch (template) {
            case 'about':
                controller = "DialogController";
                modalTemplateUrl = 'modalAboutContent.html';
                break;
            case 'export':
                controller = 'DialogExportController';
                modalTemplateUrl = 'modals/modalExportContent.html';
                break;
            case 'exportBulk':
                controller = "DialogExportController";
                modalTemplateUrl = 'modals/modalBulkContent.html';
                break;
        }
        $mdDialog.show({
            controller: controller,
            templateUrl: modalTemplateUrl,
            escapeToClose: false,
            locals: {
                items: items
            }
        });
    };
});


angular.module('Modals').controller('DialogController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.items = items;
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});

angular.module('Modals').controller('DialogSingleController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    console.log(items);
    $scope.account = items.account;
    console.log($scope.account);
    var qrcodeString = "WIFI:S:" + $scope.account.ssid + ";T:WPA;P:" + $scope.account.password + ";;";
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
    $scope.sendBySms = function(){
        $mdDialog.show({
            controller: 'DialogSendBySmsController',
            templateUrl: 'modals/modalSendBySmsContent.html',
            locals: {
                items: {
                    account: $scope.account
                }
            }
        });
    };
    $scope.sendByEmail = function(){
        $mdDialog.show({
            controller: 'DialogSendByEmailController',
            templateUrl: 'modals/modalSendByEmailContent.html',
            locals: {
                items: {
                    account: $scope.account
                }
            }
        });
    };
    $scope.qrcode = function () {
        $mdDialog.show({
            controller: 'DialogQrCodeController',
            templateUrl: 'modals/modalQrCodeContent.html',
            locals: {
                items: {
                    string: qrcodeString,
                    account: $scope.account
                }
            }
        });
    };

});

angular.module("Modals").controller("DialogSendByEmailController", function($scope, $rootScope, $mdDialog, sendCredentialsService, items){
    $scope.email = "";
    $scope.items = items;

    $scope.sendByEmail = function(){
        sendCredentialsService.deliver(items.account.id, "EMAIL", $scope.email, null).then(function(promise){
            if (promise.error) console.log(promise.error);
            else back();
        });
    };
    $scope.back = function () {
        $rootScope.$broadcast('createSingle', items.account);
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});

angular.module("Modals").controller("DialogSendBySmsController", function($scope, $rootScope, $mdDialog, sendCredentialsService, items){
   $scope.phone = "";
    $scope.items = items;

    $scope.sendBySms = function(){
        sendCredentialsService.deliver(items.account.id, "SMS", null, $scope.phone).then(function(promise){
            if (promise.error) console.log(promise.error);
            else back();
        });
    };
    $scope.back = function () {
        $rootScope.$broadcast('createSingle', items.account);
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
});

angular.module('Modals').controller('DialogQrCodeController', function ($scope, $rootScope, $mdDialog, $interval, connectionStatusService, items) {
    // items is injected in the controller, not its scope!
    $scope.connectionStatus = {
        connected: false,
        os: "N/A",
        ssid: "N/A",
        radioHealth: "N/A",
        networkHealth: "N/A",
        applicationHealth: "N/A",
        hostName: "N/A",
        ip: "N/A",
        userProfile: "N/A",
        clientMac: "N/A",
        radioBand: "N/A",
        clientProtocol: "N/A"
    };
    $scope.clientConnected = false;
    var waitingForResponse = false;
    $scope.items = items;
    /**
     * Loads and populates the notifications
     */

    this.checkConnection = function (userName) {
        waitingForResponse = true;
        connectionStatusService.getStatus(userName).then(function (promise) {
            waitingForResponse = false;
            if (promise.error) console.log(promise.error);
            else {
                $scope.connectionStatus = promise.data;
                if ($scope.connectionStatus.connected) $interval.cancel(checkStatus);
                $scope.clientConnected = $scope.connectionStatus.connected;
            }

        });
    };
    //Put in interval, first trigger after 10 seconds
    var checkStatus = $interval(function () {
        if (!waitingForResponse) {
            this.checkConnection($scope.items.account.loginName);
        }
    }.bind(this), 1000);

    $scope.userString = function (userName, isConnected) {
        if (isConnected) return userName + " is currently not connected.";
        else return userName + " is currently connected.";
    };
    $scope.userColor = function (isConnected) {
        if (isConnected) return "color: #75D064";
        else return "color: #aca5a3";
    };
    $scope.healthColor = function (healthScore) {
        if (healthScore == 100) return "color: #75D064";
        else if (healthScore >= 50) return "color: #FFCF5C";
        else return "color: #d04d49";
    };

    $scope.back = function () {
        $interval.cancel(checkStatus);
        $rootScope.$broadcast('createSingle', items.account);
    };
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $interval.cancel(checkStatus);
        $mdDialog.hide();
    };
});

angular.module('Modals').controller('DialogExportController', function ($scope, $mdDialog, items) {
    // items is injected in the controller, not its scope!
    $scope.credentials = items.credentials;
    $scope.exportFields = items.exportFields;
    $scope.close = function () {
        // Easily hides most recent dialog shown...
        // no specific instance reference is needed.
        $mdDialog.hide();
    };
    $scope.getExportHeader = function () {
        var header = [];
        $scope.exportFields.forEach(function (field) {
            if (field.selected) header.push(field.name);
        });
        header[0] = '#' + header[0];
        return header;
    };
    $scope.export = function () {
        if ($scope.credentials) {
            var exportData = [];
            $scope.credentials.forEach(function (credential) {
                var user = {};
                $scope.exportFields.forEach(function (field) {
                    if (field.selected) user[field.name] = credential[field.name];
                });
                exportData.push(user);
            });
            return exportData;
        }
    };


    $scope.getExportHeaderBulk = function () {
        $scope.exportFields[0] = '#' + $scope.exportFields[0];
        return $scope.exportFields;
    };
    $scope.exportBulk = function () {
        if ($scope.credentials) {
            return $scope.credentials;
        }
    };
});
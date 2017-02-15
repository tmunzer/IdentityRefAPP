angular.module('Import').controller("ImportCtrl", function ($scope, $rootScope, userGroupsService, createService, credentialsService) {
    $scope.hmngType = $rootScope.hmngType;

    $scope.csvFile = [];
    $scope.csvFileName = "No selected file...";
    $scope.csvHeader = [];
    $scope.csvRows = [];
    $scope.delimiter = ",";
    var masterImportUsers = {
        userName: "",
        email: "",
        phone: "",
        organization: "",
        purpose: "",
        deliverMethod: "NO_DELIVERY",
        groupId: 0
    };
    $scope.importUsers = angular.copy(masterImportUsers);

    $scope.numberOfAccounts = 0;
    $scope.accountsDone = 0;
    var csvFile = undefined;
    $scope.fields = undefined;

    $scope.previewPage = 1;
    $scope.previewByPage = 5;

    $scope.importPage = 1;
    $scope.importByPage = 10;

    $scope.errorPage = 1;
    $scope.errorByPage = 10;

    $scope.bulkResultHeaders = [];
    $scope.bulkResult = [];
    $scope.bulkError = [];

    $scope.importProcessing = false;
    $scope.initImport = false;

    $scope.diplayPreview = false;
    $scope.displayResult = false;

    userGroupsService.getUserGroups().then(function (promise) {
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = promise.userGroups;
            $scope.userGroupsLoaded = function () {
                return userGroupsService.isLoaded();
            };
        }
    });

    $scope.selectedUserGroup = function (id) {
        return $scope.importUsers.groupId === id;
    };
    $scope.selectUserGroup = function (id) {
        if ($scope.importUsers.groupId === id) $scope.user.groupId = 0;
        else $scope.importUsers.groupId = id;
    };

    $scope.handler = function (e, files) {
        $scope.csvFileName = files[0].name;
        var reader = new FileReader();
        reader.onload = function (e) {
            $scope.diplayPreview = true;
            csvFile = reader.result;
            parseCsv();
        };
        reader.readAsText(files[0]);
    };


    $scope.$watch('delimiter', function () {
        parseCsv();
    }, true);
    $scope.$watch("userGroups", function () {

    });



    function parseCsv() {
        $scope.csvRows = [];
        $scope.fields = [];
        $scope.csvHeader = [];
        $scope.numberOfAccounts = 0;
        if (csvFile) {
            var rows = csvFile.split('\n');
            var delimiter;
            if ($scope.delimiter) delimiter = $scope.delimiter;
            else delimiter = ",";

            $scope.numberOfAccounts = 0;
            rows.forEach(function (val) {
                if (val.indexOf("#") == 0) {
                    $scope.csvHeader = val.split(delimiter);
                    $scope.csvHeader[0] = $scope.csvHeader[0].replace("#", "");
                    if ($scope.fields.length == 0) {
                        $scope.fields = $scope.csvHeader;
                    }
                } else if (val != "") {
                    var o = val.split(delimiter);
                    $scope.csvRows.push(o);
                    $scope.numberOfAccounts++;
                    if ($scope.fields.length == 0) {
                        for (var i = 0; i < o.length; i++) {
                            $scope.csvHeader.push("Field " + i);
                            $scope.fields.push("Field " + i);
                        }
                    }
                }
            });
            $scope.$apply();
        }

    }

    $scope.reset = function () {
        $scope.importUsers = angular.copy(masterImportUsers);
    };


    $scope.isNotValid = function () {
        if ($scope.importUsers.groupId == 0) return true;
        else if ($scope.importUsers.email == "" && $scope.importUsers.phone == "") return true;
        else if ($scope.importUsers.deliverMethod == "EMAIL" && $scope.importUsers.email == "") return true;
        else if ($scope.importUsers.deliverMethod == "SMS" && $scope.importUsers.phone == "") return true;
        else if ($scope.importUsers.deliverMethod == "EMAIL_AND_SMS" && ($scope.importUsers.email == "" || $scope.importUsers.phone == "")) return true;
        else return false;
    };


    $scope.create = function () {
        $scope.displayResult = true;
        $scope.initImport = true;
        $scope.importProcessing = true;
        $scope.accountsDone = 0;
        var requestForCredentials = credentialsService.getCredentials();
        requestForCredentials.then(function (promise) {
            if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
            else {
                $scope.initImport = false;
                var user = {};
                var credentials = promise;
                var createdAccountsInitiated = 0;
                $scope.createdAccountsFinished = 0;
                var alreadyExists;
                $scope.csvRows.forEach(function (row) {
                    alreadyExists = false;
                    user = {
                        userName: "",
                        email: "",
                        phone: "",
                        purpose: "",
                        organization: ""
                    };
                    user.userName = row[$scope.importUsers.email]; 
                    user.email = row[$scope.importUsers.email];
                    user.phone = row[$scope.importUsers.phone];
                    user.purpose = row[$scope.importUsers.purpose];
                    user.organization = row[$scope.importUsers.organization];
                    credentials.forEach(function (credential) {
                        if (credential.userName === user.email || credential.userName === user.phone) {
                            alreadyExists = true;
                            $scope.bulkError.push({account: credential.userName, message: "userName already exists"});
                        }
                    });
                    if (!alreadyExists) {
                        createdAccountsInitiated++;
                        createService.saveUser({
                            groupId: $scope.importUsers.groupId,
                            email: user.email,
                            phone: user.phone,
                            organization: user.organization,
                            visitPurpose: user.purpose,
                            policy: "GUEST",
                            'deliverMethod': $scope.importUsers.deliverMethod
                        }).then(function (promise2) {
                            if (promise2 && promise2.error) {
                                $scope.bulkError.push({account: promise2.error.errorParams.item.replace("credential (", "").replace(")", ""), message: promise2.error.message});
                            } else {
                                if ($scope.bulkResultHeaders.length == 0) {
                                    for (var key in promise2) {
                                        $scope.bulkResultHeaders.push(key);
                                    }
                                }
                                $scope.bulkResult.push(promise2);
                                $scope.createdAccountsFinished++;

                            }
                            $scope.accountsDone ++;
                            if ($scope.accountsDone == $scope.csvRows.length){
                                $scope.importProcessing = false;
                            }
                        });
                    }

                });
            }
        });
    };
});



angular.module('Import').controller("ImportCtrl", function ($scope, userGroupsService, createUser, credentialsService) {
    $scope.csvFile = [];
    $scope.csvHeader = [];
    $scope.csvRows = [];
    var masterImportUsers = {
        email: "",
        phone: "",
        organization: "",
        purpose: "",
        deliverMethod: "NO_DELIVERY",
        groupId: 0
    };
    $scope.importUsers = angular.copy(masterImportUsers);
    $scope.result = false;
    $scope.numberOfAccounts = 0;
    var csvFile = undefined;
    $scope.fields = undefined;


    $scope.bulkResultHeaders = [];
    $scope.bulkResult = [];
    $scope.bulkError = [];


    userGroupsService.getUserGroups().then(function (promise) {
        if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
        else {
            $scope.userGroups = promise.userGroups;
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
        var reader = new FileReader();
        reader.onload = function (e) {
            csvFile = reader.result;
            parseCsv();
        };
        reader.readAsText(files[0]);
    };

    $scope.$watch('delimiter', function () {
        parseCsv();
    }, true);

    function parseCsv() {
        $scope.csvRows = [];
        $scope.fields = [];
        $scope.csvHeader = [];
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
                } else {
                    console.log($scope.csvHeader);
                    var o = val.split(delimiter);
                    $scope.csvRows.push(o);
                    $scope.numberOfAccounts++;
                    if ($scope.fields.length == 0) {
                        for (var i = 0; i < o.length; i++) {
                            $scope.csvHeader.push("Field " + i);
                            $scope.fields.push("Field " + i);
                        }
                        console.log($scope.csvHeader);
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
        if ($scope.importUsers.email == "" && $scope.importUsers.phone == "") return true;
        if ($scope.importUsers.deliverMethod == "EMAIL" && $scope.importUsers.email == "") return true;
        else if ($scope.importUsers.deliverMethod == "SMS" && $scope.importUsers.phone == "") return true;
        else if ($scope.importUsers.deliverMethod == "EMAIL_AND_SMS" && ($scope.importUsers.email == "" || $scope.importUsers.phone == "")) return true;
        else return false;
    };
    $scope.create = function () {
        $scope.result = true;
        var requestForCredentials = credentialsService.getCredentials();
        requestForCredentials.then(function (promise) {
            if (promise && promise.error) $scope.$broadcast("apiError", promise.error);
            else {
                var user = {};
                var credentials = promise;
                var createdAccountsInitiated = 0;
                $scope.createdAccountsFinished = 0;
                var currentAccount = 1;
                var stringAccount = "";
                var alreadyExists;
                $scope.csvRows.forEach(function (row) {
                    alreadyExists = false;
                    user = {
                        email: "",
                        phone: "",
                        purpose: "",
                        organization: ""
                    };
                    user.email = row[$scope.importUsers.email];
                    user.phone = row[$scope.importUsers.phone];
                    user.purpose = row[$scope.importUsers.purpose];
                    user.organization = row[$scope.importUsers.organization];
                    console.log(user);
                    credentials.forEach(function (credential) {
                        if (credential.userName === user.email || credential.userName === user.phone) {
                            alreadyExists = true;
                            $scope.bulkError.push(credential.userName + " already exists");
                        }
                    });
                    if (!alreadyExists) {
                        createdAccountsInitiated++;
                        newUser.saveUser({
                            groupId: $scope.importUsers.groupId,
                            email: user.email,
                            phone: user.phone,
                            organization: user.organization,
                            visitPurpose: user.purpose,
                            policy: "GUEST",
                            'deliverMethod': $scope.importUsers.deliverMethod
                        }).then(function (promise2) {
                            if (promise2 && promise2.error) {
                                $scope.bulkError.push(promise2.error);
                            } else {
                                if ($scope.bulkResultHeaders.length == 0) {
                                    for (var key in promise2) {
                                        $scope.bulkResultHeaders.push(key);
                                    }
                                }
                                $scope.bulkResult.push(promise2);
                                $scope.createdAccountsFinished++;

                            }
                        });
                    }
                    currentAccount++;

                });
            }
        });
    };
    $scope.displayResult = function () {
        return $scope.result;
    };
    $scope.displayBulkError = function () {
        return $scope.bulkError.length > 0;
    };
    $scope.getBulkExportHeader = function () {
        return $scope.bulkResultHeaders;
    };
    $scope.bulkExport = function () {
        if ($scope.bulkResult) {
            return $scope.bulkResult;
        }
    };
});



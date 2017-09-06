'use strict';

/* Controllers */

var appControllers = angular.module('ms.site.controllers', ['ms.site.controllers.modal', 'ui.grid', 'ui.bootstrap']);

appControllers.controller('rbacCtrl', ['$scope', '$modal', 'RestService','$location','$filter', function ($scope, $modal, RestService, $location,$filter) {
    Initialize($scope, $modal, RestService, $location, $filter)
    $scope.GetRoleById = function (subscriptionId, roleDefinitionId) {
        var rds = $scope.roledefinitions[subscriptionId] 
        //alert(JSON.stringify(jsonPath(rds, "$.[?(@.id=='" + roleDefinitionId + "')]")[0]))
        return jsonPath(rds, "$[?(@.id=='"+roleDefinitionId+"')]")[0]

    }
    $scope.ops = []
    $scope.rps= []
    $scope.resourceTypes = []
    RestService.getclient('ops').query(function (ops) {
        $scope.ops = ops.value
      
    })
    $scope.RemoveAssignment = function (subscriptionId, index) {
        $scope.roleassignments[subscriptionId].splice(index,1)

    }
    $scope.AddRole = function (subscriptionId, roletoadd, scopetoadd) {
        var assignment = {}
        assignment.properties = {}
        assignment.properties.roleDefinitionId = roletoadd
        if (scopetoadd == null) {
            scopetoadd = "/subscriptions/" + subscriptionId
        }
        assignment.properties.scope = scopetoadd
        $scope.roleassignments[subscriptionId].push(assignment)
    }
    $scope.GetResourceTypes = function (rp) {
        if (rp == null) return []
        var resourceTypes = jsonPath($scope.ops, "$[?(@.name=='" + rp + "')].resourceTypes[*]")
       return resourceTypes
    }
    $scope.GetOperations = function (rp, resourcetype) {
        if(rp==null || resourcetype == null) return []
        var operations = jsonPath($scope.GetResourceTypes(rp), "$[?(@.name=='" + resourcetype + "')].operations[*]")
        return operations
    }
    $scope.AddCustomRole = function (selectedsubId) {
        var modalInstance = $modal.open({
            templateUrl: "/pages/addcustomrole.html",
            size: 'lg',
            controller: "CustomRoleModal",
            resolve: {
                detail: function () {
                    return $scope.ops;
                }
            }
        });
        modalInstance.result.then(function () {

        })
    }
    $scope.IsPermittedwithDetails = function (subId, allroleassignments, operationName) {
        if (allroleassignments== null || allroleassignments.length ==0) {
            return false
        }
        var roleassignments = []
        if ($scope.selectedScope == null) {
            //check permissions only on subscription level
            roleassignments = jsonPath(allroleassignments, "$[?(!/resourcegroups/i.test(@.properties.scope))]")
            if (roleassignments == false) {
                roleassignments = []
            }
        } else {
            roleassignments = jsonPath(allroleassignments, "$[?(!/resourcegroups/i.test(@.properties.scope))]")
            if (roleassignments == false) {
                roleassignments = []
            }
            var rgassignments = jsonPath(allroleassignments, "$[?(@.properties.scope =='" + $scope.selectedScope + "')]")
            if (rgassignments == false) {
                rgassignments = []
            }
            roleassignments = roleassignments.concat(rgassignments)
        }

        operationName = operationName.toLowerCase()
        if(subId == null || roleassignments == null || operationName == null) return false
        var matchassignment = false
        roleassignments.forEach(function (ra) {
            var permissions = $scope.GetRoleById(subId, ra.properties.roleDefinitionId).properties.permissions
            var matchpermission = false
            permissions.forEach(function (p) {
                var actions = p.actions
                var notactions = p.notActions
                var matchaction = false
                var matchnotaction = false
                actions.forEach(function (action) {
                    var action = action.replace("*", ".*").toLowerCase()
                    var patt = new RegExp(action);
                    var result = patt.test(operationName)
                    if (result == true)
                         matchaction = true
                     
                })
                if (notactions) {
                    notactions.forEach(function (action) {
                        var action = action.replace("*", ".*").toLowerCase()
                        var patt = new RegExp(action);
                        var result = patt.test(operationName)
                        if (result == true)
                            matchnotaction = true
                        
                    })
                }
           
                if (matchaction && !matchnotaction) {
                    matchpermission = true
                    
                }
            })
            if (matchpermission) {
                matchassignment = true
                
            }
        })
        return matchassignment
    }
    $scope.ViewPermissions = function (subscriptionId, roleDefinitionId) {
        var rds = $scope.roledefinitions[subscriptionId]
        var permissions = jsonPath(rds, "$.[?(@.id=='" + roleDefinitionId + "')].properties.permissions[*]")
        var modalInstance = $modal.open({
            templateUrl: "/pages/permissions.html",
            size: 'lg',
            controller: "PolicyDefinitionModal",
            resolve: {
                detail: function () {
                    return permissions;
                }
            }
        });
        modalInstance.result.then(function () {

        })

    }

}]).controller('PolicyCtrl', ['$scope', '$modal', 'RestService','$location','$filter', function ($scope, $modal, RestService, $location,$filter) {
    Initialize($scope, $modal, RestService, $location, $filter)

    $scope.viewJson = function (p) {
        var modalInstance = $modal.open({
            templateUrl: "/pages/policydetailmodal.html",
            size: 'lg',
            controller: "PolicyDefinitionModal",
            resolve: {
                detail: function () {
                    return p;
                }
            }
        });
        modalInstance.result.then(function () {
        
        })

    }
    $scope.viewAssignments = function (p,sub) {
        var modalInstance = $modal.open({
            templateUrl: "/pages/policyassignmentmodal.html",
            size: 'lg',
            controller: "PolicyAssignmentModal",
            resolve: {
                detail: function () {
                    return p;
                },
                sub: function () {
                    return sub;
                }
            }
        });
        modalInstance.result.then(function () {

        })
    }
    $scope.viewLogs = function (p) {
        var modalInstance = $modal.open({
            templateUrl: "/pages/policylogmodal.html",
            size: 'lg',
            controller: "PolicyLogModalCtrl",
            resolve: {
                detail: function () {
                    return $scope.events[p.id];
                }
            }
        });
        modalInstance.result.then(function () {

        })
    }
    $scope.addPolicy = function () {
        var modalInstance = $modal.open({
            templateUrl: "/pages/newpolicymodal.html",
            size: 'lg',
            controller: "NewPolicyModalCtrl",
            resolve: {
                subs: function () {
                    return $scope.subs;
                }
            }
        });
        modalInstance.result.then(function () {

        })
    }
    $scope.deletepd = function (p) {
        var modalInstance = $modal.open({
            templateUrl: "/pages/confirmmodal.html",
            size: 'lg',
            controller: "ConfirmModalCtrl"
        });
        modalInstance.result.then(function () {
            var subId = p.id.substring(15, 51);
            RestService.getclient('pd').delete({ id: subId, name: p.name }, function (data) { }
            , function (data) {
                alert(angular.toJson(data,true))               
            })
        })
    }
    $scope.gallery = function () {
        var modalInstance = $modal.open({
            templateUrl: "/pages/gallerymodal.html",
            size: 'lg',
            controller: "GalleryModalCtrl"
        });
        modalInstance.result.then(function () {

        })
    }

}]).controller('PolicyBuilderCtrl', ['$scope', '$modal', 'RestService', '$location', '$filter', function ($scope, $modal, RestService, $location, $filter) {
    Initialize($scope, $modal, RestService, $location, $filter)
    $('#builder').queryBuilder({
        plugins: ['not-group', 'sortable'],
        filters: filters
    });
    $scope.generatedpolicy = {}
    $scope.then = {}
    $scope.result = {}
    $scope.then.details = []
    $scope.filters = filters
    var updatecallback = function (e, rule, error, value) {
        $scope.result = $('#builder').queryBuilder('getRules');
        if (!$.isEmptyObject($scope.result)) {
            $scope.$applyAsync(function () {
                $scope.generatedpolicy = convertToPolicyDefnitionRule($scope.result, $scope.then);
                })
            }
        }
    $scope.addtoappend = function () {
        var array = /\[[^parameter]*\]/
        var object = /\{*\}/
        var isarrayorobject = array.exec($scope.valuetoadd) != null || object.exec($scope.valuetoadd)!=null
        var arrayvalue = null
        try{
            $scope.then.details.push({ field: $scope.fieldtoadd, value: isarrayorobject? JSON.parse($scope.valuetoadd) : $scope.valuetoadd })
        } catch (err) {
            alert("invalid charactor in " + $scope.valuetoadd)
        }
        $scope.fieldtoadd = $scope.valuetoadd = null
    }
    $scope.resetappend = function () {
        $scope.then.details = []
    }

    $('#builder').on('afterUpdateRuleValue.queryBuilder', updatecallback);
    $('#builder').on('afterUpdateGroupCondition.queryBuilder', updatecallback);
    $('#builder').on('afterApplyRuleFlags.queryBuilder', updatecallback);
    $('#builder').on('afterUpdateRuleFilter.queryBuilder', updatecallback);
    $('#builder').on('afterUpdateRuleOperator.queryBuilder', updatecallback);
    $('#builder').on('afterMove.queryBuilder', updatecallback);
    $('#builder').on('AfterChangeNot.queryBuilder', updatecallback);

    $scope.loadpolicy = function (p) {
        var policyrule = p.properties.policyRule
        var rules = convertToRules(policyrule)
        $scope.then.effect = policyrule.then.effect.toLowerCase()
        $scope.then.details = policyrule.then.details
        var fields = jsonPath(p.properties.policyRule, "$..field")

        for (k in fields) {
            if ($.inArray(fields[k], $scope.filters) == -1) {
                try {
                    var newfilter = {
                        id: fields[k].toLowerCase(),
                        label: fields[k],
                        type: 'string',
                        operators: operators
                    }
                    $('#builder').queryBuilder('addFilter', newfilter);
                    $scope.filters.push(newfilter)
                } catch (ee) {

                }
       
            }
        }
      
        $('#builder').queryBuilder('setRules', rules);
  
    }



}])

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
};
function Initialize($scope, $modal, RestService, $location, $filter) {

    RestService.getclient('subscription').query(function (items) {
        $scope.subs = items.value
        RestService.getclient('userinfo').query(function (user) {
            //appInsights.setAuthenticatedUserContext(user.upn)
          //  $scope.user = user.objectId
           // alert(JSON.stringify(user))
        })
      
        $scope.policies = []
        $scope.assignmentnumbers = []
        $scope.roledefinitions = []
        $scope.roleassignments = []
        $scope.memberships = []
        $scope.violationnumbers = []
        $scope.events = []
        $scope.resourcegroups = []
        $scope.loadingpolicy = true
        $scope.loadinglogs = true
        $scope.loadingassignments = true
        $scope.loadingrback = true
        items.value.forEach(function (item) {
          
        })
        $scope.subs.forEach(function (sub) {
            $scope.policies[sub.subscriptionId] = []
            $scope.roleassignments[sub.subscriptionId] = []
            RestService.getclient('pd').query({ id: sub.subscriptionId }, function (items) {
                $scope.loadingpolicy = false
                items.value.forEach(function (item) {

                    $scope.assignmentnumbers[item.id] = 0
                    $scope.violationnumbers[item.id] = 0
                    $scope.events[item.id] = []
                    $scope.policies[sub.subscriptionId].push(item)


                })

                RestService.getclient('pa').query({ id: sub.subscriptionId }, function (assignments) {
                    $scope.loadingassignments = false
                    assignments.value.forEach(function (a) {
                        if ($scope.assignmentnumbers[a.properties.policyDefinitionId] == null) {
                            $scope.assignmentnumbers[a.properties.policyDefinitionId] = 1
                        } else {
                            $scope.assignmentnumbers[a.properties.policyDefinitionId]++
                        }
                    })

                })
                RestService.getclient('userinfo').query(function (user) {
                    //appInsights.setAuthenticatedUserContext(user.upn)
                    var principalId = user.oid
                  

                    RestService.getclient('rd').query({ id: sub.subscriptionId }, function (items) {
                        $scope.loadingrback = false
                        $scope.roledefinitions[sub.subscriptionId] = items.value

                        RestService.getclient('ra').query({ id: sub.subscriptionId, principalId: principalId }, function (items) {
                            $scope.loadingrback = false
                            $scope.roleassignments[sub.subscriptionId] = items.value


                        })
                    }) 

                    RestService.getclient('rg').query({ id: sub.subscriptionId },function(items) {
                        $scope.resourcegroups[sub.subscriptionId] = items.value
                    })
                    // alert(JSON.stringify(user))
                })
          
      
            })
         
        })
    })
}
'use strict';

/* Filters */

angular.module('ms.site.filters', []).filter('scopetolevel', function () {
    return function (scope) {
        if (scope.toLowerCase().indexOf('providers')>=0) {
            return "resource"
        } else if (scope.toLowerCase().indexOf('/resourcegroups/')>=0) {
            return scope.substring(scope.toLowerCase().indexOf('/resourcegroups/'));
        }
        else {
            return "subscription"
        }
    }
}).filter("usertype", function () {
    return function (typeId) {
        if (typeId == 1) {
            return "管理员"
        } else if (typeId == 2) {
            return "动迁操作员"
        } else if (typeId == 3) {
            return "安置操作员"
        } else {
            return "未知"
        }     
    }
}).filter("selectedname", function () {
    return function (residents) {
        var name =""
        $filter('filter')(residents, { selected: true }, true).forEach(function (r) {
            name += r + ","
        })
        return name
    }
}).filter("contractstatus", function () {
    return function (typeId) {
        if (typeId == null) {
            return "未设定"
        }
        var status = ["已确认","已打印五联单","五联单盖章","开发票","拉合同","签收","归档"]
        return status[typeId-1]
    }
})
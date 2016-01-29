(function () {
    'use strict';

    var globalTimeOut = 10000;

    var app = angular.module('app');

    app.service('vkApiService', function ($http) {
        var self = this;
        self.url = 'https://api.vk.com/method/';

        self.getWallPostComments = function (uid, post_uid, inOffset) {
            var method, params, offset;
            offset = inOffset || 0;
            method = 'wall.getComments';
            params = {
                owner_id: uid, post_id: post_uid, 
                offset: offset, count: 100, sort: 'desc',
                extended: 1
            };
            return self.get(method, params);
        }

        self.getWallPostInfo = function (post_long_uid) {
            var method, params;
            method = 'wall.getById';
            params = {
                posts: post_long_uid, extended: 1, copy_history_depth: 2
            }
            return self.get(method, params);
        }

        self.getGroupInfo = function (group_uid) {
            var method, params;
            method = 'groups.getById';
            params = {
                'group_ids':group_uid, 'fields':['description','members_count']
            };
            return self.get(method, params);
        }

        self.getGroupProfiles = function (group_uid, offset, count) {
            var method, params;
            offset = offset || 0;
            count = count || 1000;
            method = 'groups.getMembers';
            params = {'group_id': group_uid, 'v':'5.40', 'fields':['sex','city','country','bdate'/*,'connections','contacts'*/].join(','), 'offset':offset};

            return self.get(method, params);
        }

        self.get = function (method, params) {
            if (!method) {
                return;
            }

            var url, params;
            url = self.url + method;

            params = params || {};
            params.v = '5.40';
            params.callback = 'JSON_CALLBACK';

            return new Promise(function(resolve, reject) {
                $http.jsonp(url, {'params':params, timeout: globalTimeOut}).then(
                    function successCallback(response) {
                      var answer = response.data.response;
                      // console.log(response);
                      resolve(answer);
                    }, 
                    function errorCallback(response) {
                      // console.log(response);
                      reject();
                });
            });
        }
    })
})();



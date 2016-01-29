(function () {
    'use strict';

    var globalTimeOut = 10000;


    var app = angular.module('app')
        .controller('wallReaderController', ['$mdDialog','$http', '$timeout', 'vkApiService', WallReaderController])
        .config(function($mdThemingProvider) {
            // Configure a dark theme with primary foreground yellow
            $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
          });

    function WallReaderController($mdDialog, $http, $timeout, vkApiService) {
        var self = this;
        self.task = {
            title: 'Задачка',
            email: 'alex@ya.ru'
        };

        self.profileUid = 13559899;
        self.numPages = 0;
        self.pageNum = 1;
        self.posts = [];
   
        self.pageLoad = pageLoad;
        self.test = test;
        self.getWallPosts = getWallPosts;
      
        function test () {
          var params = {
                'owner_id':self.profileUid, offset:1 * 10, count:10,
          };
          vkApiService.get('wall.get', params).then(function (answer) {
              console.log('Wall Then:', answer);
          });

          vkApiService.getGroupProfiles('97785081').then(function (answer) {
              console.log('Group Then:', answer);
          });

          vkApiService.getGroupInfo('97785081').then(function (answer) {
              console.log('Info Then:', answer);
          });

          vkApiService.getWallPostInfo('-72495085_247709').then(function (answer) {
              console.log('wall.getById', answer);
          });

          vkApiService.getWallPostComments('-72495085', '247709').then(function (answer) {
              console.log('wall.getComments', answer);
          });
        }

        function pageLoad(event) {
            getWallPosts(self.profileUid, self.pageNum - 1);
        }

        function getWallPosts(profile_uid, page) {          
            var url, params;
            url = 'https://api.vk.com/method/wall.get';
            params = {
                'owner_id':profile_uid, offset:page * 10, count:10, 'v':'5.40',
                'callback':'JSON_CALLBACK'
            };
            return new Promise(function(resolve, reject){
                $http.jsonp(url, {'params':params, timeout: globalTimeOut}).then(function successCallback(response) {
                      if (response && response.data.hasOwnProperty('error')) {
                        resolve();
                        return;
                      }
                      var answer = response.data.response;
                      console.log(answer);

                      self.numPages = answer.count;
                      self.posts = answer.items;
                      self.posts.forEach(function (post) {
                          var attach = post.attachments;
                          if (!attach) {
                              return;
                          }
                          var length = attach.length;
                          var i = 1;
                          var attach_elem = null;
                          // for (i = 0; i < length; i += 1) {
                          //     attach_elem = attach[i];
                          //     if (attach_elem.hasOwnProperty('photo')) {
                          //         post.photo = attach_elem.photo.photo_130;
                          //     }
                          // }
                          var attach_elem = attach[0];
                          var attach_type = attach_elem.type;
                          if (attach_type == 'photo') {
                              post.photo = attach_elem.photo.photo_130;
                          }
                          if (attach_type == 'link') {
                              post.photo = attach_elem[attach_type].photo.photo_130;
                          }
                      });

                      resolve();
                    }, function errorCallback(response) {
                      console.log(response);
                      reject();
                });
              });
        }
    }
})();

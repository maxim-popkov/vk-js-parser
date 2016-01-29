(function () {
    'use strict';

    var globalTimeOut = 10000;


    var app = angular.module('app')
        .controller('postLoaderController', ['vkApiService', 'saveDataService', '$mdDialog', '$http', '$timeout', PostLoaderController])
        .config(function($mdThemingProvider) {
            // Configure a dark theme with primary foreground yellow
            $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
          });

    function PostLoaderController(vkApiService, saveDataService, $mdDialog, $http, $timeout) {
        // https://vk.com/wall13559899_1970
        var self = this;
        self.postLinksText = '';
        self.rawUids = [];

        self.processedPosts = [];

        self.actionDo = actionDo;
        self.postLinksTextChange = postLinksTextChange;
        self.removePosts = removePosts;
        self.isAnyChecked = isAnyChecked;

        function isAnyChecked () {
            var index = 0,
                post = null,
                length = self.processedPosts.length;

            for (index = 0; index < length; index += 1) {
                post = self.processedPosts[index];
                if (post.isChecked) {
                    return true;
                }
            }
            return false;
        }

        function postLinksTextChange () {
          // console.log('postLinksTextChange');
          var links = [],
              text = '',
              raw_uids = [],
              patternUid = /wall(-?\d+_\d+)/;

          text = self.postLinksText;
          links = text.split('\n');
          
          links.forEach(function (link) {
              var matches = link.match(patternUid);
              var raw_uid = null;
              if (matches) {
                  raw_uid = matches[1];
                  raw_uids.push(raw_uid);
              }
          });
          // console.log(raw_uids);
          self.rawUids = raw_uids;
        }

        self.saveAll = saveAll;
        function saveAll () {
            var profilesSet = {},
                profiles = [];
            var index, length, post;

            length = self.processedPosts.length;
            for (index = 0; index < length; index += 1) {
                post = self.processedPosts[index];
                post.profiles.forEach(function (profile) {
                    var uid = profile.from_id;
                    if (!profilesSet.hasOwnProperty(uid)) {
                        profilesSet[profile.from_id] = 1;
                    } 
                    profilesSet[profile.from_id] += 1; 
                });
            }

            for (index in profilesSet) {
                if (!index || index === 'undefined') {
                    continue;
                }
                // var mutualGroupsNumber = parseInt(self.mutualGroups, 10);
                // if (profiles_hash[index] > mutualGroupsNumber) {
                profiles.push(index);
                // }
            }

            saveDataService.saveProfilesUids(profiles);
        }

        self.getPost = getPost;
        function getPost(raw_uid) {
            var post = null;
            for (var index in self.processedPosts) {
                var processedPost = self.processedPosts[index];
                if (processedPost.raw_uid == raw_uid ) {
                    post = processedPost;
                    break;
                }
            }
            return post;
        }

        function removePosts () {
            var index = 0,
                removed = 0,
                length = self.processedPosts.length,
                post = null,
                tmpList = [];

            self.processedPosts.forEach(function (elem) {
                if (!elem.isChecked) {
                    tmpList.push(elem);
                }
            });

            self.processedPosts = tmpList;
            self.tmpList = null;
        }

        function getProfiles (raw_uid) {
            
            var post = self.getPost(raw_uid);
            var owner_uid = post.owner_uid;
            var post_uid = post.post_uid;
            var total = post.comments_total;
            var step = 100,
                offset = 0,
                locOffset = 0,
                index = 0;

            for (offset = 0, index = 0; offset < total + step; offset += step, index += 1) {
                setTimeout(function (){
                    var inOffset = locOffset;
                    vkApiService.getWallPostComments(owner_uid, post_uid, inOffset).then(
                        function (answer) {
                            Array.prototype.push.apply(post.profiles, answer.items);
                            post.processedUsersCnt += answer.items.length;
                            // console.log('delaedWork', answer);
                        }
                    );
                    locOffset += step;    
                }.bind(this), 1000 * index);
            }
        }

        function actionDo () {
            var rawUid = null;
            var promises = [];
            var p = null;
            for (var i = 0; i < self.rawUids.length; i++) {
                rawUid = self.rawUids[i];
                p = vkApiService.getWallPostInfo(rawUid);
                promises.push(p);
            }
            Promise.all(promises).then(
                function (answers) {
                    // console.log(answers);
                    var index = 0;
                    var length = answers.length;
                    var owner_uid, item_uid, post, ans, owner;
                    var posts = []
                    for (index = 0; index < length; index += 1) {
                        ans = answers[index];
                        if (ans.groups.length) {
                            owner = ans.groups[0];    
                        } else {
                            owner = ans.profiles[0];
                        }
                        post = {
                            name: owner.screen_name,
                            photo: owner.photo_100,
                            owner_uid: ans.items[0].from_id,
                            post_uid: ans.items[0].id,
                            raw_uid: ans.items[0].from_id + '_' + ans.items[0].id,
                            likes_count: ans.items[0].likes.count,
                            reposts_count: ans.items[0].reposts.count,
                            processedUsersCnt: 0,
                            comments_total: ans.items[0].comments.count,
                            isChecked: false,
                            profiles: []
                        };
                        var tmpText = ans.items[0].text;
                        if (tmpText) {
                            post.text = tmpText.slice(0, 64) + '...';
                        } else {
                            post.text = 'Без текста' + '...';
                        }

                        posts.push(post);
                    }
                    self.processedPosts = posts;
                    for (index = 0; index < length; index += 1) {
                        post = self.processedPosts[index];
                        getProfiles(post.raw_uid);
                    }
                }
            );
        }
    }
})();

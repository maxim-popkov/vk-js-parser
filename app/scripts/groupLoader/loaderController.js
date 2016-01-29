(function () {
    'use strict';

    Array.prototype.getUnique = function(){
        var u = {},
            a = [],
            i = 0,
            l = this.length,
            type = null;
       for (i = 0; i < l; i += 1) {
          if (Object.prototype.hasOwnProperty.call(u, this[i])) {
             continue;
          }
          type = typeof(this[i]);
          if (!(type == 'string' || type == 'number')) {
            continue;
          }
          a.push(this[i]);
          u[this[i]] = 1;
       }
       return a;
    };


    var globalTimeOut = 10000;
    // var converter = require('json-2-csv');

    angular.module('app')
        .controller('loaderController', ['vkApiService','$mdConstant','$mdDialog','$http', '$timeout', 'FileSaver', 'Blob', LoaderController])
        .config(function($mdThemingProvider) {
            // Configure a dark theme with primary foreground yellow
            $mdThemingProvider.theme('docs-dark', 'default')
            .primaryPalette('yellow')
            .dark();
          });


    function LoaderController(vkApiService, $mdConstant, $mdDialog, $http, $timeout, FileSaver) {
        var self = this;

        // var semicolon = 186;
        // self.separatorKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA, semicolon];

        self.task = {
          title: 'Задачка',
          email: 'alex@ya.ru'
        };
        self.city = '';
        self.country = '';
        self.countries = ['Россия', 'Украина','Белорусь','Все'];

        self.sex = 'Все';
        self.sexs = ['Все','Девушки','Мужчины'];
        self.sexs_val = [0,1,2];

        self.age_intervals =  ( function (lhs,rhs,ar) { while(lhs < rhs--) { ar[rhs-lhs] = rhs+1; }return ar;})(16, 60,[]);
        self.age_intervals.reverse();
        self.age_intervals.push('');
        self.ages = { from: '', to: ''};

        self.actionStatuses = ['Старт', 'Стоп'];
        self.actionBtn = {
          text: 'Старт',
          isDisabled: false
        };

        self.mutualGroups = '';

        self.saveBtn = {isDisabled: true};

        self.profiles = [];
        self.groupLinksText = 'http://vk.com/ru.skif\nvk.com/qimart\nyakyaks\ncontigroup\nsherwoood_club';
        self.targetGroups = ['ru.skif','qimart','yakyaks','contigroup', 'sherwoood_club'];
        self.processedGroups = [];

        self.actionDo = actionDo;
        self.removeGroups = removeGroups;
        self.swapActionStatus = swapActionStatus;
        self.getGroupInfo = getGroupInfo;
        self.getGroupProfiles = getGroupProfiles;
        self.getGroup = getGroup;
        self.saveAll = saveAll;
        self.checkByFilterProfle = checkByFilterProfle;
        self.filterProfiles = filterProfiles;
        self.isAnyChecked = isAnyChecked;

        self.groupLinksTextChange = groupLinksTextChange;
        

        self.controlsVisible = true;
        self.swapControlsVisible = swapControlsVisible;

        self.removeChip = removeChip;
        function removeChip ($chip) {
            // console.log($chip);
            var textNew = '';
            var textCurrent = self.groupLinksText;
            var links = textCurrent.split('\n');
            links.forEach(function (link) {
                var name = ExtractNameFromLink(link);
                if (name == $chip) {
                    return;
                }
                textNew += link + '\n';
            });
            self.groupLinksText = textNew;
        }

        function swapControlsVisible () {
            self.controlsVisible = !self.controlsVisible;
            console.log(self.controlsVisible);
        }

        function ExtractNameFromLink (link) {
            var patternUid = /vk.com/,
                name = '',
                index = -1;

                name = link;
                index = link.search(patternUid);
                if (index > -1) {
                    name = link.slice(index + 7, link.length + 1);
                }
                return name;
        }

        function groupLinksTextChange () {
            // console.log('groupLinksTextChange');
            var links = [],
                text = '',
                raw_uids = [],
                patternUid = /vk.com/,
                patternTest = /^[A-Za-z0-9_\.]{3,32}$/;

            text = self.groupLinksText;
            links = text.split('\n');
            
            links.forEach(function (link) {
                // console.log(link);
                var raw_uid = null;
                var index = link.search(patternUid);
                
                raw_uid = ExtractNameFromLink(link);
                if (!patternTest.test(raw_uid)) {
                    return  
                }
                if (raw_uids.indexOf(raw_uid) > -1) {
                    return
                }
                raw_uids.push(raw_uid);
            });

            // console.log(raw_uids);
            self.targetGroups = raw_uids;
        }
        function isAnyChecked () {
            var index = 0,
                group = null,
                length = self.processedGroups.length;

            for (index = 0; index < length; index += 1) {
                group = self.processedGroups[index];
                if (group.isChecked) {
                    return true;
                }
            }
            return false;
        }

        function removeGroups () {
            var index = 0,
                removed = 0,
                length = self.processedGroups.length,
                group = null,
                tmpList = [];

            self.processedGroups.forEach(function (elem) {
                if (!elem.isChecked) {
                    tmpList.push(elem);
                }
            });

            self.processedGroups = tmpList;
            self.tmpList = null;
        }

        function filterProfiles () {
          var index = 0;
          var group = null,
              profiles = null;
          for (index in self.processedGroups) {
              group = self.processedGroups[index];
              if (! group.profiles) {
                  continue; 
              }
              group.filteredProfiles = [];
              profiles = group.profiles.filter(self.checkByFilterProfle);
              Array.prototype.push.apply(group.filteredProfiles, profiles);
          }
        }

        function checkByFilterProfle(profile){
          if(!profile){
              return 0;
          }
          var filterFields = [];
          var check = true;
          if (self.sex != 'Все') {
              if (!profile.hasOwnProperty('sex')) return 0;
              var p = self.sexs.indexOf(self.sex);
              check = (profile.sex == self.sexs.indexOf(self.sex));
              if(!check) return 0;
          }
          if (self.country != 'Все' && self.country.length > 0){
              if (!profile.hasOwnProperty('country')) return 0;
              if (!profile.country.hasOwnProperty('title')) return 0;
              check = (profile.country.title.toLowerCase() == self.country.toLowerCase());
              if(!check) return 0;
          }
          if (self.city.length > 0) {
              if (!profile.hasOwnProperty('city')) return 0;
              if (!profile.city.hasOwnProperty('title')) return 0;
              check = (profile.city.title.toLowerCase() == self.city.toLowerCase());
              if(!check) return 0;
          }
          if (self.city.length > 0) {
              if (!profile.hasOwnProperty('city')) return 0;
              check = (profile.city.title.toLowerCase() == self.city.toLowerCase());
              if (!check) return 0;
          }

          var date = null,
              day = null,
              month = null,
              year = null,
              ages = null;

          if (profile.hasOwnProperty('bdate')) {
              date = profile.bdate.split('.');
              day = date[0];
              month = date[1];
              if (date.length == 3) {
                  year = date[2];
                  ages = new Date().getFullYear() - year;
              }
          }
          if (self.ages.to) {
              if (!year) return 0;
              check = (ages < self.ages.to);
              if (!check) return 0;
          }
          if (self.ages.from) {
              if (!year) return 0;
              check = (ages > self.ages.from);
              if (!check) return 0;
          }
          return 1;
        }

        function saveAll($event) {
            // console.log('saveAll');
            self.filterProfiles();
           
            var group = null,
                tmp = null,
                index = 0,
                res = [];

            /*save as json with groups */     
            // for (index in self.processedGroups) {
            //   group = self.processedGroups[index];
            //   tmp = {
            //     group_uid: group.group_uid,
            //     profiles: group.filteredProfiles
            //   };
            //   res.push(tmp);
            // }
            // var text = JSON.stringify(res);

            var text = '';
            var indexGroup = 0,
                indexProfile = 0,
                profile = null,
                profile_uid = 0,
                profile_uids = [];
            
            var profiles_sets = [];
            var profiles_hash = {};
            for (index in self.processedGroups) {    
                group = self.processedGroups[index];
                var pset = Immutable.Set();
                for (indexProfile in group.filteredProfiles) {
                    profile = group.filteredProfiles[indexProfile];
                    profile_uid = profile.id;
                    profile_uids.push(profile_uid);
                    pset.add(profile_uids);
                    if (!profiles_hash.hasOwnProperty(profile_uid)) {
                        profiles_hash[profile_uid] = 0;
                    }
                    profiles_hash[profile_uid] += 1;
                }
                profiles_sets.push(pset);
            }


            var final_uids = null;
            var length = null;
            if (self.mutualGroups) {
                var intersected_profiles = [];
                for (index in profiles_hash) {
                    if (!index || index === 'undefined') {
                        continue;
                    }
                    var mutualGroupsNumber = parseInt(self.mutualGroups, 10);
                    if (profiles_hash[index] > mutualGroupsNumber) {
                        intersected_profiles.push(index);
                    }
                }
                final_uids = intersected_profiles;  
            } else {
                final_uids = profile_uids.getUnique();
            }

            length = final_uids.length;
            for (index = 0; index <  length; index += 1 ) {
                profile_uid = final_uids[index];
                if (profile_uid == 'undefined') {
                  continue;
                }
                text += profile_uid + '\n';
            }

            var data = new Blob([text], { type: 'text/plain;charset=utf-8' });
            $timeout(FileSaver.saveAs.bind(FileSaver, data, 'profiles.csv'), 100);
        }

        function getGroup(group_uid) {
          var group = null;
          for (var index in self.processedGroups) {
            var processedGroup = self.processedGroups[index];
            if (processedGroup.group_uid == group_uid ) {
              group = processedGroup;
              break;
            }
          }
          return group;
        }

        function getGroupProfiles(group_uid) {
          var group = self.getGroup(group_uid);
          if (!group) {
            return;
          }
          var offsets = [],
              step = 1000,
              maxLimit = 150000;
          for (var offset = 0; offset < group.members + step && offset < maxLimit + step*2; offset += step) {
            offsets.push(offset);
          }
          offsets.reduce(function(cur, next_offset) {
              return cur.then(function(answer) {
                  if (answer && self.getGroup(group_uid)) {
                    var profiles = answer.items;
                    try {
                      group.processedUsersCnt += profiles.length;
                      Array.prototype.push.apply(group.profiles, profiles);
                    } catch (e) {
                      // console.log(e);
                    }
                  }
                  return vkApiService.getGroupProfiles(group_uid, next_offset);
              });
          }, Promise.resolve()).then(function() {
              self.filterProfiles();
              // console.log('all executed');
          });
        }

        function getGroupInfo(group_uid) {
          if (!group_uid) {
            return;
          }
          return new Promise(function (resolve, reject) {

            vkApiService.getGroupInfo(group_uid).then(
                function successCallback(answer) {
                    if (!answer || answer.hasOwnProperty('error')) {
                        resolve();
                        return;
                    }
                    var groupData = answer[0];
                    var group = {
                        group_uid: group_uid,
                        name: groupData.name,
                        photo: groupData.photo_100,
                        members: groupData.members_count,
                        info: groupData.description,
                        profiles:[],
                        filteredProfiles:[],
                        processedUsersCnt: 0,
                        isChecked: false
                    };
                    self.processedGroups.push(group);
                    resolve();
                }, 
                function errorCallback(response) {
                      // console.log(response);
                      reject();
                });
            });
        }

        function swapActionStatus(){
          var status = self.actionBtn.text;
          self.actionBtn.text = (status == 'Старт')? 'Стоп':'Старт';
        }

        function actionDo($event) {
            self.swapActionStatus();
            var work_groups = [];
            var index;
            for (index in self.targetGroups){
                var group_uid = self.targetGroups[index];
                if(!self.getGroup(group_uid)){
                    work_groups.push(group_uid);
                }
            }

            var promises = [];
            for (index in work_groups) {
                var p = self.getGroupInfo(work_groups[index]);
                promises.push(p);
            }
            Promise.all(promises).then(
                function () {
                    for (index in work_groups) {
                        self.getGroupProfiles(work_groups[index]);
                    }
                    self.swapActionStatus();
                }
            );
        }

    }

})();

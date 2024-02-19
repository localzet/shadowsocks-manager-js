/*
 * @package     ShadosSocks Manager
 * @link        https://github.com/localzet/shadowsocks-manager-js
 * @link        https://github.com/shadowsocks/shadowsocks-manager
 *
 * @author      Ivan Zorin <creator@localzet.com>
 * @copyright   Copyright (c) 2018-2024 Zorin Projects S.P.
 * @license     https://www.gnu.org/licenses/agpl-3.0 GNU Affero General Public License v3.0
 *
 *              This program is free software: you can redistribute it and/or modify
 *              it under the terms of the GNU Affero General Public License as published
 *              by the Free Software Foundation, either version 3 of the License, or
 *              (at your option) any later version.
 *
 *              This program is distributed in the hope that it will be useful,
 *              but WITHOUT ANY WARRANTY; without even the implied warranty of
 *              MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *              GNU Affero General Public License for more details.
 *
 *              You should have received a copy of the GNU Affero General Public License
 *              along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 *              For any questions, please contact <creator@localzet.com>
 */

const app = angular.module('app');

app.controller('AdminNoticeController', ['$scope', '$http', '$state', ($scope, $http, $state) => {
    $scope.setTitle('公告管理');
    $scope.setMenuButton('arrow_back', function () {
        $state.go('admin.settings');
    });
    $scope.setFabButton(() => {
        $state.go('admin.addNotice');
    });
    $http.get('/api/admin/notice').then(success => {
        $scope.notices = success.data;
    });
    $scope.editNotice = id => {
        $state.go('admin.editNotice', {noticeId: id});
    };
}])
    .controller('AdminEditNoticeController', ['$scope', '$http', '$state', '$stateParams', 'markdownDialog', 'setNoticeGroupDialog', 'confirmDialog', ($scope, $http, $state, $stateParams, markdownDialog, setNoticeGroupDialog, confirmDialog) => {
        $scope.setTitle('编辑公告');
        $scope.setMenuButton('arrow_back', 'admin.notice');
        $http.get('/api/admin/notice/' + $stateParams.noticeId).then(success => {
            $scope.notice = success.data;
            $scope.notice.groupObj = {};
            if ($scope.notice.group) {
                $scope.notice.groups.forEach(groupId => {
                    $scope.notice.groupObj[groupId] = true;
                });
            }
        });
        $scope.delete = () => {
            confirmDialog.show({
                text: '真的要删除公告吗？',
                cancel: '取消',
                confirm: '删除',
                error: '删除公告失败',
                fn: function () {
                    return $http.delete('/api/admin/notice/' + $stateParams.noticeId);
                },
            }).then(() => {
                $state.go('admin.notice');
            });
        };
        $scope.save = () => {
            $http.put('/api/admin/notice/' + $stateParams.noticeId, {
                title: $scope.notice.title,
                content: $scope.notice.content,
                group: $scope.notice.group,
                autopop: $scope.notice.autopop,
                groups: $scope.notice.groups,
            }).then(success => {
                $state.go('admin.notice');
            });
        };
        $scope.preview = () => {
            markdownDialog.show($scope.notice.title, $scope.notice.content);
        };
        $http.get('/api/admin/group').then(success => {
            $scope.groups = success.data;
            // $scope.groups.unshift({ id: -1, name: '所有组', comment: '所有组' });
        });
        $scope.setNoticeGroup = () => {
            setNoticeGroupDialog.show($scope.notice, $scope.groups);
        };
        $scope.$watch('notice.groupObj', () => {
            if ($scope.notice && $scope.notice.group) {
                $scope.notice.groups = [];
                for (const go in $scope.notice.groupObj) {
                    if ($scope.notice.groupObj[go]) {
                        $scope.notice.groups.push(+go);
                    }
                }
            }
        }, true);
    }])
    .controller('AdminNewNoticeController', ['$scope', '$http', '$state', 'markdownDialog', 'setNoticeGroupDialog', ($scope, $http, $state, markdownDialog, setNoticeGroupDialog) => {
        $scope.setTitle('新增公告');
        $scope.notice = {
            group: 0,
            groupObj: {},
        };
        $scope.setMenuButton('arrow_back', 'admin.notice');
        $scope.cancel = () => {
            $state.go('admin.notice');
        };
        $scope.save = () => {
            $http.post('/api/admin/notice/', {
                title: $scope.notice.title,
                content: $scope.notice.content,
                group: $scope.notice.group,
                groups: $scope.notice.groups,
                autopop: $scope.notice.autopop,
            }).then(success => {
                $state.go('admin.notice');
            });
        };
        $scope.preview = () => {
            markdownDialog.show($scope.notice.title, $scope.notice.content);
        };
        $http.get('/api/admin/group').then(success => {
            $scope.groups = success.data;
            // $scope.groups.unshift({ id: -1, name: '所有组', comment: '所有组' });
        });
        $scope.setNoticeGroup = () => {
            setNoticeGroupDialog.show($scope.notice, $scope.groups);
        };
        $scope.$watch('notice.groupObj', () => {
            if ($scope.notice && $scope.notice.group) {
                $scope.notice.groups = [];
                for (const go in $scope.notice.groupObj) {
                    if ($scope.notice.groupObj[go]) {
                        $scope.notice.groups.push(+go);
                    }
                }
            }
        }, true);
    }])
;

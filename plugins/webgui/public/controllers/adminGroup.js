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

app.controller('AdminGroupSettingController', ['$scope', '$http', '$state',
($scope, $http, $state) => {
  $scope.setTitle('群组管理');
  $scope.setMenuButton('arrow_back', function() {
    $state.go('admin.settings');
  });
  $scope.setFabButton(() => {
    $state.go('admin.addGroup');
  });
  $http.get('/api/admin/group').then(success => {
    $scope.groups = success.data;
  });
  $scope.editGroup = id => { $state.go('admin.editGroup', { groupId: id }); };
}
]).controller('AdminAddGroupController', ['$scope', '$q', '$http', '$state', 'alertDialog', 'setGroupNoticeDialog', 'setGroupOrderDialog',
($scope, $q, $http, $state, alertDialog, setGroupNoticeDialog, setGroupOrderDialog) => {
  $scope.setTitle('新增群组');
  $scope.setMenuButton('arrow_back', 'admin.groupSetting');
  $scope.group = {};
  $q.all([
    $http.get('/api/admin/order'),
    $http.get('/api/admin/notice'),
  ]).then(success => {
    $scope.orders = success[0].data;
    $scope.notices = success[1].data;
    $scope.group.groupOrder = !!$scope.group.order;
    $scope.groupOrderObj = {};
    // if($scope.group.order) {
    //   $scope.orders.forEach(order => {
    //     if($scope.group.order.indexOf(order.id) >= 0) {
    //       $scope.groupOrderObj[order.id] = true;
    //     } else {
    //       $scope.groupOrderObj[order.id] = false;
    //     }
    //   });
    // }
    $scope.group.noticeObj = {};
    $scope.group.notices = [];
    for(const notice of $scope.notices) {
      if(!notice.group) {
        $scope.group.noticeObj[notice.id] = {
          value: true,
          disabled: true,
        };
        $scope.group.notices.push(notice.id);
      } else {
        $scope.group.noticeObj[notice.id] = {
          value: false,
          disabled: false,
        };
      }
    }
  });
  $scope.$watch('group.noticeObj', () => {
    $scope.group.notices = [];
    for(const no in $scope.group.noticeObj) {
      if($scope.group.noticeObj[no].value) {
        $scope.group.notices.push(+no);
      }
    }
  }, true);
  $scope.$watch('groupOrderObj', () => {
    if($scope.group.groupOrder) {
      $scope.group.order = [];
      for(const goo in $scope.groupOrderObj) {
        if($scope.groupOrderObj[goo]) {
          $scope.group.order.push(+goo);
        }
      }
    } else {
      $scope.group.order = null;
    }
  }, true);
  $scope.$watch('group.groupOrder', () => {
    if($scope.group.groupOrder) {
      $scope.group.order = [];
      for(const goo in $scope.groupOrderObj) {
        if($scope.groupOrderObj[goo]) {
          $scope.group.order.push(+goo);
        }
      }
    } else {
      $scope.group.order = null;
    }
  }, true);
  $scope.confirm = () => {
    alertDialog.loading();
    // const order = Object.keys($scope.groupOrderObj)
    // .map(m => {
    //   if($scope.groupOrderObj[m]) {
    //     return +m;
    //   }
    // })
    // .filter(f => f);
    // $scope.group.order = $scope.groupOrder ? order : null;
    $http.post('/api/admin/group', {
      name: $scope.group.name,
      comment: $scope.group.comment,
      order: $scope.group.order,
      multiAccount: $scope.group.multiAccount,
      notices: $scope.group.notices,
    }, {
      timeout: 15000,
    }).then(success => {
      alertDialog.show('添加群组成功', '确定');
      $state.go('admin.groupSetting');
    }).catch(() => {
      alertDialog.show('添加群组失败', '确定');
    });
  };
  $scope.cancel = () => {
    $state.go('admin.groupSetting');
  };
  $scope.setGroupNotice = () => {
    setGroupNoticeDialog.show($scope.group, $scope.notices);
  };
  $scope.setGroupOrder = () => {
    setGroupOrderDialog.show($scope.group, $scope.orders, $scope.groupOrderObj);
  };
}
]).controller('AdminEditGroupController', ['$scope', '$http', '$q', '$state', '$stateParams', 'alertDialog', 'setGroupNoticeDialog', 'setGroupOrderDialog',
($scope, $http, $q, $state, $stateParams, alertDialog, setGroupNoticeDialog, setGroupOrderDialog) => {
  $scope.setTitle('修改群组');
  $scope.setMenuButton('arrow_back', 'admin.groupSetting');
  $scope.groupId = +$stateParams.groupId;
  $scope.group = {};
  $q.all([
    $http.get(`/api/admin/group/${ $scope.groupId }`),
    $http.get('/api/admin/order'),
    $http.get('/api/admin/notice'),
  ]).then(success => {
    $scope.group = success[0].data;
    $scope.orders = success[1].data;
    $scope.notices = success[2].data;
    $scope.group.groupOrder = !!$scope.group.order;
    $scope.groupOrderObj = {};
    if($scope.group.order) {
      $scope.group.order = JSON.parse($scope.group.order);
      $scope.orders.forEach(order => {
        if($scope.group.order.indexOf(order.id) >= 0) {
          $scope.groupOrderObj[order.id] = true;
        } else {
          $scope.groupOrderObj[order.id] = false;
        }
      });
    }
    $scope.group.noticeObj = {};
    $scope.group.notices = [];
    for(const notice of $scope.notices) {
      if(!notice.group) {
        $scope.group.noticeObj[notice.id] = {
          value: true,
          disabled: true,
        };
        $scope.group.notices.push(notice.id);
      } else {
        $scope.group.noticeObj[notice.id] = {
          value: notice.groupIds.includes($scope.group.id),
          disabled: false,
        };
        if(notice.groupIds.includes($scope.group.id)) {
          $scope.group.notices.push(notice.id);
        }
      }
    }
  });
  $scope.$watch('group.noticeObj', () => {
    $scope.group.notices = [];
    for(const no in $scope.group.noticeObj) {
      if($scope.group.noticeObj[no].value) {
        $scope.group.notices.push(+no);
      }
    }
  }, true);
  $scope.$watch('groupOrderObj', () => {
    if($scope.group.groupOrder) {
      $scope.group.order = [];
      for(const goo in $scope.groupOrderObj) {
        if($scope.groupOrderObj[goo]) {
          $scope.group.order.push(+goo);
        }
      }
    } else {
      $scope.group.order = null;
    }
  }, true);
  $scope.$watch('group.groupOrder', () => {
    if($scope.group.groupOrder) {
      $scope.group.order = [];
      for(const goo in $scope.groupOrderObj) {
        if($scope.groupOrderObj[goo]) {
          $scope.group.order.push(+goo);
        }
      }
    } else {
      $scope.group.order = null;
    }
  }, true);
  $scope.confirm = () => {
    alertDialog.loading();
    $http.put(`/api/admin/group/${ $scope.groupId }`, {
      name: $scope.group.name,
      comment: $scope.group.comment,
      order: $scope.group.order,
      multiAccount: $scope.group.multiAccount,
      notices: $scope.group.notices,
    }, {
      timeout: 15000,
    }).then(success => {
      alertDialog.show('修改群组成功', '确定');
      $state.go('admin.groupSetting');
    }).catch(() => {
      alertDialog.show('修改群组失败', '确定');
    });
  };
  $scope.cancel = () => {
    $state.go('admin.groupSetting');
  };
  $scope.delete = () => {
    alertDialog.loading();
    $http.delete(`/api/admin/group/${ $scope.groupId }`, {
      timeout: 15000,
    }).then(success => {
      alertDialog.show('删除群组成功', '确定');
      $state.go('admin.groupSetting');
    }).catch(() => {
      alertDialog.show('删除群组失败', '确定');
    });
  };
  $scope.setGroupNotice = () => {
    setGroupNoticeDialog.show($scope.group, $scope.notices);
  };
  $scope.setGroupOrder = () => {
    setGroupOrderDialog.show($scope.group, $scope.orders, $scope.groupOrderObj);
  };
}
]);

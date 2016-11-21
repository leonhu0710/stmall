define(function (require, exports, module) {
    var $ = require('jquery');
    /** @Inject:mock */
    var factories = {
        /**
         * 请求(继承于$http)
         */
        $request: ['$http', '$q', 'apiUri', function ($http, $q, apiUri) {
            var request = function (path, params, method) {
                var deferred = $q.defer(),
                    profile = $.parseJSON(/*$cookies.get('profile') ||*/ '{}'),
                    token = profile.token,
                    memberId = profile.memberId,
                    data = {_seed: new Date().getTime()};
                if (method == 'GET' || method == 'DELETE') {
                    data = $.extend(data, params);
                } else {
                    data = $.extend(data, {
                        requestData: params
                    });
                }
                if (token) {
                    data.token = token;
                }
                if (memberId) {
                    data.memberId = memberId;
                }
                var options = {
                    url: typeof mock == 'undefined' ? apiUri + path : path,
                    method: method,
                    contentType: 'application/raw',
                    cache: false,
                    data: data,
                    beforeSend: function () {
                        $('body').addClass('loading');
                    },
                    complete: function () {
                        $('body').removeClass('loading');
                    }
                };
                console.log('[请求][' + options.url + '][' + options.method + ']数据接口,参数:', data);
                try {
                    $.ajax(options).success(function (data) {
                        console.log('[响应][' + options.url + '][' + options.method + ']数据接口,返回:', data);
                        if (data.responseCode == "000000") {
                            deferred.resolve(data.responseData);
                        } else {
                            deferred.reject(data.desc);
                        }
                    }).error(function (err) {
                        deferred.reject('网络出现问题');
                    });
                } catch (e) {

                }
                return deferred.promise;
            };
            return {
                'get': function (path, params) {
                    return request(path, params, 'GET');
                },
                'post': function (path, params) {
                    return request(path, params, 'POST');
                },
                'put': function (path, params) {
                    return request(path, params, 'PUT');
                },
                'delete': function (path, params) {
                    return request(path, params, 'DELETE');
                }
            };
        }]
    };
    module.exports = {
        regFactories: function (ngModule) {
            for (var key in factories) {
                ngModule.factory(key, factories[key]);
            }
        }
    };
});
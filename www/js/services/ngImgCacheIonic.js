angular.module('ngImgCache', ['ionic','ngCordova'])

.run(function($ionicPlatform, $log) {
    if(window.cordova){
        ImgCache.options.debug = false;
        ImgCache.options.chromeQuota = 50*1024*1024;
        $ionicPlatform.ready(function() {
            ImgCache.options.cordovaFilesystemRoot = cordova.file.dataDirectory;
            ImgCache.init(function() {
                $log.debug('ImgCache init: success!');
                console.log('ImgCache init: success!');
            }, function(){
                $log.error('ImgCache init: error! Check the log for errors');
                console.log('ImgCache init: error! Check the log for errors');
            });
        });
    }
})
.service('CacheImages', function($q, $rootScope){
    if(window.cordova){
        return {
            checkCacheStatus : function(src){
                var deferred = $q.defer();
                if(src != ("http://" + $rootScope.settings.server_ip + "/")){
                    ImgCache.isCached(src, function(path, success) {
                        if (success) {
                            deferred.resolve(path);
                        } else {
                            ImgCache.cacheFile(src, function() {
                                ImgCache.isCached(src, function(path, success) {
                                    deferred.resolve(path);
                                }, deferred.reject);
                            }, deferred.reject);
                        }
                    }, deferred.reject); 
                }
                else{
                    deferred.reject();
                }
                return deferred.promise;
            },
            removeFromCache : function(src){
                if(src && src.length > 0){
                    ImgCache.isCached(src, function(path, success) {
                        if (success) {
                            ImgCache.removeFile(src);
                        }
                    });
                }
            },
            clearCache : function(){
                def = $q.defer();
                ImgCache.clearCache(
                    function() {
                        def.resolve();
                    },
                    function() {
                        def.reject();
                    }
                );
                return def.promise;
            }
        };
    }
})

// <img ng-cache ng-src="..." />
.directive('ngCache', function($rootScope) {
    if(window.cordova){
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                attrs.$observe('backImg', function(src) {
                if(src != ("http://" + $rootScope.settings.server_ip + "/")){
                    ImgCache.isCached(src, function(path, success) {
                        if (success) {
                            //console.log("SUCCESS", el);
                            ImgCache.useCachedBackground(el);
                        } else {
                                console.log("downloading: ", src);
                                ImgCache.cacheFile(src, function() {
                                    ImgCache.useCachedBackground(el);
                                });
                        }
                    });
                }
                });
            }
        };
    }
})

.directive('ngCacheSrc', function($rootScope) {
    if(window.cordova){
        return {
            restrict: 'A',
            link: function(scope, el, attrs) {
                attrs.$observe('ngSrc', function(src) {
                    if(src != ("http://" + $rootScope.settings.server_ip + "/")){
                        ImgCache.isCached(src, function(path, success) {
                            if (success) {
                                ImgCache.useCachedFile(el);
                            } else {
                                ImgCache.cacheFile(src, function() {
                                    ImgCache.useCachedFile(el);
                                });
                            }
                        });
                    }
                });
            }
        };
    }
});

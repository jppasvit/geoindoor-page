/*
 * AnyPlace: A free and open Indoor Navigation Service with superb accuracy!
 *
 * Anyplace is a first-of-a-kind indoor information service offering GPS-less
 * localization, navigation and search inside buildings using ordinary smartphones.
 *
 * Author(s): Kyriakos Georgiou
 *
 * Supervisor: Demetrios Zeinalipour-Yazti
 *
 * URL: http://anyplace.cs.ucy.ac.cy
 * Contact: anyplace@cs.ucy.ac.cy
 *
 * Copyright (c) 2015, Data Management Systems Lab (DMSL), University of Cyprus.
 * All rights reserved.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of
 * this software and associated documentation files (the “Software”), to deal in the
 * Software without restriction, including without limitation the rights to use, copy,
 * modify, merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so, subject to the
 * following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS
 * OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 */

app.controller('ControlBarController', ['$scope', '$rootScope', '$routeParams', '$location', '$compile', 'GMapService', 'AnyplaceService', function ($scope, $rootScope, $routeParams, $location, $compile, GMapService, AnyplaceService) {

    $scope.anyService = AnyplaceService;
    $scope.gmapService = GMapService;

    $scope.isFirefox = navigator.userAgent.search("Firefox") > -1;

    $scope.creds = {
        username: 'username',
        password: 'password'
    };

    $scope.tab = 1;

    var _err = function (msg) {
        $scope.anyService.addAlert('danger', msg);
    };

    var _urlParams = $location.search();
    if (_urlParams) {
        $scope.urlBuid = _urlParams.buid;
        $scope.urlFloor = _urlParams.floor;
        $scope.urlPuid = _urlParams.selected;
    }

    $scope.setTab = function (num) {
        $scope.tab = num;
    };

    $scope.isTabSet = function (num) {
        return $scope.tab === num;
    };

    // pass scope to mylocation control in the html
    var myLocControl = $('#my-loc-control');

    myLocControl.replaceWith($compile(myLocControl.html())($scope));
    var myLocMarker = undefined;
    var accuracyRadius = undefined;
    $scope.userPosition = undefined;
    var watchPosNum = -1;

    var pannedToUserPosOnce = false;
    $scope.isUserLocVisible = false;

    $scope.getIsUserLocVisible = function () {
        return $scope.isUserLocVisible;
    };

    $scope.panToUserLocation = function () {
        if (!$scope.userPosition)
            return;

        GMapService.gmap.panTo($scope.userPosition);
        GMapService.gmap.setZoom(20);
    };

    $scope.isMyLocMarkerShown = function () {
        return (myLocMarker && myLocMarker.getMap());
    };

    $scope.displayMyLocMarker = function (posLatlng) {
        if (myLocMarker && myLocMarker.getMap()) {
            myLocMarker.setPosition(posLatlng);
            return;
        }

        var s = new google.maps.Size(20, 20);
        if ($scope.isFirefox)
            s = new google.maps.Size(48, 48);

        myLocMarker = new google.maps.Marker({
            position: posLatlng,
            map: GMapService.gmap,
            draggable: false,
            icon: {
                url: 'build/images/location-radius-centre.png',
                origin: new google.maps.Point(0, 0), /* origin is 0,0 */
                anchor: new google.maps.Point(10, 10), /* anchor is bottom center of the scaled image */
                size: s,
                scaledSize: new google.maps.Size(20, 20)
            }
        });
    };

    $scope.showUserLocation = function () {

        if ($scope.getIsUserLocVisible()) {
            $scope.hideUserLocation();
	 
            if (navigator.geolocation)
                navigator.geolocation.clearWatch(watchPosNum);

            return;
        }

        if (navigator.geolocation) {
            watchPosNum = navigator.geolocation.watchPosition(
                function (position) {

                    var posLatlng = {lat: position.coords.latitude, lng: position.coords.longitude};
                    //var radius = position.coords.accuracy;

                    $scope.userPosition = posLatlng;

                    $scope.displayMyLocMarker(posLatlng);

                    var infowindow = new google.maps.InfoWindow({
                        content: 'Your current location.',
                        maxWidth: 500
                    });

                    google.maps.event.addListener(myLocMarker, 'click', function () {
                        var self = this;
                        $scope.$apply(function () {
                            infowindow.open(GMapService.gmap, self);
                        })
                    });

                    if (!$scope.isUserLocVisible) {
                        $scope.$apply(function () {
                            $scope.isUserLocVisible = true;
                        });
                    }

                    if (!pannedToUserPosOnce) {
                        GMapService.gmap.panTo(posLatlng);
                        GMapService.gmap.setZoom(19);
                        pannedToUserPosOnce = true;
                    }
                },
                function (err) {
                    $scope.$apply(function () {
                        if (err.code == 1) {
                            _err("Permission denied. Anyplace was not able to retrieve your Geolocation.")
                        } else if (err.code == 2) {
                            _err("Position unavailable. The network is down or the positioning satellites couldn't be contacted.")
                        } else if (err.code == 3) {
                            _err("Timeout. The request for retrieving your Geolocation was timed out.")
                        } else {
                            _err("There was an error while retrieving your Geolocation. Please try again.");
                        }
                    });
                });
        } else {
            _err("The Geolocation feature is not supported by this browser.");
        }
    };
	// GEO-INDOOR API +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
	
	var pospassed=[  ];
	var _win = function(poss,allpos) {
		var val=pospassed.some(function(elemento){
			var retorno = elemento.some(function(item){
				console.log(item[0] == poss[0] && item[1] == poss[1]);
				return item[0] == poss[0] && item[1] == poss[1];
			});
			return retorno;
		});
		if (!val){
			alert("HAS LLEGADO A OTRO PUNTO");
			pospassed.push(allpos);
			navigator.geolocation.clearWatch(watchPosNum);
			$scope.showUserLocation();
			console.log("POSITIONS-ROUTE: " + pospassed + " TRUE" );
			return true;
		}else{
			navigator.geolocation.clearWatch(watchPosNum);
			$scope.showUserLocation();
			console.log("POSITIONS-ROUTE: " + pospassed + " FALSE");
			return false;
		}
			 
	};
	
	
	
	
	
	$scope.getPointLocationUser = function (positions) {
		if ($scope.getIsUserLocVisible()) {
            $scope.hideUserLocation();
	 
            if (navigator.geolocation)
                navigator.geolocation.clearWatch(watchPosNum);

            return;
        }
		
		
		if (navigator.geolocation) {
			function success(position) {
				var latitude  = position.coords.latitude;
				var longitude = position.coords.longitude;
				
				positions.some(function(elemento){
					var retorno = elemento.some(function(item){
						var FIXED=2;
						var latfixed=latitude.toFixed(FIXED);
						var longfixed=longitude.toFixed(FIXED);
						
						if ( item[0] == latfixed && item[1] == longfixed){
							console.log("ITEM: " + item + " LATITUDE and LONGITUDE: " + latfixed + " and " + longfixed); 
							if (_win([latfixed, longfixed],elemento)) return true;
						}else{
							console.log("ITEM: " + item + " LATITUDE and LONGITUDE: " + latfixed + " and " + longfixed); 
						}
					});
					return retorno;
				});
				
			};
			var options = {
				enableHighAccuracy: true
			};
			
			watchPosNum=navigator.geolocation.watchPosition(success,_err("Start"),options);
		}
	};
	
	
	
	

	// GEO-INDOOR API +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-++-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

    $scope.hideUserLocation = function () {
        if (myLocMarker)
            myLocMarker.setMap(null);
        $scope.isUserLocVisible = false;
    };

    $scope.showAndroidPrompt = function () {
        try {
            if (typeof(Storage) !== "undefined" && localStorage) {
                if (localStorage.getItem("androidPromptShown")) {
                    var d = $('#android_top_DIV_1');
                    if (d)
                        d.remove();
                }
            }
        } catch (e) {

        }
    };

    $scope.hideAndroidBar = function () {
        var d = $('#android_top_DIV_1');
        if (d)
            d.remove();

        try {
            if (typeof(Storage) !== "undefined" && localStorage) {
                localStorage.setItem("androidPromptShown", true);
            }
        } catch (e) {

        }
    };

    // check if android device to prompt.
    var ua = navigator.userAgent.toLowerCase();
    var isAndroid = ua.indexOf("android") > -1 && !ua.indexOf("windows") > -1;
    var d = $('#android_top_DIV_1');
    if (d)
        if (isAndroid)
            d.css({display: 'block'});

    $scope.centerViewToSelectedItem = function () {
        var position = {};
        if ($scope.anyService.selectedPoi) {
            var p = $scope.anyService.selectedPoi;
            position = {lat: parseFloat(p.coordinates_lat), lng: parseFloat(p.coordinates_lon)};
        } else if ($scope.anyService.selectedBuilding) {
            var b = $scope.anyService.selectedBuilding;
            position = {lat: parseFloat(b.coordinates_lat), lng: parseFloat(b.coordinates_lon)};
        } else {
            _err("No building is selected.");
            return;
        }

        $scope.gmapService.gmap.panTo(position);
        $scope.gmapService.gmap.setZoom(20);
    }
    // GEOINDOOR -- -- -- -- -- -- -- --
    $scope.OLD_Building;
    // Se utiliza para inciciar el cambio de rutas, al cambiar el edificio
    $scope.storeTranslate = function() {
        $scope.OLD_Building = $("input[name='nombreEdificio']").val();
        $("input[name='nombreEdificio']").val($scope.anyService.selectedBuilding.name);
        $("input[name='nombreEdificio']").click();
    };
    // Se utiliza para inciciar el cambio de rutas, al cambiar el edificio
    $("#showRoutes").on('click', function() { 
        console.log( "\n Edificio Translate: " + $scope.anyService.selectedBuilding.name + "\n");
        if(!$scope.anyService.selectedBuilding.name){
            $("input[name='nombreEdificio']").val("There are not routes");
            $("input[name='nombreEdificio']").click();
        }else{
            if( $scope.anyService.selectedBuilding.name != $scope.OLD_Building ){
                $scope.OLD_Building = $scope.anyService.selectedBuilding.name;
                $("input[name='nombreEdificio']").val($scope.anyService.selectedBuilding.name);
                $("input[name='nombreEdificio']").click();
            }
        }
    });
    // GEOINDOOR -- -- -- -- -- -- -- -- 
}
])
;
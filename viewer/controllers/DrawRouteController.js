app.controller('DrawRouteController',  ['$scope', '$compile', 'GMapService', 'AnyplaceService', 'AnyplaceAPIService','$http', function ($scope, $compile, GMapService, AnyplaceService, AnyplaceAPIService,$http) {

	$scope.anyService = AnyplaceService;

	$scope.storeRoutesName = ["RUTA_1", "RUTA_2", "RUTA_3"];
	$scope.selectedRoute;
	
	// Gestión de mensajes ---

	// Información relevante
	$scope.info = function (msg) {
        $scope.anyService.addAlert('info', msg);
    };
    // Warning
    $scope.warn = function (msg) {
        $scope.anyService.addAlert('warning', msg);
    };
    // Error
    $scope.err = function (msg) {
        $scope.anyService.addAlert('danger', msg);
    };
    // Éxito
    $scope.suc = function (msg) {
        $scope.anyService.addAlert('success', msg);
    };
    // _getIdEdificio()
    // Devuelve id del edificio elegido
    $scope._getIdEdificio = function() {
        var edificio = $("input[name='nombreEdificio']").val();
        var retorno = edificio.substr(0,edificio.indexOf(" "));
        return retorno;
    };
    // myGetRoutes()
	// Devuelve las rutas haciendo una llamada a la base de datos
    $scope.myGetRoutes = function () { 
	    var id = $scope._getIdEdificio();  
		var datarequest = {
            idedificio: id,
        }
        return $http({

            method: 'POST',
            url: "https://geoindoorapi.herokuapp.com/Rutas/Edificio",
            headers: {'Content-Type': 'application/x-www-form-urlencoded'},
            transformRequest: function(obj) {
                var str = [];
                for(var p in obj){
                    str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
                }
                return str.join("&");
            },
            data: datarequest
		}).success(function (data,status) {
			console.log("myGetRoutes-> " + "data: " + data + " \n" + "status: " + status );
            console.log("ERROR en myGetRoutes");
			return data;
		});
	};

    // storeRoutes()
    // Guardar las rutas
    $scope.storeRoutes = function() {
        var promise = new Promise(function(resolve, reject) {
            var data =  $scope.myGetRoutes();
            if ( data ) {
                resolve(data);
            }else{
                reject("Error en storeRoutes");
            }
        });
        promise.then(function(result) {
            var rutas = result.data;
            console.log("Rutas: " + rutas);
            $scope.storeRoutesName = [];
            if (rutas == "There are not routes") {
                $scope.storeRoutesName.push(rutas);
                console.log("Rutas de storeRoutesName");
                console.log($scope.storeRoutesName);
            }else{
                Object.keys(rutas).forEach(function(key) {$scope.storeRoutesName.push(rutas[key]["nombre"])});
                console.log("Rutas de storeRoutesName");
                console.log($scope.storeRoutesName);
            }
        },function(err) {
            console.log(err);
        });
         
    };

    var flightPath;
    var flightPathCoordinates = [
                  /*{lat: 37.772, lng: -122.214},
                  {lat: 21.291, lng: -157.821},
                  {lat: -18.142, lng: 178.431},
                  {lat: -27.467, lng: 153.027}*/
                ];

    $scope.myDrawRoute = function(){

        var rutas ;
        var ids ;
        var ruta;

        var promise = new Promise(function(resolve, reject) {
            var data =  $scope.myGetRoutes();
            if ( data ) {
                resolve(data);
            }else{
                reject("Error en storeRoutes");
            }
        });
        promise.then(function(result) {
            rutas = result.data;
            console.log("Rutas: " + rutas);
            if (rutas == "There are not routes") {
                console.log("Rutas de myDrawRoute: No hay rutas");
                console.log(rutas);
            }else{
                flightPathCoordinates = [ ];
                ids = Object.keys(rutas);
                console.log("Rutas de myDrawRoute");
                console.log(rutas);
                ids.forEach(function(key) {
                    console.log($scope.selectedRoute + " - id " + key + " - " + rutas[key]["nombre"] );
                    if( rutas[key]["nombre"] == $scope.selectedRoute ){
                        ruta = rutas[key];
                    }
                });
                console.log("Ruta encontrada ");
                console.log(ruta);
                
                var rutaInfo = JSON.parse(ruta["ruta"]);
                console.log(rutaInfo);

                rutaInfo.forEach(function(myruta){
                    var coord = {
                        lat: parseFloat(myruta["lat"]), 
                        lng: parseFloat(myruta["lng"])
                    }
                    flightPathCoordinates.push(coord);
                    console.log(myruta);
                });
                console.log(flightPathCoordinates);
                flightPath = new google.maps.Polyline({
                  path: flightPathCoordinates,
                  strokeColor: '#00ff00',
                  strokeOpacity: 1.0,
                  strokeWeight: 4
                });
                flightPath.setMap(GMapService.gmap);

            }
        },function(err) {
            console.log(err);
        });

       
    }
    $scope.removeLine = function(){
        if (flightPath) {flightPath.setMap(null);}
    }

    // Mostrar las rutas una vez inicializada la página
    setTimeout(function(){$scope.storeRoutes()}, 3000);
    //setTimeout(function(){$scope.myDrawRoute()}, 9000);
	
}]);
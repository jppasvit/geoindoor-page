app.controller("MyDraw",['$scope', '$compile', 'GMapService', 'AnyplaceService', 'AnyplaceAPIService','$http', function ($scope, $compile, GMapService, AnyplaceService, AnyplaceAPIService,$http) {
	
	$scope.anyService = AnyplaceService;

	$scope.storeRoutesName = [];
	
	
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


	// ---


	// myStoreRoutes
	// Mostrar las rutas guardadas
	$scope.myStoreRoutes = function() {
		var promise = $scope.myGetRoutes();
		promise.then(function(resp) {
			if(resp.config.data.edificio == getEdificio() || getEdificio() == "{{anyService.selectedBuilding.name}}"){
				$scope.storeRoutesName = [];
				//console.log(resp.config.data.edificio);
				var rutas = resp.data[Object.keys(resp.data)[0]];
				Object.keys(rutas).forEach(function(key) {
					$scope.storeRoutesName.push(rutas[key]["nombre"]);
				});
				//console.log("Sin Ordenar " + $scope.storeRoutesName);
				// ORDENADO
				$scope.storeRoutesName.sort();
				//console.log("Ordenado " + $scope.storeRoutesName);
			}
			console.log(resp.config.data.edificio + " -  Get edificio " + getEdificio());
		});
		//console.log($scope.storeRoutesName);
		//console.log($scope.myEdificio + " -  Get edificio " + getEdificio());
	}

	// Dibuja ruta
	$scope.myDrawRoute = function(){
		//alert("casa");
		drawRoute(GMapService.gmap);
	}
	// Borra ruta dibujada
	$scope.myRemoveDrawRoute = function(){
		//alert("casa");
		removeDrawRoute();
	}
	// myGetRoutes()
	// Devuelve las rutas haciendo una llamada a la base de datos
    $scope.myGetRoutes = function () { 
	   	var idmail = getIdMail();
	    var contrasena = getContrasena();
	    var edificio = getEdificio();
	    var datarequest = {
	        email: idmail,
	        edificio: edificio,
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
			//console.log(data);
			return data;
		});
	};
	// removeRoute()
	// Borra la ruta de la base de datos
	$scope.removeRoute = function () { 
	   	var idmail = getIdMail();
	    var contrasena = getContrasena();
	    var edificio = getEdificio();
	    var nombreRuta = $scope.myShowRoute;
	    if( !nombreRuta || !edificio || !contrasena || !idmail ){
	    	return false;
	    }
	    var datarequest = {
	        email: idmail,
	        edificio: edificio,
	        ruta: nombreRuta,
	        contrasena: contrasena
	    }
		return $http({

		    method: 'POST',
		    url: "https://geoindoorapi.herokuapp.com/RutaDelete",
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
			//console.log(data);
			$scope.suc("Ruta " + nombreRuta + " removed");
			return data;
		}).error(function (data,status) {
			$scope.err("Ruta " + nombreRuta + " has not been removed");
			return data;
		});
	};

	// drawStoreRoute()
	// Dibuja la ruta pasada por parametro
	$scope.drawStoreRoute = function(nombreRuta) {
		// $scope.myShowRoute es el ng-model del desplegable
		var promise = $scope.myGetRoutes();
		if(!nombreRuta){
			nombreRuta = $scope.myShowRoute;
		}
		if(!nombreRuta){return false;}
		document.getElementsByName("nameRoute")[0].value = nombreRuta.substring(nombreRuta.indexOf(" ")+1, nombreRuta.lenght);
		//var nombreRuta = $('#showRoutes').val.toString();
		promise.then(function(resp) {
			$scope.myRemoveDrawRoute();
			var rutas = resp.data[Object.keys(resp.data)[0]];
			//console.log(resp.data);
			console.log(rutas);
			Object.keys(rutas).forEach(function(key) {
				if(rutas[key]["nombre"] == nombreRuta){
					var ruta = JSON.parse(rutas[key]["ruta"]);
					console.log(ruta);
					var flightPlanCoordinates = [];
					var floorctrl=0;
					ruta.forEach(function(punto) {
						// ********* AQUI SE PODRIA MIRAR TAMBIEN LA PLANTA (FLOOR) *********
						if( punto["floor_number"] != getFloor() && floorctrl != 1){
							var msg = nombreRuta + " is on floor " + punto["floor_number"] + ", you are on floor " + getFloor();
    						$scope.warn(msg);
							floorctrl=1;
						}
						if(floorctrl != 1){
							var coord = {
						    	lat: parseFloat(punto["lat"]), 
						    	lng: parseFloat(punto["lng"])
					    	}
							//console.log(coord);
							flightPlanCoordinates.push(coord);
						}
						
					});
					if(floorctrl != 1){
						myflightPath = new google.maps.Polyline({
							path: flightPlanCoordinates,
							geodesic: true,
							strokeColor: '#00ff00',
							strokeOpacity: 1.0,
							strokeWeight: 4
						});  

						console.log(myflightPath.getPath());
						myflightPath.setMap(GMapService.gmap);
					}
				}
			});

		});
		//console.log(data);
	};

	//getContador()
	// Devueleve el contador de edifcios
	$scope.getContador = function() {
		return $http({
		    method: 'GET',
		    url: "https://geoindoorapi.herokuapp.com/Contador",
		    headers: {'Content-Type': 'application/x-www-form-urlencoded'}

		}).success(function (data,status) {
			console.log(data);
			//$scope.suc("Ruta " + nombreRuta + " removed");
			$scope.contadorId=data.id;
			return data;
		}).error(function (data,status) {
			//$scope.err("Ruta has not been removed");
			console.log(data);
			return data;
		});
	}

	// wakeUpHeroku()
	// Hace una serie de llamadas al servidor para despertarle
	$scope.wakeUpHeroku = function() {
		console.log("AQUIIIII");
		$scope.myGetRoutes();
		$scope.myGetRoutes();
		$scope.myGetRoutes();
	}

	$scope.wakeUpHeroku();
	setTimeout(function(){ $scope.myStoreRoutes(); }, 3000);

}]);
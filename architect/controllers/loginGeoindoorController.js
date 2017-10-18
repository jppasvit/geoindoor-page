app.controller("loginGeoindoor",['$scope', '$compile', 'GMapService', 'AnyplaceService', 'AnyplaceAPIService','$http', function ($scope, $compile, GMapService, AnyplaceService, AnyplaceAPIService,$http) {
	
	//$scope.logeado = true;

	  var config = {
	    apiKey: "AIzaSyDS4xASU14_0JbaXNEU_1icvU7bX1ugB5A",
	    authDomain: "geoindoordb.firebaseapp.com",
	    databaseURL: "https://geoindoordb.firebaseio.com",
	    storageBucket: "geoindoordb.appspot.com",
	  };

	  firebase.initializeApp(config);

	  $scope.loginGoogle = function() {
	    
	      var provider = new firebase.auth.GoogleAuthProvider();
	      provider.addScope('https://www.googleapis.com/auth/plus.login'); 
	      firebase.auth().signInWithPopup(provider).then(function(result) {
	        var token = result.credential.accesstoken;
	        var user = result.user;
	        var name = result.user.displayName;
	       /* $scope.$apply(function () {
            	$scope.logeado = true; 
        	}); */  
	      }).catch(function(error) {
	      	var errorCode = error.code;
  			var errorMessage = error.message;
	      	if(errorCode == "auth/popup-closed-by-user"){
	      		alert("Debe logearse para entrar");
	      	}
	      	//alert(JSON.stringify(error));
	      	/*$scope.$apply(function () {
            	$scope.logeado = false; 
        	});*/

	        
	      });
	   
	  }
	 $scope.logOutGoogle =  function () {
	 	/*$scope.$apply(function () {
            $scope.logeado = false; 
        });*/
	    firebase.auth().signOut().then(function() {
	      //alert("Saliendo");
	      location.href ="http://localhost:8080/geoindoor/architect/login.html";
	      console.log("Saliendo");
	    }, function(error) {
	      alert( "ERROR: "+ error);
	    });
	  }
	
	 /*if (!firebase.auth().currentUser) {
				location.href ="http://localhost:8080/geoindoor/architect/login.html";
	}*/
		window.onload = function() {
			if (!firebase.auth().currentUser) {
				location.href ="http://localhost:8080/geoindoor/architect/login.html";
			}
		}
		
	 	//$scope.loginGoogle();
	 
}]);
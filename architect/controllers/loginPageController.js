var myapp = angular.module('loginPage', []);
myapp.controller("loginPageController", function ($scope) {
	

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
	        location.href ="/architect";  
	      }).catch(function(error) {
	      	var errorCode = error.code;
  			var errorMessage = error.message;
	      	if(errorCode == "auth/popup-closed-by-user"){
	      		alert("Debe logearse para entrar");
	      	}
	      });
	   
	  }

	  if(firebase.auth().currentUser){
	  	location.href ="/architect";
	  }
	
	
});
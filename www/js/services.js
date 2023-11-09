angular.module('appServices', [])

.factory('productDataService', function($ionicPlatform, $q) {


/**
 * Servicio de obtención de productos y actualización a partir de archivo local
 * @type {object}
 */
  var service = {};

/**
 * Promesa de devolución de listado de productos
 * @type {promise}
 */
  var productsDeferred = $q.defer();

/**
 * Función que se ejecuta automáticamente cuando se terminan de 
 * cargar todos los archivos en el browser y el dispositivo está listo.
 * Se ejecuta una única vez.
 */
   $ionicPlatform.ready(function () {
    //Leo productos desde archivo local
    service.readProductsFile();
    //VOY A TESTEAR CUESTIONE ASI
    
  });


/**
 * Función que lee el contenido del archivo local de productos.
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo.
 */
    service.readProductsFile = function () {
        productsDeferred = $q.defer();
        getFileEntry("/products.json").then(function(fileEntry){
          readFile(fileEntry).then(function(fileContent){
            var result = [];

            try{

              if(window.cordova){
                result = JSON.parse(fileContent);
              }
              else{
                result=fileContent;
                console.log("Result:",result);
              }
              
              result.sort(function(a, b){
                  if(a.name < b.name) return -1;
                  if(a.name > b.name) return 1;
                  return 0;
              });
              result.forEach(function (product){
                if(product.$$hashKey){
                  //elimino campo $$hashkey autogenerado por JSON.parse, que puede 
                  //generar errores en la utilización de ng-repeat en la vista
                  delete product.$$hashKey;
                }
              });
            }
            catch(e){
            }
            productsDeferred.resolve(result);
          });
      });
    }

/**
 * Funcion de utilidad que retorna una entrada de archivo, o la crea si no existe
 * a partir del nombre proporcionado.
 * @param{string} fileName Nombre del archivo cuya entrada de archivo será retornada
 * @return{promise} Promesa que será resuelta con la entrada de 
 * archivo una vez haya sido determinada.
 */
    function getFileEntry(fileName){
      var fileEntryDeferred = $q.defer();

      if(window.cordova){  
        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (fs) {
        fs.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
            fileEntryDeferred.resolve(fileEntry);
        }, onErrorCreateFile);
        }, onErrorLoadFs);

        return fileEntryDeferred.promise;
      }
      else{
        var fileURL= 'products.json';
        fileEntryDeferred.resolve(fileURL);
        return fileEntryDeferred.promise;
      }
      };


/**
 * Funcion que retorna el contenido de un archivo
 * a partir de la entrada de archivo proporcionada.
 * @param{object} fileEntry Entrada del archivo cuyo contenido será leido 
 * y retornado como resolución de promesa.
 * @return{promise} Promesa que será resuelta con el contenido del archivo
 * una vez haya concluido la lectura.
 */
    function readFile(fileEntry) {
      var fileContentDeferred = $q.defer();
      if(window.cordova){
        fileEntry.file(function (file) {
          var reader = new FileReader();
          reader.onloadend = function() {
              fileContentDeferred.resolve(this.result);
          };
          reader.readAsText(file);
      }, onErrorReadFile);
      return fileContentDeferred.promise;
      }
      else{
        fetch(fileEntry)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(fileContent => {
          fileContentDeferred.resolve(fileContent);
        })
        .catch(error => {
          fileContentDeferred.reject(error);
        });
        return fileContentDeferred.promise;
      }
      
    }

    function onErrorCreateFile(error){
      console.log(error)
    };

    function onErrorReadFile(error){
      console.log(error)
    };


    function onErrorLoadFs(error){
      console.log(error)
    };

/**
 * Funcion que sobreescribe los datos proporcionados en un archivo
 * a partir de la entrada de archivo proporcionada.
 * @param{object} fileEntry Entrada del archivo cuyo contenido será leido 
 * y retornado como resolución de promesa.
 * @param{string} dataObj Datos a escribir en el archivo.
 * @return{promise} Promesa que será resuelta con true si la escritura fue exitosa
 * o false si hubo un error.
 */
  function writeFile(fileEntry, dataObj) {
      var resultDeferred = $q.defer();
      fileEntry.createWriter(function (fileWriter) {

        fileWriter.onwriteend = function() {
            resultDeferred.resolve(true);
        };

        fileWriter.onerror = function (e) {
            console.log("Failed file write: " + e.toString());
            resultDeferred.resolve(false);
        };
        fileWriter.write(dataObj);
      });
    return resultDeferred.promise;
  };

/**
 * Función que retorna una promesa a ser resuelta con los productos
 * leidos cuando se utilice service.readProductsFile().
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo.
 */
  service.getItems = function (){
    return productsDeferred.promise;
  }

/**
 * Función que retorna una promesa a ser resuelta con un producto
 * que tenga el plu proporcionado y que será leidos cuando se utilice 
 * service.readProductsFile().
 * @param{string} code plu del producto que se va a retornar
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo con un producto
 * o undefined si no existe un producto con plu == code.
 */
  service.getItem = function(code){
    var productPromise = productsDeferred.promise.then( function (response){
      var products = response;
      for (var i = 0; i < products.length; i++) {
        if (products[i].code === code){
          return products[i];
        }
      }
      return undefined;
    });
    return productPromise;
  }

/**
 * Función que retorna una promesa a ser resuelta con los productos de 
 * type == "fruit" que serán leidos cuando se utilice 
 * service.readProductsFile().
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo con una lista
 * de todos los productos con type == "fruit"
 */
  service.getAllMeet = function() {
    var productPromise = productsDeferred.promise.then( function (response){
      var products = response;
      var bestSellingCount = 0;
      var meet =[];
      for (var i = 0; i < products.length; i++) {
        // if (products[i].type === "fruit" || products[i].type === "fruit-cant") {
         if (products[i].type === "bovino" || products[i].type === "fruit-cant") {
          meet.push(products[i]);
        }
      }
      return meet;
    });
    return productPromise;
  }

/**
 * Función que retorna una promesa a ser resuelta con los productos de 
 * type == "fruit" && best_selling == true que serán leidos cuando se utilice 
 * service.readProductsFile().
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo con una lista
 * de todos los productos con type == "fruit" y best_selling == true
 */
  service.getBestSellingMeet = function() {
    var productPromise = productsDeferred.promise.then( function (response){
      var products = response;
      var bestSellingCount = 0;
      var meet =[];
      for (var i = 0; i < products.length; i++) {
        if ((products[i].type === "bovino" || products[i].type === "fruit-cant") && products[i].best_selling && bestSellingCount < 20) {
          meet.push(products[i]);
          bestSellingCount ++;
        }
      }
      return meet;
    });
    return productPromise;
  }

/**
 * Función que retorna una promesa a ser resuelta con los productos de 
 * type == "vegetable" && best_selling == true que serán leidos cuando se utilice 
 * service.readProductsFile().
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo con una lista
 * de todos los productos con type == "vegetable" y best_selling == true
 */
    service.getBestSellingPork = function() {
    var productPromise = productsDeferred.promise.then( function (response){
      var products = response;
      var bestSellingCount = 0;
      var pork =[];
      for (var i = 0; i < products.length; i++) {
        if ((products[i].type === "cerdo" || products[i].type === "veg-cant") && products[i].best_selling && bestSellingCount < 20) {
          pork.push(products[i]);
          bestSellingCount ++;
        }
      }
      return pork;
    });
    return productPromise;
  }

/**
 * Función que retorna una promesa a ser resuelta con los productos de 
 * type == "vegetable" que serán leidos cuando se utilice 
 * service.readProductsFile().
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo con una lista
 * de todos los productos con type == "vegetable"
 */
  service.getAllPork = function() {
    var productPromise = productsDeferred.promise.then( function (response){
      var products = response;
      var bestSellingCount = 0;
      var pork =[];
      for (var i = 0; i < products.length; i++) {
        if (products[i].type === "cerdo" || products[i].type === "veg-cant") {
          pork.push(products[i]);
        }
      }
      return pork;
    });
    return productPromise;
  }

/**
 * Función que retorna una promesa a ser resuelta con los productos de 
 * type == "vegetable"que no sean mejor vendidos.
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo con una lista
 * de todos los productos con type == "vegetable"
 */
  service.getOtherPork = function() {
    var productPromise = productsDeferred.promise.then( function (response){
      var products = response;
      var bestSellingCount = 0;
      var pork =[];
      for (var i = 0; i < products.length; i++) {
        if((products[i].type === "vegetable" || products[i].type === "veg-cant") && products[i].best_selling){
          pork++;
        }
        if ((products[i].type === "vegetable" || products[i].type === "veg-cant") && (!products[i].best_selling || bestSellingCount >= 20)) {
          pork.push(products[i]);
        }
      }
      return pork;
    });
    return productPromise;
  }

/**
 * Función que retorna una promesa a ser resuelta con los productos de 
 * type == "vegetable"que no sean mejor vendidos.
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo con una lista
 * de todos los productos con type == "vegetable"
 */
  service.getOtherPork = function() {
    var productPromise = productsDeferred.promise.then( function (response){
      var products = response;
      var bestSellingCount = 0;
      var pork =[];
      for (var i = 0; i < products.length; i++) {
        // if((products[i].type === "fruit" || products[i].type === "fruit-cant") && products[i].best_selling){
          if((products[i].type === "bovino" || products[i].type === "fruit-cant") && products[i].best_selling){
          bestSellingCount++;
        }
        if ((products[i].type === "bovino" || products[i].type === "fruit-cant") && (!products[i].best_selling || bestSellingCount >= 20)) {
          pork.push(products[i]);
        }
      }
      return pork;
    });
    return productPromise;
  }
/**
 * Función que retorna una promesa a ser resuelta con los productos de 
 * type == "fruit" que serán leidos cuando se utilice 
 * service.readProductsFile().
 * @return{promise} Promesa que se 
 * resuelve luego de terminar de leer el contenido del archivo con una lista
 * de todos los productos con type == "fruit"
 */
service.getAllElaborated = function() {
  var productPromise = productsDeferred.promise.then( function (response){
    var products = response;
    var bestSellingCount = 0;
    var elaborated =[];
    for (var i = 0; i < products.length; i++) {
      // if (products[i].type === "fruit" || products[i].type === "fruit-cant") {
       if (products[i].type === "elaborado" || products[i].type === "fruit-cant") {
        elaborated.push(products[i]);
      }
    }
    return elaborated;
  });
  return productPromise;
}
/**
 * Funcion que sobreescribe los datos proporcionados en el archivo
 * local de productos.
 * @param{object} productsJson Objeto json con los datos a escribir en el archivo.
 * @return{promise} Promesa que será resuelta cuando finalice la escritura.
 */
  service.updateProducts = function(productsJson) {
    var def = $q.defer();
     getFileEntry("/products.json").then(function(fileEntry){
        writeFile(fileEntry,JSON.stringify(productsJson)).then(function(result){
          def.resolve();
        })
      });
     return def.promise
  }

  

  return service;
})

.service('BluetoothService',function(){
  var bluetoothFlag=false;
  var device;
  var deviceName;
  var deviceAddress;
  
  this.getBluetoothFlag = function() {
    return bluetoothFlag;
  };

  this.setBluetoothFlag = function(value) {
    bluetoothFlag = value;
  };

  this.getDevice = function(){
    return device;
  }

  this.setDevice = function(deviceValue){
    device=deviceValue; 
  }

  this.getDeviceName = function(){
    return deviceName;
  }

  this.setDeviceName = function(deviceNameValue){
    deviceName = deviceNameValue;
  }

  this.getDeviceAddress = function() {
    return deviceAddress;
  }

  this.setDeviceAddress = function(deviceAddressValue) {
    deviceAddress = deviceAddressValue;
  }
  
})
;




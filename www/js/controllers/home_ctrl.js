//Declarando el controlador HomeCtrl dentro del módulo controllers (/js/controllers.js
//Este es el controller de la vista /templates/home.html
controllers.controller('HomeCtrl', function ($scope,$rootScope, $http, $q, $ionicPlatform, $ionicHistory, $ionicModal, $timeout, $interval, $cordovaNativeAudio, $state, productDataService, CacheImages,BluetoothService){

  /**
   * Variable que indica si se comprobará de forma bloqueante la conectividad BLE o se deshabilitará la misma.
   * Si toma el valor por defecto la aplicación se comporta como en producción, de lo contrario se podrá utilizar sin una conexión
   * conexión a un dispositivo BLE (entornos de prueba/desarrollo).
   * @type {boolean}
   * @default {false}
   */
    //  var BLE_DISABLE=true;
    var BLE_DISABLE=false;
  
  /**
   * Intentos realizados de conexión BLE
   * @type {number}
   */
      var tries = 0;
  /**
   * Cantidad máxima de intentos de conexión BLE
   * @const {number}
   */
      var MAX_BLE_TRIES = 30;
  
  /**
   * Cantidad de milisegundos antes de intentar actualizar los productos
   * @const {number}
   */
      var UPDATE_PRODUCTS_RATE = 20000;
  
  /**
   * Promesa de siguiente ejecución de actualización de imágenes.
   * Esta promesa se genera mediante $timeout(). 
   * Representa la siguiente ejecución que se hará de la función updateProducts().
   * Sirve para cancelar la ejecución siguiente de updateProducts() en caso de ser necesario. 
   * @type {promise}
   */
      var updateProductsNextPromise;

  /**
   * Promesa de inicio de actualización de imágenes.
   * Cuando esta promesa se resuelva, comenzará la actualización de imágenes.
   * @type {promise}
   */
      var startUpdatePromise = $q.defer();
  
  /**
   * Numero de clicks en el botón de la pantalla de inicialización
   * para la apertura de la pantalla de configuración.
   * @type {number}
   */
      $scope.touchs = 5;
  
  /**
   * Variable que indica si se muestra la pantalla de inicialización
   * @type {boolean}
   */
      $scope.show_init_modal=true;
  
  /**
   * Variable que indica si se muestra el texto de inicialización 
   * o el de conexión
   * @type {boolean}
   */
      $scope.init10Secs=true;
  
  /**
   * Objeto global a la app que contiene server IP y MAC BLE
   * @type {object}
   */
      $rootScope.settings = {};
  
  /**
   * Variable que indica si la conexión BLE está establecida.
   * @type {boolean}
   */
      if(BLE_DISABLE){
        $scope.connectedToBluetooth=true;
      }
      else{
        $scope.connectedToBluetooth=false;
      }
  
  /**
   * Variable que indica si es la primera vez que se establece la conexión BLE.
   * @type {boolean}
   */
      firstConnection=true;
  
  /**
   * Intentos realizados de conexión BLE
   * @type {number}
   */
  var scantimes = 0;

  /**
   * Función que se ejecuta automáticamente cuando se terminan de 
   * cargar todos los archivos en el browser y el dispositivo está listo.
   * Se ejecuta una única vez.
   */
      $ionicPlatform.ready(function () {
        cordova.plugins.BluetoothStatus.initPlugin();
        showInitModal();
        getSettings().then(function(settings){
            //Obtengo los productos desde el archivo local de la app
            productDataService.getItems().then(function(products){
              if(products){
              /**
              * Variable que contiene la información de todos los productos.
              * @type {array}
              */
                $scope.products = products;
              }
              else{
                $scope.products = [];
              }
              startUpdatePromise.resolve();
            //  console.log("Products: ", $scope.products);
            });
          });
          console.log("Seteo:" + $rootScope.settings.bluetooth_mac);
      });
  
  /**
   * Función que se ejecuta automáticamente cada vez que la applicación 
   * ingresa a la vista Home.
   */
      $scope.$on('$ionicView.enter', function(){
        startUpdatePromise.promise.then(function(result) {
          try{
            $timeout.cancel(updateProductsNextPromise);
          }
          finally{
            updateProducts();
            return;
          }
        });
      });
  
  /**
   * Función que se ejecuta automáticamente cada vez que la applicación 
   * sale de la vista Home. Cancela la actualizaciones pendientes de 
   * productos para no llamar a actualizar en otras vistas
   */
      $scope.$on('$ionicView.beforeLeave', function(){
          try{
            $timeout.cancel(updateProductsNextPromise);
          }
          finally{
            return;
          }
      });

  /**
   * Función que cambia a la pantalla de Carne,
   * es llamada desde la vista (templates/home.html).
   */
      $scope.goToMeet = function () {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        
          $state.go("other_meet");
        
      };
  
  /**
   * Función que cambia a la pantalla de Cerdo,
   * es llamada desde la vista (templates/home.html).
   */
  $scope.goToPork = function () {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    
      $state.go("other_pork");
    
  };

  /**
   * Función que cambia a la pantalla de Elaborados,
   * es llamada desde la vista (templates/home.html).
   */
  $scope.goToElaborated = function () {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    
      $state.go("other_elaborated");
    
  };
  
  /**
   * Función que obtiene la IP del server y la MAC desde el archivo
   * donde la app lo almacena. Si no puede obtener estos datos, utiliza 
   * por defecto los siguientes valores:
   * BLE MAC: CC:78:AB:87:57:03
   * Server IP: 172.30.1.248:3000
   * @return {promise} promesa que se resuelve cuando los datos son obtenidos.
   */
      function getSettings(){
        settingsDeferred = $q.defer();

        if(window.cordova){
          getFileEntry("/settings.json").then(function(fileEntry){
            readFile(fileEntry).then(function(fileContent){
    //          console.log(fileContent);
              var fileContentJson ={};
              try{
              fileContentJson = JSON.parse(fileContent);
              }
              catch(err){
                console.log("Cannot obtain MAC and server ip settings", err);
              }
              finally{
                var serverIpEmpty = fileContentJson.server_ip === undefined || fileContentJson.server_ip === "" || fileContentJson.server_ip === null;
                var btMacEmpty = fileContentJson.bluetooth_mac === undefined || fileContentJson.bluetooth_mac === "" || fileContentJson.bluetooth_mac === null;
                $rootScope.settings.server_ip = serverIpEmpty? '10.85.1.16:3000' : fileContentJson.server_ip;
                // $rootScope.settings.bluetooth_mac = btMacEmpty? 'CC:78:AB:87:57:03' : fileContentJson.bluetooth_mac;
                $rootScope.settings.bluetooth_mac = btMacEmpty? '00:E0:7C:F9:B6:23' : fileContentJson.bluetooth_mac;
                $scope.settings = angular.copy($rootScope.settings);
                settingsDeferred.resolve($scope.settings);
              }
            });
          });
          return settingsDeferred.promise
        }
        else{
          var serverIp='10.85.1.16:3000';
          var btMac = '00:E0:7C:F9:B6:23';
          $rootScope.settings.server_ip = serverIp;
          $rootScope.settings.bluetooth_mac = btMac;
          $scope.settings = angular.copy($rootScope.settings);
          settingsDeferred.resolve($scope.settings);
          return settingsDeferred.promise
        }
      };
  
  /**
   * Función que muestra el modal de inicialización (templates/init_modal.html).
   * Luego de 8 segundos muestra el texto de conexión
   * y llama a la función enableAndConnectBle().
   */
      if(BLE_DISABLE){
        showInitModal = function(){
          $scope.init10Secs=true;
          $scope.show_init_modal=true;
          $timeout(function(){
              $scope.init10Secs=false;
              $scope.connectedToBluetooth=true;
              $scope.show_init_modal=false;
              $scope.$apply();
              //enableAndConnectBle();
          },1000);
        }
      }
      else{
        showInitModal = function(){
          $scope.init10Secs=true;
          $scope.show_init_modal=true;
          $timeout(function(){
              $scope.init10Secs=false;
              $scope.connectedToBluetooth=false;
              $scope.$apply();
              enableAndConnectBle();
          },8000);
        }
      }
      
 

/**
 * Funcion que se utiliza para saber si la conexión fue exitosa al momento que
 * se quiere usar la tablet con la balanza. Envia un caracter 'enter' por Bluetooth y 
 * la balanza hace un sonido que lo recice, de esta manera el usuario sabe si la conexión
 * es exitosa.
 */
  function connectionSuccess(){
    device = BluetoothService.getDevice();
    var SERVICE_UUID = 'f0001130-0451-4000-b000-000000000000'; 
    var CHARACTERISTIC_UUID = 'f0001131-0451-4000-b000-000000000000'; 
    var service = evothings.ble.getService(device, SERVICE_UUID);
    var characteristic = evothings.ble.getCharacteristic(service, CHARACTERISTIC_UUID);
    var data = new Uint8Array(4);
    data[0] = 0x68; // 'h'
    data[1] = 0x2F; // '/'
    data[2] = 0x63; // 'c'
    data[3] = 0x5F; // '_'
    evothings.ble.writeCharacteristic(
      device,
      characteristic,
      data, // Buffer view with data to write
      function()
      {
          console.log('characteristic written');
      },
      function(errorCode)
      {
          console.log('writeCharacteristic error: ' + errorCode);
      }
    );
  }
  /**
 * Funcion que corrobora si el bluetooth está encendido en el disositivo.
 * Si no se encuentra encendido, lo enciende.
 * Si el bluetooth se encuentra encendido, no hace nada.
 * Luego de 10 segundos, llama a ConnectToBluetooth
 */
  function enableAndConnectBle(){
    setTimeout(function () {
      cordova.plugins.BluetoothStatus.enableBT();
      setTimeout(function(){
        connectToBluetooth();
      },10000)
    },10000);
  }
      
  /**
   * El dispositivo escanea todos los periféricos BLE disponibles.
   * si la IP del dispositivo encontrado coincide con la configurada en la app,
   * se setean las características del dispositivo en BlueetoothService y 
   * se intenta la conexión. 
   */
  function connectToBluetooth(){
    tries ++;
    // result = $q.defer();
    if($scope.connectedToBluetooth===false){
      scantimes++;
      evothings.ble.startScan(
        function(device) {
          if(device.address === $rootScope.settings.bluetooth_mac){
            evothings.ble.stopScan();
            BluetoothService.setDevice(device);
            BluetoothService.setDeviceName(device.name);
            tryConnection();
            }
        }, 
        function(error){
            if(tries <= MAX_BLE_TRIES){connectToBluetooth();}
      });
    }
  };

  /**
   * Se obtiene el dispositivo mediante el BluetoothService y se intenta
   * conectar. Si la conexión es exitosa setea las variables correspondientes
   * y el programa queda listo para utilizar.
   * Si la conexión falla, espera 15 segundos y vuelve a intentar la conexión.
   */
  function tryConnection()
  {
    evothings.ble.stopScan();
    device=BluetoothService.getDevice();
    $scope.$apply();
    setTimeout(function(){
      evothings.ble.connectToDevice(
        device, 
        function (device)
        {
          //SUCCESFULL FUNCTION DEL CONNECT
          if(firstConnection){
            firstConnection=false;
            BluetoothService.setDevice(device);
            BluetoothService.setDeviceName(device.name);
            connectionSuccess(device);
            $scope.connectedToBluetooth = true;
            $scope.show_init_modal= $scope.touchs >= 15;
          }
        tries = 0;
        $scope.$apply();
        }, 
        function (device)
        {
          //Error function del connect
        },
        function(error)
        {
          //Error function del connect
          
        });
    },5000)

    setTimeout(function(){
      if($scope.connectedToBluetooth===false){
        tryConnection();
      }
    },15000)
  }
  
  /**
   * Esta función se encarga de actualizar las imágenes.
   * Ejecuta un request GET al servidor de imagenes sobre su api /api/images
   * A partir de los productos obtenidos, se analiza la eliminación, incorporación 
   * o incremento del campo version de al menos un producto. Si ocurre alguna de estas 
   * tres posibilidades, se procede a descargar las imágenes de los productos desde el servidor
   * (deben descargarse todas porque el mecanismo de caché no permite la invalidación de 
   * imagenes individuales).
   * Finalmente se programa una nueva ejecución de esta funcion (updateProducts()) a los 20 segundos.
   * Si ocurre un error comunicandose con el servidor, se reintenta llamar a (updateProducts()) a los 5 segundos.
   */
       function updateProducts () {
        $http.get("http://"+$rootScope.settings.server_ip+"/api/images", { timeout: 10000 }).then(
          function(response){
            //response.data contiene los productos provenientes del server.
            var update;
            var productToUpdate;
            var indexToUpdate;
            var itemsPluToDelete = {};
            var itemsPluVersion = {};
            var diff = []
            var update = $q.defer();
            //Seteo un array de true, indexado por plu de todos los valores recibidos del server.
            for (var i = 0; i < response.data.length; i++){
              itemsPluToDelete[response.data[i].plu] = true;
            }
  
            //Recorro los productos presentes en la app.
            for (var j = 0; j < $scope.products.length; j++){
                //Si para el plu del producto presente en la app
                //existe un valor true dentro del array de trues seteado previamente
                if (itemsPluToDelete[$scope.products[j].plu]) {
                  // elimino el elemento true del array de trues
                  delete itemsPluToDelete[$scope.products[j].plu];
                }
                //Si NO existe un valor true dentro del array de trues
                //significa que la app contiene un producto que ha sido
                //eliminado de la base de datos.
                //
                else{
                  //Elimino el producto de la app
                  $scope.products.splice(j);
                  //resuelvo que es necesario actualizar las imagenes.
                  update.resolve(true);
                }
            }
  
            var isNew;
            //Por cada producto de la base de datos
            for (j = 0; j < response.data.length; j++){
              //Lo declaro nuevo por defecto
              isNew = true;
              //Por cada producto presente en la app
              for(i = 0;  i < $scope.products.length ; i++ ){
                //Si el plu del producto de la base de datos coincide con el de la app
                if($scope.products[i].plu === response.data[j].plu){
                  //No es un producto nuevo
                  isNew = false;
                  // Si la version del producto de la base de datos es mayor a la presente en la app
                  if( $scope.products[i].version < response.data[j].version){
                    //actualizo el producto presente en la app
                    $scope.products[i] = response.data[j];
                    //resuelvo que es necesario actualizar las imágenes
                    update.resolve(true);
                  }
                  break;
                }
              }
              //Si el producto sigue marcado como nuevo
              if(isNew){
                //Incorporo el producto a la app
                $scope.products.push(response.data[j]);
                //resuelvo que es necesario actualizar las imágenes
                update.resolve(true);
              }
            }
  
            //Cuando resuelvo si es necesario actualizar la app
            update.promise.then(function(needUpdate){
              //Si lo resuelvo con true
              if(needUpdate){
                console.log("Updating images");
                //Limpio la cache de imágenes
                CacheImages.clearCache().then(function(){
                  //Por cada producto de la base de datos
                  response.data.forEach(function(product){
                    //Descargo las imágenes grande y pequeña
                    try {
                      CacheImages.checkCacheStatus("http://" + $rootScope.settings.server_ip + "/" + product.small_img);
                    } catch (error) {
                      console.error("Error en la primera llamada a CacheImages.checkCacheStatus:", error);
                    }
                    try {
                      CacheImages.checkCacheStatus("http://" + $rootScope.settings.server_ip + "/" + product.big_img);
                    } catch (error) {
                      console.error("Error en la segunda llamada a CacheImages.checkCacheStatus:", error);
                    }
                    
                  })
                });
                //Guardo en archivo los cambios en los productos de la app
                productDataService.updateProducts($scope.products).then(function(){
                  //Leo nuevamente los productos desde archivo
                  productDataService.readProductsFile();
                })
              }
            });
          },
          function(error) {
            console.log("Error connecting to Server: ", error);
            try{
              $timeout.cancel(updateProductsNextPromise);
            }
            finally{
                updateProductsNextPromise = $timeout(updateProducts,UPDATE_PRODUCTS_RATE);
              return;
            }
          });
          try{
            $timeout.cancel(updateProductsNextPromise);
          }
          finally{
            updateProductsNextPromise = $timeout(updateProducts,UPDATE_PRODUCTS_RATE);
            return;
          }
      }
  
  /**
   * Esta función incrementa el numero de clicks en el botón de la pantalla de inicialización
   * para la apertura de la pantalla de configuración.
   * Se llama desde la vista (templates/init_modal.html).
   */
      $scope.increase = function() {
        $scope.touchs++;
        console.log("Touchs:",$scope.touchs);
      }
  
  /**
   * Esta función Guarda en archivo las configuraciones
   * de MAC e IP realizadas en la pantalla de configuración.
   * Se llama desde la vista(templates/init_modal.html).
   */
      $scope.saveSettings = function(){
        var settings = $scope.settings;
        getFileEntry("/settings.json").then(function(fileEntry){
          writeFile(fileEntry,JSON.stringify(settings)).then(function(result){
            $rootScope.settings = angular.copy($scope.settings);
            $scope.touchs=0;
            $scope.show_init_modal= (! $scope.connectedToBluetooth);
            tries=0;
            enableAndConnectBle();
          });
        });
      }
  
  /**
   * Esta función cancela las configuraciones
   * de MAC e IP realizadas en la pantalla de configuración.
   * Se llama desde la vista(templates/init_modal.html).
   */
      $scope.cancelSettings = function() {
        $scope.settings = angular.copy($rootScope.settings);
        $scope.touchs=0;
        $scope.show_init_modal= (! $scope.connectedToBluetooth);
        tries=0;
        enableAndConnectBle();
      }
  
  /**
   * Funcion de utilidad que retorna una entrada de archivo, o la crea si no existe
   * a partir del nombre proporcionado.
   * @param{string} fileName Nombre del archivo cuya entrada de archivo será retornada
   * @return{promise} Promesa que será resuelta con la entrada de 
   * archivo una vez haya sido determinada.
   */
      function getFileEntry(fileName){
        if(window.cordova){
          var fileEntryDeferred = $q.defer();
          window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (fs) {
          console.log('file system open: ' + fs.name);
          console.log(fs);
          fs.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
              fileEntryDeferred.resolve(fileEntry);
          }, onErrorCreateFile);
          }, onErrorLoadFs);
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
        fileEntry.file(function (file) {
            var reader = new FileReader();
            reader.onloadend = function() {
                fileContentDeferred.resolve(this.result);
            };
            reader.readAsText(file);
        }, onErrorReadFile);
        return fileContentDeferred.promise;
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
  
  /**l
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
      // Create a FileWriter object for our FileEntry (log.txt).
        fileEntry.createWriter(function (fileWriter) {
  
          fileWriter.onwriteend = function() {
              resultDeferred.resolve(true);
          };
          fileWriter.onerror = function (e) {
              console.log("Failed to write file: " + e.toString());
              resultDeferred.resolve(false);
          };
          fileWriter.write(dataObj);
        });
        return resultDeferred.promise;
      };
    })
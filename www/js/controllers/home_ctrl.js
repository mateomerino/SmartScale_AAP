//Declarando el controlador HomeCtrl dentro del módulo controllers (/js/controllers.js
//Este es el controller de la vista /templates/home.html
controllers.controller('HomeCtrl', function ($scope,$rootScope, $http, $q, $ionicPlatform, $ionicHistory, $ionicModal, $timeout, $interval, $cordovaNativeAudio, $state, productDataService, CacheImages){

  /**
   * Variable que indica si se comprobará de forma bloqueante la conectividad BLE o se deshabilitará la misma.
   * Si toma el valor por defecto la aplicación se comporta como en producción, de lo contrario se podrá utilizar sin una conexión
   * conexión a un dispositivo BLE (entornos de prueba/desarrollo).
   * @type {boolean}
   * @default {false}
   */
     var BLE_DISABLE=true;
    
  
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
   * Se utiliza para realizar la doble conexión requerida.
   * @type {boolean}
   */
      firstConnection=true;
  
  /**
   * Función que se ejecuta automáticamente cuando se terminan de 
   * cargar todos los archivos en el browser y el dispositivo está listo.
   * Se ejecuta una única vez.
   */
      $ionicPlatform.ready(function () {
        showInitModal();                    //MUESTRA LA PANTALLITA DE "INICIANDO APLICACION"
        
        getSettings().then(function(settings){
           
            ////////////////////////////////
            updateProducts();
            // ////////////////////////////////
            //Obtengo los productos desde el archivo local de la app
            //Se los pido a services.js que ya los tiene
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
              // console.log("Products: ", $scope.products);
            });
          });
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
   * Función que cambia a la pantalla de Frutas,
   * es llamada desde la vista (templates/home.html).
   */
      $scope.goToFruits = function () {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        if($rootScope.GuiSettings.best_selling_screen_enabled){
          $state.go("top_fruits");
        }
        else{
          $state.go("other_fruits");
        }
      };
  
  /**
   * Función que cambia a la pantalla de Verduras,
   * es llamada desde la vista (templates/home.html).
   */
      $scope.goToVegetables = function () {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        if($rootScope.GuiSettings.best_selling_screen_enabled){
          $state.go("top_vegetables");
        }
        else{
          $state.go("other_vegetables");
        }
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
        // console.log("Entro a settings!");
        settingsDeferred = $q.defer();
        try{
          var serverIp='172.16.30.122:3000';
          var btMac = 'CC:78:AB:8A:9A:02';
          $rootScope.settings.server_ip = serverIp;
          $rootScope.settings.bluetooth_mac = btMac;
          $scope.settings = angular.copy($rootScope.settings);
          settingsDeferred.resolve($scope.settings);
        }
        catch(err){
          console.log("No se pudo setear bien",err);
        }
        finally{
          // console.log("Server IP:",$rootScope.settings.server_ip);
          // console.log("Bluetooth MAC:",$rootScope.settings.bluetooth_mac);
          return settingsDeferred.promise
        }
  //       getFileEntry("/settings.json").then(function(fileEntry){
  //         readFile(fileEntry).then(function(fileContent){
  // //          console.log(fileContent);
  //           var fileContentJson ={};
  //           try{
  //             console.log("Estoy en el try");
  //           fileContentJson = JSON.parse(fileContent);
  //             // var serverIpEmpty = fileContentJson.server_ip === undefined || fileContentJson.server_ip === "" || fileContentJson.server_ip === null;
  //             // var btMacEmpty = fileContentJson.bluetooth_mac === undefined || fileContentJson.bluetooth_mac === "" || fileContentJson.bluetooth_mac === null;
  //             // $rootScope.settings.server_ip = serverIpEmpty? '172.16.30.122:3000' : fileContentJson.server_ip;
  //             // $rootScope.settings.bluetooth_mac = btMacEmpty? 'CC:78:AB:8A:9A:02' : fileContentJson.bluetooth_mac;
  //             // $scope.settings = angular.copy($rootScope.settings);
  //             // settingsDeferred.resolve($scope.settings);
  //           }
  //           catch(err){
  //             console.log("Cannot obtain MAC and server ip settings", err);
  //           }
  //           finally{
  //             var serverIpEmpty = fileContentJson.server_ip === undefined || fileContentJson.server_ip === "" || fileContentJson.server_ip === null;
  //             var btMacEmpty = fileContentJson.bluetooth_mac === undefined || fileContentJson.bluetooth_mac === "" || fileContentJson.bluetooth_mac === null;
  //             $rootScope.settings.server_ip = serverIpEmpty? '172.16.30.122:3000' : fileContentJson.server_ip;
  //             $rootScope.settings.bluetooth_mac = btMacEmpty? 'CC:78:AB:8A:9A:02' : fileContentJson.bluetooth_mac;
  //             $scope.settings = angular.copy($rootScope.settings);
  //             settingsDeferred.resolve($scope.settings);
  //           }
  //         });
  //       });
  //       console.log("Server IP",$rootScope.settings.server_ip);
  //       return settingsDeferred.promise
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
   * Funcion que corrobora si el bluetooth está encendido en el disositivo.
   * Si no se encuentra encendido, le pide al usuario que lo encienda.
   * Si el usuario no enciende el bluetooth tras el pedido explicito
   * la app no hará intentos de conexión BLE
   * y quedará en estado de inicialización de conexión.
   * Si el dispositivo estaba encendido o es encendido por el usuario tras el pedido explicito, 
   * se procede a llamar a la función connectToBluetooth()
   */
      function enableAndConnectBle(){
        ble.isEnabled(
            function() {
                console.log("Bluetooth is enabled");
                connectToBluetooth();
            },
            function() {
                ble.enable(
                    function() {
                        console.log("Bluetooth is enabled");
                        connectToBluetooth();
                    },
                    function() {
                        console.log("The user did *not* enable Bluetooth");
                    }
                );
            }
          );
      }
  
  /**
   * El dispositivo escanea todos los periféricos BLE disponibles.
   * si la IP del dispositivo encontrado coincide con la configurada en la app
   * se intenta la conexión. Si la conexión es exitosa y 
   * es la primera vez que se conecta, se procede a la reconexión utilizando la funcion
   * reconnectBluetooth().
   * Tras 15 segundos se detiene el escaneo de periféricos BLE.
   * Si la app no estabeció conexión aún y si los intentos de conexión son menores 
   * al número máximo de intentos, se vuelve a llamar a connectToBluetooth()
   */
      function connectToBluetooth(){
          tries ++;
          result = $q.defer();
          ble.startScan([],
            function(device) {
             console.log(device);
              if(device.id === $rootScope.settings.bluetooth_mac){
                console.log("trying to connect");
                ble.connect(device.id, function connectSuccess(peripheral){
                  $rootScope.device_id = device.id;
                  console.log("connected To Bluetooth");
                  if(firstConnection){
                      firstConnection=false;
                      setTimeout(reconnectBluetooth,1000);
                  }
                  else{
                    $scope.connectedToBluetooth = true;
                    $scope.show_init_modal= $scope.touchs >= 15;
  
  /*                  rssiSample = $interval(function() {
                          ble.readRSSI($rootScope.settings.bluetooth_mac, function(rssi) {
                                  console.log('read RSSI ',rssi);
                              }, function(err) {
                                  console.error('unable to read RSSI',err);
                              })
                      }, 2000); 
  */                }
                  tries = 0;
                  $scope.$apply();
                }, function connectFailure(response) {
  //                  console.log(response);
                    console.log("Failed to connect Bluetooth: ",response);
                    $scope.connectedToBluetooth=false;
                    $scope.show_init_modal= true;
                    $scope.$apply();
                    if(tries <= MAX_BLE_TRIES){connectToBluetooth();}
                    return;
                });
              }
            }, function(){
                if(tries <= MAX_BLE_TRIES){connectToBluetooth();}
                return;
            });
  
          setTimeout(function() {
              ble.stopScan(
                  function(){ 
                      ble.isConnected(
                        $rootScope.settings.bluetooth_mac,
                        function() {
                            console.log("Peripheral is connected");
                        },
                        function() {
                            console.log("Peripheral is *not* connected");
                            if(tries <= MAX_BLE_TRIES){connectToBluetooth();}
                        }
                      ); 
                    },
                  function() { console.log("stopScan failed"); }
              );
          }, 15000);
  
      };
  
  /**
   * Esta función desconecta el periférico BLE, y una vez desconectado 
   * exitosamente, tras un segundo procede a la reconexión
   * llamando nuevamente a enableAndConnectBle()
   */
      function reconnectBluetooth(){
        console.log("disconnecting");
        ble.disconnect( $rootScope.settings.bluetooth_mac,
                        function() {
                            console.log("Peripheral is disconnected");
                            setTimeout(enableAndConnectBle,1000);
                        },
                        function() {
                            console.log("Peripheral failed to disconnect");
                        });
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
        
        $http.get('http://localhost:3000/api/images').then(function(response) {
          // console.log("Me conecte wacho");
          // console.log("Datos de la respuesta:", response.data);
          return response.data; // Devuelve los datos de la respuesta
          
        })
        .catch(function(error) {
          // Maneja el error aquí
          console.error('Error en la solicitud a la API', error);
          return $q.reject(error);
        });
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
                    CacheImages.checkCacheStatus("http://" + $rootScope.settings.server_ip + "/" + product.small_img);
                    CacheImages.checkCacheStatus("http://" + $rootScope.settings.server_ip + "/" + product.big_img);
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
        var fileEntryDeferred = $q.defer();
        if(window.cordova){
          window.resolveLocalFileSystemURL(cordova.file.externalDataDirectory, function (fs) {
            console.log('file system open: ' + fs.name);
            console.log(fs);
            fs.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
                fileEntryDeferred.resolve(fileEntry);
            }, onErrorCreateFile);
            }, onErrorLoadFs);
        }
        
        return fileEntryDeferred.promise;
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
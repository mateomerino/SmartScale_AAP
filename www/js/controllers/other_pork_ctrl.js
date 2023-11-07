//Declarando el controlador OtherVegetablesCtrl dentro del módulo controllers (/js/controllers.js
//Este es el controller de la vista /templates/other_vegetables.html
controllers.controller('OtherVegetablesCtrl', function ($scope, $q, $rootScope, $http, $ionicPlatform, $ionicHistory, $cordovaNativeAudio, $state, $timeout, productDataService,BluetoothService) {

  /**
   * Indice de inicio de productos a mostrar en la página actual
   * @type {number}
   */
      $scope.startIndex=0;
  
  /**
   * Indice de página a mostrar
   * @todo  Cambiar nombre a 'currentPage'
   * @type {number}
   */
      $scope.startPage=0;
  
  /**
   * Número de páginas de productos
   * Esta variable se setea de acuerdo a la cantidad de productos
   * y la cantidad máxima de productos por página
   * @type {number}
   */
      $scope.numOfPages=0;
  
  /**
   * Variable que indica si está habilitada la selección de productos
   * @type {boolean}
   */
      $scope.EnabledSelection=true;
  
  /**
   * Número máximo de productos por página
   * @const {number}
   */
      var PRODS_PER_PAGE = $rootScope.MatrizSettings.prodsPerPage;
  
  
  /**
   * Variable que indica si se muestra la pantalla de pesaje de productos para productos por peso
   * (/templates/modal.html)
   * @type {boolean}
   */
      $scope.show_modal=false;
  
   /**
   * Variable que indica si se muestra la pantalla de pesaje de productos para productos por cantidad
   * (/templates/init_modal.html)
   * @type {boolean}
   */ 
      $scope.show_quant_modal=false;
  
  /**
   * Objeto que contiene server IP y MAC BLE
   * @type {object}
   */
      $scope.settings = $rootScope.settings;
  
  /**
   * Cantidad máxima de milisegundos de espera en la vista
   * antes de volver al menu
   * @const {number}
   */
      var MAX_IDLE_TIME = 30000;
  
  /**
   * Promesa de la próxima llamada a la función decreaseRemainingTimeTV()
   * se obtiene a través de una función $timeout() y sirve para cancelar el próximo decremento 
   * cuando sea necesario.
   * @type {promise}
   */
      var timeOutPromiseOV;
  
  /**
   * Función que deja las variables en un estado consistente y regresa a la vista menu
   * (/templates/home.html)
   */
      $scope.goToMenu = function () {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $scope.show_modal=false;
          $scope.show_quant_modal=false;
          $scope.EnabledSelection=true;
          if($scope.product_selected !== null){
            sendClearMessage();
            $scope.product_selected = null;
          }
          $scope.startPage = 0;
          $state.go('app', null, {reload: false});
      };
  
    /**
      * Función que cambia a la vista de elaborados (/templates/other_elaborated.html)
      * Se llama desde la vista meet (/templates/other_meet.html)
    */
      $scope.goToElaborated = function () {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $scope.show_modal=false;
          $scope.show_quant_modal=false;
          $scope.EnabledSelection=true;
          $scope.product_selected = null;
          $scope.startPage = 0;
          if($rootScope.GuiSettings.best_selling_screen_enabled){
            $state.go('top_fruits', null, {reload: false});
          }
          else{
            $state.go('other_elaborated', null, {reload: false});
          }
          
      };
  
  
  
  /**
   * Función que decrementa el contador de tiempo de inactividad
   * en uno. Si se encuentra habilitada la cuenta regresiva, se programa 
   * la próxima ejecución de esta función para dentro de un segundo.
   */
      restartIdleTimeCountdownOV = function(){
        $timeout.cancel(timeOutPromiseOV);
        timeOutPromiseOV = $timeout(function(){$scope.goToMenu();}, MAX_IDLE_TIME);
      };
  
  /**
   * Función que cambia de página de productos
   * Se llama desde la vista (/templates/other_pork.html)
   * Reinicializa el contador de tiempo de inactividad
   */
      $scope.changeProducts = function (to_right) {
         restartIdleTimeCountdownOV();
         //SONIDITO
         if(window.cordova){
          $cordovaNativeAudio.play( 'pop' );
         }
         
         var step=1
         if(!to_right){step=-1}
         var numOfPages= Math.ceil($scope.products.length / PRODS_PER_PAGE);
         $scope.startPage = ($scope.startPage + step) % numOfPages;
         if( $scope.startPage<0){$scope.startPage=numOfPages-1;}
         $scope.startIndex=$scope.startPage * PRODS_PER_PAGE;
      }
  
  
  /**
   * Función que se llama automáticamente antes de ingresar a la vista.
   * Se llama cada vez que la app está por ingresar a la vista other_vegetables
   */
      $scope.$on('$ionicView.beforeEnter', function(){
        //Seteo la IP del server y la MAC BLE de acuerdo a la variable global
        $scope.settings = $rootScope.settings;
        //Seteo la página inicial en 0
        $scope.startPage=0;
        //Seteo el índice inicial de productos a mostrar en la página en 0
        $scope.startIndex=0;
  
        $scope.show_modal=false;
        $scope.show_quant_modal=false;
        $scope.EnabledSelection=true;
        $scope.product_selected = null;
        //obtengo todos los vegetales desde archivo local
        if($rootScope.GuiSettings.best_selling_screen_enabled){
          productDataService.getOtherPork()
            .then(function (response) {
              $scope.products = response;
              //calculo el número de páginas
              $scope.numOfPages = Math.ceil($scope.products.length / PRODS_PER_PAGE);
            });
        }
        else{
          productDataService.getAllPork()
            .then(function (response) {
              $scope.products = response;
              //calculo el número de páginas
              $scope.numOfPages = Math.ceil($scope.products.length / PRODS_PER_PAGE);
            });
        }
      });
  
  /**
   * Función que se ejecuta automáticamente cada vez que la aplicación 
   * ingresa a la vista other_pork.
   */
      $scope.$on('$ionicView.enter', function(){
        //Inicializo contador de tiempo de inactividad y comienzo el decremento
        restartIdleTimeCountdownOV();
        $rootScope.changedPage = true;
      });
  
  /**
   * Función que se ejecuta automáticamente cada vez que la applicación 
   * sale de la vista Home. Cancela el countdown del idle timer
   */
      $scope.$on('$ionicView.beforeLeave', function(){
        try{
          $timeout.cancel(timeOutPromiseOV);
        }
        catch(err){
          console.log("Error stopping the Timer", err);
        }
      });
  
  /**
   * Función que se ejecuta automáticamente cuando se terminan de 
   * cargar todos los archivos en el browser y el dispositivo está listo.
   * Se ejecuta una única vez.
   */
      $ionicPlatform.ready(function () {
        $scope.products = [];
        //obtengo todos los vegetales desde archivo local
        if($rootScope.GuiSettings.best_selling_screen_enabled){
          productDataService.getOtherVegetables()
            .then(function (response) {
              $scope.products = response;
              //calculo el número de páginas
              $scope.numOfPages = Math.ceil($scope.products.length / PRODS_PER_PAGE);
            });
        }
        else{
          productDataService.getAllPork()
            .then(function (response) {
              $scope.products = response;
              //calculo el número de páginas
              $scope.numOfPages = Math.ceil($scope.products.length / PRODS_PER_PAGE);
            });
        }
      });
  
  /**
   * Función que setea el producto seleccionado y habilita
   * la vista de pesaje. Esta funcion se llama desde 
   * la vista (/templates/top_vegetables.html)
   * Reinicializa el contador de inactividad.
   * Llama a sendClearMessageAndData()
   * Inhabilta la selección de otros productos.
   * @param{object} product El producto seleccionado.
   */
      $scope.selectProduct = function (product) {
        restartIdleTimeCountdownOV();
        if($scope.EnabledSelection){
          if($scope.product_selected){
            if($scope.product_selected.plu === product.plu){
              return;
            }
          }
          if(window.cordova){
            //SONIDITO
            $cordovaNativeAudio.play( 'pop' );
          }
          
          $scope.product_selected=product;
          
          // var flagValue = BluetoothService.getBluetoothFlag();
          // if(flagValue===true){
            try{
              sendClearMessageAndData(product.plu);
            }
            catch(err){
              console.log("Error sending message", err);
            }
          // }
          
          if(product.type === "veg-cant"){
            if($rootScope.GuiSettings.modal_cantidad_enabled){
              $scope.show_quant_modal=true;
            }
            else{
              $scope.acceptQuantity($rootScope.GuiSettings.defaultQuantity);
            }
            
          }
          else if(product.type === "cerdo"){
            if($rootScope.GuiSettings.modal_enabled){
              $scope.show_modal=true;
            }
            else{
              $scope.acceptProduct(product);
            }  
          }
          $scope.EnabledSelection=false;
        }
      }
  
  /**
   * Función que cancela el producto seleccionado.
   * Reinicializa el contador de inactividad. Esta funcion se llama desde 
   * la vista (/templates/top_vegetables.html)
   * Setea el producto seleccionadoa  null
   * Cierra la pantalla de pesaje
   * Vuelve a habilitar la selección de productos tras 300ms.
   */
      $scope.cancelProduct = function () {
        restartIdleTimeCountdownOV();
        if($scope.show_modal===true){
          //SONIDITO
          if(window.cordova){
            $cordovaNativeAudio.play( 'pop' );
          }
        }

        // var flagValue = BluetoothService.getBluetoothFlag();
        // if(flagValue===true){
          sendClearMessage();
        // }
        
        $scope.product_selected = null;
        $scope.show_modal=false;
        $scope.show_quant_modal=false;
        $timeout(enableSelection,300);
      };
  
  /**
   * Función que acepta el producto seleccionado. Esta funcion se llama desde 
   * la vista (/templates/top_vegetables.html)
   * Llama a sendEnterMessage()
   * Vuelve a habilitar la seleccióin de productos tras 300ms.
   * Llama a $scope.goToMenu()
   * @param{object} product El producto a aceptar.
   */
      $scope.acceptProduct = function (product) {
        restartIdleTimeCountdownOV();
        if($scope.show_modal===true){
          if(window.cordova){
            $cordovaNativeAudio.play( 'pop' );
          }
        }

        // var flagValue = BluetoothService.getBluetoothFlag();
        // if(flagValue==true){
          sendEnterMessage();
        // }
        
        $timeout(enableSelection,300);
        $scope.show_modal=false;
        $scope.product_selected = null;
      }
  
  /**
   * Función que acepta una cantidad de producto seleccionado. 
   * Esta funcion se llama desde 
   * la vista (/templates/top_vegetables.html)
   * Llama a sendQuantity()
   * Vuelve a habilitar la selección de productos tras 300ms.
   * @param{object} product El producto a aceptar.
   */
      $scope.acceptQuantity = function (quantity) {
        restartIdleTimeCountdownOV();
        if($scope.show_quant_modal===true){
          //SONIDITO
          if(window.cordova){
            $cordovaNativeAudio.play( 'pop' );
          }
        }

        // var flagValue = BluetoothService.getBluetoothFlag();
        // if(flagValue){
          try{
            sendQuantity(quantity);
          }
          catch(err){
            console.log("Error sending message", err);
          }
        // }

        $scope.product_selected=null;
        $scope.show_quant_modal=false;
        $timeout(enableSelection,300);
      }
  
  /**
   * Función que envía un mensaje de clear y el código
   * provisto al periférico BLE conectado.
   * @param{string} code El código plu a enviar por BLE.
   */
      function sendClearMessageAndData(code) {
        var data = new Uint8Array(code.length+4);
        var clear_msg = new Uint8Array(4);
        data[0] = 0x68; // 'h'
        data[1] = 0x2F; // '/'
        data[2] = 0x63; // 'c'
        for(i=0; i< code.length ; i++){
            data[i+3] = code.charCodeAt(i); // code digits
         }
        data[code.length+3] = 0x5F; // '_'
        sendBluetooth(data);
      }
  
  /**
   * Función que envía un mensaje de clear al 
   * periférico BLE conectado.
   */
      function sendClearMessage() {
        var clear_msg = new Uint8Array(4);
        clear_msg[0] = 0x68; // 'h'
        clear_msg[1] = 0x2F; // '/'
        clear_msg[2] = 0x63; // 'c'
        clear_msg[3] = 0x5F; // '_'
        sendBluetooth(clear_msg);
      }
  
  /**
   * Función que envía un mensaje enter al periférico BLE conectado.
   */
      function sendEnterMessage() {
        var enter_msg = new Uint8Array(4);
        enter_msg[0] = 0x68; // 'h'
        enter_msg[1] = 0x2F; // '/'
        enter_msg[2] = 0x65; // 'e'
        enter_msg[3] = 0x5F; // '_'
        sendBluetooth(enter_msg);
        console.log("-------------------------");
      }
  
  /**
   * Función que envía un mensaje X(por), la cantidad de unidades y enter.
     al periférico BLE conectado.
   */
      function sendQuantity(quantity) {
        var quantity_msg = new Uint8Array(quantity.length+5);
        quantity_msg[0] = 0x68; // 'h'
        quantity_msg[1] = 0x2F; // '/'
        quantity_msg[2] = 0x78; // 'x'
        for(i=0; i< quantity.length ; i++){
            quantity_msg[i+3] = quantity.charCodeAt(i); // quantity digits
        }
        quantity_msg[quantity.length+3] = 0x65; // 'e'
        quantity_msg[quantity.length+4] = 0x5F; // '_'
        sendBluetooth(quantity_msg);
        console.log("-------------------------");
      }
  
  /**
   * Función de utilidad que envía el array de caracteres
   * provisto al periférico BLE conectado.
   * @param{array} charArray serie de caracteres a enviar.
   */
  function sendBluetooth(charArray){
  
    var msg ="";
    for (var i=0; i<charArray.length; i++){
      msg+=String.fromCharCode(charArray[i]);
    }
    console.log(msg);

    
    device = BluetoothService.getDevice();
    var SERVICE_UUID = 'f0001130-0451-4000-b000-000000000000'; // Reemplaza con el UUID de tu servicio
    var CHARACTERISTIC_UUID = 'f0001131-0451-4000-b000-000000000000'; // Reemplaza con el UUID de tu característica
    var service = evothings.ble.getService(device, SERVICE_UUID);
    var characteristic = evothings.ble.getCharacteristic(service, CHARACTERISTIC_UUID);
    evothings.ble.writeCharacteristic(
      device,
      characteristic,
      charArray,
      function()
      {
          console.log('characteristic written');
          window.plugins.toast.showShortCenter('Escribi cuestion');
      },
      function(errorCode)
      {
          console.log('writeCharacteristic error: ' + errorCode);
          window.plugins.toast.showShortCenter('Writing error '+ errorCode);
      }
    );
  }
  
  /**
   * Función que activa la seleccion de productos.
   */
      function enableSelection(){
        $scope.EnabledSelection=true;
      }
    })
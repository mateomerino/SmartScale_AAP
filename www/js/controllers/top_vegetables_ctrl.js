//Declarando el controlador TopVegetablesCtrl dentro del módulo controllers (/js/controllers.js
//Este es el controller de la vista /templates/top_vegetables.html
controllers.controller('TopVegetablesCtrl', function ($scope, $q, $rootScope, $http, $ionicPlatform, $ionicHistory, $cordovaNativeAudio, $state, $timeout, productDataService) {

  /**
   * Indice de inicio de productos a mostrar en la página actual
   * @type {number}
   */
      $scope.startIndex=0;
  
  /**
   * Variable que indica si está habilitada la selección de productos
   * @type {boolean}
   */
      $scope.EnabledSelection=true;
  
  /**
   * Variable que indica si se muestra la pantalla de pesaje de producto
   * (/templates/modal.html)
   * @type {boolean}
   */
      $scope.show_modal=false;
      $scope.show_quant_modal=false;
  
  /**
   * Objeto que contiene server IP y MAC BLE
   * @type {object}
   */
      $scope.settings = $rootScope.settings;
  
  /**
   * Cantidad máxima de segundos de espera en la vista
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
      var timeOutPromiseTV;
  
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
      * Función que cambia a la vista vegetables (/templates/other_vegetables.html)
      * Se llama desde la vista (/templates/top_vegetables.html)
    */
      $scope.goToVegetables = function () {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $scope.show_modal=false;
          $scope.show_quant_modal=false;
          $scope.product_selected = null;
          $scope.EnabledSelection=true;
          $scope.startPage = 0;
          $state.go('other_pork', null, {reload: false});
      };
  
  /**
   * Función que decrementa el contador de tiempo de inactividad
   * en uno. Si se encuentra habilitada la cuenta regresiva, se programa 
   * la próxima ejecución de esta función para dentro de un segundo.
   */
      restartIdleTimeCountdownTV = function(){
        $timeout.cancel(timeOutPromiseTV);
        timeOutPromiseTV = $timeout(function(){$scope.goToMenu();}, MAX_IDLE_TIME);
      };
  
  /**
   * Función que se llama automáticamente antes de ingresar a la vista.
   * Se llama cada vez que la app está por ingresar a la vista top_vegetables
   */
      $scope.$on('$ionicView.beforeEnter', function(){
        //Seteo la IP del server y la MAC BLE de acuerdo a la variable global
        $scope.settings = $rootScope.settings;
        //Seteo el índice inicial de productos a mostrar en la página en 0
        $scope.startIndex=0;
        $scope.show_modal=false;
        $scope.show_quant_modal=false;
        $scope.EnabledSelection=true;
        $scope.product_selected = null;
        //obtengo los vegetales más vendidos desde archivo local
        productDataService.getBestSellingVegetables()
          .then(function (response) {
            $scope.products = response;
        });
      });
  
  /**
   * Función que se ejecuta automáticamente cada vez que la aplicación 
   * ingresa a la vista other_fruits.
   */
      $scope.$on('$ionicView.enter', function(){
        //Inicializo contador de tiempo de inactividad y comienzo el decremento
        restartIdleTimeCountdownTV();
      });
  
  /**
   * Función que se ejecuta automáticamente cada vez que la applicación 
   * sale de la vista Home. Cancela el countdown del idle timer
   */
      $scope.$on('$ionicView.beforeLeave', function(){
        try{
          $timeout.cancel(timeOutPromiseTV);
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
        //obtengo los vegetales más vendidos desde archivo local
        productDataService.getBestSellingVegetables()
          .then(function (response) {
            $scope.products = response;
          });
      });
  
  /**
   * Función que setea el producto seleccionado y habilita
   * la vista de pesaje. Esta funcion se llama desde 
   * la vista.
   * Reinicializa el contador de inactividad.
   * Llama a sendClearMessageAndData()
   * Inhabilta la selección de otros productos.
   * @param{object} product El producto seleccionado.
   */
      $scope.selectProduct = function (product) {
        restartIdleTimeCountdownTV();
        if($scope.EnabledSelection){
          if($scope.product_selected){
            if($scope.product_selected.plu === product.plu){
              return;
            }
          }
          $cordovaNativeAudio.play( 'pop' );
          $scope.product_selected=product;
          try{
            sendClearMessageAndData(product.plu);
          }
          catch(err){
            console.log("Error sending message", err);
          }
          if(product.type === "veg-cant"){
            $scope.show_quant_modal=true;
          }
          else if(product.type === "vegetable"){
            $scope.show_modal=true;
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
        restartIdleTimeCountdownTV();
        if($scope.show_modal===true){
          $cordovaNativeAudio.play( 'pop' );
        }
        sendClearMessage();
        $scope.product_selected=null;
        $scope.show_modal=false;
        $scope.show_quant_modal=false;
        $timeout(enableSelection,300);
      }
  
  /**
   * Función que acepta el producto seleccionado. Esta funcion se llama desde 
   * la vista (/templates/top_vegetables.html)
   * Llama a sendEnterMessage()
   * Vuelve a habilitar la seleccióin de productos tras 300ms.
   * @param{object} product El producto a aceptar.
   */
      $scope.acceptProduct = function (product) {
        restartIdleTimeCountdownTV();
        if($scope.show_modal===true){
          $cordovaNativeAudio.play( 'pop' );
        }
        try{
          sendEnterMessage();
        }
        catch(err){
          console.log("Error sending message", err);
        }
        $scope.product_selected=null;
        $scope.show_modal=false;
        $timeout(enableSelection,300);
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
        restartIdleTimeCountdownTV();
        if($scope.show_quant_modal===true){
          $cordovaNativeAudio.play( 'pop' );
        }
        try{
          sendQuantity(quantity);
        }
        catch(err){
          console.log("Error sending message", err);
        }
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
  
        ble.write($rootScope.device_id, "f0001130-0451-4000-b000-000000000000", "f0001131-0451-4000-b000-000000000000", charArray.buffer,
          function success() {
          }, function error(e) {
        });
      }
  
  /**
   * Función que activa la seleccion de productos.
   */
      function enableSelection(){
        $scope.EnabledSelection=true;
      }
    })
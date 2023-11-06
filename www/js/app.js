// Visor/Teclado Digital para Balanza MT8442 App
angular.module('starter', ['ionic', 'ngCordova','appControllers', 'appServices','ngImgCache'])

.run(function($ionicPlatform, $rootScope) {
  /* Definiciones de las settings de Gui 
   * para los diferentes supermercados
  **/
  var walmartSettings = { 
    //path imagen de seleccion frutas-verduras
    menu_picture: "res_img/inicio_wm.jpg",
    //path imagen de logo de supermercado
    menu_logo: "res_img/logo-WALMART.png",
    //paths imagenes de flechas de navegación de prods
    //TO-DO cambiarle el nombre a las imagenes para evitar confusiones
    arrow_imgs:{
      left:"res_img/flechaIzq_lib.png",
      right:"res_img/flechaDer_lib.png",
      left_dis:"res_img/flechaIzq_lib_disable.png",
      right_dis:"res_img/flechaDer_lib_disable.png"
    },
    //estilo de fondo de pantalla menu principal
    menu_container_style: {
      "height": "100%",
      "background-color": "rgb(0,125,195)"
    },
    //estilo de color de los elementos de la gui
    color_style: {
      "background-color": "rgb(0,125,195)"
     },
    // variable para habilitar/deshabilitar el modal de productos pesables
    modal_enabled:false,
    

    // variable para habilitar/deshabilitar el modo bucle al avanzar páginas de productos
    page_loop_enabled:true,

    modal_cantidad_enabled:true,

    defaultQuantity:"1",
    
    // variable para habilitar la pantalla de 20 productos más vendidos
    best_selling_screen_enabled: true
  };

  var libertadSettings = { 
    menu_picture: "res_img/inicio_aap.png",
    menu_logo: "res_img/logo-LIBERTAD.png",
    arrow_imgs:{
      left:"res_img/flechaIzq_lib.png",
      right:"res_img/flechaDer_lib.png",
      left_dis:"res_img/flechaIzq_lib_disable.png",
      right_dis:"res_img/flechaDer_lib_disable.png"
    },
    //COLOR DEL MENU PRINCIPAL
    menu_container_style: {
      "height": "100%",
      // "background-color": "rgb(237,28,36)"
      "background-color": "rgb(255, 115, 0)"
    },
    //COLOR DE LOS BORDES DE LAS PANTALLAS DE FRUTAS Y VERDURAS
    color_style: {
      // "background-color": "rgb(237,28,36)"
      "background-color": "rgb(255, 115, 0)"
    },
    // variable para habilitar/deshabilitar el modal de productos pesables
    // modal_enabled:false,
    modal_enabled:true,

    // modal_cantidad_enabled:false,
    modal_cantidad_enabled:true,

    defaultQuantity:"1",

    // variable para habilitar/deshabilitar el modo bucle al avanzar páginas de productos
    page_loop_enabled:false,

    best_selling_screen_enabled: false
  };

  var invelSettings = { 
    menu_picture: "res_img/inicio_inv.jpg",
    menu_logo: "res_img/logo-INVEL.png",
    arrow_imgs:{
      left:"res_img/flechaIzq_inv.png",
      right:"res_img/flechaDer_inv.png",
      left_dis:"res_img/flechaIzq_inv_disable.png",
      right_dis:"res_img/flechaDer_inv_disable.png"
    },
    menu_container_style: {
      "height": "100%",
      "background-color": "rgb(51,102,153)"
    },
    color_style: {
      "background-color": "rgb(51,102,153)"
    },
    // variable para habilitar/deshabilitar el modal de productos pesables
    modal_enabled:true,

    modal_cantidad_enabled:true,

    // variable para habilitar/deshabilitar el modo bucle al avanzar páginas de productos
    page_loop_enabled:false,

    defaultQuantity:"1",

    best_selling_screen_enabled: false
  };

   var cencosudSettings = { 
    menu_picture: "res_img/inicio_cen.jpg",
    menu_logo: "res_img/logo_cen.png",
    arrow_imgs:{
      left:"res_img/flechaIzq_cen.png",
      right:"res_img/flechaDer_cen.png",
      left_dis:"res_img/flechaIzq_cen_disable.png",
      right_dis:"res_img/flechaDer_cen_disable.png"
    },
    menu_container_style: {
      "height": "100%",
      "background-color": "rgb(9,90,165)"
    },
    color_style: {
      "background-color": "rgb(9,90,165)"
    },
    // variable para habilitar/deshabilitar el modal de productos pesables
    modal_enabled:true,

    modal_cantidad_enabled:true,

    defaultQuantity:"1",

    // variable para habilitar/deshabilitar el modo bucle al avanzar páginas de productos
    page_loop_enabled:true,

    best_selling_screen_enabled: false
  };

//////////////////////////////////////////////////////////////////////////////////////////////
  /*Definición de las clases y variables que permiten cambiar la cantidad de 
  productos a mostrar por página*/
  var matriz48prod = {
    offset:"offset-9", 
    col: "col-12",
    prodsPerPage:48,
    colsPerPage:8,
    parentRow:"row-edited-48p",
    row: "product-20-row-48p"
  };
  
  var matriz35prod = {
    offset:"offset-9", 
    col: "col-14",
    prodsPerPage:35,
    colsPerPage:7,
    parentRow:"row-edited-35p",
    row: "product-20-row-35p"
  };

  var matriz24prod = {
    offset:"offset-7", 
    col: "col-17",
    prodsPerPage:24,
    colsPerPage:6,
    parentRow:"row-edited-24p",
    row: "product-20-row-24p"
  };

  //selección del setting de Gui a utilizar
  $rootScope.GuiSettings = libertadSettings;

  //seleccion del setting de tamaño de matriz 
  $rootScope.MatrizSettings = matriz35prod;
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      StatusBar.hide();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  //$ionicConfigProvider.views.transition('none');

  $ionicConfigProvider.views.swipeBackEnabled(false);
  $stateProvider
    .state('app', {
      url: '/app',
      templateUrl: 'templates/home.html',
      controller: 'HomeCtrl'
    })
    .state('top_fruits',{
      url:'/top_fruits',
      templateUrl: 'templates/top_fruits.html',
      controller: 'TopFruitsCtrl' 
    })
    .state('top_vegetables',{
      url:'/top_vegetables',
      templateUrl: 'templates/top_vegetables.html',
      controller: 'TopVegetablesCtrl' 
    })
    .state('other_meet',{
      url:'/other_meet',
      templateUrl: 'templates/other_meet.html',
      controller: 'OtherFruitsCtrl' 
    })
    .state('other_pork',{
      url:'/other_pork',
      templateUrl: 'templates/other_pork.html',
      controller: 'OtherVegetablesCtrl' 
    })
    .state('other_elaborated',{
      url:'/other_elaborated',
      templateUrl: 'templates/other_elaborated.html',
      controller: 'OtherElaboratedCtrl' 
    });
  //  Default state:
  $urlRouterProvider.otherwise('/app');
});
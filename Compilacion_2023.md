Versiones con la que se pudo compilar en 2023:

node: 8.0.0
cordova: 8.1.2
plataforma cordova-android: 6.3.0
ionic 3
Si falla la compilacion con un error 'No resource identifier found for attribute 'appComponentFactory' in package 'android' ejecutar el comando:

cordova plugin add cordova-android-support-gradle-release --variable ANDROID_SUPPORT_VERSION=27.+

Para conectarse a la API por Ethernet la configuracion de la tablet con 'Static IP': 172.16.30.106

A LA DIRECCIÓN IP HAY QUE PONERLE EL PUERTO!!!!!!!!!!
Por ejemplo 172.16.30.122:3000

HAY QUE ARREGLAR LA CUESTION CON EL PLUGIN BLUETOOTH. PARA COMPILAR HASTA DONDE SE TIENE SIN ERRORES:
	Usar los archivos 'package.json' y 'config.xml' del repositorio actual
	Ejecutar npm install y cordova platform add android@6.3.0
	Ahi se va a cuestionar todo sin errores y se va a poder compilar. HAY QUE ARREGLAR EL PLUGIN BLUTU!

	Plugins bluetooth que no causan problemas de compilación:
	cordova-plugin-ble
		FUNCION QUE SE USA PA TESTEA CUESTION
function enableAndConnectBle(){
      setTimeout(function() {
        evothings.ble.startScan(
          function(device) {
            //ESTA ES LA SUCCESSFUL FUNCTION DEL STARTSCAN!!!
            window.plugins.toast.showShortCenter('Estoy buscando');
            if(device.address === $rootScope.settings.bluetooth_mac)
            {
              window.plugins.toast.showShortCenter('ENCUENTRO');
              evothings.ble.stopScan();
              evothings.ble.connect(
                device, 
                function(connectInfo)
                {
                  // evothings.ble.stopScan();
                  //SUCCESFULL FUNCTION DEL CONNECTICUT
                  window.plugins.toast.showShortCenter('CONECTADO');
                  BluetoothService.setDevice(device);
                  BluetoothService.setDeviceName(device.name);
                  connectionSuccess();
                  $scope.connectedToBluetooth = true;
                  $scope.show_init_modal= $scope.touchs >= 15;
                }, 
                function(errorCode)
                {
                  //Error function del connecticut
                  window.plugins.toast.showShortCenter('Error de conexión: ' + errorCode);
                });
            }
          }, 
          function(){
            //ESTA ES LA ERROR FUNCTION DEL STARTSCAN!
            window.plugins.toast.showShortCenter('STARTSCAN ERROR');
        });
      }, 10000);
	  }
	cordova-plugin-networking-bluetooth
	cordova-plugin-bluetoothclassic-serial

	plugins que causan problemas
	cordova-plugin-ble-central
	cordova-plugin-bluetoothle
	cordova-plugin-ble-peripheral
	cordova-plugin-ble-vegam-central

PLUGIN TOAST PARA DEBUGEO!!!!!!!!!!!!!
cordova plugin add cordova-plugin-x-toast

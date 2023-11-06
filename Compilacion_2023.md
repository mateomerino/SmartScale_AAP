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
		Funcion que Casi anda, llega a error 133 de conexion y no sale de ahi
										function ConnectBle() {
									var tries=0;
									window.plugins.toast.showShortCenter('QUIERO CONEEEEEEE');
									evothings.ble.startScan(
									function(device) {
										window.plugins.toast.showShortCenter(device.name);
										if (device.name === 'MT 8442') {
										window.plugins.toast.showShortCenter('Lo encontre');
										evothings.ble.stopScan();
										window.plugins.toast.showShortCenter('Dejo de scanning');
										tryConnection(device);
										// Ahora, intentamos conectarnos al dispositivo
										function tryConnection(device){
											evothings.ble.connectToDevice(
											device,
											function(device) {
												window.plugins.toast.showShortCenter('Conectado');
												// Aquí puedes agregar tu código para manejar la conexión exitosa
											},
											function(device) {
												window.plugins.toast.showShortCenter('Desconectado');
												// Aquí puedes agregar tu código para manejar la desconexión
											},
											function(error) {
												window.plugins.toast.showShortCenter('Error de conexión: ' + error);
												// Aquí puedes agregar tu código para manejar errores de conexión
												if(error===133){
												tries++;
												window.plugins.toast.showShortCenter('Intento nro'+tries);
												if(tries===20){
													window.plugins.toast.showShortCenter('Intente 20 times');    
												}
												if (device){
													window.plugins.toast.showShortCenter('Disconnecting');
													evothings.ble.close(device);
												}
												setTimeout(function() { tryConnection(device) }, 500)
												}
											}
											);
										}
										
										}
									}
									);
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

Versiones con la que se pudo compilar en 2023:

node: 8.0.0
cordova: 8.1.2
plataforma cordova-android: 6.3.0
ionic 3
Si falla la compilacion con un error 'No resource identifier found for attribute 'appComponentFactory' in package 'android' ejecutar el comando:

cordova plugin add cordova-android-support-gradle-release --variable ANDROID_SUPPORT_VERSION=27.+

Se modificó el plugin bluetooth que se utiliza. Se usa 'cordova-plugin-ble' en lugar de 'cordova-plugin-ble-central' como se usaba anteriormente. Este cambio fue porque la utilización de 
'cordova-plugin-ble-central' causaba problemas. Son muy similares.	

Se añadió el plugin 'cordova-plugin-x-toast' que sirve para debugear cuando el programa está
corriendo en la tablet, ya que muestra mensajes en pantalla y se vuelve algo similar al uso de un 'print'

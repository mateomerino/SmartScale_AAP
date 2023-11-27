# Compilar versión release
## Primera Vez
Es necesario generar el certificado con la que se va a firmar la aplicación.
Para esto se usa la herramienta **keytool** del set del JDK, ubicada en *$JAVA_HOME/BIN* (/bin/jdk1.8.0_131/bin en mi caso).
Se ejecuta el siguiente comando:
`keytool -genkey -v -keystore my-release-key.keystore -alias alias_name -keyalg RSA -keysize 2048 -validity 10000`
En mi caso el comando es:
`sudo keytool -genkey -v -keystore smartScale-release-key.keystore -alias SmartScale -keyalg RSA -keysize 2048 -validity 10000`
El archivo .keystore va a crearse en la ruta donde el comando fue ejecutado. Recomiendo hacerlo en *PATH_PROYECTO/platforms/android* porque allí debe quedar finalmente.
Ahora tenemos el archivo *smartScale-release-key.keystore* como certificado para firmar nuestro apk. Lo que sigue es aplicar la firma al apk y luego alinearlo. El tutorial de ionic propone hacerlo con las herramientas **jarsigner** (también incluida en el JDK) y **zipalign** (parte del SDK /path/to/Android/sdk/build-tools/VERSION/zipalign).
Siguiendo esos pasos (mas detalle en los links abajo) se obtiene el apk listo para subir GooglePlay. Pero existe un atajo...
En las versiones nuevas de ionic, basta con crear un archivo de nombre **release-signing.properties** en *PATH_PROYECTO/platforms/android* (donde debería estar el archivo *.keystore generado previamente) y cargarle el siguiente contenido:
> key.store=YourApp.keystore
> key.store.password=<YourApp keystore password>
> key.alias=YourApp
> key.alias.password=<YourApp alias password>

En mi caso es:
> key.store=smartScale-release-key.keystore
> key.store.password=#######
> key.alias=SmartScale
> key.alias.password=#######

## Próximas veces
Y luego de esto, con solo correr el comando:
`cordova build --release android`
Se nos genera en la carpeta *PATH_PROYECTO/platforms/android/build/outputs/apk* los siguientes APK:
- PATH_PROYECTO/platforms/android/build/outputs/apk/android-armv7-release.apk
- PATH_PROYECTO/platforms/android/build/outputs/apk/android-x86-release.apk

La versión a producción sería **android-armv7-release.apk**.



Fuentes:
http://ionicframework.com/docs/v1/guide/publishing.html
https://forum.ionicframework.com/t/ionic-toturial-for-building-a-release-apk/15758/17

Autor: Martin Gleria
Fecha:25/08/2017

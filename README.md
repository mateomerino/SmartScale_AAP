# SmartScale
Aplicación que funciona como nexo entre una Balanza (MT8442) mediante un enlace Bluetooth, para que el usuario final pueda auto-servirse en alguna dependencia de un comercio. Por otra parte tiene interfaz con un servidor remoto desde donde adquiere los productos que va a mostrar y sus imágenes respectivas, se supone que existe sincronización externa entre los productos ofrecidos por el servidor remoto y los disponibles en la balanza .

## Configuración del Entorno de Desarrollo
## Windows:
1. Instalar Git Client [link](https://git-scm.com/downloads)
1. Instalar Node.js [link](https://nodejs.org/en/)
1. Instalar Ionic y Cordova: 
    * Ejecutar la siguiente línea en la consola de comandos: __*npm install -g cordova ionic*__
1. Seguir la guía de **Instalación de Requerimientos** del entorno de Cordova para una plataforma Android [link](https://cordova.apache.org/docs/en/7.x/guide/platforms/android/)
    * El SDK de Android debe instalarse utilizando Android SDK Manager, incluido en Android Studio. Utilizando la tabla de referencia ofrecida por Cordova y considerando que la tablet utiliza Android 4.1, el SDK a instalar debe ser uno entre las versionas 14-22. _Consejo: probar instalar v16 y v22_.
1. Clonar el repositorio git.
    * En una consola de comandos dirigirse al directorio local donde quiera almacenar el código del repositorio.
    * Ejecutar la siguiente línea en la consola de comandos: __*git clone https://github.com/invellat/app_mt8442.git*__
1. Instalar la plataforma android para Ionic.
    * Una vez clonado el repositorio dirigirse al directorio __\app_mt8442\visorBalanza__ en una consola de comandos.
    * Ejecutar la siguiente instrucción en la consola de comandos: __*ionic platform add android*__
1. Hacer un Build y Ejecutar la aplicación:
    * Conectar un dispositivo android a la PC, asegurarse de su conexión utilizando la instrucción __*adb devices*__ en una linea de comandos. (Para ejecutar dicha instrucción tal vez deba agregar __C:\Users\USER_INVEL\AppData\Local\Android\sdk\platform-tools__ a la variable PATH en las Environment Variables del sistema operativo).
    * Dirigirse al directorio __\app_mt8442\visorBalanza__ en una consola de comandos.
    * Ejecutar la siguiente línea en la consola de comandos: __*ionic run android*__
    * El archivo apk se encontrara en __\app_mt8442\visorBalanza\platforms\android\build\outputs\apk\android-armv7-debug.apk__

1. Sólo hacer un Build, sin ejecutar la aplicación:
    * Dirigirse al directorio __\app_mt8442\visorBalanza__ en una consola de comandos.
    * Ejecutar la siguiente línea en la consola de comandos: __*ionic build android*__
    * El archivo apk se encontrara en __\app_mt8442\visorBalanza\platforms\android\build\outputs\apk\android-armv7-debug.apk__

## Ubuntu:
1. Instalar curl en caso de no estar instalado:
	sudo apt-get install curl

1. Instalar node 6.11.0 (https://nodejs.org/es/download/package-manager/#debian-and-ubuntu-based-linux-distributions)

	curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

	sudo apt-get install -y nodejs

	sudo apt-get install -y build-essential


1. Instalar Cordova y Ionic (https://ionicframework.com/getting-started/)
	
	sudo npm install -g cordova ionic

1. Instalar Git: 
	sudo apt-get install git

1. Clonar repositorio:
	
	git clone https://github.com/invellat/app_mt8442.git

1. Descargar e Instalar Android Studio (https://developer.android.com/studio/install.html):
	descargar zip: https://developer.android.com/studio/index.html

	extraer zip: sudo unzip /home/<<user_invel>>/Downloads/android-studio-ide-162.4069837-linux.zip -d /usr/local/

	ejecutar comando: /usr/local/android-studio/bin/studio.sh
	
	seguir pasos de instalación de android studio

1. Instalar Java JDK8 (https://www.digitalocean.com/community/tutorials/como-instalar-java-con-apt-get-en-ubuntu-16-04-es):
	sudo add-apt-repository ppa:webupd8team/java
	sudo apt-get update
	sudo apt-get install oracle-java8-installer
	
ver el directorio de instalación de Java:
	sudo update-alternatives --config java
Editar archivo /etc/environment (por ejemplo con sudo nano /etc/environment) y agregar las siguientes variables de entorno con el directorio obtenido en el paso anterior, Por ejemplo:
	JAVA_HOME="/usr/lib/jvm/java-8-oracle"
	JRE_HOME="/usr/lib/jvm/java-8-oracle/jre"
	
Guardar el archivo /etc/environment y ejecutar:
	source /etc/environment

Comprobar que se setearon las variables de entorno:
	echo $JAVA_HOME

1. En Android Studio abrir SDK Manager y descargar API 19 - Android 4.4 KitKat.



1. Editar archivo /etc/environment (por ejemplo con sudo nano /etc/environment) y agregar la siguiente variables de entorno con el 	directorio del SDK, Por ejemplo:
	ANDROID_HOME="/home/<<user_invel>>/Android/Sdk"

	Además agregar los directorios "tools", "tools/bin" y "platform-tools" al PATH. DIchos directorios se encuentran dentro del directorio de Android SDK, por ejemplo:
	PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/home/<<user_invel>>/Android/Sdk/tools:/home/<<user_invel>>/Android/Sdk/tools/bin:/home/<<user_invel>>/Android/Sdk/platform-tools"

1. Guardar el archivo y ejecutar:
	source /etc/environment

Dirigirse al directorio del proyecto : /home/<<user_invel>>/Repo/app_mt8442/visorBalanza

ejecutar: cordova platform add android

Cuando el sistema pregunte si desea instalar dependencias en .node_modules responder que sí, y correr:
	ionic cordova platform --help

cuando el sistema pregunte si desea instalar @ionic/cli-plugin-gulp responder: 
	sí
y cuando el sistema pregunte si desea instalar @ionic/cli-plugin-ionic1 responder:
	sí

1. ejecutar: 
	cordova platform add android.

1. ejecutar: 
	sudo chmod 777 /home/<<user_invel>>/Repo/app_mt8442/visorBalanza/hooks/after_prepare/010_add_platform_class.js

1. instalar gradle:

	wget https://services.gradle.org/distributions/gradle-3.0-bin.zip

	sudo unzip gradle-3.0-bin.zip -d /usr/local

1. Editar archivo /etc/environment (por ejemplo con sudo nano /etc/environment) y agregar el diectorio /usr/local/gradle-3.0/bin al PATH, Por ejemplo:
	PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/home/<<user_invel>>/Android/Sdk/tools:/home/<<user_invel>>/Android/Sdk/tools/bin:/home/<<user_invel>>/Android/Sdk/platform-tools:/usr/local/gradle-3.0/bin"

1. Guardar el archivo y ejecutar:
	source /etc/environment

1. Verificar si gradle está instalado ejecutando:
	gradle -v

1. Instalar crosswalk: 
	ionic cordova plugin add cordova-plugin-crosswalk-webview

1. Ejecutar build o run: 
	cordova build android

	cordova run android

Versiones con la que se pudo compilar en 2023:

node: 8.0.0
cordova: 8.1.2
plataforma cordova-android: 6.3.0
Si falla la compilacion con un error 'No resource identifier found for attribute 'appComponentFactory' in package 'android' ejecutar el comando:
    cordova plugin add cordova-android-support-gradle-release --variable ANDROID_SUPPORT_VERSION=27.+
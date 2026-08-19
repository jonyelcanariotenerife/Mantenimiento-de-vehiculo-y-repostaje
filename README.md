# Flota Master — Vista previa web

Esta es la versión para que el cliente pueda **abrir un enlace y probar la
app directamente en el navegador**, sin instalar nada. Es el mismo
código que corre dentro de la app Android (WebView de Capacitor), pero
publicado como página web normal — funciona igual, solo cambia cómo se
abre.

No es la app nativa Android final (esa sigue en el repo de Flota Master
con Capacitor) — esto es para que el cliente vea y pruebe la interfaz y
las funciones mientras se termina de construir.

## Publicarlo en GitHub Pages

1. Sube el contenido de esta carpeta a un repositorio de GitHub (puede
   ser este mismo repo en la raíz, o en una carpeta `/docs`).
2. En el repo: **Settings → Pages**.
3. En "Source", elige la rama (`main`) y la carpeta donde subiste esto
   (`/root` o `/docs`).
4. Guarda. GitHub te da un enlace tipo
   `https://tu-usuario.github.io/nombre-del-repo/` — compártelo con el
   cliente. Tarda uno o dos minutos en activarse la primera vez.

Cada vez que hagas `git push` con cambios en esta carpeta, la página se
actualiza sola en unos minutos — no hay que hacer nada más.

## Qué debe saber el cliente

- Los datos se guardan **en ese navegador/dispositivo** (localStorage),
  no en un servidor. Si prueba desde el móvil y luego desde el
  ordenador, verá datos distintos en cada uno — son independientes.
- Si borra el historial/datos del navegador para ese sitio, pierde lo
  que tenga guardado. Puede exportar un backup en JSON con el botón
  "Exportar" de la cabecera.
- Es una versión en construcción: el contenido del Peugeot 206
  (mantenimientos y masterclass) sigue siendo genérico hasta confirmar
  la ficha técnica del motor.

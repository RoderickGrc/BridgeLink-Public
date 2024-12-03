# Instalar

1. **Crear Entorno**
Abrimos terminal en el directorio del proyecto y ejecutamos este comando.
```
py -m venv venv
```

Luego ejecutamos el siguiente comando.

```
pip install django
```

2. **Instalar Requerimientos**

```
pip install -r requirements.txt
```

3. **Ejecutar el Servidor**

```
python manage.py runserver
```
****
# **Documentación de BridgeLink**

**Introducción**
BridgeLink es una plataforma de software basada en la web diseñada para transformar las entradas de comunicación de personas con discapacidades auditivas o visuales en formatos comprensibles. Proporciona una experiencia de usuario simplificada para reconocer entradas de voz, interpretar gestos de lenguaje de señas y comunicarse mediante síntesis de voz (TTS). La implementación actual se centra en integrar módulos para el reconocimiento en tiempo real de lenguaje de señas y reconocimiento de voz, con soporte de Django como framework backend.

**Estructura del Proyecto**

- **Frontend (HTML, CSS, JavaScript):** Maneja la interfaz de usuario, las animaciones y la comunicación con los servicios backend a través de JavaScript asíncrono.
- **Backend (Framework Django):** Proporciona endpoints para procesar entradas de usuario, manejar módulos de reconocimiento de gestos y voz, y procesar texto con herramientas de lenguaje natural basadas en IA.
- **Módulos principales:**
  - **Manejador Mediapipe (SignLanguageLib):** Administra la ejecución del sistema de reconocimiento de lenguaje de señas.
  - **Limpieza de Texto y Síntesis de Voz (TTSHandler):** Convierte texto en habla sintetizada para una comunicación auditiva clara.
  - **Manejo de LLM (GeminiRequest):** Procesa las entradas recibidas para limpiar y formatear la información.

**Instalación y Configuración**

1. Clona el repositorio en tu máquina local.
2. Instala las dependencias requeridas usando `pip install -r requirements.txt`.
3. Configura los archivos estáticos y la base de datos de Django usando `python manage.py collectstatic` y `python manage.py migrate`.
4. Ejecuta el servidor con `python manage.py runserver`.

**Funcionalidades del Frontend**

- **Atajos de Teclado:** Para proporcionar accesibilidad a usuarios con discapacidades, se han implementado atajos de teclado:
  - **Enter:** Confirmar el mensaje actual.
  - **Escape:** Cancelar la acción en curso.
  - **Espacio:** Activar el módulo LESSA (lenguaje de señas).
  - **Retroceso:** Activar el módulo de reconocimiento de voz.
- **Componentes de la Interfaz de Usuario:**
  - **Sección de Visualización:** Contiene el indicador de estado y la visualización del texto, que se actualiza continuamente para reflejar las palabras reconocidas o los gestos interpretados.
  - **Botones de Interacción:** Permiten la interacción con diferentes módulos (por ejemplo, confirmar o cancelar mensaje).

**Servicios Backend**

- **Vistas (views.py):**
  - Maneja las solicitudes HTTP y controla el flujo de diferentes operaciones.
  - Procesa solicitudes de inicio, detención y polling para el reconocimiento LESSA.
- **Servicios (services.py):**
  - Proporciona funciones como `start_lessa_module`, `stop_lessa_module` y `get_lessa_data` para interactuar con el Manejador Mediapipe.
  - Estos servicios ayudan a separar la lógica de las vistas de la lógica de procesamiento central, mejorando el mantenimiento.
- **Manejadores (mediapipe\_handler.py, tts\_handler.py, llm\_handler.py):**
  - **Clase SignLanguageLib:** Controla la ejecución de Mediapipe, manteniendo un estado de reconocimiento persistente en segundo plano.
  - **TTSHandler:** Convierte texto en audio, devolviendo una URL para el habla sintetizada.

**Reconocimiento de Lenguaje de Señas (Módulo LESSA)**
El módulo LESSA maneja el reconocimiento en tiempo real de gestos mediante un mecanismo de polling. Recupera continuamente los datos actuales del backend cada 500ms mientras el módulo está activo.

- **Inicio/Detención del Reconocimiento:** Los usuarios pueden iniciar o cancelar el reconocimiento mediante botones en el frontend. Cuando se detiene, los datos correspondientes se envían al backend para terminar el proceso.
- **Mecanismo de Polling:** Administrado a través de `setInterval()` en JavaScript, el polling se detiene una vez que el módulo indica que ya no está activo.

**Módulo de Reconocimiento de Voz**
La función de Reconocimiento de Voz utiliza APIs del navegador para manejar el reconocimiento de voz de manera continua:

- **Inicio/Detención del Reconocimiento:** Activado desde el frontend mediante la interacción del usuario (por ejemplo, clic de botón o atajo de teclado).
- **Manejo del Habla:** Reconoce las palabras habladas, las muestra en tiempo real y envía la transcripción para su procesamiento.

**Actualizaciones del Estado del Consola**
La interfaz de usuario incluye un indicador de estado para accesibilidad. La función `setConsoleState()` en el archivo utils de JavaScript actualiza el estado del consola con un efecto de escritura, haciendo claro para los usuarios con discapacidades visuales lo que está sucediendo en cada paso.

**Desafíos y Consideraciones**

- **Comunicación Asíncrona:** La sincronización adecuada de los cambios de estado entre el frontend y el backend es fundamental para mantener una experiencia de usuario precisa y fluida.
- **Manejo de Errores y Tiempos de Espera:** La implementación incluye mecanismos de manejo de errores para proporcionar una degradación suave. Por ejemplo, si el procesamiento tarda demasiado, se ejecutan acciones alternativas para asegurar que el usuario esté informado.
- **Accesibilidad:** La accesibilidad es un enfoque principal. Con funciones como atajos de teclado, indicaciones de audio pregrabadas y una pantalla de consola que informa el estado actual, BridgeLink pretende ser lo más amigable posible para las personas con discapacidades.

**Conclusión**
BridgeLink es una herramienta prometedora que combina tecnologías avanzadas de IA con énfasis en la accesibilidad. La estructura del proyecto separa el frontend, las vistas del backend y los servicios principales para mantener la modularidad y la facilidad de desarrollo. Las mejoras futuras y las posibles funciones buscarán mejorar la experiencia general mientras se mantiene la funcionalidad principal disponible para todos los usuarios.


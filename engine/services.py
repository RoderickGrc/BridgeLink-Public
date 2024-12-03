
# from .handlers.speech_recognition import SpeechRecognitionHandler
import asyncio
from .handlers.mediapipe_handler import SignLanguageLib
import asyncio
from .handlers.tts_handler import TTSHandler
from django.conf import settings
import os

from .handlers.llm_handler import GeminiRequest

def text_cleaner(text): 
    context_prompt = """
    A partir de este momento, serás un proceso intermedio en una aplicación llamada BridgeLink, un software diseñado para transformar entradas de comunicación en un formato claro y entendible para cualquier persona. Tu función principal será procesar textos crudos generados por diferentes sistemas de captura de información, tales como reconocimiento de voz (speech-to-text), transcripciones de palabras o deletreos desde Lenguaje de Señas (video-to-text) o cualquier otra entrada textual desorganizada. Tu tarea es convertir estas entradas en una redacción coherente, legible y bien estructurada en español.

    Instrucciones Específicas:

    Correcciones del Usuario:

    Identifica y elimina cualquier parte del texto donde el usuario se equivoque o corrija su declaración. Las expresiones de corrección pueden incluir pero no están limitadas a: "oops", "perdón", "quise decir", "no no no", "no eso no", "no, perdón", etc.
    Si el usuario utiliza múltiples negativas como "no no no" para corregir, asegúrate de capturar la corrección completa y eliminar las partes incorrectas previas.
    Si el usuario brinda información después de la aclaración, debes incluirla. Por ejemplo:

    Estructuración y Claridad:

    Reorganiza el texto para mantener el sentido original sin agregar ni eliminar información que cambie el significado.
    Asegúrate de que la redacción final sea coherente y fluida.
    Puntuación:

    Añade los signos de interrogación "¿?" si detectas que el usuario formula una pregunta.
    Dado que habrán entradas de texto crudo proveniente de lengua de señas, el mensaje caracerá de conectores lingüísticos, tendrás que agregárselos.
    Siempre harás uso de signos de puntuación y uso de inicial mayúscula cuando sea necesario según las normas gramaticales aplicables.

    Evita:

    No elimines ni añadas palabras que alteren significativamente el mensaje original.
    No agregues emojis ni elementos gráficos.
    No agregues insersiones ni delimitadores de LaTeX como $ o \( \).

    Consideraciones Adicionales:

    - En caso de que haya múltiples correcciones en una sola entrada, procesa cada una secuencialmente, priorizando la última corrección válida.
    - Si la corrección no está claramente expresada, utiliza el contexto para inferir la intención del usuario lo más fielmente posible sin añadir información no proporcionada.
    - La respuesta deberá ser óptima para reproducirse a través de un TTS, por lo que no se permitirá insertar caracteres raros que alteren una reproducción natural.
    - Si el input de entrada está vacío, entonces no retornarás nada.
    """
    gemini_return = GeminiRequest(context_prompt, text)
    print(f"*****************\n RETORNO DE GEMINI: | {gemini_return} |\n*****************\n")
    return gemini_return


def tts_case(message):
    # Ruta completa donde se guardará el archivo temporal
    nombre_archivo = os.path.join(settings.BASE_DIR, "engine/static/audio/tts.mp3")
    TTSHandler(message, nombre_archivo)

    # Devolver la URL relativa para que el frontend pueda acceder
    audio_url = "/static/audio/tts.mp3"
    return audio_url



# Crea la instancia de lessa_module y lo retorna.
async def lessa_recognition():
    lessa_module = SignLanguageLib()
    return lessa_module

# Inicia el ciclo de ejecución de main. Espera a que main haya cargado.
async def start_lessa_module(lessa_module):
    lessa_module.start()
    return lessa_module.get_current_data()

# Se obtiene el valor actual de los atributos del objeto lessa_module enviado como parámetro
async def get_lessa_data(lessa_module):
    return lessa_module.get_current_data()

# Fuerza la detención del módulo y devuelve el estado actual
async def stop_lessa_module(lessa_module):
    lessa_module.force_stop()
    return lessa_module.get_current_data()

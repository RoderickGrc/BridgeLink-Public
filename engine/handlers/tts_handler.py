from gtts import gTTS
from pydub import AudioSegment
import time
import os
import threading
import asyncio
from edge_tts import Communicate

from engine.config import language

def TTSHandler(text, file_path):
    edgeTTS(text,file_path)

def googleTTS(text, file_path):
    # Asegurarse de que el directorio exista
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Crear el archivo de audio
    tts = gTTS(text=text, lang=language)
    tts.save(file_path)



def edgeTTS(text, file_path, rate="+20%"):
    async def generate_tts():
        # Asegurarse de que el directorio exista
        os.makedirs(os.path.dirname(file_path), exist_ok=True)

        # Crear el archivo de audio con la voz es-US-AlonsoNeural y ajustar la velocidad
        comunicador = Communicate(text=text, voice="es-US-AlonsoNeural", rate=rate)
        await comunicador.save(file_path)

    # Ejecutar la generación de TTS de forma asincrónica
    asyncio.run(generate_tts())

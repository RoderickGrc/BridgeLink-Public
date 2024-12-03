# engine/handlers/mediapipe_handler.py

import asyncio
from .lessa_lib.main_module import SignLanguageRecognizer  # Importación relativa

class SignLanguageLib:
    def __init__(self):
        self.recognizer = SignLanguageRecognizer()

    def start(self):
        self.recognizer.start()

    def force_stop(self):
        self.recognizer.force_stop()

    def get_current_data(self):
        return self.recognizer.get_current_data()

    def save_recognized_signs(self, filename):
        self.recognizer.save_recognized_signs(filename)

# Funciones asíncronas que serán llamadas por los servicios del backend

async def lessa_recognition():
    """
    Crea una instancia de SignLanguageLib y la retorna.
    """
    lessa_module = SignLanguageLib()
    return lessa_module

async def start_lessa_module(lessa_module):
    """
    Inicia el reconocimiento de lenguaje de señas.
    """
    lessa_module.start()
    return lessa_module.get_current_data()

async def get_lessa_data(lessa_module):
    """
    Obtiene los datos actuales del módulo de lenguaje de señas.
    """
    return lessa_module.get_current_data()

async def stop_lessa_module(lessa_module):
    """
    Fuerza la detención del módulo de lenguaje de señas y retorna el estado actual.
    """
    lessa_module.force_stop()
    return lessa_module.get_current_data()

from django.shortcuts import redirect, render
from django.http import JsonResponse
from .services import tts_case, text_cleaner, lessa_recognition, get_lessa_data, start_lessa_module, stop_lessa_module
from .config import language

# Imports de archivos en handlers
# from .handlers.llm_handler import LLMHandler
# from .handlers.mediapipe_handler import MediaPipeHandler
# from .handlers.speech_recognition import SpeechRecognitionHandler
# from .handlers.tts_handler import TTSHandler
from django.template.loader import render_to_string

MESSAGES_DB = [
]

def text_cleaning(request):
    print("Se ejecuta sentencia de limpiado de")
    raw_text = request.GET.get('raw_text')
    clean_text = text_cleaner(raw_text)
    
    data = {
        "text": clean_text
    }
    return JsonResponse(data)

def tts(request):
    message = request.GET.get('message')

    print(f"Reproduciendo mensaje: {message}")
    audio_url = tts_case(message)    
    print(audio_url)
    
    data = {
        "ok": True,
        "audio_url": audio_url,
    }
    return JsonResponse(data)


def chat_messages(request):
    # En un escenario real, aquí se podría acceder a una base de datos para obtener los mensajes
    if request.method == "GET":
        # Preparar los datos en un diccionario
        data = {
            "mensajes": MESSAGES_DB
        }
        return JsonResponse(data)
    else:
        return JsonResponse({"error": "Método no permitido"}, status=405)


def set_case(request):
    case = request.GET.get('case')
    params = {
        "valid": True,
        "state_html": None,
        "info": None
    }
    
    if case == "lessa":
        print(case)
        params["state_html"] = render_to_string("program/lessa_state.html")

    elif case == "voice":
        print(case)
        params["state_html"] = render_to_string("program/voice_state.html")

    elif case == "tts":
        print(case)
        params["state_html"] = render_to_string("program/tts_state.html")

    elif case == "loading":
        print(case)
        params["state_html"] = render_to_string("program/loading_state.html")

    elif case == "await":
        print(case)
        params["state_html"] = render_to_string("program/await_state.html")
    else:
        print(f"No se reconoce el caso {case}.")

        params["state_html"] = False
    print(params)
    return JsonResponse(params)

def index(request):
    # Recuperar el estado actual de la sesión, si existe, o usar 'await' por defecto
    current_case = request.session.get('current_case', 'await')
    # Guardar el estado en la sesión para que persista
    request.session['current_case'] = current_case

    params = {
        "case": current_case,
    }
    return render(request, 'index.html', params)

async def preload_lessa_module(request):
    request.session["current_lessa_module"]
    return

# Diccionario global para mantener las instancias de lessa_module activas
lessa_instances = {}

# Vista para iniciar el reconocimiento de LESSA
async def start_lessa_recognition(request):
    session_id = request.session.session_key
    current_lessa_module = lessa_instances.get(session_id)

    # Si no existía anteriormente una instancia, se crea una nueva
    if current_lessa_module is None:
        current_lessa_module = await lessa_recognition()
        lessa_instances[session_id] = current_lessa_module
        confirm = await start_lessa_module(current_lessa_module)
    else:
        confirm = await start_lessa_module(current_lessa_module)

    params = {
        "is_active": confirm["is_active"]
    }
    return JsonResponse(params)

# Vista para detener el reconocimiento de LESSA
async def stop_lessa_recognition(request):
    session_id = request.session.session_key

    # Asegurarse de que la sesión tiene un valor antes de continuar
    if session_id is None:
        print("No se ha encontrado una sesión válida, no se hará nada.")
        return JsonResponse({"error": "No hay una sesión válida."}, status=400)

    current_lessa_module = lessa_instances.get(session_id)

    # Si no hay una instancia, retorna un error
    if current_lessa_module is None:
        print("No se ha encontrado instancia, no se hará nada")
        return JsonResponse({"error": "No hay un módulo LESSA en ejecución."}, status=400)

    # Forzar la detención del módulo
    confirm = await stop_lessa_module(current_lessa_module)

    # Eliminar la instancia de la memoria después de detenerla
    del lessa_instances[session_id]

    params = {
        "is_active": confirm["is_active"]
    }
    return JsonResponse(params)



# Vista para obtener los datos actuales de LESSA
async def get_current_lessa_data(request):
    session_id = request.session.session_key
    current_lessa_module = lessa_instances.get(session_id)

    # Si no hay una instancia, retorna un error
    if current_lessa_module is None:
        return JsonResponse({"error": "No hay un módulo LESSA en ejecución."}, status=400)

    # Obtener los datos actuales del módulo
    data = await get_lessa_data(current_lessa_module)

    params = {
        "is_active": data["is_active"],
        "current_text": data["current_text"],
    }
    return JsonResponse(params)
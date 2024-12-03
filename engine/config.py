import json
import os

# Ruta al archivo de configuración relativa al directorio donde se encuentra config.py
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(BASE_DIR, "static", "config", "config.json")

# Valores predeterminados para la configuración
DEFAULT_CONFIG = {
    "gemini_api_key": "your_default_api_key_here",
    "language": "es",
}

def load_config():
    if not os.path.exists(CONFIG_PATH):
        # Si el archivo no existe, crear uno nuevo con los valores predeterminados
        os.makedirs(os.path.dirname(CONFIG_PATH), exist_ok=True)
        with open(CONFIG_PATH, "w") as config_file:
            json.dump(DEFAULT_CONFIG, config_file, indent=4)
        print(f"Archivo de configuración creado en {CONFIG_PATH} con valores predeterminados.")

    try:
        with open(CONFIG_PATH, "r") as config_file:
            config = json.load(config_file)
            return config
    except json.JSONDecodeError:
        raise Exception(f"Error al leer el archivo de configuración en {CONFIG_PATH}")

# Cargar configuración
config = load_config()

# Acceso a las configuraciones
gemini_api_key = config.get("gemini_api_key")
language = config.get("language", "es")


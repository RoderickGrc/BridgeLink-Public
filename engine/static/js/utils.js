// Controlador global para manejar la ejecución previa
let abortController = null;

async function setConsoleState(message, mute = false) {
    // Si hay una ejecución previa, se cancela
    if (abortController) {
        abortController.abort(); // Detener la ejecución previa
    }

    // Crear un nuevo controlador para la ejecución actual
    abortController = new AbortController();
    const signal = abortController.signal;

    console.log("Se coloca estado de consola con " + message);
    const consoleState = document.getElementById('console');
    consoleState.textContent = ""; // Limpiar el contenido anterior

    // Si no está silenciado, manejar la síntesis de voz
    if (!mute) {
        // Cancelar cualquier habla previa de TTS
        if (speechSynthesis.speaking) {
            speechSynthesis.cancel();
        }

        // Configurar y hablar el mensaje usando TTS
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            // Opcional: Configurar propiedades del habla
            utterance.lang = 'es-ES'; // Idioma español de España
            utterance.rate = 1; // Velocidad normal

            // Manejar posibles eventos de la síntesis
            utterance.onstart = () => {
                console.log("Inicio de la síntesis de voz.");
            };

            utterance.onend = () => {
                console.log("Finalización de la síntesis de voz.");
            };

            utterance.onerror = (e) => {
                console.error("Error en la síntesis de voz:", e);
            };

            // Iniciar la síntesis de voz
            speechSynthesis.speak(utterance);
        } else {
            console.warn("La síntesis de voz no es soportada en este navegador.");
        }
    } else {
        console.log("TTS está silenciado. No se reproducirá el mensaje de voz.");
    }

    try {
        // Mostrar el mensaje letra por letra
        for (let i = 0; i <= message.length; i++) {
            if (signal.aborted) throw new Error("Ejecución cancelada");
            consoleState.textContent = message.slice(0, i);
            await new Promise(resolve => setTimeout(resolve, 20)); // Pausa entre letras
        }

        // Agregar y quitar puntos al final
        let dots = "";
        while (true) {
            if (signal.aborted) throw new Error("Ejecución cancelada");
            consoleState.textContent = message + dots;
            dots = dots.length < 2 ? dots + "." : ""; // Ciclo de puntos
            await new Promise(resolve => setTimeout(resolve, 350)); // Pausa para los puntos
        }
    } catch (error) {
        if (error.message === "Ejecución cancelada") {
            console.log("La ejecución anterior fue cancelada.");
        } else {
            throw error;
        }
    }
}

function hi(){
    console.log("Hola")
}
    

function addMessage(mensaje, tipo) {

    const mensajeHTML = marked.parse(mensaje);
    const mensajeDiv = createElement("div", `mensaje ${tipo}`, "", "");
    const mensajeTexto = createElement("span", "", "", mensajeHTML);
    const botonBocina = createElement("button", "boton-bocina", "", "🔊");


    botonBocina.onclick = () => speakMessage(mensajeHTML);

    mensajeDiv.appendChild(mensajeTexto);
    mensajeDiv.appendChild(botonBocina);

    contenedorMensajes.appendChild(mensajeDiv);
    scrollToBottom(contenedorMensajes); // Mover el scroll al final después de agregar el mensaje
}

function obtenerTextoPlano(html) {
    // Crear un elemento temporal
    const tempElement = document.createElement("div");
    // Asignar el HTML al elemento temporal
    tempElement.innerHTML = html;
    // Extraer solo el texto plano
    return tempElement.textContent || tempElement.innerText || "";
}


/* LESSA HANDLER */

function initializeLessaRecognition(){
    console.log("(PRUEBA) El módulo LESSA se ha inicializado");
}

let is_lessa_active = false;
let lessaTranscriptFull = "";
let pollingIntervalForUpdateLessaData;

async function startLessaModule() {
    try {
        // Iniciamos el módulo LESSA desde el View
        setConsoleState("Iniciando módulo de video LESSA.")
        const data = await sendBackendGetJson("start_lessa_recognition");
        is_lessa_active = data.is_active;

        if (is_lessa_active) {
            // Solo iniciamos el polling si LESSA está activo
            pollingIntervalForUpdateLessaData = setInterval(updateLessaData, 500);
            await setConsoleState("Interpretando video.");
        }
    } catch (error) {
        console.error("Error al iniciar el módulo LESSA: ", error);
    }
}

async function stopLessaRecognition() {
    try {
        const data = await sendBackendGetJson("stop_lessa_recognition");
        is_lessa_active = data.is_active;

        // Parar el polling si se ha desactivado correctamente
        if (!is_lessa_active && pollingIntervalForUpdateLessaData) {
            clearInterval(pollingIntervalForUpdateLessaData);
            pollingIntervalForUpdateLessaData = null;
        }
    } catch (error) {
        console.error("Error al finalizar el módulo LESSA: ", error);
    }
}

async function updateLessaData() {
    if (is_lessa_active) {
        try {
            const data = await sendBackendGetJson("get_current_lessa_data");
            lessaTranscriptFull = data.current_text;
            is_lessa_active = data.is_active;

            // Actualizamos el componente de texto con el texto actual
            setTextComponent(lessaTranscriptFull);

            // Si el módulo ya no está activo, detener el polling
            if (!is_lessa_active && pollingIntervalForUpdateLessaData) {
                clearInterval(pollingIntervalForUpdateLessaData);
                pollingIntervalForUpdateLessaData = null;
            }
        } catch (error) {
            console.error("La actualización ha terminado: ", error);
        }
    } else {
        // Si el módulo ya no está activo, detener el polling para evitar el uso innecesario de recursos
        if (pollingIntervalForUpdateLessaData) {
            clearInterval(pollingIntervalForUpdateLessaData);
            pollingIntervalForUpdateLessaData = null;
        }
    }
}

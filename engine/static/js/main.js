document.addEventListener("DOMContentLoaded", function() {
    setCase("await");
    messages();
    initializeSpeechRecognition(); // Inicializar el reconocimiento de voz al cargar la página
    initializeLessaRecognition();
    setConsoleState("Esperando interacción.");

    // Agregar listener para eventos de teclado
    document.addEventListener('keydown', function(event) {
        // Evitar acciones si el foco está en input o textarea
        const tag = event.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') {
            return;
        }

        switch(event.key) {
            case 'Enter':
                // Buscar botones de confirmación
                const confirmButtons = Array.from(document.querySelectorAll('.LESSA_button_div, .VOICE_button_div'))
                    .filter(btn => btn.textContent.trim().startsWith('Confirmar'));
                if (confirmButtons.length > 0) {
                    confirmButtons[0].click();
                    event.preventDefault(); // Prevenir acción por defecto
                }
                break;
            case 'Escape':
                // Buscar botón de cancelar
                const cancelButton = document.querySelector('.cancel_input_button_div');
                if (cancelButton) {
                    cancelButton.click();
                    event.preventDefault();
                }
                break;
            case ' ':
                // Buscar botón de 'Nuevo Mensaje Voz'
                const newVoiceButton = Array.from(document.querySelectorAll('.VOICE_button_div'))
                    .find(btn => btn.textContent.trim().includes('Nuevo Mensaje Voz'));
                if (newVoiceButton) {
                    newVoiceButton.click();
                    event.preventDefault();
                }
                break;
            case 'Backspace':
                // Buscar botón de 'Nuevo Mensaje LESSA'
                const newLessaButton = Array.from(document.querySelectorAll('.LESSA_button_div'))
                    .find(btn => btn.textContent.trim().includes('Nuevo Mensaje LESSA'));
                if (newLessaButton) {
                    newLessaButton.click();
                    event.preventDefault();
                }
                break;
            default:
                break;
        }
    });
});


/* RECONOCIMIENTO DE VOZ */

let recognition;
let transcriptFull = '';
let lastResultIndexProcessed = 0;

function initializeSpeechRecognition(lang = 'es-ES') {
    console.log("Inicializando reconocimiento de voz...");
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.continuous = true; // Seguir escuchando continuamente
        recognition.interimResults = true; // Mostrar resultados parciales
        recognition.lang = lang;

        recognition.onstart = () => {
            console.log("Reconocimiento de voz iniciado...");
            // Reiniciar variables al iniciar una nueva sesión de reconocimiento
            transcriptFull = "";
            lastResultIndexProcessed = 0;
        };
        recognition.onerror = (event) => console.error('Error de reconocimiento de voz: ', event.error);
        recognition.onend = () => console.log('Reconocimiento finalizado.');

        recognition.onresult = (event) => {
            handleSpeechResults(event);
        };
    } else {
        alert('Tu navegador no soporta la API de reconocimiento de voz.');
    }
}
 // Pre-cargar el sonido de notificación
 const notificationSound = new Audio('/static/audio/notificacion.mp3');
 notificationSound.preload = 'auto';

 function startSpeechRecognition() {
     console.log("Iniciando reconocimiento de voz en 1.5 segundos...");
     setConsoleState("Escuchando.");

     if (recognition) {
         setTimeout(() => {
             try {
                     // Reproducir el sonido de notificación
                notificationSound.play().catch(error => {
                    console.error("Error al reproducir el sonido de notificación:", error);
                });
                 recognition.start();
                 // Las variables transcriptFull y lastResultIndexProcessed se reinician en onstart
                 console.log("Reconocimiento de voz iniciado.");
             } catch (error) {
                 console.error("Error al iniciar el reconocimiento de voz: ", error);
             }
         }, 1000); // 1.5 segundos
     } else {
         console.error("El objeto 'recognition' no está definido.");
     }
 }


function stopSpeechRecognition() {
    if (recognition) {
        recognition.stop();
    }
}

function handleSpeechResults(event) {
    // Asegurarse de que event.resultIndex no es menor que lastResultIndexProcessed
    if (event.resultIndex < lastResultIndexProcessed) {
        console.warn('Reiniciando el seguimiento de resultados.');
        lastResultIndexProcessed = event.resultIndex;
    }

    let interimTranscript = '';
    for (let i = lastResultIndexProcessed; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript.trim();
        if (result.isFinal) {
            transcriptFull += transcript + ' ';
            console.log(`Final: ${transcript}`);
        } else {
            interimTranscript += transcript + ' ';
            console.log(`Interim: ${transcript}`);
        }
    }

    lastResultIndexProcessed = event.results.length;

    setTextComponent(transcriptFull + interimTranscript);
}

function setTextComponent(text) {
    const textComponent = document.getElementById("text-container");
    if (textComponent) {
        textComponent.innerText = text;
    }
}

function appendTextComponent(text) {
    const textComponent = document.getElementById("text-container");
    if (textComponent) {
        textComponent.innerText += text;
    }
}


/* PROGRAM */

function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight; // Desplazar el scroll hacia el final
}
async function setCase(currentCase) {
    console.log(currentCase)
    params = {
        "case": currentCase
    }
    stopAudio()
    try {
        const data = await sendBackendGetJson("set_case", params)
        insertHTML("state-container", data.state_html)
        setDisplyState(currentCase)

        console.log(currentCase)
    
        if (data.valid == false) {
            throw new Error("Error, no se reconoce el caso.");
        }
        
    }
    catch (error) {
        insertHTML("state-container", error)

    }
}


function setDisplyState(currentCase) {
    const interaction_buttons = document.getElementById('interaction-buttons');
    if (!interaction_buttons) {
        console.error("El contenedor 'interaction-buttons' no se encontró.");
        return;
    }

    // Limpiar contenido del contenedor antes de añadir nuevos elementos
    interaction_buttons.innerHTML = "";

    if (currentCase === "voice") {
        startSpeechRecognition();
    }
    else if (currentCase === "lessa") {
        startLessaModule()
    }
    else {
        stopSpeechRecognition();
        stopLessaRecognition();
    }

    switch (currentCase) {
        case "lessa":
            // Crear botón Confirmar Mensaje LESSA
            const lessa_button_confirm = createElement('button', 'LESSA_button_div', '', 'Confirmar Mensaje LESSA');
            lessa_button_confirm.onclick = async () => {
                stopLessaRecognition(); // Detener el reconocimiento de voz al confirmar
                transcript = document.getElementById("text-container").innerText
                console.log(transcript)
                transcript_to_message(transcript, "lessa");
            };
            interaction_buttons.appendChild(lessa_button_confirm);

            // Crear botón Cancelar
            cancel_input_button = createElement('button', 'cancel_input_button_div', '', 'Cancelar');
            cancel_input_button.onclick = () => {
                stopLessaRecognition(); // Detener el reconocimiento si se cancela
                setCase('await');
            };
            interaction_buttons.appendChild(cancel_input_button);
            break;

        case "voice":
            // Crear botón Cancelar
            cancel_input_button = createElement('button', 'cancel_input_button_div', '', 'Cancelar');
            cancel_input_button.onclick = () => {
                stopSpeechRecognition(); // Detener el reconocimiento si se cancela
                setCase('await');
            };
            interaction_buttons.appendChild(cancel_input_button);

            // Crear botón Confirmar Mensaje Voz
            const voice_button_confirm = createElement('button', 'VOICE_button_div', '', 'Confirmar Mensaje Voz');
            voice_button_confirm.onclick = async () => {
                stopSpeechRecognition(); // Detener el reconocimiento de voz al confirmar
                transcript = document.getElementById("text-container").innerText
                console.log(transcript)
                transcript_to_message(transcript, "Voice");
            };
            
            interaction_buttons.appendChild(voice_button_confirm);

            break;

        case "loading":
            // Crear botón Nuevo Mensaje LESSA (deshabilitado)
            const disabled_lessa_button = createElement('button', 'cancel_input_button_div', '', 'Nuevo Mensaje LESSA', { disabled: true });
            interaction_buttons.appendChild(disabled_lessa_button);

            // Crear botón Nuevo Mensaje Voz (deshabilitado)
            const disabled_voice_button = createElement('button', 'cancel_input_button_div', '', 'Nuevo Mensaje Voz', { disabled: true });
            interaction_buttons.appendChild(disabled_voice_button);
            break;

        case "await":
            setConsoleState("Esperando interacción.")
            // Crear botón Nuevo Mensaje LESSA
            const lessa_button = createElement('button', 'LESSA_button_div', '', 'Nuevo Mensaje LESSA');
            lessa_button.onclick = () => setCase('lessa');
            interaction_buttons.appendChild(lessa_button);

            // Crear botón Nuevo Mensaje Voz
            const voice_button = createElement('button', 'VOICE_button_div', '', 'Nuevo Mensaje Voz');
            voice_button.onclick = () => setCase('voice');
            interaction_buttons.appendChild(voice_button);

            setTextComponent("");
            stopSpeechRecognition();
            stopLessaRecognition();
            break;

        default:
            // Crear botón Nuevo Mensaje LESSA
            const default_lessa_button = createElement('button', 'LESSA_button_div', '', 'Nuevo Mensaje LESSA');
            default_lessa_button.onclick = () => setCase('lessa');
            interaction_buttons.appendChild(default_lessa_button);

            // Crear botón Nuevo Mensaje Voz
            const default_voice_button = createElement('button', 'VOICE_button_div', '', 'Nuevo Mensaje Voz');
            default_voice_button.onclick = () => setCase('voice');
            interaction_buttons.appendChild(default_voice_button);
            
            break;
    }
}

async function transcript_to_message(message, tipo) {
    // Estado inicial
    setConsoleState("Procesando texto.");
    setCase('loading');

    const params = {
        "raw_text": message
    };

    // Determinar el tipo de mensaje
    let mensajeTipo;
    if (tipo === "Voice") {
        mensajeTipo = "mensaje-emisor";
    } else {
        mensajeTipo = "mensaje-receptor";
    }

    // Referencias a los temporizadores
    let timeout3s, timeout7s, timeout10s;

    // Promesa que maneja el procesamiento del backend
    const procesamiento = sendBackendGetJson("text_cleaning", params)
        .then(response => {
            // Si el procesamiento es exitoso, limpiar los temporizadores
            clearTimeout(timeout3s);
            clearTimeout(timeout7s);
            clearTimeout(timeout10s);

            addMessage(response.text, mensajeTipo);
            console.log("Texto procesado correctamente");
            console.log("Mensaje añadido: " + mensajeTipo);
            speakMessage(response.text);
        })
        .catch(error => {
            // En caso de error, limpiar los temporizadores y proceder con el texto crudo
            clearTimeout(timeout3s);
            clearTimeout(timeout7s);
            clearTimeout(timeout10s);

            console.log("Hubo un fallo");
            console.error(error);
            addMessage(message, mensajeTipo);
            setCase('await');
        });

    // Temporizador a los 3 segundos
    timeout3s = setTimeout(() => {
        setConsoleState("Está tardando más de lo normal.");
    }, 3000);

    // Temporizador a los 7 segundos
    timeout7s = setTimeout(() => {
        setConsoleState("Tenemos problemas con el procesamiento. Intentando por última vez.");
    }, 7000);

    // Temporizador a los 10 segundos
    timeout10s = setTimeout(() => {
        // Proceder con el texto crudo si no se ha recibido respuesta
        // Cancelar la promesa de procesamaiento si es posible
        // Nota: No es posible cancelar una promesa nativa, pero podemos manejarlo aquí
        console.warn("Tiempo de procesamiento excedido. Procediendo con el texto crudo.");
        addMessage(message, mensajeTipo);
        setCase('await');
    }, 15000);

    // Esperar a que se resuelva la promesa o se maneje el timeout
    await procesamiento;
}


 


async function speakMessage(mensaje) {
    if(!mensaje) {
        console.log(`Error, mensaje vacío.`)
    }
    else {
        const mensajeTextoPlano = obtenerTextoPlano(mensaje)
        console.log(`Reproduciendo: ${mensajeTextoPlano}`); 
        setConsoleState("Generando audio.", true);
        setCase('loading');

        const params = {
            "message": mensajeTextoPlano
        };
        
        try {
            const data = await sendBackendGetJson("tts", params);
            
            if (data.ok === true) {
                let audio_url = data.audio_url;
                
                // Añadir un parámetro de consulta único para evitar la caché
                const cacheBuster = `t=${Date.now()}`;
                const separator = audio_url.includes('?') ? '&' : '?';
                audio_url = `${audio_url}${separator}${cacheBuster}`;
                
                // Gestionar el elemento de audio existente
                let audioPlayer = document.getElementById('audioPlayer');
                if (audioPlayer) {
                    audioPlayer.pause();
                    audioPlayer.currentTime = 0;
                    audioPlayer.parentNode.removeChild(audioPlayer);
                }
                
                // Crear el nuevo elemento de audio dinámicamente
                audioPlayer = document.createElement('audio');
                audioPlayer.id = 'audioPlayer';
                audioPlayer.src = audio_url;
                audioPlayer.autoplay = true;
                audioPlayer.controls = false; // Opcional: ocultar controles si no son necesarios
                document.body.appendChild(audioPlayer);
                
                setCase('tts');
                setConsoleState("Reproduciendo audio.", true);
                
                // Reproducir el audio
                audioPlayer.play();
                
                // Manejar el evento cuando termine la reproducción
                audioPlayer.onended = () => {
                    setCase('await');
                    // Eliminar el elemento de audio cuando termine de reproducirse
                    if (audioPlayer.parentNode) {
                        audioPlayer.parentNode.removeChild(audioPlayer);
                    }
                };
                
                // Manejar errores de reproducción
                audioPlayer.onerror = (e) => {
                    console.error('Error al reproducir el audio:', e);
                    setCase('await');
                    if (audioPlayer.parentNode) {
                        audioPlayer.parentNode.removeChild(audioPlayer);
                    }
                };
            } else {
                console.log("No se pudo generar el TTS.");
            }
        } catch (error) {
            console.error('Error en speakMessage:', error);
        }
    }
}

function createElement(tag, className = '', idName = '', content = '', attributes = {}) {
    // Crear el elemento con la etiqueta especificada
    const element = document.createElement(tag);

    // Asignar clases, permitiendo múltiples clases en forma de cadena separada por espacios
    if (className) {
        element.className = className;
    }

    // Asignar el id si se proporciona
    if (idName) {
        element.id = idName;
    }

    // Asignar el contenido; si contiene HTML, lo añade como HTML, de lo contrario como texto
    if (content) {
        if (content.includes('<')) {
            element.innerHTML = content;
        } else {
            element.textContent = content;
        }
    }

    // Asignar atributos adicionales si se proporcionan (ej. data-* attributes)
    for (const [key, value] of Object.entries(attributes)) {
        element.setAttribute(key, value);
    }

    return element;
}




function insertHTML(container, html){
    document.getElementById(container).innerHTML = html;
}

function appendHTML(container, html){
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    while (tempDiv.firstChild) {
        document.getElementById(container).appendChild(tempDiv.firstChild);
    }
}

// Función general para enviar una solicitud al backend
async function sendBackend(view_function, values = undefined) {
    // Construir los parámetros de consulta solo si "values" está presente
    const queryParams = values ? new URLSearchParams(values).toString() : '';

    // Crear la URL completa, incluyendo el segmento de la vista y los parámetros de consulta (si existen)
    const segment = queryParams ? `${view_function}?${queryParams}` : view_function;

    // Realizar la solicitud y esperar la respuesta usando "await"
    const response = await fetch(segment);
    return response;
}

// Función para enviar una solicitud al backend y obtener texto
async function sendBackendGetText(view_function, values = undefined) {
    // Construir los parámetros de consulta solo si "values" está presente
    const queryParams = values ? new URLSearchParams(values).toString() : '';

    // Crear la URL completa, incluyendo el segmento de la vista y los parámetros de consulta (si existen)
    const segment = queryParams ? `${view_function}?${queryParams}` : view_function;

    // Realizar la solicitud y esperar la respuesta usando "await"
    const response = await fetch(segment);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }

    // Obtener y devolver el contenido HTML como texto
    return await response.text();
}

// Función para enviar una solicitud al backend y obtener JSON
async function sendBackendGetJson(view_function, values = undefined) {
    // Construir los parámetros de consulta solo si "values" está presente
    const queryParams = values ? new URLSearchParams(values).toString() : '';

    // Crear la URL completa, incluyendo el segmento de la vista y los parámetros de consulta (si existen)
    const segment = queryParams ? `${view_function}?${queryParams}` : view_function;

    // Realizar la solicitud y esperar la respuesta usando "await"
    const response = await fetch(segment);

    // Verificar si la respuesta es exitosa
    if (!response.ok) {
        throw new Error(`Error en la solicitud: ${response.status} ${response.statusText}`);
    }

    // Obtener y devolver el contenido JSON
    return await response.json();
}

function playAudio() {
    const audioPlayer = document.getElementById('audioPlayer');
    setState('tts');
    audioPlayer.play();
    audioPlayer.onended = () => {
        setState('await');
    };
}

function stopAudio() {
    const audioPlayer = document.getElementById('audioPlayer');
    if(audioPlayer) {
        if (!audioPlayer.paused) {
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
        }
    }
}


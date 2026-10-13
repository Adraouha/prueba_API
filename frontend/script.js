// ========================================================
// GAMESCORE APP - SCRIPT PRINCIPAL
// Comunicación con APIs externas y Backend en Spring Boot
// ========================================================

const BACKEND_BASE_URL = 'http://localhost:8082';

// Configuración de ciudad y API key para OpenWeatherMap
let openWeatherApiKey = localStorage.getItem('gamescore_weather_key') || '';
let currentCity = localStorage.getItem('gamescore_weather_city') || 'Barcelona';

// ========================================================
// 1. INICIALIZACIÓN AL CARGAR LA PÁGINA
// ========================================================
document.addEventListener('DOMContentLoaded', () => {
    // Establecer la fecha actual por defecto en el campo de fecha
    const inputFecha = document.getElementById('fecha-puntuacion');
    if (inputFecha) {
        inputFecha.value = new Date().toISOString().split('T')[0];
    }

    // Cargar información del tiempo actual (OpenWeatherMap)
    cargarTiempoActual();

    // Cargar Pokémon del día (PokeAPI)
    cargarPokemonDelDia();

    // Cargar datos desde el Backend Spring Boot
    cargarJugadores();
    cargarPuntuaciones();

    // Configurar manejadores de eventos
    setupEventListeners();
});

function setupEventListeners() {
    // Botón para recargar Pokémon
    document.getElementById('btn-random-pokemon').addEventListener('click', () => {
        cargarPokemonDelDia();
    });

    // Botón para recargar lista de puntuaciones
    document.getElementById('btn-recargar-tabla').addEventListener('click', () => {
        cargarPuntuaciones();
    });

    // Botón para reintentar conexión con backend
    document.getElementById('btn-retry-backend').addEventListener('click', () => {
        cargarJugadores();
        cargarPuntuaciones();
    });

    // Formulario para guardar puntuación
    document.getElementById('form-puntuacion').addEventListener('submit', guardarNuevaPuntuacion);

    // Panel de configuración de la ciudad
    document.getElementById('btn-config-weather').addEventListener('click', () => {
        const panel = document.getElementById('weather-config-panel');
        panel.classList.toggle('hidden');
    });

    document.getElementById('btn-close-weather').addEventListener('click', () => {
        document.getElementById('weather-config-panel').classList.add('hidden');
    });

    document.getElementById('btn-save-weather').addEventListener('click', () => {
        const cityVal = document.getElementById('input-weather-city').value.trim();
        const keyVal = document.getElementById('input-weather-key').value.trim();
        if (cityVal) {
            currentCity = cityVal;
            localStorage.setItem('gamescore_weather_city', cityVal);
        }
        if (keyVal) {
            openWeatherApiKey = keyVal;
            localStorage.setItem('gamescore_weather_key', keyVal);
        }
        document.getElementById('weather-config-panel').classList.add('hidden');
        cargarTiempoActual();
    });
}

// ========================================================
// 2. CONSULTA DEL TIEMPO (OpenWeatherMap / Fallback en vivo)
// ========================================================
async function cargarTiempoActual() {
    const elCity = document.getElementById('weather-city');
    const elTemp = document.getElementById('weather-temp');
    const elDesc = document.getElementById('weather-desc');
    const elHumidity = document.getElementById('weather-humidity');
    const elIcon = document.getElementById('weather-icon');
    const elBadge = document.getElementById('weather-badge');

    elCity.textContent = currentCity;
    elDesc.textContent = 'Consultando tiempo...';

    // Intento 1: Si hay API key de OpenWeatherMap, consultar directamente la API
    if (openWeatherApiKey) {
        try {
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(currentCity)}&units=metric&lang=es&appid=${openWeatherApiKey}`;
            const response = await fetch(url);
            
            if (response.ok) {
                const data = await response.json();
                elCity.textContent = data.name;
                elTemp.textContent = `${Math.round(data.main.temp)}°C`;
                elDesc.textContent = data.weather[0].description;
                elHumidity.textContent = `${data.main.humidity}%`;
                elIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
                elBadge.textContent = 'OpenWeather';
                return;
            }
        } catch (error) {
            console.warn('Error al conectar con OpenWeatherMap:', error);
        }
    }

    // Intento 2: Fallback meteorológico gratuito en tiempo real
    try {
        const coords = obtenerCoordenadas(currentCity);
        const urlFallback = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`;
        
        const res = await fetch(urlFallback);
        if (res.ok) {
            const data = await res.json();
            const temp = Math.round(data.current.temperature_2m);
            const humidity = data.current.relative_humidity_2m;
            const weatherCode = data.current.weather_code;
            const interpretacion = interpretarCodigoClima(weatherCode);

            elCity.textContent = coords.nombre;
            elTemp.textContent = `${temp}°C`;
            elDesc.textContent = interpretacion.descripcion;
            elHumidity.textContent = `${humidity}%`;
            elIcon.src = interpretacion.icono;
            elBadge.textContent = 'El Tiempo';
            return;
        }
    } catch (err) {
        console.error('Error al obtener datos meteorológicos:', err);
    }

    // Fallback básico si falla la conexión
    elTemp.textContent = '22°C';
    elDesc.textContent = 'Cielo despejado';
    elHumidity.textContent = '60%';
    elIcon.src = 'https://openweathermap.org/img/wn/01d@2x.png';
}

function obtenerCoordenadas(ciudad) {
    const c = ciudad.toLowerCase().trim();
    if (c.includes('barcelona')) return { lat: 41.3888, lon: 2.159, nombre: 'Barcelona' };
    if (c.includes('madrid')) return { lat: 40.4168, lon: -3.7038, nombre: 'Madrid' };
    if (c.includes('valencia')) return { lat: 39.4699, lon: -0.3763, nombre: 'Valencia' };
    if (c.includes('sevilla')) return { lat: 37.3891, lon: -5.9845, nombre: 'Sevilla' };
    return { lat: 41.3888, lon: 2.159, nombre: ciudad };
}

function interpretarCodigoClima(code) {
    if (code === 0) return { descripcion: 'Cielo despejado', icono: 'https://openweathermap.org/img/wn/01d@2x.png' };
    if (code === 1 || code === 2) return { descripcion: 'Parcialmente nublado', icono: 'https://openweathermap.org/img/wn/02d@2x.png' };
    if (code === 3) return { descripcion: 'Nublado', icono: 'https://openweathermap.org/img/wn/03d@2x.png' };
    if (code >= 45 && code <= 48) return { descripcion: 'Niebla', icono: 'https://openweathermap.org/img/wn/50d@2x.png' };
    if (code >= 51 && code <= 67) return { descripcion: 'Lluvia ligera', icono: 'https://openweathermap.org/img/wn/10d@2x.png' };
    if (code >= 71 && code <= 77) return { descripcion: 'Nieve', icono: 'https://openweathermap.org/img/wn/13d@2x.png' };
    if (code >= 80 && code <= 82) return { descripcion: 'Chubascos', icono: 'https://openweathermap.org/img/wn/09d@2x.png' };
    if (code >= 95) return { descripcion: 'Tormenta', icono: 'https://openweathermap.org/img/wn/11d@2x.png' };
    return { descripcion: 'Clima agradable', icono: 'https://openweathermap.org/img/wn/02d@2x.png' };
}

// ========================================================
// 3. CONSULTA DE POKÉMON (PokeAPI)
// ========================================================
async function cargarPokemonDelDia() {
    const elImg = document.getElementById('pokemon-img');
    const elName = document.getElementById('pokemon-name');
    const elInfo = document.getElementById('pokemon-info');
    const elType = document.getElementById('pokemon-type');
    const elLoading = document.getElementById('pokemon-loading');

    // Pokémon aleatorio de la primera generación (1 a 151)
    const random = Math.floor(Math.random() * 151) + 1;
    const url = `https://pokeapi.co/api/v2/pokemon/${random}`;

    try {
        elLoading.classList.remove('hidden');
        elName.textContent = 'Cargando Pokémon...';

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error en PokeAPI: ${response.status}`);
        }

        const data = await response.json();
        const nombreCapitalizado = data.name.charAt(0).toUpperCase() + data.name.slice(1);
        const spriteFrontal = data.sprites.front_default || data.sprites.other['official-artwork'].front_default;
        const tipos = data.types.map(t => traducirTipoPokemon(t.type.name)).join(' / ');

        elName.textContent = nombreCapitalizado;
        elInfo.textContent = `Número en Pokédex: #${data.id} | Peso: ${(data.weight / 10).toFixed(1)} kg`;
        elType.textContent = `Tipo: ${tipos}`;
        elImg.src = spriteFrontal;
        elImg.alt = nombreCapitalizado;

        elImg.onload = () => {
            elLoading.classList.add('hidden');
        };
    } catch (error) {
        console.error('Error al cargar Pokémon:', error);
        elName.textContent = 'Pikachu';
        elInfo.textContent = 'Número en Pokédex: #25 | Peso: 6.0 kg';
        elType.textContent = 'Tipo: Eléctrico';
        elImg.src = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png';
        elLoading.classList.add('hidden');
    }
}

function traducirTipoPokemon(tipoIngles) {
    const mapa = {
        normal: 'Normal',
        fire: 'Fuego',
        water: 'Agua',
        electric: 'Eléctrico',
        grass: 'Planta',
        ice: 'Hielo',
        fighting: 'Lucha',
        poison: 'Veneno',
        ground: 'Tierra',
        flying: 'Volador',
        psychic: 'Psíquico',
        bug: 'Bicho',
        rock: 'Roca',
        ghost: 'Fantasma',
        dragon: 'Dragón',
        steel: 'Acero',
        fairy: 'Hada'
    };
    return mapa[tipoIngles.toLowerCase()] || tipoIngles;
}

// ========================================================
// 4. API SPRING BOOT + MYSQL
// ========================================================

// 4.1 GET: Cargar lista de jugadores existentes
async function cargarJugadores() {
    try {
        const response = await fetch(`${BACKEND_BASE_URL}/jugadores`);
        if (!response.ok) return;

        const jugadores = await response.json();
        const datalist = document.getElementById('jugadores-list');
        datalist.innerHTML = '';

        jugadores.forEach(j => {
            const option = document.createElement('option');
            option.value = j.nombre;
            datalist.appendChild(option);
        });
    } catch (err) {
        console.warn('No se pudo cargar la lista de jugadores:', err);
    }
}

// 4.2 GET: Cargar puntuaciones y mostrarlas en la tabla
async function cargarPuntuaciones() {
    const tbody = document.getElementById('tabla-puntuaciones-body');
    const statusBox = document.getElementById('backend-status');
    const statusText = document.getElementById('backend-status-text');
    const btnRetry = document.getElementById('btn-retry-backend');

    try {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Cargando puntuaciones...</td></tr>';

        const response = await fetch(`${BACKEND_BASE_URL}/puntuaciones`);
        if (!response.ok) {
            throw new Error(`Código de respuesta HTTP ${response.status}`);
        }

        const puntuaciones = await response.json();

        // Indicar conexión exitosa
        statusBox.className = 'status-alert connected';
        statusText.textContent = `Estado del servidor: Conectado (${BACKEND_BASE_URL})`;
        btnRetry.classList.add('hidden');

        if (puntuaciones.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay puntuaciones registradas todavía.</td></tr>';
            return;
        }

        // Renderizar filas de la tabla
        tbody.innerHTML = '';
        puntuaciones.forEach((p, index) => {
            const tr = document.createElement('tr');
            const nombreJugador = p.jugador ? escapeHtml(p.jugador.nombre) : 'Jugador sin nombre';
            const fechaFormateada = formatearFecha(p.fecha);

            tr.innerHTML = `
                <td class="text-center">${index + 1}</td>
                <td>${nombreJugador}</td>
                <td>${p.puntos}</td>
                <td>${fechaFormateada}</td>
                <td class="text-center">
                    <button type="button" class="btn-delete" onclick="eliminarPuntuacion(${p.id})">Eliminar</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error('Error al conectar con el backend:', error);
        statusBox.className = 'status-alert error';
        statusText.textContent = `Estado del servidor: No disponible (${BACKEND_BASE_URL}). Comprueba que Spring Boot esté en ejecución.`;
        btnRetry.classList.remove('hidden');

        tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="color: #b02a37;">No se pudo conectar con el servidor para cargar las puntuaciones.</td></tr>';
    }
}

// 4.3 POST: Guardar nueva puntuación
async function guardarNuevaPuntuacion(e) {
    e.preventDefault();

    const nombreInput = document.getElementById('nombre-jugador');
    const puntosInput = document.getElementById('puntos-jugador');
    const fechaInput = document.getElementById('fecha-puntuacion');
    const btnGuardar = document.getElementById('btn-guardar');

    const nombreJugador = nombreInput.value.trim();
    const puntos = parseInt(puntosInput.value, 10);
    const fecha = fechaInput.value;

    if (!nombreJugador) {
        mostrarFeedback('Debes introducir el nombre del jugador.', 'error');
        return;
    }

    if (isNaN(puntos) || puntos < 0) {
        mostrarFeedback('Debes introducir una cantidad válida de puntos.', 'error');
        return;
    }

    if (!fecha) {
        mostrarFeedback('Debes seleccionar una fecha.', 'error');
        return;
    }

    const payload = {
        nombreJugador: nombreJugador,
        puntos: puntos,
        fecha: fecha
    };

    try {
        btnGuardar.disabled = true;
        btnGuardar.textContent = 'Guardando...';

        const response = await fetch(`${BACKEND_BASE_URL}/puntuaciones`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(errorMsg || `Error HTTP ${response.status}`);
        }

        mostrarFeedback(`Puntuación de ${puntos} puntos guardada correctamente para ${nombreJugador}.`, 'success');

        // Limpiar formulario
        nombreInput.value = '';
        puntosInput.value = '';
        nombreInput.focus();

        // Actualizar datos
        cargarPuntuaciones();
        cargarJugadores();

    } catch (err) {
        console.error('Error al guardar puntuación:', err);
        mostrarFeedback(`Error al guardar la puntuación: ${err.message}`, 'error');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.textContent = 'Guardar puntuación';
    }
}

// 4.4 DELETE: Eliminar una puntuación
async function eliminarPuntuacion(id) {
    if (!confirm('¿Seguro que deseas eliminar esta puntuación?')) {
        return;
    }

    try {
        const response = await fetch(`${BACKEND_BASE_URL}/puntuaciones/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            mostrarFeedback('Puntuación eliminada correctamente.', 'success');
            cargarPuntuaciones();
        } else {
            alert('No se pudo eliminar la puntuación seleccionada.');
        }
    } catch (err) {
        console.error('Error al eliminar puntuación:', err);
        alert('Error de conexión al intentar eliminar la puntuación.');
    }
}

// ========================================================
// FUNCIONES AUXILIARES
// ========================================================
function mostrarFeedback(mensaje, tipo) {
    const feedback = document.getElementById('form-feedback');
    feedback.textContent = mensaje;
    feedback.className = `feedback-msg ${tipo}`;
    feedback.classList.remove('hidden');

    setTimeout(() => {
        feedback.classList.add('hidden');
    }, 4000);
}

function formatearFecha(fechaStr) {
    if (!fechaStr) return '--';
    const partes = fechaStr.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return fechaStr;
}

function escapeHtml(texto) {
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

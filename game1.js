/* =========================================================
   HUAYLASH
   EL CORAZÓN DEL MANTARO
   Juego educativo interactivo
   HTML + CSS + JavaScript
========================================================= */


/* =========================================================
   CONFIGURACIÓN PRINCIPAL
========================================================= */

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const WORLD = {
    width: 3600,
    height: 2400
};

let screenWidth = window.innerWidth;
let screenHeight = window.innerHeight;

let camera = {
    x: 0,
    y: 0
};

let lastTime = 0;

let gameStarted = false;

let currentInteraction = null;


/* =========================================================
   VIDEO
   ⭐ PEGA AQUÍ EL ENLACE DE YOUTUBE
========================================================= */

const HUAYLASH_VIDEO_URL =
    "https://www.youtube.com/embed/dQw4w9WgXcQ";


/*
   IMPORTANTE:

   Reemplaza el enlace anterior por el video que quieras.

   Ejemplo:

   https://www.youtube.com/embed/ABC123XYZ

   Si tienes:

   https://www.youtube.com/watch?v=ABC123XYZ

   debes colocar:

   https://www.youtube.com/embed/ABC123XYZ
*/


/* =========================================================
   PERSONAJE
========================================================= */

const player = {

    x: 470,
    y: 1220,

    width: 42,
    height: 70,

    speed: 230,

    gender: "female",

    skin: "#9b633f",

    hair: "#201712",

    outfit: "classic",

    direction: "down",

    moving: false,

    walkTime: 0
};


/* =========================================================
   ESTADO DEL JUEGO
========================================================= */

let gameState = {

    memories: [],

    visited: {

        history: false,
        clothing: false,
        music: false,
        dance: false,
        mantaro: false

    },

    activities: {

        clothing: false,
        rhythm: false,
        timeline: false

    },

    guideTalked: false,

    festivalUnlocked: false,

    videoWatched: false

};


/* =========================================================
   LOCAL STORAGE
========================================================= */

const SAVE_KEY = "huaylashMuseumSave";


function saveGame() {

    const data = {

        player: {

            gender: player.gender,
            skin: player.skin,
            hair: player.hair,
            outfit: player.outfit

        },

        gameState

    };

    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(data)
    );

}


function loadGame() {

    const saved =
        localStorage.getItem(SAVE_KEY);

    if (!saved) {

        return false;

    }

    try {

        const data = JSON.parse(saved);

        if (data.player) {

            player.gender =
                data.player.gender || "female";

            player.skin =
                data.player.skin || "#9b633f";

            player.hair =
                data.player.hair || "#201712";

            player.outfit =
                data.player.outfit || "classic";

        }

        if (data.gameState) {

            gameState = data.gameState;

        }

        return true;

    } catch (error) {

        console.error(error);

        return false;

    }

}


/* =========================================================
   RESOLUCIÓN DEL CANVAS
========================================================= */

function resizeCanvas() {

    screenWidth =
        window.innerWidth;

    screenHeight =
        window.innerHeight;

    const dpr =
        Math.min(window.devicePixelRatio || 1, 2);

    canvas.width =
        screenWidth * dpr;

    canvas.height =
        screenHeight * dpr;

    canvas.style.width =
        screenWidth + "px";

    canvas.style.height =
        screenHeight + "px";

    ctx.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

}

window.addEventListener(
    "resize",
    resizeCanvas
);

resizeCanvas();


/* =========================================================
   TECLADO
========================================================= */

const keys = {};

window.addEventListener(
    "keydown",
    (event) => {

        const key =
            event.key.toLowerCase();

        keys[key] = true;

        if (
            [
                "w",
                "a",
                "s",
                "d",
                "arrowup",
                "arrowdown",
                "arrowleft",
                "arrowright",
                " "
            ].includes(key)
        ) {

            event.preventDefault();

        }

        if (!gameStarted) {
            return;
        }

        if (
            key === "e" ||
            key === "enter"
        ) {

            interact();

        }

        if (key === "m") {

            toggleMap();

        }

        if (key === "c") {

            toggleCollection();

        }

        if (key === "escape") {

            closeAllOverlays();

        }

    }
);

window.addEventListener(
    "keyup",
    (event) => {

        keys[
            event.key.toLowerCase()
        ] = false;

    }
);


/* =========================================================
   MOVIMIENTO
========================================================= */

function updatePlayer(delta) {

    if (!gameStarted) {
        return;
    }

    if (
        document
            .getElementById("modal")
            .classList.contains("hidden") === false
    ) {
        return;
    }

    if (
        document
            .getElementById("mapModal")
            .classList.contains("hidden") === false
    ) {
        return;
    }

    if (
        document
            .getElementById("collectionModal")
            .classList.contains("hidden") === false
    ) {
        return;
    }

    if (
        document
            .getElementById("videoModal")
            .classList.contains("hidden") === false
    ) {
        return;
    }

    let dx = 0;
    let dy = 0;

    if (
        keys["w"] ||
        keys["arrowup"]
    ) {
        dy -= 1;
        player.direction = "up";
    }

    if (
        keys["s"] ||
        keys["arrowdown"]
    ) {
        dy += 1;
        player.direction = "down";
    }

    if (
        keys["a"] ||
        keys["arrowleft"]
    ) {
        dx -= 1;
        player.direction = "left";
    }

    if (
        keys["d"] ||
        keys["arrowright"]
    ) {
        dx += 1;
        player.direction = "right";
    }

    player.moving =
        dx !== 0 || dy !== 0;

    if (player.moving) {

        player.walkTime += delta * 8;

        const length =
            Math.sqrt(
                dx * dx + dy * dy
            );

        dx /= length;
        dy /= length;

        player.x +=
            dx * player.speed * delta;

        player.y +=
            dy * player.speed * delta;

    }

    player.x =
        Math.max(
            80,
            Math.min(
                WORLD.width - 80,
                player.x
            )
        );

    player.y =
        Math.max(
            80,
            Math.min(
                WORLD.height - 80,
                player.y
            )
        );

}


/* =========================================================
   CÁMARA
========================================================= */

function updateCamera() {

    const targetX =
        player.x -
        screenWidth / 2;

    const targetY =
        player.y -
        screenHeight / 2;

    camera.x +=
        (targetX - camera.x) *
        0.08;

    camera.y +=
        (targetY - camera.y) *
        0.08;

    camera.x =
        Math.max(
            0,
            Math.min(
                WORLD.width - screenWidth,
                camera.x
            )
        );

    camera.y =
        Math.max(
            0,
            Math.min(
                WORLD.height - screenHeight,
                camera.y
            )
        );

}


/* =========================================================
   HABITACIONES
========================================================= */

const rooms = {

    plaza: {
        x: 120,
        y: 850,
        w: 950,
        h: 900,
        name: "Plaza Central"
    },

    history: {
        x: 1150,
        y: 160,
        w: 980,
        h: 690,
        name: "Sala de Historia"
    },

    clothing: {
        x: 2200,
        y: 160,
        w: 1150,
        h: 690,
        name: "Sala de Vestimenta"
    },

    music: {
        x: 120,
        y: 1850,
        w: 950,
        h: 430,
        name: "Sala de Música"
    },

    dance: {
        x: 1150,
        y: 930,
        w: 980,
        h: 870,
        name: "Sala de Danza"
    },

    mantaro: {
        x: 2200,
        y: 930,
        w: 1150,
        h: 870,
        name: "Valle del Mantaro"
    },

    festival: {
        x: 1150,
        y: 1900,
        w: 980,
        h: 400,
        name: "Gran Festival"
    }

};


/* =========================================================
   INTERACTIVOS
========================================================= */

const interactables = [

    {
        id: "guide",
        x: 500,
        y: 1080,
        radius: 95,
        title: "Amalia, guía cultural",
        description: "Hablar con la guía"
    },

    {
        id: "museumEntrance",
        x: 1050,
        y: 1080,
        radius: 100,
        title: "Museo Huaylash",
        description: "Entrar al museo"
    },

    {
        id: "history",
        x: 1480,
        y: 500,
        radius: 120,
        title: "Sala 01 · Raíces",
        description: "Descubrir la historia"
    },

    {
        id: "clothing",
        x: 2550,
        y: 500,
        radius: 120,
        title: "Sala 02 · Vestimenta",
        description: "Conocer la indumentaria"
    },

    {
        id: "music",
        x: 500,
        y: 2020,
        radius: 120,
        title: "Sala 03 · Música",
        description: "Escuchar y aprender"
    },

    {
        id: "dance",
        x: 1580,
        y: 1300,
        radius: 120,
        title: "Sala 04 · Danza",
        description: "Aprender los movimientos"
    },

    {
        id: "mantaro",
        x: 2650,
        y: 1300,
        radius: 120,
        title: "Sala 05 · Valle del Mantaro",
        description: "Explorar el territorio"
    },

    {
        id: "festival",
        x: 1650,
        y: 2100,
        radius: 150,
        title: "Gran Festival",
        description: "Celebrar el Huaylash"
    }

];


/* =========================================================
   DETECTAR INTERACTIVO
========================================================= */

function findNearestInteraction() {

    let nearest = null;

    let closestDistance =
        Infinity;

    for (
        const item of interactables
    ) {

        const dx =
            player.x - item.x;

        const dy =
            player.y - item.y;

        const distance =
            Math.sqrt(
                dx * dx +
                dy * dy
            );

        if (
            distance <
            item.radius &&
            distance <
            closestDistance
        ) {

            nearest = item;

            closestDistance =
                distance;

        }

    }

    return nearest;

}


/* =========================================================
   INTERACCIÓN
========================================================= */

function interact() {

    const item =
        findNearestInteraction();

    if (!item) {

        showToast(
            "EXPLORA",
            "Acércate a un personaje, sala u objeto."
        );

        return;

    }

    switch (item.id) {

        case "guide":
            openGuide();
            break;

        case "museumEntrance":
            openMuseumEntrance();
            break;

        case "history":
            openHistory();
            break;

        case "clothing":
            openClothing();
            break;

        case "music":
            openMusic();
            break;

        case "dance":
            openDance();
            break;

        case "mantaro":
            openMantaro();
            break;

        case "festival":
            openFestival();
            break;

    }

}


/* =========================================================
   MODAL
========================================================= */

const modal =
    document.getElementById("modal");

const modalContent =
    document.getElementById("modalContent");


function openModal(html) {

    modalContent.innerHTML =
        html;

    modal.classList.remove(
        "hidden"
    );

}


function closeModal() {

    modal.classList.add(
        "hidden"
    );

}

document
    .getElementById("closeModal")
    .addEventListener(
        "click",
        closeModal
    );


/* =========================================================
   GUÍA
========================================================= */

function openGuide() {

    gameState.guideTalked = true;

    saveGame();

    updateMission();

    openModal(`

        <div class="eyebrow">
            PERSONAJE · GUÍA CULTURAL
        </div>

        <h2>
            Amalia
        </h2>

        <div class="modal-subtitle">
            BIENVENIDO AL MUSEO HUAYLASH
        </div>

        <p class="modal-text">
            ¡Bienvenido! Este museo no es solamente un lugar para
            observar objetos. Aquí vas a descubrir cómo la música,
            la vestimenta, el movimiento y la memoria comunitaria
            forman parte de una expresión cultural viva.
            <br><br>
            Tu recorrido comienza en la <strong>Sala de Historia</strong>.
            Después tendrás que conocer la vestimenta, experimentar
            con el ritmo, aprender sobre la danza y explorar el
            Valle del Mantaro.
            <br><br>
            Cuando completes las actividades, podrás entrar al
            <strong>Gran Festival</strong>.
        </p>

        <div class="info-grid">

            <div class="info-card">
                <span>01</span>
                <h3>Explora</h3>
                <p>
                    Camina por la plaza y las salas del museo.
                </p>
            </div>

            <div class="info-card">
                <span>02</span>
                <h3>Interactúa</h3>
                <p>
                    Acércate y presiona E para descubrir contenido.
                </p>
            </div>

            <div class="info-card">
                <span>03</span>
                <h3>Completa</h3>
                <p>
                    Supera las actividades para desbloquear el festival.
                </p>
            </div>

        </div>

        <div class="modal-actions">

            <button
                class="main-button"
                onclick="closeModal()">
                COMENZAR RECORRIDO
            </button>

        </div>

    `);

}


/* =========================================================
   ENTRADA AL MUSEO
========================================================= */

function openMuseumEntrance() {

    openModal(`

        <div class="eyebrow">
            MUSEO HUAYLASH
        </div>

        <h2>
            El corazón del Mantaro
        </h2>

        <p class="modal-text">
            Has llegado a la entrada principal.
            Dentro encontrarás cinco salas dedicadas a diferentes
            dimensiones de la tradición del Huaylash.
        </p>

        <div class="info-grid">

            <div class="info-card">
                <span>SALA 01</span>
                <h3>Historia</h3>
                <p>
                    Raíces, memoria y transformación.
                </p>
            </div>

            <div class="info-card">
                <span>SALA 02</span>
                <h3>Vestimenta</h3>
                <p>
                    Prendas, colores y significado.
                </p>
            </div>

            <div class="info-card">
                <span>SALA 03</span>
                <h3>Música</h3>
                <p>
                    Ritmo y acompañamiento musical.
                </p>
            </div>

        </div>

        <div class="modal-actions">

            <button
                class="main-button"
                onclick="closeModal(); teleportPlayer(1480,500);">
                ENTRAR A SALA 01
            </button>

        </div>

    `);

}


/* =========================================================
   HISTORIA
========================================================= */

function openHistory() {

    gameState.visited.history = true;

    collectMemory(
        "history",
        "Raíces",
        "La memoria histórica del Huaylash."
    );

    saveGame();

    updateMission();

    openModal(`

        <div class="eyebrow">
            SALA 01 · HISTORIA
        </div>

        <h2>
            Raíces de una tradición viva
        </h2>

        <div class="modal-subtitle">
            MEMORIA · COMUNIDAD · IDENTIDAD
        </div>

        <p class="modal-text">
            El Huaylarsh o Huaylash es una expresión dancística
            tradicional profundamente relacionada con el centro
            andino y, especialmente, con el valle del Mantaro.
            Sus formas, coreografías y significados pueden variar
            según las comunidades, las épocas y los contextos
            en los que se presenta.
            <br><br>
            Sus raíces se relacionan con la vida comunitaria,
            las labores agrícolas, la celebración y el encuentro.
            Con el paso del tiempo, la expresión ha continuado
            transformándose y también se ha presentado en escenarios,
            festividades y concursos.
        </p>

        <div class="info-grid">

            <div class="info-card">
                <span>ORIGEN</span>
                <h3>Vida comunitaria</h3>
                <p>
                    La danza se relaciona con prácticas y celebraciones
                    de comunidades del centro andino.
                </p>
            </div>

            <div class="info-card">
                <span>EVOLUCIÓN</span>
                <h3>Transformación</h3>
                <p>
                    Las formas de presentación han cambiado con el tiempo.
                </p>
            </div>

            <div class="info-card">
                <span>HOY</span>
                <h3>Tradición viva</h3>
                <p>
                    Continúa siendo practicada, enseñada y celebrada.
                </p>
            </div>

        </div>

        <div class="modal-actions">

            <button
                class="main-button"
                onclick="closeModal();">
                CONTINUAR
            </button>

        </div>

    `);

}


/* =========================================================
   VESTIMENTA
========================================================= */

function openClothing() {

    gameState.visited.clothing = true;

    collectMemory(
        "clothing",
        "Vestimenta",
        "Los colores y prendas forman parte de la identidad visual."
    );

    saveGame();

    updateMission();

    openModal(`

        <div class="eyebrow">
            SALA 02 · VESTIMENTA
        </div>

        <h2>
            Vestirse también es contar una historia
        </h2>

        <p class="modal-text">
            La vestimenta vinculada al Huaylash no es idéntica
            en todas las comunidades. Las prendas, colores,
            accesorios y formas de presentación pueden variar
            según el lugar, la época y el contexto.
            <br><br>
            En esta sala encontrarás una recreación didáctica
            de algunos elementos que pueden aparecer en
            presentaciones tradicionales y contemporáneas.
        </p>

        <div class="info-grid">

            <div class="info-card">
                <span>01</span>
                <h3>Colores</h3>
                <p>
                    Pueden reforzar la identidad visual de una agrupación.
                </p>
            </div>

            <div class="info-card">
                <span>02</span>
                <h3>Textiles</h3>
                <p>
                    La indumentaria incorpora tejidos y detalles decorativos.
                </p>
            </div>

            <div class="info-card">
                <span>03</span>
                <h3>Accesorios</h3>
                <p>
                    Complementan la presentación y el carácter festivo.
                </p>
            </div>

        </div>

        <div class="modal-actions">

            <button
                class="main-button"
                onclick="openDressGame();">
                IR AL PROBADOR
            </button>

        </div>

    `);

}


/* =========================================================
   MINIJUEGO DE VESTIMENTA
========================================================= */

function openDressGame() {

    openModal(`

        <div class="eyebrow">
            ACTIVIDAD · VESTIMENTA
        </div>

        <h2 class="minigame-title">
            Prepara tu presentación
        </h2>

        <p class="minigame-description">
            Selecciona cuatro elementos representativos para esta
            recreación didáctica. Recuerda: no existe una única
            vestimenta universal del Huaylash.
        </p>

        <div class="game-options">

            <button
                class="game-option"
                data-dress="correct">
                <small>ELEMENTO 01</small>
                Sombrero festivo
            </button>

            <button
                class="game-option"
                data-dress="correct">
                <small>ELEMENTO 02</small>
                Pañuelo
            </button>

            <button
                class="game-option"
                data-dress="correct">
                <small>ELEMENTO 03</small>
                Faja tejida
            </button>

            <button
                class="game-option"
                data-dress="correct">
                <small>ELEMENTO 04</small>
                Falda o pollera
            </button>

            <button
                class="game-option"
                data-dress="wrong">
                <small>ELEMENTO 05</small>
                Casco espacial
            </button>

            <button
                class="game-option"
                data-dress="wrong">
                <small>ELEMENTO 06</small>
                Armadura medieval
            </button>

        </div>

        <div
            id="dressResult"
            class="modal-text">
            Seleccionados: 0 / 4
        </div>

    `);

    let selected = 0;

    const options =
        document.querySelectorAll(
            "[data-dress]"
        );

    options.forEach(
        option => {

            option.addEventListener(
                "click",
                () => {

                    if (
                        option.classList.contains(
                            "correct"
                        ) ||
                        option.classList.contains(
                            "wrong"
                        )
                    ) {

                        return;

                    }

                    const type =
                        option.dataset.dress;

                    if (type === "correct") {

                        option.classList.add(
                            "correct"
                        );

                        selected++;

                        document
                            .getElementById(
                                "dressResult"
                            )
                            .textContent =
                            `Seleccionados: ${selected} / 4`;

                        if (
                            selected === 4
                        ) {

                            gameState.activities.clothing =
                                true;

                            collectMemory(
                                "dress",
                                "Probador",
                                "Completaste la actividad de vestimenta."
                            );

                            saveGame();

                            setTimeout(
                                () => {

                                    showToast(
                                        "ACTIVIDAD COMPLETADA",
                                        "Has preparado tu vestimenta."
                                    );

                                    closeModal();

                                    updateMission();

                                },
                                500
                            );

                        }

                    } else {

                        option.classList.add(
                            "wrong"
                        );

                        showToast(
                            "PRUEBA OTRA VEZ",
                            "Ese elemento no corresponde a esta recreación."
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   MÚSICA
========================================================= */

function openMusic() {

    gameState.visited.music = true;

    collectMemory(
        "music",
        "Música",
        "Ritmo, melodía y acompañamiento."
    );

    saveGame();

    updateMission();

    openModal(`

        <div class="eyebrow">
            SALA 03 · MÚSICA
        </div>

        <h2>
            Escucha el ritmo
        </h2>

        <p class="modal-text">
            La música acompaña la danza y ayuda a construir
            el ambiente de celebración. Las agrupaciones y
            repertorios pueden variar según la tradición y
            el contexto de presentación.
            <br><br>
            Para este videojuego utilizaremos sonidos originales
            generados digitalmente, inspirados en patrones
            rítmicos andinos. No se reproduce una grabación
            tradicional específica.
        </p>

        <div class="info-grid">

            <div class="info-card">
                <span>RITMO</span>
                <h3>Movimiento</h3>
                <p>
                    El ritmo ayuda a coordinar los movimientos.
                </p>
            </div>

            <div class="info-card">
                <span>MÚSICOS</span>
                <h3>Conjunto</h3>
                <p>
                    Las agrupaciones pueden incorporar diferentes instrumentos.
                </p>
            </div>

            <div class="info-card">
                <span>EXPERIENCIA</span>
                <h3>Participación</h3>
                <p>
                    Música y danza se experimentan como una actividad colectiva.
                </p>
            </div>

        </div>

        <div class="modal-actions">

            <button
                class="main-button"
                onclick="openRhythmGame();">
                PROBAR EL RITMO
            </button>

        </div>

    `);

}


/* =========================================================
   MINIJUEGO DE RITMO
========================================================= */

let rhythmSequence = [
    0,
    2,
    1,
    3,
    0,
    1
];

let rhythmPosition = 0;


function openRhythmGame() {

    rhythmPosition = 0;

    openModal(`

        <div class="eyebrow">
            ACTIVIDAD · MÚSICA
        </div>

        <h2 class="minigame-title">
            Sigue el ritmo
        </h2>

        <p class="minigame-description">
            Escucha mentalmente la secuencia y repite el patrón
            presionando los cuatro sonidos.
        </p>

        <div class="rhythm-display">

            <div class="rhythm-light">1</div>
            <div class="rhythm-light">2</div>
            <div class="rhythm-light">3</div>
            <div class="rhythm-light">4</div>

        </div>

        <div class="rhythm-pads">

            <button class="rhythm-pad" data-pad="0">
                1
            </button>

            <button class="rhythm-pad" data-pad="1">
                2
            </button>

            <button class="rhythm-pad" data-pad="2">
                3
            </button>

            <button class="rhythm-pad" data-pad="3">
                4
            </button>

        </div>

        <div
            id="rhythmResult"
            class="modal-text">
            Repite: 0 / ${rhythmSequence.length}
        </div>

    `);

    const pads =
        document.querySelectorAll(
            ".rhythm-pad"
        );

    pads.forEach(
        pad => {

            pad.addEventListener(
                "click",
                () => {

                    const value =
                        Number(
                            pad.dataset.pad
                        );

                    playTone(
                        value
                    );

                    if (
                        value ===
                        rhythmSequence[
                            rhythmPosition
                        ]
                    ) {

                        rhythmPosition++;

                        document
                            .getElementById(
                                "rhythmResult"
                            )
                            .textContent =
                            `Repite: ${rhythmPosition} / ${rhythmSequence.length}`;

                        if (
                            rhythmPosition >=
                            rhythmSequence.length
                        ) {

                            gameState.activities.rhythm =
                                true;

                            collectMemory(
                                "rhythm",
                                "Ritmo",
                                "Completaste el desafío musical."
                            );

                            saveGame();

                            setTimeout(
                                () => {

                                    showToast(
                                        "RITMO COMPLETADO",
                                        "Has seguido correctamente la secuencia."
                                    );

                                    closeModal();

                                    updateMission();

                                },
                                600
                            );

                        }

                    } else {

                        rhythmPosition = 0;

                        document
                            .getElementById(
                                "rhythmResult"
                            )
                            .textContent =
                            `Te equivocaste. Repite: 0 / ${rhythmSequence.length}`;

                        showToast(
                            "RITMO INTERRUMPIDO",
                            "La secuencia comienza nuevamente."
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   AUDIO
========================================================= */

let audioContext = null;


function playTone(index) {

    if (!audioContext) {

        audioContext =
            new (
                window.AudioContext ||
                window.webkitAudioContext
            )();

    }

    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();

    const frequencies = [
        261.63,
        329.63,
        392.00,
        523.25
    ];

    oscillator.frequency.value =
        frequencies[index];

    oscillator.type =
        "sine";

    gain.gain.setValueAtTime(
        0.001,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.16,
        audioContext.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime + 0.25
    );

    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );

    oscillator.start();

    oscillator.stop(
        audioContext.currentTime + 0.28
    );

}


/* =========================================================
   DANZA
========================================================= */

function openDance() {

    gameState.visited.dance = true;

    collectMemory(
        "dance",
        "Danza",
        "Movimiento, encuentro y celebración."
    );

    saveGame();

    updateMission();

    openModal(`

        <div class="eyebrow">
            SALA 04 · DANZA
        </div>

        <h2>
            El cuerpo cuenta la historia
        </h2>

        <p class="modal-text">
            La danza expresa energía, identidad, encuentro y
            celebración. Los movimientos y coreografías pueden
            variar entre estilos, comunidades y presentaciones.
            <br><br>
            En esta sala podrás practicar una pequeña secuencia
            inspirada en la idea de seguir un patrón de movimiento.
        </p>

        <div class="info-grid">

            <div class="info-card">
                <span>01</span>
                <h3>Coordinación</h3>
                <p>
                    El grupo necesita sincronizar sus movimientos.
                </p>
            </div>

            <div class="info-card">
                <span>02</span>
                <h3>Energía</h3>
                <p>
                    El movimiento aporta fuerza y carácter a la presentación.
                </p>
            </div>

            <div class="info-card">
                <span>03</span>
                <h3>Encuentro</h3>
                <p>
                    La danza puede convertirse en una experiencia colectiva.
                </p>
            </div>

        </div>

        <div class="modal-actions">

            <button
                class="main-button"
                onclick="openDanceGame();">
                APRENDER SECUENCIA
            </button>

        </div>

    `);

}


/* =========================================================
   MINIJUEGO DE DANZA
========================================================= */

function openDanceGame() {

    const sequence = [
        "PASO LATERAL",
        "GIRO",
        "PAÑUELO",
        "PASO LATERAL"
    ];

    let position = 0;

    openModal(`

        <div class="eyebrow">
            ACTIVIDAD · DANZA
        </div>

        <h2 class="minigame-title">
            Aprende la secuencia
        </h2>

        <p class="minigame-description">
            Selecciona los movimientos en el orden indicado.
            Esta es una actividad didáctica simplificada.
        </p>

        <div class="game-options">

            <button
                class="game-option dance-option"
                data-dance="PASO LATERAL">
                <small>MOVIMIENTO</small>
                PASO LATERAL
            </button>

            <button
                class="game-option dance-option"
                data-dance="GIRO">
                <small>MOVIMIENTO</small>
                GIRO
            </button>

            <button
                class="game-option dance-option"
                data-dance="PAÑUELO">
                <small>MOVIMIENTO</small>
                PAÑUELO
            </button>

        </div>

        <div
            id="danceResult"
            class="modal-text">
            Secuencia: 0 / ${sequence.length}
        </div>

    `);

    const buttons =
        document.querySelectorAll(
            ".dance-option"
        );

    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    const move =
                        button.dataset.dance;

                    if (
                        move ===
                        sequence[position]
                    ) {

                        button.classList.add(
                            "correct"
                        );

                        position++;

                        document
                            .getElementById(
                                "danceResult"
                            )
                            .textContent =
                            `Secuencia: ${position} / ${sequence.length}`;

                        if (
                            position ===
                            sequence.length
                        ) {

                            gameState.activities.timeline =
                                true;

                            collectMemory(
                                "danceGame",
                                "Coreografía",
                                "Completaste la práctica de danza."
                            );

                            saveGame();

                            setTimeout(
                                () => {

                                    showToast(
                                        "SECUENCIA COMPLETADA",
                                        "Has aprendido el patrón."
                                    );

                                    closeModal();

                                    updateMission();

                                },
                                600
                            );

                        }

                    } else {

                        position = 0;

                        buttons.forEach(
                            b => {
                                b.classList.remove(
                                    "correct"
                                );
                            }
                        );

                        document
                            .getElementById(
                                "danceResult"
                            )
                            .textContent =
                            `Orden incorrecto. Secuencia: 0 / ${sequence.length}`;

                        showToast(
                            "INTÉNTALO NUEVAMENTE",
                            "La secuencia empieza desde el primer movimiento."
                        );

                    }

                }
            );

        }
    );

}


/* =========================================================
   MANTARO
========================================================= */

function openMantaro() {

    gameState.visited.mantaro = true;

    collectMemory(
        "mantaro",
        "Valle del Mantaro",
        "Territorio, comunidad e identidad."
    );

    saveGame();

    updateMission();

    openModal(`

        <div class="eyebrow">
            SALA 05 · TERRITORIO
        </div>

        <h2>
            El Valle del Mantaro
        </h2>

        <p class="modal-text">
            El valle del Mantaro constituye un espacio cultural
            importante del centro andino. Sus pueblos y ciudades
            han desarrollado diversas expresiones de música,
            danza, festividad, gastronomía y vida comunitaria.
            <br><br>
            El Huaylash forma parte de ese paisaje cultural.
            La relación entre territorio, comunidad y celebración
            permite comprender que una danza no existe aislada:
            está vinculada con las personas que la practican,
            enseñan y transmiten.
        </p>

        <div class="info-grid">

            <div class="info-card">
                <span>TERRITORIO</span>
                <h3>Mantaro</h3>
                <p>
                    Un espacio cultural del centro andino.
                </p>
            </div>

            <div class="info-card">
                <span>COMUNIDAD</span>
                <h3>Memoria</h3>
                <p>
                    Las tradiciones se transmiten entre generaciones.
                </p>
            </div>

            <div class="info-card">
                <span>IDENTIDAD</span>
                <h3>Celebración</h3>
                <p>
                    Las fiestas reúnen música, danza y participación.
                </p>
            </div>

        </div>

        <div class="modal-actions">

            <button
                class="main-button"
                onclick="closeModal();">
                CONTINUAR RECORRIDO
            </button>

        </div>

    `);

}


/* =========================================================
   FESTIVAL
========================================================= */

function openFestival() {

    if (
        !checkFestivalUnlocked()
    ) {

        openModal(`

            <div class="eyebrow">
                GRAN FESTIVAL
            </div>

            <h2>
                Todavía no está listo
            </h2>

            <p class="modal-text">
                Primero debes completar el recorrido cultural.
                Visita las salas y realiza las actividades.
            </p>

            <div class="info-grid">

                <div class="info-card">
                    <span>HISTORIA</span>
                    <h3>
                        ${gameState.visited.history ? "✓ COMPLETADO" : "Pendiente"}
                    </h3>
                </div>

                <div class="info-card">
                    <span>VESTIMENTA</span>
                    <h3>
                        ${gameState.activities.clothing ? "✓ COMPLETADO" : "Pendiente"}
                    </h3>
                </div>

                <div class="info-card">
                    <span>MÚSICA</span>
                    <h3>
                        ${gameState.activities.rhythm ? "✓ COMPLETADO" : "Pendiente"}
                    </h3>
                </div>

                <div class="info-card">
                    <span>DANZA</span>
                    <h3>
                        ${gameState.visited.dance ? "✓ COMPLETADO" : "Pendiente"}
                    </h3>
                </div>

                <div class="info-card">
                    <span>MANTARO</span>
                    <h3>
                        ${gameState.visited.mantaro ? "✓ COMPLETADO" : "Pendiente"}
                    </h3>
                </div>

                <div class="info-card">
                    <span>COREOGRAFÍA</span>
                    <h3>
                        ${gameState.activities.timeline ? "✓ COMPLETADO" : "Pendiente"}
                    </h3>
                </div>

            </div>

        `);

        return;

    }

    openModal(`

        <div class="eyebrow">
            DESBLOQUEADO
        </div>

        <h2>
            Gran Festival del Huaylash
        </h2>

        <p class="modal-text">
            Has reunido las memorias del museo.
            Ahora puedes participar en la celebración final.
            Antes de comenzar, podrás observar un video
            relacionado con la tradición del Huaylash.
        </p>

        <div class="info-grid">

            <div class="info-card">
                <span>01</span>
                <h3>Documental</h3>
                <p>
                    Observa el video que hayas elegido.
                </p>
            </div>

            <div class="info-card">
                <span>02</span>
                <h3>Festival</h3>
                <p>
                    Regresa a la plaza transformada.
                </p>
            </div>

            <div class="info-card">
                <span>03</span>
                <h3>Final</h3>
                <p>
                    Celebra y completa tu recorrido.
                </p>
            </div>

        </div>

        <div class="modal-actions">

            <button
                class="main-button"
                onclick="closeModal(); openVideo();">
                VER DOCUMENTAL
            </button>

        </div>

    `);

}


/* =========================================================
   DESBLOQUEAR FESTIVAL
========================================================= */

function checkFestivalUnlocked() {

    const unlocked =
        gameState.visited.history &&
        gameState.visited.clothing &&
        gameState.visited.music &&
        gameState.visited.dance &&
        gameState.visited.mantaro &&
        gameState.activities.clothing &&
        gameState.activities.rhythm &&
        gameState.activities.timeline;

    gameState.festivalUnlocked =
        unlocked;

    return unlocked;

}


/* =========================================================
   VIDEO
========================================================= */

function convertYouTubeUrl(url) {

    if (
        url.includes(
            "youtube.com/embed/"
        )
    ) {

        return url;

    }

    if (
        url.includes(
            "youtube.com/watch?v="
        )
    ) {

        const id =
            url.split(
                "v="
            )[1].split(
                "&"
            )[0];

        return (
            "https://www.youtube.com/embed/" +
            id
        );

    }

    if (
        url.includes(
            "youtu.be/"
        )
    ) {

        const id =
            url.split(
                "youtu.be/"
            )[1].split(
                "?"
            )[0];

        return (
            "https://www.youtube.com/embed/" +
            id
        );

    }

    return url;

}


function openVideo() {

    const frame =
        document.getElementById(
            "youtubeFrame"
        );

    frame.src =
        convertYouTubeUrl(
            HUAYLASH_VIDEO_URL
        ) +
        "?autoplay=1";

    document
        .getElementById(
            "videoModal"
        )
        .classList.remove(
            "hidden"
        );

}


document
    .getElementById(
        "closeVideo"
    )
    .addEventListener(
        "click",
        closeVideo
    );


function closeVideo() {

    const frame =
        document.getElementById(
            "youtubeFrame"
        );

    frame.src = "";

    document
        .getElementById(
            "videoModal"
        )
        .classList.add(
            "hidden"
        );

}


document
    .getElementById(
        "finishVideoBtn"
    )
    .addEventListener(
        "click",
        () => {

            gameState.videoWatched =
                true;

            collectMemory(
                "festival",
                "Gran Festival",
                "Llegaste al cierre del recorrido."
            );

            saveGame();

            closeVideo();

            startFestival();

        }
    );


/* =========================================================
   FESTIVAL FINAL
========================================================= */

let festivalActive = false;


function startFestival() {

    festivalActive = true;

    player.x = 1650;
    player.y = 2100;

    showToast(
        "GRAN FESTIVAL",
        "La plaza se ha transformado. Disfruta el cierre."
    );

    updateMission();

}


/* =========================================================
   MEMORIAS
========================================================= */

const memoryDefinitions = {

    history: {
        title: "Raíces",
        description: "La memoria histórica."
    },

    clothing: {
        title: "Vestimenta",
        description: "Prendas e identidad visual."
    },

    music: {
        title: "Música",
        description: "Ritmo y acompañamiento."
    },

    dance: {
        title: "Danza",
        description: "Movimiento y celebración."
    },

    mantaro: {
        title: "Mantaro",
        description: "Territorio y comunidad."
    },

    dress: {
        title: "Probador",
        description: "Actividad de vestimenta."
    },

    rhythm: {
        title: "Ritmo",
        description: "Desafío musical."
    },

    danceGame: {
        title: "Coreografía",
        description: "Práctica de movimientos."
    },

    festival: {
        title: "Festival",
        description: "La memoria final."
    }

};


function collectMemory(
    id,
    title,
    description
) {

    if (
        !gameState.memories
            .some(
                memory =>
                    memory.id === id
            )
    ) {

        gameState.memories.push({

            id,
            title,
            description

        });

        showToast(
            "NUEVA MEMORIA",
            title
        );

        updateHUD();

    }

}


/* =========================================================
   COLECCIÓN
========================================================= */

function toggleCollection() {

    const overlay =
        document.getElementById(
            "collectionModal"
        );

    if (
        overlay.classList.contains(
            "hidden"
        )
    ) {

        renderCollection();

        overlay.classList.remove(
            "hidden"
        );

    } else {

        overlay.classList.add(
            "hidden"
        );

    }

}


function renderCollection() {

    const grid =
        document.getElementById(
            "collectionGrid"
        );

    grid.innerHTML = "";

    const definitions =
        Object.entries(
            memoryDefinitions
        );

    definitions.forEach(
        ([id, definition], index) => {

            const unlocked =
                gameState.memories
                    .some(
                        memory =>
                            memory.id === id
                    );

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "memory-card " +
                (
                    unlocked
                        ? "unlocked"
                        : ""
                );

            card.innerHTML = `

                <div class="memory-number">
                    ${String(index + 1).padStart(2,"0")}
                </div>

                <h3>
                    ${
                        unlocked
                            ? definition.title
                            : "MEMORIA BLOQUEADA"
                    }
                </h3>

                <p>
                    ${
                        unlocked
                            ? definition.description
                            : "Explora el museo para descubrirla."
                    }
                </p>

            `;

            grid.appendChild(card);

        }
    );

}


document
    .getElementById(
        "closeCollection"
    )
    .addEventListener(
        "click",
        () => {

            document
                .getElementById(
                    "collectionModal"
                )
                .classList.add(
                    "hidden"
                );

        }
    );


/* =========================================================
   MAPA
========================================================= */

function toggleMap() {

    const map =
        document.getElementById(
            "mapModal"
        );

    if (
        map.classList.contains(
            "hidden"
        )
    ) {

        map.classList.remove(
            "hidden"
        );

    } else {

        map.classList.add(
            "hidden"
        );

    }

}


document
    .getElementById(
        "mapBtn"
    )
    .addEventListener(
        "click",
        toggleMap
    );


document
    .getElementById(
        "closeMap"
    )
    .addEventListener(
        "click",
        toggleMap
    );


document
    .querySelectorAll(
        ".map-room"
    )
    .forEach(
        room => {

            room.addEventListener(
                "click",
                () => {

                    const location =
                        room.dataset.location;

                    if (
                        location ===
                        "festival" &&
                        !checkFestivalUnlocked()
                    ) {

                        showToast(
                            "ZONA BLOQUEADA",
                            "Completa las actividades para desbloquearla."
                        );

                        return;

                    }

                    const positions = {

                        plaza: [
                            500,
                            1220
                        ],

                        history: [
                            1480,
                            500
                        ],

                        clothing: [
                            2550,
                            500
                        ],

                        music: [
                            500,
                            2020
                        ],

                        dance: [
                            1580,
                            1300
                        ],

                        mantaro: [
                            2650,
                            1300
                        ],

                        festival: [
                            1650,
                            2100
                        ]

                    };

                    if (
                        positions[
                            location
                        ]
                    ) {

                        teleportPlayer(
                            ...positions[
                                location
                            ]
                        );

                    }

                    toggleMap();

                }
            );

        }
    );


/* =========================================================
   TELETRANSPORTE
========================================================= */

function teleportPlayer(
    x,
    y
) {

    player.x = x;
    player.y = y;

    camera.x =
        player.x -
        screenWidth / 2;

    camera.y =
        player.y -
        screenHeight / 2;

    updateCamera();

}


/* =========================================================
   MISIONES
========================================================= */

function updateMission() {

    checkFestivalUnlocked();

    let mission =
        "";

    let objective =
        "";

    if (
        !gameState.guideTalked
    ) {

        mission =
            "Habla con Amalia.";

        objective =
            "Busca a Amalia, la guía del museo.";

    }

    else if (
        !gameState.visited.history
    ) {

        mission =
            "Descubre las raíces del Huaylash.";

        objective =
            "Dirígete a la Sala 01 · Historia.";

    }

    else if (
        !gameState.visited.clothing
    ) {

        mission =
            "Conoce la vestimenta.";

        objective =
            "Dirígete a la Sala 02 · Vestimenta.";

    }

    else if (
        !gameState.activities.clothing
    ) {

        mission =
            "Prepara tu vestimenta.";

        objective =
            "Completa el minijuego del probador.";

    }

    else if (
        !gameState.visited.music
    ) {

        mission =
            "Descubre la música.";

        objective =
            "Dirígete a la Sala 03 · Música.";

    }

    else if (
        !gameState.activities.rhythm
    ) {

        mission =
            "Sigue el ritmo.";

        objective =
            "Completa el desafío musical.";

    }

    else if (
        !gameState.visited.dance
    ) {

        mission =
            "Conoce la danza.";

        objective =
            "Dirígete a la Sala 04 · Danza.";

    }

    else if (
        !gameState.activities.timeline
    ) {

        mission =
            "Aprende una secuencia.";

        objective =
            "Completa la actividad de danza.";

    }

    else if (
        !gameState.visited.mantaro
    ) {

        mission =
            "Explora el Valle del Mantaro.";

        objective =
            "Dirígete a la Sala 05 · Mantaro.";

    }

    else if (
        !gameState.festivalUnlocked
    ) {

        mission =
            "Prepárate para el Gran Festival.";

        objective =
            "Regresa a la zona del festival.";

    }

    else if (
        !gameState.videoWatched
    ) {

        mission =
            "Conoce la tradición.";

        objective =
            "Ve el documental del Gran Festival.";

    }

    else {

        mission =
            "Celebra el Huaylash.";

        objective =
            "Explora la plaza y disfruta el festival.";

    }

    document
        .getElementById(
            "missionText"
        )
        .textContent =
        mission;

    document
        .getElementById(
            "objectiveText"
        )
        .textContent =
        objective;

}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    const count =
        gameState.memories.length;

    const total = 6;

    document
        .getElementById(
            "memoryCount"
        )
        .textContent =
        `${Math.min(count,total)} / ${total}`;

    document
        .getElementById(
            "progressFill"
        )
        .style.width =
        `${Math.min(count / total * 100, 100)}%`;

    updateMission();

}


/* =========================================================
   TOAST
========================================================= */

let toastTimeout = null;


function showToast(
    title,
    message
) {

    const toast =
        document.getElementById(
            "toast"
        );

    document
        .getElementById(
            "toastTitle"
        )
        .textContent =
        title;

    document
        .getElementById(
            "toastMessage"
        )
        .textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimeout
    );

    toastTimeout =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            3500
        );

}


/* =========================================================
   CERRAR OVERLAYS
========================================================= */

function closeAllOverlays() {

    closeModal();

    document
        .getElementById(
            "mapModal"
        )
        .classList.add(
            "hidden"
        );

    document
        .getElementById(
            "collectionModal"
        )
        .classList.add(
            "hidden"
        );

    closeVideo();

}


/* =========================================================
   PERSONALIZACIÓN
========================================================= */

const previewCanvas =
    document.getElementById(
        "characterPreview"
    );

const previewCtx =
    previewCanvas.getContext(
        "2d"
    );


function drawCharacterPreview() {

    previewCtx.clearRect(
        0,
        0,
        previewCanvas.width,
        previewCanvas.height
    );

    drawCharacter(
        previewCtx,
        210,
        260,
        1.8,
        player,
        true
    );

}


document
    .querySelectorAll(
        "[data-gender]"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            "[data-gender]"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    player.gender =
                        button.dataset.gender;

                    drawCharacterPreview();

                }
            );

        }
    );


document
    .querySelectorAll(
        ".skin-choice"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".skin-choice"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    player.skin =
                        button.dataset.skin;

                    drawCharacterPreview();

                }
            );

        }
    );


document
    .querySelectorAll(
        ".hair-choice"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".hair-choice"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    player.hair =
                        button.dataset.hair;

                    drawCharacterPreview();

                }
            );

        }
    );


document
    .querySelectorAll(
        ".outfit-choice"
    )
    .forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll(
                            ".outfit-choice"
                        )
                        .forEach(
                            b =>
                                b.classList.remove(
                                    "active"
                                )
                        );

                    button.classList.add(
                        "active"
                    );

                    player.outfit =
                        button.dataset.outfit;

                    drawCharacterPreview();

                }
            );

        }
    );


/* =========================================================
   INICIAR NUEVO JUEGO
========================================================= */

document
    .getElementById(
        "newGameBtn"
    )
    .addEventListener(
        "click",
        () => {

            localStorage.removeItem(
                SAVE_KEY
            );

            gameState = {

                memories: [],

                visited: {
                    history: false,
                    clothing: false,
                    music: false,
                    dance: false,
                    mantaro: false
                },

                activities: {
                    clothing: false,
                    rhythm: false,
                    timeline: false
                },

                guideTalked: false,

                festivalUnlocked: false,

                videoWatched: false

            };

            player.x = 470;
            player.y = 1220;

            document
                .getElementById(
                    "startScreen"
                )
                .classList.remove(
                    "active"
                );

            document
                .getElementById(
                    "characterScreen"
                )
                .classList.add(
                    "active"
                );

            drawCharacterPreview();

        }
    );


/* =========================================================
   CONTINUAR
========================================================= */

document
    .getElementById(
        "continueBtn"
    )
    .addEventListener(
        "click",
        () => {

            if (
                loadGame()
            ) {

                document
                    .getElementById(
                        "startScreen"
                    )
                    .classList.remove(
                        "active"
                    );

                startGame();

            } else {

                showToast(
                    "SIN PARTIDA",
                    "Todavía no existe una partida guardada."
                );

            }

        }
    );


/* =========================================================
   ENTRAR AL MUNDO
========================================================= */

document
    .getElementById(
        "enterWorldBtn"
    )
    .addEventListener(
        "click",
        () => {

            saveGame();

            document
                .getElementById(
                    "characterScreen"
                )
                .classList.remove(
                    "active"
                );

            startGame();

        }
    );


/* =========================================================
   INICIAR JUEGO
========================================================= */

function startGame() {

    gameStarted = true;

    document
        .getElementById(
            "hud"
        )
        .classList.remove(
            "hidden"
        );

    updateHUD();

    teleportPlayer(
        500,
        1220
    );

    setTimeout(
        () => {

            if (
                !gameState.guideTalked
            ) {

                openGuide();

            }

        },
        700
    );

}


/* =========================================================
   DIBUJO DEL MUNDO
========================================================= */

function drawWorld(time) {

    ctx.clearRect(
        0,
        0,
        screenWidth,
        screenHeight
    );

    ctx.save();

    ctx.translate(
        -camera.x,
        -camera.y
    );

    drawWorldBackground();

    drawMuseumBuilding();

    drawPlaza();

    drawRoads();

    drawDecorations(time);

    drawExhibits(time);

    drawNPCs(time);

    if (
        festivalActive
    ) {

        drawFestival(time);

    }

    drawPlayer(time);

    ctx.restore();

    drawScreenLighting(time);

}


/* =========================================================
   FONDO
========================================================= */

function drawWorldBackground() {

    ctx.fillStyle =
        "#071116";

    ctx.fillRect(
        0,
        0,
        WORLD.width,
        WORLD.height
    );

    /* montañas */

    ctx.fillStyle =
        "#0c2731";

    ctx.beginPath();

    ctx.moveTo(
        0,
        620
    );

    for (
        let x = 0;
        x <= WORLD.width;
        x += 250
    ) {

        const y =
            550 +
            Math.sin(
                x * 0.004
            ) * 80;

        ctx.lineTo(
            x,
            y
        );

    }

    ctx.lineTo(
        WORLD.width,
        0
    );

    ctx.lineTo(
        0,
        0
    );

    ctx.closePath();

    ctx.fill();


    /* suelo */

    ctx.fillStyle =
        "#17272b";

    ctx.fillRect(
        0,
        650,
        WORLD.width,
        WORLD.height - 650
    );


    /* textura del suelo */

    ctx.strokeStyle =
        "rgba(255,255,255,0.025)";

    ctx.lineWidth = 1;

    for (
        let x = 0;
        x < WORLD.width;
        x += 70
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            650
        );

        ctx.lineTo(
            x,
            WORLD.height
        );

        ctx.stroke();

    }

    for (
        let y = 650;
        y < WORLD.height;
        y += 70
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            WORLD.width,
            y
        );

        ctx.stroke();

    }

}


/* =========================================================
   MUSEO
========================================================= */

function drawMuseumBuilding() {

    const buildingRooms = [
        rooms.history,
        rooms.clothing,
        rooms.music,
        rooms.dance,
        rooms.mantaro
    ];

    buildingRooms.forEach(
        room => {

            ctx.fillStyle =
                "#0b1a22";

            ctx.fillRect(
                room.x,
                room.y,
                room.w,
                room.h
            );

            ctx.strokeStyle =
                "rgba(215,173,98,0.35)";

            ctx.lineWidth = 3;

            ctx.strokeRect(
                room.x,
                room.y,
                room.w,
                room.h
            );

            /* piso */

            ctx.fillStyle =
                "rgba(255,255,255,0.025)";

            for (
                let x = room.x;
                x < room.x + room.w;
                x += 55
            ) {

                for (
                    let y = room.y;
                    y < room.y + room.h;
                    y += 55
                ) {

                    ctx.fillRect(
                        x + 2,
                        y + 2,
                        48,
                        48
                    );

                }

            }

        }
    );


    /* fachada */

    ctx.fillStyle =
        "#102832";

    ctx.fillRect(
        1020,
        620,
        110,
        470
    );

    ctx.fillStyle =
        "#d7ad62";

    ctx.fillRect(
        1030,
        700,
        90,
        4
    );

    ctx.fillRect(
        1030,
        780,
        90,
        4
    );

    /* título */

    ctx.fillStyle =
        "#f0d69b";

    ctx.font =
        "700 25px Cinzel, serif";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "MUSEO",
        1075,
        675
    );

    ctx.font =
        "700 13px DM Sans";

    ctx.fillText(
        "HUAYLASH",
        1075,
        700
    );

    ctx.textAlign =
        "left";


    /* puertas de salas */

    const doors = [
        [1600,850],
        [2650,850],
        [600,1850],
        [1600,930],
        [2750,930]
    ];

    doors.forEach(
        ([x,y]) => {

            ctx.fillStyle =
                "#2b1713";

            ctx.fillRect(
                x,
                y - 12,
                75,
                20
            );

            ctx.strokeStyle =
                "#b9884c";

            ctx.strokeRect(
                x,
                y - 12,
                75,
                20
            );

        }
    );

}


/* =========================================================
   PLAZA
========================================================= */

function drawPlaza() {

    const p =
        rooms.plaza;

    /* plaza base */

    ctx.fillStyle =
        "#2a3331";

    ctx.fillRect(
        p.x,
        p.y,
        p.w,
        p.h
    );

    /* bordes */

    ctx.strokeStyle =
        "#8f7750";

    ctx.lineWidth = 5;

    ctx.strokeRect(
        p.x,
        p.y,
        p.w,
        p.h
    );


    /* patrón */

    ctx.strokeStyle =
        "rgba(255,255,255,0.035)";

    ctx.lineWidth = 1;

    for (
        let x = p.x;
        x < p.x + p.w;
        x += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            p.y
        );

        ctx.lineTo(
            x,
            p.y + p.h
        );

        ctx.stroke();

    }

    for (
        let y = p.y;
        y < p.y + p.h;
        y += 80
    ) {

        ctx.beginPath();

        ctx.moveTo(
            p.x,
            y
        );

        ctx.lineTo(
            p.x + p.w,
            y
        );

        ctx.stroke();

    }


    /* fuente */

    const cx =
        p.x + p.w / 2;

    const cy =
        p.y + p.h / 2;

    ctx.fillStyle =
        "#65706e";

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        145,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.strokeStyle =
        "#b59a65";

    ctx.lineWidth = 5;

    ctx.stroke();


    ctx.fillStyle =
        "#314e57";

    ctx.beginPath();

    ctx.arc(
        cx,
        cy,
        95,
        0,
        Math.PI * 2
    );

    ctx.fill();


    /* agua */

    ctx.strokeStyle =
        "rgba(200,230,230,0.35)";

    ctx.lineWidth = 2;

    for (
        let i = 0;
        i < 4;
        i++
    ) {

        ctx.beginPath();

        ctx.arc(
            cx,
            cy,
            30 + i * 20,
            0,
            Math.PI * 2
        );

        ctx.stroke();

    }


    /* jardines */

    const gardens = [
        [220,980],
        [850,980],
        [220,1580],
        [850,1580]
    ];

    gardens.forEach(
        ([x,y]) => {

            ctx.fillStyle =
                "#244032";

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                65,
                0,
                Math.PI * 2
            );

            ctx.fill();

            drawTree(
                x,
                y - 15,
                1
            );

        }
    );


    /* escenario */

    ctx.fillStyle =
        "#251a19";

    ctx.fillRect(
        390,
        900,
        410,
        75
    );

    ctx.strokeStyle =
        "#d7ad62";

    ctx.strokeRect(
        390,
        900,
        410,
        75
    );

    ctx.fillStyle =
        "#f0d69b";

    ctx.font =
        "700 14px DM Sans";

    ctx.textAlign =
        "center";

    ctx.fillText(
        festivalActive
            ? "GRAN FESTIVAL"
            : "ESCENARIO CULTURAL",
        595,
        945
    );

    ctx.textAlign =
        "left";


    /* faroles */

    const lamps = [
        [330,1100],
        [860,1100],
        [330,1450],
        [860,1450]
    ];

    lamps.forEach(
        ([x,y]) => {

            drawLamp(
                x,
                y
            );

        }
    );

}


/* =========================================================
   CAMINOS
========================================================= */

function drawRoads() {

    ctx.fillStyle =
        "#75694e";

    ctx.fillRect(
        1000,
        1080,
        250,
        80
    );

    ctx.fillRect(
        920,
        1720,
        180,
        70
    );

    ctx.fillRect(
        1070,
        2030,
        100,
        100
    );

}


/* =========================================================
   DECORACIONES
========================================================= */

function drawDecorations(time) {

    /* árboles exteriores */

    const trees = [
        [90,900],
        [3450,900],
        [90,1800],
        [3450,1800],
        [1100,100],
        [2140,100],
        [2160,860],
        [1080,860]
    ];

    trees.forEach(
        ([x,y]) => {

            drawTree(
                x,
                y,
                1.15
            );

        }
    );


    /* banderas */

    drawBanners(
        120,
        900,
        950
    );


    if (
        festivalActive
    ) {

        drawBanners(
            1150,
            1940,
            980
        );

    }

}


/* =========================================================
   ÁRBOLES
========================================================= */

function drawTree(
    x,
    y,
    scale
) {

    ctx.fillStyle =
        "#34251c";

    ctx.fillRect(
        x - 8 * scale,
        y,
        16 * scale,
        65 * scale
    );

    ctx.fillStyle =
        "#254737";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 10 * scale,
        38 * scale,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#315841";

    ctx.beginPath();

    ctx.arc(
        x - 22 * scale,
        y + 5 * scale,
        28 * scale,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.beginPath();

    ctx.arc(
        x + 23 * scale,
        y + 5 * scale,
        28 * scale,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =========================================================
   FAROL
========================================================= */

function drawLamp(
    x,
    y
) {

    ctx.strokeStyle =
        "#22292a";

    ctx.lineWidth = 7;

    ctx.beginPath();

    ctx.moveTo(
        x,
        y
    );

    ctx.lineTo(
        x,
        y - 95
    );

    ctx.stroke();

    ctx.fillStyle =
        "#d7ad62";

    ctx.beginPath();

    ctx.arc(
        x,
        y - 105,
        13,
        0,
        Math.PI * 2
    );

    ctx.fill();

}


/* =========================================================
   BANDERINES
========================================================= */

function drawBanners(
    x,
    y,
    width
) {

    ctx.strokeStyle =
        "#8f7750";

    ctx.lineWidth = 2;

    ctx.beginPath();

    ctx.moveTo(
        x,
        y
    );

    ctx.quadraticCurveTo(
        x + width / 2,
        y + 45,
        x + width,
        y
    );

    ctx.stroke();

    for (
        let i = 0;
        i < 12;
        i++
    ) {

        const px =
            x +
            i *
            width / 11;

        const py =
            y +
            Math.sin(
                i / 11 * Math.PI
            ) * 22;

        ctx.fillStyle =
            i % 3 === 0
                ? "#d7ad62"
                : i % 3 === 1
                    ? "#9b5145"
                    : "#52746b";

        ctx.beginPath();

        ctx.moveTo(
            px,
            py
        );

        ctx.lineTo(
            px + 25,
            py + 8
        );

        ctx.lineTo(
            px + 12,
            py + 38
        );

        ctx.closePath();

        ctx.fill();

    }

}


/* =========================================================
   EXHIBICIONES
========================================================= */

function drawExhibits(time) {

    drawHistoryExhibit(
        1480,
        500
    );

    drawClothingExhibit(
        2550,
        500
    );

    drawMusicExhibit(
        500,
        2020
    );

    drawDanceExhibit(
        1580,
        1300
    );

    drawMantaroExhibit(
        2650,
        1300
    );

    drawFestivalExhibit(
        1650,
        2100
    );

}


/* =========================================================
   HISTORIA EXHIBIT
========================================================= */

function drawHistoryExhibit(
    x,
    y
) {

    drawPedestal(
        x,
        y
    );

    ctx.fillStyle =
        "#b28d57";

    ctx.fillRect(
        x - 100,
        y - 170,
        200,
        125
    );

    ctx.fillStyle =
        "#172a32";

    ctx.fillRect(
        x - 91,
        y - 161,
        182,
        107
    );

    /* montañas */

    ctx.fillStyle =
        "#31515b";

    ctx.beginPath();

    ctx.moveTo(
        x - 80,
        y - 65
    );

    ctx.lineTo(
        x - 20,
        y - 130
    );

    ctx.lineTo(
        x + 20,
        y - 80
    );

    ctx.lineTo(
        x + 65,
        y - 145
    );

    ctx.lineTo(
        x + 90,
        y - 65
    );

    ctx.closePath();

    ctx.fill();

    drawExhibitLabel(
        x,
        y + 55,
        "RAÍCES"
    );

}


/* =========================================================
   VESTIMENTA EXHIBIT
========================================================= */

function drawClothingExhibit(
    x,
    y
) {

    drawPedestal(
        x,
        y
    );

    drawCharacter(
        ctx,
        x,
        y - 40,
        1.15,
        {
            gender: "female",
            skin: "#b97c53",
            hair: "#201712",
            outfit: "classic",
            walkTime: 0,
            moving: false
        },
        false
    );

    drawExhibitLabel(
        x,
        y + 55,
        "VESTIMENTA"
    );

}


/* =========================================================
   MÚSICA EXHIBIT
========================================================= */

function drawMusicExhibit(
    x,
    y
) {

    drawPedestal(
        x,
        y
    );

    /* instrumento estilizado */

    ctx.save();

    ctx.translate(
        x,
        y - 80
    );

    ctx.rotate(
        -0.2
    );

    ctx.fillStyle =
        "#8a5c34";

    ctx.beginPath();

    ctx.ellipse(
        0,
        0,
        65,
        32,
        0,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle =
        "#c99b5b";

    ctx.fillRect(
        50,
        -8,
        75,
        16
    );

    ctx.strokeStyle =
        "#e6cf9d";

    ctx.lineWidth = 1;

    for (
        let i = -3;
        i <= 3;
        i++
    ) {

        ctx.beginPath();

        ctx.moveTo(
            -40,
            i * 7
        );

        ctx.lineTo(
            110,
            i * 5
        );

        ctx.stroke();

    }

    ctx.restore();

    drawExhibitLabel(
        x,
        y + 55,
        "MÚSICA"
    );

}


/* =========================================================
   DANZA EXHIBIT
========================================================= */

function drawDanceExhibit(
    x,
    y
) {

    drawPedestal(
        x,
        y
    );

    drawCharacter(
        ctx,
        x - 40,
        y - 40,
        0.9,
        {
            gender: "female",
            skin: "#b97c53",
            hair: "#201712",
            outfit: "festival",
            walkTime: Math.sin(performance.now() / 300),
            moving: true
        },
        false
    );

    drawCharacter(
        ctx,
        x + 45,
        y - 40,
        0.9,
        {
            gender: "male",
            skin: "#9b633f",
            hair: "#201712",
            outfit: "festival",
            walkTime: -Math.sin(performance.now() / 300),
            moving: true
        },
        false
    );

    drawExhibitLabel(
        x,
        y + 55,
        "DANZA"
    );

}


/* =========================================================
   MANTARO EXHIBIT
========================================================= */

function drawMantaroExhibit(
    x,
    y
) {

    drawPedestal(
        x,
        y
    );

    ctx.fillStyle =
        "#bd9a62";

    ctx.fillRect(
        x - 110,
        y - 150,
        220,
        110
    );

    ctx.fillStyle =
        "#1b3a43";

    ctx.fillRect(
        x - 100,
        y - 140,
        200,
        90
    );

    /* valle */

    ctx.fillStyle =
        "#517b63";

    ctx.beginPath();

    ctx.moveTo(
        x - 95,
        y - 65
    );

    ctx.lineTo(
        x - 20,
        y - 110
    );

    ctx.lineTo(
        x + 20,
        y - 80
    );

    ctx.lineTo(
        x + 90,
        y - 120
    );

    ctx.lineTo(
        x + 100,
        y - 50
    );

    ctx.lineTo(
        x - 100,
        y - 50
    );

    ctx.closePath();

    ctx.fill();

    drawExhibitLabel(
        x,
        y + 55,
        "MANTARO"
    );

}


/* =========================================================
   FESTIVAL EXHIBIT
========================================================= */

function drawFestivalExhibit(
    x,
    y
) {

    const unlocked =
        checkFestivalUnlocked();

    if (
        !unlocked &&
        !festivalActive
    ) {

        ctx.fillStyle =
            "#252d2f";

        ctx.fillRect(
            x - 170,
            y - 100,
            340,
            120
        );

        ctx.strokeStyle =
            "#495255";

        ctx.strokeRect(
            x - 170,
            y - 100,
            340,
            120
        );

        ctx.fillStyle =
            "#6c7779";

        ctx.font =
            "700 16px DM Sans";

        ctx.textAlign =
            "center";

        ctx.fillText(
            "GRAN FESTIVAL",
            x,
            y - 35
        );

        ctx.font =
            "10px DM Sans";

        ctx.fillText(
            "BLOQUEADO",
            x,
            y - 10
        );

        ctx.textAlign =
            "left";

        return;

    }

    ctx.fillStyle =
        "#2d1c18";

    ctx.fillRect(
        x - 190,
        y - 110,
        380,
        130
    );

    ctx.strokeStyle =
        "#d7ad62";

    ctx.lineWidth = 3;

    ctx.strokeRect(
        x - 190,
        y - 110,
        380,
        130
    );

    ctx.fillStyle =
        "#f0d69b";

    ctx.font =
        "700 18px Cinzel";

    ctx.textAlign =
        "center";

    ctx.fillText(
        "GRAN FESTIVAL",
        x,
        y - 60
    );

    ctx.font =
        "11px DM Sans";

    ctx.fillText(
        "ENTRAR",
        x,
        y - 35
    );

    ctx.textAlign =
        "left";

}


/* =========================================================
   PEDESTAL
========================================================= */

function drawPedestal(
    x,
    y
) {

    ctx.fillStyle =
        "#3b3026";

    ctx.fillRect(
        x - 65,
        y - 35,
        130,
        35
    );

    ctx.fillStyle =
        "#9a784d";

    ctx.fillRect(
        x - 52,
        y - 50,
        104,
        15
    );

}


/* =========================================================
   LABEL
========================================================= */

function drawExhibitLabel(
    x,
    y,
    text
) {

    ctx.fillStyle =
        "#d7ad62";

    ctx.font =
        "700 10px DM Sans";

    ctx.textAlign =
        "center";

    ctx.fillText(
        text,
        x,
        y
    );

    ctx.textAlign =
        "left";

}


/* =========================================================
   NPCS
========================================================= */

function drawNPCs(time) {

    /* Amalia */

    drawCharacter(
        ctx,
        500,
        1080,
        1.05,
        {
            gender: "female",
            skin: "#b97c53",
            hair: "#201712",
            outfit: "classic",
            walkTime: Math.sin(time * 0.002),
            moving: false
        },
        false
    );

    /* visitantes */

    const visitors = [

        [310,1180,"male"],
        [850,1260,"female"],
        [290,1420,"female"],
        [890,1390,"male"]

    ];

    visitors.forEach(
        ([x,y,gender], index) => {

            drawCharacter(
                ctx,
                x,
                y,
                0.78,
                {
                    gender,
                    skin:
                        index % 2
                            ? "#b97c53"
                            : "#9b633f",
                    hair: "#201712",
                    outfit:
                        index % 2
                            ? "modern"
                            : "classic",
                    walkTime:
                        Math.sin(
                            time * 0.001 +
                            index
                        ),
                    moving: false
                },
                false
            );

        }
    );

}


/* =========================================================
   PERSONAJE
========================================================= */

function drawCharacter(
    context,
    x,
    y,
    scale,
    character,
    preview = false
) {

    context.save();

    context.translate(
        x,
        y
    );

    context.scale(
        scale,
        scale
    );


    const bob =
        character.moving
            ? Math.sin(
                character.walkTime
            ) * 3
            : 0;

    context.translate(
        0,
        bob
    );


    /* sombra */

    context.fillStyle =
        "rgba(0,0,0,0.28)";

    context.beginPath();

    context.ellipse(
        0,
        47,
        28,
        9,
        0,
        0,
        Math.PI * 2
    );

    context.fill();


    /* piernas */

    const legSwing =
        character.moving
            ? Math.sin(
                character.walkTime
            ) * 6
            : 0;

    context.strokeStyle =
        "#2a2020";

    context.lineWidth = 9;

    context.lineCap =
        "round";

    context.beginPath();

    context.moveTo(
        -9,
        22
    );

    context.lineTo(
        -11 + legSwing,
        50
    );

    context.stroke();

    context.beginPath();

    context.moveTo(
        9,
        22
    );

    context.lineTo(
        11 - legSwing,
        50
    );

    context.stroke();


    /* zapatos */

    context.strokeStyle =
        "#171416";

    context.lineWidth = 7;

    context.beginPath();

    context.moveTo(
        -15 + legSwing,
        51
    );

    context.lineTo(
        -3 + legSwing,
        51
    );

    context.stroke();

    context.beginPath();

    context.moveTo(
        3 - legSwing,
        51
    );

    context.lineTo(
        15 - legSwing,
        51
    );

    context.stroke();


    /* cuerpo */

    if (
        character.outfit ===
        "classic"
    ) {

        context.fillStyle =
            "#9a5b3f";

    } else if (
        character.outfit ===
        "festival"
    ) {

        context.fillStyle =
            "#8b4e37";

    } else {

        context.fillStyle =
            "#315a63";

    }


    if (
        character.gender ===
        "female"
    ) {

        context.beginPath();

        context.moveTo(
            -20,
            -10
        );

        context.lineTo(
            20,
            -10
        );

        context.lineTo(
            32,
            30
        );

        context.lineTo(
            -32,
            30
        );

        context.closePath();

        context.fill();

        /* falda */

        context.fillStyle =
            character.outfit ===
            "festival"
                ? "#b38a4f"
                : "#674739";

        context.beginPath();

        context.moveTo(
            -21,
            17
        );

        context.lineTo(
            21,
            17
        );

        context.lineTo(
            30,
            36
        );

        context.lineTo(
            -30,
            36
        );

        context.closePath();

        context.fill();

    } else {

        context.fillStyle =
            character.outfit ===
            "festival"
                ? "#9e7044"
                : "#3f5d62";

        context.fillRect(
            -22,
            -10,
            44,
            42
        );

    }


    /* brazos */

    const armSwing =
        character.moving
            ? Math.sin(
                character.walkTime
            ) * 8
            : 0;

    context.strokeStyle =
        character.skin;

    context.lineWidth = 8;

    context.beginPath();

    context.moveTo(
        -20,
        -2
    );

    context.lineTo(
        -31 - armSwing,
        20
    );

    context.stroke();

    context.beginPath();

    context.moveTo(
        20,
        -2
    );

    context.lineTo(
        31 + armSwing,
        20
    );

    context.stroke();


    /* pañuelo */

    if (
        character.outfit ===
        "classic" ||
        character.outfit ===
        "festival"
    ) {

        context.fillStyle =
            "#d7ad62";

        context.beginPath();

        context.moveTo(
            0,
            -9
        );

        context.lineTo(
            17,
            -1
        );

        context.lineTo(
            0,
            5
        );

        context.closePath();

        context.fill();

    }


    /* cuello */

    context.fillStyle =
        character.skin;

    context.fillRect(
        -7,
        -28,
        14,
        13
    );


    /* cabeza */

    context.fillStyle =
        character.skin;

    context.beginPath();

    context.arc(
        0,
        -45,
        21,
        0,
        Math.PI * 2
    );

    context.fill();


    /* cabello */

    context.fillStyle =
        character.hair;

    if (
        character.gender ===
        "female"
    ) {

        context.beginPath();

        context.arc(
            0,
            -51,
            23,
            Math.PI,
            Math.PI * 2
        );

        context.fill();

        context.fillRect(
            -23,
            -51,
            8,
            28
        );

        context.fillRect(
            15,
            -51,
            8,
            28
        );

    } else {

        context.beginPath();

        context.arc(
            0,
            -52,
            22,
            Math.PI,
            Math.PI * 2
        );

        context.fill();

    }


    /* ojos */

    context.fillStyle =
        "#171717";

    context.beginPath();

    context.arc(
        -7,
        -45,
        2,
        0,
        Math.PI * 2
    );

    context.fill();

    context.beginPath();

    context.arc(
        7,
        -45,
        2,
        0,
        Math.PI * 2
    );

    context.fill();


    /* sombrero */

    if (
        character.outfit ===
        "classic" ||
        character.outfit ===
        "festival"
    ) {

        context.fillStyle =
            "#46382c";

        context.fillRect(
            -25,
            -69,
            50,
            8
        );

        context.fillStyle =
            "#806643";

        context.beginPath();

        context.ellipse(
            0,
            -68,
            26,
            8,
            0,
            0,
            Math.PI * 2
        );

        context.fill();

    }


    context.restore();

}


/* =========================================================
   FESTIVAL
========================================================= */

function drawFestival(time) {

    /* luces */

    const lights = [
        [1200,1950],
        [1450,1980],
        [1700,1950],
        [1950,1980],
        [2150,1950]
    ];

    lights.forEach(
        ([x,y], index) => {

            const pulse =
                0.6 +
                Math.sin(
                    time * 0.004 +
                    index
                ) * 0.25;

            ctx.fillStyle =
                `rgba(215,173,98,${pulse})`;

            ctx.beginPath();

            ctx.arc(
                x,
                y,
                10,
                0,
                Math.PI * 2
            );

            ctx.fill();

        }
    );


    /* bailarines */

    const dancers = [
        [1350,2120,0],
        [1500,2180,1],
        [1650,2100,2],
        [1800,2180,3],
        [1950,2110,4]
    ];

    dancers.forEach(
        ([x,y,index]) => {

            drawCharacter(
                ctx,
                x,
                y,
                1.05,
                {
                    gender:
                        index % 2
                            ? "male"
                            : "female",

                    skin:
                        index % 2
                            ? "#9b633f"
                            : "#b97c53",

                    hair:
                        index % 3 === 0
                            ? "#201712"
                            : "#4a281a",

                    outfit:
                        "festival",

                    walkTime:
                        time * 0.01 +
                        index,

                    moving: true

                },
                false
            );

        }
    );


    /* confeti */

    for (
        let i = 0;
        i < 45;
        i++
    ) {

        const x =
            1180 +
            (
                (i * 83) %
                900
            );

        const y =
            1950 +
            (
                (i * 57) %
                330
            );

        const size =
            2 +
            (i % 4);

        ctx.fillStyle =
            i % 3 === 0
                ? "#d7ad62"
                : i % 3 === 1
                    ? "#8c554b"
                    : "#6e9685";

        ctx.fillRect(
            x,
            y +
            Math.sin(
                time * 0.002 +
                i
            ) * 5,
            size,
            size * 2
        );

    }

}


/* =========================================================
   JUGADOR
========================================================= */

function drawPlayer(time) {

    drawCharacter(
        ctx,
        player.x,
        player.y,
        1,
        player,
        false
    );

}


/* =========================================================
   ILUMINACIÓN
========================================================= */

function drawScreenLighting(time) {

    const gradient =
        ctx.createRadialGradient(
            screenWidth / 2,
            screenHeight / 2,
            80,
            screenWidth / 2,
            screenHeight / 2,
            Math.max(
                screenWidth,
                screenHeight
            ) * 0.7
        );

    gradient.addColorStop(
        0,
        "rgba(255,255,255,0)"
    );

    gradient.addColorStop(
        1,
        "rgba(0,0,0,0.34)"
    );

    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        screenWidth,
        screenHeight
    );


    /* objetivo */

    if (
        currentInteraction
    ) {

        const sx =
            currentInteraction.x -
            camera.x;

        const sy =
            currentInteraction.y -
            camera.y;

        const glow =
            ctx.createRadialGradient(
                sx,
                sy,
                5,
                sx,
                sy,
                90
            );

        glow.addColorStop(
            0,
            "rgba(215,173,98,0.18)"
        );

        glow.addColorStop(
            1,
            "rgba(215,173,98,0)"
        );

        ctx.fillStyle =
            glow;

        ctx.beginPath();

        ctx.arc(
            sx,
            sy,
            90,
            0,
            Math.PI * 2
        );

        ctx.fill();

    }

}


/* =========================================================
   ACTUALIZAR INTERACCIÓN
========================================================= */

function updateInteractionHint() {

    if (!gameStarted) {

        return;

    }

    currentInteraction =
        findNearestInteraction();

    const hint =
        document.getElementById(
            "interactionHint"
        );

    if (
        currentInteraction
    ) {

        hint.classList.remove(
            "hidden"
        );

        document
            .getElementById(
                "interactionTitle"
            )
            .textContent =
            currentInteraction.title;

        document
            .getElementById(
                "interactionDescription"
            )
            .textContent =
            currentInteraction.description;

    } else {

        hint.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   LOOP PRINCIPAL
========================================================= */

function gameLoop(
    timestamp
) {

    const delta =
        Math.min(
            (timestamp - lastTime) / 1000,
            0.05
        );

    lastTime =
        timestamp;

    updatePlayer(
        delta
    );

    updateCamera();

    updateInteractionHint();

    drawWorld(
        timestamp
    );

    requestAnimationFrame(
        gameLoop
    );

}

requestAnimationFrame(
    gameLoop
);


/* =========================================================
   CONTROLES MÓVILES
========================================================= */

document
    .querySelectorAll(
        "[data-key]"
    )
    .forEach(
        button => {

            const key =
                button.dataset.key;

            button.addEventListener(
                "touchstart",
                event => {

                    event.preventDefault();

                    keys[key] = true;

                }
            );

            button.addEventListener(
                "touchend",
                event => {

                    event.preventDefault();

                    keys[key] = false;

                }
            );

            button.addEventListener(
                "mousedown",
                () => {

                    keys[key] = true;

                }
            );

            button.addEventListener(
                "mouseup",
                () => {

                    keys[key] = false;

                }
            );

        }
    );


document
    .getElementById(
        "mobileInteract"
    )
    .addEventListener(
        "click",
        interact
    );


/* =========================================================
   BOTÓN COLECCIÓN
========================================================= */

document
    .getElementById(
        "collectionBtn"
    )
    .addEventListener(
        "click",
        toggleCollection
    );


/* =========================================================
   MENSAJE INICIAL
========================================================= */

drawCharacterPreview();


/* =========================================================
   AUTOSAVE
========================================================= */

setInterval(
    () => {

        if (gameStarted) {

            saveGame();

        }

    },
    15000
);




/* =========================================================
   FIN
========================================================= */
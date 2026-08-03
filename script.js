document.addEventListener("DOMContentLoaded", () => {
    // LocalStorage para la Clave API de Gemini
    const apiKeyInput = document.getElementById("apiKey");
    const savedKey = localStorage.getItem("gemini_api_key") || "";
    if (savedKey) apiKeyInput.value = savedKey;

    apiKeyInput.addEventListener("change", () => {
        localStorage.setItem("gemini_api_key", apiKeyInput.value.trim());
    });

    // Modal de Ayuda para API Key
    const apiModal = document.getElementById("apiModal");
    document.getElementById("btnHelpApi").addEventListener("click", () => apiModal.classList.add("show"));
    document.getElementById("btnCloseModal").addEventListener("click", () => apiModal.classList.remove("show"));
    document.getElementById("btnGotIt").addEventListener("click", () => apiModal.classList.remove("show"));

    let activeDay = "Lunes";

    const defaultSchedule = {
        "Lunes": [
            { time_slot: "08:00 - 08:40 hs", area: "COMUNICACIÓN", prompt_notes: "Dar hechos y opiniones en poesía El puente", image_files: [] },
            { time_slot: "08:40 - 09:30 hs", area: "SALUD", prompt_notes: "Sexualidad humana págs. 61-64", image_files: [] },
            { time_slot: "09:50 - 10:20 hs", area: "CIENCIAS SOCIALES", prompt_notes: "Recursos naturales Cuenca del Plata págs. 72-73", image_files: [] },
            { time_slot: "10:20 - 10:50 hs", area: "GUARANÍ", prompt_notes: "Ñe'ẽhovaigua antónimos pág. 69", image_files: [] },
            { time_slot: "10:50 - 11:30 hs", area: "MATEMÁTICA", prompt_notes: "Medidas de longitud El metro págs. 111-113", image_files: [] },
            { time_slot: "11:30 - 12:00 hs", area: "TRABAJO Y TECNOLOGÍA", prompt_notes: "CPU y Memorias RAM/ROM págs. 63-64", image_files: [] }
        ],
        "Martes": [
            { time_slot: "08:00 - 08:40 hs", area: "COMUNICACIÓN", prompt_notes: "El Adjetivo calificativo y concordancia págs. 114-115", image_files: [] },
            { time_slot: "08:40 - 09:30 hs", area: "CIENCIAS SOCIALES", prompt_notes: "Recursos culturales del Paraguay págs. 74-75", image_files: [] },
            { time_slot: "09:50 - 10:10 hs", area: "SALUD", prompt_notes: "Prevención de la Violencia Infantil págs. 65-67", image_files: [] },
            { time_slot: "10:50 - 11:30 hs", area: "MATEMÁTICA", prompt_notes: "Conversión de medidas de longitud págs. 114-115", image_files: [] },
            { time_slot: "11:30 - 12:00 hs", area: "CIENCIAS NATURALES", prompt_notes: "El Equilibrio en la Naturaleza págs. 86-87", image_files: [] }
        ],
        "Miércoles": [
            { time_slot: "08:40 - 09:30 hs", area: "TRABAJO Y TECNOLOGÍA", prompt_notes: "Periféricos de almacenamiento entrada y salida págs. 65-67", image_files: [] },
            { time_slot: "09:50 - 10:30 hs", area: "MATEMÁTICA", prompt_notes: "Medidas de Capacidad El Litro págs. 116-117", image_files: [] },
            { time_slot: "10:30 - 10:50 hs", area: "GUARANÍ", prompt_notes: "Mombe'u'anga Descripción pág. 70", image_files: [] },
            { time_slot: "11:20 - 12:00 hs", area: "COMUNICACIÓN", prompt_notes: "Ortografía uso de B y descripción de frutas págs. 116-117", image_files: [] }
        ],
        "Jueves": [
            { time_slot: "09:50 - 10:20 hs", area: "CIENCIAS NATURALES", prompt_notes: "Cadenas alimentarias y pirámide págs. 88-89", image_files: [] },
            { time_slot: "10:20 - 10:50 hs", area: "SALUD", prompt_notes: "ITS Gonorrea y Sífilis págs. 70-72", image_files: [] },
            { time_slot: "10:50 - 11:30 hs", area: "COMUNICACIÓN", prompt_notes: "Descripción de personas y animales págs. 118-119", image_files: [] },
            { time_slot: "11:30 - 12:00 hs", area: "MATEMÁTICA", prompt_notes: "Problemas prácticos con medidas de capacidad págs. 118-119", image_files: [] }
        ],
        "Viernes": [
            { time_slot: "08:40 - 09:30 hs", area: "EDUCACIÓN ARTÍSTICA (ARTES PLÁSTICAS)", prompt_notes: "Colores armónicos pág. 22", image_files: [] },
            { time_slot: "09:50 - 10:00 hs", area: "ÑE'ẼRY", is_neery: true, texto: "'La vaca Nicolasa' (de Marisa Moreno)", tiempo: "10 minutos", image_files: [] },
            { time_slot: "10:00 - 11:00 hs", area: "COMUNICACIÓN", prompt_notes: "Análisis literario La vaca Nicolasa págs. 120-122", image_files: [] },
            { time_slot: "11:00 - 12:00 hs", area: "MATEMÁTICA", prompt_notes: "Medidas de masa El Kilogramo y Tonelada págs. 120-121", image_files: [] }
        ]
    };

    let scheduleData = JSON.parse(JSON.stringify(defaultSchedule));

    const tabBtns = document.querySelectorAll(".tab-btn");
    const currentDayTitle = document.getElementById("currentDayTitle");
    const slotsContainer = document.getElementById("slotsContainer");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            tabBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            activeDay = btn.dataset.day;
            currentDayTitle.textContent = `📌 Bloques Horarios de ${activeDay}`;
            renderSlots();
        });
    });

    document.getElementById("btnAddSlot").addEventListener("click", () => {
        scheduleData[activeDay].push({
            time_slot: "08:00 - 08:40 hs",
            area: "COMUNICACIÓN",
            prompt_notes: "",
            image_files: []
        });
        renderSlots();
        updateStats();
    });

    function updateStats() {
        let total = 0;
        Object.values(scheduleData).forEach(arr => total += arr.length);
        document.getElementById("planStats").textContent = `${total} clases planificadas`;
    }

    function cleanPrefix(val) {
        if (!val) return "";
        return val.replace(/^\s*([a-d]\)\s*)?(motivaci[oó]n\s*\/Stop|motivaci[oó]n|inicio|desarrollo|fijaci[oó]n\s*\/Stop|fijaci[oó]n|cierre|evaluaci[oó]n)[\s:]*/i, "").trim();
    }

    function renderSlots() {
        slotsContainer.innerHTML = "";
        const entries = scheduleData[activeDay] || [];

        if (entries.length === 0) {
            slotsContainer.innerHTML = `
                <div style="text-align: center; padding: 24px; color: #94A3B8;">
                    No hay bloques agregados para ${activeDay}. Haz clic en <strong>➕ Bloque</strong> para añadir uno.
                </div>
            `;
            return;
        }

        entries.forEach((entry, index) => {
            if (!entry.image_files) entry.image_files = [];

            const slotCard = document.createElement("div");
            slotCard.className = "slot-card";

            slotCard.innerHTML = `
                <div class="slot-header-bar">
                    <div class="slot-controls">
                        <input type="text" class="input-time" value="${entry.time_slot || '08:00 - 08:40 hs'}" placeholder="08:00 - 08:40 hs">
                        <select class="select-area">
                            <option value="COMUNICACIÓN" ${entry.area === "COMUNICACIÓN" ? "selected" : ""}>COMUNICACIÓN</option>
                            <option value="SALUD" ${entry.area === "SALUD" ? "selected" : ""}>SALUD</option>
                            <option value="CIENCIAS SOCIALES" ${entry.area === "CIENCIAS SOCIALES" ? "selected" : ""}>CIENCIAS SOCIALES</option>
                            <option value="CIENCIAS NATURALES" ${entry.area === "CIENCIAS NATURALES" ? "selected" : ""}>CIENCIAS NATURALES</option>
                            <option value="GUARANÍ" ${entry.area === "GUARANÍ" ? "selected" : ""}>GUARANÍ ÑE'Ẽ</option>
                            <option value="MATEMÁTICA" ${entry.area === "MATEMÁTICA" ? "selected" : ""}>MATEMÁTICA</option>
                            <option value="TRABAJO Y TECNOLOGÍA" ${entry.area === "TRABAJO Y TECNOLOGÍA" ? "selected" : ""}>TRABAJO Y TECNOLOGÍA</option>
                            <option value="EDUCACIÓN ARTÍSTICA (ARTES PLÁSTICAS)" ${entry.area.includes("ARTES") ? "selected" : ""}>ARTES PLÁSTICAS</option>
                            <option value="ÑE'ẼRY" ${entry.is_neery ? "selected" : ""}>📖 ÑE'ẼRY (TERTULIAS DIALÓGICAS)</option>
                            <option value="CLASE ESPECIALISTA" ${entry.is_special ? "selected" : ""}>🎨 CLASE ESPECIALISTA (Música/Inglés/Danza/Ed.Física)</option>
                        </select>
                    </div>
                    <div class="slot-actions">
                        ${!entry.is_special ? `<button type="button" class="btn-ai btn-gen-ai">✨ Generar con IA Gemini</button>` : ''}
                        <button type="button" class="btn-delete btn-del-slot">🗑️ Eliminar</button>
                    </div>
                </div>

                <div class="slot-body">
                    <div class="upload-box">
                        <span class="icon">📷</span>
                        <p><strong>Arrastra o selecciona 1 o más fotos</strong> del libro</p>
                        <input type="file" class="file-input" accept="image/*" multiple style="display: none;">
                        <div class="img-gallery"></div>
                    </div>

                    <div class="slot-fields">
                        <div class="form-group full">
                            <label>Indicaciones o Temas de la Lección (Notas):</label>
                            <input type="text" class="input-notes" value="${entry.prompt_notes || ''}" placeholder="Ej: Páginas 61 a 64 sobre Sexualidad Humana">
                        </div>
                        
                        ${!entry.is_special && !entry.is_neery ? `
                            <div class="form-group">
                                <label>Unidad Temática:</label>
                                <input type="text" class="input-unidad" value="${entry.unidad || ''}">
                            </div>
                            <div class="form-group">
                                <label>Tema:</label>
                                <input type="text" class="input-tema" value="${entry.tema || ''}">
                            </div>
                            <div class="form-group full">
                                <label>Capacidad:</label>
                                <textarea class="input-capacidad" rows="2">${entry.capacidad || ''}</textarea>
                            </div>
                            <div class="form-group full">
                                <label>Indicadores (uno por línea):</label>
                                <textarea class="input-indicadores" rows="3">${(entry.indicadores || []).join('\n')}</textarea>
                            </div>
                            <div class="form-group full">
                                <label>a) Motivación / Inicio:</label>
                                <textarea class="input-motivacion" rows="2">${entry.motivacion || ''}</textarea>
                            </div>
                            <div class="form-group full">
                                <label>b) Desarrollo:</label>
                                <textarea class="input-desarrollo" rows="2">${entry.desarrollo || ''}</textarea>
                            </div>
                            <div class="form-group full">
                                <label>Concluimos (Recuadro Síntesis):</label>
                                <input type="text" class="input-conclusion" value="${entry.conclusion || ''}">
                            </div>
                            <div class="form-group">
                                <label>c) Fijación / Cierre:</label>
                                <textarea class="input-fijacion" rows="2">${entry.fijacion || ''}</textarea>
                            </div>
                            <div class="form-group">
                                <label>d) Evaluación:</label>
                                <textarea class="input-evaluacion" rows="2">${entry.evaluacion || ''}</textarea>
                            </div>
                        ` : ''}

                        ${entry.is_neery ? `
                            <div class="form-group">
                                <label>Texto de la Tertulia:</label>
                                <input type="text" class="input-texto-neery" value="${entry.texto || '\'La vaca Nicolasa\' (de Marisa Moreno)'}">
                            </div>
                            <div class="form-group">
                                <label>Tiempo Estimado:</label>
                                <input type="text" class="input-tiempo-neery" value="${entry.tiempo || '10 minutos'}">
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            // Bind slot inputs
            const timeIn = slotCard.querySelector(".input-time");
            timeIn.addEventListener("input", e => entry.time_slot = e.target.value);

            const selectArea = slotCard.querySelector(".select-area");
            selectArea.addEventListener("change", e => {
                const val = e.target.value;
                entry.area = val;
                entry.is_special = (val === "CLASE ESPECIALISTA");
                entry.is_neery = (val === "ÑE'ẼRY");
                renderSlots();
            });

            const notesIn = slotCard.querySelector(".input-notes");
            notesIn.addEventListener("input", e => entry.prompt_notes = e.target.value);

            const uploadBox = slotCard.querySelector(".upload-box");
            const fileInput = slotCard.querySelector(".file-input");
            const imgGallery = slotCard.querySelector(".img-gallery");

            renderGallery();

            uploadBox.addEventListener("click", () => fileInput.click());
            uploadBox.addEventListener("dragover", e => e.preventDefault());
            uploadBox.addEventListener("drop", e => {
                e.preventDefault();
                if (e.dataTransfer.files.length) {
                    addFiles(Array.from(e.dataTransfer.files));
                }
            });

            fileInput.addEventListener("change", () => {
                if (fileInput.files.length) {
                    addFiles(Array.from(fileInput.files));
                }
            });

            function addFiles(files) {
                files.forEach(file => {
                    if (file.type.startsWith("image/")) {
                        entry.image_files.push(file);
                    }
                });
                renderGallery();
            }

            function renderGallery() {
                imgGallery.innerHTML = "";
                if (!entry.image_files || entry.image_files.length === 0) return;

                entry.image_files.forEach(file => {
                    const img = document.createElement("img");
                    img.className = "img-thumb";
                    const reader = new FileReader();
                    reader.onload = e => img.src = e.target.result;
                    reader.readAsDataURL(file);
                    imgGallery.appendChild(img);
                });
            }

            // Sync text fields
            ["unidad", "tema", "conclusion"].forEach(f => {
                const el = slotCard.querySelector(`.input-${f}`);
                if (el) el.addEventListener("input", e => entry[f] = e.target.value);
            });

            ["capacidad", "motivacion", "desarrollo", "fijacion", "evaluacion"].forEach(f => {
                const el = slotCard.querySelector(`.input-${f}`);
                if (el) el.addEventListener("input", e => entry[f] = e.target.value);
            });

            const indEl = slotCard.querySelector(".input-indicadores");
            if (indEl) {
                indEl.addEventListener("input", e => {
                    entry.indicadores = e.target.value.split('\n').filter(x => x.trim());
                });
            }

            // Delete slot
            slotCard.querySelector(".btn-del-slot").addEventListener("click", () => {
                scheduleData[activeDay].splice(index, 1);
                renderSlots();
                updateStats();
            });

            // AI Generation button (Client-Side Direct Call to Gemini API)
            const btnAi = slotCard.querySelector(".btn-gen-ai");
            if (btnAi) {
                btnAi.addEventListener("click", async () => {
                    const apiKey = apiKeyInput.value.trim();
                    if (!apiKey) {
                        alert("Por favor, ingresa tu Clave API de Gemini en la barra superior.");
                        apiModal.classList.add("show");
                        return;
                    }

                    const loaderOverlay = document.getElementById("loaderOverlay");
                    document.getElementById("loaderText").textContent = `Analizando ${entry.image_files.length > 0 ? entry.image_files.length + ' foto(s)' : 'las notas'} con la IA de Gemini...`;
                    loaderOverlay.classList.add("show");

                    try {
                        const parsedJson = await callGeminiApiDirect(apiKey, entry);
                        entry.unidad = parsedJson.unidad || "";
                        entry.tema = parsedJson.tema || "";
                        entry.capacidad = parsedJson.capacidad || "";
                        entry.indicadores = parsedJson.indicadores || [];
                        entry.motivacion = parsedJson.motivacion || "";
                        entry.desarrollo = parsedJson.desarrollo || "";
                        entry.conclusion = parsedJson.conclusion || "";
                        entry.fijacion = parsedJson.fijacion || "";
                        entry.evaluacion = parsedJson.evaluacion || "";

                        renderSlots();
                    } catch (err) {
                        alert(err.message);
                    } finally {
                        loaderOverlay.classList.remove("show");
                        document.getElementById("loaderText").textContent = "Procesando con la IA de Gemini...";
                    }
                });
            }

            slotsContainer.appendChild(slotCard);
        });
    }

    renderSlots();
    updateStats();

    // Helper: Convert File object to Base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const b64 = reader.result.split(',')[1];
                resolve(b64);
            };
            reader.onerror = error => reject(error);
        });
    }

    // Direct Gemini API Call Handler (Runs 100% in Browser)
    async function callGeminiApiDirect(apiKey, entry) {
        const parts = [];
        
        if (entry.image_files && entry.image_files.length) {
            for (const file of entry.image_files) {
                const b64 = await fileToBase64(file);
                const mimeType = file.type || "image/jpeg";
                parts.push({
                    inline_data: {
                        mime_type: mimeType,
                        data: b64
                    }
                });
            }
        }

        let userText = `Área curricular: ${entry.area}.\n`;
        if (entry.prompt_notes) userText += `Instrucciones o notas adicionales de la docente: ${entry.prompt_notes}\n`;
        userText += "Extrae y redacta la planificación completa en JSON consolidando la información de todas las fotos enviadas.";

        parts.push({ text: userText });

        const systemInstruction = `Actúas exactamente como una docente titular de Educación Escolar Básica (EEB) de 4º Grado en Paraguay, licenciada en educación y con vasta experiencia en el diseño de planificaciones semanales según lineamientos del MEC.
REGLAS CRÍTICAS DE ESTILO Y FORMATO:
1. CONCISIÓN Y PRECISIÓN: No te extiendas demasiado en ningún punto. Redacta frases cortas, directas, concretas y puntuales.
2. TONO Y LENGUAJE DOCENTE EEB (PARAGUAY): Utiliza la terminología pedagógica oficial del MEC de Paraguay (Capacidades concretas, Indicadores evaluables directos, ejercitarios en libro y cuaderno).
3. SIN PREFIJOS REPETIDOS: En los campos 'motivacion', 'desarrollo', 'fijacion' y 'evaluacion', redacta ÚNICAMENTE el contenido de la actividad, SIN incluir prefijos como 'a) Motivación', 'b) Desarrollo', 'c) Fijación' o 'd) Evaluación'.
4. FORMATO JSON ESTRICTO:
{
  "unidad": "Unidad Temática (concisa)",
  "tema": "Título exacto del Tema o lección",
  "capacidad": "Capacidad concreta en 1 frase (verbo en 3ª persona)",
  "indicadores": ["Indicador 1 concreto", "Indicador 2 concreto", "Indicador 3 concreto"],
  "motivacion": "Actividad breve de inicio/diálogo (1 o 2 frases cortas)",
  "desarrollo": "Explicación y lectura guiada indicando páginas del libro (2 o 3 frases breves)",
  "conclusion": "Síntesis en recuadro Concluimos (1 frase clara y puntual)",
  "fijacion": "Ejercitarios del libro o cuaderno (1 frase concisa)",
  "evaluacion": "Verificación del trabajo o revisión (1 frase concisa)"
}`;

        const payload = {
            contents: [{ parts: parts }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        };

        const modelsToTry = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-flash-latest"];
        let lastError = "";

        for (const model of modelsToTry) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
            try {
                const resp = await fetch(url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                const data = await resp.json();
                if (!resp.ok) {
                    lastError = data.error ? data.error.message : JSON.stringify(data);
                    continue;
                }

                let textResp = data.candidates[0].content.parts[0].text.trim();
                if (textResp.startsWith("```json")) textResp = textResp.substring(7);
                if (textResp.endsWith("```")) textResp = textResp.substring(0, textResp.length - 3);
                textResp = textResp.trim();

                return JSON.parse(textResp);
            } catch (e) {
                lastError = e.message;
            }
        }

        throw new Error(`Error al conectar con Gemini: ${lastError}`);
    }

    // Generación Client-Side de Word (.docx) usando docx.js (runs 100% in browser!)
    document.getElementById("btnGenerateDocx").addEventListener("click", async () => {
        if (!window.docx) {
            alert("Cargando motor de generación de Word... Intente de nuevo en unos segundos.");
            return;
        }

        const docenteName = document.getElementById("docenteName").value;
        const grado = document.getElementById("grado").value;
        const institucion = document.getElementById("institucion").value;
        const horarioGeneral = document.getElementById("horarioGeneral").value;
        const semanaTitulo = document.getElementById("semanaTitulo").value;

        const loaderOverlay = document.getElementById("loaderOverlay");
        document.getElementById("loaderText").textContent = "Generando archivo Word en tu dispositivo...";
        loaderOverlay.classList.add("show");

        try {
            const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, AlignmentType } = window.docx;

            const children = [];

            // Title
            children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [
                    new TextRun({ text: institucion.toUpperCase(), bold: true, size: 36, color: "1F4E78", font: "Arial" })
                ]
            }));

            children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                children: [
                    new TextRun({ text: semanaTitulo.toUpperCase(), bold: true, size: 26, color: "2F5597", font: "Arial" })
                ]
            }));

            // Header Table
            const infoTable = new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                shading: { fill: "F2F5F9" },
                                children: [new Paragraph({ children: [
                                    new TextRun({ text: "Docente: ", bold: true, size: 19, color: "1F4E78" }),
                                    new TextRun({ text: docenteName, size: 19 })
                                ]})]
                            }),
                            new TableCell({
                                shading: { fill: "FFFFFF" },
                                children: [new Paragraph({ children: [
                                    new TextRun({ text: "Grado: ", bold: true, size: 19, color: "1F4E78" }),
                                    new TextRun({ text: grado, size: 19 })
                                ]})]
                            })
                        ]
                    }),
                    new TableRow({
                        children: [
                            new TableCell({
                                shading: { fill: "FFFFFF" },
                                children: [new Paragraph({ children: [
                                    new TextRun({ text: "Institución: ", bold: true, size: 19, color: "1F4E78" }),
                                    new TextRun({ text: institucion, size: 19 })
                                ]})]
                            }),
                            new TableCell({
                                shading: { fill: "F2F5F9" },
                                children: [new Paragraph({ children: [
                                    new TextRun({ text: "Horario General: ", bold: true, size: 19, color: "1F4E78" }),
                                    new TextRun({ text: horarioGeneral, size: 19 })
                                ]})]
                            })
                        ]
                    })
                ]
            });
            children.push(infoTable);
            children.push(new Paragraph({ spacing: { after: 200 } }));

            // Loop Days
            for (const [dayName, entries] of Object.entries(scheduleData)) {
                if (!entries || entries.length === 0) continue;

                // Day Banner
                const dayTable = new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [new TableRow({
                        children: [new TableCell({
                            shading: { fill: "2F5597" },
                            children: [new Paragraph({ children: [
                                new TextRun({ text: `📌 ${dayName.toUpperCase()}`, bold: true, size: 24, color: "FFFFFF" })
                            ]})]
                        })]
                    })]
                });
                children.push(dayTable);
                children.push(new Paragraph({ spacing: { after: 100 } }));

                entries.forEach(entry => {
                    const timeSlot = entry.time_slot || "08:00 - 08:40 hs";
                    const area = entry.area || "COMUNICACIÓN";

                    if (entry.is_special) {
                        const specTable = new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [new TableRow({
                                children: [new TableCell({
                                    shading: { fill: "FFF2CC" },
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: `🎨 ${dayName.toUpperCase()} | ${timeSlot} — ${area.toUpperCase()}`, bold: true, size: 21, color: "964B00" })] }),
                                        new Paragraph({ children: [new TextRun({ text: "Clase a cargo de Docente Especialista de Área.", italic: true, size: 18, color: "643C00" })] })
                                    ]
                                })]
                            })]
                        });
                        children.push(specTable);
                        children.push(new Paragraph({ spacing: { after: 200 } }));
                        return;
                    }

                    if (entry.is_neery) {
                        const neeryTable = new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                new TableRow({
                                    children: [new TableCell({
                                        shading: { fill: "1F4E78" },
                                        children: [new Paragraph({ children: [new TextRun({ text: `📖 ${dayName.toUpperCase()}  |  ${timeSlot}  —  ÑE'ẼRY`, bold: true, size: 22, color: "FFFFFF" })] })]
                                    })]
                                })
                            ]
                        });
                        children.push(neeryTable);

                        const hTable = new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [
                                ["Área:", " Lengua Materna / Comunicación"],
                                ["Estrategia:", " Tertulias Literarias Dialógicas"],
                                ["Texto:", ` ${entry.texto || "'La vaca Nicolasa'"}`],
                                ["Espacio:", " Rincón de Lectura"],
                                ["Tiempo Estimado:", ` ${entry.tiempo || "10 minutos"}`]
                            ].map(([lbl, val], idx) => new TableRow({
                                children: [
                                    new TableCell({ shading: { fill: "F2F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: lbl, bold: true, size: 19, color: "1F4E78" })] })] }),
                                    new TableCell({ shading: { fill: "FFFFFF" }, children: [new Paragraph({ children: [new TextRun({ text: val, size: 19 })] })] })
                                ]
                            }))
                        });
                        children.push(hTable);
                        children.push(new Paragraph({ spacing: { after: 200 } }));
                        return;
                    }

                    // Standard Card
                    const cardHeaderTable = new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [new TableRow({
                            children: [new TableCell({
                                shading: { fill: "1F4E78" },
                                children: [new Paragraph({ children: [new TextRun({ text: `📅 ${dayName.toUpperCase()} | ${timeSlot} — ÁREA: ${area.toUpperCase()}`, bold: true, size: 22, color: "FFFFFF" })] })]
                            })]
                        })]
                    });
                    children.push(cardHeaderTable);

                    const metaTable = new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [
                            new TableRow({
                                children: [
                                    new TableCell({ shading: { fill: "F2F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Unidad Temática: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: entry.unidad || "", size: 19 })] })] }),
                                    new TableCell({ shading: { fill: "F2F5F9" }, children: [new Paragraph({ children: [new TextRun({ text: "Tema: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: entry.tema || "", size: 19 })] })] })
                                ]
                            }),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        shading: { fill: "FFFFFF" },
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "Capacidad:", bold: true, size: 20, color: "1F4E78" })] }),
                                            new Paragraph({ children: [new TextRun({ text: `• ${entry.capacidad || ''}`, size: 18 })] })
                                        ]
                                    }),
                                    new TableCell({
                                        shading: { fill: "FFFFFF" },
                                        children: [
                                            new Paragraph({ children: [new TextRun({ text: "Indicadores:", bold: true, size: 20, color: "1F4E78" })] }),
                                            ...(entry.indicadores || []).map(ind => new Paragraph({ children: [new TextRun({ text: `• ${ind}`, size: 18 })] }))
                                        ]
                                    })
                                ]
                            })
                        ]
                    });
                    children.push(metaTable);

                    // Momentos Didácticos
                    const momParas = [
                        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Momentos Didácticos:", bold: true, size: 21, color: "1F4E78" })] }),
                        new Paragraph({ children: [new TextRun({ text: "a) Motivación / Inicio: ", bold: true, size: 19 }), new TextRun({ text: cleanPrefix(entry.motivacion), size: 19 })] }),
                        new Paragraph({ children: [new TextRun({ text: "b) Desarrollo: ", bold: true, size: 19 }), new TextRun({ text: cleanPrefix(entry.desarrollo), size: 19 })] })
                    ];

                    if (entry.conclusion) {
                        const concTable = new Table({
                            width: { size: 100, type: WidthType.PERCENTAGE },
                            rows: [new TableRow({
                                children: [new TableCell({
                                    shading: { fill: "EBF1F5" },
                                    children: [new Paragraph({ children: [new TextRun({ text: "Concluimos: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: entry.conclusion, size: 19 })] })]
                                })]
                            })]
                        });
                        momParas.push(concTable);
                    }

                    momParas.push(new Paragraph({ children: [new TextRun({ text: "c) Fijación / Cierre: ", bold: true, size: 19 }), new TextRun({ text: cleanPrefix(entry.fijacion), size: 19 })] }));
                    momParas.push(new Paragraph({ children: [new TextRun({ text: "d) Evaluación: ", bold: true, size: 19 }), new TextRun({ text: cleanPrefix(entry.evaluacion), size: 19 })] }));

                    const momBox = new Table({
                        width: { size: 100, type: WidthType.PERCENTAGE },
                        rows: [new TableRow({
                            children: [new TableCell({ shading: { fill: "FAFAFA" }, children: momParas })]
                        })]
                    });
                    children.push(momBox);
                    children.push(new Paragraph({ spacing: { after: 200 } }));
                });
            }

            const doc = new Document({
                sections: [{
                    properties: {
                        page: {
                            margin: { top: 1008, bottom: 1008, left: 1008, right: 1008 }
                        }
                    },
                    children: children
                }]
            });

            const blob = await Packer.toBlob(doc);
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `${semanaTitulo.replace(/[^a-zA-Z0-9]/g, "_")}.docx`;
            document.body.appendChild(a);
            a.click();
            a.remove();

        } catch (err) {
            alert("Error al compilar el documento Word: " + err.message);
        } finally {
            loaderOverlay.classList.remove("show");
            document.getElementById("loaderText").textContent = "Procesando con la IA de Gemini...";
        }
    });
});

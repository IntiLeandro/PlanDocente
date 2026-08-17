document.addEventListener("DOMContentLoaded", () => {
    const apiKeyInput = document.getElementById("apiKey");
    const apiModal = document.getElementById("apiModal");
    const btnHelpApi = document.getElementById("btnHelpApi");
    const btnCloseModal = document.getElementById("btnCloseModal");
    const btnGotIt = document.getElementById("btnGotIt");

    // Cargar la API Key desde el almacenamiento local del navegador (LocalStorage)
    const savedApiKey = localStorage.getItem("plandocente_gemini_key") || "";
    if (apiKeyInput && savedApiKey) {
        apiKeyInput.value = savedApiKey;
    }

    if (apiKeyInput) {
        apiKeyInput.addEventListener("input", (e) => {
            localStorage.setItem("plandocente_gemini_key", e.target.value.trim());
        });
    }

    // Modal behavior
    if (btnHelpApi) btnHelpApi.addEventListener("click", () => apiModal.classList.add("show"));
    if (btnCloseModal) btnCloseModal.addEventListener("click", () => apiModal.classList.remove("show"));
    if (btnGotIt) btnGotIt.addEventListener("click", () => apiModal.classList.remove("show"));

    let activeDay = "Lunes";

    // Horarios predeterminados con campos de notas LIMPIOS Y VACÍOS
    const defaultSchedule = {
        "Lunes": [
            { time_slot: "08:00 - 08:40 hs", area: "COMUNICACIÓN", prompt_notes: "", image_files: [] },
            { time_slot: "08:40 - 09:30 hs", area: "SALUD", prompt_notes: "", image_files: [] },
            { time_slot: "09:50 - 10:20 hs", area: "CIENCIAS SOCIALES", prompt_notes: "", image_files: [] },
            { time_slot: "10:20 - 10:50 hs", area: "GUARANÍ", prompt_notes: "", image_files: [] },
            { time_slot: "10:50 - 11:30 hs", area: "MATEMÁTICA", prompt_notes: "", image_files: [] },
            { time_slot: "11:30 - 12:00 hs", area: "TRABAJO Y TECNOLOGÍA", prompt_notes: "", image_files: [] }
        ],
        "Martes": [
            { time_slot: "08:00 - 08:40 hs", area: "COMUNICACIÓN", prompt_notes: "", image_files: [] },
            { time_slot: "08:40 - 09:30 hs", area: "CIENCIAS SOCIALES", prompt_notes: "", image_files: [] },
            { time_slot: "09:50 - 10:10 hs", area: "SALUD", prompt_notes: "", image_files: [] },
            { time_slot: "10:50 - 11:30 hs", area: "MATEMÁTICA", prompt_notes: "", image_files: [] },
            { time_slot: "11:30 - 12:00 hs", area: "CIENCIAS NATURALES", prompt_notes: "", image_files: [] }
        ],
        "Miércoles": [
            { time_slot: "08:40 - 09:30 hs", area: "TRABAJO Y TECNOLOGÍA", prompt_notes: "", image_files: [] },
            { time_slot: "09:50 - 10:30 hs", area: "MATEMÁTICA", prompt_notes: "", image_files: [] },
            { time_slot: "10:30 - 10:50 hs", area: "GUARANÍ", prompt_notes: "", image_files: [] },
            { time_slot: "11:20 - 12:00 hs", area: "COMUNICACIÓN", prompt_notes: "", image_files: [] }
        ],
        "Jueves": [
            { time_slot: "09:50 - 10:20 hs", area: "CIENCIAS NATURALES", prompt_notes: "", image_files: [] },
            { time_slot: "10:20 - 10:50 hs", area: "SALUD", prompt_notes: "", image_files: [] },
            { time_slot: "10:50 - 11:30 hs", area: "COMUNICACIÓN", prompt_notes: "", image_files: [] },
            { time_slot: "11:30 - 12:00 hs", area: "MATEMÁTICA", prompt_notes: "", image_files: [] }
        ],
        "Viernes": [
            { time_slot: "08:40 - 09:30 hs", area: "EDUCACIÓN ARTÍSTICA (ARTES PLÁSTICAS)", prompt_notes: "", image_files: [] },
            { time_slot: "09:50 - 10:00 hs", area: "ÑE'ẼRY", is_neery: true, texto: "", tiempo: "10 minutos", image_files: [] },
            { time_slot: "10:00 - 11:00 hs", area: "COMUNICACIÓN", prompt_notes: "", image_files: [] },
            { time_slot: "11:00 - 12:00 hs", area: "MATEMÁTICA", prompt_notes: "", image_files: [] }
        ]
    };

    let scheduleData = JSON.parse(JSON.stringify(defaultSchedule));

    // Cargar borrador de planificaciones si existe
    loadDraft();

    function saveDraft() {
        try {
            const clone = JSON.parse(JSON.stringify(scheduleData));
            Object.values(clone).forEach(arr => {
                arr.forEach(entry => {
                    delete entry.image_files;
                });
            });
            localStorage.setItem("plandocente_schedule_draft", JSON.stringify(clone));
        } catch (e) {
            console.error("Draft save error", e);
        }
    }

    function loadDraft() {
        const saved = localStorage.getItem("plandocente_schedule_draft");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed && typeof parsed === "object") {
                    scheduleData = parsed;
                    Object.values(scheduleData).forEach(arr => {
                        arr.forEach(entry => {
                            if (!entry.image_files) entry.image_files = [];
                        });
                    });
                }
            } catch (e) {
                console.error("Draft load error", e);
            }
        }
    }

    // Botones para Limpiar Texto sin borrar bloques de horarios
    const btnClearDayText = document.getElementById("btnClearDayText");
    if (btnClearDayText) {
        btnClearDayText.addEventListener("click", () => {
            if (confirm(`¿Deseas vaciar los textos redactados de ${activeDay}? Tus bloques de horarios y materias se mantendrán intactos.`)) {
                (scheduleData[activeDay] || []).forEach(entry => {
                    entry.unidad = "";
                    entry.tema = "";
                    entry.capacidad = "";
                    entry.indicadores = [];
                    entry.motivacion = "";
                    entry.desarrollo = "";
                    entry.conclusion = "";
                    entry.fijacion = "";
                    entry.evaluacion = "";
                    entry.prompt_notes = "";
                    entry.image_files = [];
                    if (entry.is_neery) {
                        entry.texto = "";
                        entry.neery_preparacion = "";
                        entry.neery_lectura = "";
                        entry.neery_dialogo = [];
                        entry.neery_cierre = "";
                    }
                });
                saveDraft();
                renderSlots();
            }
        });
    }

    const btnClearAllText = document.getElementById("btnClearAllText");
    if (btnClearAllText) {
        btnClearAllText.addEventListener("click", () => {
            if (confirm("¿Deseas vaciar todos los textos redactados de los 5 días para iniciar la planificación de una NUEVA SEMANA? Se conservarán todas las materias y horarios intactos.")) {
                Object.values(scheduleData).forEach(arr => {
                    arr.forEach(entry => {
                        entry.unidad = "";
                        entry.tema = "";
                        entry.capacidad = "";
                        entry.indicadores = [];
                        entry.motivacion = "";
                        entry.desarrollo = "";
                        entry.conclusion = "";
                        entry.fijacion = "";
                        entry.evaluacion = "";
                        entry.prompt_notes = "";
                        entry.image_files = [];
                        if (entry.is_neery) {
                            entry.texto = "";
                            entry.neery_preparacion = "";
                            entry.neery_lectura = "";
                            entry.neery_dialogo = [];
                            entry.neery_cierre = "";
                        }
                    });
                });
                saveDraft();
                renderSlots();
                alert("¡Campos vaciados con éxito! Listo para redactar la nueva semana. 🚀");
            }
        });
    }

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
        saveDraft();
        renderSlots();
        updateStats();
    });

    // Botón para generar TODAS las clases del día activo (Incluyendo Ñe'ẽry)
    document.getElementById("btnGenAllDay").addEventListener("click", async () => {
        const userKey = apiKeyInput ? apiKeyInput.value.trim() : "";
        if (!userKey) {
            alert("Por favor ingresa tu Clave API de Gemini en la casilla superior para continuar.");
            if (apiModal) apiModal.classList.add("show");
            return;
        }

        const entries = scheduleData[activeDay] || [];
        const processable = entries.filter(e => !e.is_special);

        if (processable.length === 0) {
            alert(`No hay clases configurables para procesar en el día ${activeDay}.`);
            return;
        }

        const loaderOverlay = document.getElementById("loaderOverlay");
        loaderOverlay.classList.add("show");

        let count = 0;
        for (const entry of processable) {
            count++;
            document.getElementById("loaderText").textContent = `Procesando lección ${count} de ${processable.length} (${entry.area}) con IA Gemini...`;

            try {
                const parsedJson = await callGeminiApiDirect(userKey, entry);
                if (entry.is_neery) {
                    entry.texto = parsedJson.texto || entry.texto || "";
                    entry.tiempo = parsedJson.tiempo || entry.tiempo || "10 minutos";
                    entry.neery_preparacion = parsedJson.neery_preparacion || "";
                    entry.neery_lectura = parsedJson.neery_lectura || "";
                    entry.neery_dialogo = parsedJson.neery_dialogo || [];
                    entry.neery_cierre = parsedJson.neery_cierre || "";
                } else {
                    entry.unidad = parsedJson.unidad || "";
                    entry.tema = parsedJson.tema || "";
                    entry.capacidad = parsedJson.capacidad || "";
                    entry.indicadores = parsedJson.indicadores || [];
                    entry.motivacion = parsedJson.motivacion || "";
                    entry.desarrollo = parsedJson.desarrollo || "";
                    entry.conclusion = parsedJson.conclusion || "";
                    entry.fijacion = parsedJson.fijacion || "";
                    entry.evaluacion = parsedJson.evaluacion || "";
                }
                saveDraft();
                renderSlots();
            } catch (err) {
                alert(`Error en ${entry.area}: ` + err.message);
            }

            if (count < processable.length) {
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        loaderOverlay.classList.remove("show");
        document.getElementById("loaderText").textContent = "Procesando con la IA de Gemini...";
        alert(`¡Procesamiento de ${activeDay} completado! 🎉`);
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
                        <p><strong>Fotos del libro de texto / lección</strong></p>
                        <div class="upload-actions">
                            <button type="button" class="btn-upload-opt btn-take-photo">📷 Tomar Foto</button>
                            <button type="button" class="btn-upload-opt btn-choose-gallery">🖼️ Elejir de Galería</button>
                        </div>
                        <input type="file" class="file-input-cam" accept="image/*" capture="environment" style="display: none;">
                        <input type="file" class="file-input-gal" accept="image/*" multiple style="display: none;">
                        <div class="img-gallery"></div>
                    </div>

                    <div class="slot-fields">
                        <div class="form-group full">
                            <label>Indicaciones o Temas (Opcional):</label>
                            <input type="text" class="input-notes" value="${entry.prompt_notes || ''}" placeholder="Dejar vacío o escribir aclaración opcional...">
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
                            <div class="form-group full">
                                <label>Texto / Cuento / Poesía (Se extrae de la foto o se escribe aquí):</label>
                                <input type="text" class="input-texto-neery" value="${entry.texto || ''}" placeholder="Ej: 'Enrique y el reloj'">
                            </div>
                            <div class="form-group full">
                                <label>Tiempo Estimado:</label>
                                <input type="text" class="input-tiempo-neery" value="${entry.tiempo || '10 minutos'}">
                            </div>
                            <div class="form-group full">
                                <label>1. Preparación:</label>
                                <textarea class="input-neery-prep" rows="2">${entry.neery_preparacion || ''}</textarea>
                            </div>
                            <div class="form-group full">
                                <label>2. Lectura:</label>
                                <textarea class="input-neery-lect" rows="2">${entry.neery_lectura || ''}</textarea>
                            </div>
                            <div class="form-group full">
                                <label>3. Diálogo e Intercambio (Preguntas generadas por IA):</label>
                                <textarea class="input-neery-dial" rows="3">${(entry.neery_dialogo || []).join('\n')}</textarea>
                            </div>
                            <div class="form-group full">
                                <label>4. Cierre (Idea compartida):</label>
                                <textarea class="input-neery-cierre" rows="2">${entry.neery_cierre || ''}</textarea>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;

            // Bind slot inputs
            const timeIn = slotCard.querySelector(".input-time");
            timeIn.addEventListener("input", e => { entry.time_slot = e.target.value; saveDraft(); });

            const selectArea = slotCard.querySelector(".select-area");
            selectArea.addEventListener("change", e => {
                const val = e.target.value;
                entry.area = val;
                entry.is_special = (val === "CLASE ESPECIALISTA");
                entry.is_neery = (val === "ÑE'ẼRY");
                saveDraft();
                renderSlots();
            });

            const notesIn = slotCard.querySelector(".input-notes");
            notesIn.addEventListener("input", e => { entry.prompt_notes = e.target.value; saveDraft(); });

            if (entry.is_neery) {
                const txtNeery = slotCard.querySelector(".input-texto-neery");
                if (txtNeery) txtNeery.addEventListener("input", e => { entry.texto = e.target.value; saveDraft(); });

                const tmpNeery = slotCard.querySelector(".input-tiempo-neery");
                if (tmpNeery) tmpNeery.addEventListener("input", e => { entry.tiempo = e.target.value; saveDraft(); });

                const prepNeery = slotCard.querySelector(".input-neery-prep");
                if (prepNeery) prepNeery.addEventListener("input", e => { entry.neery_preparacion = e.target.value; saveDraft(); });

                const lectNeery = slotCard.querySelector(".input-neery-lect");
                if (lectNeery) lectNeery.addEventListener("input", e => { entry.neery_lectura = e.target.value; saveDraft(); });

                const dialNeery = slotCard.querySelector(".input-neery-dial");
                if (dialNeery) dialNeery.addEventListener("input", e => { entry.neery_dialogo = e.target.value.split('\n').filter(x=>x.trim()); saveDraft(); });

                const cierreNeery = slotCard.querySelector(".input-neery-cierre");
                if (cierreNeery) cierreNeery.addEventListener("input", e => { entry.neery_cierre = e.target.value; saveDraft(); });
            }

            const btnTakePhoto = slotCard.querySelector(".btn-take-photo");
            const btnChooseGallery = slotCard.querySelector(".btn-choose-gallery");
            const fileInputCam = slotCard.querySelector(".file-input-cam");
            const fileInputGal = slotCard.querySelector(".file-input-gal");
            const imgGallery = slotCard.querySelector(".img-gallery");

            renderGallery();

            if (btnTakePhoto) btnTakePhoto.addEventListener("click", () => fileInputCam.click());
            if (btnChooseGallery) btnChooseGallery.addEventListener("click", () => fileInputGal.click());

            fileInputCam.addEventListener("change", () => {
                if (fileInputCam.files.length) {
                    addFiles(Array.from(fileInputCam.files));
                    fileInputCam.value = "";
                }
            });

            fileInputGal.addEventListener("change", () => {
                if (fileInputGal.files.length) {
                    addFiles(Array.from(fileInputGal.files));
                    fileInputGal.value = "";
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

                entry.image_files.forEach((file, fIdx) => {
                    const wrapper = document.createElement("div");
                    wrapper.className = "thumb-wrapper";
                    wrapper.style.width = "64px";
                    wrapper.style.height = "64px";

                    const img = document.createElement("img");
                    img.className = "thumb-img img-thumb";
                    img.style.width = "64px";
                    img.style.height = "64px";
                    img.style.objectFit = "cover";
                    img.style.borderRadius = "8px";

                    const reader = new FileReader();
                    reader.onload = e => img.src = e.target.result;
                    reader.readAsDataURL(file);

                    const btnRemove = document.createElement("button");
                    btnRemove.type = "button";
                    btnRemove.className = "btn-remove-thumb";
                    btnRemove.innerHTML = "&times;";
                    btnRemove.title = "Eliminar esta foto";
                    btnRemove.addEventListener("click", (e) => {
                        e.stopPropagation();
                        entry.image_files.splice(fIdx, 1);
                        renderGallery();
                    });

                    wrapper.appendChild(img);
                    wrapper.appendChild(btnRemove);
                    imgGallery.appendChild(wrapper);
                });
            }

            // Sync text fields
            ["unidad", "tema", "conclusion"].forEach(f => {
                const el = slotCard.querySelector(`.input-${f}`);
                if (el) el.addEventListener("input", e => { entry[f] = e.target.value; saveDraft(); });
            });

            ["capacidad", "motivacion", "desarrollo", "fijacion", "evaluacion"].forEach(f => {
                const el = slotCard.querySelector(`.input-${f}`);
                if (el) el.addEventListener("input", e => { entry[f] = e.target.value; saveDraft(); });
            });

            const indEl = slotCard.querySelector(".input-indicadores");
            if (indEl) {
                indEl.addEventListener("input", e => {
                    entry.indicadores = e.target.value.split('\n').filter(x => x.trim());
                    saveDraft();
                });
            }

            // Delete slot
            slotCard.querySelector(".btn-del-slot").addEventListener("click", () => {
                scheduleData[activeDay].splice(index, 1);
                saveDraft();
                renderSlots();
                updateStats();
            });

            // AI Generation button
            const btnAi = slotCard.querySelector(".btn-gen-ai");
            if (btnAi) {
                btnAi.addEventListener("click", async () => {
                    const userKey = apiKeyInput ? apiKeyInput.value.trim() : "";
                    if (!userKey) {
                        alert("Por favor ingresa tu Clave API de Gemini en la casilla superior para continuar.");
                        if (apiModal) apiModal.classList.add("show");
                        return;
                    }

                    const loaderOverlay = document.getElementById("loaderOverlay");
                    document.getElementById("loaderText").textContent = `Analizando ${entry.image_files.length > 0 ? entry.image_files.length + ' foto(s)' : 'las notas'} con la IA de Gemini...`;
                    loaderOverlay.classList.add("show");

                    try {
                        const parsedJson = await callGeminiApiDirect(userKey, entry);
                        if (entry.is_neery) {
                            entry.texto = parsedJson.texto || entry.texto || "";
                            entry.tiempo = parsedJson.tiempo || entry.tiempo || "10 minutos";
                            entry.neery_preparacion = parsedJson.neery_preparacion || "";
                            entry.neery_lectura = parsedJson.neery_lectura || "";
                            entry.neery_dialogo = parsedJson.neery_dialogo || [];
                            entry.neery_cierre = parsedJson.neery_cierre || "";
                        } else {
                            entry.unidad = parsedJson.unidad || "";
                            entry.tema = parsedJson.tema || "";
                            entry.capacidad = parsedJson.capacidad || "";
                            entry.indicadores = parsedJson.indicadores || [];
                            entry.motivacion = parsedJson.motivacion || "";
                            entry.desarrollo = parsedJson.desarrollo || "";
                            entry.conclusion = parsedJson.conclusion || "";
                            entry.fijacion = parsedJson.fijacion || "";
                            entry.evaluacion = parsedJson.evaluacion || "";
                        }

                        saveDraft();
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

    // Consulta dinámicamente los modelos válidos disponibles para la clave ingresada
    async function fetchValidGeminiModels(apiKey) {
        // Lista prioritario de modelos estándar de producción
        const preferredModels = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash-8b"];
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;
        try {
            const resp = await fetch(url);
            if (!resp.ok) return preferredModels;
            const data = await resp.json();
            const validModels = [];
            if (data.models && Array.isArray(data.models)) {
                for (const m of data.models) {
                    if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes("generateContent")) {
                        let name = m.name || "";
                        if (name.startsWith("models/")) name = name.substring(7);
                        // Filtrar modelos experimentales o de solo Interacciones que causan HTTP 400
                        if (!name.includes("thinking") && !name.includes("exp") && !name.includes("preview")) {
                            validModels.push(name);
                        }
                    }
                }
            }
            const flashModels = validModels.filter(m => m.includes("flash"));
            const otherModels = validModels.filter(m => !m.includes("flash"));
            const combined = [...preferredModels, ...flashModels, ...otherModels];
            const uniqueModels = Array.from(new Set(combined));
            return uniqueModels.length > 0 ? uniqueModels : preferredModels;
        } catch (e) {
            return preferredModels;
        }
    }

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
        if (entry.prompt_notes && entry.prompt_notes.trim()) {
            userText += `Instrucciones o notas adicionales de la docente: ${entry.prompt_notes.trim()}\n`;
        }

        let systemInstruction = "";

        if (entry.is_neery) {
            userText += "Extrae el título de la lectura/cuento/poesía de las fotos enviadas o notas y redacta los 4 pasos completos del desarrollo de la Tertulia Literaria Dialógica según los personajes y la trama del texto.";
            systemInstruction = `Actúas exactamente como una docente titular de EEB de 4º Grado en Paraguay.
REGLAS PARA ESTRATEGIA ÑE'ẼRY (Tertulias Literarias Dialógicas):
Analiza la foto enviada y genera la estructura didáctica completa:
FORMATO JSON ESTRICTO:
{
  "texto": "Título exacto de la lectura o cuento entre comillas (ejemplo: 'Enrique y el reloj')",
  "tiempo": "10 minutos",
  "neery_preparacion": "Los estudiantes se sientan en un círculo o semicírculo en el Rincón de Lectura. Se recuerdan brevemente los acuerdos: pedir la palabra, escuchar con atención, respetar las opiniones de los demás y participar con confianza.",
  "neery_lectura": "La docente realiza la lectura en voz alta del texto. Durante la lectura, los niños y niñas van pensando en la parte que más les llamó la atención o les hizo recordar alguna vivencia personal.",
  "neery_dialogo": [
    "Recontado e identificación de elementos: ¿Qué le pasó al personaje principal y cómo actuó?",
    "Conexión con experiencias personales: ¿Alguna vez vivieron una situación similar a la del texto? ¿Cómo se sintieron?",
    "Apoyo y solidaridad / Dilema moral: ¿Qué valores nos enseña la actitud de los personajes ante el conflicto?",
    "Valoración y respeto: Se escucha atentamente a cada participante y se valoran sus intervenciones sin juzgar."
  ],
  "neery_cierre": "Se elabora una idea compartida entre todos relacionada a la enseñanza principal del cuento. Se felicita al grupo por su participación activa y por respetar los turnos de habla."
}`;
        } else {
            userText += "Extrae y redacta la planificación didáctica completa en JSON analizando la información de las fotos enviadas.";
            systemInstruction = `Actúas exactamente como una docente titular de Educación Escolar Básica (EEB) de 4º Grado en Paraguay, licenciada en educación y con vasta experiencia en el diseño de planificaciones semanales según lineamientos del MEC.
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
        }

        const payload = {
            contents: [{ parts: parts }],
            systemInstruction: { parts: [{ text: systemInstruction }] },
            generationConfig: {
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        };

        const modelsToTry = await fetchValidGeminiModels(apiKey);
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
                    const errDetail = data.error ? data.error.message : JSON.stringify(data);
                    lastError = `[HTTP ${resp.status}] ${errDetail}`;
                    // Ignorar modelos que devuelvan error de Interactions API o incompatibles y saltar al siguiente modelo estándar
                    if (errDetail.includes("Interactions API") || resp.status === 400) {
                        continue;
                    }
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

        throw new Error(`Error de Google Gemini API: ${lastError}`);
    }

    // Generación Client-Side de Word (.docx) usando docx.js con UNA SOLA TABLA UNIFICADA DE 4 FILAS
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

            const borderLight = { style: BorderStyle.SINGLE, size: 4, color: "B0C4DE" };
            const borderDark = { style: BorderStyle.SINGLE, size: 6, color: "2F5597" };

            const children = [];

            // Title
            children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                children: [
                    new TextRun({ text: institucion.toUpperCase(), bold: true, size: 36, color: "1F4E78", font: "Arial" })
                ]
            }));

            children.push(new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 180 },
                children: [
                    new TextRun({ text: semanaTitulo.toUpperCase(), bold: true, size: 26, color: "2F5597", font: "Arial" })
                ]
            }));

            // Header Table (Datos Informativos)
            const infoTable = new Table({
                width: { size: 9890, type: WidthType.DXA },
                columnWidths: [4945, 4945],
                borders: {
                    top: borderLight, bottom: borderLight, left: borderLight, right: borderLight,
                    insideHorizontal: borderLight, insideVertical: borderLight
                },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                width: { size: 4945, type: WidthType.DXA },
                                shading: { fill: "F2F5F9" },
                                margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                children: [new Paragraph({ children: [
                                    new TextRun({ text: "Docente: ", bold: true, size: 19, color: "1F4E78" }),
                                    new TextRun({ text: docenteName, size: 19 })
                                ]})]
                            }),
                            new TableCell({
                                width: { size: 4945, type: WidthType.DXA },
                                shading: { fill: "FFFFFF" },
                                margins: { top: 100, bottom: 100, left: 150, right: 150 },
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
                                width: { size: 4945, type: WidthType.DXA },
                                shading: { fill: "FFFFFF" },
                                margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                children: [new Paragraph({ children: [
                                    new TextRun({ text: "Institución: ", bold: true, size: 19, color: "1F4E78" }),
                                    new TextRun({ text: institucion, size: 19 })
                                ]})]
                            }),
                            new TableCell({
                                width: { size: 4945, type: WidthType.DXA },
                                shading: { fill: "F2F5F9" },
                                margins: { top: 100, bottom: 100, left: 150, right: 150 },
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
            children.push(new Paragraph({ spacing: { after: 180 } }));

            // Loop Days
            for (const [dayName, entries] of Object.entries(scheduleData)) {
                if (!entries || entries.length === 0) continue;

                // Day Banner Table
                const dayTable = new Table({
                    width: { size: 9890, type: WidthType.DXA },
                    columnWidths: [9890],
                    borders: { top: borderDark, bottom: borderDark, left: borderDark, right: borderDark },
                    rows: [new TableRow({
                        children: [new TableCell({
                            width: { size: 9890, type: WidthType.DXA },
                            shading: { fill: "2F5597" },
                            margins: { top: 100, bottom: 100, left: 150, right: 150 },
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
                            width: { size: 9890, type: WidthType.DXA },
                            columnWidths: [9890],
                            borders: { top: { style: BorderStyle.SINGLE, size: 8, color: "D6B656" }, bottom: { style: BorderStyle.SINGLE, size: 8, color: "D6B656" }, left: { style: BorderStyle.SINGLE, size: 8, color: "D6B656" }, right: { style: BorderStyle.SINGLE, size: 8, color: "D6B656" } },
                            rows: [new TableRow({
                                children: [new TableCell({
                                    width: { size: 9890, type: WidthType.DXA },
                                    shading: { fill: "FFF2CC" },
                                    margins: { top: 100, bottom: 100, left: 150, right: 150 },
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: `🎨 ${dayName.toUpperCase()}  |  ${timeSlot}  —  ${area.toUpperCase()}`, bold: true, size: 21, color: "964B00" })] }),
                                        new Paragraph({ children: [new TextRun({ text: "Clase a cargo de Docente Especialista de Área. (No requiere desarrollo de planificación en la carpeta didáctica).", italic: true, size: 18, color: "643C00" })] })
                                    ]
                                })]
                            })]
                        });
                        children.push(specTable);
                        children.push(new Paragraph({ spacing: { after: 180 } }));
                        return;
                    }

                    if (entry.is_neery) {
                        const neeryText = entry.texto || "'Enrique y el reloj'";
                        const neeryPrep = entry.neery_preparacion || "Los estudiantes se sientan en un círculo o semicírculo en el Rincón de Lectura. Se recuerdan brevemente los acuerdos: pedir la palabra, escuchar con atención, respetar las opiniones de los demás y participar con confianza.";
                        const neeryLect = entry.neery_lectura || `La docente realiza la lectura en voz alta del texto ${neeryText}. Durante la lectura, los niños y niñas van pensando en la parte que más les llamó la atención o les hizo recordar alguna vivencia personal.`;
                        const neeryDial = entry.neery_dialogo && entry.neery_dialogo.length > 0 ? entry.neery_dialogo : [
                            "Recontado e identificación de elementos: ¿Qué le pasó al personaje principal y cómo actuó?",
                            "Conexión con experiencias personales: ¿Alguna vez vivieron una situación similar a la del texto? ¿Cómo se sintieron?",
                            "Apoyo y solidaridad: ¿Qué valores nos enseña la actitud de los personajes ante el conflicto?",
                            "Valoración y respeto: Se escucha atentamente a cada participante y se valoran sus intervenciones sin juzgar."
                        ];
                        const neeryCierre = entry.neery_cierre || "Se elabora una idea compartida entre todos relacionada al texto leído. Se felicita al grupo por su participación activa y por respetar los turnos de habla.";

                        const neeryCardTable = new Table({
                            width: { size: 9890, type: WidthType.DXA },
                            columnWidths: [2967, 6923],
                            borders: { top: borderDark, bottom: borderDark, left: borderDark, right: borderDark, insideHorizontal: borderLight, insideVertical: borderLight },
                            rows: [
                                // Row 0: Banner Header
                                new TableRow({
                                    children: [new TableCell({
                                        columnSpan: 2,
                                        width: { size: 9890, type: WidthType.DXA },
                                        shading: { fill: "1F4E78" },
                                        margins: { top: 120, bottom: 120, left: 150, right: 150 },
                                        children: [new Paragraph({ children: [new TextRun({ text: `📖 ${dayName.toUpperCase()}  |  ${timeSlot}  —  ÑE'ẼRY`, bold: true, size: 22, color: "FFFFFF" })] })]
                                    })]
                                }),
                                // Header rows
                                ...[
                                    ["Área:", " Lengua Materna / Comunicación (Lectura, Escritura y Oralidad)"],
                                    ["Estrategia:", " Tertulias Literarias Dialógicas"],
                                    ["Texto:", ` ${neeryText}`],
                                    ["Espacio:", " Rincón de Lectura"],
                                    ["Tiempo Estimado:", ` ${entry.tiempo || "10 minutos"}`]
                                ].map(([lbl, val]) => new TableRow({
                                    children: [
                                        new TableCell({ width: { size: 2967, type: WidthType.DXA }, shading: { fill: "F2F5F9" }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: lbl, bold: true, size: 19, color: "1F4E78" })] })] }),
                                        new TableCell({ width: { size: 6923, type: WidthType.DXA }, shading: { fill: "FFFFFF" }, margins: { top: 60, bottom: 60, left: 100, right: 100 }, children: [new Paragraph({ children: [new TextRun({ text: val, size: 19 })] })] })
                                    ]
                                })),
                                // Row 6: Desarrollo de la Tertulia Literaria Dialógica (columnSpan: 2)
                                new TableRow({
                                    children: [new TableCell({
                                        columnSpan: 2,
                                        width: { size: 9890, type: WidthType.DXA },
                                        shading: { fill: "FFFFFF" },
                                        margins: { top: 120, bottom: 120, left: 150, right: 150 },
                                        children: [
                                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 100 }, children: [new TextRun({ text: "Desarrollo de la Tertulia Literaria Dialógica:", bold: true, size: 21, color: "1F4E78" })] }),
                                            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "1. Preparación: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: neeryPrep, size: 19 })] }),
                                            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "2. Lectura: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: neeryLect, size: 19 })] }),
                                            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "3. Diálogo e Intercambio: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: "El docente actúa como moderador/facilitador, dando la palabra y lanzando preguntas abiertas para la discusión:", size: 19 })] }),
                                            ...neeryDial.map(q => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `   • ${q}`, size: 18 })] })),
                                            new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "4. Cierre: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: neeryCierre, size: 19 })] })
                                        ]
                                    })]
                                })
                            ]
                        });
                        children.push(neeryCardTable);
                        children.push(new Paragraph({ spacing: { after: 180 } }));
                        return;
                    }

                    // Standard Card (UNA SOLA TABLA UNIFICADA DE 4 FILAS CON RECUADRO CONCLUIMOS RESALTADO 100% COMPATIBLE)
                    const momParas = [
                        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Momentos Didácticos:", bold: true, size: 21, color: "1F4E78" })] }),
                        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "a) Motivación / Inicio: ", bold: true, size: 19 }), new TextRun({ text: cleanPrefix(entry.motivacion), size: 19 })] }),
                        new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "b) Desarrollo: ", bold: true, size: 19 }), new TextRun({ text: cleanPrefix(entry.desarrollo), size: 19 })] })
                    ];

                    if (entry.conclusion) {
                        momParas.push(new Paragraph({
                            spacing: { before: 100, after: 100 },
                            shading: { fill: "EBF1F5", type: ShadingType.CLEAR },
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 8, color: "1F4E78" },
                                bottom: { style: BorderStyle.SINGLE, size: 8, color: "1F4E78" },
                                left: { style: BorderStyle.SINGLE, size: 8, color: "1F4E78" },
                                right: { style: BorderStyle.SINGLE, size: 8, color: "1F4E78" }
                            },
                            children: [
                                new TextRun({ text: "  Concluimos: ", bold: true, size: 19, color: "1F4E78" }),
                                new TextRun({ text: entry.conclusion, size: 19 })
                            ]
                        }));
                    }

                    momParas.push(new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: "c) Fijación / Cierre: ", bold: true, size: 19 }), new TextRun({ text: cleanPrefix(entry.fijacion), size: 19 })] }));
                    momParas.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "d) Evaluación: ", bold: true, size: 19 }), new TextRun({ text: cleanPrefix(entry.evaluacion), size: 19 })] }));

                    const cardTable = new Table({
                        width: { size: 9890, type: WidthType.DXA },
                        columnWidths: [4945, 4945],
                        borders: { top: borderDark, bottom: borderDark, left: borderDark, right: borderDark, insideHorizontal: borderLight, insideVertical: borderLight },
                        rows: [
                            // Fila 0: Banner Azul Superior (columnSpan: 2)
                            new TableRow({
                                children: [new TableCell({
                                    columnSpan: 2,
                                    width: { size: 9890, type: WidthType.DXA },
                                    shading: { fill: "1F4E78" },
                                    margins: { top: 120, bottom: 120, left: 150, right: 150 },
                                    children: [new Paragraph({ children: [new TextRun({ text: `📅 ${dayName.toUpperCase()}  |  ${timeSlot}  —  ÁREA: ${area.toUpperCase()}`, bold: true, size: 22, color: "FFFFFF" })] })]
                                })]
                            }),
                            // Fila 1: Unidad & Tema (2 columnas)
                            new TableRow({
                                children: [
                                    new TableCell({ width: { size: 4945, type: WidthType.DXA }, shading: { fill: "F2F5F9" }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Unidad Temática: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: entry.unidad || "", size: 19 })] })] }),
                                    new TableCell({ width: { size: 4945, type: WidthType.DXA }, shading: { fill: "F2F5F9" }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [new TextRun({ text: "Tema: ", bold: true, size: 19, color: "1F4E78" }), new TextRun({ text: entry.tema || "", size: 19 })] })] })
                                ]
                            }),
                            // Fila 2: Capacidad & Indicadores (2 columnas)
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 4945, type: WidthType.DXA },
                                        shading: { fill: "FFFFFF" },
                                        margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                        children: [
                                            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Capacidad:", bold: true, size: 20, color: "1F4E78" })] }),
                                            new Paragraph({ children: [new TextRun({ text: `• ${entry.capacidad || ''}`, size: 18 })] })
                                        ]
                                    }),
                                    new TableCell({
                                        width: { size: 4945, type: WidthType.DXA },
                                        shading: { fill: "FFFFFF" },
                                        margins: { top: 100, bottom: 100, left: 120, right: 120 },
                                        children: [
                                            new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: "Indicadores:", bold: true, size: 20, color: "1F4E78" })] }),
                                            ...(entry.indicadores || []).map(ind => new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: `• ${ind}`, size: 18 })] }))
                                        ]
                                    })
                                ]
                            }),
                            // Fila 3: Momentos Didácticos (columnSpan: 2)
                            new TableRow({
                                children: [new TableCell({
                                    columnSpan: 2,
                                    width: { size: 9890, type: WidthType.DXA },
                                    shading: { fill: "FAFAFA" },
                                    margins: { top: 120, bottom: 120, left: 150, right: 150 },
                                    children: momParas
                                })]
                            })
                        ]
                    });
                    children.push(cardTable);
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

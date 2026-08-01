// State Management: Clean Multi-Subject & Per-Class Breakdown Model
let subjectsData = [
    {
        id: "materia_1",
        nombre: "Ciencias Naturales",
        clases: [
            {
                id: "c_1_1",
                titulo: "El Sistema Solar y los Planetas",
                observacion: "Explicar los 8 planetas, el sol y el movimiento de rotación/traslación.",
                files: [],
                extractedText: ""
            }
        ]
    },
    {
        id: "materia_2",
        nombre: "Lengua y Literatura",
        clases: [
            {
                id: "c_2_1",
                titulo: "Mitos y Leyendas: Estructura Narrativa",
                observacion: "Identificar inicio, nudo y desenlace en leyendas tradicionales.",
                files: [],
                extractedText: ""
            },
            {
                id: "c_2_2",
                titulo: "Comprensión Lectora y Producción Escrita",
                observacion: "Redacción individual de una leyenda corta en el cuaderno.",
                files: [],
                extractedText: ""
            }
        ]
    }
];

// Initialize PWA Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => console.log('Service Worker Registrado!', reg.scope))
            .catch(err => console.log('SW Error:', err));
    });
}
let subjectsInputsContainer;
let btnAddSubjectBlock;
let btnGeneratePlan;
let docSubjectsContainer;

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    subjectsInputsContainer = document.getElementById('subjects-inputs-container');
    btnAddSubjectBlock = document.getElementById('btn-add-subject-block');
    btnGeneratePlan = document.getElementById('btn-generate-plan');
    docSubjectsContainer = document.getElementById('doc-subjects-container');

    renderAllSubjectFormBlocks();
    generateWeeklyPlanDoc();

    // Event listeners
    document.getElementById('curso').addEventListener('change', (e) => {
        document.getElementById('doc-curso-display').textContent = e.target.value;
    });

    document.getElementById('semana-rango').addEventListener('input', (e) => {
        document.getElementById('doc-fecha-display').textContent = e.target.value || "Semana en curso";
    });

    btnAddSubjectBlock.addEventListener('click', () => {
        const newSubjId = 'materia_' + Date.now();
        subjectsData.push({
            id: newSubjId,
            nombre: "Nueva Materia",
            clases: [
                {
                    id: 'c_' + Date.now() + '_1',
                    titulo: "Clase 1",
                    observacion: "",
                    files: [],
                    extractedText: ""
                }
            ]
        });
        renderAllSubjectFormBlocks();
    });

    btnGeneratePlan.addEventListener('click', generateWeeklyPlanDoc);
});

// Render Form Inputs for all Subjects and their individual Classes
function renderAllSubjectFormBlocks() {
    subjectsInputsContainer.innerHTML = '';

    subjectsData.forEach((subj, sIdx) => {
        const subjCard = document.createElement('div');
        subjCard.className = 'subject-block-card';
        subjCard.setAttribute('data-subj-id', subj.id);

        let clasesHtml = '';
        subj.clases.forEach((cl, cIdx) => {
            clasesHtml += `
                <div class="class-input-box" data-class-id="${cl.id}" style="background: rgba(30, 41, 59, 0.7); border: 1px dashed #475569; border-radius: 8px; padding: 0.85rem; margin-top: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <strong style="color: #38BDF8; font-size: 0.85rem;"><i data-lucide="bookmark"></i> CLASE ${cIdx + 1}</strong>
                        ${subj.clases.length > 1 ? `<button type="button" class="btn-remove-subject" onclick="removeClassFromSubject('${subj.id}', '${cl.id}')" style="font-size:0.75rem;"><i data-lucide="x"></i> Quitar Clase</button>` : ''}
                    </div>

                    <div class="form-group" style="margin-bottom: 0.5rem;">
                        <label style="font-size:0.75rem;">Tema / Título de esta Clase</label>
                        <input type="text" class="input-class-title" value="${cl.titulo}" oninput="updateClassTitle('${subj.id}', '${cl.id}', this.value)" placeholder="Ej: Sistema Solar, Fracciones, etc.">
                    </div>

                    <div class="form-group" style="margin-bottom: 0.5rem;">
                        <label style="font-size:0.75rem;"><i data-lucide="camera"></i> Foto del Libro para esta Clase (Opcional)</label>
                        <div class="subject-dropzone" style="padding: 0.4rem;" onclick="triggerClassFileInput('${cl.id}')">
                            <input type="file" id="file_${cl.id}" accept="image/*" multiple hidden onchange="handleClassFiles('${subj.id}', '${cl.id}', this.files)">
                            <span style="font-size: 0.75rem; color: #94A3B8;">${cl.files.length > 0 ? `📷 ${cl.files.length} foto(s) cargada(s)` : 'Subir foto de las páginas del libro'}</span>
                        </div>
                    </div>

                    <div class="form-group" style="margin-bottom: 0;">
                        <label style="font-size:0.75rem;"><i data-lucide="edit-3"></i> Observación / Qué enseñar en esta clase</label>
                        <textarea class="extracted-textarea input-class-obs" style="height: 55px; font-size: 0.8rem;" oninput="updateClassObs('${subj.id}', '${cl.id}', this.value)" placeholder="Escribe el tema u observación si no tienes foto de libro...">${cl.observacion}</textarea>
                    </div>
                </div>
            `;
        });

        subjCard.innerHTML = `
            <div class="subject-block-header">
                <span class="subject-block-title" style="font-size: 1rem; color: #EEF2FF;">
                    <i data-lucide="book-open"></i> ${subj.nombre}
                </span>
                ${subjectsData.length > 1 ? `<button type="button" class="btn-remove-subject" onclick="removeSubject('${subj.id}')"><i data-lucide="trash-2"></i> Eliminar Materia</button>` : ''}
            </div>

            <div class="form-group" style="margin-bottom: 0.5rem;">
                <label>Nombre de Asignatura</label>
                <input type="text" class="input-subj-name" value="${subj.nombre}" oninput="updateSubjectName('${subj.id}', this.value)" placeholder="Ej: Ciencias Naturales">
            </div>

            <div class="classes-input-container">
                ${clasesHtml}
            </div>

            <button type="button" class="btn btn-outline" style="width: 100%; margin-top: 0.75rem; font-size: 0.8rem; padding: 0.4rem;" onclick="addClassToSubject('${subj.id}')">
                <i data-lucide="plus"></i> + Agregar Otra Clase a ${subj.nombre}
            </button>
        `;

        subjectsInputsContainer.appendChild(subjCard);
    });

    if (window.lucide) lucide.createIcons();
}

// Data Updaters
function updateSubjectName(subjId, val) {
    const s = subjectsData.find(x => x.id === subjId);
    if (s) s.nombre = val;
}

function addClassToSubject(subjId) {
    const s = subjectsData.find(x => x.id === subjId);
    if (s) {
        s.clases.push({
            id: 'c_' + Date.now(),
            titulo: `Clase ${s.clases.length + 1}`,
            observacion: "",
            files: [],
            extractedText: ""
        });
        renderAllSubjectFormBlocks();
    }
}

function removeClassFromSubject(subjId, classId) {
    const s = subjectsData.find(x => x.id === subjId);
    if (s && s.clases.length > 1) {
        s.clases = s.clases.filter(c => c.id !== classId);
        renderAllSubjectFormBlocks();
    }
}

function removeSubject(subjId) {
    subjectsData = subjectsData.filter(x => x.id !== subjId);
    renderAllSubjectFormBlocks();
}

function updateClassTitle(subjId, classId, val) {
    const s = subjectsData.find(x => x.id === subjId);
    if (s) {
        const c = s.clases.find(x => x.id === classId);
        if (c) c.titulo = val;
    }
}

function updateClassObs(subjId, classId, val) {
    const s = subjectsData.find(x => x.id === subjId);
    if (s) {
        const c = s.clases.find(x => x.id === classId);
        if (c) c.observacion = val;
    }
}

function triggerClassFileInput(classId) {
    const inp = document.getElementById(`file_${classId}`);
    if (inp) inp.click();
}

async function handleClassFiles(subjId, classId, files) {
    const s = subjectsData.find(x => x.id === subjId);
    if (!s) return;
    const c = s.clases.find(x => x.id === classId);
    if (!c) return;

    c.files = Array.from(files);
    let extractedText = "";

    for (let f of c.files) {
        try {
            if (window.Tesseract) {
                const res = await Tesseract.recognize(f, 'spa');
                extractedText += res.data.text + "\n";
            }
        } catch (e) {
            extractedText += `Página ${f.name}\n`;
        }
    }
    c.extractedText = extractedText;
    renderAllSubjectFormBlocks();
}

// Global API Modal Handlers
function openApiModal() {
    const apiModal = document.getElementById('api-modal');
    const geminiKeyInput = document.getElementById('gemini-key');
    if (apiModal && geminiKeyInput) {
        geminiKeyInput.value = localStorage.getItem('GEMINI_API_KEY') || '';
        apiModal.classList.remove('hidden');
    }
}

function closeApiModal() {
    const apiModal = document.getElementById('api-modal');
    if (apiModal) apiModal.classList.add('hidden');
}

function saveApiKey() {
    const geminiKeyInput = document.getElementById('gemini-key');
    if (geminiKeyInput) {
        localStorage.setItem('GEMINI_API_KEY', geminiKeyInput.value.trim());
        closeApiModal();
        alert("¡API Key de Gemini guardada con éxito!");
    }
}

// Generate Pedagogy Plan Document
async function generateWeeklyPlanDoc() {
    const curso = document.getElementById('curso').value;
    const apiKey = localStorage.getItem('GEMINI_API_KEY');

    btnGeneratePlan.disabled = true;
    btnGeneratePlan.innerHTML = `<span class="spinner"></span> Generando Planificación Semanal...`;

    // Direct Sync from live DOM Inputs before generating
    subjectsData.forEach(s => {
        const subjElem = document.querySelector(`.subject-block-card[data-subj-id="${s.id}"]`);
        if (subjElem) {
            const sNameInput = subjElem.querySelector('.input-subj-name');
            if (sNameInput) s.nombre = sNameInput.value;

            s.clases.forEach(c => {
                const classElem = subjElem.querySelector(`.class-input-box[data-class-id="${c.id}"]`);
                if (classElem) {
                    const titleInput = classElem.querySelector('.input-class-title');
                    const obsInput = classElem.querySelector('.input-class-obs');
                    if (titleInput) c.titulo = titleInput.value;
                    if (obsInput) c.observacion = obsInput.value;
                }
            });
        }
    });

    docSubjectsContainer.innerHTML = '';

    for (let subj of subjectsData) {
        const generatedClasses = [];

        for (let cIdx = 0; cIdx < subj.clases.length; cIdx++) {
            const cl = subj.clases[cIdx];
            const contentText = (cl.extractedText + "\n" + cl.observacion).trim() || cl.titulo;

            let classDetail;
            if (apiKey) {
                try {
                    classDetail = await callGeminiClassAI(contentText, cl.titulo, subj.nombre, curso, cIdx + 1, apiKey);
                } catch (e) {
                    classDetail = buildClassPedagogyLocal(contentText, cl.titulo, cIdx + 1);
                }
            } else {
                classDetail = buildClassPedagogyLocal(contentText, cl.titulo, cIdx + 1);
            }
            generatedClasses.push(classDetail);
        }

        renderSubjectDocCard(subj, generatedClasses);
    }

    btnGeneratePlan.disabled = false;
    btnGeneratePlan.innerHTML = `<i data-lucide="sparkles"></i> Generar Planificación Semanal Multimateria`;
    if (window.lucide) lucide.createIcons();

    document.getElementById('plan-wrapper').scrollIntoView({ behavior: 'smooth' });
}

function renderSubjectDocCard(subj, classesArray) {
    const card = document.createElement('div');
    card.className = 'subject-doc-card';

    const mainTopic = classesArray.map(c => c.titulo).join(" | ");

    card.innerHTML = `
        <div class="subject-doc-header">
            <div class="subject-doc-name">${subj.nombre}</div>
            <span class="subject-source-tag">${classesArray.length} Clase(s) Planificada(s)</span>
        </div>

        <div class="grid-2col card-style" style="margin-bottom: 1.25rem;">
            <div>
                <h4><i data-lucide="bookmark"></i> Eje Temático Semanal:</h4>
                <p contenteditable="true"><strong>${mainTopic}</strong></p>
            </div>
            <div>
                <h4><i data-lucide="target"></i> Objetivos Didácticos:</h4>
                <ul contenteditable="true">
                    <li>Comprender los conceptos fundamentales de ${subj.nombre} asignados para la semana.</li>
                    <li>Participar activamente en la resolución de actividades y ejercitación didáctica.</li>
                </ul>
            </div>
        </div>

        <div class="classes-sequence">
            ${classesArray.map((clase, idx) => `
                <div class="class-card">
                    <div class="class-card-header">
                        <span class="class-num">CLASE ${idx + 1}</span>
                        <span class="class-topic" contenteditable="true">${clase.titulo}</span>
                    </div>
                    <div class="class-card-body">
                        <div class="phase-item">
                            <span class="phase-badge phase-inicio">INICIO (15 min)</span>
                            <div class="phase-desc" contenteditable="true">${clase.inicioDesc}</div>
                        </div>
                        <div class="phase-item">
                            <span class="phase-badge phase-desarrollo">DESARROLLO (50 min)</span>
                            <div class="phase-desc" contenteditable="true">${clase.desarrolloDesc}</div>
                        </div>
                        <div class="phase-item">
                            <span class="phase-badge phase-cierre">CIERRE (15 min)</span>
                            <div class="phase-desc" contenteditable="true">${clase.cierreDesc}</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    docSubjectsContainer.appendChild(card);
}

// Local Pedagogical Class Builder
function buildClassPedagogyLocal(contentText, classTitle, classNum) {
    const title = classTitle && classTitle.trim() ? classTitle : (contentText.length > 5 ? contentText.substring(0, 45) : `Clase ${classNum}`);
    const details = contentText && contentText.trim() ? contentText : title;

    return {
        titulo: title,
        inicioDesc: `Pregunta disparadora e indagación inicial sobre ${title}. Presentación de saberes previos y motivación del tema.`,
        desarrolloDesc: `Explicación docente apoyada en los contenidos seleccionados (${details}). Resolución de actividades didácticas y ejercicios en el cuaderno.`,
        cierreDesc: `Puesta en común de las respuestas, aclaración de dudas y síntesis final de la clase.`
    };
}

// Direct PDF Downloader for Mobile and Desktop
function downloadPDF() {
    const element = document.getElementById('plan-wrapper');
    if (!element) return;

    const opt = {
        margin:       [0.4, 0.4, 0.4, 0.4],
        filename:     `Planificacion_Semanal_${Date.now()}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    if (window.html2pdf) {
        btnGeneratePlan.disabled = true;
        html2pdf().set(opt).from(element).save().then(() => {
            btnGeneratePlan.disabled = false;
        });
    } else {
        window.print();
    }
}
async function callGeminiClassAI(text, classTitle, materia, curso, classNum, apiKey) {
    const prompt = `Eres un asesor pedagógico escolar.
Crea la secuencia didáctica para la CLASE ${classNum} de la materia "${materia}" (Curso: ${curso}).
Tema / Observaciones / Texto: "${text || classTitle}"

Responde ÚNICAMENTE un JSON válido:
{
  "titulo": "Título formal de la clase",
  "inicioDesc": "Descripción detallada del inicio (15 min)",
  "desarrolloDesc": "Descripción detallada del desarrollo (50 min)",
  "cierreDesc": "Descripción detallada del cierre (15 min)"
}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    const data = await response.json();
    let responseText = data.candidates[0].content.parts[0].text;
    responseText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(responseText);
}

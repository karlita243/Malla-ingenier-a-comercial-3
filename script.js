document.addEventListener('DOMContentLoaded', () => {

    // --- ESTRUCTURA DE DATOS DE LOS RAMOS ---
    // Aquí defines todos los ramos, sus IDs únicos y los requisitos.
    // El ID debe ser único para cada ramo. Los requisitos son un array de IDs.
    const ramosData = [
        { id: 'MER-II', nombre: 'Mercadotecnia II', semestre: 4, requisitos: [] },
        { id: 'EST-II', nombre: 'Estadística II', semestre: 4, requisitos: [] },
        { id: 'MIC-II', nombre: 'Microeconomía II', semestre: 4, requisitos: [] },
        { id: 'MAC-I', nombre: 'Macroeconomía', semestre: 4, requisitos: [] },
        { id: 'MAT-FIN', nombre: 'Matemática Financiera', semestre: 4, requisitos: [] },
        { id: 'LID-GES', nombre: 'Liderazgo y Gestión del Cambio', semestre: 4, requisitos: [] },

        { id: 'PRE-VAL', nombre: 'Presupuesto y Valoración de Empresas', semestre: 5, requisitos: ['MAT-FIN'] },
        { id: 'INV-OPE', nombre: 'Investigación Operativa', semestre: 5, requisitos: ['EST-II'] },
        { id: 'ELEC-1', nombre: 'Electiva 1', semestre: 5, requisitos: [] },
        { id: 'GES-COM', nombre: 'Gestión Comercial', semestre: 5, requisitos: ['MER-II'] },
        { id: 'ECONO', nombre: 'Econometría', semestre: 5, requisitos: ['EST-II'] },
        { id: 'MON-BAN', nombre: 'Moneda, Banca y Seguros', semestre: 5, requisitos: ['MAC-I'] },

        { id: 'DER-EMP', nombre: 'Derecho Empresarial', semestre: 6, requisitos: [] },
        { id: 'FIN-I', nombre: 'Finanzas I', semestre: 6, requisitos: ['PRE-VAL'] },
        { id: 'GES-TAL', nombre: 'Gestión del Talento Humano', semestre: 6, requisitos: [] },
        { id: 'ELEC-2', nombre: 'Electiva 2', semestre: 6, requisitos: [] },
        { id: 'COMP-CON', nombre: 'Comportamiento del Consumidor', semestre: 6, requisitos: ['GES-COM'] },
        { id: 'INT-MER', nombre: 'Inteligencia del Mercado', semestre: 6, requisitos: ['ECONO'] },

        { id: 'COM-EXT', nombre: 'Comercio Exterior', semestre: 7, requisitos: ['MON-BAN'] },
        { id: 'FIN-II', nombre: 'Finanzas II', semestre: 7, requisitos: ['FIN-I'] },
        { id: 'GER-PRO', nombre: 'Gerencia de Producción', semestre: 7, requisitos: ['INV-OPE'] },
        { id: 'PROY-I', nombre: 'Proyecto I', semestre: 7, requisitos: ['INT-MER'] },
        { id: 'DER-FIN', nombre: 'Derecho Financiero y Tributario', semestre: 7, requisitos: ['DER-EMP'] },
        { id: 'LOG-CAD', nombre: 'Logística y Cadena de Suministros', semestre: 7, requisitos: [] },
        
        { id: 'PROY-II', nombre: 'Proyecto II', semestre: 8, requisitos: ['PROY-I'] },
        { id: 'FIN-CORP', nombre: 'Finanzas Corporativas', semestre: 8, requisitos: ['FIN-II'] },
        { id: 'GER-EST', nombre: 'Gerencia Estratégica', semestre: 8, requisitos: [] },
        { id: 'GES-CAL', nombre: 'Gestión de Calidad', semestre: 8, requisitos: ['GER-PRO'] },
        { id: 'SEM-GRA', nombre: 'Seminario de Grado', semestre: 8, requisitos: ['PROY-II'] },
        { id: 'NEG-INT', nombre: 'Negocios Internacionales', semestre: 8, requisitos: ['COM-EXT'] },
    ];

    const mallaContainer = document.getElementById('malla-curricular');
    const modal = document.getElementById('modal-bloqueo');
    const cerrarModal = document.querySelector('.cerrar-modal');
    const mensajeRequisitos = document.getElementById('mensaje-requisitos');
    
    // Cargar ramos aprobados desde localStorage
    let ramosAprobados = JSON.parse(localStorage.getItem('ramosAprobados')) || [];

    // --- FUNCIÓN PARA GUARDAR EL ESTADO EN LOCALSTORAGE ---
    const guardarEstado = () => {
        localStorage.setItem('ramosAprobados', JSON.stringify(ramosAprobados));
    };

    // --- FUNCIÓN PARA GENERAR LA MALLA CURRICULAR ---
    const generarMalla = () => {
        mallaContainer.innerHTML = ''; // Limpiar la malla antes de generarla
        const semestres = [...new Set(ramosData.map(r => r.semestre))].sort((a,b) => a-b);

        semestres.forEach(semestreNum => {
            const semestreDiv = document.createElement('div');
            semestreDiv.className = 'semestre';

            const titulo = document.createElement('h2');
            titulo.className = 'semestre-titulo';
            titulo.textContent = `Semestre ${semestreNum}`;
            semestreDiv.appendChild(titulo);

            const ramosDelSemestre = ramosData.filter(r => r.semestre === semestreNum);
            ramosDelSemestre.forEach(ramo => {
                const ramoDiv = document.createElement('div');
                ramoDiv.className = 'ramo';
                ramoDiv.textContent = ramo.nombre;
                ramoDiv.dataset.id = ramo.id; // Usar dataset para guardar el ID

                // Aplicar estilos iniciales
                actualizarEstiloRamo(ramoDiv, ramo.id);

                ramoDiv.addEventListener('click', () => toggleAprobacion(ramo.id));
                semestreDiv.appendChild(ramoDiv);
            });

            mallaContainer.appendChild(semestreDiv);
        });
    };

    // --- FUNCIÓN PARA VERIFICAR REQUISITOS ---
    const verificarRequisitos = (ramoId) => {
        const ramo = ramosData.find(r => r.id === ramoId);
        if (!ramo || !ramo.requisitos || ramo.requisitos.length === 0) {
            return { cumplidos: true, faltantes: [] };
        }

        const faltantes = ramo.requisitos.filter(reqId => !ramosAprobados.includes(reqId));
        return {
            cumplidos: faltantes.length === 0,
            faltantes: faltantes.map(reqId => ramosData.find(r => r.id === reqId).nombre)
        };
    };

    // --- FUNCIÓN PARA ACTUALIZAR EL ESTILO DE UN RAMO ---
    const actualizarEstiloRamo = (ramoDiv, ramoId) => {
        const requisitos = verificarRequisitos(ramoId);

        if (ramosAprobados.includes(ramoId)) {
            ramoDiv.classList.add('aprobado');
            ramoDiv.classList.remove('bloqueado');
        } else {
            ramoDiv.classList.remove('aprobado');
            if (!requisitos.cumplidos) {
                ramoDiv.classList.add('bloqueado');
            } else {
                ramoDiv.classList.remove('bloqueado');
            }
        }
    };
    
    // --- FUNCIÓN PARA MANEJAR EL CLIC EN UN RAMO ---
    const toggleAprobacion = (ramoId) => {
        const requisitos = verificarRequisitos(ramoId);
        const yaAprobado = ramosAprobados.includes(ramoId);

        if (yaAprobado) {
            // Permitir "desaprobar" un ramo, pero verificar si es requisito de otros ya aprobados
            const esRequisito = ramosData.some(ramo => 
                ramo.requisitos.includes(ramoId) && ramosAprobados.includes(ramo.id)
            );
            if (esRequisito) {
                alert('No puedes desmarcar este ramo porque es requisito de otros ramos ya aprobados.');
                return;
            }
            ramosAprobados = ramosAprobados.filter(id => id !== ramoId);
        } else {
            if (!requisitos.cumplidos) {
                mensajeRequisitos.innerHTML = `Para aprobar este ramo, primero necesitas aprobar: <br><strong>${requisitos.faltantes.join(', ')}</strong>`;
                modal.style.display = 'block';
                return;
            }
            ramosAprobados.push(ramoId);
        }
        
        guardarEstado();
        // Actualizar todos los estilos, ya que el estado de uno afecta a otros
        document.querySelectorAll('.ramo').forEach(ramoDiv => {
            actualizarEstiloRamo(ramoDiv, ramoDiv.dataset.id);
        });
    };

    // --- LÓGICA DEL MODAL ---
    cerrarModal.onclick = () => {
        modal.style.display = 'none';
    };
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };

    // --- INICIALIZACIÓN ---
    generarMalla();
});

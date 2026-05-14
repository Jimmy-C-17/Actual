import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

const Planificacion = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName } = useUI();
  const [choferesReales, setChoferesReales] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [rutasCatalogo, setRutasCatalogo] = useState([]);
  const [rutaError, setRutaError] = useState(null);
  const rutasActivas = rutasCatalogo
    .filter(ruta => ruta.activa)
    .map(ruta => ruta.nombre);
  const [modoSeleccion, setModoSeleccion] = useState('porGrupo');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState('');
  const [choferesSeleccionados, setChoferesSeleccionados] = useState([]);
  const [semana, setSemana] = useState('');
  const [variable, setVariable] = useState('Normal');
  const [planificacionGenerada, setPlanificacionGenerada] = useState(null);
  const [diaActivo, setDiaActivo] = useState('Lunes');
  const diasSemana = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  function cargarGrupos() {
    fetch('http://127.0.0.1:8000/api/grupos/')
      .then(response => response.json())
      .then(data => {
        if (data && data.length > 0) {
          Promise.all(data.map(grupo =>
            fetch('http://127.0.0.1:8000/api/choferes/')
              .then(r => r.json())
              .then(choferes => {
                const cantidad = choferes.filter(c => c.grupo === grupo.id).length;
                return { ...grupo, cantidad };
              })
          ))
          .then(gruposConCantidad => {
            setGrupos(gruposConCantidad);
            if (!grupoSeleccionado && gruposConCantidad.length > 0) {
              setGrupoSeleccionado(gruposConCantidad[0].id.toString());
            }
          });
        }
      })
      .catch(error => console.error("Error al cargar grupos:", error));
  }

  function cargarRutas() {
    fetch('http://127.0.0.1:8000/api/rutas-catalogo/')
      .then(response => {
        if (!response.ok) throw new Error('No se pudo cargar las rutas');
        return response.json();
      })
      .then(data => {
        setRutasCatalogo(data);
        setRutaError(null);
      })
      .catch(error => {
        console.error("Error al cargar rutas:", error);
        setRutasCatalogo([]);
        setRutaError('No se pudieron cargar las rutas activas desde el servidor.');
      });
  }

  function cargarChoferes() {
    fetch('http://127.0.0.1:8000/api/choferes/')
      .then(response => response.json())
      .then(data => {
        setChoferesReales(data);
      })
      .catch(error => console.error("Error al cargar choferes:", error));
  }

  useEffect(() => {
    cargarGrupos();
    cargarChoferes();
    cargarRutas();
  }, []);

  const handleCrearGrupo = () => {
    const nombreGrupo = prompt("Ingresa el nombre del nuevo grupo (ej: Grupo A):");
    if (!nombreGrupo) return;

    fetch('http://127.0.0.1:8000/api/grupos/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nombreGrupo })
    })
    .then(response => response.json())
    .then(() => {
      showToast("Grupo creado exitosamente");
      cargarGrupos();
    })
    .catch(error => console.error("Error al crear grupo:", error));
  };

  const handleEditarGrupo = (grupo) => {
    const nuevoNombre = prompt("Edita el nombre del grupo:", grupo.nombre);
    if (!nuevoNombre) return;

    fetch(`http://127.0.0.1:8000/api/grupos/${grupo.id}/`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre: nuevoNombre })
    })
    .then(response => response.json())
    .then(() => {
      showToast("Grupo actualizado");
      cargarGrupos();
    })
    .catch(error => console.error("Error al editar grupo:", error));
  };

  const handleEliminarGrupo = (grupoId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este grupo?")) return;

    fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/`, {
      method: 'DELETE'
    })
    .then(() => {
      showToast("Grupo eliminado");
      cargarGrupos();
    })
    .catch(error => console.error("Error al eliminar grupo:", error));
  };

  const calcularSecuenciaRutas = () => {
    if (rutasActivas.length === 0) return [];

    const cochabamba = rutasActivas.find(r => r.toLowerCase() === 'cochabamba');
    const otrasRutas = rutasActivas.filter(r => r.toLowerCase() !== 'cochabamba');

    if (otrasRutas.length === 0) {
      return rutasActivas.slice(0, 10);
    }

    const secuencia = [];
    let indiceRuta = 0;
    for (let i = 0; i < 10; i++) {
      if (i % 2 === 0) {
        secuencia.push(otrasRutas[indiceRuta % otrasRutas.length]);
        indiceRuta += 1;
      } else {
        secuencia.push(cochabamba || otrasRutas[(indiceRuta - 1) % otrasRutas.length]);
      }
    }

    return secuencia;
  };

  const handleGenerarPlanificacion = () => {
    if (rutasActivas.length === 0) {
      showToast('No hay rutas activas cargadas. Crea rutas en Django admin o en la aplicación Rutas.');
      return;
    }

    let choferesFiltrados;

    if (modoSeleccion === 'porGrupo') {
      if (!grupoSeleccionado) {
        showToast("Por favor selecciona un grupo para generar la planificación.");
        return;
      }
      const grupoId = parseInt(grupoSeleccionado);
      choferesFiltrados = choferesReales.filter(c => c.grupo === grupoId);
    } else if (modoSeleccion === 'seleccionados') {
      if (choferesSeleccionados.length === 0) {
        showToast("Selecciona al menos un chofer para generar la planificación.");
        return;
      }
      choferesFiltrados = choferesReales.filter(c => choferesSeleccionados.includes(c.id));
    } else {
      choferesFiltrados = choferesReales;
    }

    const listaNombres = choferesFiltrados.length > 0
      ? choferesFiltrados.map(c => c.nombre_completo)
      : [];

    if (listaNombres.length === 0) {
      showToast('No hay choferes disponibles para generar la planificación.');
      return;
    }

    const secuenciaBase = calcularSecuenciaRutas();
    if (secuenciaBase.length === 0) {
      showToast('No se pudo generar la secuencia de rutas. Revisa la configuración de rutas activas.');
      return;
    }

    const nuevaPlanificacion = {};

    diasSemana.forEach((dia) => {
      nuevaPlanificacion[dia] = listaNombres.map((nombreChofer) => ({
        nombre: nombreChofer,
        vueltas: [...secuenciaBase]
      }));
    });

    setPlanificacionGenerada(nuevaPlanificacion);
    setDiaActivo('Lunes');
  };

  const handleGuardarPlanificacion = () => {
    const grupoGuardado = modoSeleccion === 'todos' ? 'Todos' : modoSeleccion === 'seleccionados' ? 'Seleccionados' : grupoSeleccionado;
    const datosAGuardar = {
        grupo: grupoGuardado,
        semana: semana || 'Semana actual',
        variable_clima: variable,
        rutas_asignadas: planificacionGenerada
    };

    fetch('http://127.0.0.1:8000/api/planificaciones/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosAGuardar)
    })
    .then(response => {
        if (response.ok) {
            showToast("✅ ¡Las rutas de los choferes se han guardado exitosamente en la base de datos!");
        } else {
            showToast("⚠️ Hubo un problema al guardar. Asegúrate de tener el modelo y la URL '/api/planificaciones/' creados en Django.");
        }
    })
    .catch(error => {
        console.error("Error al guardar la planificación:", error);
        showToast("❌ Error de conexión con el servidor.");
    });
  };

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="app-main">
        <h2 className="mb-4 fw-bold text-secondary">Planificación Semanal de Rutas</h2>
        {rutaError && (
          <div className="alert alert-warning py-2" role="alert">
            {rutaError}
          </div>
        )}

        {/* --- SECCIÓN 1: GESTIÓN DE GRUPOS --- */}
        <div className="mb-4">
          <h5 className="text-muted fw-bold mb-3">Tus Grupos de Trabajo</h5>
          <div className="d-flex gap-3 overflow-auto pb-2">
            {grupos.map(grupo => (
              <div key={grupo.id} className="card shadow-sm border-0 rounded-4 px-4 py-3 bg-white" style={{ minWidth: '200px' }}>
                <h5 className="fw-bold text-primary mb-1">{grupo.nombre}</h5>
                <p className="text-muted small mb-2">{grupo.cantidad} Choferes asignados</p>
                <div className="d-flex gap-2 mt-auto">
                  <button className="btn btn-sm btn-outline-secondary flex-grow-1" onClick={() => handleEditarGrupo(grupo)}>✏️ Editar</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminarGrupo(grupo.id)}>🗑️</button>
                </div>
              </div>
            ))}
            <button className="card shadow-sm border-0 rounded-4 px-4 py-3 bg-light d-flex align-items-center justify-content-center text-secondary" style={{ minWidth: '200px', cursor: 'pointer', border: '2px dashed #ccc !important' }} onClick={handleCrearGrupo}>
              <span className="fs-4">+</span>
              <span className="fw-bold mt-1">Crear Grupo</span>
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* --- SECCIÓN 2: FORMULARIO GENERADOR --- */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 p-4">
              <h5 className="fw-bold text-dark mb-4">Motor de Generación</h5>
              
              <div className="mb-3">
                <label className="form-label small fw-bold text-muted">Semana a planificar</label>
                <input type="week" className="form-control bg-light border-0" value={semana} onChange={(e) => setSemana(e.target.value)} />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Variables de la semana</label>
                <select className="form-select bg-light border-0" value={variable} onChange={(e) => setVariable(e.target.value)}>
                  <option value="Normal">Normal (Sin novedades)</option>
                  <option value="Lluvia">Temporada de Lluvias</option>
                  <option value="Bloqueos">Posibles Bloqueos/Marchas</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-muted">Modo de selección de choferes</label>
                <div className="btn-group w-100" role="group">
                  <button type="button" className={`btn ${modoSeleccion === 'porGrupo' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setModoSeleccion('porGrupo')}>Por Grupo</button>
                  <button type="button" className={`btn ${modoSeleccion === 'todos' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setModoSeleccion('todos')}>Todos</button>
                  <button type="button" className={`btn ${modoSeleccion === 'seleccionados' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setModoSeleccion('seleccionados')}>Seleccionados</button>
                </div>
              </div>

              {modoSeleccion === 'porGrupo' && (
                <div className="mb-4">
                  <label className="form-label small fw-bold text-muted">Seleccionar Grupo</label>
                  <select className="form-select bg-light border-0" value={grupoSeleccionado} onChange={(e) => setGrupoSeleccionado(e.target.value)}>
                    <option value="">-- Elige un grupo --</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                </div>
              )}

              {modoSeleccion === 'seleccionados' && (
                <div className="mb-4 p-3 border rounded-3 bg-white">
                  <label className="form-label small fw-bold text-muted">Choferes seleccionados</label>
                  <div className="small text-muted mb-2">Marca los choferes que quieres incluir en la generación.</div>
                  <div className="d-flex flex-column gap-2" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {choferesReales.map(chofer => (
                      <label key={chofer.id} className="form-check form-check-inline align-items-start">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={choferesSeleccionados.includes(chofer.id)}
                          onChange={(e) => {
                            const seleccion = e.target.checked;
                            setChoferesSeleccionados(prev => seleccion ? [...prev, chofer.id] : prev.filter(id => id !== chofer.id));
                          }}
                        />
                        <span className="form-check-label ms-2">{chofer.nombre_completo} ({chofer.ci})</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-3 text-muted small">
                Nota: la semana y la variable no son obligatorias. Si no ingresas semana, se toma la semana actual.
              </div>

              <button className="btn btn-primary w-100 py-2 fw-bold shadow-sm" onClick={handleGenerarPlanificacion}>
                ✨ Generar Planificación
              </button>
            </div>
          </div>

          {/* --- SECCIÓN 3: RESULTADOS (HOJA DE CONTROL) --- */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4 p-4 h-100 bg-white">
              {!planificacionGenerada ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                  <span style={{ fontSize: '3rem' }}>📋</span>
                  <p className="mt-3 mb-0 fw-bold fs-5">Esperando planificación...</p>
                  <p className="small">Completa el formulario y haz clic en generar.</p>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">Hoja de Control: {modoSeleccion === 'todos' ? 'Todos los choferes' : modoSeleccion === 'seleccionados' ? 'Choferes seleccionados' : grupos.find(g => g.id.toString() === grupoSeleccionado)?.nombre || 'Grupo seleccionado'}</h5>
                    {/* BOTÓN ACTUALIZADO PARA GUARDAR */}
                    <button className="btn btn-success btn-sm fw-bold shadow-sm" onClick={handleGuardarPlanificacion}>
                      💾 Guardar Rutas
                    </button>
                  </div>

                  {/* PESTAÑAS DE DÍAS */}
                  <ul className="nav nav-tabs mb-3 border-bottom-0 gap-1">
                    {diasSemana.map(dia => (
                      <li className="nav-item" key={dia}>
                        <button 
                          className={`nav-link border-0 rounded-top ${diaActivo === dia ? 'bg-primary text-white fw-bold' : 'bg-light text-secondary'}`}
                          onClick={() => setDiaActivo(dia)}
                        >
                          {dia}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* TABLA DEL DÍA SELECCIONADO */}
                  <div className="table-responsive bg-light rounded-3 p-2" style={{ maxHeight: '400px' }}>
                    <table className="table table-hover table-borderless align-middle text-center mb-0 bg-white">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th className="text-start ps-3">Chofer</th>
                          <th>Vuelta 1 (Inicio)</th>
                          <th>Vuelta 2</th>
                          <th>Vuelta 3</th>
                          <th>Vuelta 4</th>
                          <th>Vuelta 5</th>
                          <th>Vuelta 6</th>
                          <th>Vuelta 7</th>
                          <th>Vuelta 8</th>
                          <th>Vuelta 9</th>
                          <th>Vuelta 10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planificacionGenerada[diaActivo].map((fila, idx) => (
                          <tr key={idx} className="border-bottom">
                            <td className="text-start ps-3 fw-bold text-secondary">👨‍✈️ {fila.nombre}</td>
                            {fila.vueltas.map((ruta, i) => (
                              <td key={i}>
                                <span className={`badge ${i === 0 ? 'bg-primary' : 'bg-secondary'} px-2 py-1`}>
                                  {ruta}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* TEXTO DE AYUDA ACTUALIZADO */}
                  <p className="text-muted small mt-2 mb-0">* Haz clic en "Guardar Rutas" para registrar oficialmente esta planificación en la base de datos.</p>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Planificacion;
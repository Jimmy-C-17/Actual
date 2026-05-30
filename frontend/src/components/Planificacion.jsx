import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUI } from '../contexts/UIContext.jsx';
import Sidebar from './Sidebar.jsx';

const Planificacion = () => {
  const navigate = useNavigate();
  const { sidebarVisible, toggleSidebar, sindicatoName, showToast } = useUI();
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
      showToast("Grupo creado exitosamente", 'success');
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
      showToast("Grupo actualizado", 'success');
      cargarGrupos();
    })
    .catch(error => console.error("Error al editar grupo:", error));
  };

  const handleEliminarGrupo = (grupoId) => {
    fetch(`http://127.0.0.1:8000/api/grupos/${grupoId}/`, {
      method: 'DELETE'
    })
    .then(() => {
      showToast("Grupo eliminado", 'success');
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
      showToast('No hay rutas activas cargadas. Crea rutas en Django admin o en la aplicación Rutas.', 'warning');
      return;
    }

    let choferesFiltrados;

    if (modoSeleccion === 'porGrupo') {
      if (!grupoSeleccionado) {
        showToast("Por favor selecciona un grupo para generar la planificación.", 'warning');
        return;
      }
      const grupoId = parseInt(grupoSeleccionado);
      choferesFiltrados = choferesReales.filter(c => c.grupo === grupoId);
    } else if (modoSeleccion === 'seleccionados') {
      if (choferesSeleccionados.length === 0) {
        showToast("Selecciona al menos un chofer para generar la planificación.", 'warning');
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
      showToast('No hay choferes disponibles para generar la planificación.', 'warning');
      return;
    }

    const secuenciaBase = calcularSecuenciaRutas();
    if (secuenciaBase.length === 0) {
      showToast('No se pudo generar la secuencia de rutas. Revisa la configuración de rutas activas.', 'error');
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
            showToast("Las rutas de los choferes se han guardado exitosamente en la base de datos.", 'success');
        } else {
            showToast("Hubo un problema al guardar. Asegúrate de tener el modelo y la URL '/api/planificaciones/' creados en Django.", 'error');
        }
    })
    .catch(error => {
        console.error("Error al guardar la planificación:", error);
        showToast("Error de conexión con el servidor.", 'error');
    });
  };

  return (
    <div className="app-shell d-flex" style={{ backgroundColor: '#1a1c1e', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Sidebar />

      <main className="app-main flex-grow-1 p-4" style={{ backgroundColor: '#1a1c1e',  }}>
        <h2 className="mb-4 fw-bold text-white" style={{ fontSize: '1.8rem' }}>Planificación Semanal de Rutas</h2>
        
        {rutaError && (
          <div className="alert alert-warning py-2 border-0" role="alert" style={{ backgroundColor: '#4d3a1e', color: '#ffeb3b' }}>
            {rutaError}
          </div>
        )}

        {/* --- SECCIÓN 1: GESTIÓN DE GRUPOS --- */}
        <div className="mb-4">
          <h5 className="fw-bold mb-3" style={{ color: '#9aa0a6' }}>Tus Grupos de Trabajo</h5>
          <div className="d-flex gap-3 overflow-auto pb-2 custom-scrollbar">
            {grupos.map(grupo => (
              <div key={grupo.id} className="card shadow-sm border-0 rounded-4 px-4 py-3" style={{ minWidth: '220px', backgroundColor: '#2d3034' }}>
                <h5 className="fw-bold mb-1" style={{ color: '#e8eaed' }}>{grupo.nombre}</h5>
                <p className="small mb-3" style={{ color: '#9aa0a6' }}>{grupo.cantidad} Choferes asignados</p>
                <div className="d-flex gap-2 mt-auto">
                  <button 
                    className="btn btn-sm flex-grow-1 d-flex align-items-center justify-content-center gap-2 rounded-pill" 
                    style={{ backgroundColor: 'transparent', border: '1px solid #5f6368', color: '#e8eaed' }}
                    onClick={() => handleEditarGrupo(grupo)}
                  >
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Editar
                  </button>
                  <button 
                    className="btn btn-sm rounded-pill d-flex align-items-center justify-content-center" 
                    style={{ backgroundColor: 'transparent', border: '1px solid #5f6368', color: '#f28b82' }}
                    onClick={() => handleEliminarGrupo(grupo.id)}
                    title="Eliminar grupo"
                  >
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="14" height="14">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            <button 
              className="card shadow-sm border-0 rounded-4 px-4 py-3 d-flex align-items-center justify-content-center" 
              style={{ minWidth: '220px', cursor: 'pointer', backgroundColor: '#1a1c1e', border: '2px dashed #444 !important', color: '#9aa0a6' }} 
              onClick={handleCrearGrupo}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24" height="24" className="mb-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span className="fw-bold mt-1">Crear Grupo</span>
            </button>
          </div>
        </div>

        <div className="row g-4">
          {/* --- SECCIÓN 2: FORMULARIO GENERADOR --- */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 rounded-4 p-4" style={{ backgroundColor: '#2d3034' }}>
              <h5 className="fw-bold mb-4" style={{ color: '#e8eaed' }}>Motor de Generación</h5>
              
              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Semana a planificar</label>
                <input 
                  type="week" 
                  className="form-control border-0" 
                  style={{ backgroundColor: '#1a1c1e', color: 'white', colorScheme: 'dark' }} 
                  value={semana} 
                  onChange={(e) => setSemana(e.target.value)} 
                />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Variables de la semana</label>
                <select 
                  className="form-select border-0" 
                  style={{ backgroundColor: '#1a1c1e', color: 'white' }} 
                  value={variable} 
                  onChange={(e) => setVariable(e.target.value)}
                >
                  <option value="Normal">Normal (Sin novedades)</option>
                  <option value="Lluvia">Temporada de Lluvias</option>
                  <option value="Bloqueos">Posibles Bloqueos/Marchas</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Modo de selección de choferes</label>
                <div className="btn-group w-100" role="group">
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ backgroundColor: modoSeleccion === 'porGrupo' ? '#669df6' : '#1a1c1e', color: modoSeleccion === 'porGrupo' ? '#1a1c1e' : '#9aa0a6', border: '1px solid #444' }} 
                    onClick={() => setModoSeleccion('porGrupo')}
                  >Por Grupo</button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ backgroundColor: modoSeleccion === 'todos' ? '#669df6' : '#1a1c1e', color: modoSeleccion === 'todos' ? '#1a1c1e' : '#9aa0a6', border: '1px solid #444', borderLeft: 'none', borderRight: 'none' }} 
                    onClick={() => setModoSeleccion('todos')}
                  >Todos</button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ backgroundColor: modoSeleccion === 'seleccionados' ? '#669df6' : '#1a1c1e', color: modoSeleccion === 'seleccionados' ? '#1a1c1e' : '#9aa0a6', border: '1px solid #444' }} 
                    onClick={() => setModoSeleccion('seleccionados')}
                  >Seleccionados</button>
                </div>
              </div>

              {modoSeleccion === 'porGrupo' && (
                <div className="mb-4">
                  <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Seleccionar Grupo</label>
                  <select 
                    className="form-select border-0" 
                    style={{ backgroundColor: '#1a1c1e', color: 'white' }} 
                    value={grupoSeleccionado} 
                    onChange={(e) => setGrupoSeleccionado(e.target.value)}
                  >
                    <option value="" style={{ color: '#9aa0a6' }}>-- Elige un grupo --</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                  </select>
                </div>
              )}

              {modoSeleccion === 'seleccionados' && (
                <div className="mb-4 p-3 rounded-3" style={{ backgroundColor: '#1a1c1e' }}>
                  <label className="form-label small fw-bold" style={{ color: '#9aa0a6' }}>Choferes seleccionados</label>
                  <div className="small mb-3" style={{ color: '#5f6368' }}>Marca los choferes que quieres incluir en la generación.</div>
                  <div className="d-flex flex-column gap-2 custom-scrollbar" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {choferesReales.map(chofer => (
                      <label key={chofer.id} className="form-check form-check-inline align-items-center m-0">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          style={{ backgroundColor: choferesSeleccionados.includes(chofer.id) ? '#669df6' : 'transparent', borderColor: '#5f6368' }}
                          checked={choferesSeleccionados.includes(chofer.id)}
                          onChange={(e) => {
                            const seleccion = e.target.checked;
                            setChoferesSeleccionados(prev => seleccion ? [...prev, chofer.id] : prev.filter(id => id !== chofer.id));
                          }}
                        />
                        <span className="form-check-label ms-2" style={{ color: '#e8eaed' }}>{chofer.nombre_completo} <span style={{ color: '#9aa0a6' }}>({chofer.ci})</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-4 small" style={{ color: '#9aa0a6' }}>
                Nota: la semana y la variable no son obligatorias. Si no ingresas semana, se toma la semana actual.
              </div>

              <button 
                className="btn w-100 py-2 fw-bold shadow-sm rounded-pill d-flex align-items-center justify-content-center gap-2" 
                style={{ backgroundColor: '#669df6', color: '#1a1c1e' }} 
                onClick={handleGenerarPlanificacion}
              >
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="18" height="18">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generar Planificación
              </button>
            </div>
          </div>

          {/* --- SECCIÓN 3: RESULTADOS (HOJA DE CONTROL) --- */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 rounded-4 p-4 h-100" style={{ backgroundColor: '#2d3034' }}>
              {!planificacionGenerada ? (
                <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{ color: '#5f6368', minHeight: '300px' }}>
                  <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" width="48" height="48" className="mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mb-0 fw-bold fs-5" style={{ color: '#9aa0a6' }}>Esperando planificación...</p>
                  <p className="small">Completa el formulario y haz clic en generar.</p>
                </div>
              ) : (
                <>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0" style={{ color: '#e8eaed' }}>
                      Hoja de Control: {modoSeleccion === 'todos' ? 'Todos los choferes' : modoSeleccion === 'seleccionados' ? 'Choferes seleccionados' : grupos.find(g => g.id.toString() === grupoSeleccionado)?.nombre || 'Grupo seleccionado'}
                    </h5>
                    <button 
                      className="btn btn-sm fw-bold shadow-sm rounded-pill d-flex align-items-center gap-2 px-3 py-2" 
                      style={{ backgroundColor: 'transparent', color: '#669df6', border: '1px solid #669df6' }} 
                      onClick={handleGuardarPlanificacion}
                    >
                      <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                      </svg>
                      Guardar Rutas
                    </button>
                  </div>

                  {/* PESTAÑAS DE DÍAS */}
                  <ul className="nav nav-tabs mb-3 border-bottom-0 gap-2">
                    {diasSemana.map(dia => (
                      <li className="nav-item" key={dia}>
                        <button 
                          className={`nav-link border-0 rounded-pill px-4 ${diaActivo === dia ? 'fw-bold' : ''}`}
                          style={{ 
                            backgroundColor: diaActivo === dia ? '#1a1c1e' : 'transparent', 
                            color: diaActivo === dia ? '#669df6' : '#9aa0a6',
                            transition: 'all 0.2s ease-in-out'
                          }}
                          onClick={() => setDiaActivo(dia)}
                        >
                          {dia}
                        </button>
                      </li>
                    ))}
                  </ul>

                  {/* TABLA DEL DÍA SELECCIONADO */}
                  <div className="table-responsive rounded-4 p-0 custom-scrollbar" style={{ maxHeight: '400px', backgroundColor: '#111827', border: '1px solid rgba(148,163,184,0.1)' }}>
                    <table className="table table-borderless align-middle text-center mb-0" style={{ backgroundColor: '#111827' }}>
                      <thead style={{ borderBottom: '1px solid #3a3d40', backgroundColor: '#0f1720' }}>
                        <tr>
                          <th className="text-start ps-4 py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Chofer</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 1 (Inicio)</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 2</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 3</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 4</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 5</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 6</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 7</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 8</th>
                          <th className="py-3 fw-normal" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 9</th>
                          <th className="py-3 fw-normal pe-4" style={{ color: '#9aa0a6', fontSize: '0.85rem' }}>Vuelta 10</th>
                        </tr>
                      </thead>
                      <tbody>
                        {planificacionGenerada[diaActivo].map((fila, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid #24303b', backgroundColor: idx % 2 === 0 ? '#111827' : '#141b24' }}>
                            {/* CORRECCIÓN AQUÍ: Se eliminó el d-flex del td y se agregó un div interno */}
                            <td className="text-start ps-4 py-3 text-white" style={{ whiteSpace: 'nowrap' }}>
                              <div className="d-flex align-items-center gap-2">
                                <svg fill="none" stroke="#9aa0a6" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>{fila.nombre}</span>
                              </div>
                            </td>
                            {fila.vueltas.map((ruta, i) => (
                              <td key={i} className="py-3 text-white" style={{ minWidth: '100px' }}>
                                <span 
                                  className="badge rounded-pill px-3 py-2 fw-normal"
                                  style={{ 
                                    backgroundColor: i === 0 ? '#3b82f6' : '#141b24', 
                                    color: i === 0 ? '#ffffff' : '#e8eaed',
                                    border: i !== 0 ? '1px solid rgba(148,163,184,0.15)' : 'none'
                                  }}
                                >
                                  {ruta}
                                </span>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-3 d-flex align-items-center gap-2 small" style={{ color: '#9aa0a6' }}>
                    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="16" height="16">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Haz clic en "Guardar Rutas" para registrar oficialmente esta planificación en la base de datos.
                  </div>
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
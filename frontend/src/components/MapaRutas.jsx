import { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function AjustarVista({ puntos }) {
  const map = useMap();

  useEffect(() => {
    if (puntos.length) {
      map.fitBounds(puntos, { padding: [40, 40] });
    }
  }, [map, puntos]);

  return null;
}

function ClickMap({ editable, onAddPoint }) {
  useMapEvents({
    click(e) {
      if (editable && onAddPoint) {
        onAddPoint([e.latlng.lat, e.latlng.lng]);
      }
    },
  });

  return null;
}

const rutasEjemplo = {
  Maica: [
    [-17.3981, -66.1639],
    [-17.4023, -66.1658],
    [-17.4088, -66.1691],
    [-17.4136, -66.1724],
  ],
  Cochabamba: [
    [-17.3945, -66.1492],
    [-17.3920, -66.1460],
    [-17.3891, -66.1430],
  ],
  ZonaNorte: [
    [-17.3894, -66.1288],
    [-17.3925, -66.1317],
    [-17.3968, -66.1354],
  ],
};

function obtenerPuntosDeRuta(rutaSeleccionada) {
  if (!rutaSeleccionada) return rutasEjemplo.Maica;
  if (Array.isArray(rutaSeleccionada)) return rutaSeleccionada;

  if (typeof rutaSeleccionada === 'string') {
    return rutasEjemplo[rutaSeleccionada] || rutasEjemplo.Maica;
  }

  if (typeof rutaSeleccionada === 'object') {
    if (Array.isArray(rutaSeleccionada.coordenadas) && rutaSeleccionada.coordenadas.length) {
      return rutaSeleccionada.coordenadas;
    }

    const nombre = rutaSeleccionada.nombre || rutaSeleccionada.ruta_asignada_nombre;
    if (nombre && rutasEjemplo[nombre]) {
      return rutasEjemplo[nombre];
    }

    if (typeof rutaSeleccionada.latitud === 'number' && typeof rutaSeleccionada.longitud === 'number') {
      return [[rutaSeleccionada.latitud, rutaSeleccionada.longitud]];
    }
  }

  return rutasEjemplo.Maica;
}

export default function MapaRutas({ rutaSeleccionada = 'Maica', points = null, editable = false, onAddPoint, height = '320px' }) {
  const puntos = points ?? obtenerPuntosDeRuta(rutaSeleccionada);
  const center = puntos.length ? puntos[Math.floor(puntos.length / 2)] : [-17.399, -66.16];

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {puntos.length > 1 && <Polyline positions={puntos} color="#1d4ed8" weight={5} />}
        {puntos.map((pos, index) => (
          <Marker key={index} position={pos}>
            <Popup>
              {index === 0 && 'Inicio'}
              {index > 0 && index === puntos.length - 1 && 'Destino'}
              {index > 0 && index < puntos.length - 1 && `Parada ${index}`}
            </Popup>
          </Marker>
        ))}
        <AjustarVista puntos={puntos} />
        <ClickMap editable={editable} onAddPoint={onAddPoint} />
      </MapContainer>
    </div>
  );
}

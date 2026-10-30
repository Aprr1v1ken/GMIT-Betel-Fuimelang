import React from 'react';
import { APIProvider, Map, AdvancedMarker, Marker, Pin } from '@vis.gl/react-google-maps';
import { ExternalLink, MapPin } from 'lucide-react';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID, getStandardMarkerIcon } from '../utils/google-maps.ts';

const DEFAULT_CENTER = { lat: -8.2384, lng: 124.5802 };

export const RayonMapPicker: React.FC<{
  latitude: string;
  longitude: string;
  onSelect: (latitude: number, longitude: number) => void;
}> = ({ latitude, longitude, onSelect }) => {
  const apiKey = GOOGLE_MAPS_API_KEY;
  const mapId = GOOGLE_MAPS_MAP_ID;
  const lat = Number(latitude);
  const lng = Number(longitude);
  const valid = latitude !== '' && longitude !== '' && Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  const position = valid ? { lat, lng } : null;
  const externalUrl = position
    ? `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
    : `https://www.google.com/maps/@${DEFAULT_CENTER.lat},${DEFAULT_CENTER.lng},15z`;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-slate-300 font-semibold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-cyan-300" />Pilih Titik di Google Maps</span>
        <a href={externalUrl} target="_blank" rel="noreferrer" className="text-cyan-300 hover:text-cyan-200 flex items-center gap-1">Buka Google Maps<ExternalLink className="w-3 h-3" /></a>
      </div>
      {apiKey ? (
        <>
          <div className="h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
            <APIProvider apiKey={apiKey}>
              <Map
                defaultCenter={position || DEFAULT_CENTER}
                defaultZoom={position ? 17 : 14}
                mapId={mapId}
                gestureHandling="greedy"
                disableDefaultUI={false}
                onClick={(event: any) => {
                  const point = event.detail?.latLng;
                  if (point && Number.isFinite(point.lat) && Number.isFinite(point.lng)) onSelect(point.lat, point.lng);
                }}
              >
                {position && (mapId ? (
                  <AdvancedMarker position={position} title="Lokasi rayon">
                    <Pin background="#06b6d4" glyphColor="#ffffff" borderColor="#155e75" />
                  </AdvancedMarker>
                ) : (
                  <Marker position={position} title="Lokasi rayon" icon={getStandardMarkerIcon('#06b6d4', '#155e75')} />
                ))}
              </Map>
            </APIProvider>
          </div>
          <p className="text-[10px] text-slate-500">Klik peta untuk memindahkan penanda rayon. Koordinat akan terisi otomatis dan tetap dapat dikoreksi manual.</p>
        </>
      ) : (
        <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/50 text-[11px] text-slate-400 leading-relaxed">
          Pemilih peta interaktif memerlukan <code>VITE_GOOGLE_MAPS_API_KEY</code>. Anda tetap dapat membuka Google Maps, memilih lokasi, lalu menyalin latitude/longitude ke kolom manual di bawah.
        </div>
      )}
    </div>
  );
};

export default RayonMapPicker;

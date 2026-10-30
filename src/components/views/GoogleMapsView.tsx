import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  Marker,
  Pin,
  InfoWindow,
} from '@vis.gl/react-google-maps';
import {
  MapPin,
  Navigation,
  Layers,
  Users,
  Compass,
  Phone,
  ExternalLink,
  Church,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import type { Member, Rayon } from '../../types/index.ts';
import { GOOGLE_MAPS_API_KEY, GOOGLE_MAPS_MAP_ID, getStandardMarkerIcon } from '../../utils/google-maps.ts';

interface GoogleMapsViewProps {
  members: Member[];
  rayons: Rayon[];
}

interface ChurchPoint {
  id: string;
  name: string;
  category: 'church' | 'rayon' | 'family';
  position: { lat: number; lng: number };
  description: string;
  leader?: string;
  phone?: string;
  memberCount?: number;
}

export const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({
  members,
  rayons,
}) => {
  const apiKey = GOOGLE_MAPS_API_KEY;
  const mapId = GOOGLE_MAPS_MAP_ID;

  // Center coordinate: GMIT Betel Fuimelang, Desa Lembur Tengah, Alor Tengah Utara, NTT
  const defaultCenter = { lat: -8.2384, lng: 124.5802 };
  const [selectedPoint, setSelectedPoint] = useState<ChurchPoint | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [mapZoom, setMapZoom] = useState(14);
  const [center, setCenter] = useState(defaultCenter);

  // Only saved coordinates become rayon markers. Unmapped rayons are never
  // assigned a fabricated location.
  const mappedRayons = rayons.filter((rayon) =>
    typeof rayon.latitude === 'number' && Number.isFinite(rayon.latitude) &&
    typeof rayon.longitude === 'number' && Number.isFinite(rayon.longitude)
  );
  const churchLocations: ChurchPoint[] = [
    {
      id: 'church_main',
      name: 'Gedung Gereja GMIT Betel Fuimelang',
      category: 'church',
      position: defaultCenter,
      description: 'Pusat Ibadah Raya, Kantor Majelis Jemaat, dan Gedung Kebaktian Utama GMIT Betel Fuimelang.',
      leader: 'Pdt. Sonya W. Isu, S.Th (Ketua Majelis)',
      phone: '085173095482',
      memberCount: members.length,
    },
    ...mappedRayons.map((rayon) => ({
      id: `rayon_${rayon.id}`,
      name: `Pos Pelayanan ${rayon.name}`,
      category: 'rayon' as const,
      position: { lat: rayon.latitude as number, lng: rayon.longitude as number },
      description: rayon.coverageArea || 'Wilayah pelayanan rayon GMIT Betel Fuimelang.',
      leader: rayon.leaderName || 'Koordinator belum diisi',
      phone: rayon.leaderPhone || '',
      memberCount: members.filter((m) => m.rayonId === rayon.id).length,
    })),
  ];

  // Household markers are intentionally not inferred from names/addresses.
  // They can be added later from explicitly stored household coordinates.
  const allPoints = churchLocations;

  const filteredPoints = allPoints.filter((pt) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'church' && pt.category === 'church') return true;
    if (filterCategory === 'rayon' && pt.category === 'rayon') return true;
    return false;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0a182c] via-[#09152b] to-[#122240] border border-blue-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                <Compass className="w-3 h-3 text-blue-400" />
                Sistem Informasi Geografis & Peta Wilayah
              </span>
              <span className="text-xs text-slate-400">GMIT BETEL FUIMELANG</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Peta Pelayanan & Sebaran Rayon
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Pemetaan interaktif Gedung Gereja Betel Fuimelang, {rayons.length} Pos Pelayanan Rayon, dan sebaran tempat tinggal jemaat di Desa Lembur Tengah, Klasis Alor Tengah Utara, Kabupaten Alor, Nusa Tenggara Timur.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${defaultCenter.lat},${defaultCenter.lng}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition shadow-md cursor-pointer"
            >
              <Navigation className="w-4 h-4" />
              <span>Buka Petunjuk Arah</span>
            </a>
          </div>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#0c1329] border border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            Filter Peta:
          </span>
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0 ${
              filterCategory === 'all'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Semua Titik ({allPoints.length})
          </button>
          <button
            onClick={() => setFilterCategory('church')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0 ${
              filterCategory === 'church'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Gedung Gereja (1)
          </button>
          <button
            onClick={() => setFilterCategory('rayon')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer shrink-0 ${
              filterCategory === 'rayon'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Pos Rayon Terpetakan ({mappedRayons.length})
          </button>
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
          <span>Lat: -8.2384 | Lng: 124.5802</span>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-xl relative h-[540px]">
            {apiKey ? (
              <APIProvider apiKey={apiKey}>
                <Map
                  id="church-map"
                  mapId={mapId}
                  defaultCenter={defaultCenter}
                  center={center}
                  defaultZoom={14}
                  zoom={mapZoom}
                  onZoomChanged={(e) => setMapZoom(e.detail.zoom)}
                  onCenterChanged={(e) => setCenter(e.detail.center)}
                  internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                  style={{ width: '100%', height: '100%' }}
                  gestureHandling="greedy"
                  fullscreenControl={true}
                >
                  {filteredPoints.map((pt) => {
                    const isChurch = pt.category === 'church';
                    const isRayon = pt.category === 'rayon';

                    const background = isChurch ? '#f59e0b' : isRayon ? '#10b981' : '#0284c7';
                    const borderColor = isChurch ? '#b45309' : isRayon ? '#047857' : '#0369a1';

                    return mapId ? (
                      <AdvancedMarker
                        key={pt.id}
                        position={pt.position}
                        title={pt.name}
                        onClick={() => setSelectedPoint(pt)}
                      >
                        <Pin background={background} borderColor={borderColor} glyphColor="#ffffff" />
                      </AdvancedMarker>
                    ) : (
                      <Marker
                        key={pt.id}
                        position={pt.position}
                        title={pt.name}
                        onClick={() => setSelectedPoint(pt)}
                        icon={getStandardMarkerIcon(background, borderColor)}
                      />
                    );
                  })}

                  {selectedPoint && (
                    <InfoWindow
                      position={selectedPoint.position}
                      onCloseClick={() => setSelectedPoint(null)}
                    >
                      <div className="p-1 max-w-xs text-slate-900 font-sans">
                        <div className="flex items-center gap-1.5 font-bold text-xs mb-1">
                          {selectedPoint.category === 'church' ? (
                            <Church className="w-4 h-4 text-amber-600" />
                          ) : (
                            <MapPin className="w-4 h-4 text-emerald-600" />
                          )}
                          <span>{selectedPoint.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-700 leading-snug">{selectedPoint.description}</p>
                        {selectedPoint.leader && (
                          <p className="text-[11px] text-slate-800 font-semibold mt-1">
                            Koordinator: {selectedPoint.leader}
                          </p>
                        )}
                        {selectedPoint.phone && (
                          <p className="text-[11px] text-slate-600 mt-0.5">Kontak: {selectedPoint.phone}</p>
                        )}
                        <div className="mt-2 pt-1.5 border-t border-slate-200 flex justify-between items-center text-[10px]">
                          <span className="font-mono text-slate-500">
                            {selectedPoint.position.lat.toFixed(4)}, {selectedPoint.position.lng.toFixed(4)}
                          </span>
                          <a
                            href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPoint.position.lat},${selectedPoint.position.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <span>Rute</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
                <AlertTriangle className="w-10 h-10 text-amber-400 mb-2" />
                <p className="text-sm font-bold text-white">Google Maps API Key Belum Terpasang</p>
                <p className="text-xs text-slate-500 mt-1 max-w-md leading-relaxed">
                  Tambahkan <code>VITE_GOOGLE_MAPS_API_KEY</code> pada Environment Variables Vercel, lalu deploy ulang. Map ID bersifat opsional; input koordinat manual tetap tersedia di pengaturan rayon.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Point of Interest List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-[#0c1329] border border-slate-800 shadow-md flex flex-col h-[540px]">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-3">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Daftar Titik Pelayanan ({filteredPoints.length})</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredPoints.map((pt) => {
                const isSelected = selectedPoint?.id === pt.id;
                const isChurch = pt.category === 'church';
                const isRayon = pt.category === 'rayon';

                return (
                  <div
                    key={pt.id}
                    onClick={() => {
                      setSelectedPoint(pt);
                      setCenter(pt.position);
                      setMapZoom(16);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-950/50 border-blue-400 shadow-sm'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            isChurch
                              ? 'bg-amber-500/20 text-amber-400'
                              : isRayon
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-sky-500/20 text-sky-400'
                          }`}
                        >
                          {isChurch ? <Church className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">{pt.name}</h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">{pt.description}</p>
                          {pt.leader && (
                            <p className="text-[10px] text-slate-300 font-medium mt-1">
                              {pt.leader} {pt.memberCount ? `(${pt.memberCount} Jiwa)` : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, MapPin, Phone, Mail, Navigation, Copy, Check, Info } from 'lucide-react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';
import toast from 'react-hot-toast';

interface MapViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyName: string;
  address: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
}

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Default center coordinates - São Paulo, SP, Brazil
const DEFAULT_LAT = -23.55052;
const DEFAULT_LNG = -46.633308;

export default function MapViewerModal({
  isOpen,
  onClose,
  companyName,
  address,
  phone = '',
  email = '',
  latitude,
  longitude,
}: MapViewerModalProps) {
  const [copied, setCopied] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [resolvedCoords, setResolvedCoords] = useState<{ lat: number; lng: number }>({
    lat: latitude || DEFAULT_LAT,
    lng: longitude || DEFAULT_LNG,
  });
  const [geoError, setGeoError] = useState<string | null>(null);

  // Parse coords or fallback if coordinates are undefined
  useEffect(() => {
    if (latitude && longitude) {
      setResolvedCoords({ lat: latitude, lng: longitude });
    } else {
      // If coordinates are missing, let's set a realistic random offset around default 
      // just to have a marker on the mockup map, or use default Sao Paulo center
      setResolvedCoords({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
    }
  }, [latitude, longitude]);

  // Handle geolocation to compute distance to destination
  useEffect(() => {
    if (!isOpen) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserCoords({ lat: userLat, lng: userLng });

          const destLat = latitude || DEFAULT_LAT;
          const destLng = longitude || DEFAULT_LNG;

          // Calculate Haversine distance
          const dist = getDistanceInKm(userLat, userLng, destLat, destLng);
          setDistance(dist);
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setGeoError('Não foi possível obter sua localização atual para calcular distância.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setGeoError('Geolocalização não suportada no seu navegador.');
    }
  }, [isOpen, latitude, longitude]);

  // Haversine formula
  const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Km
  };

  const deg2rad = (deg: number) => deg * (Math.PI / 180);

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    toast.success('Endereço copiado!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDirections = () => {
    const destLat = latitude || DEFAULT_LAT;
    const destLng = longitude || DEFAULT_LNG;
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}`;
    if (userCoords) {
      url += `&origin=${userCoords.lat},${userCoords.lng}`;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {companyName}
            </h3>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5">
              Visualização de Localização
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map Area */}
        <div className="relative w-full h-[320px] bg-slate-100 dark:bg-slate-950 flex-grow shrink-0">
          {hasValidKey ? (
            <APIProvider apiKey={API_KEY} version="weekly">
              <Map
                defaultCenter={resolvedCoords}
                defaultZoom={15}
                mapId="PROSTAFF_MAP_VIEWER"
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                style={{ width: '100%', height: '100%' }}
                gestureHandling="cooperative"
                disableDefaultUI={false}
              >
                <AdvancedMarker position={resolvedCoords} title={companyName}>
                  <Pin background="#2563EB" glyphColor="#ffffff" borderColor="#1D4ED8" />
                </AdvancedMarker>
              </Map>
            </APIProvider>
          ) : (
            /* Standalone Preview Mockup Map fallback with clear warning and interactive layout */
            <div className="w-full h-full relative overflow-hidden bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
              {/* Fake Map Grid Background */}
              <div 
                className="absolute inset-0 opacity-10 bg-repeat pointer-events-none" 
                style={{ 
                  backgroundImage: `radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)`,
                  backgroundSize: '24px 24px'
                }} 
              />
              
              {/* Fake Map Roads Pattern */}
              <div className="absolute inset-0 opacity-20 pointer-events-none border-t border-b border-dashed border-slate-700 my-12" />
              <div className="absolute inset-x-12 inset-0 opacity-20 pointer-events-none border-l border-r border-dashed border-slate-700" />
              
              <div className="relative z-10 max-w-sm bg-slate-950/80 backdrop-blur-md p-6 rounded-3xl border border-slate-800 space-y-4">
                <div className="w-12 h-12 bg-blue-600/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto animate-bounce">
                  <MapPin size={28} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-wider">Demo Map / Chave Pendente</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                    Integrado ao Google Maps. Para habilitá-lo, defina a chave <strong>GOOGLE_MAPS_PLATFORM_KEY</strong> em AI Studio Secrets (Configurações ⚙️ → Secrets).
                  </p>
                </div>
                <div className="text-[9px] font-bold text-slate-500 text-left bg-slate-900 border border-slate-800 p-3 rounded-xl divide-y divide-slate-800/10">
                  <p className="pb-1 text-center font-black uppercase text-blue-400">Coordenadas da Vaga</p>
                  <p className="pt-1 flex justify-between"><span>Latitude:</span> <span className="font-mono text-white">{resolvedCoords.lat.toFixed(6)}</span></p>
                  <p className="pt-1 flex justify-between"><span>Longitude:</span> <span className="font-mono text-white">{resolvedCoords.lng.toFixed(6)}</span></p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location Information Card Details */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto max-h-[30vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side: Address Details */}
            <div className="space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                  Endereço Completo
                </span>
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-normal">
                    {address || 'Endereço não cadastrado'}
                  </p>
                </div>
              </div>

              {distance !== null && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                  <Navigation size={13} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-black text-blue-700 dark:text-blue-400">
                    A ~{distance.toFixed(1)} km da sua localização atual
                  </span>
                </div>
              )}
            </div>

            {/* Right Side: Contact Details */}
            <div className="space-y-4">
              <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                Contato da Empresa
              </span>
              <div className="space-y-3">
                {phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone size={14} className="text-slate-400 shrink-0" />
                    <a
                      href={`tel:${phone.replace(/\D/g, '')}`}
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2.5">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${email}`}
                      className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                )}
                {!phone && !email && (
                  <p className="text-xs font-bold italic text-slate-400">Contato não disponível</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-b-[2.5rem] flex flex-col sm:flex-row gap-3 shrink-0">
          <button
            onClick={handleCopyAddress}
            disabled={!address}
            className="flex-1 py-4 bg-white dark:bg-zinc-900 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-500" /> Copiado!
              </>
            ) : (
              <>
                <Copy size={16} /> Copiar Endereço
              </>
            )}
          </button>

          <button
            onClick={handleOpenDirections}
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/10 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Navigation size={16} /> Obter Direções
          </button>

          <button
            onClick={onClose}
            className="sm:w-32 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black uppercase tracking-widest text-[10px] sm:text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            Voltar
          </button>
        </div>
      </motion.div>
    </div>
  );
}

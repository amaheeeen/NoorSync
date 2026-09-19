import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MapPin, X, Crosshair } from 'lucide-react';
import { CityLocation } from '../types';
import { POPULAR_CITIES } from '../data/islamicData';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCity: (city: CityLocation) => void;
  onSelectGPS: (lat: number, lng: number) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSelectCity,
  onSelectGPS,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);

  const handleDetectGPS = () => {
    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      setGpsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLoading(false);
          onSelectGPS(pos.coords.latitude, pos.coords.longitude);
          onClose();
        },
        (err) => {
          setGpsLoading(false);
          alert('GPS location permission denied or unavailable. Fallback to Jakarta.');
        },
        { timeout: 10000 }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const filteredCities = POPULAR_CITIES.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          id="modal-location-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
        >
          <motion.div 
            id="modal-location-content"
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 28, 
              stiffness: 350,
              mass: 0.8
            }}
            onClick={(e) => e.stopPropagation()}
            className="liquid-glass rounded-3xl p-5 w-full max-w-sm space-y-4 border border-white/20 shadow-glass"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#4ADE80]" />
                Change Location
              </h4>
              <button
                id="btn-close-location-modal"
                onClick={onClose}
                className="text-slate-400 hover:text-white p-1 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* GPS Action */}
            <button
              id="btn-use-real-gps"
              onClick={handleDetectGPS}
              disabled={gpsLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#4ADE80]/20 text-[#86EFAC] border border-[#4ADE80]/30 text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#4ADE80]/30 active:scale-95 transition-all shadow-glow-mint"
            >
              <Crosshair className={`w-4 h-4 ${gpsLoading ? 'animate-spin' : ''}`} />
              <span>{gpsLoading ? 'Acquiring GPS Fix...' : 'Use Real GPS Geolocation'}</span>
            </button>

            {/* Search input */}
            <div className="relative">
              <input
                id="input-city-search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search city (e.g. Jakarta, London, Cairo)..."
                className="w-full bg-[#061917]/90 border border-white/15 rounded-2xl py-2 px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#EAD8B1] transition-colors"
              />
            </div>

            {/* Popular quick cities */}
            <div className="space-y-1.5 text-xs">
              <p className="text-[11px] font-semibold text-slate-400">Popular Quick Cities:</p>
              <div className="grid grid-cols-3 gap-1.5 pt-1 max-h-48 overflow-y-auto no-scrollbar">
                {filteredCities.map((city) => (
                  <button
                    key={city.name}
                    id={`btn-select-city-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className="p-2 rounded-xl liquid-glass text-[11px] font-medium text-slate-200 hover:text-[#86EFAC] hover:border-[#4ADE80]/40 transition-all text-center border border-white/5 active:scale-95"
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

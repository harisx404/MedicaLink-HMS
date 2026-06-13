import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useGetAmbulancesQuery } from '../api/emergencyApi';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { Car, PhoneCall, Navigation, User, AlertTriangle } from 'lucide-react';
import type { IAmbulance } from '@medicalink/shared';

// Use a random default key as requested; will be replaced by user later.
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.eyJ1IjoicmFuZG9tLWtleS1wbGVhc2UtcmVwbGFjZSIsImEiOiJjbHJhbmRvbS1rZXktcGxlYXNlLXJlcGxhY2UifQ.random-key-please-replace';
mapboxgl.accessToken = MAPBOX_TOKEN;

export const AmbulanceTracking: React.FC = () => {
  const { data: ambulancesRes } = useGetAmbulancesQuery();
  const [ambulances, setAmbulances] = useState<IAmbulance[]>([]);
  const { token, tenantId } = useSelector((state: RootState) => state.auth as any);
  const [selectedAmbulance, setSelectedAmbulance] = useState<IAmbulance | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  useEffect(() => {
    if (ambulancesRes?.data) {
      setAmbulances(ambulancesRes.data);
    }
  }, [ambulancesRes]);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      query: { tenantId }
    });

    socket.on('emergency:ambulance-location', (updatedAmbulance: IAmbulance) => {
      setAmbulances(prev => prev.map(amb => amb._id === updatedAmbulance._id ? updatedAmbulance : amb));
    });

    return () => {
      socket.disconnect();
    };
  }, [token, tenantId]);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-0.1276, 51.5072],
      zoom: 12
    });
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
  }, []);

  useEffect(() => {
    if (!map.current) return;
    
    // Update markers
    ambulances.forEach(amb => {
      if (!amb.location) return;
      
      const el = document.createElement('div');
      el.className = `p-2 rounded-full shadow-lg border-2 cursor-pointer transition-transform hover:scale-110 ${
        amb.currentStatus === 'AVAILABLE' ? 'bg-green-500 border-white' : 'bg-rose-500 border-white animate-pulse'
      }`;
      el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`;
      
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        setSelectedAmbulance(amb);
      });

      if (markersRef.current[amb._id!]) {
        markersRef.current[amb._id!].setLngLat([amb.location.lng, amb.location.lat]);
      } else {
        markersRef.current[amb._id!] = new mapboxgl.Marker({ element: el })
          .setLngLat([amb.location.lng, amb.location.lat])
          .addTo(map.current!);
      }
    });

    // Cleanup removed ambulances
    const activeIds = ambulances.map(a => a._id!);
    Object.keys(markersRef.current).forEach(id => {
      if (!activeIds.includes(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

  }, [ambulances]);

  return (
    <div className="h-[calc(100vh-120px)] flex space-x-6 animate-in fade-in duration-500">
      
      {/* Sidebar List */}
      <div className="w-80 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
          <h2 className="font-bold flex items-center">
            <Car size={18} className="mr-2 text-indigo-400" /> Fleet Tracking
          </h2>
          <span className="text-xs bg-indigo-500/20 px-2 py-1 rounded-md">{ambulances.length} Active</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {ambulances.length === 0 ? (
            <p className="text-slate-500 text-center py-4 text-sm">No ambulances registered.</p>
          ) : (
            ambulances.map(amb => (
              <div 
                key={amb._id} 
                onClick={() => setSelectedAmbulance(amb)}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedAmbulance?._id === amb._id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-800">{amb.vehicleNumber}</span>
                  <span className={`text-xs px-2 py-1 rounded-md font-semibold ${
                    amb.currentStatus === 'AVAILABLE' ? 'bg-green-100 text-green-700' :
                    amb.currentStatus === 'DISPATCHED' ? 'bg-amber-100 text-amber-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {amb.currentStatus}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center">
                  <User size={12} className="mr-1" /> {amb.driverName}
                </div>
                <div className="text-xs text-slate-500 flex items-center mt-1">
                  <PhoneCall size={12} className="mr-1" /> {amb.driverPhone}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Map View */}
      <div className="flex-1 bg-slate-100 rounded-xl overflow-hidden relative shadow-inner border border-slate-200">
        <div ref={mapContainer} className="w-full h-full" />

        {selectedAmbulance && selectedAmbulance.location && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white p-4 rounded-xl shadow-2xl border min-w-[280px]">
            <div className="flex justify-between items-start mb-2 border-b pb-2">
              <h3 className="font-bold text-slate-900">{selectedAmbulance.vehicleNumber}</h3>
              <button onClick={() => setSelectedAmbulance(null)} className="text-slate-400 hover:text-slate-600">&times;</button>
            </div>
            <div className="space-y-1 text-sm">
              <p><span className="text-slate-500">Status:</span> <b>{selectedAmbulance.currentStatus}</b></p>
              <p><span className="text-slate-500">Driver:</span> {selectedAmbulance.driverName}</p>
              <p><span className="text-slate-500">Phone:</span> {selectedAmbulance.driverPhone}</p>
              <p className="text-xs text-slate-400 mt-2 flex items-center">
                <Navigation size={10} className="mr-1" /> 
                Updated: {new Date(selectedAmbulance.location.updatedAt).toLocaleTimeString()}
              </p>
            </div>
          </div>
        )}

        {/* Note overlay if Mapbox token is missing */}
        {MAPBOX_TOKEN.includes('random-key') && (
          <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-lg shadow-lg border-l-4 border-amber-500 backdrop-blur max-w-sm">
            <h4 className="font-bold text-amber-700 flex items-center">
              <AlertTriangle size={16} className="mr-2" /> Mapbox Key Required
            </h4>
            <p className="text-xs text-slate-600 mt-1">
              Currently using a placeholder token. Please set <code className="bg-slate-100 px-1 rounded text-rose-500">VITE_MAPBOX_TOKEN</code> in your environment variables to view the actual map.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const CollegesMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapInstanceRef.current) return;

    const initMap = () => {
      if (!mapRef.current) return false;
      const rect = mapRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;

      const map = L.map(mapRef.current!, {
        attributionControl: true,
        zoomControl: true,
        center: [15.3959, 73.9350],
        zoom: 11.5,
        minZoom: 10,
        maxZoom: 18
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

    const colleges = [
      { name: 'Goa University', location: [15.459139, 73.830186], type: 'Public University', area: 'Taleigao Plateau, Panaji' },
      { name: 'Goa College of Engineering', location: [15.420497, 73.974664], type: 'Engineering College', area: 'Farmagudi, Ponda' },
      { name: 'Government College of Arts, Science and Commerce', location: [15.228185, 74.064698], type: 'Arts & Science College', area: 'Khandola, Marcela' },
      { name: 'Parvatibai Chowgule College', location: [15.289936, 73.980492], type: 'Autonomous College', area: 'Margao' },
      { name: 'Dhempe College of Arts and Science', location: [15.482736, 73.809647], type: 'Arts & Science College', area: 'Miramar, Panaji' },
      { name: 'Shree Damodar College', location: [15.274198, 73.951709], type: 'Commerce & Management', area: 'Margao' },
      { name: 'Don Bosco College of Engineering', location: [15.290833, 73.968611], type: 'Engineering College', area: 'Fatorda' },
      { name: 'Agnel Institute of Technology and Design', location: [15.597500, 73.794300], type: 'Engineering College', area: 'Verna' },
      { name: 'Goa Medical College', location: [15.457831, 73.854664], type: 'Medical College', area: 'Bambolim' },
      { name: 'Fr. Agnel College of Arts and Commerce', location: [15.439326, 73.894149], type: 'Arts & Commerce', area: 'Pilar' },
    ];      const collegeIcon = L.divIcon({
        className: 'college-marker',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
      });

      colleges.forEach((college) => {
        const marker = L.marker(college.location as [number, number], { icon: collegeIcon }).addTo(map);
        const popupContent = `
          <div class="popup-content">
            <h3>${college.name}</h3>
            <p><strong>Type:</strong> ${college.type}</p>
            <p><strong>Location:</strong> ${college.area}</p>
          </div>
        `;
        marker.bindPopup(popupContent);
      });

      L.control.scale().addTo(map);

      return true;
    };

    // If container isn't sized yet, wait using ResizeObserver
    if (!initMap()) {
      let ro: ResizeObserver | null = null;
      if (typeof ResizeObserver !== 'undefined') {
        ro = new ResizeObserver(() => {
          if (initMap() && ro) {
            ro.disconnect();
            ro = null;
          }
        });
        if (mapRef.current) ro.observe(mapRef.current);
      } else {
        // Fallback: try again after a delay
        const id = window.setInterval(() => {
          if (initMap()) {
            window.clearInterval(id);
          }
        }, 250);
      }
    }

    // Ensure Leaflet recalculates size after layout settles
    const invalidate = () => {
      try { mapInstanceRef.current?.invalidateSize(); } catch (e) { /* ignore */ }
    };

    const t1 = window.setTimeout(invalidate, 250);
    const t2 = window.setTimeout(invalidate, 700);
    window.addEventListener('resize', invalidate);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('resize', invalidate);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="colleges-map-wrapper" style={{ height: '100%' }}>
      <div className="header">
        <h1>🎓 Colleges in Goa, India</h1>
        <p>Click on markers to view college information</p>
      </div>

      <div className="map-container">
        <div ref={mapRef} id="map" style={{ height: '100%' }} />
      </div>
    </div>
  );
};

export default CollegesMap;

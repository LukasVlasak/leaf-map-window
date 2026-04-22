import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';

const map = L.map('map').setView([50.08, 14.44], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

import * as L from "leaflet";

export default class MapControls extends HTMLElement {
    private map: L.Map;

    constructor(map: L.Map) {
        super();
        this.map = map;
    }

    connectedCallback(): void {
        this.className = 'br-cluster';

        const locateStack = document.createElement('div');
        locateStack.className = 'control-stack';

        const btnLocate = document.createElement('button');
        btnLocate.className = 'ctl-btn';
        btnLocate.setAttribute('aria-label', 'Sledovat mou polohu');
        btnLocate.innerHTML = `<i class="fa-solid fa-location-crosshairs"></i>`;

        this.locateBtnFunc(btnLocate);

        locateStack.appendChild(btnLocate);
        this.appendChild(locateStack);
    }

    private locateBtnFunc(btnLocate: HTMLButtonElement): void {
        let watching = false;
        let locateMarker: L.CircleMarker | null = null;
        let locateCircle: L.Circle | null = null;

        btnLocate.addEventListener('click', () => {
            if (!navigator.geolocation) return;
            if (watching) {
                this.map.stopLocate();
                if (locateMarker) {
                    this.map.removeLayer(locateMarker);
                    locateMarker = null;
                }
                if (locateCircle) {
                    this.map.removeLayer(locateCircle);
                    locateCircle = null;
                }
                btnLocate.classList.remove('active');
                watching = false;
                return;
            }
            this.map.locate({ watch: true, enableHighAccuracy: true, setView: true, maxZoom: 15 });
            watching = true;
            btnLocate.classList.add('active');
        });

        this.map.on('locationfound', (e: L.LocationEvent) => {
            if (!locateMarker) {
                locateMarker = L.circleMarker(e.latlng, {
                    radius: 7, color: '#fff', weight: 2.5,
                    fillColor: '#0d9488', fillOpacity: 1
                }).addTo(this.map);
                locateCircle = L.circle(e.latlng, {
                    radius: e.accuracy, color: '#0d9488', weight: 1,
                    fillColor: '#0d9488', fillOpacity: 0.08
                }).addTo(this.map);
            } else {
                locateMarker.setLatLng(e.latlng);
                locateCircle!.setLatLng(e.latlng).setRadius(e.accuracy);
            }
        });
    }
}

customElements.define('leaf-map-controls', MapControls);

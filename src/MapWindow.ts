import * as L from "leaflet";

export default class MapWindow {
    map: L.Map;

    constructor(
        element: string = 'map',
        view: L.LatLngExpression = [50.08, 14.44],
        zoom: number = 13,
    ) {
        this.map = L.map(element).setView(view, zoom);
    }

    init(): void {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(this.map);
    }
}
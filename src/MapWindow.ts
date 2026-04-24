import * as L from "leaflet";
import LeftSidebar from "./view/LeftSidebar/LeftSidebar";
import MapControls from "./view/MapControls/MapControls";
import MapLayers from "./view/MapLayers/MapLayers";
import SearchBar from "./view/SearchBar/SearchBar";
import MapStatusBar from "./view/MapStatusBar/MapStatusBar";
import AttributionControl from "./view/AttributionControl/AttributionControl";

export default class MapWindow {
    map: L.Map;

    constructor(
        element: string = 'map',
        view: L.LatLngExpression = [50.08, 14.44],
        zoom: number = 13,
    ) {
        this.map = L.map(element, { attributionControl: false }).setView(view, zoom);
        this.map.zoomControl.setPosition('bottomright');
    }

    init(): void {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        this.initView();
    }

    private initView(): void {
        const container = this.map.getContainer();
        container.appendChild(new LeftSidebar());
        container.appendChild(new MapControls(this.map));
        container.appendChild(new MapLayers());
        container.appendChild(new SearchBar());
        container.appendChild(new MapStatusBar());
        container.appendChild(new AttributionControl());
    }
}
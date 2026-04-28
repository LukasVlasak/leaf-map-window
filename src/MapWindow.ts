import * as L from "leaflet";
import LeftSidebarView from "./view/LeftSidebar/LeftSidebarView";
import MapControlView from "./view/MapControls/MapControlView";
import MapControlModel from "./model/MapControlModel";
import MapLayersView from "./view/MapLayers/MapLayersView";
import SearchBarView from "./view/SearchBar/SearchBarView";
import MapStatusBarView from "./view/MapStatusBar/MapStatusBarView";
import AttributionControlView from "./view/AttributionControl/AttributionControlView";
import MapStatusBarModel from "./model/MapStatusBarModel";

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
        container.appendChild(new LeftSidebarView());

        const mapControlView = new MapControlView();
        container.appendChild(mapControlView);
        new MapControlModel(mapControlView, this.map);

        container.appendChild(new MapLayersView());
        container.appendChild(new SearchBarView());

        const mapStatusBarView = new MapStatusBarView();
        container.appendChild(mapStatusBarView);
        new MapStatusBarModel(mapStatusBarView, this.map);

        container.appendChild(new AttributionControlView());
    }
}
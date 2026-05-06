import * as L from "leaflet";
import LeftSidebarView from "./view/LeftSidebar/LeftSidebarView";
import MapControlView from "./view/MapControls/MapControlView";
import MapControlModel from "./model/MapControlModel";
import MapLayersPanelView from "./view/MapLayers/MapLayersPanelView";
import SearchBarView from "./view/SearchBar/SearchBarView";
import MapStatusBarView from "./view/MapStatusBar/MapStatusBarView";
import AttributionControlView from "./view/AttributionControl/AttributionControlView";
import MapStatusBarModel from "./model/MapStatusBarModel";
import LeftSidebarModel from "./model/LeftSidebarModel";
import ObjectStore from "./store/ObjectStore";
import CanvasView from "./view/components/Canvas/CanvasView";
import CanvasModel from "./model/CanvasModel";
import MapLayersModel from "./model/MapLayersModel";
import MapObjectsModel from "./model/MapObjectsModel";

export default class MapWindow {
    map: L.Map;
    element: string;

    constructor(element: string = 'map', view: L.LatLngExpression = [50.08, 14.44], zoom: number = 13) {
        this.element = element;
        this.map = L.map(element, { attributionControl: false }).setView(view, zoom);
        this.map.zoomControl.setPosition('bottomright');
    }

    init(): void {
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
        this.initView();
    }

    private initView(): void {
        const container = this.map.getContainer();

        const mapLayersPanelView = new MapLayersPanelView();
        container.appendChild(mapLayersPanelView);
        new MapLayersModel(mapLayersPanelView.mapLayersView, this.map);

        const objectStore = new ObjectStore(this.map);
        const mapObjectsModel = new MapObjectsModel(mapLayersPanelView.mapObjectsView, this.map, objectStore);

        const canvasView = new CanvasView();
        document.body.appendChild(canvasView);
        const canvasModel = new CanvasModel(mapObjectsModel, canvasView, this.map);

        const leftSideBarView = new LeftSidebarView();
        container.appendChild(leftSideBarView);
        new LeftSidebarModel(mapObjectsModel, leftSideBarView, this.map, this.element, canvasModel);

        const mapControlView = new MapControlView();
        container.appendChild(mapControlView);
        new MapControlModel(mapControlView, this.map);

        container.appendChild(new SearchBarView());

        const mapStatusBarView = new MapStatusBarView();
        container.appendChild(mapStatusBarView);
        new MapStatusBarModel(mapStatusBarView, this.map);

        container.appendChild(new AttributionControlView());
    }
}

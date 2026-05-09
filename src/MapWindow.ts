import * as L from "leaflet";
import "proj4leaflet";
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
import LayerStore from "./store/LayerStore";
import type {LeafletMouseEvent} from "leaflet";
import RuianConnector from "./ruian/RuianConnector";

const EPSG5514 = new L.Proj.CRS(
    'EPSG:5514',
    '+proj=krovak +lat_0=49.5 +lon_0=24.83333333333333 +alpha=30.28813972222222 +k=0.9999 +x_0=0 +y_0=0 +ellps=bessel +towgs84=570.8,85.7,462.8,4.998,1.587,5.261,3.56 +units=m +no_defs',
    {
        resolutions: [8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5],
        origin: [-960000, -920000] as [number, number],
        bounds: L.bounds([-960000, -1300000], [-400000, -920000]),
    }
);
export default class MapWindow {
    map: L.Map;
    element: string;
    private _ruianConnector: RuianConnector;

    constructor(element: string = 'map', view: L.LatLngExpression = [50.08, 14.44], zoom: number = 7) {
        this.element = element;
        this.map = L.map(element, { attributionControl: false, crs: EPSG5514, maxZoom: 14 }).setView(view, zoom);
        this.map.zoomControl.setPosition('bottomright');
        this._ruianConnector = new RuianConnector();
    }

    init(): void {
        this.initView();
        this.map.on('click', this._onMapClick.bind(this));
    }

    private initView(): void {
        const container = this.map.getContainer();

        const mapLayersPanelView = new MapLayersPanelView();
        container.appendChild(mapLayersPanelView);

        const layerStore = new LayerStore();
        new MapLayersModel(mapLayersPanelView.mapLayersView, this.map, layerStore);

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

    private async _onMapClick(e: LeafletMouseEvent) {
        const epsg5514 = EPSG5514.project(e.latlng);

        let land, municipality, district, region;
        let districtRes, regionRes;
        const [landRes, municipalityRes] = await Promise.all([
            this._ruianConnector.getLandByPoint(epsg5514.x, epsg5514.y),
            this._ruianConnector.getMunicipalityByPoint(epsg5514.x, epsg5514.y)
        ]);
        if (landRes) {
            land = landRes.features?.[0];
        }
        if (municipalityRes) {
            municipality = municipalityRes.features?.[0];
        }

        if (municipality) {
            const districtCode = municipality.properties.okres;
            if (districtCode) {
                districtRes = await this._ruianConnector.getDistrictByCode(districtCode);
            }
        } else {
            districtRes = await this._ruianConnector.getDistrictByPoint(epsg5514.x, epsg5514.y);
        }

        if (districtRes) {
            district = districtRes.features?.[0];
        }
        if (district) {
            const regionCode = district.properties.vusc;
            if (regionCode) {
                regionRes = await this._ruianConnector.getRegionByCode(regionCode);
            }
        } else {
            regionRes = await this._ruianConnector.getRegionByPoint(epsg5514.x, epsg5514.y);
        }

        if (regionRes) {
            region = regionRes.features?.[0];
        }
    }
}

import type MapLayersView from "../view/MapLayers/MapLayersView";
import type LayerStore from "../store/LayerStore";
import type MapLayer from "../objects/MapLayer";

export default class MapLayersModel {
    private _mapLayersView: MapLayersView;
    private _map: L.Map;
    private _layerStore: LayerStore;

    constructor(mapLayersView: MapLayersView, map: L.Map, layerStore: LayerStore) {
        this._mapLayersView = mapLayersView;
        this._map = map;
        this._layerStore = layerStore;

        this._mapLayersView.renderMapLayersGroup(layerStore.layerGroups);
        this._initActiveLayers();
        this._initListeners();
    }

    private _initActiveLayers() {
        for (const group of this._layerStore.layerGroups) {
            for (const layer of group.mapLayers) {
                if (layer.active) {
                    this._map.addLayer(layer.leafletLayer);
                }
            }
        }
    }

    private _initListeners() {
        this._mapLayersView.onBaseLayerChange(this._onBaseLayerChange.bind(this));
        this._mapLayersView.onLayerToggle(this._onAdditionalLayerToggle.bind(this));
        this._mapLayersView.onLayerOpacityChange(this._onLayerOpacityChange.bind(this));
    }

    private _onBaseLayerChange(layer: MapLayer, previous: MapLayer | undefined) {
        if (previous) {
            this._map.removeLayer(previous.leafletLayer);
            previous.active = false;
        }
        this._map.addLayer(layer.leafletLayer);
        layer.active = true;
    }

    private _onAdditionalLayerToggle(layer: MapLayer, isActive: boolean) {
        if (isActive) {
            this._map.addLayer(layer.leafletLayer);
        } else {
            this._map.removeLayer(layer.leafletLayer);
        }
        layer.active = isActive;
    }

    private _onLayerOpacityChange(layer: MapLayer, opacity: number) {
        layer.opacity = opacity;
    }
}

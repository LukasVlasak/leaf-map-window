import type MapLayersView from "../view/MapLayers/MapLayersView";

export default class MapLayersModel {
    private _mapLayersView: MapLayersView;
    private _map: L.Map;

    constructor(mapLayersView: MapLayersView, map: L.Map) {
        this._mapLayersView = mapLayersView;
        this._map = map;
    }
}

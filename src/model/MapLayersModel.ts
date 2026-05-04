import type MapLayersView from "../view/MapLayers/MapLayersView";
import type MapObject from "./MapObject";

export default class MapLayersModel {
    private _mapLayersView: MapLayersView;
    private _map: L.Map;

    constructor(mapLayersView: MapLayersView, map: L.Map) {
        this._mapLayersView = mapLayersView;
        this._map = map;

        this._initListeners();
    }

    _initListeners() {
        this._mapLayersView.onObjectClick(this._onObjectClick.bind(this));
        this._mapLayersView.onObjectRemoveClick(this._onObjectRemoveClick.bind(this));
    }

    _onObjectClick(object: MapObject) {
        console.log(object.type);
    }

    _onObjectRemoveClick(object: MapObject) {
        console.log(object.type);
    }
}
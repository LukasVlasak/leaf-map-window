import {featureGroup} from "leaflet";
import type MapObject from "../model/MapObject";
import type MapLayersView from "../view/MapLayers/MapLayersView";

export default class ObjectStore {
    private _mapObjects: MapObject[] = [];
    private _mapObjectLayer = featureGroup([]);

    private _mapLayersView: MapLayersView;

    constructor(map: L.Map, mapLayersView: MapLayersView) {
        map.addLayer(this._mapObjectLayer);
        this._mapLayersView = mapLayersView;
    }

    addObject(obj: MapObject) {
        this._mapObjects.push(obj);
        this._mapObjectLayer.addLayer(obj.layer);
        this._mapLayersView.addObject(obj);
    }

    removeObject(obj: MapObject) {
        this._mapObjects = this._mapObjects.filter((o) => o !== obj);
        this._mapObjectLayer.removeLayer(obj.layer);
    }
}
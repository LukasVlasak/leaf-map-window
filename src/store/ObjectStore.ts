import {featureGroup} from "leaflet";
import type MapObject from "../objects/MapObject";

export default class ObjectStore {
    private _mapObjects: MapObject[] = [];
    private _mapObjectLayer = featureGroup([]);

    constructor(map: L.Map) {
        map.addLayer(this._mapObjectLayer);
    }

    addObject(obj: MapObject) {
        this._mapObjects.push(obj);
        this._mapObjectLayer.addLayer(obj.layer);
    }

    removeObject(obj: MapObject) {
        this._mapObjects = this._mapObjects.filter((o) => o !== obj);
        this._mapObjectLayer.removeLayer(obj.layer);
    }

    removeAll() {
        this._mapObjects = [];
        this._mapObjectLayer.clearLayers();
    }
}
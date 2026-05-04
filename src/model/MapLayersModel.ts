import type MapLayersView from "../view/MapLayers/MapLayersView";
import type MapObject from "./MapObject";
import type ObjectStore from "../store/ObjectStore";

const SELECTED_OBJECT_COLOR = '#f97316';

export default class MapLayersModel {
    private _mapLayersView: MapLayersView;
    private _map: L.Map;
    private _objectStore: ObjectStore;
    private _selectedObject: MapObject | undefined = undefined;

    constructor(mapLayersView: MapLayersView, map: L.Map, objectStore: ObjectStore) {
        this._mapLayersView = mapLayersView;
        this._map = map;
        this._objectStore = objectStore;

        this._initListeners();
    }

    _initListeners() {
        this._mapLayersView.onObjectClick(this._onObjectClick.bind(this));
        this._mapLayersView.onObjectRemoveClick(this._objectStore.removeObject.bind(this._objectStore));
        this._mapLayersView.onMapLayersTabClick(this._onMapLayersTabClick.bind(this));
    }

    private _onMapLayersTabClick() {
        if (this._selectedObject) {
            this._resetObjectStyle(this._selectedObject);
            this._selectedObject = undefined;
        }
    }

    private _onObjectClick(object: MapObject) {
        if (this._selectedObject) {
            this._resetObjectStyle(this._selectedObject);
        }

        if (this._selectedObject === object) {
            this._selectedObject = undefined;
            return;
        }

        this._selectedObject = object;
        this._map.flyToBounds(object.layer.getBounds());

        switch (object.type) {
            case "polygon":
            case "polyline":
                object.layer.setStyle({ color: SELECTED_OBJECT_COLOR, fillColor: SELECTED_OBJECT_COLOR });
                break;
            case "canvas":
                (object.layer.getElement() as HTMLImageElement).style.outline = '2px solid ' + SELECTED_OBJECT_COLOR;
                break;
        }
    }

    private _resetObjectStyle(object: MapObject) {
        switch (object.type) {
            case "polygon":
            case "polyline":
                object.layer.setStyle({ color: object.color, fillColor: object.color });
                break;
            case "canvas":
                (object.layer.getElement() as HTMLImageElement).style.outline = '';
                break;
        }
    }
}
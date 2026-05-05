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
        this._mapLayersView.onObjectSelected(this.selectObject.bind(this));
        this._mapLayersView.onObjectRemoved(this.removeObject.bind(this));
        this._mapLayersView.onObjectRemoveAll(this.removeAllObjects.bind(this));
        this._mapLayersView.onObjectDeselect(this.deselectObject.bind(this));

        this._mapLayersView.onObjectNameChange((obj, name) => obj.name = name);
        this._mapLayersView.onObjectDescriptionChange((obj, description) => obj.description = description);
        this._mapLayersView.onObjectColorChange((obj, color) => obj.color = color);
        this._mapLayersView.onObjectStrokeWidthChange((obj, width) => obj.strokeWidth = width);
        this._mapLayersView.onObjectOpacityChange((obj, opacity) => obj.opacity = opacity);
        this._mapLayersView.onObjectPopupChange((obj, popup) => obj.popup = popup);

        this._map.on('click', () => {
            if (this._selectedObject) {
                this.deselectObject();
            }
        });
    }

    addObject(object: MapObject) {
        this._objectStore.addObject(object);

        if (object.popup) {
            object.layer.openPopup();
        }

        object.layer.on('click', () => {
            this.selectObject(object);
        });

        this._mapLayersView.handleObjectAdded(object);
    }

    selectObject(object: MapObject) {
        if (this._selectedObject) {
            this._resetObjectStyle(this._selectedObject);
        }

        if (this._selectedObject === object) {
            this.deselectObject();
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
                (object.layer.getElement() as HTMLImageElement).style.outline = object.strokeWidth + 'px solid ' + SELECTED_OBJECT_COLOR;
                break;
        }
        this._mapLayersView.handleObjectSelected(object);
    }

    deselectObject() {
        if (this._selectedObject) {
            this._resetObjectStyle(this._selectedObject);
            this._selectedObject = undefined;
        }
        this._mapLayersView.handleObjectDeselected();
    }

    removeObject(object: MapObject) {
        if (this._selectedObject === object) {
            this._selectedObject = undefined;
        }
        this._objectStore.removeObject(object);
        this._mapLayersView.handleObjectRemoved(object);
    }

    removeAllObjects() {
        this._selectedObject = undefined;
        this._objectStore.removeAll();
        this._mapLayersView.handleAllObjectsRemoved();
    }

    private _resetObjectStyle(object: MapObject) {
        switch (object.type) {
            case "polygon":
            case "polyline":
                object.layer.setStyle({ color: object.color, fillColor: object.color });
                break;
            case "canvas":
                (object.layer.getElement() as HTMLImageElement).style.outline = object.strokeWidth + 'px solid ' + object.color;
                break;
        }
    }
}
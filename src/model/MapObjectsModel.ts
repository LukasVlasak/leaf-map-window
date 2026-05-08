import type MapObjectsView from "../view/MapObjects/MapObjectsView";
import type MapObject from "../objects/MapObject";
import type ObjectStore from "../store/ObjectStore";
import L from "leaflet";

const SELECTED_OBJECT_COLOR = '#f97316';

export default class MapObjectsModel {
    private _mapObjectsView: MapObjectsView;
    private _map: L.Map;
    private _objectStore: ObjectStore;
    private _selectedObject: MapObject | undefined = undefined;

    constructor(mapObjectsView: MapObjectsView, map: L.Map, objectStore: ObjectStore) {
        this._mapObjectsView = mapObjectsView;
        this._map = map;
        this._objectStore = objectStore;

        this._initListeners();
    }

    _initListeners() {
        this._mapObjectsView.onObjectSelected(this.selectObject.bind(this));
        this._mapObjectsView.onObjectRemoved(this.removeObject.bind(this));
        this._mapObjectsView.onObjectRemoveAll(this.removeAllObjects.bind(this));
        this._mapObjectsView.onObjectDeselect(this.deselectObject.bind(this));

        this._mapObjectsView.onObjectNameChange((obj, name) => obj.name = name);
        this._mapObjectsView.onObjectDescriptionChange((obj, description) => obj.description = description);
        this._mapObjectsView.onObjectColorChange((obj, color) => obj.color = color);
        this._mapObjectsView.onObjectStrokeWidthChange((obj, width) => obj.strokeWidth = width);
        this._mapObjectsView.onObjectOpacityChange((obj, opacity) => obj.opacity = opacity);
        this._mapObjectsView.onObjectPopupChange((obj, popup) => obj.popup = popup);

        this._map.on('click', () => {
            if (this._selectedObject) {
                this.deselectObject();
            }
        });
    }

    getMapObjects() {
        return this._objectStore.mapObjects;
    }

    addObject(object: MapObject) {
        this._objectStore.addObject(object);

        if (object.popup) {
            object.layer.openPopup();
        }

        object.layer.on('click', (e) => {
            L.DomEvent.stopPropagation(e);
            this.selectObject(object);
        });

        this._mapObjectsView.handleObjectAdded(object);
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
        if (object.type === "point") {
            this._map.flyTo((object.layer as L.CircleMarker).getLatLng());
        } else {
            this._map.flyToBounds((object.layer as L.Polyline | L.Polygon | L.ImageOverlay).getBounds());
        }

        switch (object.type) {
            case "point":
            case "polygon":
            case "polyline":
                object.layer.setStyle({ color: SELECTED_OBJECT_COLOR, fillColor: SELECTED_OBJECT_COLOR });
                break;
            case "canvas":
                (object.layer.getElement() as HTMLImageElement).style.outline = object.strokeWidth + 'px solid ' + SELECTED_OBJECT_COLOR;
                break;
        }
        this._mapObjectsView.handleObjectSelected(object);
    }

    deselectObject() {
        if (this._selectedObject) {
            this._resetObjectStyle(this._selectedObject);
            this._selectedObject = undefined;
        }
        this._mapObjectsView.handleObjectDeselected();
    }

    removeObject(object: MapObject) {
        if (this._selectedObject === object) {
            this._selectedObject = undefined;
        }
        this._objectStore.removeObject(object);
        this._mapObjectsView.handleObjectRemoved(object);
    }

    removeAllObjects() {
        this._selectedObject = undefined;
        this._objectStore.removeAll();
        this._mapObjectsView.handleAllObjectsRemoved();
    }

    private _resetObjectStyle(object: MapObject) {
        switch (object.type) {
            case "point":
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

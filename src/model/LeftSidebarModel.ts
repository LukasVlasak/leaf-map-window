import * as L from "leaflet";
import "leaflet-draw";
import type LeftSidebarView from "../view/LeftSidebar/LeftSidebarView";
import {type LatLng, type LeafletMouseEvent, polyline} from "leaflet";
import type CanvasModel from "./CanvasModel";
import MapObject, {type LeafObjType} from "../objects/MapObject";
import {DEFAULT_EDIT_COLORS} from "../view/MapObjects/MapObjectsView";
import type MapObjectsModel from "./MapObjectsModel";

type geoJSONGemoetryType = "LineString" | "Polygon";
export interface GeoJSONExportFeature {
    type: "Feature";
    geometry: {
        type: geoJSONGemoetryType;
        coordinates: number[][] | number[][][];
    };
    properties: {
        id: string;
        name: string;
        type: LeafObjType;
        description?: string;
        color?: string;
        strokeWidth?: number;
        opacity: number;
        distance?: number;
        area?: number;
        circuit?: number;
        popup?: string;
        fabricCanvasData?: string;
    };
}

interface GeoJSONExportObject {
    type: "FeatureCollection";
    features: GeoJSONExportFeature[];
}

export const POLYGON_DRAW_OPTIONS = {
    selectable: false,
    interactive: false,
    showLength: false,
    shapeOptions: {
        color: DEFAULT_EDIT_COLORS[0],
        weight: 2,
        opacity: 1,
        fillOpacity: 1
    }
};

export const POLYLINE_DRAW_OPTIONS = {
    selectable: false,
    interactive: false,
    showLength: false,
    shapeOptions: {
        color: DEFAULT_EDIT_COLORS[2],
        weight: 2,
        opacity: 1
    }
};

const FREEDRAW_OPTIONS = {
    color: DEFAULT_EDIT_COLORS[5],
    weight: 3,
    opacity: 1
};

const FREEDRAW_DELAY = 5;

interface Drawer {
    type: "polygon" | "polyline";
    drawer: L.Draw.Feature;
}

export default class LeftSidebarModel {
    private _mapObjectsModel: MapObjectsModel;
    private _leftSidebarView: LeftSidebarView;
    private _map: L.Map;
    private _element: string;
    private _canvasModel: CanvasModel;

    private _drawers: Drawer[] = [];

    private _freedrawingEnabled = false;
    private _isDrawing = false;
    private _freedrawLine: L.Polyline | null = null;
    private _freedrawDelay: number = FREEDRAW_DELAY;

    constructor(mapObjectsModel: MapObjectsModel, leftSidebarView: LeftSidebarView, map: L.Map, element: string, canvasModel: CanvasModel) {
        this._mapObjectsModel = mapObjectsModel;
        this._leftSidebarView = leftSidebarView;
        this._map = map;
        this._element = element;
        this._canvasModel = canvasModel;

        this._initListeners();
        this._initDrawers();
    }

    private _initDrawers() {
        const polygonDrawer = new L.Draw.Polygon(this._map as L.DrawMap, POLYGON_DRAW_OPTIONS);
        const polylineDrawer = new L.Draw.Polyline(this._map as L.DrawMap, POLYLINE_DRAW_OPTIONS);

        this._drawers.push({ drawer: polygonDrawer, type: "polygon" });
        this._drawers.push({ drawer: polylineDrawer, type: "polyline" });
    }

    private _initListeners() {
        this._leftSidebarView.onPolygonClick(this._onPolygonClick.bind(this));
        this._leftSidebarView.onPolylineClick(this._onPolylineClick.bind(this));
        this._leftSidebarView.onFreedrawClick(this._onFreedrawClick.bind(this));
        this._leftSidebarView.onCanvasClick(this._onCanvasClick.bind(this));
        this._leftSidebarView.onExportClick(this._onExportClick.bind(this));
        this._leftSidebarView.onImportClick(this._onImportClick.bind(this));

        this._canvasModel.bindOnCanvasSaveButton(this._onCanvasSave.bind(this));
        this._canvasModel.bindOnCanvasCloseButton(this._onCanvasClose.bind(this));

        this._map.on("mousedown", this._mousedownFreedraw.bind(this));
        this._map.on("mousemove", this._mousemoveFreedraw.bind(this));
        this._map.on("mouseup", this._mouseupFreedraw.bind(this));

        this._map.on(L.Draw.Event.CREATED, (e) => {
            const event = e as L.DrawEvents.Created;
            const layer = event.layer as L.Polyline | L.Polygon;
            const type = event.layerType as "polygon" | "polyline";

            let coordinates;
            if (type === "polygon") {
                coordinates = layer.getLatLngs() as L.LatLng[][];
            } else {
                coordinates = layer.getLatLngs() as L.LatLng[];
            }

            const options = layer.options as L.PathOptions;
            const mapObj = new MapObject(coordinates, layer, type, options.opacity ? options.opacity : 1, undefined, undefined, options.color, options.weight);
            mapObj.setDefaultPopup();
            this._mapObjectsModel.addObject(mapObj);

            this._disableDrawers();
            this._leftSidebarView.deactivateToolBtns();
        });
    }

    private _onImportClick(jsonString: string) {
        const json = JSON.parse(jsonString);
        for (const feature of json.features) {
            const geoJsonObjType: geoJSONGemoetryType = feature.geometry.type;
            let leafObjType: LeafObjType;

            if (geoJsonObjType === "Polygon" && feature.properties.fabricCanvasData) {
                leafObjType = "canvas";
            } else if (geoJsonObjType === "Polygon") {
                leafObjType = "polygon";
            } else if (geoJsonObjType === "LineString") {
                leafObjType = "polyline";
            }

            let coordinates: L.LatLng[] | L.LatLng[][];
            if (geoJsonObjType === "LineString") {
                coordinates = (feature.geometry.coordinates as number[][]).map(([lng, lat]) => L.latLng(lat!, lng!));
            } else {
                coordinates = (feature.geometry.coordinates as number[][][]).map(c =>
                    c.map(([lng, lat]) => L.latLng(lat!, lng!))
                );
            }


            // @ts-ignore
            if (leafObjType === "canvas") {
                // added to the mapObjectsModel within the method
                this._canvasModel.loadCanvasContent(JSON.parse(feature.properties.fabricCanvasData), coordinates as LatLng[][]);
            } else {
                const newMapObject = new MapObject(coordinates, undefined, leafObjType!, feature.properties.opacity, feature.properties.name, feature.properties.description, feature.properties.color, feature.properties.strokeWidth, feature.properties.popup);
                this._mapObjectsModel.addObject(newMapObject);
            }
        }
    }

    private _onExportClick() {
        const geoJson: GeoJSONExportObject = {
            type: "FeatureCollection",
            features: [

            ]
        };

        for (const mapObject of this._mapObjectsModel.getMapObjects()) {
            geoJson.features.push(mapObject.toGeoJSON());
        }

        const blob = new Blob([JSON.stringify(geoJson)], {
            type: "application/json",
        });

        this._leftSidebarView.downloadJSONFile(blob, "leaf-objects-export.json");
    }

    _switchActiveDrawer(caller: "polygon" | "polyline" | "freedraw" | "canvas") {
        // reset state of btns and drawers
        this._disableDrawers(caller);
        this._leftSidebarView.deactivateToolBtns(caller);

        this._leftSidebarView.toggleToolBtnState(caller);
        this._toggleDrawer(caller);
    }

    private _onCanvasSave() {
        this._canvasModel.onCanvasSave();
        this._disableDrawers();
        this._leftSidebarView.deactivateToolBtns();
    }

    private _onCanvasClose() {
        this._disableDrawers();
        this._leftSidebarView.deactivateToolBtns();
    }

    private _onPolygonClick() {
        this._switchActiveDrawer("polygon");
    }

    private _onPolylineClick() {
        this._switchActiveDrawer("polyline");
    }

    private _onCanvasClick() {
        this._switchActiveDrawer("canvas");
    }

    private _onFreedrawClick(e: MouseEvent) {
        e.stopPropagation();
        this._switchActiveDrawer("freedraw");
    }

    private _mousedownFreedraw(e: LeafletMouseEvent) {
        if (!this._freedrawingEnabled || (e.originalEvent.target as HTMLDivElement).id !== this._element) {
            return;
        }
        e.originalEvent.preventDefault();
        this._isDrawing = true;
        this._freedrawLine = polyline([e.latlng], FREEDRAW_OPTIONS);
        this._freedrawLine.addTo(this._map);
    }

    private _mousemoveFreedraw(e: LeafletMouseEvent) {
        if (!this._isDrawing) {
            return;
        }
        e.originalEvent.preventDefault();
        if (this._freedrawDelay === 0) {
            this._freedrawLine!.addLatLng(e.latlng);
            this._freedrawDelay = FREEDRAW_DELAY;
        } else {
            this._freedrawDelay--;
        }
    }

    private _mouseupFreedraw(e: LeafletMouseEvent) {
        if (!this._isDrawing) {
            return;
        }
        e.originalEvent.preventDefault();
        this._isDrawing = false;
        this._freedrawLine!.addLatLng(e.latlng);
        this._freedrawLine!.remove();

        const line = this._freedrawLine!;
        const options = line.options as L.PathOptions;
        const freedrawObj = new MapObject(line.getLatLngs() as L.LatLng[], line, "polyline", options.opacity ? options.opacity : 1, undefined, undefined, options.color, options.weight);
        freedrawObj.setDefaultPopup();
        this._mapObjectsModel.addObject(freedrawObj);
        setTimeout(() => { if (line.getPopup()) line.openPopup(); }, 0);

        this._disableDrawers();
        this._leftSidebarView.deactivateToolBtns();
    }

    private _toggleDrawer(type: "polygon" | "polyline" | "freedraw" | "canvas") {
        if (type === "freedraw") {
            if (this._freedrawingEnabled) {
                this._freedrawingEnabled = false;
                this._map.dragging.enable();
            } else {
                this._freedrawingEnabled = true;
                this._map.dragging.disable();
            }
            return;
        }

        if (type === "canvas") {
            this._canvasModel.toggleCanvasVisibility(this._map);
            return;
        }

        const drawer = this._drawers.find((d) => d.type === type)!.drawer;
        if (drawer.enabled()) {
            drawer.disable();
        } else {
            drawer.enable();
        }
    }

    private _disableDrawers(doNotDisable?: "polygon" | "polyline" | "freedraw" | "canvas") {
        for (const drawerObj of this._drawers) {
            if (doNotDisable && doNotDisable === drawerObj.type) continue;
            drawerObj.drawer.disable();
        }
        if (doNotDisable !== "freedraw") {
            this._freedrawingEnabled = false;
            this._map.dragging.enable();
        }
        if (doNotDisable !== "canvas") {
            this._canvasModel.onCanvasClose();
        }
    }
}

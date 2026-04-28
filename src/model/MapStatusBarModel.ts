import  MapStatusBarView from "../view/MapStatusBar/MapStatusBarView";
import {latLng, LatLng, type LeafletMouseEvent} from "leaflet";
import Utils from "../utils/Utils";

export default class MapStatusBarModel {
    private _mouseLocation: L.LatLng;
    private _zoom: number;
    private _scale: string;

    private _map: L.Map;
    private _mapStatusBarView: MapStatusBarView;

    constructor(mapStatusBarView: MapStatusBarView, map: L.Map) {
        this._map = map;
        this._mapStatusBarView = mapStatusBarView;

        this._zoom = this._map.getZoom();
        this._mouseLocation = this._map.getCenter();
        this._scale = "";

        this._initMapListeners();
        this.syncView();
    }

    get mouseLocation(): LatLng {
        return this._mouseLocation;
    }

    get zoom(): number {
        return this._zoom;
    }

    get scale(): string {
        return this._scale;
    }

    private _initMapListeners() {
        this._map.on("zoom", this._onZoom.bind(this));
        this._map.on("mousemove", this._onMouseMove.bind(this));
    }

    private _onZoom() {
        const mapZoom = this._map.getZoom();
        this._zoom = mapZoom;
        this._mapStatusBarView.updateZoomBar(mapZoom);

        this._calculateScale();
    }

    private _onMouseMove(e: LeafletMouseEvent) {
        this._mouseLocation = e.latlng;
        this._mapStatusBarView.updateMouseLocationBar(e.latlng);
    }

    private _calculateScale() {
        const bounds = this._map.getBounds();
        const distance = this._map.distance(bounds.getSouthWest(), bounds.getSouthEast());
        const niceDistance = Utils.niceRoundDistance(distance / 15);
        this._scale = niceDistance.label;

        const pxLength = this._getPixelLengthForMeters(niceDistance.meters);

        this._mapStatusBarView.updateScaleBar(pxLength, niceDistance.label);
    }

    private _getPixelLengthForMeters(meters: number) {
        const center = this._map.getCenter();

        const metersPerDegLng = 111320 * Math.cos(center.lat * Math.PI / 180);
        const endLatLng = latLng(center.lat, center.lng + meters / metersPerDegLng);

        const p1 = this._map.latLngToContainerPoint(center);
        const p2 = this._map.latLngToContainerPoint(endLatLng);

        return Math.abs(p2.x - p1.x);
    }

    syncView() {
        this._mapStatusBarView.updateZoomBar(this._zoom);
        this._mapStatusBarView.updateMouseLocationBar(this._mouseLocation);
        this._calculateScale();
    }
}
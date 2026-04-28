import * as L from "leaflet";
import MapControlView from "../view/MapControls/MapControlView";

export default class MapControlModel {
    private _map: L.Map;
    private _mapControlView: MapControlView;

    private _watching: boolean = false;
    private _locateMarker: L.CircleMarker | null = null;
    private _locateCircle: L.Circle | null = null;

    constructor(mapControlView: MapControlView, map: L.Map) {
        this._map = map;
        this._mapControlView = mapControlView;

        this._initListeners();
    }

    private _initListeners(): void {
        this._mapControlView.onLocateBtnClick(this._onLocateBtnClick.bind(this));
        this._map.on('locationfound', this._onLocationFound.bind(this));
    }

    private _onLocateBtnClick(): void {
        if (!navigator.geolocation) return;

        if (this._watching) {
            this._map.stopLocate();
            if (this._locateMarker) {
                this._map.removeLayer(this._locateMarker);
                this._locateMarker = null;
            }
            if (this._locateCircle) {
                this._map.removeLayer(this._locateCircle);
                this._locateCircle = null;
            }
            this._mapControlView.updateLocateBtnState(false);
            this._watching = false;
            return;
        }

        this._map.locate({ watch: true, enableHighAccuracy: true, setView: true, maxZoom: 15 });
        this._watching = true;
        this._mapControlView.updateLocateBtnState(true);
    }

    private _onLocationFound(e: L.LocationEvent): void {
        if (!this._locateMarker) {
            this._locateMarker = L.circleMarker(e.latlng, {
                radius: 7, color: '#fff', weight: 2.5,
                fillColor: '#0d9488', fillOpacity: 1
            }).addTo(this._map);
            this._locateCircle = L.circle(e.latlng, {
                radius: e.accuracy, color: '#0d9488', weight: 1,
                fillColor: '#0d9488', fillOpacity: 0.08
            }).addTo(this._map);
        } else {
            this._locateMarker.setLatLng(e.latlng);
            this._locateCircle!.setLatLng(e.latlng).setRadius(e.accuracy);
        }
    }
}

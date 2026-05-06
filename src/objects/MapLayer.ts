import L from "leaflet";
import type {GeoJSONOptions} from "leaflet";

type LeafletLayer = L.TileLayer | L.TileLayer.WMS | L.GeoJSON;

export default class MapLayer {
    private _ID: string;
    private _serverType: "tile" | "wms" | "geojson";
    private _url: string;
    private _name: string;
    private _description: string;
    private _active: boolean = false;
    private _opacity: number = 1;
    private _minZoom: number;
    private _maxZoom: number;
    private _wmsFormat?: "image/png";
    private _layers?: string[];
    private _leafletLayer: LeafletLayer;

    constructor(serverType: "tile" | "wms" | "geojson", url: string, name: string, description: string, minZoom: number, maxZoom: number, active?: boolean, opacity?: number, wmsFormat?: "image/png", layers?: string[]) {
        this._ID = crypto.randomUUID();
        this._serverType = serverType;
        this._url = url;
        this._name = name;
        this._description = description;
        if (active) {
            this._active = active;
        }
        if (opacity) {
            this._opacity = opacity;
        }
        this._minZoom = minZoom;
        this._maxZoom = maxZoom;
        if (wmsFormat) {
            this._wmsFormat = wmsFormat;
        }
        if (layers) {
            this._layers = layers;
        }
        this._leafletLayer = this._bindLeafletLayer();
    }

    private _bindLeafletLayer() {
        const options = { minZoom: this._minZoom, maxZoom: this._maxZoom, opacity: this._opacity };

        if (this._serverType === "wms") {
            return L.tileLayer.wms(this._url, {
                ...options,
                layers: this._layers?.join(",") ?? "",
                format: this._wmsFormat ?? "image/png",
                transparent: true,
            });
        }

        if (this._serverType === "geojson") {
            return L.geoJSON(undefined, options as GeoJSONOptions);
        }

        return L.tileLayer(this._url, options);
    }

    get ID(): string {
        return this._ID;
    }

    get name(): string {
        return this._name;
    }

    get layers(): string[] | undefined {
        return this._layers;
    }

    get description(): string {
        return this._description;
    }

    get serverType(): "tile" | "wms" | "geojson" {
        return this._serverType;
    }

    get active(): boolean {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;
    }

    get opacity(): number {
        return this._opacity;
    }

    set opacity(value: number) {
        this._opacity = value / 100;
        if (this._leafletLayer instanceof L.GeoJSON) {
            this._leafletLayer.setStyle({ opacity: this._opacity, fillOpacity: this._opacity });
        } else {
            this._leafletLayer.setOpacity(this._opacity);
        }
    }

    get minZoom(): number {
        return this._minZoom;
    }

    get maxZoom(): number {
        return this._maxZoom;
    }

    get wmsFormat(): "image/png" | undefined {
        return this._wmsFormat;
    }

    get leafletLayer(): LeafletLayer {
        return this._leafletLayer;
    }
}

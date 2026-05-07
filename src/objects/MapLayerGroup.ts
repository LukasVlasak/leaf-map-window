import type MapLayer from "./MapLayer";

export default class MapLayerGroup {
    private _name: string;
    private _layerTypes: "base" | "additional";
    private _mapLayers: MapLayer[] = [];
    private _defaultOpen: boolean;

    constructor(name: string, layerTypes: "base" | "additional", defaultOpen: boolean) {
        this._name = name;
        this._layerTypes = layerTypes;
        this._defaultOpen = defaultOpen;
    }

    addLayer(mapLayer: MapLayer) {
        this._mapLayers.push(mapLayer);
    }

    get name(): string {
        return this._name;
    }

    get layerTypes(): "base" | "additional" {
        return this._layerTypes;
    }

    get mapLayers(): MapLayer[] {
        return this._mapLayers;
    }

    get defaultOpen(): boolean {
        return this._defaultOpen;
    }
}
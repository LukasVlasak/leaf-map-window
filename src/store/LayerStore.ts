import MapLayer from "../objects/MapLayer";
import MapLayerGroup from "../objects/MapLayerGroup";
import layersData from "../layers.json";

export default class LayerStore {
    private _layerGroups: MapLayerGroup[] = [];
    constructor() {
        this._loadFromJson();
    }

    private _loadFromJson() {
        for (const groupData of layersData) {
            const group = new MapLayerGroup(groupData.name, groupData.layerTypes as "base" | "additional", groupData.defaultOpen);
            for (const layerData of groupData.layers) {
                const layer = new MapLayer(
                    layerData.serverType as "tile" | "wms" | "geojson",
                    layerData.url,
                    layerData.name,
                    layerData.description,
                    layerData.minZoom,
                    layerData.maxZoom,
                    layerData.active,
                    layerData.opacity,
                    layerData.wmsFormat as "image/png" | undefined,
                    layerData.layers,
                );
                group.addLayer(layer);
            }
            this._layerGroups.push(group);
        }
    }

    get layerGroups(): MapLayerGroup[] {
        return this._layerGroups;
    }
}

import {featureGroup, Layer} from "leaflet";

export default class ObjectStore {
    private storeDrawObjects = featureGroup([]);

    constructor(map: L.Map) {
        map.addLayer(this.storeDrawObjects);
    }

    addObject(obj: Layer) {
        this.storeDrawObjects.addLayer(obj);
    }

    removeObject(obj: Layer) {
        this.storeDrawObjects.removeLayer(obj);
    }
}
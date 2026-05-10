export default class RuianConnector {

    private _baseURL = "https://ags.cuzk.gov.cz/arcgis/rest/services/RUIAN/Prohlizeci_sluzba_nad_daty_RUIAN/MapServer";

    private _landLayer = 5; // parcela
    private _cadastralAreaLayer = 7; // katastralni uzemi
    private _municipalityLayer = 12; // obec
    private _districtLayer = 15; // okres
    private _regionLayer = 17; // kraj

    constructor() {
    }

    private async _getLayerByPoint(layerId: number, returnGeometry: boolean, outFields: "*" | string[], x?: number, y?: number, where = "1=1", resultRecordCount?: string) {
        const params = new URLSearchParams({
            outSR: "4326",
            returnGeometry: returnGeometry,
            f: "geojson",
            where: where,
            outFields: outFields
        } as any);
        if (x !== undefined && y !== undefined) {
            params.set("inSR", "5514");
            params.set("geometryType", "esriGeometryPoint");
            params.set("spatialRel", "esriSpatialRelIntersects");
            params.set("geometry", `${x},${y}`);
        }
        if (resultRecordCount) {
            params.set("resultRecordCount", resultRecordCount);
        }

        const url = this._baseURL + "/" + layerId + "/query?" + params.toString();

        const controller = new AbortController();

        const timeout = setTimeout(() => {
            controller.abort("timeout");
        }, 3000);

        try {
            const response = await fetch(url, {
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`RUIAN request failed: ${response.status}`);
            }

            return await response.json();
        } catch (err) {
            if (controller.signal.aborted) {
                return {
                    type: "FeatureCollection",
                    features: []
                };
            }
            throw new Error(`RUIAN request failed: ${err}`);
        } finally {
            clearTimeout(timeout);
        }
    }

    async getLandByPoint(x: number, y: number) {
        return this._getLayerByPoint(this._landLayer, true, "*", x, y);
    }

    async searchLandByLandNumber(landNumber: string) {
        if (!/^\d[\d/]*$/.test(landNumber)) {
            alert("Invalid land number");
            return;
        }
        return this._getLayerByPoint(this._landLayer, true, "*", undefined, undefined, `cisloparcely LIKE '%${landNumber}%'`, "5");
    }

    async searchLandByKmenoveCisloAndPoddelniCisla(kmenovecislo: string, poddelenicisla: string) {
        if (!/^\d+$/.test(kmenovecislo) || !/^\d+$/.test(poddelenicisla)) {
            alert("Invalid land number");
            return;
        }
        return this._getLayerByPoint(this._landLayer, true, "*", undefined, undefined, `kmenovecislo = ${kmenovecislo} and poddelenicisla = ${poddelenicisla}`, "5");
    }

    async getCadastralAreaByCode(code: string) {
        return this._getLayerByPoint(this._cadastralAreaLayer, false, ["nazev"], undefined, undefined, "kod="+code);
    }

    async getMunicipalityByPoint(x: number, y: number) {
        return this._getLayerByPoint(this._municipalityLayer, false, "*", x, y);
    }

    async getDistrictByPoint(x: number, y: number) {
        return this._getLayerByPoint(this._districtLayer, false, "*", x, y);
    }

    async getRegionByPoint(x: number, y: number) {
        return this._getLayerByPoint(this._regionLayer, false, "*", x, y);
    }

    async getDistrictByCode(code: number) {
        return this._getLayerByPoint(this._districtLayer, false, "*", undefined, undefined, `kod=${code}`);
    }

    async getRegionByCode(code: number) {
        return this._getLayerByPoint(this._regionLayer, false, "*", undefined, undefined, `kod=${code}`);
    }
}
import * as L from "leaflet";
import {GeoJSON, type LatLng, type LeafletMouseEvent} from "leaflet";
import RuianConnector from "../ruian/RuianConnector";
import RuianInfoView, { type RuianData } from "../view/RuianInfo/RuianInfoView";
import type SearchBarView from "../view/SearchBar/SearchBarView";

export default class RuianInfoModel {
    private _map: L.Map;
    private _epsg5514: L.Proj.CRS;
    private _ruianConnector: RuianConnector;
    private _currentPopup: L.Popup | null = null;
    private _searchBarView: SearchBarView;

    private _geoJSONLands: GeoJSON[] = [];

    constructor(map: L.Map, epsg5514: L.Proj.CRS, ruianConnector: RuianConnector, searchBarView: SearchBarView) {
        this._map = map;
        this._epsg5514 = epsg5514;
        this._ruianConnector = ruianConnector;
        this._map.on('click', this._onMapClick.bind(this));
        this._searchBarView = searchBarView;

        this._searchBarView.onSearchClickHandler(this._onRUIANSearch.bind(this));
        this._searchBarView.onResultClickHandler(this._onLandResultClick.bind(this));
    }

    private async _onMapClick(e?: LeafletMouseEvent, preDefinedLatlng?: LatLng) {
        this._searchBarView.clearResults();

        const latlng = this._epsg5514.project(e ? e.latlng : preDefinedLatlng!);

        const popup = L.popup({ className: 'ruian-popup-wrapper', maxWidth: 300 })
            .setLatLng(e ? e.latlng : preDefinedLatlng!)
            .setContent(RuianInfoView.renderLoading())
            .openOn(this._map);
        this._currentPopup = popup;

        const data = await this._getRUIANObjects(e!.latlng!.lng, e!.latlng!.lat);

        if (this._currentPopup === popup && popup.isOpen()) {
            popup.setContent(RuianInfoView.render(data));
            popup.on('remove', () => {
                this._removeGeoJSONLands();
            });
            if (data.land) {
                this._removeGeoJSONLands();
                // if preDefinedLatlng is present land is displayed after search and map is flying to bounds
                // in that time zoom is not greater than 9 yet
                if (this._map.getZoom() >= 9 || preDefinedLatlng) {
                    const geoJsonLand = L.geoJson(data.land as any);
                    this._geoJSONLands.push(geoJsonLand);
                }
            }
        }

        this._renderGeoJSONLands();
    }

    private async _onLandResultClick(landGeom: any) {
        const geoJsonLand = L.geoJSON(landGeom);

        const center = geoJsonLand.getBounds().getCenter();
        this._map.flyTo(center, 12, {duration: 1});
        await this._onMapClick(undefined, center);
    }

    private async _onRUIANSearch(value: string) {
        this._searchBarView.showResultLoader();

        const match = value.match(/^(\d+)\/(\d+)$/);
        let results;
        if (match) {
            const kmenovecislo = match[1];
            const poddelenicisla = match[2];

            if (kmenovecislo && poddelenicisla) {
                results = await this._ruianConnector.searchLandByKmenoveCisloAndPoddelniCisla(kmenovecislo, poddelenicisla);
            }
        } else {
            results = await this._ruianConnector.searchLandByLandNumber(value);
        }
        if (results && results.features && results.features.length > 0) {
            for (const feature of results.features) {
                const cadastralAreaRes = await this._ruianConnector.getCadastralAreaByCode(feature.properties.katastralniuzemi);
                const cadastralArea = cadastralAreaRes.features?.[0]?.properties ?? null;

                feature.properties.katastralniuzemiNazev = cadastralArea?.nazev ?? null;
            }
        }
        this._searchBarView.renderResults(results?.features ?? []);
    }


    private _removeGeoJSONLands() {
        for (const geoJSON of this._geoJSONLands) {
            geoJSON.removeFrom(this._map);
        }
        this._geoJSONLands = [];
    }

    private _renderGeoJSONLands() {
        for (const geoJSON of this._geoJSONLands) {
            geoJSON.addTo(this._map);
        }
    }

    private async _getRUIANObjects(x: number, y: number): Promise<RuianData> {
        let land, municipality, district, region;
        let districtRes, regionRes;

        const [landRes, municipalityRes] = await Promise.all([
            this._ruianConnector.getLandByPoint(x, y),
            this._ruianConnector.getMunicipalityByPoint(x, y),
        ]);

        if (landRes) {
            land = landRes.features?.[0];
        }
        if (municipalityRes) {
            municipality = municipalityRes.features?.[0];
        }

        if (municipality) {
            const districtCode = municipality.properties.okres;
            if (districtCode) {
                districtRes = await this._ruianConnector.getDistrictByCode(districtCode);
            }
        } else {
            districtRes = await this._ruianConnector.getDistrictByPoint(x, y);
        }

        if (districtRes) {
            district = districtRes.features?.[0];
        }
        if (district) {
            const regionCode = district.properties.vusc;
            if (regionCode) {
                regionRes = await this._ruianConnector.getRegionByCode(regionCode);
            }
        } else {
            regionRes = await this._ruianConnector.getRegionByPoint(x, y);
        }

        if (regionRes) {
            region = regionRes.features?.[0];
        }

        return {
            land: land ?? null,
            municipality: municipality?.properties ?? null,
            district: district?.properties ?? null,
            region: region?.properties ?? null
        };
    }
}

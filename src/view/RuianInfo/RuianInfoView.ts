export interface RuianData {
    land: Record<string, any> | null;
    municipality: Record<string, any> | null;
    district: Record<string, any> | null;
    region: Record<string, any> | null;
}

// https://services.cuzk.gov.cz/registry/codelist/LandTypeValue
const DRUH_POZEMKU: Record<number, string> = {
    2: 'Orná půda',
    4: 'Chmelnice',
    5: 'Vinice',
    6: 'Zahrada',
    7: 'Ovocný sad',
    8: 'Trvalý travní porost',
    10: 'Lesní pozemek',
    11: 'Vodní plocha',
    12: 'Zastavěná plocha a nádvoří',
    13: 'Ostatní plocha',
};

export default class RuianInfoView {

    static render(data: RuianData): HTMLElement {
        const container = document.createElement('div');
        container.className = 'ruian-popup';

        const { land, municipality, district, region } = data;

        const header = document.createElement('div');
        header.className = 'ruian-header';
        header.textContent = (municipality?.nazev ?? '-') + ' > ' + (district?.nazev ?? '-') + ' > ' + (region?.nazev ?? '-');
        container.appendChild(header);

        if (land) {
            const section = document.createElement('div');
            section.className = 'ruian-section';

            const heading = document.createElement('div');
            heading.className = 'ruian-section-title';
            heading.textContent = 'Parcela';
            section.appendChild(heading);

            const parcelNum = land.poddelenicisla
                ? `${land.kmenovecislo}/${land.poddelenicisla}`
                : land.kmenovecislo != null ? String(land.kmenovecislo) : null;

            if (parcelNum) {
                section.appendChild(RuianInfoView._row('Číslo', parcelNum));
            }

            const druhNazev = DRUH_POZEMKU[land.druhpozemkukod];
            if (druhNazev) {
                section.appendChild(RuianInfoView._row('Druh pozemku', druhNazev));
            }

            if (land.zpusobyvyuzitipozemku != null) {
                section.appendChild(RuianInfoView._row('Využití', String(land.zpusobyvyuzitipozemku)));
            }

            if (land.vymeraparcely != null) {
                section.appendChild(RuianInfoView._row('Výměra', `${Number(land.vymeraparcely).toLocaleString('cs-CZ')} m²`));
            }

            container.appendChild(section);
        } else {
            const empty = document.createElement('div');
            empty.className = 'ruian-empty';
            empty.textContent = 'Pro toto místo nejsou dostupná data.';
            container.appendChild(empty);
        }

        return container;
    }

    static renderLoading(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'ruian-popup loading';
        container.textContent = 'Načítání…';
        return container;
    }

    private static _row(label: string, value: string): HTMLElement {
        const row = document.createElement('div');
        row.className = 'ruian-row';

        const l = document.createElement('span');
        l.className = 'ruian-label';
        l.textContent = label;

        const v = document.createElement('span');
        v.className = 'ruian-value';
        v.textContent = value;

        row.appendChild(l);
        row.appendChild(v);
        return row;
    }
}

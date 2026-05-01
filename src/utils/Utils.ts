export interface NiceDistance {
    meters: number;
    label: string;
}

export default class Utils {
    static niceRoundDistance(meters: number): NiceDistance {
        const pow10 = Math.pow(10, Math.floor(Math.log10(meters)));
        const d = meters / pow10;

        let nice: number;
        if (d >= 5)      nice = 5;
        else if (d >= 2) nice = 2;
        else if (d >= 1) nice = 1;
        else             nice = 1;

        const niceMeters = nice * pow10;

        if (niceMeters >= 1000) {
            return { meters: niceMeters, label: (niceMeters / 1000) + ' km' };
        } else {
            return { meters: niceMeters, label: niceMeters + ' m' };
        }
    }
}
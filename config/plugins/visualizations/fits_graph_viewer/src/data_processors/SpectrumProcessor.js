export class SpectrumProcessor {

    static processed_columns_name = ['E_HALF_WIDTH', 'E_MID', 'E_MID_LOG'];

    static spectrum_col_functions = {
        E_HALF_WIDTH: SpectrumProcessor.getEnergyHalfWidth,
        E_MID: SpectrumProcessor.getEnergyMidPoint,
        E_MID_LOG: SpectrumProcessor.getEnergyMidPointLog,
    }

    constructor() {

    }

    static getEnergyHalfWidth(e_min, e_max) {
        return ((e_max - e_min) / 2);
    }

    static getEnergyMidPoint(e_min, e_max) {
        return ((e_max + e_min) / 2);
    }

    static getEnergyMidPointLog(e_min, e_max) {
        return Math.sqrt(e_max * e_min);
    }

    static getEneryErrorBar(e_min, e_max, e_mid) {

    }

}
import { DataPreProcessor } from '../data_processors/DataPreProcessor.js'
import { LightCurveProcessor } from '../data_processors/LightCurveProcessor.js'
import { SpectrumProcessor } from '../data_processors/SpectrumProcessor.js'

export class DataProcessorContainer {

    constructor() {

    }

    getDataPreProcessor() {
        return new DataPreProcessor();
    }

    getLightCurveProcessor(fits_reader_wrapper, hdu_index) {
        return new LightCurveProcessor(fits_reader_wrapper, hdu_index);
    }

    getSpectrumProcessor() {
        return new SpectrumProcessor();
    }

    static getDataProcessorContainer() {
        return new DataProcessorContainer();
    }

}
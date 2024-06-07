import { FITSReaderWrapper } from '../wrappers/FITSReaderWrapper.js'
import { BokehWrapper } from '../wrappers/BokehWrapper.js'
import { D3Wrapper } from '../wrappers/D3Wrapper.js'

export class WrapperContainer {

    static fits_reader_wrapper = null;
    static bokeh_wrapper = null;
    static d3_wrapper = null;

    static visualization_container = 'visualization-container'

    constructor() {

    }

    static setFITSReaderWrapper(fits_reader_wrapper) {
        WrapperContainer.fits_reader_wrapper = fits_reader_wrapper;
    }

    static setBokehWrapper(bokeh_wrapper) {
        WrapperContainer.bokeh_wrapper = bokeh_wrapper;
    }

    static setD3Wrapper(d3_wrapper) {
        WrapperContainer.d3_wrapper = d3_wrapper;
    }

    static getFITSReaderWrapper() {
        if(WrapperContainer.fits_reader_wrapper !== null) {
            return WrapperContainer.fits_reader_wrapper;
        } else {
            return new FITSReaderWrapper('');
        }
    }

    static getBokehWrapper() {
        if(WrapperContainer.bokeh_wrapper !== null) {
            return WrapperContainer.bokeh_wrapper;
        } else {
            return new BokehWrapper(WrapperContainer.visualization_container);
        }
    }

    static getD3Wrapper() {
        if(WrapperContainer.d3_wrapper !== null) {
            return WrapperContainer.d3_wrapper;
        } else {
            return new D3Wrapper(WrapperContainer.visualization_container);
        }
    }

}
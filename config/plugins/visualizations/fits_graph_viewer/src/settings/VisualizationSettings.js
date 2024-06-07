export class VisualizationSettings {

    static default_settings = {
        library: '',
        data_type: '',
        axis: {},
        scales: {},
        error_bars: {}
    }

    settings = {};

    settings_library = null;
    settings_data_type = null;
    settings_hdus = null;
    settings_axis = null;
    settings_scales = null;
    settings_error_bars = null;

    constructor(settings_object = null) {
        if(settings_object) {
            this.settings = JSON.parse(JSON.stringify(settings_object))
        } else {
            this.settings = JSON.parse(JSON.stringify(VisualizationSettings.default_settings))
        }
    }

    setLibrarySettings(library) {
        this.settings_library = library;
    }

    getLibrarySettings() {
        if(this.settings_library) {
            return this.settings_library;
        } else {
            return null;
        }
    }

    setDataTypeSettings(data_type) {
        this.settings_data_type = data_type;
    }

    getDataTypeSettings() {
        if(this.settings_data_type) {
            return this.settings_data_type;
        } else {
            return null;
        }
    }

    getLightCurveSettings() {

    }

    getSpectrumSettings() {

    }

    setHDUsSettings(hdus) {
        this.settings_hdus = hdus;
    }

    getHDUsSettings() {
        if(this.settings_hdus !== null) {
            return this.settings_hdus;
        } else {
            return null;
        }
    }

    setAxisSettings(axis) {
        this.settings_axis = axis;
    }

    getAxisSettings() {
        if(this.settings_axis) {
            return this.settings_axis;
        } else {
            return null;
        }
    }

    setScalesSettings(scales) {
        this.settings_scales = scales;
    }

    getScalesSettings() {
        if(this.settings_scales) {
            return this.settings_scales;
        } else {
            return null;
        }
    }

    setErrorBarsSettings(error_bars) {
        this.settings_error_bars = error_bars;
    }

    getErrorBarsSettings() {
        if(this.settings_error_bars) {
            return this.settings_error_bars;
        } else {
            return null;
        }
    }

    setRangesSettings(ranges) {
        this.settings_ranges = ranges;
    }

    getRangesSettings() {
        return this.settings_ranges;
    }

    getAdditionalDatasetsSettings() {

    }

    reset() {
        this.settings_library = null;
        this.settings_data_type = null;
        this.settings_hdus = null;
        this.settings_axis = null;
        this.settings_scales = null;
        this.settings_error_bars = null;
    }
}
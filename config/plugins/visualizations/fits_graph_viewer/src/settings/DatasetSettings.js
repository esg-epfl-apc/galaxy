export class DatasetSettings {

    static default_configuration = {
        'library-settings': {
            display: true,
            selected: 'none'
        },
        'bokeh-settings': {
            display: false,
            'bokeh-options': {
                tools: {
                    display : false
                }
            }
        },
        'd3-settings': {
            display: false,
            'd3-options': {

            }
        },
        'data-type-settings': {
            display: true,
            selected: 'generic'
        },
        'light-curve-settings': {
            display: false,
            'light-curve-options': {

            }
        },
        'spectrum-settings': {
            display: false,
            'spectrum-options': {

            }
        },
        'hdus-settings': {
            display: true
        },
        'axis-settings': {
            display: true,
        },
        'error-bars-settings': {
            display: true
        },
        'binning-settings': {
            display: true
        },
        'additional-dataset-settings': {
            display: true
        }
    }

    configuration = null;

    constructor() {

    }

    getSettingsObject() {

    }

    createColumn() {

    }

}
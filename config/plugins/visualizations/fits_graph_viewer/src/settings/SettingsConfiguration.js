import {ObjectUtils} from "../utils/ObjectUtils";

export class SettingsConfiguration {

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
            display: false
        },
        'axis-settings': {
            display: true
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

    constructor(configuration_object = null) {
        if(configuration_object) {
            this.configuration = JSON.parse(JSON.stringify(SettingsConfiguration.default_configuration));
        } else {
            this.configuration = JSON.parse(JSON.stringify(configuration_object));
        }
    }

    getConfigurationObject(wrapper_configuration) {
        let configuration = null;

        configuration = ObjectUtils.deep_merge(SettingsConfiguration.default_configuration, wrapper_configuration);

        return configuration;
    }

    static getConfigurationObject(wrapper_configuration) {
        let configuration = null;

        configuration = ObjectUtils.deep_merge(SettingsConfiguration.default_configuration, wrapper_configuration);

        return configuration;
    }

}
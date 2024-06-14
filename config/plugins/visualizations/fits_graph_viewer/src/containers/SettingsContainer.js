import { VisualizationSettings } from '../settings/VisualizationSettings.js'
import { SettingsConfiguration } from '../settings/SettingsConfiguration.js'

export class SettingsContainer {

    constructor() {

    }

    getVisualizationSettingsObject() {
        return new VisualizationSettings();
    }

    getSettingsConfigurationObject() {
        return new SettingsConfiguration();
    }

    static getSettingsContainer() {
        return new SettingsContainer();
    }

}
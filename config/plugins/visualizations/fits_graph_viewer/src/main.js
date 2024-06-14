import { FITSReaderWrapper } from './wrappers/FITSReaderWrapper.js'
import { BokehWrapper } from './wrappers/BokehWrapper.js'
import { D3Wrapper } from './wrappers/D3Wrapper.js'
import { WrapperContainer } from './containers/WrapperContainer.js'
import { VisualizationContainer } from './containers/VisualizationContainer.js'
import { FileComponent } from './components/FileComponent.js'
import { SettingsComponent } from './components/SettingsComponent.js'
import { VisualizationComponent } from './components/VisualizationComponent.js'
import { FITSSettingsComponent } from './components/file_type/FITSSettingsComponent.js'
import { CSVSettingsComponent } from './components/file_type/CSVSettingsComponent.js'
import { D3Graph } from "./visualizations/D3Graph";
import { BokehGraph } from "./visualizations/BokehGraph";

//let file_path = window.location.href + "_test_files/spiacs_lc_query.fits";
let file_path = file_url;

let fits_reader_wrapper = new FITSReaderWrapper(file_path);

let bokeh_wrapper = new BokehWrapper();

let d3_wrapper = new D3Wrapper();

WrapperContainer.setFITSReaderWrapper(fits_reader_wrapper);
WrapperContainer.setBokehWrapper(bokeh_wrapper);
WrapperContainer.setD3Wrapper(d3_wrapper);

VisualizationContainer.setBokehVisualization(new BokehGraph());
VisualizationContainer.setD3Visualization(new D3Graph());

customElements.define('file-component', FileComponent);
customElements.define('settings-component', SettingsComponent);
customElements.define('visualization-component', VisualizationComponent);
customElements.define('fits-component', FITSSettingsComponent);
customElements.define('csv-component', CSVSettingsComponent);

import { BokehGraph } from '../visualizations/BokehGraph'
import { D3Graph } from '../visualizations/D3Graph'

export class VisualizationContainer {

    static bokeh_graph = null;
    static d3_graph = null;

    static visualization_container = '#visualization-container'

    constructor() {

    }

    static setBokehVisualization(bokeh_visualization) {
        VisualizationContainer.bokeh_visualization = bokeh_visualization;
    }

    static setD3Visualization(d3_visualization) {
        VisualizationContainer.d3_visualization = d3_visualization;
    }

    static getBokehVisualization() {
        if(VisualizationContainer.bokeh_visualization !== null) {
            return VisualizationContainer.bokeh_visualization;
        } else {
            return new BokehGraph(VisualizationContainer.visualization_container);
        }
    }

    static getD3Visualization() {
        if(VisualizationContainer.d3_visualization !== null) {
            return VisualizationContainer.d3_visualization;
        } else {
            return new D3Graph(VisualizationContainer.visualization_container);
        }
    }

}
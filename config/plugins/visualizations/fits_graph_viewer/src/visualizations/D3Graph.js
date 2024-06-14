export class D3Graph {

    x_scale;
    x_scale_type;

    y_scale;
    y_scale_type;

    x_axis;
    x_axis_data_col;

    y_axis;
    y_axis_data_col;

    dataset;
    svg; plot; clip; zoom_rect;

    zoom;

    line_container; path;

    container;
    container_id;

    margin = {top: 10, right: 30, bottom: 30, left: 60};
    width = 800 - this.margin.left - this.margin.right;
    height = 400 - this.margin.top - this.margin.bottom;

    has_error_bars = false;
    x_axis_data_col_error_bar;
    y_axis_data_col_error_bar;

    has_line = false;

    has_multiple_plots = false;
    additional_plots = [];

    initialized;

    static scale_functions = {
        "linear": d3.scaleLinear,
        "log": d3.scaleLog
    };

    static default_scales = {
        "x": 'linear',
        "y": 'linear'
    }

    static default_axis_tick_format = ".2f";

    constructor(container_id = 'visualization-container', dataset = null) {
        this.container_id = container_id;
        this.dataset = dataset;

        this._setContainer();

        this._updateChart = this._updateChart.bind(this);

        this.initialized = false;
    }

    _setContainer() {
        this.container = document.getElementById(this.container_id);
    }

    initializeSettings(data,
                       axis,
                       scales = D3Graph.default_scales,
                       error_bars = null,
                       has_line = false,
                       additional_plots = null) {

        let is_set = false;

        try {

            this.dataset = data;

            this.x_axis_data_col = axis['x'];
            this.y_axis_data_col = axis['y'];

            this.x_scale_type = scales['x'];
            this.y_scale_type = scales['y'];

            if (error_bars) {
                this.has_error_bars = true;
                this.error_bars = error_bars;

                this.x_axis_data_col_error_bar = axis['x'].value;
                this.y_axis_data_col_error_bar = axis['y'].value;

            } else {
                this.has_error_bars = false;
            }

            if (additional_plots) {
                this.has_multiple_plots = true;
                this.additional_plots = [];

                let additional_plots_temp = [];
                additional_plots.forEach(function (plot) {
                    additional_plots_temp.push(plot);
                });

                this.additional_plots = additional_plots_temp;
            }

            this.has_line = has_line;

            is_set = true;

        } catch(e) {
            console.log("Error during graph settings process")
        }

        return is_set;
    }

    initializeGraph() {
        try {
            this._setSVGContainer();

            this._setXScale();
            this._setYScale();

            this._setXAxis();
            this._setXAxisLabel();

            this._setYAxis();
            this._setYAxisLabel()

            this._setDataPlot();

            this._setZoomBehavior();

            if(this.has_error_bars) {
                this._setErrorBars(this.error_bars);
            }

            if(this.has_line) {
                this._setAxisLine();
            }

            if(this.has_multiple_plots) {
                this._setAdditionalPlots();
            }

            this.initialized = true;
        } catch(e) {
            console.log("Error during graph initialization");
            this.initialized = false;
        }

        return this.initialized;
    }

    _setSVGContainer() {

        let full_width = this._getFullWidth();
        let full_height = this._getFullHeight();

        this.svg = d3.select(this.container)
            .append("svg")
            .attr("width", full_width)
            .attr("height", full_height)
            .append("g")
            .attr("transform",
                "translate(" + this.margin.left + "," + this.margin.top + ")");
    }

    _setXScale() {
        this.x_scale = D3Graph.scale_functions[this.x_scale_type]()
            .domain(d3.extent(this.dataset, d => d[this.x_axis_data_col]))
            .range([ 0, this.width ]);
    }

    _setYScale() {
        this.y_scale = D3Graph.scale_functions[this.y_scale_type]()
            .domain(d3.extent(this.dataset, d => d[this.y_axis_data_col]))
            .range([ this.height, 0]);
    }

    _setXAxis(tick_format = D3Graph.default_axis_tick_format) {
         this.x_axis = this.svg.append("g")
            .attr("id", "x")
            .attr("transform", "translate(0," + this.height + ")")
            .call(d3.axisBottom(this.x_scale)
                .tickFormat(d3.format(tick_format)))
            .call(g => g.selectAll(".tick line").clone()
                .attr("class", "tick-line")
                .attr("y2", -this.height)
                .attr("stroke-opacity", 0.2))
    }

    _setYAxis(tick_format = D3Graph.default_axis_tick_format) {
        this.y_axis = this.svg.append("g")
            .attr("id", "y")
            .call(d3.axisLeft(this.y_scale)
                .tickFormat(d3.format(tick_format)))
            .call(g => g.selectAll(".tick line").clone()
                .attr("x2", this.width)
                .attr("stroke-opacity", 0.2));
    }

    _setXAxisLabel() {
        this.x_axis.select(".tick:last-of-type text").clone()
            .attr("id", "x-label")
            .attr("y", -11)
            .attr("x", 2)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(this.x_axis_data_col);
    }

    _setYAxisLabel() {
        this.y_axis.select(".tick:last-of-type text").clone()
            .attr("id", "y-label")
            .attr("x", 3)
            .attr("y", -5)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .text(this.y_axis_data_col);
    }

    _setDataPlot() {

        let x = this.x_scale;
        let y = this.y_scale;

        let x_col_data = this.x_axis_data_col;
        let y_col_data = this.y_axis_data_col;

        this.clip = this.svg.append("defs").append("SVG:clipPath")
            .attr("id", "clip")
            .append("SVG:rect")
            .attr("width", this.width )
            .attr("height", this.height )
            .attr("x", 0)
            .attr("y", 0);

        this.plot = this.svg.append('g')
            .attr("clip-path", "url(#clip)")
            .attr("id", "data-plot")

        this.plot
            .selectAll("circle")
            .data(this.dataset)
            .enter()
            .append("circle")
            .attr("cx", function (d) { return x(d[x_col_data]); } )
            .attr("cy", function (d) { return y(d[y_col_data]); } )
            .attr("r", 4)
            .style("fill", "transparent")
            .style("stroke", "black")
            .style("opacity", 1)
    }

    _setAdditionalPlots() {
        let plot;
        for(let i = 0; i < this.additional_plots.length, i++;) {
            plot = this.additional_plots[i];
        }
    }

    _setErrorBars(error_bars) {

        this.error_bars = error_bars;

        let error_bar_x = {x: error_bars.x};

        let line_error_bar_x = d3.line()
            .x(d => this.x_scale(d[this.x_axis_data_col]))
            .y(d => this.y_scale(d.bound));

        error_bars.x.forEach((error_bar) => {
            d3.select('#data-plot').append("path")
                .attr("class", "error-bar-x")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line_error_bar_x(error_bar));
        })

        let line_error_bar_y = d3.line()
            .x(d => this.x_scale(d.bound))
            .y(d => this.y_scale(d[this.y_axis_data_col]));

        error_bars.y.forEach((error_bar) => {
            d3.select('#data-plot').append("path")
                .attr("class", "error-bar-x")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .attr("d", line_error_bar_y(error_bar));
        })

    }

    _setAxisLine() {
        let line = d3.line()
            .curve(d3.curveCatmullRom)
            .x(d => this.x_axis(d[this.x_axis_data_col]))
            .y(d => this.y_axis(d[this.y_axis_data_col]));

        this.line_container = this.svg.append("g")
            .attr("id", "path-container")
            .attr("clip-path", "url(#clip)");

        this.path = this.line_container.append("path")
            .attr("id", "path")
            .attr("fill", "none").attr("stroke", "steelblue")
            .attr("d", line(data));
    }

    _setZoomBehavior() {

        this.zoom = d3.zoom()
            .scaleExtent([.5, 20])
            .extent([[0, 0], [this.width, this.height]])
            .on("zoom", this._updateChart);

        this.zoom_rect = this.svg.append("rect")
            .attr("width", this.width)
            .attr("height", this.height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')')
            .call(this.zoom);

    }

    _updateChart(e) {

        let rescaled_x = e.transform.rescaleX(this.x_scale);
        let rescaled_y = e.transform.rescaleY(this.y_scale);

        this.x_axis.call(d3.axisBottom(rescaled_x).tickFormat(d3.format(D3Graph.default_axis_tick_format)))
        this.y_axis.call(d3.axisLeft(rescaled_y).tickFormat(d3.format(D3Graph.default_axis_tick_format)))

        this.svg.selectAll(".tick-line").remove();
        this.svg.selectAll("#y-label").remove();
        this.svg.selectAll("#x-label").remove();
        this.svg.selectAll(".error-bar-x").remove();

        this.x_axis.selectAll(".tick line").clone()
            .attr("class", "tick-line")
            .attr("y2", -this.height)
            .attr("stroke-opacity", 0.2)

        this.y_axis.selectAll(".tick line").clone()
            .attr("class", "tick-line")
            .attr("x2", this.width)
            .attr("stroke-opacity", 0.2)

        this._setXAxisLabel();
        this._setYAxisLabel();

        let x_data_col = this.x_axis_data_col;
        let y_data_col = this.y_axis_data_col;

        this.svg.selectAll("circle")
            .data(this.dataset)
            .transition()
            .duration(150)
            .attr("cx", function (d) { return rescaled_x(d[x_data_col]); } )
            .attr("cy", function (d) { return rescaled_y(d[y_data_col]); } )

        if(this.has_line) {
            this.svg.selectAll("path").remove();
            this._setAxisLine();
        }

        if(this.has_error_bars) {

            let line_error_bar_x = d3.line()
                .x(d => rescaled_x(d[this.x_axis_data_col]))
                .y(d => rescaled_y(d.bound));

            this.error_bars.x.forEach((error_bar) => {
                d3.select('#data-plot').append("path")
                    .attr("class", "error-bar-x")
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", line_error_bar_x(error_bar));
            })

            let line_error_bar_y = d3.line()
                .x(d => rescaled_x(d.bound))
                .y(d => rescaled_y(d[this.y_axis_data_col]));

            this.error_bars.y.forEach((error_bar) => {
                d3.select('#data-plot').append("path")
                    .attr("class", "error-bar-x")
                    .attr("fill", "none")
                    .attr("stroke", "steelblue")
                    .attr("stroke-width", 1.5)
                    .attr("d", line_error_bar_y(error_bar));
            })
        }

    }

    _getFullWidth() {
        return this.width + this.margin.left + this.margin.right
    }

    _getFullHeight() {
        return this.height + this.margin.top + this.margin.bottom
    }
}
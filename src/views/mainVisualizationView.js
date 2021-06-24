const MainVisualizationView = () => {
	function init(width, height) {
		d3.select('#visualization')
			.append('svg')
			.attr('id', 'narrative-chart')
			.attr('width', width)
			.attr('height', height);
	}

	function update(width, height) {
		d3.select('#narrative-chart').attr('width', width).attr('height', height);
	}

	function resize(shouldExpand) {
		document.getElementById('visualization').style.width = `${
			shouldExpand ? '100%' : 'calc(100vw - 600px)'
		}`;
	}

	return {
		init,
		update,
		resize,
	};
};

export default MainVisualizationView;

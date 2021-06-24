import { NarrativeEvents } from '../aux/consts.js';
import MainVisualizationView from '../views/mainVisualizationView.js';

const PADDING = 10;

const MainVisualizationController = (narrative) => {
	const mainVisualizationView = MainVisualizationView();

	function init() {
		narrative
			.getNarrativeEvent(NarrativeEvents.CHANGE_EVENT)
			.addListener(updateVisualizationView);
	}

	function updateVisualizationView() {
		mainVisualizationView.update(
			narrative.extent()[0] + PADDING,
			narrative.extent()[1] + PADDING
		);
	}

	function resize(isSidebarHidden) {
		mainVisualizationView.resize(isSidebarHidden);
	}

	function run() {
		mainVisualizationView.init(
			narrative.extent()[0] + PADDING,
			narrative.extent()[1] + PADDING
		);
	}

	return {
		init,
		resize,
		run,
	};
};

export default MainVisualizationController;

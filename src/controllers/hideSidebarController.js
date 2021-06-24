import HideSidebarView from '../views/hideSidebarView.js';

const HideSidebarController = () => {
	const hideSidebarView = HideSidebarView();
	let mainVisualizationController;

	function init() {
		hideSidebarView.hideSidebarEvent.addListener(hideSidebar);
	}

	function connect(_mainVisualizationController) {
		mainVisualizationController = _mainVisualizationController;
	}

	function hideSidebar(isHidden) {
		if (mainVisualizationController) {
			mainVisualizationController.resize(isHidden);
		}
	}

	function run() {
		hideSidebarView.init();
	}

	return {
		init,
		connect,
		run,
	};
};

export default HideSidebarController;

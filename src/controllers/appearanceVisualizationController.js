import AppearanceVisualizationView from '../views/appearanceVisualizationView.js';
import { NarrativeEvents } from '../aux/consts.js';

const LinkVisualizationController = (narrative) => {
	const appearanceVisualizationView = AppearanceVisualizationView();

	function init() {
		narrative
			.getNarrativeEvent(NarrativeEvents.CHANGE_EVENT)
			.addListener(updateVisualizationView);
		narrative
			.getNarrativeEvent(NarrativeEvents.SCROLL_TO_SCENE_EVENT)
			.addListener(scrollToScene);
	}

	function updateVisualizationView() {
		appearanceVisualizationView.init(
			narrative.shouldHideCharacter,
			narrative.shouldHideScene
		);
	}

	function scrollToScene() {
		appearanceVisualizationView.init(
			narrative.shouldHideCharacter,
			narrative.shouldHideScene
		);
	}

	function run() {
		appearanceVisualizationView.init(
			narrative.shouldHideCharacter,
			narrative.shouldHideScene
		);
	}

	return {
		init,
		run,
	};
};

export default LinkVisualizationController;

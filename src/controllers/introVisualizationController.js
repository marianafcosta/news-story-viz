import IntroVisualizationView from '../views/introVisualizationView.js';
import { NarrativeEvents } from '../aux/consts.js';

const IntroVisualizationController = (narrative) => {
	const introVisualizationView = IntroVisualizationView();

	function init() {
		introVisualizationView.dragIntroEvent.addListener(dragIntroNode);

		narrative
			.getNarrativeEvent(NarrativeEvents.CHANGE_EVENT)
			.addListener(updateVisualizationView);
		narrative
			.getNarrativeEvent(NarrativeEvents.SCROLL_TO_SCENE_EVENT)
			.addListener(scrollToScene);
	}

	function parseIntros() {
		return narrative.introductions().map((intro) => ({
			...intro,
			hidden: narrative.shouldHideCharacter(intro.character.id),
		}));
	}

	function dragIntroNode(id, xPos, yPos) {
		narrative.changeIntroPos(id, xPos, yPos);
	}

	function updateVisualizationView() {
		introVisualizationView.init(parseIntros());
	}

	function scrollToScene() {
		introVisualizationView.init(parseIntros());
	}

	function run() {
		introVisualizationView.init(parseIntros());
	}

	return {
		init,
		run,
	};
};

export default IntroVisualizationController;

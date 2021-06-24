import SceneSelectView from '../views/sceneSelectView.js';
import { NarrativeEvents } from '../aux/consts.js';

const SceneSelectController = (narrative) => {
	const sceneSelectView = SceneSelectView();

	function init() {
		sceneSelectView.selectSceneEvent.addListener(changeSceneStrength);

		narrative
			.getNarrativeEvent(NarrativeEvents.SCENE_SELECT_CHANGE_EVENT)
			.addListener(updateSceneSelectView);
	}

	function changeSceneStrength(id, checked) {
		narrative.changeSceneStrength(id, checked);
	}

	function updateSceneSelectView(scenes) {
		sceneSelectView.init(scenes);
	}

	function run() {
		sceneSelectView.init(narrative.scenes());
	}

	return {
		init,
		run,
	};
};

export default SceneSelectController;

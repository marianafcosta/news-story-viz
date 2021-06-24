import SceneInfoView from '../views/sceneInfoView.js';
import { NarrativeEvents } from '../aux/consts.js';
import { extractEntities } from '../aux/extractEntities.js';

const SceneInfoController = (narrative) => {
	const sceneInfoView = SceneInfoView();

	function init() {
		sceneInfoView.resetFocusEvent.addListener(resetSceneFocus);
		sceneInfoView.scrollEvent.addListener(scrollScenes);

		narrative
			.getNarrativeEvent(NarrativeEvents.ACTIVE_SCENE_CHANGE_EVENT)
			.addListener(showActiveScene);
	}

	function resetSceneFocus() {
		narrative.resetSceneFocus();
	}

	function scrollScenes(direction) {
		narrative.scrollScene(direction);
	}

	function showActiveScene(scene) {
		sceneInfoView.update(
			scene ? scene.title : undefined,
			scene ? scene.date : undefined,
			scene
				? extractEntities(
						scene.description,
						scene.characters.map((character) => ({
							name: character.name,
							color:
								character.affiliation === 'none'
									? character.color
									: character.affiliation,
							synonyms: character.synonyms,
						}))
				  )
				: undefined,
			scene && scene.location ? scene.location.where : undefined
		);
	}

	function run() {
		sceneInfoView.init();
	}

	return {
		init,
		run,
	};
};

export default SceneInfoController;

import SceneVisualizationView from '../views/sceneVisualizationView.js';
import { NarrativeEvents } from '../aux/consts.js';

const SceneVisualizationController = (narrative) => {
	const sceneVisualizationView = SceneVisualizationView();

	function init() {
		sceneVisualizationView.changeActiveSceneEvent.addListener(setSceneInFocus);
		sceneVisualizationView.dragSceneEvent.addListener(changeScenePos);

		narrative
			.getNarrativeEvent(NarrativeEvents.CHANGE_EVENT)
			.addListener(updateVisualizationView);
		narrative
			.getNarrativeEvent(NarrativeEvents.SCROLL_TO_SCENE_EVENT)
			.addListener(scrollToScene);
	}

	function parseScenes() {
		// NOTE: THIS IS PASSING BY VALUE!
		return narrative.scenes().map((scene) => ({
			...scene,
			hidden: narrative.shouldHideScene(scene.id),
			hiddenLocation: narrative.shouldHideLocations(),
		}));
	}

	function setSceneInFocus(id) {
		narrative.setSceneInFocus(id);
	}

	function changeScenePos(scene, yPos) {
		narrative.changeScenePos(scene, yPos);
	}

	function updateVisualizationView() {
		sceneVisualizationView.init(parseScenes());
	}

	function scrollToScene(scene, narrativeExtent) {
		if (scene) {
			sceneVisualizationView.scrollToScene(scene.x, scene.y, narrativeExtent);
		}
	}

	function run() {
		sceneVisualizationView.init(parseScenes());
	}

	return {
		init,
		run,
	};
};

export default SceneVisualizationController;

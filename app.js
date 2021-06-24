import InteractiveNarrative from './src/models/interactiveNarrative.js';
import CharacterSelectController from './src/controllers/characterSelectController.js';
import OptionsController from './src/controllers/optionsController.js';
import SceneInfoController from './src/controllers/sceneInfoController.js';
import TimeSelectController from './src/controllers/timeSelectController.js';
import SceneSelectController from './src/controllers/sceneSelectController.js';
import HideSidebarController from './src/controllers/hideSidebarController.js';
import StorylinePickerController from './src/controllers/storylinePickerController.js';
import TimelineController from './src/controllers/timelineController.js';
import LinkVisualizationController from './src/controllers/linkVisualizationController.js';
import AppearanceVisualizationController from './src/controllers/appearanceVisualizationController.js';
import SceneVisualizationController from './src/controllers/sceneVisualizationController.js';
import IntroVisualizationController from './src/controllers/introVisualizationController.js';
import MainVisualizationController from './src/controllers/mainVisualizationController.js';
import AboutController from './src/controllers/aboutController.js';
import TitleController from './src/controllers/titleController.js';

const App = () => {
	const models = {
		narrative: InteractiveNarrative(),
	};

	const controllers = {
		characterSelect: CharacterSelectController(models.narrative),
		options: OptionsController(models.narrative),
		sceneInfo: SceneInfoController(models.narrative),
		timeSelect: TimeSelectController(models.narrative),
		mainVisualization: MainVisualizationController(models.narrative),
		linkVisualization: LinkVisualizationController(models.narrative),
		sceneSelect: SceneSelectController(models.narrative),
		sceneVisualization: SceneVisualizationController(models.narrative),
		introVisualization: IntroVisualizationController(models.narrative),
		appearanceVisualization: AppearanceVisualizationController(
			models.narrative
		),
		hideSidebar: HideSidebarController(),
		storylinePicker: StorylinePickerController(models.narrative),
		timeline: TimelineController(models.narrative),
		about: AboutController(),
		title: TitleController(models.narrative),
	};

	// NOTE: If two controllers are connected, then they need to communicate. This communication channel, as of now, is unidirectional.
	controllers.hideSidebar.connect(controllers.mainVisualization);
	controllers.options.connect(controllers.timeline);

	// NOTE: The order in which things load is important.
	// In this case, our model (narrative) needs to load before the views are
	// created because the initialization of some of them (e.g. the character
	// selection) depend on the narrative being available.
	async function run() {
		for (const model in models) {
			await models[model].init();
		}

		for (const controller in controllers) {
			controllers[controller].init();
			controllers[controller].run();
		}
	}

	return {
		run,
	};
};

export default App;

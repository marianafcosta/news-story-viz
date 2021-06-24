import OptionsView from '../views/optionsView.js';
import { svgToPdf } from '../aux/aux.js';

const OptionsController = (narrative) => {
	const optionsView = OptionsView();
	let timelineController;

	function init() {
		optionsView.hideUnselectedCharsEvent.addListener(changeVisibilityOptions);
		optionsView.includeSelectedCharsAlwaysEvent.addListener(
			changeVisibilityOptions
		);
		optionsView.hideScenesWoSelectedCharsEvent.addListener(
			changeVisibilityOptions
		);
		optionsView.hideUnselectedScenesEvent.addListener(changeVisibilityOptions);
		optionsView.spaceOutScenesEvent.addListener(spaceOutScenes);
		optionsView.updateStorylineEvent.addListener(updateStorylineCharacters);
		optionsView.updateStorylineScenesEvent.addListener(updateStorylineByScenes);
		optionsView.resetStorylineEvent.addListener(narrative.resetStoryline);
		optionsView.selectCharsInCurrSceneEvent.addListener(
			focusCharsInCurrActiveScene
		);
		optionsView.resetCharSelectionEvent.addListener(resetCharSelection);
		optionsView.printPdfEvent.addListener(printPdf);
		optionsView.showDatesEvent.addListener(showDates);
	}

	function changeVisibilityOptions(option) {
		narrative.changeVisibilityOptions(option);
	}

	function spaceOutScenes() {
		narrative.spaceOutScenes();
	}

	function updateStorylineCharacters() {
		narrative.updateStorylineCharacters();
	}

	function updateStorylineByScenes() {
		narrative.updateStorylineScenes();
	}

	function focusCharsInCurrActiveScene() {
		narrative.focusCharsInCurrActiveScene();
	}

	function resetCharSelection() {
		narrative.resetCharFocus();
	}

	function showDates() {
		timelineController.showDates();
	}

	function connect(_timelineController) {
		timelineController = _timelineController;
	}

	function printPdf() {
		svgToPdf([
			document.getElementById('timeline'),
			document.getElementById('narrative-chart'),
		]);
	}

	function run() {
		optionsView.init();
	}

	return {
		init,
		run,
		connect,
	};
};

export default OptionsController;

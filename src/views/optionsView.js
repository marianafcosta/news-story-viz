import Event from '../aux/event.js';
import { VisibilityOptions } from '../aux/consts.js';

const OptionsView = () => {
	const hideUnselectedCharsEvent = Event();
	const includeSelectedCharsAlwaysEvent = Event();
	const hideScenesWoSelectedCharsEvent = Event();
	const hideUnselectedScenesEvent = Event();
	const spaceOutScenesEvent = Event();
	const updateStorylineEvent = Event();
	const updateStorylineScenesEvent = Event();
	const selectCharsInCurrSceneEvent = Event();
	const resetCharSelectionEvent = Event();
	const resetStorylineEvent = Event();
	const printPdfEvent = Event();
	const showDatesEvent = Event();

	function init() {
		document
			.getElementById('checkbox-hide-chars')
			.addEventListener('click', () =>
				hideUnselectedCharsEvent.trigger(
					VisibilityOptions.HIDE_UNSELECTED_CHARS
				)
			);
		document
			.getElementById('checkbox-include-selected')
			.addEventListener('click', () =>
				includeSelectedCharsAlwaysEvent.trigger(
					VisibilityOptions.INCLUDE_SELECTED_CHARS_IN_ALL_EVENTS
				)
			);
		document
			.getElementById('checkbox-hide-events')
			.addEventListener('click', () =>
				hideScenesWoSelectedCharsEvent.trigger(
					VisibilityOptions.HIDE_SCENES_WO_SELECTED_CHARS
				)
			);
		document
			.getElementById('checkbox-hide-unselected-events')
			.addEventListener('click', () =>
				hideUnselectedScenesEvent.trigger(
					VisibilityOptions.HIDE_UNSELECTED_SCENES
				)
			);
		document
			.getElementById('checkbox-show-dates')
			.addEventListener('click', () => showDatesEvent.trigger());
		document
			.getElementById('checkbox-space-out-events')
			.addEventListener('click', () => spaceOutScenesEvent.trigger());
		document
			.getElementById('button-select-event-chars')
			.addEventListener('click', () => selectCharsInCurrSceneEvent.trigger());
		document
			.getElementById('button-reset-chars')
			.addEventListener('click', () => resetCharSelectionEvent.trigger());
		document
			.getElementById('button-update-storyline')
			.addEventListener('click', () => updateStorylineEvent.trigger());
		document
			.getElementById('button-update-storyline-scenes')
			.addEventListener('click', () => updateStorylineScenesEvent.trigger());
		document
			.getElementById('button-reset-storyline')
			.addEventListener('click', () => resetStorylineEvent.trigger());
		document
			.getElementById('button-download-storyline')
			.addEventListener('click', () => printPdfEvent.trigger());
	}

	return {
		init,
		hideUnselectedCharsEvent,
		includeSelectedCharsAlwaysEvent,
		hideScenesWoSelectedCharsEvent,
		hideUnselectedScenesEvent,
		spaceOutScenesEvent,
		updateStorylineEvent,
		updateStorylineScenesEvent,
		selectCharsInCurrSceneEvent,
		resetCharSelectionEvent,
		resetStorylineEvent,
		printPdfEvent,
		showDatesEvent,
	};
};

export default OptionsView;

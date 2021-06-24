import { NarrativeEvents } from '../aux/consts.js';
import Narrative from '../../lib/narrative.js';
import Event from '../aux/event.js';

const InteractiveNarrative = () => {
	const narrative = Narrative();

	const VisibilityFunctions = Object.freeze({
		HIDE_UNSELECTED_CHARS: hideUnselectedChars,
		INCLUDE_SELECTED_CHARS_IN_ALL_EVENTS: () => {},
		HIDE_SCENES_WO_SELECTED_CHARS: hideScenes,
		HIDE_UNSELECTED_SCENES: hideScenes,
		HIDE_LOCATIONS: () => {},
	});

	const visibilityOptions = Object.seal({
		HIDE_UNSELECTED_CHARS: false,
		INCLUDE_SELECTED_CHARS_IN_ALL_EVENTS: false,
		HIDE_SCENES_WO_SELECTED_CHARS: false,
		HIDE_UNSELECTED_SCENES: false,
		HIDE_LOCATIONS: true,
	});

	let changeEvent,
		timeChangeEvent,
		charChangeEvent,
		locationSelectChangeEvent,
		charSelectChangeEvent,
		sceneSelectChangeEvent,
		activeSceneChangeEvent,
		scrollToSceneEvent,
		sceneInFocus,
		sceneInFocusIndex,
		startTime,
		endTime,
		proportionalScenePlacement,
		scenesInsideTimeframe;

	// =============
	// Init
	// =============

	// Initialize interactive narrative
	// -------------
	//
	async function init() {
		sceneInFocus = -1;
		sceneInFocusIndex = -1;
		startTime = -1;
		endTime = -1;
		proportionalScenePlacement = false;
		scenesInsideTimeframe = false;
		changeEvent = Event();
		timeChangeEvent = Event();
		charChangeEvent = Event();
		locationSelectChangeEvent = Event();
		charSelectChangeEvent = Event();
		sceneSelectChangeEvent = Event();
		activeSceneChangeEvent = Event();
		scrollToSceneEvent = Event();
		await narrative.init();
		resetTimeframe();
	}

	// =============
	// Scenes
	// =============

	// Get scene in focus
	// -------------
	//
	// Returns the scene which is currently in focus, or undefined if it doesn't
	// exist.
	function getSceneInFocus() {
		return narrative
			.scenes()
			.find((currScene) => currScene.id === sceneInFocus);
	}

	// Set scene in focus
	// -------------
	//
	// Sets the scene which is currently in focus. If the scene we're trying to get in focus is already in focus, then remove its focus.
	// Returns the new scene in focus or undefined if we negated the scene's focus (or if for some reason the scene now in focus doesn't exist).
	function setSceneInFocus(id) {
		sceneInFocus = sceneInFocus === id ? -1 : id;
		sceneInFocusIndex = narrative.sceneIndex(sceneInFocus);
		changeEvent.trigger(interactiveNarrative);
		activeSceneChangeEvent.trigger(id !== -1 ? getSceneInFocus() : null);
		if (sceneInFocus !== -1) {
			scrollToSceneEvent.trigger(getSceneInFocus(), narrative.extent());
		}
		return getSceneInFocus();
	}

	// Change scene strength
	// ------
	//
	// Change the strength of a scene (whether its `highlighted` property is
	// set to true or false) to a specfic value. If no value is specified,
	// then the current value is negated. Returns the corresponding character.
	function changeSceneStrength(scene, value) {
		const sceneToUpdate = narrative.scene(scene);
		if (sceneToUpdate) {
			sceneToUpdate.highlighted = value ? value : !sceneToUpdate.highlighted;
			if (visibilityOptions.HIDE_UNSELECTED_SCENES) {
				hideScenes();
			}
			changeEvent.trigger(interactiveNarrative);
		}
		return sceneToUpdate;
	}

	// Change scene visibility
	// ------
	//
	// Change the visibility of a scene (whether its `hidden` property is
	// set to true or false) to a specfic value. If no value is specified,
	// then the current value is negated. Returns the corresponding scene.
	function changeSceneVisibility(scene, value) {
		const sceneToUpdate = narrative
			.scenes()
			.find((currScene) => currScene.id === scene);
		if (sceneToUpdate) {
			sceneToUpdate.hidden =
				value !== (null || undefined) ? value : !sceneToUpdate.hidden;
		}
		changeEvent.trigger(interactiveNarrative);
		return sceneToUpdate;
	}

	// Scroll scenes
	// ------
	//
	// Sequentially changes the scene which is currently in focus.
	function scrollScene(direction) {
		let nextIndex = sceneInFocusIndex + direction;
		let nextScene = narrative.sceneByIndex(nextIndex);
		while (nextScene !== undefined && shouldHideSceneInternal(nextScene.id)) {
			nextIndex += direction;
			nextScene = narrative.sceneByIndex(nextIndex);
		}

		if (nextScene !== undefined) {
			sceneInFocus = nextScene.id;
			sceneInFocusIndex = nextIndex;
		}

		changeEvent.trigger(interactiveNarrative);
		activeSceneChangeEvent.trigger(getSceneInFocus());
		scrollToSceneEvent.trigger(nextScene, narrative.extent());
	}

	// Reset active scene
	// ------
	//
	// Changes the `highlighted` property of all scenes to false
	function resetSceneFocus() {
		sceneInFocus = -1;
		sceneInFocusIndex = -1;
		changeEvent.trigger(interactiveNarrative);
		activeSceneChangeEvent.trigger(getSceneInFocus());
	}

	// Determine whether a scene should be hidden
	// ------
	//
	// Same logic as that of determining the visibility of a character,
	// but this one is easier.
	function shouldHideScene(id) {
		const scene = narrative.scene(id);
		return (
			scene !== undefined &&
			((id !== sceneInFocus && sceneInFocus !== -1) ||
				scene.hidden ||
				(!isSceneWithinTimeframe(scene.id) &&
					!narrative.undefinedDates() &&
					scenesInsideTimeframe))
		);
	}

	function shouldHideSceneInternal(id) {
		const scene = narrative.scene(id);
		return (
			(!scene.highlighted && visibilityOptions.HIDE_UNSELECTED_SCENES) ||
			(!sceneHasSelectedChar(scene) &&
				visibilityOptions.HIDE_SCENES_WO_SELECTED_CHARS) ||
			(!isSceneWithinTimeframe(scene.id) &&
				!narrative.undefinedDates() &&
				scenesInsideTimeframe)
		);
		// TODO: All chars ahre hidden
		// ||
		// ()
	}

	// Hide scenes according to the options set
	// ------
	//
	function hideScenes() {
		narrative.scenes().forEach((scene) => {
			scene.hidden =
				(!sceneHasSelectedChar(scene) &&
					visibilityOptions.HIDE_SCENES_WO_SELECTED_CHARS) ||
				(!scene.highlighted && visibilityOptions.HIDE_UNSELECTED_SCENES);
		});
	}

	// Places the scene either uniformely or according to their timestamp
	// ------
	//
	function spaceOutScenes() {
		proportionalScenePlacement = !proportionalScenePlacement;
		narrative.changeScenePlacement(proportionalScenePlacement);
		changeEvent.trigger(interactiveNarrative);
	}

	// =============
	// Characters
	// =============

	// Change character visibility
	// ------
	//
	// Change the visibility of a character (whether its `hidden` property is
	// set to true or false) to a specfic value. If no value is specified,
	// then the current value is negated. Returns the corresponding character.
	function changeCharVisibility(char, value) {
		const charToUpdate = narrative
			.characters()
			.find((currChar) => currChar.id === char);
		if (charToUpdate) {
			charToUpdate.hidden = value ? value : !charToUpdate.hidden;
		}
		changeEvent.trigger(interactiveNarrative);
		return charToUpdate;
	}

	// Change character strength
	// ------
	//
	// Change the strength of a character (whether its `highlighted` property is
	// set to true or false) to a specfic value. If no value is specified,
	// then the current value is negated. Returns the corresponding character.
	function changeCharStrength(char, value) {
		const charToUpdate = narrative
			.characters()
			.find((currChar) => currChar.id === char);
		if (charToUpdate) {
			charToUpdate.highlighted = value ? value : !charToUpdate.highlighted;
		}
		if (visibilityOptions.HIDE_SCENES_WO_SELECTED_CHARS) {
			hideScenes();
		}
		changeEvent.trigger(interactiveNarrative);
		return charToUpdate;
	}

	// Focus on the characters in the current active scene
	// ------
	//
	// Changes the `highlighted` property of the characters in the current active scene
	// to `true`. If no scene is active at the moment, nothing happens.
	function focusCharsInCurrActiveScene() {
		const currScene = getSceneInFocus();
		if (currScene !== undefined) {
			currScene.characters.forEach((char) => (char.highlighted = true));
		}
		if (visibilityOptions.HIDE_SCENES_WO_SELECTED_CHARS) {
			hideScenes();
		}
		changeEvent.trigger(interactiveNarrative);
	}

	// Remove the focus from all characters
	// ------
	//
	// Changes the `highlighted` property of all characters to false.
	function resetCharFocus() {
		narrative.characters().forEach((char) => (char.highlighted = false));
		changeEvent.trigger(interactiveNarrative);
		charChangeEvent.trigger(narrative.characters());
	}

	// Determine whether a character should be hidden
	// ------
	//
	// Besides the `hidden` property, there are other factors that have to be taken
	// into consideration when determining whether that character should be hidden or not.
	// For exemple, if a scene is active, the characters selected don't appear in that scene,
	// and the `include characters even if they don't participate in the current scene` is set
	// to false, then the character should be hidden.
	//
	// -> Selected
	// 	-> In current event: NO
	// 	-> Not in current event
	// 		-> Selected chars not in current event should appear: NO
	// 		-> Selected chars not in current event should not appear: YES
	// 	-> No active event: NO
	// -> Not selected
	// 	-> In current event
	// 		-> Unselected chars should be hidden: YES
	// 		-> Unselected chars should not be hidden: NO
	// 	-> Not in current event: YES
	// 	-> No active event
	// 		-> Unselected chars should be hidden: YES
	// 		-> Unselected chars should not be hidden: NO
	function shouldHideCharacter(id) {
		const character = narrative.character(id);
		if (character === undefined) {
			return false;
		}

		if (character.highlighted) {
			if (
				sceneInFocus === -1 ||
				isCharacterInCurrentFocusedScene(character.id)
			) {
				return false;
			} else {
				return !visibilityOptions.INCLUDE_SELECTED_CHARS_IN_ALL_EVENTS;
			}
		} else {
			if (
				sceneInFocus === -1 ||
				isCharacterInCurrentFocusedScene(character.id)
			) {
				return visibilityOptions.HIDE_UNSELECTED_CHARS;
			} else {
				return true;
			}
		}
	}

	// Determine if a character participates in the currently active scene
	// ------
	//
	function isCharacterInCurrentFocusedScene(id) {
		return getSceneInFocus().characters.find(
			(character) => character.id === id
		);
	}

	// Change the visibility of unselected characters
	// ------
	//
	function hideUnselectedChars() {
		narrative
			.characters()
			.forEach(
				(char) =>
					(char.hidden =
						!char.highlighted && visibilityOptions.HIDE_UNSELECTED_CHARS)
			);
	}

	// Check if character is in scene
	// ------
	//
	function sceneHasSelectedChar(scene) {
		return scene.characters.find((char) => char.highlighted);
	}

	// =============
	// Locations
	// =============

	// Determine whether the locations should be hidden
	// ------
	//
	// Again, same logic as above.
	function shouldHideLocations() {
		return visibilityOptions.HIDE_LOCATIONS;
	}

	// =============
	// Time
	// =============

	// Get start time
	// -------------
	//
	function getStartTime() {
		return startTime;
	}

	// Get end time
	// -------------
	//
	function getEndTime() {
		return endTime;
	}

	// Get start time
	// -------------
	//
	function setStartTime(st) {
		startTime = st;
		changeEvent.trigger(interactiveNarrative);
	}

	// Get end time
	// -------------
	//
	function setEndTime(et) {
		endTime = et;
		changeEvent.trigger(interactiveNarrative);
	}

	// Hides scenes which fall outside of the timeframe selected by the user
	// -----
	//
	function hideScenesOutsideTimeframe() {
		scenesInsideTimeframe = !scenesInsideTimeframe;
		changeEvent.trigger(interactiveNarrative);
	}

	// Reset the start and end times of the narrative to those of the first and last events, respectively.
	// -----
	//
	function resetTimeframe() {
		startTime = narrative.scenes()[0].date
			? new Date(narrative.scenes()[0].date)
			: null;
		endTime = narrative.scenes()[narrative.scenes().length - 1]
			? new Date(narrative.scenes()[narrative.scenes().length - 1].date)
			: null;
		timeChangeEvent.trigger(startTime, endTime);
		changeEvent.trigger(interactiveNarrative);
	}

	// Determines whether a scene is within the bounds set by the current start and time times
	// ------
	//
	function isSceneWithinTimeframe(id) {
		const scene = narrative.scene(id);
		const sceneDate = new Date(scene.date);
		return sceneDate <= endTime && sceneDate >= startTime;
	}

	// Determines whether a scene a link should be hidden or not: when the node it connects to is outside
	// of the selected timeframe and the option to hide links outside said timeframe is set
	// ------
	//
	function shouldHideLink(link) {
		return (
			!isSceneWithinTimeframe(link.target.scene.id) && scenesInsideTimeframe
		);
	}

	// =============
	// Wrappers for the storyline update functions in `narrative`
	// TODO: Change this logic so that these wrappers are unnecessary
	// =============

	function triggerStorylineChangeEvents() {
		locationSelectChangeEvent.trigger(narrative.locations());
		charSelectChangeEvent.trigger(narrative.characters());
		sceneSelectChangeEvent.trigger(narrative.scenes());
		changeEvent.trigger();
	}

	function updateStorylineCharacters() {
		resetSceneFocus();
		narrative.updateStorylineCharacters();
		resetTimeframe();
		triggerStorylineChangeEvents();
	}

	function updateStorylineTimeframe() {
		resetSceneFocus();
		narrative.updateStorylineTimeframe(startTime, endTime);
		resetTimeframe();
		triggerStorylineChangeEvents();
	}

	function updateStorylineScenes() {
		resetSceneFocus();
		narrative.updateStorylineScenes();
		resetTimeframe();
		triggerStorylineChangeEvents();
	}

	function resetStoryline() {
		resetSceneFocus();
		narrative.resetStoryline();
		resetTimeframe();
		triggerStorylineChangeEvents();
	}

	async function changeStoryline(filename) {
		resetSceneFocus();
		await narrative.changeStoryline(filename);
		resetTimeframe();
		triggerStorylineChangeEvents();
	}

	// =============
	// Aux
	// =============

	// Change visibility options
	// ------
	//
	// Changes the visbility option specified in `option` to `value`.
	// Each function may handle a null value for value differently.
	function changeVisibilityOptions(option, value) {
		visibilityOptions[option] = value ? value : !visibilityOptions[option];
		VisibilityFunctions[option](value);
		changeEvent.trigger(interactiveNarrative);
	}

	// Change the Y position of a scene
	// -----
	//
	function changeScenePos(id, yPosition, xPosition) {
		narrative.scene(id).y = yPosition || narrative.scene(id).y;
		narrative.scene(id).x = xPosition || narrative.scene(id).x;
		changeEvent.trigger(interactiveNarrative);
	}

	// Change the Y position of a scene
	// -----
	//
	function changeIntroPos(id, xPosition, yPosition) {
		narrative.introduction(id).x = xPosition;
		narrative.introduction(id).y = yPosition;
		changeEvent.trigger(interactiveNarrative);
	}

	// Getters for the interaction events
	// -------------
	//
	function getNarrativeEvent(narrativeEvent) {
		switch (narrativeEvent) {
			case NarrativeEvents.ACTIVE_SCENE_CHANGE_EVENT:
				return activeSceneChangeEvent;
			case NarrativeEvents.CHANGE_EVENT:
				return changeEvent;
			case NarrativeEvents.CHAR_CHANGE_EVENT:
				return charChangeEvent;
			case NarrativeEvents.CHAR_SELECT_CHANGE_EVENT:
				return charSelectChangeEvent;
			case NarrativeEvents.SCENE_SELECT_CHANGE_EVENT:
				return sceneSelectChangeEvent;
			case NarrativeEvents.SCROLL_TO_SCENE_EVENT:
				return scrollToSceneEvent;
			case NarrativeEvents.TIME_CHANGE_EVENT:
				return timeChangeEvent;
			case NarrativeEvents.LOCATION_SELECT_CHANGE_EVENT:
				return locationSelectChangeEvent;
		}
	}

	// =============
	// Return object
	// =============

	const interactiveNarrative = {
		init,
		getStartTime,
		getEndTime,
		setStartTime,
		setEndTime,
		getSceneInFocus,
		setSceneInFocus,
		changeCharVisibility,
		changeCharStrength,
		changeSceneVisibility,
		changeSceneStrength,
		changeVisibilityOptions,
		changeScenePos,
		scrollScene,
		focusCharsInCurrActiveScene,
		resetCharFocus,
		resetSceneFocus,
		shouldHideCharacter,
		shouldHideScene,
		shouldHideLocations,
		shouldHideLink,
		hideScenesOutsideTimeframe,
		resetTimeframe,
		updateStorylineCharacters,
		updateStorylineScenes,
		resetStoryline,
		changeStoryline,
		getNarrativeEvent,
		spaceOutScenes,
		changeIntroPos,
		updateStorylineTimeframe,
		getStorylineId: narrative.getStorylineId,
		getStorylineTitle: narrative.getStorylineTitle,
		introductions: narrative.introductions,
		scenes: narrative.scenes,
		characters: narrative.characters,
		locations: narrative.locations,
		links: narrative.links,
		link: narrative.link,
		size: narrative.size,
		extent: narrative.extent,
	};

	return interactiveNarrative;
};

export default InteractiveNarrative;

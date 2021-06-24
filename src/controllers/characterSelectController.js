import CharacterSelectView from '../views/characterSelectView.js';
import { NarrativeEvents } from '../aux/consts.js';

const CharacterSelectController = (narrative) => {
	const characterSelectView = CharacterSelectView();

	function init() {
		characterSelectView.selectCharacterEvent.addListener(selectCharacter);

		narrative
			.getNarrativeEvent(NarrativeEvents.CHAR_CHANGE_EVENT)
			.addListener(changeCharacterSelection);
		narrative
			.getNarrativeEvent(NarrativeEvents.CHAR_SELECT_CHANGE_EVENT)
			.addListener(updateCharacterSelectView);
	}

	function selectCharacter(id) {
		narrative.changeCharStrength(id);
	}

	function changeCharacterSelection(characters) {
		characterSelectView.update(characters);
	}

	function updateCharacterSelectView(characters) {
		characterSelectView.init(characters);
	}

	function run() {
		characterSelectView.init(narrative.characters());
	}

	return {
		init,
		run,
	};
};

export default CharacterSelectController;

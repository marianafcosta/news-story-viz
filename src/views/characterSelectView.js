import NarrativeEvent from '../aux/event.js';

const CharacterSelectView = () => {
	const selectCharacterEvent = NarrativeEvent();

	function init(characters) {
		let box, label, group, dot;
		let div = document.getElementById('characters');

		// TODO: There are better ways to do this
		div.innerHTML = '';

		characters.forEach((character) => {
			box = document.createElement('input');
			label = document.createElement('label');
			group = document.createElement('div');
			dot = document.createElement('div');

			dot.setAttribute('class', 'character-dot');
			dot.style.backgroundColor =
				character.affiliation === 'none'
					? character.color
					: character.affiliation;

			group.setAttribute('class', 'character-select');

			box.setAttribute('type', 'checkbox');
			box.setAttribute('class', 'character-select-checkbox');
			box.setAttribute('name', character.name);
			box.setAttribute('id', `character-${character.id}`);
			box.setAttribute('character-id', `${character.id}`);

			box.addEventListener('click', () => {
				selectCharacterEvent.trigger(character.id);
			});

			label.setAttribute('for', `character-${character.id}`);
			label.innerHTML = character.name;

			group.appendChild(box);
			group.appendChild(label);
			group.appendChild(dot);
			div.appendChild(group);
		});
	}

	// TODO: Don't like this, especially the fact that I have character ID's in the DOM
	function update(characters) {
		const characterCheckboxes = document.getElementsByClassName(
			'character-select'
		);
		for (let charDiv of characterCheckboxes) {
			const input = charDiv.getElementsByClassName(
				'character-select-checkbox'
			)[0];
			const charId = input.getAttribute('character-id');
			const char = characters.find((character) => character.id === charId);
			if (char !== undefined && !char.highlighted && input.checked) {
				input.checked = false;
				input.dispatchEvent(new Event('change'));
			}
		}
	}

	return {
		init,
		update,
		selectCharacterEvent,
	};
};

export default CharacterSelectView;

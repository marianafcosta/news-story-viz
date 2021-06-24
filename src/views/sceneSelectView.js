import Event from '../aux/event.js';

const SceneSelectView = () => {
	const selectSceneEvent = Event();

	function init(scenes) {
		let box, label, group;
		let div = document.getElementById('events');

		// TODO: There are better ways to do this
		div.innerHTML = '';

		scenes.forEach((scene) => {
			box = document.createElement('input');
			label = document.createElement('label');
			group = document.createElement('div');

			group.setAttribute('class', 'event-select');

			box.setAttribute('type', 'checkbox');
			box.setAttribute('id', `checkbox-scene-${scene.id}`);

			box.addEventListener('click', (e) => {
				selectSceneEvent.trigger(scene.id, e.target.checked);
			});

			label.setAttribute('for', `checkbox-scene-${scene.id}`);
			label.innerHTML = `${scene.order + 1} - ${scene.title}`;

			group.appendChild(box);
			group.appendChild(label);
			div.appendChild(group);
		});
	}

	return {
		init,
		selectSceneEvent,
	};
};

export default SceneSelectView;

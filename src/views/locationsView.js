import Event from '../aux/event.js';

const LocationsView = () => {
	const hideLocationsEvent = Event();

	function init(locations) {
		document
			.getElementById('checkbox-hide-locations')
			.addEventListener('click', () => hideLocationsEvent.trigger());

		updateLocations(locations);
	}

	function updateLocations(locations) {
		const div = document.getElementById('locations');
		div.innerHTML = '';
		locations.forEach((location) => {
			let locationDiv = document.createElement('div');
			let locationText = document.createElement('p');
			let locationColor = document.createElement('div');

			locationText.innerHTML = location.where;
			locationText.setAttribute('class', 'location-name');
			locationColor.setAttribute('class', 'location-dot');
			locationColor.style['backgroundColor'] = location.color;

			locationDiv.setAttribute('class', 'location');
			locationDiv.appendChild(locationText);
			locationDiv.appendChild(locationColor);

			div.appendChild(locationDiv);
		});
	}

	return {
		init,
		updateLocations,
		hideLocationsEvent,
	};
};

export default LocationsView;

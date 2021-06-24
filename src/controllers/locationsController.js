import LocationsView from '../views/locationsView.js';
import { NarrativeEvents } from '../aux/consts.js';
import { VisibilityOptions } from '../aux/consts.js';

const LocationsController = (narrative) => {
	const locationsView = LocationsView();

	function init() {
		locationsView.hideLocationsEvent.addListener(hideLocations);

		narrative
			.getNarrativeEvent(NarrativeEvents.LOCATION_SELECT_CHANGE_EVENT)
			.addListener(updateLocationView);
	}

	function hideLocations() {
		narrative.changeVisibilityOptions(VisibilityOptions.HIDE_LOCATIONS);
	}

	function updateLocationView() {
		locationsView.updateLocations(narrative.locations());
	}

	function run() {
		locationsView.init(narrative.locations());
	}

	return {
		init,
		run,
	};
};

export default LocationsController;

import LinkVisualizationView from '../views/linkVisualizationView.js';
import { NarrativeEvents } from '../aux/consts.js';

const LinkVisualizationController = (narrative) => {
	const linkVisualizationView = LinkVisualizationView();

	function init() {
		narrative
			.getNarrativeEvent(NarrativeEvents.CHANGE_EVENT)
			.addListener(updateVisualizationView);
		narrative
			.getNarrativeEvent(NarrativeEvents.SCROLL_TO_SCENE_EVENT)
			.addListener(scrollToScene);
	}

	function parseLinks() {
		return narrative.links().map((link) => {
			return {
				id: `link-${narrative.getStorylineId()}-${link.character.id}-${
					link.target.scene.order
				}`,
				path: narrative.link()(link),
				hidden:
					narrative.shouldHideLink(link) ||
					narrative.shouldHideCharacter(link.character.id),
				affiliation: link.character.affiliation,
				color: link.character.color,
				highlighted: link.character.highlighted,
			};
		});
	}

	function updateVisualizationView() {
		linkVisualizationView.init(parseLinks());
	}

	function scrollToScene() {
		linkVisualizationView.init(parseLinks());
	}

	function run() {
		linkVisualizationView.init(parseLinks());
	}

	return {
		init,
		run,
	};
};

export default LinkVisualizationController;

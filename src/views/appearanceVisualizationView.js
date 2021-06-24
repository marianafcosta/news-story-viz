import { createTransition } from '../aux/aux.js';

const AppearanceVisualizationView = () => {
	function init(shouldHideCharacter, shouldHideScene) {
		const t = createTransition();

		d3.select('svg[id=narrative-chart]')
			.selectAll('.scene')
			.selectAll('.appearance')
			// NOTE: This couples the model with the view, but it's probably simpler just to leave it like this
			.data(
				(scene) => scene.appearances,
				(appearance) => appearance.id
			) // NOTE: Data should be supplied as a function (https://github.com/d3/d3-selection/blob/v2.0.0/README.md#selection_data)
			.join((enter) =>
				enter
					.append('circle')
					.attr('r', function () {
						return 4;
					})
					.attr(
						'class',
						(appearance) => 'appearance ' + appearance.character.affiliation
					)
			)
			.attr('cx', (appearance) => appearance.x)
			.attr('cy', (appearance) => appearance.y)
			.transition(t)
			.style('fill-opacity', (appearance) =>
				shouldHideCharacter(appearance.character.id) ||
				shouldHideScene(appearance.scene.id)
					? 0.2
					: 1
			)
			.style('fill', (appearance) =>
				appearance.character.affiliation === 'none'
					? appearance.character.color
					: appearance.character.affiliation
			);
	}

	return {
		init,
	};
};

export default AppearanceVisualizationView;

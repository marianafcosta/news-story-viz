import Event from '../aux/event.js';
import { createTransition } from '../aux/aux.js';

const IntroVisualizationView = () => {
	const dragIntroEvent = Event();

	const drag = d3
		.drag()
		.on('drag', (event, intro) =>
			dragIntroEvent.trigger(intro.id, event.x, event.y)
		);

	function introFn(s) {
		let g, text;

		g = s
			.append('g')
			.attr('class', 'intro')
			.attr('character-id', (intro) => {
				return intro.character.id;
			});
		// .on('click', (_, intro) => updateCharacterData(intro.character.id));
		g.call(drag);
		g.append('rect')
			.attr('y', -4)
			.attr('x', -4)
			.attr('width', 4)
			.attr('height', 8);

		text = g.append('g').attr('class', 'text');

		// Apppend two actual 'text' nodes to fake an 'outside' outline.
		text.append('text');
		text.append('text').attr('class', 'color');

		g.selectAll('text')
			.attr('text-anchor', 'end')
			.attr('y', '4px')
			.attr('x', '-8px')
			.text((intro) => intro.character.name);

		g.select('rect')
			.attr('class', (intro) => intro.character.affiliation)
			.attr('fill', (intro) =>
				intro.character.affiliation === 'none'
					? intro.character.color
					: intro.character.affiliation
			)
			.attr('stroke', 'none');
		return g;
	}

	function init(introductions) {
		const t = createTransition();

		const enterSelect = d3
			.select('svg[id=narrative-chart]')
			.selectAll('.intro')
			.data(introductions, (intro) => intro.id)
			.join((enter) => introFn(enter));

		enterSelect
			.select('rect')
			.attr('fill', (intro) =>
				intro.character.affiliation === 'none'
					? intro.character.color
					: intro.character.affiliation
			);
		enterSelect
			.select('.color')
			.style('fill', (intro) =>
				intro.character.affiliation === 'none'
					? intro.character.color
					: intro.character.affiliation
			)
			.attr('font-weight', (intro) =>
				intro.character.highlighted ? 'bold' : 'normal'
			);

		enterSelect
			.attr('transform', (intro) => {
				var x, y;
				x = Math.round(intro.x);
				y = Math.round(intro.y);
				return 'translate(' + [x, y] + ')';
			})
			.transition(t)
			.style('opacity', (intro) => (intro.hidden ? 0.2 : 1));
	}

	return {
		init,
		dragIntroEvent,
	};
};

export default IntroVisualizationView;

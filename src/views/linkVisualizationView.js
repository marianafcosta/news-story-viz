import { createTransition } from '../aux/aux.js';

const LinkVisualizationView = () => {
	/* links: [
			{
				id: `link-${narrative.getStorylineId()}-${link.character.id}-${idx}`,
				path: narrative.link()(link),
				hidden: narrative.shouldHideCharacter(link.character.id),
				affiliation: link.character.affiliation,
				color: link.character.color,
				highlighted: link.character.highlighted,
			} 
		]
	*/
	function init(links) {
		let t = createTransition();

		d3.select('svg[id=narrative-chart]')
			.selectAll('.link')
			.data(links, (link) => link.id)
			.join((enter) =>
				enter
					.append('path')
					// .attr('character-id', (link) => link.id)
					.attr('affiliation', (link) => link.affiliation)
					.attr('class', (link) => `${link.affiliation.toLowerCase()} link`)
			)
			.attr('d', (link) => link.path)
			.style('stroke', (link) =>
				!link.affiliation || link.affiliation === 'none'
					? link.color
					: link.affiliation
			)
			.transition(t)
			.style('stroke-width', (link) => {
				return link.highlighted ? '4px' : '2px'; // NOTE: https://github.com/d3/d3-transition/issues/46
			})
			.style('stroke-opacity', (link) => {
				return link.hidden ? 0.2 : 1;
			});
	}

	return {
		init,
	};
};

export default LinkVisualizationView;

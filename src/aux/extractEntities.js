function extractEntities(text, entities) {
	// TODO: Replace with localeCompare()
	function replaceAndAddSpan(match) {
		return `<span class="entity" style="background-color: ${
			entities.find(
				(entity) =>
					match.toLowerCase() === entity.name.toLowerCase() ||
					(entity.synonyms
						? entity.synonyms.find(
								(synonym) => synonym.toLowerCase() === match.toLowerCase()
						  )
						: false)
			).color
		}; color: #ffffff">${match}</span>`;
	}

	const regex = new RegExp(
		`${entities
			.map(
				(entity) =>
					`${entity.name}${
						entity.synonyms
							? `|${entity.synonyms
									.join('|')
									.replace(/[.*+?^${}()[\]\\]/g, '\\$&')}` // NOTE: Escapes any special characters in the entity's name
							: ''
					}`
			)
			.join('|')}`,
		'ig'
	);
	console.log(regex);
	return text.replaceAll(regex, replaceAndAddSpan);
}

export { extractEntities };

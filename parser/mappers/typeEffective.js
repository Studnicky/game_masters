const TYPE_MAP = {
	POKEMON_TYPE_NORMAL: { name: 'NORMAL', nianticSortOrder: 0 },
	POKEMON_TYPE_FIGHTING: { name: 'FIGHTING', nianticSortOrder: 1 },
	POKEMON_TYPE_FLYING: { name: 'FLYING', nianticSortOrder: 2 },
	POKEMON_TYPE_POISON: { name: 'POISON', nianticSortOrder: 3 },
	POKEMON_TYPE_GROUND: { name: 'GROUND', nianticSortOrder: 4 },
	POKEMON_TYPE_ROCK: { name: 'ROCK', nianticSortOrder: 5 },
	POKEMON_TYPE_BUG: { name: 'BUG', nianticSortOrder: 6 },
	POKEMON_TYPE_GHOST: { name: 'GHOST', nianticSortOrder: 7 },
	POKEMON_TYPE_STEEL: { name: 'STEEL', nianticSortOrder: 8 },
	POKEMON_TYPE_FIRE: { name: 'FIRE', nianticSortOrder: 9 },
	POKEMON_TYPE_WATER: { name: 'WATER', nianticSortOrder: 10 },
	POKEMON_TYPE_GRASS: { name: 'GRASS', nianticSortOrder: 11 },
	POKEMON_TYPE_ELECTRIC: { name: 'ELECTRIC', nianticSortOrder: 12 },
	POKEMON_TYPE_PSYCHIC: { name: 'PSYCHIC', nianticSortOrder: 13 },
	POKEMON_TYPE_ICE: { name: 'ICE', nianticSortOrder: 14 },
	POKEMON_TYPE_DRAGON: { name: 'DRAGON', nianticSortOrder: 15 },
	POKEMON_TYPE_DARK: { name: 'DARK', nianticSortOrder: 16 },
	POKEMON_TYPE_FAIRY: { name: 'FAIRY', nianticSortOrder: 17 }
};

function typeEffective(key, dataArray) {
	const typeMatrix = dataArray.reduce((typeEffective, element) => {
		const { templateId, data } = element;
		const raw = data[key];
		const { attackType, attackScalar } = raw;

		const type = TYPE_MAP[attackType];

		const mappedScalar = attackScalar.reduce((typeMatrix, multipler, index) => {
			//  Niantic has a weird ordering of types
			//  We can't count on it being consistent, so  match them to these array items by hardcoded sort order
			const typeDef = Object.values(TYPE_MAP).find((type) => {
				return type.nianticSortOrder === index;
			});
			typeMatrix[typeDef.name] = multipler;

			return typeMatrix;
		}, {});

		typeEffective[type.name] = mappedScalar;
		return typeEffective;
	}, {});

	return typeMatrix;
}

module.exports = typeEffective;

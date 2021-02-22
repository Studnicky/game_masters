const { arrayExclude, toCap } = require('../../utils');

const TYPE_STRING_MAP = {
	POKEMON_TYPE_NORMAL: 'NORMAL',
	POKEMON_TYPE_FIRE: 'FIRE',
	POKEMON_TYPE_WATER: 'WATER',
	POKEMON_TYPE_GRASS: 'GRASS',
	POKEMON_TYPE_ELECTRIC: 'ELECTRIC',
	POKEMON_TYPE_ICE: 'ICE',
	POKEMON_TYPE_FIGHTING: 'FIGHTING',
	POKEMON_TYPE_POISON: 'POISON',
	POKEMON_TYPE_GROUND: 'GROUND',
	POKEMON_TYPE_FLYING: 'FLYING',
	POKEMON_TYPE_PSYCHIC: 'PSYCHIC',
	POKEMON_TYPE_BUG: 'BUG',
	POKEMON_TYPE_ROCK: 'ROCK',
	POKEMON_TYPE_GHOST: 'GHOST',
	POKEMON_TYPE_DARK: 'DARK',
	POKEMON_TYPE_DRAGON: 'DRAGON',
	POKEMON_TYPE_STEEL: 'STEEL',
	POKEMON_TYPE_FAIRY: 'FAIRY'
};

const mappedKeys = ['type', 'niceLevelThreshold', 'greatLevelThreshold', 'excellentLevelThreshold'];

function type(key, combatMove) {
	const { templateId, data } = combatMove;
	const raw = data[key];

	const { type, excellentLevelThreshold, greatLevelThreshold, niceLevelThreshold } = raw;

	const mapped = {};

	mapped.id = TYPE_STRING_MAP[type];
	mapped.catchThreshold = {
		nice: niceLevelThreshold,
		great: greatLevelThreshold,
		excellent: excellentLevelThreshold
	};

	const unmappedKeys = arrayExclude(Object.keys(raw), mappedKeys);
	if (unmappedKeys.length) {
		for (const key of unmappedKeys) {
			console.log(`${key}:`, raw[key]);
		}
		debugger;
	}

	return mapped;
}

function combatType(key, dataArray) {
	const mappedItems = dataArray.map((item) => {
		return type(key, item);
	});

	const keyedItems = mappedItems.reduce((keyed, mapped) => {
		keyed[mapped.id] = mapped;

		return keyed;
	}, {});

	return keyedItems;
}

module.exports = combatType;

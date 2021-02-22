const { arrayExclude, toCap } = require('../../utils');
const namePattern = /(.*)_FAST/;

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

const mappedKeys = ['uniqueId', 'type', 'power', 'energyDelta', 'vfxName', 'durationTurns', 'buffs'];

function getMoveName(uniqueId) {
	const match = uniqueId.match(namePattern);
	const nameString = match ? match[1] : uniqueId;
	const nameTokens = nameString.toLowerCase().split(/_/g);

	const displayName = nameTokens
		.map((token) => {
			return toCap(token);
		})
		.join(' ');

	return displayName;
}

function move(key, combatMove) {
	const { templateId, data } = combatMove;
	const raw = data[key];
	const {
		uniqueId,
		type,
		power,
		energyDelta,
		vfxName,
		durationTurns = 0,
		buffs: { buffActivationChance, attackerAttackStatStageChange, attackerDefenseStatStageChange, targetAttackStatStageChange, targetDefenseStatStageChange } = {}
	} = raw;

	const mapped = {};

	mapped.id = uniqueId;
	mapped.name = getMoveName(uniqueId);
	mapped.moveType = TYPE_STRING_MAP[type];
	mapped.type = energyDelta > 0 ? 'FAST' : 'CHARGE';
	mapped.power = power;
	mapped.energyDelta = energyDelta;
	mapped.turns = durationTurns ? durationTurns : 0;
	mapped.hasStatusEffect = raw.hasOwnProperty('buffs') ? true : false;
	mapped.statusEffect = [
		...(attackerAttackStatStageChange ? [{ target: 'self', affects: 'Attack', effect: attackerAttackStatStageChange, chance: buffActivationChance }] : []),
		...(attackerDefenseStatStageChange ? [{ target: 'self', affects: 'Defense', effect: attackerDefenseStatStageChange, chance: buffActivationChance }] : []),
		...(targetAttackStatStageChange ? [{ target: 'opponent', affects: 'Attack', effect: targetAttackStatStageChange, chance: buffActivationChance }] : []),
		...(targetDefenseStatStageChange ? [{ target: 'opponent', affects: 'Defense', effect: targetDefenseStatStageChange, chance: buffActivationChance }] : [])
	];

	mapped.vfxName = vfxName;

	const unmappedKeys = arrayExclude(Object.keys(raw), mappedKeys);
	if (unmappedKeys.length) {
		for (const key of unmappedKeys) {
			console.log(`${key}:`, raw[key]);
		}
		debugger;
	}

	return mapped;
}

function combatMove(key, dataArray) {
	const mappedItems = dataArray.map((item) => {
		return move(key, item);
	});

	const keyedItems = mappedItems.reduce((keyed, mapped) => {
		keyed[mapped.id] = mapped;

		return keyed;
	}, {});

	return keyedItems;
}

module.exports = combatMove;

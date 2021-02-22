const { arrayExclude } = require('../../utils');
const pokedexPattern = /V(\d+)_/;

const RARITY_MAP = {
	POKEMON_RARITY_LEGENDARY: 'LEGENDARY',
	POKEMON_RARITY_MYTHIC: 'MYTHIC',
	DEFAULT: 'DEFAULT'
};

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

const mappedKeys = [
	'pokemonId',
	'camera',
	'encounter',
	'isTransferable',
	'isDeployable',
	'pokedexHeightM',
	'pokedexWeightKg',
	'weightStdDev',
	'heightStdDev',
	'modelHeight',
	'modelScale',
	'modelScaleV2',
	'buddyGroupNumber',
	'buddyScale',
	'kmBuddyDistance',
	'buddyWalkedMegaEnergyAward',
	'buddyOffsetMale',
	'buddyOffsetFemale',
	'buddyPortraitOffset',
	'quickMoves',
	'cinematicMoves',
	'thirdMove',
	'type',
	'type2',
	'stats',
	'candyToEvolve',
	'evolutionPips',
	'familyId',
	'evolutionBranch',
	'evolutionIds',
	'animationTime',
	'disableTransferToPokemonHome',
	'form',
	'parentPokemonId',
	'shadow',
	'buddySize',
	'combatShoulderCameraAngle',
	'combatDefaultCameraAngle',
	'combatPlayerFocusCameraAngle',
	'eliteQuickMove',
	'eliteCinematicMove',
	'tempEvoOverrides',
	'raidBossDistanceOffset',
	'combatPlayerPokemonPositionOffset',
	'combatOpponentFocusCameraAngle',
	'rarity'
];

function mapMove(move, status) {
	return { status, name: move };
}

function getPokedexNumber(templateId) {
	const match = templateId.match(pokedexPattern);

	return parseInt(match[1], 10);
}

function pokemonSetting(key, pokemonSettings) {
	const { templateId, data } = pokemonSettings;
	const raw = data[key];

	const {
		//	Core attributes - these are on all pokemonSettings objects
		pokemonId,
		camera,
		animationTime,
		encounter,
		isTransferable,
		isDeployable,
		pokedexHeightM,
		pokedexWeightKg,
		weightStdDev,
		heightStdDev,
		modelHeight,
		modelScale,
		modelScaleV2,
		buddyGroupNumber,
		buddyScale,
		kmBuddyDistance,
		buddyWalkedMegaEnergyAward,
		buddyOffsetMale,
		buddyOffsetFemale,
		thirdMove,
		type,
		candyToEvolve,
		evolutionPips,
		familyId,
		evolutionBranch,
		evolutionIds,
		stats: { baseAttack, baseDefense, baseStamina },
		//	Optional keys - these are not guaranteed to be on the pokemonSettings object
		form = null,
		quickMoves = [],
		buddySize = 'NORMAL',
		cinematicMoves = [],
		buddyPortraitOffset = [],
		combatShoulderCameraAngle = [],
		combatDefaultCameraAngle = [],
		combatPlayerFocusCameraAngle = [],
		combatOpponentFocusCameraAngle = [],
		combatPlayerPokemonPositionOffset = [],
		disableTransferToPokemonHome = false,
		eliteQuickMove = null,
		eliteCinematicMove = null,
		parentPokemonId = null,
		raidBossDistanceOffset = [],
		rarity = 'DEFAULT',
		shadow: { purificationCandyNeeded = 0, purificationStardustNeeded = 0, purifiedChargeMove = null, shadowChargeMove = null } = {},
		type2 = null,
		tempEvoOverrides = null
	} = raw;

	const mapped = {};
	const pokedexNumber = getPokedexNumber(templateId);

	mapped.pokedexNumber = pokedexNumber;
	mapped.name = pokemonId;
	//	Form is the most unique identifier; we will index on this.
	//	There seem to be two versions of all pokemon - one has no form, one has `XXX_DEFAULT`
	//	If we map the form to the pokedex number, we can create a map later off this for lookups
	mapped.form = form ? form : pokedexNumber;
	mapped.rarity = RARITY_MAP[rarity];
	mapped.animationTime = animationTime;
	mapped.encounter = encounter;

	mapped.camera = {
		default: camera,
		combat: combatDefaultCameraAngle,
		focus: combatPlayerFocusCameraAngle,
		shoulder: combatShoulderCameraAngle,
		player: combatPlayerPokemonPositionOffset,
		opponent: combatOpponentFocusCameraAngle
	};

	mapped.mega = tempEvoOverrides;

	mapped.meta = {
		canTransfer: isTransferable,
		canDefendGyms: isDeployable,
		canTransferToPokemonHome: disableTransferToPokemonHome,
		canMegaEvolve: tempEvoOverrides ? true : false,
		canBeShadow: raw.hasOwnProperty('shadow')
	};

	mapped.shadow = {
		purifyCostCandy: purificationCandyNeeded,
		purifyCostStardust: purificationStardustNeeded
	};

	mapped.size = {
		size: buddySize,
		height: pokedexHeightM,
		weight: pokedexWeightKg,
		weightDeviation: weightStdDev,
		heightDeviation: heightStdDev
	};

	mapped.model = {
		height: modelHeight,
		scale: modelScale,
		scalev2: modelScaleV2
	};

	mapped.buddySettings = {
		group: buddyGroupNumber,
		scale: buddyScale,
		walk: {
			distance: kmBuddyDistance,
			reward: buddyWalkedMegaEnergyAward
		},
		portraitOffset: buddyPortraitOffset,
		offset: {
			male: buddyOffsetMale,
			female: buddyOffsetFemale
		}
	};

	mapped.types = {
		primary: TYPE_STRING_MAP[type],
		secondary: type2 ? TYPE_STRING_MAP[type2] : null
	};

	mapped.stats = {
		attack: baseAttack,
		defense: baseDefense,
		stamina: baseStamina
	};

	mapped.evolutions = {
		candyCost: candyToEvolve,
		pips: evolutionPips,
		family: familyId,
		branch: evolutionBranch,
		previous: parentPokemonId,
		next: evolutionIds
	};

	mapped.raid = {
		distanceOffset: raidBossDistanceOffset || null
	};

	const defaultQuickMoves = quickMoves.map((move) => {
		return mapMove(move, 'DEFAULT');
	});
	const eliteQuickMoves = eliteQuickMove
		? eliteQuickMove.map((move) => {
				return mapMove(move, 'ELITE');
		  })
		: [];

	const eliteChargeMoves = eliteCinematicMove
		? eliteCinematicMove.map((move) => {
				return mapMove(move, 'ELITE');
		  })
		: [];

	const defaultChargeMoves = cinematicMoves.map((move) => {
		return mapMove(move, 'DEFAULT');
	});

	const mappedPurifiedMoves = purifiedChargeMove
		? [purifiedChargeMove].map((move) => {
				return mapMove(move, 'PURIFIED');
		  })
		: [];
	const mappedShadowMoves = shadowChargeMove
		? [shadowChargeMove].map((move) => {
				return mapMove(move, 'SHADOW');
		  })
		: [];

	mapped.moves = {
		fast: [...eliteQuickMoves, ...defaultQuickMoves],
		charged: [...mappedPurifiedMoves, ...mappedShadowMoves, ...eliteChargeMoves, ...defaultChargeMoves],
		secondChargeCost: thirdMove
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

function pokemonSettings(key, dataArray) {
	const mappedItems = dataArray.map((item) => {
		return pokemonSetting(key, item);
	});

	const keyedItems = mappedItems.reduce((keyed, mapped) => {
		const { name, form } = mapped;
		// grouped[name] = grouped.hasOwnProperty(name) ? grouped[name] : {};
		// grouped[name] = { ...grouped[name], ...{ [form]: mapped } };
		keyed[form] = mapped;

		return keyed;
	}, {});

	return keyedItems;
}

module.exports = pokemonSettings;

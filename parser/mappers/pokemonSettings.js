const { arrayExclude } = require('../../utils');
const pokedexPattern = /V(\d+)_/;

const FORM_NAME_MAP = {
	MEWTWO_A: 'MEWTWO_ARMORED',
	CHARIZARD_COPY_2019: 'CHARIZARD_CLONE',
	BLASTOISE_COPY_2019: 'BLASTOISE_CLONE',
	VENUSAUR_COPY_2019: 'VENUSAUR_CLONE',
	PIKACHU_COPY_2019: 'PIKACHU_CLONE',
	PIKACHU_FALL_2019: 'PIKACHU_HALLOWEEN',
	PIKACHU_ADVENTURE_HAT_2020: 'PIKACHU_ADVENTURE',
	PIKACHU_COSTUME_2020: 'PIKACHU_PINBALL',
	PIKACHU_VS_2019: 'PIKACHU_LIBRE',
	PIKACHU_WINTER_2020: 'PIKACHU_WINTER',
	BULBASAUR_FALL_2019: 'BULBASAUR_HALLOWEEN',
	CHARMANDER_FALL_2019: 'CHARMANDER_HALLOWEEN'
};

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

function getnumber(templateId) {
	const match = templateId.match(pokedexPattern);

	return parseInt(match[1], 10);
}

function getFormName(pokemonId, form) {
	//	If there is no form, it is 'DEFAULT'
	let formName = form ? form : 'DEFAULT';
	//	Map directly by form map
	formName = FORM_NAME_MAP[formName] ? FORM_NAME_MAP[formName] : formName;
	//	Remove the pokemon name from the form name
	formName = formName.replace(`${pokemonId}_`, '');

	return formName;
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

	mapped.number = getnumber(templateId);
	mapped.form = getFormName(pokemonId, form);

	mapped.name = pokemonId;
	//	Form is the most unique identifier; we will index on this.
	//	There seem to be two versions of all pokemon - one has no form, one has `XXX_DEFAULT`
	//	If we map the form to the pokedex number, we can create a map later off this for lookups
	mapped.rarity = RARITY_MAP[rarity];
	mapped.animationTime = animationTime;
	mapped.encounter = encounter;

	mapped.isShadow = mapped.form.includes('SHADOW');
	mapped.isPurified = mapped.form.includes('PURIFIED');

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

	mapped.shadow = mapped.isShadow
		? {
				purifyCostCandy: purificationCandyNeeded,
				purifyCostStardust: purificationStardustNeeded
		  }
		: null;

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

	const mappedPurifiedMoves =
		mapped.isPurified && purifiedChargeMove
			? [purifiedChargeMove].map((move) => {
					return mapMove(move, 'PURIFIED');
			  })
			: [];
	const mappedShadowMoves =
		mapped.isShadow && shadowChargeMove
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
	const mappedEntries = dataArray.map((item) => {
		return pokemonSetting(key, item);
	});

	const groupedEntries = mappedEntries.reduce((grouped, mapped) => {
		const { form, name, number } = mapped;

		grouped[number] = grouped.hasOwnProperty(number) ? grouped[number] : {};
		grouped[number] = { ...grouped[number], ...{ [form]: mapped } };

		return grouped;
	}, {});

	return groupedEntries;
}

module.exports = pokemonSettings;

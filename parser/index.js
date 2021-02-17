const fs = require('fs').promises;
const path = require('path');
const rawGameMaster = require('../latest/latest.json');
const { arrayUnique } = require('../utils');
const mappers = require('./mappers');

async function writeContents(contents) {
	const filePath = path.resolve('./output/parsedGameMaster.json');

	try {
		await fs.writeFile(filePath, JSON.stringify(contents, null, 4));
	} catch (err) {
		//	Don't terminate if the page fails to write
		console.error(`Failed to write`, err);
		if (debug) console.info(contents);
		throw err;
	}
	return contents;
}

function getAllDataKeys(rawGameMaster) {
	return rawGameMaster.reduce((allKeys, currentItem) => {
		const { data } = currentItem;
		delete data.templateId;
		allKeys = allKeys.concat(Object.keys(data));
		return allKeys;
	}, []);
}
function sortByDataType(rawGameMaster, allKeys) {
	//	Each key needs to be an object to contain references
	const keysObject = allKeys.reduce((builtObject, key) => {
		builtObject[key] = [];
		return builtObject;
	}, {});
	const sortedGameMaster = rawGameMaster.reduce((sortedDataObjects, currentItem) => {
		const { data } = currentItem;
		const dataKeys = Object.keys(data).filter((dataKey) => {
			return allKeys.includes(dataKey);
		});

		if (dataKeys.length > 1) {
			const message = `Template ${currentItem.templateId} contains more than one data key!`;
			throw new Error(message);
		}

		//  Get the unique identifier for this data template
		const key = dataKeys[0];

		sortedDataObjects[key].push(currentItem);
		return sortedDataObjects;
	}, keysObject);

	return sortedGameMaster;
}

function mapGameMasterData(sortedGameMaster) {
	const mappedGameMaster = Object.entries(sortedGameMaster).reduce((mapped, [key, dataArray]) => {
		if (dataArray.length == 1) {
			//	One-object keys can just be flat appended
			const dataObject = dataArray[0]['data'][key];
			mapped[key] = dataObject;
		} else {
			//	If there's a mapper for this data type, apply it
			if (mappers[key]) {
				mapped[key] = mappers[key](key, dataArray);
			} else {
				mapped[key] = dataArray.reduce((sorted, item) => {
					const { templateId, data } = item;
					sorted[templateId] = data[key];
					return sorted;
				}, {});
			}
		}
		return mapped;
	}, {});

	return mappedGameMaster;
}

async function parseGameMaster() {
	const allKeys = getAllDataKeys(rawGameMaster);

	const uniqueKeys = arrayUnique(allKeys);

	const sortedGameMaster = sortByDataType(rawGameMaster, uniqueKeys);

	const mappedData = mapGameMasterData(sortedGameMaster);

	await writeContents(mappedData);

	return mappedData;
}

const gameMaster = parseGameMaster(rawGameMaster);

module.exports = gameMaster;

module.exports = function arrayExclude(arrayOne, arrayTwo) {
	const remainder = arrayOne.filter((item) => {
		return arrayTwo.includes(item) === false;
	});
	return remainder;
};

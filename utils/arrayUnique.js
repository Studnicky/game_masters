module.exports = function unique(list) {
	return list.filter((element, index, list) => {
		return list.indexOf(element) === index;
	});
};

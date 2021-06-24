export const convertDate = (date, display) => {
	const minutes = date.getMinutes();
	const hours = date.getHours();
	const month = date.getMonth() + 1; // NOTE: January is 0
	const day = date.getDate();
	return `${date.getFullYear()}-${month < 10 ? '0' + month : month}-${
		day < 10 ? '0' + day : day
	}${display ? ' ' : 'T'}${hours < 10 ? '0' + hours : hours}:${
		minutes < 10 ? '0' + minutes : minutes
	}`;
};

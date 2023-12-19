export interface dataCollected {
	date: number;
	freq: number[] | undefined;
	amplitude: number[] | undefined;
	eval: number;
	SNR: number;
}

export const defaultData: dataCollected = {
	date: Date.now(),
	freq: [0, 0, 0, 0, 0],
	amplitude: [0, 0, 0, 0, 0],
	eval: 0,
	SNR: Number(Infinity),
};

export function getRandomData() {
	const errorCurrentData: dataCollected = {
		date: Date.now(),
		freq: [
			Math.random() * 800,
			Math.random() * 800,
			Math.random() * 800,
			Math.random() * 800,
			Math.random() * 800,
		],
		amplitude: [
			Math.random() * 0.2 + 0.8,
			Math.random() * 0.2 + 0.6,
			Math.random() * 0.2 + 0.4,
			Math.random() * 0.2 + 0.2,
			Math.random() * 0.2 + 0.0,
		],
		eval: (Math.random() - 0.5) / 2 + 0.4,
		SNR: Math.random(),
	};
	return errorCurrentData;
}

const getDefaultHistory = () => {
	const result: dataCollected[] = [];
	for (let i = 0; i < 10; i++) {
		result.push(getRandomData());
	}
	return result;
};

interface historyData {
	deviceName: string;
	deviceData: dataCollected[];
}

export let historyDataPerDevice: historyData[] = [
	{deviceName: 'Example A', deviceData: []},
	{deviceName: 'Example B', deviceData: []},
];

historyDataPerDevice[0].deviceData = getDefaultHistory();
historyDataPerDevice[1].deviceData = getDefaultHistory();

export function setNewData(currentDeviceName: string, newData: dataCollected) {
	const index: number = historyDataPerDevice.findIndex(item => {
		item.deviceName === currentDeviceName;
	});
	if (index !== -1) {
		historyDataPerDevice[index].deviceData.push(newData);
	} else {
		historyDataPerDevice.push({
			deviceName: currentDeviceName,
			deviceData: [newData],
		});
	}
	return;
}

export function clearData() {
	while (historyDataPerDevice.length > 2) {
		historyDataPerDevice.pop();
	}
	return;
}

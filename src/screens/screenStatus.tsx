import React, {useState, useEffect} from 'react';
import {
	Button,
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {RootStackParamList} from './routes';
import {TableFreqs} from '../utils/tableFreqs';
import Modal from '../utils/Modal.jsx';

import {BLEService} from '../BLEService';

import base64 from 'react-native-base64';

import {fullUUID} from 'react-native-ble-plx';
//import {ScrollView} from 'react-native-gesture-handler';

const dangerLevelColors = [
	'#00FF00', // Green
	'#33FF00',
	'#66FF00',
	'#99FF00',
	'#CCFF00',
	'#FFFF00',
	'#FFCC00',
	'#FF9900',
	'#FF6600',
	'#FF3300', // Red
];

const S_STATUS_UUID = fullUUID('2a38798e-8a3e-11ee-b9d1-0242ac120002');
const C_STATUS_EVAL_UUID = fullUUID('2a387d08-8a3e-11ee-b9d1-0242ac120002');
const C_STATUS_SNR_UUID = fullUUID('ab8caa74-9983-11ee-b9d1-0242ac120002');

const S_BIN_UUID = fullUUID('2a387bdc-8a3e-11ee-b9d1-0242ac120002');
const C_BIN_FREQ_UUID = fullUUID('8f904730-8a3e-11ee-b9d1-0242ac120002');
const C_BIN_AMP_UUID = fullUUID('817bf5ba-8eec-11ee-b9d1-0242ac120002');

export function screenStatus({
	navigation,
}: NativeStackScreenProps<RootStackParamList>) {
	useEffect(() => {
		navigation.setOptions({
			headerLeft: () => (
				<Button
					onPress={() => navigation.navigate('Devices')}
					title="Device"
					color="#444444"
				/>
			),
			headerRight: () => (
				<View
					style={{
						flexDirection: 'row',
					}}>
					<Button
						onPress={() => navigation.navigate('Status')}
						title="Status"
						color="#2196F3"
					/>
					<Button
						onPress={() => navigation.navigate('History')}
						title="History"
						color="#444444"
					/>
				</View>
			),
		});
		{
			const unsubscribe = navigation.addListener('focus', () => {
				if (enableUpdate) {
					screenStatusReadData();
				}
			});

			// Return the function to unsubscribe from the event so it gets removed on unmount
			return unsubscribe;
		}
	}, [navigation]);

	interface dataCollected {
		date: number;
		freq: number[] | undefined;
		amplitude: number[] | undefined;
		eval: number;
		SNR: number;
	}

	const defaultData: dataCollected = {
		date: Date.now(),
		freq: [0, 0, 0, 0, 0],
		amplitude: [0, 0, 0, 0, 0],
		eval: 0,
		SNR: Number(Infinity),
	};

	const [currentData, setCurrentData] = useState(defaultData);

	const [enableUpdate, setEnableUpdate] = useState(false);

	useEffect(() => {
		if (enableUpdate) {
			let timer = setTimeout(() => {
				screenStatusReadData();
			}, 5000);
			return () => clearTimeout(timer);
		}
	}, [currentData, enableUpdate]);

	const [enablePopUp, setEnablePopUp] = useState(false);

	function screenStatusReadData() {
		let newDataBLE: dataCollected;

		const readStatus = () => {
			let readBLE = BLEService.readCharacteristicForDevice(
				S_STATUS_UUID,
				C_STATUS_EVAL_UUID,
			);
			readBLE.then(characteristic => {
				const data = base64.decode(characteristic.value || '');
				newDataBLE.eval = parseInt(data);
			});
			readBLE.catch(function (err) {
				return err;
			});
		};

		const readSNR = () => {
			let readBLE = BLEService.readCharacteristicForDevice(
				S_STATUS_UUID,
				C_STATUS_SNR_UUID,
			);
			readBLE.then(characteristic => {
				const data = base64.decode(characteristic.value || '');
				newDataBLE.SNR = parseInt(data);
			});
			readBLE.catch(function (err) {
				return err;
			});
		};

		const readFreq = () => {
			let readBLE = BLEService.readCharacteristicForDevice(
				S_BIN_UUID,
				C_BIN_FREQ_UUID,
			);
			readBLE.then(characteristic => {
				const data = base64.decode(characteristic.value || '');
				newDataBLE.freq = data.match(/.{1,3}/g)?.map(x => {
					return parseFloat(x);
				});
			});
			readBLE.catch(function (err) {
				return err;
			});
		};

		const readAmp = () => {
			let readBLE = BLEService.readCharacteristicForDevice(
				S_BIN_UUID,
				C_BIN_AMP_UUID,
			);
			readBLE.then(characteristic => {
				const data = base64.decode(characteristic.value || '');
				newDataBLE.amplitude = data.match(/.{1,3}/g)?.map(x => {
					return parseFloat(x);
				});
			});
			readBLE.catch(function (err) {
				return err;
			});
		};

		Promise.all([readStatus(), readSNR(), readFreq(), readAmp()])
			.then(() => {
				newDataBLE.date = Date.now();
				if (newDataBLE.eval > 0.5) {
					setEnablePopUp(true);
				}
				setCurrentData(newDataBLE);
			})
			.catch(function (err) {
				console.log(err);
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
				if (errorCurrentData.eval > 0.5) {
					setEnablePopUp(true);
				}
				setCurrentData(errorCurrentData);
			});
	}

	//example writing charac
	//function WifiScreen_write_ssid_password() {
	//	BLEService.writeCharacteristicWithResponseForDevice(
	//		S_WIFI_UUID,
	//		C_WIFI_R_W_SSID_UUID,
	//		base64.encode(ssid),
	//	).then(() => {
	//		BLEService.writeCharacteristicWithResponseForDevice(
	//			S_WIFI_UUID,
	//			C_WIFI_W_password_UUID,
	//			base64.encode(password),
	//		);
	//	});
	//}

	return (
		<>
			<ScrollView style={styles.container}>
				<View style={styles.enableButton}>
					<Button
						onPress={() => {
							if (enableUpdate) {
								setEnableUpdate(false);
							} else {
								setEnableUpdate(true);
							}
						}}
						title={
							enableUpdate ? 'Disable updates' : 'Enable updates'
						}></Button>
				</View>
				<View style={styles.block}>
					<View style={styles.item}>
						<Text style={styles.label}>Device name</Text>
						<Text style={styles.data}>pegar ainda</Text>
					</View>
					<View style={styles.item}>
						<Text style={styles.label}>Last updated</Text>
						<Text style={styles.data}>
							{String(new Date(currentData.date))}
						</Text>
					</View>
					<View style={styles.item}>
						<Text style={styles.label}>Condition</Text>
						<View
							style={{
								backgroundColor:
									dangerLevelColors[Math.floor(10 * currentData.eval)],
								borderBottomLeftRadius: 5 - 4,
								borderBottomRightRadius: 5 - 4,
							}}>
							<Text style={styles.data}>
								{String(currentData.eval.toFixed(2)) +
									' (' +
									(currentData.eval < 0.5 ? 'Ok)' : 'Fault detected)')}
							</Text>
						</View>
					</View>
					<View style={styles.item}>
						<Text style={styles.label}>SNR (dB)</Text>
						<Text style={styles.data}>
							{(20 * Math.log10(currentData.SNR)).toFixed(2)}
						</Text>
					</View>
					<View style={styles.item}>
						<Text style={styles.label}>Relevant components</Text>
						<TableFreqs data={currentData} />
					</View>
					<View style={{padding: 10}}></View>
				</View>
			</ScrollView>
			<Modal show={enablePopUp} close={() => setEnablePopUp(false)} />
		</>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 10,
		marginVertical: 0,
		marginHorizontal: 10,
	},
	enableButton: {
		marginVertical: 20,
		marginHorizontal: 20,
	},
	block: {
		marginVertical: 0,
		marginHorizontal: 0,
		gap: 15,
	},
	item: {
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
		marginHorizontal: 20,
		borderWidth: 4,
		flexDirection: 'column',
		gap: 0,
		borderColor: '#2196F3',
	},
	label: {
		borderTopLeftRadius: 5 - 4,
		borderTopRightRadius: 5 - 4,
		color: 'white',
		fontSize: 18,
		backgroundColor: '#2196F3',
		padding: 5,
	},
	data: {
		padding: 0,
		marginVertical: 10,
		marginHorizontal: 0,
		justifyContent: 'space-between',
		color: 'black',
		fontSize: 18,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
	},
});

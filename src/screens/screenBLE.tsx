import React, {useState} from 'react';

import {
	Button,
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Device} from 'react-native-ble-plx';

import {BLEService} from '../BLEService';

import {RootStackParamList} from './routes';

import {cloneDeep} from '../utils/deepCopy';

export function screenBLE({
	navigation,
}: NativeStackScreenProps<RootStackParamList>) {
	React.useEffect(() => {
		navigation.setOptions({
			headerLeft: () => (
				<Button
					onPress={() => navigation.navigate('Devices')}
					title="Device"
					color="#2196F3"
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
						color="#444444"
					/>
					<Button
						onPress={() => navigation.navigate('History')}
						title="History"
						color="#444444"
					/>
				</View>
			),
		});
	}, [navigation]);

	const [isIdle, setIsIdle] = useState(true);
	const [foundDevices, setFoundDevices] = useState<Device[]>([]);

	const addFoundDevice = (device: Device) =>
		setFoundDevices(prevState => {
			if (!isFoundDeviceUpdateNecessary(prevState, device)) {
				return prevState;
			}
			// deep clone
			const nextState = cloneDeep(prevState);
			return nextState.concat(device);
		});

	const isFoundDeviceUpdateNecessary = (
		currentDevices: Device[],
		updatedDevice: Device,
	) => {
		const currentDevice = currentDevices.find(
			({id}) => updatedDevice.id === id,
		);
		if (!currentDevice) {
			return true;
		}
		return false;
	};

	const onConnectSuccess = () => {
		setIsIdle(true);
		BLEService.discoverAllServicesAndCharacteristicsForDevice();
	};

	const onConnectFail = () => {
		setIsIdle(true);
	};

	const deviceRender = ({item}: {item: Device}) => {
		const chosenDevice =
			BLEService.device === null ? '-1' : BLEService.device.id;

		const backgroundColor = item.id === chosenDevice ? '#222222' : '#dddddd';
		const color = item.id === chosenDevice ? 'white' : 'black';
		if (item.name != null) {
			return (
				<TouchableOpacity
					onPress={() => {
						BLEService.connectToDevice(item.id)
							.then(onConnectSuccess)
							.catch(onConnectFail);
					}}
					style={[styles.item, {backgroundColor}]}>
					<View
						style={{
							flex: 1,
							flexDirection: 'row',
							backgroundColor: backgroundColor,
						}}>
						<Text style={[styles.title, {textAlign: 'left'}, {color: color}]}>
							{item.name}
						</Text>
						<View
							style={{
								flex: 1,
								alignItems: 'center',
								justifyContent: 'center',
								alignSelf: 'stretch',
								margin: 5,
							}}
						/>
						<Text style={[styles.title, {textAlign: 'right'}, {color: color}]}>
							{item.rssi}
						</Text>
					</View>
				</TouchableOpacity>
			);
		} else {
			return null;
		}
	};

	return (
		<View style={{flex: 1, padding: 0, marginVertical: 0, marginHorizontal: 0}}>
			<View
				style={{
					flex: 1,
					padding: 8,
					marginVertical: 26,
					marginHorizontal: 10,
				}}>
				<Button
					onPress={() => {
						setFoundDevices([]);
						setIsIdle(false);
						BLEService.initializeBLE().then(() =>
							BLEService.scanDevices(addFoundDevice, null, true),
						);
					}}
					title={isIdle ? 'Scan' : 'Scanning'}
					disabled={!isIdle}
				/>
			</View>
			<FlatList
				data={foundDevices}
				renderItem={deviceRender}
				keyExtractor={item => item.id}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	item: {
		padding: 20,
		marginVertical: 8,
		marginHorizontal: 16,
	},
	title: {
		fontSize: 15,
	},
});

import {useState, useEffect} from 'react';

import {
	Button,
	View,
	Text,
	FlatList,
	TextInput,
	ScrollView,
	StyleSheet,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Picker} from '@react-native-picker/picker';

import {RootStackParamList} from './screenNavigator';

import {
	clearData,
	dataCollected,
	historyDataPerDevice,
} from '../utils/DataCollected';

export function ScreenHistory({
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
						color="#444444"
					/>
					<Button
						onPress={() => navigation.navigate('History')}
						title="History"
						color="#2196F3"
					/>
				</View>
			),
		});
		{
			const unsubscribe = navigation.addListener('focus', () => {});
			// Return the function to unsubscribe from the event so it gets removed on unmount
			return unsubscribe;
		}
	}, [navigation]);

	const [selectedDevice, setSelectedDevice] = useState('Example A');
	const [selectedDeviceIndex, setSelectedDeviceIndex] = useState(0);
	const [selectedData, setSelectedData] = useState<dataCollected[]>(
		historyDataPerDevice[0].deviceData.reverse(),
	);

	function deviceRender({item}: {item: dataCollected}) {
		return (
			<>
				<Text style={{color: 'black'}}>{String(new Date(item.date))}</Text>
				<View style={styles.tableRow}>
					<Text style={{color: 'black'}}>
						{'Eval: ' + String(item.eval.toFixed(2))}
					</Text>
					<Text style={{color: 'black'}}>
						{'SNR: ' + String(item.SNR.toFixed(2))}
					</Text>
				</View>
			</>
		);
	}

	return (
		<ScrollView style={styles.container}>
			<View style={styles.item}>
				<Picker
					selectedValue={selectedDevice}
					onValueChange={(itemValue, itemIndex) => {
						setSelectedDevice(itemValue);
						setSelectedDeviceIndex(() =>
							historyDataPerDevice.findIndex(item => {
								return item.deviceName === selectedDevice;
							}),
						);
						setSelectedData(
							historyDataPerDevice[selectedDeviceIndex].deviceData,
						);
					}}
					style={styles.label}
					dropdownIconColor="white">
					{historyDataPerDevice.map((item, index) => (
						<Picker.Item label={item.deviceName} value={item.deviceName} />
					))}
				</Picker>
			</View>
			<View style={styles.item}>
				<FlatList
					data={selectedData}
					renderItem={deviceRender}
					keyExtractor={item => String(item.date + item.eval + item.SNR)}
				/>
			</View>
			<View style={styles.enableButton}>
				<Button
					onPress={() => {
						clearData();
						setSelectedDevice('Example A');
						setSelectedDeviceIndex(0);
						setSelectedData(historyDataPerDevice[0].deviceData.reverse());
					}}
					title={'Delete History'}></Button>
			</View>
			<View style={{height: 30}}></View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		padding: 10,
		marginVertical: 10,
		marginHorizontal: 10,
	},
	enableButton: {
		marginVertical: 20,
		marginHorizontal: 20,
	},
	item: {
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
		marginHorizontal: 20,
		marginVertical: 20,
		borderWidth: 4,
		flexDirection: 'column',
		borderColor: '#2196F3',
	},
	label: {
		borderTopLeftRadius: 5 - 4,
		borderTopRightRadius: 5 - 4,
		color: 'white',
		fontSize: 14,
		backgroundColor: '#2196F3',
		padding: 5,
	},
	tableRow: {
		justifyContent: 'space-between',
		flexDirection: 'row',
		borderBottomWidth: 2,
		borderBottomColor: '#ccc',
		padding: 10,
	},
});

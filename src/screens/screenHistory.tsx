import React, {useState} from 'react';

import {
	Button,
	View,
	Text,
	FlatList,
	TextInput,
	ScrollView,
} from 'react-native';

import {fullUUID} from 'react-native-ble-plx';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Picker} from '@react-native-picker/picker';

import base64 from 'react-native-base64';

import {RootStackParamList} from './routes';

import {BLEService} from '../BLEService';

interface standardProfileInfo {
	outside: string;
	volume: string;
	regularPeriod: string;
	cooldownPeriod: string;
}

var standardProfiles: Record<string, standardProfileInfo> = {
	default: {
		outside: '1',
		volume: '200',
		regularPeriod: '0',
		cooldownPeriod: '1',
	},
	a: {
		outside: '1',
		volume: '321',
		regularPeriod: '963',
		cooldownPeriod: '741',
	},
	b: {
		outside: '0',
		volume: '842',
		regularPeriod: '426',
		cooldownPeriod: '839',
	},
};

const S_PROFILE_UUID = fullUUID('4e0b4756-8a3e-11ee-b9d1-0242ac120002');

/*
   set a profile in a certain index. Serialization used:
      "int index,bool isOutside,int volume,int regularPeriod,int cooldownPeriod"
  */
const C_PROFILE_W_UUID = fullUUID('4e0b4a62-8a3e-11ee-b9d1-0242ac120002');

const S_CONTROL_UUID = [
	fullUUID('8f904730-8a3e-11ee-b9d1-0242ac120002'),
	fullUUID('d6b23984-8a3e-11ee-b9d1-0242ac120002'),
	fullUUID('d6b23ee8-8a3e-11ee-b9d1-0242ac120002'),
	fullUUID('d6b24050-8a3e-11ee-b9d1-0242ac120002'),
];

// characteristic to read and write whether a controller is enable or not.
const C_CONTROL_R_W_STATUS_UUID = [
	fullUUID('8f904b86-8a3e-11ee-b9d1-0242ac120002'),
	fullUUID('c6a16c68-8a3e-11ee-b9d1-0242ac120002'),
	fullUUID('c6a1700a-8a3e-11ee-b9d1-0242ac120002'),
	fullUUID('c6a1719a-8a3e-11ee-b9d1-0242ac120002'),
];

// characteristic to read the current profile of a controller.
const C_CONTROL_R_PROFILE_UUID = [
	fullUUID('817bf150-8eec-11ee-b9d1-0242ac120002'),
	fullUUID('817bf39e-8eec-11ee-b9d1-0242ac120002'),
	fullUUID('817bf4b6-8eec-11ee-b9d1-0242ac120002'),
	fullUUID('817bf5ba-8eec-11ee-b9d1-0242ac120002'),
];

export function screenHistory({
	navigation,
}: NativeStackScreenProps<RootStackParamList>) {
	React.useEffect(() => {
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
			const unsubscribe = navigation.addListener('focus', () => {
				profile_handler('1');
			});

			// Return the function to unsubscribe from the event so it gets removed on unmount
			return unsubscribe;
		}
	}, [navigation]);

	const [selectedProfile, setSelectedProfile] = useState('1');
	const [selectedStandard, setSelectedStandard] = useState('current');
	const [volume, setVolume] = useState('200');
	const [regularPeriod, setRegularPeriod] = useState('0');
	const [cooldownPeriod, setCooldownPeriod] = useState('1');
	const [isOutside, setIsOutside] = useState('1');
	const [enabled, setEnabled] = useState('0');

	function ProfileScreen_read_current_profile(selected_profile: string) {
		BLEService.readCharacteristicForDevice(
			S_CONTROL_UUID[parseInt(selected_profile) - 1],
			C_CONTROL_R_PROFILE_UUID[parseInt(selected_profile) - 1],
		).then(characteristic => {
			let value64 = characteristic.value || '';
			if (value64 !== '') {
				const profile_info = base64.decode(value64);
				const profile_info_array = profile_info.split(',');
				setIsOutside(profile_info_array[0]);
				setVolume(profile_info_array[1]);
				setRegularPeriod(profile_info_array[2]);
				setCooldownPeriod(profile_info_array[3]);
				ProfileScreen_read_enabled(selected_profile);
			}
		});
	}

	function ProfileScreen_write_profile() {
		const profileIndex = (parseInt(selectedProfile) - 1).toString(10);
		const payload_str = `${profileIndex}${isOutside}${'0'.repeat(
			3 - volume.length,
		)}${volume}${'0'.repeat(
			3 - regularPeriod.length,
		)}${regularPeriod}${'0'.repeat(
			3 - cooldownPeriod.length,
		)}${cooldownPeriod}`;
		const payload_64 = base64.encode(payload_str);
		BLEService.writeCharacteristicWithResponseForDevice(
			S_PROFILE_UUID,
			C_PROFILE_W_UUID,
			payload_64,
		).then(() => {
			ProfileScreen_read_enabled(selectedProfile);
		});
	}

	function ProfileScreen_read_enabled(selected_profile: string) {
		const readCharacteristic = BLEService.readCharacteristicForDevice(
			S_CONTROL_UUID[parseInt(selected_profile) - 1],
			C_CONTROL_R_W_STATUS_UUID[parseInt(selected_profile) - 1],
		).then(characteristic => {
			let value64 = characteristic.value || '';
			if (value64 !== '') {
				setEnabled(base64.decode(value64));
			}
		});
	}

	function ProfileScreen_write_enabled() {
		const payload_64 = base64.encode('1');
		BLEService.writeCharacteristicWithResponseForDevice(
			S_CONTROL_UUID[parseInt(selectedProfile) - 1],
			C_CONTROL_R_W_STATUS_UUID[parseInt(selectedProfile) - 1],
			payload_64,
		);
		ProfileScreen_read_enabled(selectedProfile);
	}

	function profile_handler(selected_profile: string) {
		setSelectedProfile(selected_profile);
		setSelectedStandard('current');
		ProfileScreen_read_current_profile(selected_profile);
		ProfileScreen_read_enabled(selected_profile);
	}

	function standard_handler(selected_standard: string) {
		setSelectedStandard(selected_standard);
		if (selected_standard === 'current') {
			ProfileScreen_read_current_profile(selectedProfile);
		} else {
			let profile_info = standardProfiles[selected_standard];

			setIsOutside(profile_info.outside);
			setVolume(profile_info.volume);
			setRegularPeriod(profile_info.regularPeriod);
			setCooldownPeriod(profile_info.cooldownPeriod);
		}
	}

	return (
		<ScrollView style={{padding: 10, marginVertical: 0, marginHorizontal: 10}}>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 50,
					borderWidth: 1,
					backgroundColor: 'ffffff',
				}}>
				<Picker
					selectedValue={selectedProfile}
					onValueChange={(itemValue, itemIndex) => profile_handler(itemValue)}
					style={[{fontSize: 30}, {height: 30}, {color: '#000000'}]}
					dropdownIconColor="#000000">
					<Picker.Item label="Profile 1" value="1" />
					<Picker.Item label="Profile 2" value="2" />
					<Picker.Item label="Profile 3" value="3" />
					<Picker.Item label="Profile 4" value="4" />
				</Picker>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 10,
				}}
			/>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 50,
					borderWidth: 1,
					backgroundColor: 'ffffff',
				}}>
				<Picker
					selectedValue={selectedStandard}
					onValueChange={(itemValue, itemIndex) => standard_handler(itemValue)}
					style={[{fontSize: 30}, {height: 30}, {color: '#000000'}]}
					dropdownIconColor="#000000">
					<Picker.Item label="Current" value="current" />
					<Picker.Item label="Default" value="default" />
					<Picker.Item label="Plant A" value="a" />
					<Picker.Item label="Plant B" value="b" />
				</Picker>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 80,
				}}>
				<Text style={{fontSize: 20, color: '#000000'}}>Volume (ml)</Text>
				<TextInput
					style={{
						height: 50,
						fontSize: 20,
						borderWidth: 1,
						backgroundColor: '#ffffff',
						color: '#000000',
					}}
					placeholder="Irrigation volume"
					onChangeText={newText =>
						setVolume(newText.substring(newText.length - 3, newText.length))
					}
					value={volume}
					keyboardType="numeric"
				/>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 80,
				}}>
				<Text style={{fontSize: 20, color: '#000000'}}>Regular period (s)</Text>
				<TextInput
					style={{
						height: 50,
						fontSize: 20,
						borderWidth: 1,
						backgroundColor: '#ffffff',
						color: '#000000',
					}}
					placeholder="Regular period"
					onChangeText={newText =>
						setRegularPeriod(
							newText.substring(newText.length - 3, newText.length),
						)
					}
					value={regularPeriod}
					keyboardType="numeric"
				/>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 80,
				}}>
				<Text style={{fontSize: 20, color: '#000000'}}>
					Cooldown period (s)
				</Text>
				<TextInput
					style={{
						height: 50,
						fontSize: 20,
						borderWidth: 1,
						backgroundColor: '#ffffff',
						color: '#000000',
					}}
					placeholder="Cooldown period"
					onChangeText={newText =>
						setCooldownPeriod(
							newText.substring(newText.length - 3, newText.length),
						)
					}
					value={cooldownPeriod}
					keyboardType="numeric"
				/>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 80,
				}}>
				<Text style={{fontSize: 20, color: '#000000'}}>Location</Text>
				<View
					style={{
						padding: 0,
						marginVertical: 0,
						marginHorizontal: 0,
						height: 50,
						borderWidth: 1,
						backgroundColor: 'ffffff',
					}}>
					<Picker
						selectedValue={isOutside}
						onValueChange={(itemValue, itemIndex) => setIsOutside(itemValue)}
						style={{
							fontSize: 30,
							height: 30,
							color: '#000000',
							backgroundColor: 'ffffff',
						}}
						dropdownIconColor="#000000">
						<Picker.Item label="Outside" value="1" />
						<Picker.Item label="Inside" value="0" />
					</Picker>
				</View>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 10,
				}}
			/>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 50,
				}}>
				<Button
					onPress={() => {
						ProfileScreen_write_profile();
					}}
					title="Apply configuration"
				/>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 40,
				}}>
				<Button
					onPress={() => {
						ProfileScreen_write_enabled();
					}}
					disabled={enabled === '1'}
					title={enabled === '0' ? 'Enable profile' : 'Profile enabled'}
				/>
			</View>
		</ScrollView>
	);
}

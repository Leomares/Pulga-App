import React, {useState} from 'react';
import {
	Button,
	View,
	Text,
	FlatList,
	StyleSheet,
	TouchableOpacity,
	TextInput,
} from 'react-native';

import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {RootStackParamList} from './routes';

import {BLEService} from '../BLEService';

import base64 from 'react-native-base64';

import {fullUUID} from 'react-native-ble-plx';

const S_WIFI_UUID = fullUUID('2a38798e-8a3e-11ee-b9d1-0242ac120002');
// Read whether the microcontroller is connected to a WiFi network.
const C_WIFI_R_STATUS_UUID = fullUUID('2a387d08-8a3e-11ee-b9d1-0242ac120002');
// Set SSID and password to the microcontroller.
const C_WIFI_R_W_SSID_UUID = fullUUID('ab8caa74-9983-11ee-b9d1-0242ac120002');
const C_WIFI_W_password_UUID = fullUUID('2a387bdc-8a3e-11ee-b9d1-0242ac120002');

export function screenStatus({
	navigation,
}: NativeStackScreenProps<RootStackParamList>) {
	React.useEffect(() => {
		navigation.setOptions({
			headerLeft: () => (
				<Button
					onPress={() => navigation.navigate('BLE_device')}
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
				WifiScreen_read_ssid();
				WifiScreen_read_status();
			});

			// Return the function to unsubscribe from the event so it gets removed on unmount
			return unsubscribe;
		}
	}, [navigation]);

	const [ssid, setSsid] = useState('');
	const [password, setPassword] = useState('');
	const [connected, setConnected] = useState('0');

	function WifiScreen_read_ssid() {
		BLEService.readCharacteristicForDevice(
			S_WIFI_UUID,
			C_WIFI_R_W_SSID_UUID,
		).then(characteristic => {
			const wifi_ssid = base64.decode(characteristic.value || '');
			setSsid(wifi_ssid);
		});
	}

	function WifiScreen_read_status() {
		BLEService.readCharacteristicForDevice(
			S_WIFI_UUID,
			C_WIFI_R_STATUS_UUID,
		).then(characteristic => {
			if (characteristic.value !== null) {
				const wifi_status = base64.decode(characteristic.value);
				setConnected(wifi_status);
			}
		});
	}

	function WifiScreen_write_ssid_password() {
		BLEService.writeCharacteristicWithResponseForDevice(
			S_WIFI_UUID,
			C_WIFI_R_W_SSID_UUID,
			base64.encode(ssid),
		).then(() => {
			BLEService.writeCharacteristicWithResponseForDevice(
				S_WIFI_UUID,
				C_WIFI_W_password_UUID,
				base64.encode(password),
			);
		});
	}

	return (
		<View style={{padding: 10, marginVertical: 0, marginHorizontal: 10}}>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 80,
				}}>
				<Text style={{fontSize: 20, color: '#000000'}}>Wi-Fi name</Text>
				<TextInput
					style={{
						height: 50,
						fontSize: 20,
						borderWidth: 1,
						color: '#000000',
						backgroundColor: '#ffffff',
					}}
					onChangeText={newText => setSsid(newText)}
					value={ssid}
				/>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 80,
				}}>
				<Text style={{fontSize: 20, color: '#000000'}}>Wi-Fi password</Text>
				<TextInput
					style={{
						height: 50,
						fontSize: 20,
						borderWidth: 1,
						color: '#000000',
						backgroundColor: '#ffffff',
					}}
					onChangeText={newText => setPassword(newText)}
					value={password}
				/>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 40,
				}}>
				<Text style={{fontSize: 20, color: '#000000'}}>
					Status: {connected === '1' ? 'Connected' : 'Disconnected'}
				</Text>
			</View>
			<View
				style={{
					padding: 0,
					marginVertical: 0,
					marginHorizontal: 0,
					height: 50,
				}}>
				<Button
					onPress={() => {
						WifiScreen_write_ssid_password();
					}}
					title="Apply configuration"
				/>
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
						WifiScreen_read_status();
					}}
					title="Check connection"
				/>
			</View>
		</View>
	);
}

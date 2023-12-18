import React, {useState} from 'react';
import {
	Button,
	View,
	Text,
	FlatList,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	ScrollView,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Picker} from '@react-native-picker/picker';
import base64 from 'react-native-base64';

import {BLEService} from './BLEService';
import {fullUUID, Device} from 'react-native-ble-plx';

import {screenBLE} from './screens/screenBLE';
import {screenStatus} from './screens/screenStatus';
import {screenHistory} from './screens/screenHistory';

type RootStackParamList = {
	BLE_device: undefined;
	Status: undefined;
	History: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="BLE_device">
				<Stack.Screen name="BLE_device" component={screenBLE} />
				<Stack.Screen name="Status" component={screenStatus} />
				<Stack.Screen name="History" component={screenHistory} />
			</Stack.Navigator>
		</NavigationContainer>
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

export default App;

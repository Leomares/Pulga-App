import React, {FC, createContext, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {ScreenBLE} from './screenBLE';
import {ScreenStatus} from './screenStatus';
import {ScreenHistory} from './screenHistory';

export type DeviceContextType = {
	deviceName: string;
	setDeviceName: (deviceName: string) => void;
};

const defaultContextValue: DeviceContextType = {
	deviceName: '',
	setDeviceName: () => {},
};

export const DeviceContext =
	createContext<DeviceContextType>(defaultContextValue);

export type RootStackParamList = {
	Devices: undefined;
	Status: undefined;
	History: undefined;
};

export const Stack = createNativeStackNavigator<RootStackParamList>();

export const ScreenNavigator: FC = () => {
	const [deviceConnected, setDeviceConnected] = useState('Default pulga');

	return (
		<>
			<DeviceContext.Provider
				value={{
					deviceName: deviceConnected,
					setDeviceName: setDeviceConnected,
				}}>
				<NavigationContainer>
					<Stack.Navigator initialRouteName="Devices">
						<Stack.Screen name="Devices" component={ScreenBLE} />
						<Stack.Screen name="Status" component={ScreenStatus} />
						<Stack.Screen name="History" component={ScreenHistory} />
					</Stack.Navigator>
				</NavigationContainer>
			</DeviceContext.Provider>
		</>
	);
};

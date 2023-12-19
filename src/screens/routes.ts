import {createNativeStackNavigator} from '@react-navigation/native-stack';

export type RootStackParamList = {
	Devices: undefined;
	Status: undefined;
	History: undefined;
};

export const Stack = createNativeStackNavigator<RootStackParamList>();

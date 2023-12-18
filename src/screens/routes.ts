import { createNativeStackNavigator } from '@react-navigation/native-stack';

export type RootStackParamList = {
    BLE_device: undefined;
    Status: undefined;
    History: undefined;
  };
  
export const Stack = createNativeStackNavigator<RootStackParamList>();
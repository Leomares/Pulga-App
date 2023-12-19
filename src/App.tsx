import React from 'react';
import {StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';

import {screenBLE} from './screens/screenBLE';
import {screenStatus} from './screens/screenStatus';
import {screenHistory} from './screens/screenHistory';

import {Stack} from './screens/routes';

function App() {
	return (
		<NavigationContainer>
			<Stack.Navigator initialRouteName="Devices">
				<Stack.Screen name="Devices" component={screenBLE} />
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

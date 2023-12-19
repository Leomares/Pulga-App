import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export const TableFreqs = ({data}) => {
	return (
		<View style={styles.table}>
			<View style={styles.headerRow}>
				<Text style={styles.headerCell}>f (Hz)</Text>
				<Text style={styles.headerCell}>Amplitude (dB)</Text>
			</View>
			{data.freq.map((item, index) => (
				<View key={index} style={styles.tableRow}>
					<Text style={styles.tableCell}>{item.toFixed(2)}</Text>
					<Text style={styles.tableCell}>
						{(20 * Math.log10(data.amplitude[index])).toFixed(2)}
					</Text>
				</View>
			))}
		</View>
	);
};

const styles = StyleSheet.create({
	table: {
		//borderWidth: 1,
		//borderColor: '#000',
		margin: 10,
	},
	headerRow: {
		flexDirection: 'row',
		backgroundColor: '#2196F3',
		padding: 10,
		borderTopLeftRadius: 5,
		borderTopRightRadius: 5,
		borderBottomLeftRadius: 5,
		borderBottomRightRadius: 5,
	},
	headerCell: {
		flex: 1,
		color: '#fff',
		//fontWeight: 'bold',
	},
	tableRow: {
		flexDirection: 'row',
		borderBottomWidth: 2,
		borderBottomColor: '#ccc',
		padding: 10,
	},
	tableCell: {
		flex: 1,
		color: '#000',
	},
});

import React from 'react';
import Player from './Player.jsx';

export default class App extends React.Component {
	render() {
		return (<svg width="100px" height="200px">
			<Player></Player>
		</svg>);
	}
}

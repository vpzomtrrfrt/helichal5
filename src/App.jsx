import React from 'react';
import Player from './Player.jsx';
import MainLoop from 'mainloop.js'

var input = {
	getX() {
		return (this.leftKey?-1:0)+(this.rightKey?1:0);
	}
};

export default class App extends React.Component {
	constructor() {
		super();
		this.state = {
			x: 40
		};
	}
	render() {
		return (<svg viewBox="0 0 100 150">
			<Player x={this.state.x}></Player>
		</svg>);
	}
	componentDidMount() {
		console.log(this);
		MainLoop.setUpdate(this.updateLoop.bind(this)).setDraw(() => this.forceUpdate()).start();
	}
	updateLoop() {
		this.state.x += input.getX();
		if(this.state.x >= 80) {
			this.state.x = 80;
		}
		else if(this.state.x <= 0) {
			this.state.x = 0;
		}
	}
}

window.onkeydown = (evt) => {
	if(evt.keyCode === 37) {
		input.leftKey = true;
	}
	if(evt.keyCode === 39) {
		input.rightKey = true;
	}
};
window.onkeyup = (evt) => {
	if(evt.keyCode === 37) {
		input.leftKey = false;
	}
	if(evt.keyCode === 39) {
		input.rightKey = false;
	}
}

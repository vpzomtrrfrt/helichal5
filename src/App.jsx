import React from 'react';
import Player from './Player.jsx';
import Platform from './Platform.jsx';
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
			x: 40,
			platforms: [{x: 40, y: 30}, {x: 20, y: 10}]
		};
	}
	render() {
		return (<svg viewBox="0 0 100 150">
			<Player x={this.state.x} dx={this.state.dx}></Player>
			{this.state.platforms.map((platform, index) => <Platform key={index} x={platform.x} y={platform.y} />)}
		</svg>);
	}
	componentDidMount() {
		console.log(this);
		MainLoop.setUpdate(this.updateLoop.bind(this)).setDraw(() => this.forceUpdate()).start();
	}
	updateLoop() {
		this.state.dx = input.getX();
		this.state.x += this.state.dx;
		if(this.state.x >= 80) {
			this.state.x = 80;
		}
		else if(this.state.x <= 0) {
			this.state.x = 0;
		}

		this.state.platforms.forEach((platform) => {
			platform.y += 0.4;

			var py = 130;
			if(py < platform.y+Platform.height && py+20 > platform.y && (this.state.x < platform.x || this.state.x+20 > platform.x+30)) {
				console.log("DEATH");
			}
		});
		this.state.platforms = this.state.platforms.filter(platform => platform.y < 150);
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

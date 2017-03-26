import React from 'react';
import prefix from 'react-prefixer';

var DEAD_EYES = false;

class Eye extends React.Component {
	render() {
		var dir;
		if(this.props.dx < -1) {
			dir = -1;
		}
		else if(this.props.dx > 1) {
			dir = 1;
		}
		else {
			dir = 0;
		}

		var py = 0;
		if(dir != 0) {
			py += 1;
		}
		
		var px = 1;
		if(dir === -1) px = 0;
		if(dir === 1) px = 2;

		return (<g className="eye" style={prefix({transform: "translate("+this.props.x+"px,"+this.props.y+"px)"})}>
			{this.props.dead && DEAD_EYES &&
				<g>
					<text textAnchor="middle" x={Player.width/10} y={Player.height/10} style={{fill: "black", fontSize: ".25em", fontFamily: "sans-serif"}} dominantBaseline="middle">x</text>
				</g>}
			{(!this.props.dead || !DEAD_EYES) &&
				<g>
					<rect width={Player.width/5} height={Player.width/5}></rect>
					<rect width={Player.width/10} height={Player.width/10} x={px*Player.width/20} y={py*Player.width/20} className="pupil"></rect>
				</g>}
		</g>);
	}
}

export default class Player extends React.Component {
	constructor() {
		super();
	}
	render() {
		return (<g className={'player' + (this.props.transition ? ' transition': '') + (this.props.noFade ? ' noFade': '')} style={prefix({transform: "translate("+this.props.x+"px, "+this.props.y+"px)", fill: this.props.color || "red"})}>
			<rect width={Player.width} height={Player.height}></rect>
			<Eye x={Player.width/5} y={Player.height/5} dx={this.props.dx} dead={this.props.dead} />
			<Eye x={Player.width*3/5} y={Player.height/5} dx={this.props.dx} dead={this.props.dead} />
		</g>);
	}
}

Player.size = 10;
Player.width = Player.size;
Player.height = Player.size;

if(location.hash === "#betsy") {
	Player.height *= 2;
}

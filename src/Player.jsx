import React from 'react';

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

		return (<g className="eye" style={{transform: "translate("+this.props.x+"px,"+this.props.y+"px)"}}>
			{this.props.dead && DEAD_EYES &&
				<g>
					<text textAnchor="middle" x={Player.size/10} y={Player.size/10} style={{fill: "black", fontSize: ".25em", fontFamily: "sans-serif"}} dominantBaseline="middle">x</text>
				</g>}
			{(!this.props.dead || !DEAD_EYES) &&
				<g>
					<rect width={Player.size/5} height={Player.size/5}></rect>
					<rect width={Player.size/10} height={Player.size/10} x={px*Player.size/20} y={py*Player.size/20} className="pupil"></rect>
				</g>}
		</g>);
	}
}

export default class Player extends React.Component {
	constructor() {
		super();
	}
	render() {
		return (<g className={'player' + (this.props.transition ? ' transition': '')} style={{transform: "translate("+this.props.x+"px, "+this.props.y+"px)"}}>
			<rect width={Player.size} height={Player.size} style={{fill: this.props.color || "red"}}></rect>
			<Eye x={Player.size/5} y={Player.size/5} dx={this.props.dx} dead={this.props.dead} />
			<Eye x={Player.size*3/5} y={Player.size/5} dx={this.props.dx} dead={this.props.dead} />
		</g>);
	}
}

Player.size = 10;

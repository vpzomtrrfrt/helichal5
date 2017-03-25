import React from 'react';

class Eye extends React.Component {
	render() {
		return (<g className="eye" style={{transform: "translate("+this.props.x+","+this.props.y+")"}}>
			<rect width="4px" height="4px"></rect>
			<rect width="2px" height="2px" x="1px" y="0px" className="pupil"></rect>
		</g>);
	}
}

export default class Player extends React.Component {
	constructor() {
		super();
	}
	render() {
		return (<g className="player" style={{transform: "translate("+this.props.x+"px, 130px)"}}>
			<rect width="20px" height="20px"></rect>
			<Eye x="4px" y="4px" />	
			<Eye x="12px" y="4px" />	
		</g>);
	}
}

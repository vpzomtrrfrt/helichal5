import React from 'react';
import prefix from 'react-prefixer';

export default class Button extends React.Component {
	render() {
		return (<g onClick={this.props.onClick} style={prefix({transform: "translate("+(this.props.x || 35)+"px, "+this.props.y+"px)"})}>
			<rect width="30%" height="10%" rx="6%" ry="4%" fill={this.props.color} />
			{this.props.children}
		</g>);
	}
}

export class PlayButton extends React.Component {
	render() {
		return (<Button color="lime" onClick={this.props.onClick} y={this.props.y} x={this.props.x}>
			<path d={"M 10 2.5 l 0 10 l 10 -5"} fill="yellow" />
		</Button>);
	}
}

export class HomeButton extends React.Component {
	render() {
		return (<Button color="black" onClick={this.props.onClick} y={this.props.y} x={this.props.x}>
			<path d="M 15 2 l 5 5 l 0 5 l -10 0 l 0 -5 z" fill="white" />
			<rect x="13%" y="4.5%" width="4%" height="3%" fill="black" />
			<circle cx="15%" cy="3%" r="0.5%" fill="black" />
		</Button>);
	}
}

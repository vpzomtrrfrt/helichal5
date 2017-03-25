import React from 'react';

export default class ModeLabel extends React.Component {
	render() {
		var y = this.props.y;
		return (<g onClick={(evt) => {
			evt.stopPropagation();
			if(this.props.onClick) {
				this.props.onClick();
			}
		}}>
			<rect x="0" y={(y-2.5)+"%"} width="100%" height="5%" fill={this.props.mode.color} />
			<text className="gamemodeName" x="50%" y={y+"%"} textAnchor="middle" dominantBaseline="middle">{this.props.mode.name} Mode{this.props.punctuation || ""}</text>
		</g>);
	}
}

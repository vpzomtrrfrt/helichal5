import React from 'react';


export default class Platform extends React.Component {
	render() {
		return (
			<g className="platform">
				<rect x="0" width={this.props.x} y={this.props.y} height={Platform.height} />
				<rect x={this.props.x+30} y={this.props.y} width={70-this.props.x} height={Platform.height} />
			</g>
		);
	}
}

Platform.height = 15;

import React from 'react';
import Player from './Player.jsx';
import Platform from './Platform.jsx';
import MainLoop from 'mainloop.js'

var input = {
	getX() {
		return Math.min(5, Math.max(-5, (this.leftKey?-5:0)+(this.rightKey?5:0)+this.tiltX));
	},
	getY() {
		return Math.min(5, Math.max(-5, (this.upKey?-5:0)+(this.downKey?5:0)+this.tiltY));
	},
	leftKey: false,
	rightKey: false,
	upKey: false,
	downKey: false,
	tiltX: 0,
	tiltY: 0
};

var States = {
	INGAME: {
		move: true,
		genPlatforms: true
	},
	DEAD: {
		pauseMenu: true,
		dead: true,
		playerTransition: true
	},
	HOME: {
		noGame: true,
		mainMenu: true,
		clickStart: true,
		playerTransition: true
	},
	STARTING: {
		playerTransition: true,
		genPlatforms: true
	}
};

var GameModes = {
	FreeFly: {
		id: 1,
		color: "red",
		name: "Free Fly"
	}
};

var pclrs = ["red", "lime", "cyan", "orange"];
export default class App extends React.Component {
	get highScoreKey() {
		if(!this.state.mode) {
			return "helichalHighscore";
		}
		else {
			return "helichalGM"+this.state.mode.id+"HS";
		}
	}
	get highScore() {
		var hsk = this.highScoreKey;
		if(hsk in localStorage) {
			return parseInt(localStorage.getItem(hsk));
		}
		return -1;
	}
	set highScore(value) {
		localStorage.setItem(this.highScoreKey, value);
	}
	constructor() {
		super();
		this.state = {};
		this.goHome();
	}
	goHome(e) {
		if(e) {
			e.stopPropagation();
		}
		this.state.state = States.HOME;
		this.state.menuTextX = 0;
		this.state.menuTextVel = 0.4;
	}
	start(gamemode) {
		this.state = {
			x: 40,
			y: 150-Player.size,
			platforms: [{x: 35, y: 100, id: 1}],
			score: 0,
			state: States.STARTING,
			mode: gamemode,
			color: pclrs[Math.floor(Math.random()*pclrs.length)]
		};
		setTimeout(() => this.state.state = States.INGAME, 1000);
	}
	handleClick() {
		if(this.state.state.clickStart) {
			this.start();
		}
	}
	render() {
		var py, px;
		if(this.state.state.noGame) {
			py = 50;
			px = 45;
		}
		else {
			py = this.state.y;
			px = this.state.x;
		}
		return (<svg viewBox="0 0 100 150" onClick={this.handleClick.bind(this)}>
			<Player x={px} dx={this.state.dx} dead={this.state.state.dead} color={this.state.color} y={py} transition={this.state.state.playerTransition}></Player>
			{!this.state.state.noGame && (<g>
				{this.state.platforms.map((platform, index) => <Platform key={platform.id} x={platform.x} y={platform.y} />)}
				{!this.state.state.dead && (<g>
					<text x="0" y="149px" className="score">Score: {this.state.score}</text>
					{this.highScore > -1 && (<text x="100%" y="149px" textAnchor="end" className={'score'+(this.state.newHighScore?' newHigh':'')}>High Score: {this.highScore}</text>)}
				</g>)}
			</g>)}
			{this.state.state.pauseMenu && (<g>
				<rect x="0" y="0" width="100px" height="150px" className="overlay" />
				<text x="50%" y="40%" textAnchor="middle">You Died!</text>
				{this.state.state.dead && (
					<text x="50%" y="45%" className={'score'+(this.state.newHighScore ? ' newHigh' : '')} textAnchor="middle">{this.state.newHighScore && 'New High '}Score: {this.state.score}</text>
				)}
				<g className="replayBtn" onClick={this.restart.bind(this)}>
					<rect x="35%" y="50%" width="30%" height="10%" rx="6%" ry="4%" fill="lime" />
					<path d="M 45 77.5 l 0 10 l 10 -5" fill="yellow" />
				</g>
				<g className="homeBtn" onClick={this.goHome.bind(this)}>
					<rect x="35%" y="70%" width="30%" height="10%" rx="6%" ry="4%" fill="black" />
					<path d="M 50 108 l 5 5 l 0 5 l -10 0 l 0 -5 z" fill="white" />
					<rect x="48%" y="75%" width="4%" height="3%" fill="black" />
					<circle cx="50%" cy="73.5%" r="0.5%" fill="black" />
				</g>
			</g>)}
			{this.state.state.mainMenu && (<g>
				<text x={50 + this.state.menuTextX} y="50%" textAnchor="middle" className="menuText">Helichal</text>
				<text x="50%" y="60%" textAnchor="middle" className="menuText small">Touch anywhere to play!</text>
				{Object.keys(GameModes).map((key, index) => {
					var y = (97.5-index*5);
					return (<g key={key} onClick={(evt) => {
						evt.stopPropagation();
						this.start(GameModes[key]);
					}}>
						<rect x="0" y={(y-2.5)+"%"} width="100%" height="5%" fill={GameModes[key].color} />
						<text className="gamemodeName" x="50%" y={y+"%"} textAnchor="middle" dominantBaseline="middle">{GameModes[key].name} Mode?</text>
					</g>);
				})}
			</g>)}

			{this.state.mode && (<g>
				<rect x="0" y="0" width="100%" height="5%" fill={this.state.mode.color} />
				<text x="50%" y="2.5%" textAnchor="middle" className="gamemodeName" dominantBaseline="middle">{this.state.mode.name} Mode!</text>
			</g>)}
		</svg>);
	}
	restart() {
		this.start(this.state.mode);
	}
	componentDidMount() {
		console.log(this);
		MainLoop.setUpdate(this.updateLoop.bind(this)).setDraw(() => this.forceUpdate()).start();
	}
	updateLoop() {
		this.state.dx = input.getX();
		if(this.state.state.move) {
			this.state.x += this.state.dx/5;
			if(this.state.x >= 100-Player.size) {
				this.state.x = 100-Player.size;
			}
			else if(this.state.x <= 0) {
				this.state.x = 0;
			}

			if(this.isGM(GameModes.FreeFly)) {
				var dy = input.getY();
				this.state.y += dy/5;
				if(this.state.y >= 150-Player.size) {
					this.state.y = 150-Player.size;
				}
			}

			this.state.platforms.forEach((platform) => {
				platform.y += 0.4;

				var py = this.state.y;
				if(py < platform.y+Platform.height && py+Player.size > platform.y && (this.state.x < platform.x || this.state.x+Player.size > platform.x+30)) {
					console.log("death by:", platform);
					this.state.state = States.DEAD;
				}
			});
			this.state.platforms = this.state.platforms.filter(platform => {
				var tr = platform.y < 150;
				if(!tr) {
					this.state.score++;
					if(this.state.score > this.highScore) {
						this.highScore = this.state.score;
						this.state.newHighScore = true;
					}
				}
				return tr;
			});
		}
		if(this.state.state.genPlatforms) {
			if(this.state.platforms[this.state.platforms.length-1].y > Math.min(this.state.y, 0)) {
				var lp = this.state.platforms[this.state.platforms.length-1];
				var npx = Math.floor(Math.random()*80);
				var nph = lp.y-Math.max(0, Math.min(30*(1-this.state.score/1000)+Math.abs(npx-lp.x)*(this.isGM(2)?2:1)/((5-Math.random()*(4-this.state.score/100))), 150));
				if(!isNaN(nph)) {
					this.state.platforms.push({x: npx, y: nph, id: Math.random()});
				}
			}
		}
		if(this.state.state.mainMenu) {
			var range = 10;
			this.state.menuTextX += this.state.menuTextVel;
			if(this.state.menuTextX > range) {
				this.state.menuTextVel = -this.state.menuTextVel;
				this.state.menuTextX = range-(this.state.menuTextX-range);
			}
			if(this.state.menuTextX < -range) {
				this.state.menuTextVel = -this.state.menuTextVel;
				this.state.menuTextX = -range-(this.state.menuTextX+range);
			}
		}
	}
	isGM(mode) {
		return this.state.mode == mode;
	}
}

window.onkeydown = (evt) => {
	if(evt.keyCode === 37) {
		input.leftKey = true;
	}
	if(evt.keyCode === 39) {
		input.rightKey = true;
	}
	if(evt.keyCode === 38) {
		input.upKey = true;
	}
	if(evt.keyCode === 40) {
		input.downKey = true;
	}
};
window.onkeyup = (evt) => {
	if(evt.keyCode === 37) {
		input.leftKey = false;
	}
	if(evt.keyCode === 39) {
		input.rightKey = false;
	}
	if(evt.keyCode === 38) {
		input.upKey = false;
	}
	if(evt.keyCode === 40) {
		input.downKey = false;
	}
}

window.ondeviceorientation = function(e) {
	input.tiltX = Math.min(5, e.gamma/9);
};

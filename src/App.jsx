import React from 'react';
import Player from './Player.jsx';
import Platform from './Platform.jsx';
import ModeLabel from './ModeLabel.jsx';
import { PlayButton, HomeButton } from './Button.jsx';
import MainLoop from 'mainloop.js';
import prefix from 'react-prefixer';

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
	PAUSED: {
		pauseMenu: true
	},
	HOME: {
		noGame: true,
		mainMenu: true,
		clickStart: true,
		playerTransition: true,
		noPauseMenu: true
	},
	STARTING: {
		playerTransition: true,
		genPlatforms: true,
		menuDead: true
	},
	Custom_CONFIG: {
		customConfig: true,
		noGame: true
	}
};

var Achievements = {
	Strobe: "CgkI7e2dvZIeEAIQAw",
	Zero: "CgkI7e2dvZIeEAIQBQ",
	Participation: "CgkI7e2dvZIeEAIQBg",
	Achievement: "CgkI7e2dvZIeEAIQDQ"
};

var strobe = false;

var GameModes = (function() {
	function create(id, color, name, leaderboard, extra) {
		var tr = {
			id: id,
			color: color,
			name: name,
			playerSpeed: 1,
			platformSpeed: 1,
			platformSpeedX: 0,
			leaderboard: leaderboard
		};
		if(extra) {
			for(var k in extra) {
				tr[k] = extra[k];
			}
		}
		return tr;
	}
	return {
		FreeFly: create(1, "red", "Free Fly", "CgkI7e2dvZIeEAIQBw"),
		Lightning: create(2, "yellow", "Lightning", "CgkI7e2dvZIeEAIQCA", {
			platformSpeed: 2.85,
			playerSpeed: 1.2
		}),
		Motion: create(3, "blue", "Motion", "CgkI7e2dvZIeEAIQCQ", {
			platformSpeedX: 1
		}),
		TapIt: create(4, "gray", "Tap It", "CgkI7e2dvZIeEAIQCg"),
		Insanity: create(6, "magenta", "Insane", "CgkI7e2dvZIeEAIQCw", {
			platformSpeed: 5.7,
			playerSpeed: 2.4
		}),
		Custom: create(5, "cyan", "Custom", "CgkI7e2dvZIeEAIQDA")
	};
})();

var pclrs = ["red", "lime", "cyan", "orange"];
export default class App extends React.Component {
	get highScoreKey() {
		if(!this.state.mode) {
			return "helichalHighscore";
		}
		else if(this.state.mode == GameModes.Custom) {
			var modes = Object.keys(GameModes).filter((key) => {
				return this.state.chosenModes && this.state.chosenModes[key];
			}).map((key) => GameModes[key].id);
			return "helichalGMCustom"+modes+"HS";
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
	get playerSpeed() {
		var tr = 1/5;
		var modes = [];
		if(this.state.mode == GameModes.Custom) {
			for(var key in GameModes) {
				if(this.state.chosenModes[key]) {
					modes.push(GameModes[key]);
				}
			}
		}
		else if(this.state.mode) {
			modes.push(this.state.mode);
		}
		modes.forEach((value) => tr *= value.playerSpeed);
		return tr;
	}
	get platformSpeed() {
		var tr = 2/5;
		var modes = [];
		if(this.state.mode == GameModes.Custom) {
			for(var key in GameModes) {
				if(this.state.chosenModes[key]) {
					modes.push(GameModes[key]);
				}
			}
		}
		else if(this.state.mode) {
			modes.push(this.state.mode);
		}
		modes.forEach((value) => tr *= value.platformSpeed);
		return tr;
	}
	get platformSpeedX() {
		var tr = 0;
		var modes = [];
		if(this.state.mode == GameModes.Custom) {
			for(var key in GameModes) {
				if(this.state.chosenModes[key]) {
					modes.push(GameModes[key]);
				}
			}
		}
		else if(this.state.mode) {
			modes.push(this.state.mode);
		}
		modes.forEach((value) => tr += value.platformSpeedX);
		return tr;
	}
	unlockAchievement(id) {
		console.log(id);
		if(App.playGames) {
			var data = {achievementId: id};
			console.log("passing "+JSON.stringify(data));
			window.plugins.playGamesServices.unlockAchievement(data);
		}
	}
	submitScore(score) {
		var board;
		if(this.state.mode) {
			board = this.state.mode.leaderboard;
		}
		else {
			// normal mode
			board = "CgkI7e2dvZIeEAIQAQ";
		}
		var data = {
			score: score,
			leaderboardId: board
		};
		if(App.playGames) {
			window.plugins.playGamesServices.submitScore(data);
		}
	}
	incrementAchievement(id, steps) {
		console.log(id);
		if(App.playGames) {
			var data = {achievementId: id, numSteps: steps || 1};
			console.log("passing "+JSON.stringify(data));
			window.plugins.playGamesServices.incrementAchievement(data);
		}
	}
	constructor() {
		super();
		this.state = {};
		this.goHome();
	}
	die() {
		this.state.state = States.DEAD;
		if(this.state.score === 0) {
			this.incrementAchievement(Achievements.Zero);
		}
		this.incrementAchievement(Achievements.Participation);
		this.submitScore(this.state.score);
	}
	goHome(e) {
		if(e) {
			e.stopPropagation();
		}
		this.state = {
			state: States.HOME,
			menuTextX: 0,
			menuTextVel: 0.4,
			color: this.state.color
		};
	}
	start(gamemode, choices) {
		if(gamemode == GameModes.Custom && !choices) {
			console.log("no choices");
			this.state = {
				state: States.Custom_CONFIG,
				mode: gamemode,
				chosenModes: {}
			};
			return;
		}
		this.state = {
			x: 40,
			y: 150-Player.height,
			platforms: [{x: 35, y: 100, id: 1, direction: 0}],
			score: 0,
			state: States.STARTING,
			mode: gamemode,
			color: pclrs[Math.floor(Math.random()*pclrs.length)],
			chosenModes: choices
		};
		setTimeout(() => this.state.state = States.INGAME, 1000);
	}
	startCustom(choices) {
		var modes = Object.keys(choices).filter(value => value);
		if(modes.length === 0) {
			this.start();
		}
		else if(modes.length === 1) {
			this.start(GameModes[modes[0]]);
		}
		else {
			this.start(GameModes.Custom, choices);
		}
	}
	handleClick(data) {
		var pos = {x: data.clientX, y: data.clientY};
		if(this.state.state.clickStart) {
			this.start();
		}
		else if(this.state.state.move) {
			if(this.isGM(GameModes.TapIt)) {
				if(this.state.tappity < 0) {
					this.state.tappity = Math.random()*(300-this.state.score/3);
				}
				else {
					this.die();
				}
			}
		}
		else if(this.state.state.pauseMenu) {
			if(!this.state.secret) {
				this.state.secret = [];
			}
			this.state.secret.push(pos.y);
			while(this.state.secret.length > 4) {
				this.state.secret.unshift();
			}
			if(this.state.secret.length === 4) {
				var max = Math.max(...this.state.secret);
				console.log(max, this.state.secret);
				if(this.state.secret[0] < max/4 && this.state.secret[1] < max/4
					&& this.state.secret[2] > max*3/4 && this.state.secret[3] > max*3/4) {
					console.log("success");
					strobe = !strobe;
					this.unlockAchievement(Achievements.Strobe);
					this.state.secret = [];
				}
			}
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
			<Player x={px} dx={this.state.dx} dead={this.state.state.dead} color={this.state.color} y={py} transition={this.state.state.playerTransition} noFade={strobe}></Player>
			{!this.state.state.noGame && (<g>
				{this.state.platforms.map((platform, index) => <Platform key={platform.id} x={platform.x} y={platform.y} />)}
				{!this.state.state.dead && (<g>
					<text x="0" y="149px" className="score">Score: {this.state.score}</text>
					{this.highScore > -1 && (<text x="100%" y="149px" textAnchor="end" className={'score'+(this.state.newHighScore?' newHigh':'')}>High Score: {this.highScore}</text>)}
				</g>)}

				{this.state.tappity < 0 && (<g className="tappity">
					<text x="50%" y="50%" textAnchor="middle">TAP!</text>
					<rect x="35%" y="55%" width={(30+this.state.tappity*30/120)+"%"} height="5%" />
				</g>)}
			</g>)}
			<rect x="0" y="0" width="100px" height="150px" className="overlay" style={{
				opacity: this.state.state.pauseMenu?1:0
			}} />
			<g style={prefix({
				transform: "translateX("+(this.state.state.pauseMenu?"0":"100%")+")",
				opacity: this.state.state.pauseMenu?1:0
			})} className={'pauseMenu' + (this.state.state.noPauseMenu ? ' noTransition': '')}>
				<text x="50%" y="40%" textAnchor="middle">
					{(this.state.state.menuDead || this.state.state.dead) ? 'You Died!' : 'Paused'}
				</text>
				{this.state.state.dead && (
					<text x="50%" y="45%" className={'score'+(this.state.newHighScore ? ' newHigh' : '')} textAnchor="middle">{this.state.newHighScore && 'New High '}Score: {this.state.score}</text>
				)}
				<PlayButton onClick={this.resume.bind(this)} y={75} />
				<HomeButton y={105} onClick={this.goHome.bind(this)} />
			</g>
			{this.state.state.mainMenu && (<g>
				<text x={50 + this.state.menuTextX} y="50%" textAnchor="middle" className="menuText">Helichal</text>
				<text x="50%" y="60%" textAnchor="middle" className="menuText small">Touch anywhere to play!</text>
				{Object.keys(GameModes).map((key, index) => {
					var y = (97.5-index*5);
					return (<ModeLabel y={y} onClick={() => this.start(GameModes[key])} mode={GameModes[key]} punctuation="?" key={key} />);
				})}
				{App.playGames && (<g>
					<g onClick={(evt) => {
						this.unlockAchievement(Achievements.Achievement);
						window.plugins.playGamesServices.showAchievements();
						evt.stopPropagation();
					}} style={prefix({
						transform: "translateX(1px) scale(0.7,0.7)"
					})}>
						<circle cx="5%" cy="5%" r="4%" fill="black" />
						<line x1="5%" y1="5%" x2="2%" y2="12%" className="achievementIconLine" />
						<line x1="5%" y1="5%" x2="8%" y2="12%" className="achievementIconLine" />
					</g>
					<g onClick={(evt) => {
						window.plugins.playGamesServices.showAllLeaderboards();
						evt.stopPropagation();
					}} style={prefix({
						transform: "translate(89px, 2px)"
					})}>
						<line x1="0" y1="0" x2="0" y2="7%" className="achievementIconLine" />
						<line x1="4%" y1="2%" x2="4%" y2="7%" className="achievementIconLine" />
						<line x1="8%" y1="4%" x2="8%" y2="7%" className="achievementIconLine" />
					</g>
				</g>)}
			</g>)}

			{this.state.mode && (<g>
				<ModeLabel y={2.5} mode={this.state.mode} punctuation="!" />
			</g>)}

			{this.state.state.customConfig && (<g>
				{Object.keys(GameModes).filter((mode) => {
					return mode != "Custom";
				}).map((key, index) => {
					var y = 20+index*10;
					return (<ModeLabel y={y} onClick={() => this.state.chosenModes[key] = !this.state.chosenModes[key]} mode={GameModes[key]} punctuation={this.state.chosenModes[key]?'!':'?'} key={key} />);
				})}
				<PlayButton x={55} y={120} onClick={() => this.startCustom(this.state.chosenModes)} />
				<HomeButton x={15} y={120} onClick={this.goHome.bind(this)} />
			</g>)}
			<g className="border">
				<rect x="0" y="100%" width="100%" height="20" />
				<rect x="0" y="-20" width="100%" height="20" />
			</g>
		</svg>);
	}
	restart() {
		this.start(this.state.mode, this.state.chosenModes);
	}
	resume() {
		if(this.state.state.dead) {
			this.restart();
		}
		else {
			this.state.state = States.INGAME;
		}
	}
	componentDidMount() {
		console.log(this);
		MainLoop.setUpdate(this.updateLoop.bind(this)).setDraw(() => this.forceUpdate()).start();
		input.blur = () => {
			console.log("blur");
			if(this.state.state === States.INGAME) {
				this.state.state = States.PAUSED;
			}
		};
	}
	updateLoop() {
		if(strobe) {
			this.state.color = pclrs[Math.floor(Math.random()*pclrs.length)];
		}
		this.state.dx = input.getX();
		if(this.state.state.move) {
			if(this.isGM(GameModes.TapIt)) {
				if(this.state.tappity === undefined) {
					this.state.tappity = 20;
				}
				this.state.tappity -= (1+(this.state.score/400));
				if(this.state.tappity < -120) {
					this.die();
				}
			}

			this.state.x += this.state.dx*this.playerSpeed;
			if(this.state.x >= 100-Player.width) {
				this.state.x = 100-Player.width;
			}
			else if(this.state.x <= 0) {
				this.state.x = 0;
			}

			if(this.isGM(GameModes.FreeFly)) {
				var dy = input.getY();
				this.state.y += dy/5;
				if(this.state.y >= 150-Player.height) {
					this.state.y = 150-Player.height;
				}
			}

			this.state.platforms.forEach((platform) => {
				platform.y += this.platformSpeed;

				if(this.state.mode) {
					platform.x += this.platformSpeedX*platform.direction/5;
					if(platform.x > 70) {
						platform.x = 70-(platform.x-70);
						platform.direction = -platform.direction;
					}
					if(platform.x < 0) {
						platform.x = -platform.x;
						platform.direction = -platform.direction;
					}
				}

				var py = this.state.y;
				if(py < platform.y+Platform.height && py+Player.height > platform.y && (this.state.x < platform.x || this.state.x+Player.width > platform.x+30)) {
					console.log("death by:", platform);
					this.die();
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
			if(this.state.platforms && this.state.platforms.length > 0) {
				if(this.state.platforms[this.state.platforms.length-1].y > Math.min(this.state.y, 0)) {
					var lp = this.state.platforms[this.state.platforms.length-1];
					var npx = Math.floor(Math.random()*80);
					var nph = lp.y-Math.max(0, Math.min(30*(1-this.state.score/1000)+Math.abs(npx-lp.x)*Player.height*0.1*(Math.pow(this.platformSpeed,1.6)+0.8)/((5-Math.random()*(4-this.state.score/100))), 150));
					if(!isNaN(nph)) {
						this.state.platforms.push({
							x: npx,
							y: nph,
							id: Math.random(),
							direction: 1
						});
					}
				}
			}
			else {
				console.log(this.state);
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
		if(this.state.mode == mode) {
			return true;
		}
		else if(this.state.mode == GameModes.Custom) {
			if(this.state.chosenModes) {
				for(var key in this.state.chosenModes) {
					if(GameModes[key] == mode) {
						return true;
					}
				}
			}
		}
		return false;
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

window.onblur = () => input.blur();

window.ondeviceorientation = function(e) {
	input.tiltX = Math.min(5, Math.max(-5, e.gamma/9));
	input.tiltY = Math.min(5, Math.max(-5, e.beta/9));
};

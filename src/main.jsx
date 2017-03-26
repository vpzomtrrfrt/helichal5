import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.jsx';

var game = (<App />);

ReactDOM.render(game, document.getElementById('app'));

document.addEventListener("deviceready", function() {
	console.log("Ready", arguments);
	if(window.admob) {
		window.admob.createBannerView({publisherId: "ca-app-pub-4664438225935502/5637529873", bannerAtTop: true, isTesting: true});
	}
	if(window.plugins.playGamesServices) {
		window.plugins.playGamesServices.auth(function() {
			console.log("play games successful");
			App.playGames = true;
		});
	}
});

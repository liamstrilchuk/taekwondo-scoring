class Interface {
	constructor(app) {
		this.app = app;
		this.view = "";
		this.matchWindow = null;
		this.configWindow = null;
	}

	initialScreenView() {
		this.view = "init";
		let previousMatches = `You do not have any previous matches.`;
		const matches = this.app.load("matches");
		if (matches) {
			previousMatches = ``;
			for (const match of JSON.load(matches)) {
				previousMatches += `<div class="previousMatch">Match here</div>`;
			}
		}
		this.app.container.innerHTML = `
			<button onclick="app.newMatch()"><img class="icon" src="assets/plus.png"> new match</button>
			<button onclick="app.interface.configurationView()"><img class="icon" src="assets/gear.png"> configuration</button>
			<div id="previousMatches">${previousMatches}</div>
		`;
	}

	createMatchView() {
		this.view = "create-match";
		this.app.container.innerHTML = `
			<a href="#" id="backToMain" onclick="app.interface.initialScreenView();">Back to main page</a>
			<h1>Create new match</h1>
			<div class="inputSection">
				<div class="inputGroup">
					<label for="blueName" style="color: blue;">blue name</label>
					<input id="blueName" type="text" placeholder="Enter name here">
				</div>
				<div class="inputGroup">
					<label for="redName" style="color: red;">red name</label>
					<input id="redName" type="text" placeholder="Enter name here">
				</div>
			</div>
			<div class="inputSection">
				<div class="inputGroup">
					<label for="matchTime">match time (seconds)</label>
					<input id="matchTime" type="number" inputmode="numeric" value=60>
				</div>
				<div class="inputGroup">
					<label for="restTime">rest time (seconds)</label>
					<input id="restTime" type="number" inputmode="numeric" value=15>
				</div>
				<div class="inputGroup">
					<label for="rounds">number of rounds</label>
					<input id="rounds" type="number" inputmode="numeric" value=2>
				</div>
			</div>
			<button onclick="app.createMatch()"><img class="icon" src="assets/add.png">create</button>
		`;
	}

	getMatchSettings() {
		return {
			names: {
				blue: document.getElementById("blueName").value,
				red: document.getElementById("redName").value
			},
			matchTime: Number(document.getElementById("matchTime").value),
			restTime: Number(document.getElementById("restTime").value),
			numRounds: Number(document.getElementById("rounds").value)
		};
	}

	matchView() {
		this.view = "match";
		this.matchWindow.document.head.innerHTML = `
			<style>
				.judgeScoring {
					width: 65px;
					height: 65px;
					border-radius: 50%;
					background: #ccc;
					margin: 3px;
					display: inline-block;
				}

				.scoringWindow {
					width: 275px;
					flex-shrink: 0;
				}

				.matchDisplay {
					display: flex;
				}

				.matchSide {
					width: 50%;
				}

				.matchName {
					font-size: 60px;
					color: white;
					font-family: Arial;
					height: 80px;
					border-radius: 10px;
					width: calc(100% - 20px);
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: bold;
					margin: auto;
				}

				.matchScore {
					width: 100%;
					font-size: 300px;
					color: white;
					font-family: Arial;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: bold;
					border-radius: 10px;
				}

				.matchJudges {
					padding: 5px;
				}

				.matchMiddle {
					display: flex;
					margin: 0 10px;
				}

				.matchTime {
					width: 300px;
					font-size: 100px;
					font-family: Arial;
					display: flex;
					align-items: center;
					justify-content: center;
					font-weight: bold;
					border-radius: 10px;
					flex-shrink: 0;
				}

				#roundCounter {
					width: 100%;
					font-size: 60px;
					font-family: Arial;
					text-align: center;
					font-weight: bold;
					color: #555;
				}

				.matchPenalties {
					display: flex;
					padding: 5 10px;
				}

				.matchPenalty {
					height: 35px;
					width: 100%;
					background: #ccc;
					margin: 5px;
					border-radius: 5px;
				}
			</style>
		`;

		this.matchWindow.document.body.innerHTML = `
			<div id="roundCounter">ROUND _ OF _</div>
			<div class="matchDisplay" style="margin: 0 10px;">
				<div class="matchName" style="background: red;">${this.app.match.settings.names.red.toUpperCase() || "RED"}</div>
				<div class="matchTime" id="matchTime">1:00</div>
				<div class="matchName" style="background: blue;">${this.app.match.settings.names.blue.toUpperCase() || "BLUE"}</div>
			</div>
			<div class="matchDisplay">
				<div class="matchSide">
					<div class="matchMiddle">
						<div class="matchJudges" id="redJudges"></div>
						<div class="matchScore" id="redScore" style="background: red;"></div>
					</div>
					<div class="matchPenalties" id="redPenalties"></div>
				</div>
				<div class="matchSide">
					<div class="matchMiddle">
						<div class="matchScore" id="blueScore" style="background: blue;"></div>
						<div class="matchJudges" id="blueJudges"></div>
					</div>
					<div class="matchPenalties" id="bluePenalties"></div>
				</div>
			</div>
		`;

		this.app.container.innerHTML = `
			<h1>Match controller</h1>
			<div class="inputSection">
				<div class="inputGroup">
					<span class="matchControlLabel">time remaining</span>
					<div class="matchControl">
						<span id="matchControlTime">1:00</span>
						<img class="matchControlButton" src="assets/play.png" id="matchControlPlayButton" onclick="app.match.togglePause()">
						<img class="matchControlButton" src="assets/pause.png" id="matchControlPauseButton" onclick="app.match.togglePause()">
						<img class="matchControlButton" src="assets/next.png" id="matchControlSkipButton" onclick="app.match.skipRest()">
					</div>
				</div>
				<div class="inputGroup">
					<span class="matchControlLabel">current status</span>
					<div class="matchControl">
						<span id="matchControlStatus">paused</span>
					</div>
				</div>
				<div class="inputGroup">
					<span class="matchControlLabel">current round</span>
					<div class="matchControl">
						<span id="matchControlRound">1</span>
					</div>
				</div>
			</div>
			<div class="inputSection">
				<div class="inputGroup">
					<span class="matchControlLabel" style="color: red;">red score</span>
					<div class="matchControl">
						<img class="matchControlButton" src="assets/minus.png" onclick="app.match.changeRedScore(-1)">
						<span id="matchControlRedScore">0</span>
						<img class="matchControlButton" src="assets/plus.png" onclick="app.match.changeRedScore(1)">
					</div>
				</div>
				<div class="inputGroup">
					<span class="matchControlLabel" style="color: blue;">blue score</span>
					<div class="matchControl">
						<img class="matchControlButton" src="assets/minus.png" onclick="app.match.changeBlueScore(-1)">
						<span id="matchControlBlueScore">0</span>
						<img class="matchControlButton" src="assets/plus.png" onclick="app.match.changeBlueScore(1)">
					</div>
				</div>
			</div>
			<div class="inputSection">
				<div class="inputGroup">
					<span class="matchControlLabel" style="color: red;">red penalties</span>
					<div class="matchControl">
						<img class="matchControlButton" src="assets/minus.png" onclick="app.match.changeRedPenalties(-1)">
						<span id="matchControlRedPenalties">0</span>
						<img class="matchControlButton" src="assets/plus.png" onclick="app.match.changeRedPenalties(1)">
					</div>
				</div>
				<div class="inputGroup">
					<span class="matchControlLabel" style="color: blue;">blue penalties</span>
					<div class="matchControl">
						<img class="matchControlButton" src="assets/minus.png" onclick="app.match.changeBluePenalties(-1)">
						<span id="matchControlBluePenalties">0</span>
						<img class="matchControlButton" src="assets/plus.png" onclick="app.match.changeBluePenalties(1)">
					</div>
				</div>
			</div>
		`;
	}

	updateMatchView() {
		const redJudges = this.matchWindow.document.getElementById("redJudges"), blueJudges = this.matchWindow.document.getElementById("blueJudges");
		redJudges.innerHTML = "";
		blueJudges.innerHTML = "";

		redJudges.style.width = 71 * this.app.config.judges + "px";
		blueJudges.style.width = 71 * this.app.config.judges + "px";

		const sw = this.app.match.scoringWindows;
		for (let i = 0; i < 10; i++) {
			let judgeTextRed = "", judgeTextBlue = "";
			for (let j = 0; j < this.app.config.judges; j++) {
				const redColor = sw.red[i] && sw.red[i].judges[j] ? (sw.red[i].points === 2 ? "orange" : "red") : "#ccc";
				const blueColor = sw.blue[i] && sw.blue[i].judges[j] ? (sw.blue[i].points === 2 ? "orange" : "blue") : "#ccc";
				judgeTextRed += `<div class="judgeScoring" style="background: ${redColor}"></div>`;
				judgeTextBlue += `<div class="judgeScoring" style="background: ${blueColor}"></div>`;
			}
			redJudges.innerHTML += `
				<div class="scoringWindow">${judgeTextRed}</div>
			`;

			blueJudges.innerHTML += `
				<div class="scoringWindow">${judgeTextBlue}</div>
			`;
		}

		const redScore = this.matchWindow.document.getElementById("redScore"), blueScore = this.matchWindow.document.getElementById("blueScore");
		redScore.innerHTML = this.app.match.scores.red + this.app.match.penalties.blue;
		blueScore.innerHTML = this.app.match.scores.blue + this.app.match.penalties.red;

		const redPenalties = this.matchWindow.document.getElementById("redPenalties"), bluePenalties = this.matchWindow.document.getElementById("bluePenalties");
		redPenalties.innerHTML = "";
		bluePenalties.innerHTML = "";

		for (let i = 0; i < 8; i++) {
			const redColor = i < this.app.match.penalties.red ? "red" : "#ccc";
			const blueColor = (7 - i) < this.app.match.penalties.blue ? "blue" : "#ccc";
			redPenalties.innerHTML += `<div class="matchPenalty" style="background: ${redColor};"></div>`;
			bluePenalties.innerHTML += `<div class="matchPenalty" style="background: ${blueColor};"></div>`;
		}

		const roundCounter = this.matchWindow.document.getElementById("roundCounter");
		if (this.app.match.state === "complete") {
			roundCounter.innerHTML = "MATCH COMPLETE";
		} else if (this.app.match.currentRound > this.app.match.settings.numRounds) {
			roundCounter.innerHTML = (this.app.match.state === "rest" ? "REST - " : "") + "GOLDEN POINT";
		} else {
			roundCounter.innerHTML = (this.app.match.state === "rest" ? "REST - " : "") + `ROUND ${this.app.match.currentRound} OF ${this.app.match.settings.numRounds}`;
		}

		const matchControlTime = this.app.container.querySelector("#matchControlTime");
		matchControlTime.innerHTML = this.formatTime(this.app.match.timeRemaining);

		const redScoreControl = this.app.container.querySelector("#matchControlRedScore"),
			blueScoreControl = this.app.container.querySelector("#matchControlBlueScore"),
			redPenaltyControl = this.app.container.querySelector("#matchControlRedPenalties"),
			bluePenaltyControl = this.app.container.querySelector("#matchControlBluePenalties");

		redScoreControl.innerHTML = this.app.match.scores.red;
		blueScoreControl.innerHTML = this.app.match.scores.blue;
		redPenaltyControl.innerHTML = this.app.match.penalties.red;
		bluePenaltyControl.innerHTML = this.app.match.penalties.blue;

		const statusControl = this.app.container.querySelector("#matchControlStatus");
		statusControl.innerHTML = this.app.match.state;

		const currentRoundControl = this.app.container.querySelector("#matchControlRound");
		currentRoundControl.innerHTML = this.app.match.currentRound;

		const playButton = this.app.container.querySelector("#matchControlPlayButton"),
			pauseButton = this.app.container.querySelector("#matchControlPauseButton"),
			skipButton = this.app.container.querySelector("#matchControlSkipButton");

		playButton.style.display = this.app.match.state === "paused" ? "inline-block" : "none";
		pauseButton.style.display = this.app.match.state === "running" ? "inline-block" : "none";
		skipButton.style.display = this.app.match.state === "rest" ? "inline-block" : "none";
	}

	configurationView() {
		this.view = "config";
		this.app.container.innerHTML = `
			<a href="#" id="backToMain" onclick="app.interface.initialScreenView();">Back to main page</a>
			<h1>Configuration</h1>
			<div class="inputSection">
				<div class="inputGroup">
					<label for="judges">number of judges</label>
					<input id="judges" type="number" inputmode="numeric" value=${this.app.config.judges}>
				</div>
				<div class="inputGroup">
					<label for="pointGap">point gap to win</label>
					<input id="pointGap" type="number" inputmode="numeric" value=${this.app.config.pointGap}>
				</div>
				<div class="inputGroup">
					<label for="judgesToScore">judges to score</label>
					<input id="judgesToScore" type="number" inputmode="numeric" value=${this.app.config.judgesToScore}>
				</div>
			</div>
			<div class="inputSection">
				<div class="inputGroup">
					<label for="scoringPersistance">scoring persistance (seconds)</label>
					<input id="scoringPersistance" type="number" inputmode="numeric" value=${this.app.config.scoringPersistance}>
				</div>
			</div>
			<button onclick="app.interface.saveConfig()"><img class="icon" src="assets/save.png"> save</button>
			<button onclick="app.interface.configureJudgesView()"><img class="icon" src="assets/console.png"> configure judges</button>
		`;
	}

	configureJudgesView() {
		this.currentJudgeConfig = 0;
		this.currentJudgeSide = "red";
		this.currentJudgePoints = 1;

		this.view = "config-judges";
		this.configWindow = window.open("about:blank", "_blank", { popup: true });
		window.setTimeout(() => {
			this.configWindow.onkeydown = this.app.onKeyDown.bind(this.app);

			this.configWindow.document.body.style.margin = "0";
			this.configureJudgesNext();
		}, 500);
	}

	configureJudgesNext() {
		this.configWindow.document.body.innerHTML = `
			<div style="width: 100%; height: 100%; background: ${this.currentJudgeSide};">
				<div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center;">
					<div style="font-size: 80px; font-family: Arial; font-weight: bold; color: white;">JUDGE #${this.currentJudgeConfig + 1} - ${this.currentJudgePoints} POINT</div>
					<div style="font-size: 50px; font-family: Arial; font-weight: bold; color: white;">${this.currentJudgeSide.toUpperCase()}</div>
				</div>
			</div>
		`;
	}

	configureJudgesKeydown(key) {
		const allowedKeys = "`~1!2@3#4$5%6^7&8*9(0)-_=+qwertyuiopasdfghjklzxcvbnm[]\;',./{}|:\"<>?";

		if (!allowedKeys.includes(key)) {
			return;
		}

		this.app.setJudgeKey(this.currentJudgeConfig, this.currentJudgeSide, this.currentJudgePoints, key);

		if (this.currentJudgeSide === "red") {
			this.currentJudgeSide = "blue";
			this.configureJudgesNext();
			return;
		}

		if (this.currentJudgePoints < 2) {
			this.currentJudgePoints++;
			this.currentJudgeSide = "red";
			this.configureJudgesNext();
			return;
		}

		if (this.currentJudgeConfig + 1 < this.app.config.judges) {
			this.currentJudgeConfig++;
			this.currentJudgeSide = "red";
			this.currentJudgePoints = 1;
			this.configureJudgesNext();
			return;
		}

		this.configWindow.close();
	}

	formatTime(seconds) {
		if (seconds <= 0) {
			return "0:00";
		}
		const minutes = Math.floor(seconds / 60);
		seconds = Math.floor(seconds % 60);
		return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
	}
}
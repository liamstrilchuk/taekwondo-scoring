class Match {
	constructor(settings, app) {
		this.settings = settings;
		this.scores = { red: 0, blue: 0 };
		this.penalties = { red: 0, blue: 0 };
		this.scoringWindows = { red: [], blue: [] };
		this.state = "paused";
		this.app = app;
		this.currentRound = 1;
		this.timeRemaining = this.settings.matchTime;
		this.lastUpdate = Date.now();

		this.app.interface.matchWindow = window.open("", "_blank", { popup: true });
		this.app.interface.matchWindow.onkeydown = this.app.onKeyDown.bind(this.app);

		window.setTimeout(() => {
			this.updateInterface(true);
		}, 500);
		window.setTimeout(this.updateClock.bind(this), 50);
	}

	updateClock() {
		if (this.state === "rest" || this.state === "running") {
			const delta = Date.now() - this.lastUpdate;
			this.timeRemaining -= delta / 1000;
	
			this.app.interface.matchWindow.document.getElementById("matchTime").innerHTML = this.app.interface.formatTime(this.timeRemaining);
		}

		if (this.state === "running" && this.timeRemaining <= 0) {
			this.app.audioManager.sounds.buzzer.play();
			if ((this.scores.red === this.scores.blue && this.currentRound === this.settings.numRounds) ||
				this.currentRound < this.settings.numRounds) {
				this.state = "rest";
				this.timeRemaining = this.settings.restTime;
				this.currentRound++;
			} else {
				this.state = "complete";
			}
		}

		if (this.state === "rest" && this.timeRemaining <= 0) {
			this.state = "paused";
			this.timeRemaining = this.settings.matchTime;
		}

		this.removeOldScoringWindows();
		this.lastUpdate = Date.now();
		window.setTimeout(this.updateClock.bind(this), 50);
	}

	removeOldScoringWindows() {
		for (const side in this.scoringWindows) {
			for (let i = this.scoringWindows[side].length - 1; i >= 0; i--) {
				if (Date.now() - this.scoringWindows[side][i].firstPressed > this.app.config.scoringPersistance * 1000 && !this.scoringWindows[side][i].hasScored) {
					this.scoringWindows[side].splice(i, 1);
				}
			}
		}
	}

	updateInterface(addTimer) {
		this.app.interface.updateMatchView();

		if (addTimer) {
			window.setTimeout(() => {
				this.updateInterface(true);	
			}, 500);
		}
	}

	changeRedScore(amount) {
		if (this.scores.red + amount < 0) {
			return;
		}
		this.scores.red += amount;
		this.updateInterface();
	}

	changeBlueScore(amount) {
		if (this.scores.blue + amount < 0) {
			return;
		}
		this.scores.blue += amount;
		this.updateInterface();
	}

	changeRedPenalties(amount) {
		if (this.penalties.red + amount < 0) {
			return;
		}
		this.penalties.red += amount;
		this.updateInterface();
	}

	changeBluePenalties(amount) {
		if (this.penalties.blue + amount < 0) {
			return;
		}
		this.penalties.blue += amount;
		this.updateInterface();
	}

	togglePause() {
		this.state = this.state === "paused" ? "running" : "paused";
		this.updateInterface();
	}

	skipRest() {
		this.state = "paused";
		this.timeRemaining = this.settings.matchTime;
		this.updateInterface();
	}

	keyDown(key) {
		const numJudges = this.app.config.judges;
		const judgesToScore = this.app.config.judgesToScore;
		const judgeConfig = this.app.config.judgesConfig;
		const scoringPersistance = this.app.config.scoringPersistance;

		let judge, side, points;
		for (let j = 0; j < Math.min(judgeConfig.length, numJudges); j++) {
			for (const s in judgeConfig[j]) {
				for (let p = 0; p < judgeConfig[j][s].length; p++) {
					if (judgeConfig[j][s][p] === key) {
						judge = j;
						side = s;
						points = (p + 1) * 2;
					}
				}
			}
		}

		if (judge === undefined || side === undefined || points === undefined) {
			return;
		}

		let hasAdded = false;
		for (const sw of this.scoringWindows[side]) {
			if (Date.now() - sw.firstPressed > scoringPersistance * 1000) {
				continue;
			}

			if (sw.points !== points) {
				continue;
			}

			if (sw.judges[judge]) {
				continue;
			}

			sw.judges[judge] = true;
			hasAdded = true;
			break;
		}

		if (this.scoringWindows[side].length >= 10) {
			this.scoringWindows[side].shift();
		}

		if (!hasAdded) {
			this.scoringWindows[side].push({
				firstPressed: Date.now(),
				judges: new Array(numJudges).fill(false),
				hasScored: false,
				points: points
			});
			this.scoringWindows[side][this.scoringWindows[side].length - 1].judges[judge] = true;
		}

		for (const sw of this.scoringWindows[side]) {
			if (sw.judges.filter(j => j).length >= judgesToScore) {
				if (!sw.hasScored) {
					sw.hasScored = true;
					side === "red" ? this.changeRedScore(sw.points) : this.changeBlueScore(sw.points);
				}
			}
		}

		this.updateInterface();
	}
}
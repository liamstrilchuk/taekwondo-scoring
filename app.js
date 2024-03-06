class App {
	constructor() {
		this.interface = new Interface(this);
		this.audioManager = new AudioManager();
		this.match = null;
		this.config = {};

		window.addEventListener("keydown", this.onKeyDown.bind(this));
	}
	
	start() {
		this.container = document.getElementById("container");
		this.initializeStorage();
		this.config = JSON.parse(this.load("config"));
		this.interface.initialScreenView();
	}

	newMatch() {
		this.interface.createMatchView();
	}

	createMatch() {
		const matchSettings = this.interface.getMatchSettings();
		this.match = new Match(matchSettings, this);
		this.interface.matchView();
	}

	load(key) {
		return localStorage.getItem(key);
	}

	set(key, value) {
		localStorage.setItem(key, value);
	}

	initializeStorage() {
		if (!this.load("matches")) {
			this.set("matches", []);
		}

		if (!this.load("config")) {
			this.set("config", JSON.stringify({
				judges: 3,
				pointGap: 12,
				judgesToScore: 2,
				judgesConfig: [
					{ red: ["", ""], blue: ["", ""] },
					{ red: ["", ""], blue: ["", ""] },
					{ red: ["", ""], blue: ["", ""] },
					{ red: ["", ""], blue: ["", ""] },
					{ red: ["", ""], blue: ["", ""] },
					{ red: ["", ""], blue: ["", ""] },
				],
				scoringPersistance: 2
			}));
		}
	}

	setJudgeKey(judge, side, point, key) {
		this.config.judgesConfig[judge][side][point - 1] = key;
		this.set("config", JSON.stringify(this.config));
	}

	onKeyDown(event) {
		if (this.interface.view === "config-judges") {
			this.interface.configureJudgesKeydown(event.key.toLowerCase());
			return;
		}

		if (this.match && this.match.state === "running") {
			this.match.keyDown(event.key.toLowerCase());
		}
	}
}
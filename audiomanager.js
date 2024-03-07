class AudioManager {
	constructor() {
		this.sounds = {
			buzzer: this.loadAudio("audio/buzzer.mp3"),
			point: this.loadAudio("audio/point.wav"),
			timelow: this.loadAudio("audio/timelow.wav")
		};
	}

	loadAudio(src) {
		const audio = new Audio(src);
		audio.load();
		return audio;
	}
}
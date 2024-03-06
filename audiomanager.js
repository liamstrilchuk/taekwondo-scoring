class AudioManager {
	constructor() {
		this.sounds = {
			buzzer: this.loadAudio("audio/buzzer.mp3")
		};
	}

	loadAudio(src) {
		const audio = new Audio(src);
		audio.load();
		return audio;
	}
}
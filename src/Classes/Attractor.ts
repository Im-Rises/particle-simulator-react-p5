import type p5Types from 'p5';

class Attractor {
	position: p5Types.Vector;
	mass = 250;
	forceInversion = 1;

	constructor(p5: p5Types, mass: number) {
		this.position = p5.createVector(p5.mouseX, p5.mouseY);
		this.mass = mass;
	}

	updatePositionFromScreen(p5: p5Types, pixelPerMeter: number) {
		this.position.x = p5.mouseX;
		this.position.y = p5.mouseY;
		this.position.div(pixelPerMeter);
	}

	show(p5: p5Types, pixelPerMeter: number) {
		p5.stroke(255);
		p5.strokeWeight(4);
		const positionScreen = this.position.copy().mult(pixelPerMeter);
		p5.point(positionScreen.x, positionScreen.y);
	}

	toggleForceInversion() {
		this.forceInversion *= -1;
	}
}

export default Attractor;

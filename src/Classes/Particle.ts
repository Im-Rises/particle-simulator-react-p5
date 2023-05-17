import p5Types from 'p5';
import type Attractor from './Attractor';

class Particle {
	static mass = 50;
	static friction = 0.99;
	static softening = 10;
	static initialColor: p5Types.Color;
	static finalColor: p5Types.Color;
	static maxColorVelocity = 1;

	static setMass(mass: number) {
		Particle.mass = mass;
	}

	static setFriction(friction: number) {
		Particle.friction = friction;
	}

	static setSoftening(softening: number) {
		Particle.softening = softening;
	}

	static setInitialColor(initialColor: p5Types.Color) {
		Particle.initialColor = initialColor;
	}

	static setFinalColor(centerColor: p5Types.Color) {
		Particle.finalColor = centerColor;
	}

	static setMaxColorVelocity(value: number) {
		this.maxColorVelocity = value;
	}

	position: p5Types.Vector;
	velocity: p5Types.Vector;
	color: p5Types.Color;

	constructor(p5: p5Types, x: number, y: number) {
		this.position = p5.createVector(x, y);
		// this.position = p5.createVector(0, 0);
		this.velocity = p5.createVector(0, 0);
		this.color = Particle.initialColor;
	}

	update(p5: p5Types, target: Attractor, deltaTime: number, G: number) {
		/* Calculate acceleration */
		const toTarget = p5Types.Vector.sub(target.position, this.position);
		const distance = (toTarget.copy().mag());
		// const distanceSquaredNormalized = ((distanceNormalized ** 2) + (Particle.softening ** 2)) ** (3 / 2);
		const distanceSquared = ((distance ** 2) + Particle.softening);

		// Sum of forces = (G * m1 * m2 / r^2 ) multiplied by the normalized vector toTarget to get the direction of the force
		const force = toTarget.copy().normalize().mult(G * target.mass * Particle.mass / distanceSquared);

		// Acceleration = Force / mass
		const acceleration = (force.copy().div(Particle.mass)).mult(target.forceInversion);

		// p = p0 + v0 * t + 1/2 * a * t^2
		this.position.add(this.velocity.copy().mult(deltaTime)).add(acceleration.copy().mult(deltaTime * deltaTime / 2));

		// v = v0 + a * t
		this.velocity.add(acceleration.copy().mult(deltaTime));
		this.velocity.mult(Particle.friction);

		/* Calculate new color according to the velocity */
		this.color = p5.lerpColor(Particle.initialColor, Particle.finalColor, this.velocity.mag() / Particle.maxColorVelocity);
	}

	moveObjectOutOfScreen(p5: p5Types, pixelPerMeter: number) {
		/* Prevent particles from going out of the screen */
		if (this.position.x < 0) {
			this.position.x = p5.width / pixelPerMeter;
		}

		if (this.position.x > p5.width / pixelPerMeter) {
			this.position.x = 0;
		}

		if (this.position.y < 0) {
			this.position.y = p5.height / pixelPerMeter;
		}

		if (this.position.y > p5.height / pixelPerMeter) {
			this.position.y = 0;
		}
	}

	show(p5: p5Types, pixelPerMeter: number) {
		p5.stroke(this.color);
		p5.strokeWeight(4);
		const positionScreen = this.position.copy().mult(pixelPerMeter);
		p5.point(positionScreen.x, positionScreen.y);
	}
}

export default Particle;

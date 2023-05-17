import React from 'react';
import Sketch from 'react-p5';
import type p5Types from 'p5';
import {isMobile} from 'react-device-detect';
import Attractor from '../Classes/Attractor';
import Particle from '../Classes/Particle';
import {PARTICLES_COUNT_COMPUTER, PARTICLES_COUNT_MOBILE} from '../Constants/constant-particle-simulator';

type Quadruplet = [number, number, number, number];

type ComponentProps = {
	parentRef: React.RefObject<HTMLElement>;
	particleCountMobile?: number;
	particleCountComputer?: number;
	frameRate?: number;
	fixedUpdate?: number;
	spawnAreaRadius?: number;
	gravitationalConstant?: number;
	particlesMass?: number;
	attractorMass?: number;
	friction?: number;
	softening?: number;
	pixelsPerMeter?: number;
	initColor?: Quadruplet;
	finalColor?: Quadruplet;
	maxColorVelocity?: number;
	backColor?: Quadruplet;
};

const defaultProps = {
	particleCountMobile: PARTICLES_COUNT_MOBILE,
	particleCountComputer: PARTICLES_COUNT_COMPUTER,
	frameRate: 60,
	fixedUpdate: 60,
	spawnAreaRadius: 100,
	gravitationalConstant: 1,
	particlesMass: 50,
	attractorMass: 250,
	friction: 0.99,
	softening: 10,
	pixelsPerMeter: 100,
	initColor: [0, 255, 255, 200],
	finalColor: [255, 0, 255, 200],
	maxColorVelocity: 5,
	backColor: [0, 0, 0, 255],
};

const ParticleSimulator: React.FC<ComponentProps> = (props: ComponentProps) => {
	const mergedProps = {...defaultProps, ...props};

	// Time variables
	let previousTime = 0;
	let fixedUpdateAccum = 0;
	const fixedDeltaTime = 1 / mergedProps.fixedUpdate;

	// Attractor and Particles array
	const particleArray: Particle[] = [];
	let attractor: Attractor;

	// P5 variables
	let screenBuffer: p5Types.Graphics;

	// Sketch setup
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		// Create canvas
		const canvas = p5.createCanvas(mergedProps.parentRef.current!.clientWidth, mergedProps.parentRef.current!.clientHeight, p5.P2D)
			.parent(canvasParentRef);

		// Create graphics
		screenBuffer = p5.createGraphics(mergedProps.parentRef.current!.clientWidth, mergedProps.parentRef.current!.clientHeight, p5.P2D);

		// Set frame rate to 60
		p5.frameRate(mergedProps.frameRate);

		// Set up init mouse position
		p5.mouseX = p5.width / 2;
		p5.mouseY = p5.height / 2;

		// Create attractor
		attractor = new Attractor(p5, mergedProps.attractorMass);

		// Create and set the particles around the center of the screen as a square
		Particle.setMass(mergedProps.particlesMass);
		Particle.setFriction(mergedProps.friction);
		Particle.setSoftening(mergedProps.softening);
		Particle.setInitialColor(p5.color(mergedProps.initColor[0],
			mergedProps.initColor[1],
			mergedProps.initColor[2],
			mergedProps.initColor[3]));
		Particle.setFinalColor(p5.color(mergedProps.finalColor[0],
			mergedProps.finalColor[1],
			mergedProps.finalColor[2],
			mergedProps.finalColor[3]));
		Particle.setMaxColorVelocity(mergedProps.maxColorVelocity);
		for (let i = 0; i < (isMobile ? mergedProps.particleCountMobile : mergedProps.particleCountComputer); i++) {
			// Define particles spawn in a circle
			const randomFloat = (min: number, max: number) => min + ((max - min) * Math.random());
			const randomAngle1 = randomFloat(0, 2 * Math.PI);
			const randomAngle2 = randomFloat(0, 2 * Math.PI);
			const posX = ((p5.width / 2)
                + (mergedProps.spawnAreaRadius * Math.cos(randomAngle1) * Math.sin(randomAngle2))) / (mergedProps.pixelsPerMeter);
			const posY = ((p5.height / 2)
                + (mergedProps.spawnAreaRadius * Math.sin(randomAngle1) * Math.sin(randomAngle2))) / (mergedProps.pixelsPerMeter);
			// Create particle
			particleArray.push(new Particle(p5,
				posX,
				posY),
			);
		}

		// Callback mouse button
		canvas.mousePressed((p5: p5Types) => {
			attractor.toggleForceInversion();
		});
	};

	// Sketch draw call every frame (60 fps) game loop
	const draw = (p5: p5Types) => {
		/* Calculate deltaTime and update fixedUpdateAccum */
		const currentTime = p5.millis();
		const deltaTime = (currentTime - previousTime) / 1000;// in seconds
		previousTime = currentTime;
		fixedUpdateAccum += deltaTime;

		/* Read inputs */
		// At the moment it is directly in the attractor.update() function for the mouse position
		// And the toggleAttractedRepulsed() function is called in the mousePressed() callback

		/* Update physics (fixed update) */
		if (fixedUpdateAccum >= fixedDeltaTime) {
			// Update attractor
			attractor.updatePositionFromScreen(p5, mergedProps.pixelsPerMeter);
			// Update particles
			particleArray.forEach(particle => {
				particle.update(p5, attractor, fixedDeltaTime, mergedProps.gravitationalConstant);
				particle.moveObjectOutOfScreen(p5, mergedProps.pixelsPerMeter);
			});
			fixedUpdateAccum = 0;
		}

		/* Update canvas */
		// Clear canvas
		screenBuffer.background(mergedProps.backColor[0], mergedProps.backColor[1], mergedProps.backColor[2], mergedProps.backColor[3]);

		// Draw objects
		attractor.show(screenBuffer, mergedProps.pixelsPerMeter);
		particleArray.forEach(particle => {
			particle.show(screenBuffer, mergedProps.pixelsPerMeter);
		});

		// Swap buffers
		p5.image(screenBuffer, 0, 0);
	};

	// Sketch window resize
	const windowResized = (p5: p5Types) => {
		p5.resizeCanvas(mergedProps.parentRef.current!.clientWidth, mergedProps.parentRef.current!.clientHeight);
		screenBuffer.resizeCanvas(mergedProps.parentRef.current!.clientWidth, mergedProps.parentRef.current!.clientHeight);
	};

	return (
		<Sketch setup={setup} draw={draw} windowResized={windowResized}/>
	);
};

export default ParticleSimulator;

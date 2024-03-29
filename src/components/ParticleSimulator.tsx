import React from 'react';
import Sketch from 'react-p5';
import type p5Types from 'p5';
import {isMobile} from 'react-device-detect';
import Attractor from '../classes/Attractor';
import Particle from '../classes/Particle';
import {PARTICLES_COUNT_COMPUTER, PARTICLES_COUNT_MOBILE} from '../constants/constant-particle-simulator';

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
	spawnAreaRadius: 1,
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

	const forceDivCanvasHolderAndCanvasSttyle = (canvas: p5Types.Element, canvasParentRef: Element) => {
		// Set up canvas holder styles manually
		canvasParentRef.setAttribute('style', 'overflow: hidden; width: 100%; height: 100%;');
		// Set up canvas styles manually
		canvas.attribute('style', 'overflow: hidden; width: 100%; height: 100%;');
	};

	// Sketch setup
	const setup = (p5: p5Types, canvasParentRef: Element) => {
		// Create canvas
		const canvas = p5.createCanvas(mergedProps.parentRef.current!.clientWidth, mergedProps.parentRef.current!.clientHeight, p5.P2D)
			.parent(canvasParentRef);

		// Force the style and class of the p5 library elements
		forceDivCanvasHolderAndCanvasSttyle(canvas, canvasParentRef);

		// Create graphics
		screenBuffer = p5.createGraphics(mergedProps.parentRef.current!.clientWidth, mergedProps.parentRef.current!.clientHeight, p5.P2D);

		// Set frame rate to 60
		p5.frameRate(mergedProps.frameRate);

		// Set up init mouse position
		p5.mouseX = p5.width / 2;
		p5.mouseY = p5.height / 2;

		// Create attractor
		attractor = new Attractor(p5, mergedProps.attractorMass, mergedProps.pixelsPerMeter);

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
			const posX = ((p5.width / 2) / mergedProps.pixelsPerMeter)
                + (mergedProps.spawnAreaRadius * Math.cos(randomAngle1) * Math.sin(randomAngle2));
			const posY = ((p5.height / 2) / mergedProps.pixelsPerMeter)
                + (mergedProps.spawnAreaRadius * Math.sin(randomAngle1) * Math.sin(randomAngle2));
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

		/* Update physics (fixed update) */
		fixedUpdateAccum += deltaTime;
		while (fixedUpdateAccum >= fixedDeltaTime) {
			// Update attractor
			attractor.updatePositionFromScreen(p5, mergedProps.pixelsPerMeter);
			// Update particles
			// eslint-disable-next-line @typescript-eslint/no-loop-func
			particleArray.forEach(particle => {
				particle.update(p5, attractor, fixedDeltaTime, mergedProps.gravitationalConstant);
				particle.clampToScreen(p5, mergedProps.pixelsPerMeter);
			});
			fixedUpdateAccum -= fixedDeltaTime;
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

		// Update previous time
		previousTime = currentTime;
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

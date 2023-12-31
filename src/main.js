import * as THREE from 'three';

import dat from "https://cdn.skypack.dev/dat.gui";
import Stats from 'three/addons/libs/stats.module.js';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

let scene, renderer, stats;
let perspectiveCamera, orthographicCamera, automaticCamera, controls, sound, volume;

let earth, water, moon;
let lightWorld, intensityWorld, lightMoon, intensityMoon, lightSun, intensitySun;
let posiX, posiY, posiZ;

let vertices = [],  indices = [], uvs = [];
let widthSegms = 64.0, heightSegms = 32.0, radiusMoon = 4.5;
let thetaMoon, phiMoon;

let theta = 0.1, radiusOrbitMoon = 45.0;
let moonMov = true;
let moonVelX = 0.0, moonVelY = 0.0;
let force, moonOrbitX = 0.0, moonOrbitY = 0.0;

const params = {
	orthographicCamera: false,
	automaticCamera: false,
	force: 1,
	intensityWorld: 0.1,
	intensitySun: 6,
	intensityMoon: 0.5,
	volume: 0.2
};

const frustumSize = 400;		//Região de visualização tridimensional que a câmera captura e exibe na tela

function init() {

	/*** Creating world ***/
	scene = new THREE.Scene();

	const starGeometry = new THREE.SphereGeometry(0.5, 32, 32);
	const starMaterial = new THREE.MeshPhongMaterial({
		color: 0xfffff0,
		emissive: 0xffffff,
		emissiveIntensity: 0.5
	});

	const size = 3000;
	
	for ( let i = 0; i < 4500; i ++ ) {
		const star = new THREE.Mesh( starGeometry, starMaterial );

		do{
			star.position.x = (Math.random() * size + Math.random() * size) / 2 - size / 1.6;
			star.position.y = (Math.random() * size + Math.random() * size) / 2 - size / 1.6;
			star.position.z = (Math.random() * size + Math.random() * size) / 2 - size / 1.6;
	
			posiX = star.position.x;
			posiY = star.position.y;
			posiZ = star.position.x;

		} while(!(posiX < -100 || posiX > 100) && !(posiY < -100 || posiY > 100) && !(posiZ < -100 || posiZ > 100))

		star.updateMatrix();
		star.matrixAutoUpdate = false;
	
		scene.add( star );
	}

	/*** Creating and positioning the cameras***/
	const aspect = window.innerWidth / window.innerHeight;

	perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
	perspectiveCamera.position.z = 200;

	orthographicCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
	orthographicCamera.position.z = 200;

	/*** Loading ambient sound ***/
	const listener = new THREE.AudioListener();
	orthographicCamera.add(listener)
	perspectiveCamera.add(listener);

	sound = new THREE.Audio(listener);
	const audioLoader = new THREE.AudioLoader();
	audioLoader.load('sounds/ocean.m4a', function (buffer) {
		sound.setBuffer(buffer);
		sound.setLoop(true);
		sound.setVolume(0.2);
		sound.play();
	});

	/*** Loading earth model with relief ***/
	const loader = new GLTFLoader();

	loader.load('models/planet_material.glb', function (gltf) {
		earth = gltf.scene;
		
		earth.traverse( function ( node ) {
			if ( node.isMesh ){
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});

		scene.add(earth);

	}, undefined, function (error) {
		console.error(error);
	});

	/*** Loading moon texture ***/
	const textureMoon = new THREE.TextureLoader().load("textures/moon.jpeg");
	textureMoon.wrapS = THREE.RepeatWrapping;
	textureMoon.wrapT = THREE.RepeatWrapping;
	textureMoon.repeat.set(1, 1);

	/*** Creating moon ***/
	for (let i = 0; i <= heightSegms; i++) {
		thetaMoon = (i * Math.PI) / heightSegms;
	
		for (var j = 0; j <= widthSegms; j++) {
			phiMoon = (j * 2 * Math.PI) / widthSegms;

			let uMoon = j / widthSegms;
			let vMoon = i / heightSegms;
			uvs.push(uMoon, vMoon);

			let xMoon = radiusMoon * Math.sin(thetaMoon) * Math.cos(phiMoon) ;
			let yMoon = radiusMoon * Math.cos(thetaMoon);
			let zMoon = radiusMoon * Math.sin(thetaMoon) * Math.sin(phiMoon);
	
			vertices.push(xMoon, yMoon, zMoon);
	
			if (i < heightSegms && j < widthSegms) {
				let base = i * (widthSegms + 1) + j;

				let topLeft = base;
				let topRight = base + 1;
				let bottomLeft = base + widthSegms + 1;
				let bottomRight = base + widthSegms + 2;
	
				indices.push(topLeft, bottomLeft, topRight);
				indices.push(topRight, bottomLeft, bottomRight);
			}
		}
	}

	let positionAttribute = new THREE.Float32BufferAttribute(vertices, 3);
	let indexAttribute = new THREE.Uint32BufferAttribute(indices, 1);
	let uvAttribute = new THREE.Float32BufferAttribute(uvs, 2);

	const moonGeometry = new THREE.BufferGeometry();
	const moonMaterial = new THREE.MeshBasicMaterial({ map: textureMoon });
	
	moonGeometry.setAttribute('position', positionAttribute);
	moonGeometry.setIndex(indexAttribute);
	moonGeometry.setAttribute('uv', uvAttribute);

	moon = new THREE.Mesh(moonGeometry, moonMaterial);
	moon.castShadow = true;
	scene.add(moon);

	/*
	// const moonGeometry = new THREE.SphereGeometry(4.5, 50, 50);
	// const moonMaterial = new THREE.MeshBasicMaterial({ map: textureMoon });
	// moon = new THREE.Mesh(moonGeometry, moonMaterial);
	// moon.castShadow = true;
	// scene.add(moon); /**/

	/*** Creating water ***/
	const textureLoader = new THREE.TextureLoader();

	const waterBaseColor = textureLoader.load("./textures/water/Water_002_COLOR.jpg");
	const waterNormalMap = textureLoader.load("./textures/water/Water_002_NORM.jpg");
	const waterHeightMap = textureLoader.load("./textures/water/Water_002_DISP.png");
	const waterRoughness = textureLoader.load("./textures/water/Water_002_ROUGH.jpg");
	const waterAmbientOcclusion = textureLoader.load("./textures/water/Water_002_OCC.jpg");

	const waterGeometry = new THREE.SphereGeometry(30.5, 60, 60);
	const waterMaterial = new THREE.MeshStandardMaterial({
		map: waterBaseColor,
		normalMap: waterNormalMap,
		displacementMap: waterHeightMap, displacementScale: 0.05,
		roughnessMap: waterRoughness, roughness: 0,
		aoMap: waterAmbientOcclusion,
	});
	water = new THREE.Mesh(waterGeometry, waterMaterial);
	water.receiveShadow = true;
	scene.add(water);

	/*** Creating the lights ***/
	lightWorld = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.1 );
	lightWorld.position.set( 0, 0, 0 );
	scene.add(lightWorld);

	lightMoon = new THREE.DirectionalLight( 0xffffff, 0.5 );
	lightMoon.position.set( 0, 0, 0 );
	scene.add(lightMoon);

	lightSun = new THREE.DirectionalLight( 0xFC5404, 6 );
	lightSun.position.set( 0, 500, 0 )

	/*** Resizing the shadow radius ***/
	lightSun.shadow.camera.left = 30;
	lightSun.shadow.camera.right = -30;
	lightSun.shadow.camera.top = 30;
	lightSun.shadow.camera.bottom = -30;

	/*** Casting shadow ***/
	lightSun.castShadow = true;
	scene.add(lightSun)

	/*** Renderer ***/
	renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias suaviza as bordas da figuras 3D
	renderer.setClearColor(0x000000);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	document.body.appendChild(renderer.domElement);

	/*** View performance statistics ***/
	stats = new Stats();
	document.body.appendChild(stats.dom);

	/*** Creating GUI interface ***/
	const gui = new dat.GUI();

	let camera = gui.addFolder("Camera");
	camera
		.add(params, 'orthographicCamera')
		.name('Orthographic')
		.onChange(function (value) {
			controls.dispose();
			createControls(value ? orthographicCamera : perspectiveCamera);
		});
	camera
		.add(params, 'automaticCamera')
		.name('Automatic')
		.onChange(function (value) {
			params.automaticCamera = value;
		});

	let soundtrack = gui.addFolder("SoundTrack");
	soundtrack
		.add(params, 'volume', 0.1, 3.0, 0.1)
		.name('Volume')
		.onChange(function (value) {
			params.volume = value;
		});

	let tidal = gui.addFolder("Tidal");
	tidal
		.add(params, 'force', 0.1, 2.5, 0.1)
		.name('Force')
		.onChange(function (value) {
			params.force = value;
		});

	let lighting = gui.addFolder("Lighting Intensity");
	lighting
		.add(params, 'intensityWorld', 0.1, 2, 0.1)
		.name('World')
		.onChange(function (value) {
			params.intensityWorld = value;
		});
	lighting
		.add(params, 'intensityMoon', 0.1, 2, 0.1)
		.name('Moon')
		.onChange(function (value) {
			params.intensityMoon = value;
		});

	lighting
		.add(params, 'intensitySun', 1, 20, 1)
		.name('Sun')
		.onChange(function (value) {
			params.intensitySun = value;
		});
	

	window.addEventListener('resize', onWindowResize);
	createControls(perspectiveCamera);
}

/*** Creating camera controls ***/
function createControls(camera) {
	controls = new TrackballControls(camera, renderer.domElement);

	controls.rotateSpeed = 2.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 1.8;
}

/*** Page responsiveness ***/
function onWindowResize() {
	const aspect = window.innerWidth / window.innerHeight;

	perspectiveCamera.aspect = aspect;
	perspectiveCamera.updateProjectionMatrix();

	orthographicCamera.left = - frustumSize * aspect / 2;
	orthographicCamera.right = frustumSize * aspect / 2;
	orthographicCamera.top = frustumSize / 2;
	orthographicCamera.bottom = - frustumSize / 2;
	orthographicCamera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

	controls.handleResize();
}

function animate() {
	requestAnimationFrame(animate);		// Realizar animações de maneira mais eficiente;

	controls.update();					// Atualizar os controles de câmera
	stats.update();						// Atualiza os dados do desempenho (fps)

	theta += 0.005;

	lightWorld.intensity = params.intensityWorld;
	lightMoon.intensity = params.intensityMoon;
	lightSun.intensity = params.intensitySun;

	if(sound != null){
		sound.setVolume(params.volume);
	}

	if (earth != null) {
		earth.rotation.y += 0.0005;
	}

	if (water != null & moonMov) {
		water.position.x = params.force * Math.sin(moonOrbitX) * Math.sin(moonOrbitY);
		water.position.y = params.force * Math.cos(moonOrbitX)
		water.position.z = params.force * Math.sin(moonOrbitX) * Math.cos(moonOrbitY);
		water.rotation.y -= 0.0040;
	}

	if (moon != null) {
		moon.rotation.x += 0.005;

		if (moonMov) {
			moonOrbitX += 1.4 * moonVelX;
			moonOrbitY += 1.4 * moonVelY;

			moon.position.x = radiusOrbitMoon * Math.sin(moonOrbitX) * Math.sin(moonOrbitY);
			moon.position.y = radiusOrbitMoon * Math.cos(moonOrbitX)
			moon.position.z = radiusOrbitMoon * Math.sin(moonOrbitX) * Math.cos(moonOrbitY);

			lightMoon.position.x = moon.position.x;
			lightMoon.position.y = moon.position.y;
			lightMoon.position.z = moon.position.z;
		}
	}

	render();
}

function render() {
	const camera = (params.orthographicCamera) ? orthographicCamera : perspectiveCamera;

	if(params.automaticCamera == true){
		camera.position.x = 1.6 * 180 * Math.sin(theta);
		camera.position.y = 1.9 * 150 * Math.sin(theta) * Math.cos(theta);
		camera.position.z = 60 * Math.cos(theta);

		moonVelX = -2 * Math.PI / 1300;
	}

	renderer.render(scene, camera);
}

document.onkeydown = function (e) {
	if (e.key == "ArrowUp") {
		moonVelX = -2 * Math.PI / 1000;
	}

	if (e.key == "ArrowDown") {
		moonVelX = 2 * Math.PI / 1000;
	}

	if (e.key == "ArrowLeft") {
		moonVelY = -2 * Math.PI / 1000;
	}

	if (e.key == "ArrowRight") {
		moonVelY = 2 * Math.PI / 1000;
	}

	if (e.key == " ") {
		moonMov = false;
	}

}

document.onkeyup = function (e) {
	console.log(e);
	if (e.key == "ArrowUp" || e.key == "ArrowDown") {
		moonVelX += 0.0;
	}

	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		moonVelY += 0.0;
	}

	if (e.key == " ") {
		moonMov = true;
	}
}

init();
animate();

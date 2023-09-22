import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

let scene, renderer, stats;
let perspectiveCamera, orthographicCamera, controls;

let earth, water, moon;
let lightWorld, lightMoon;

let radius = 40;
let moonMov = true;
let moonVelX = 0.0, moonVelY = 0.0;
let moonOrbitX = 0.0, moonOrbitY = 0.0;

const params = {
	orthographicCamera: false
};

const frustumSize = 400;

function init() {
	/*** Creating world ***/
	scene = new THREE.Scene();

	/*** Creating and positioning the cameras***/
	const aspect = window.innerWidth / window.innerHeight;

	perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
	perspectiveCamera.position.z = 200;

	orthographicCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
	orthographicCamera.position.z = 200;

	/*** Loading backgroung ***/
	const backGround = new THREE.TextureLoader();
	backGround.load('https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg', function(texture) {
		texture.minFilter = THREE.LinearFilter;
		texture.magFilter = THREE.LinearFilter;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		scene.background = texture;  
	});

	/*** Loading ambient sound ***/
	const listener = new THREE.AudioListener();
	perspectiveCamera.add(listener);
	orthographicCamera.add(listener)

	const sound = new THREE.Audio(listener);
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
		scene.add(earth);
	
	}, undefined, function (error) {
		console.error(error);
	});

	/*** Loading water texture ***/
	// const texture_water = new THREE.TextureLoader().load( "models/water.jpg" );
	// texture_water.wrapS = THREE.RepeatWrapping;
	// texture_water.wrapT = THREE.RepeatWrapping;
	// texture_water.repeat.set( 1, 1);

	/*** Loading moon texture ***/
	const textureMoon = new THREE.TextureLoader().load("textures/moon.jpeg");
	textureMoon.wrapS = THREE.RepeatWrapping;
	textureMoon.wrapT = THREE.RepeatWrapping;
	textureMoon.repeat.set(1, 1);

	/*** Creating water ***/
	const waterGeometry = new THREE.SphereGeometry(30.5, 60, 60);
	const waterMaterial = new THREE.MeshBasicMaterial({ color: 0x0000f0 });
	water = new THREE.Mesh(waterGeometry, waterMaterial);
	scene.add(water);

	/*** Creating moon ***/
	const moonGeometry = new THREE.SphereGeometry(3.5, 50, 50);
	const moonMaterial = new THREE.MeshBasicMaterial({ map: textureMoon });
	moon = new THREE.Mesh(moonGeometry, moonMaterial);
	moon.position.set(60, 0, 0)
	scene.add(moon);

	/*** Creating the lights ***/
	// lightWorld = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.05);
	// lightWorld.position.set(0, 0, 0);
	// scene.add(lightWorld);

	lightMoon = new THREE.DirectionalLight(0xffffff, 0.5);
	lightMoon.position.set(0, 0, 0);
	scene.add(lightMoon);

	/*** Renderer ***/
	renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias suaviza as bordas da figuras 3D
	renderer.setClearColor(0x000000);		
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	/*** View performance statistics ***/
	stats = new Stats();
	document.body.appendChild(stats.dom);

	/*** Creating GUI interface ***/
	const gui = new GUI();
	gui.add(params, 'orthographicCamera').name('use orthographic').onChange(function (value) {
		controls.dispose();
		createControls(value ? orthographicCamera : perspectiveCamera);

	});

	window.addEventListener('resize', onWindowResize);
	createControls(perspectiveCamera);
}

function createControls(camera) {
	controls = new TrackballControls(camera, renderer.domElement);

	controls.rotateSpeed = 2.0;
	controls.zoomSpeed = 1.2;
	controls.panSpeed = 1.8;
	
	controls.keys = ['KeyA', 'KeyS', 'KeyD'];
}

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

	controls.update();
	stats.update();						// Atualiza os dados do desempenho (fps)

	if (earth != null) {
		earth.rotation.y += 0.0005;
	}

	if (water != null & moonMov) {
		water.position.x = 0.5 * Math.sin(moonOrbitX) * Math.sin(moonOrbitY);
		water.position.y = 0.5 * Math.cos(moonOrbitX)
		water.position.z = 0.5 * Math.sin(moonOrbitX) * Math.cos(moonOrbitY);
	}

	if (moon != null) {
		moon.rotation.x += 0.005;

		if (moonMov) {
			moonOrbitX += 1.4 * moonVelX;
			moonOrbitY += 1.4 * moonVelY;

			moon.position.x = radius * Math.sin(moonOrbitX) * Math.sin(moonOrbitY);
			moon.position.y = radius * Math.cos(moonOrbitX)
			moon.position.z = radius * Math.sin(moonOrbitX) * Math.cos(moonOrbitY);

			lightMoon.position.x = moon.position.x;
			lightMoon.position.y = moon.position.y;
			lightMoon.position.z = moon.position.z;
		}
	}

	render();
}

function render() {
	const camera = (params.orthographicCamera) ? orthographicCamera : perspectiveCamera;
	renderer.render(scene, camera);
}

document.onkeydown = function (e) {
	if (e.key == "ArrowUp") {
		moonVelX = -2 * Math.PI / 1000;
		//moonVelY = 0;
	}

	if (e.key == "ArrowDown") {
		moonVelX = 2 * Math.PI / 1000;
		//moonVelY = 0; 
	}

	if (e.key == "ArrowLeft") {
		moonVelY = -2 * Math.PI / 1000;
		//moonVelX = 0;
	}

	if (e.key == "ArrowRight") {
		moonVelY = 2 * Math.PI / 1000;
		//moonVelX = 0;
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

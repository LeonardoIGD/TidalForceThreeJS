import * as THREE from 'three';

import Stats from 'three/addons/libs/stats.module.js';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

let scene, renderer, stats;
let perspectiveCamera, orthographicCamera, controls;

let earth, water, moon;
let light_world, light_moon;

let radius = 40;
let moon_mov = true;
let moon_vel_x = 0.0, moon_vel_y = 0.0;
let moon_orbit_x = 0.0, moon_orbit_y = 0.0;

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
	//const backGround = new THREE.TextureLoader();
	//scene.background = backGround.load('textures/galaxy.jpg',);

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
	const texture_moon = new THREE.TextureLoader().load("textures/moon.jpeg");
	texture_moon.wrapS = THREE.RepeatWrapping;
	texture_moon.wrapT = THREE.RepeatWrapping;
	texture_moon.repeat.set(1, 1);

	/*** Creating water ***/
	const water_geometry = new THREE.SphereGeometry(30.5, 60, 60);
	const water_material = new THREE.MeshBasicMaterial({ color: 0x0000f0 });
	water = new THREE.Mesh(water_geometry, water_material);
	scene.add(water);

	/*** Creating moon ***/
	const moon_geometry = new THREE.SphereGeometry(3.5, 50, 50);
	const moon_material = new THREE.MeshBasicMaterial({ map: texture_moon });
	moon = new THREE.Mesh(moon_geometry, moon_material);
	moon.position.set(60, 0, 0)
	scene.add(moon);

	/*** Creating the lights ***/
	light_world = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.2);
	light_world.position.set(0, 0, 0);
	scene.add(light_world);

	light_moon = new THREE.DirectionalLight(0xffffff, 0.1);
	light_moon.position.set(0, 0, 0);
	scene.add(light_world);

	/*** Renderer ***/
	renderer = new THREE.WebGLRenderer({ antialias: true });		// antialias suaviza as bordas da figuras 3D

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

	if (water != null & moon_mov) {
		water.position.x = 0.5 * Math.sin(moon_orbit_x) * Math.sin(moon_orbit_y);
		water.position.y = 0.5 * Math.cos(moon_orbit_x)
		water.position.z = 0.5 * Math.sin(moon_orbit_x) * Math.cos(moon_orbit_y);
	}

	if (moon != null) {
		moon.rotation.x += 0.005;

		if (moon_mov) {
			moon_orbit_x += 1.4 * moon_vel_x;
			moon_orbit_y += 1.4 * moon_vel_y;

			moon.position.x = radius * Math.sin(moon_orbit_x) * Math.sin(moon_orbit_y);
			moon.position.y = radius * Math.cos(moon_orbit_x)
			moon.position.z = radius * Math.sin(moon_orbit_x) * Math.cos(moon_orbit_y);

			light_moon.position.x = moon.position.x;
			light_moon.position.y = moon.position.y;
			light_moon.position.z = moon.position.z;
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
		moon_vel_x = -2 * Math.PI / 1000;
		moon_vel_y = 0;
	}

	if (e.key == "ArrowDown") {
		moon_vel_x = 2 * Math.PI / 1000;
		moon_vel_y = 0; 
	}

	if (e.key == "ArrowLeft") {
		moon_vel_y = -2 * Math.PI / 1000;
		moon_vel_x = 0;
	}

	if (e.key == "ArrowRight") {
		moon_vel_y = 2 * Math.PI / 1000;
		moon_vel_x = 0;
	}

	if (e.key == " ") {
		moon_mov = false;
	}

}

document.onkeyup = function (e) {
	console.log(e);
	if (e.key == "ArrowUp" || e.key == "ArrowDown") {
		moon_vel_x += 0.0;
	}

	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		moon_vel_y += 0.0;
	}

	if (e.key == " ") {
		moon_mov = true;
	}
}

init();
animate();

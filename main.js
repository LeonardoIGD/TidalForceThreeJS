<<<<<<< HEAD
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// const scene = new THREE.Scene();
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// var earth;

// const loader = new GLTFLoader();

// loader.load('models/planet_material.glb', function (gltf) {
// 	earth = gltf.scene;
// 	scene.add(earth);

// }, undefined, function (error) {
// 	console.error(error);
// });

// const listener = new THREE.AudioListener();
// camera.add(listener);

// const sound = new THREE.Audio(listener); // inserção do audio
// const audioLoader = new THREE.AudioLoader();
// audioLoader.load('sounds/ocean.m4a', function (buffer) {
// 	sound.setBuffer(buffer);
// 	sound.setLoop(true);
// 	sound.setVolume(0.2);
// 	sound.play();
// });

// // const texture_water = new THREE.TextureLoader().load( "models/water.jpg" );
// // texture_water.wrapS = THREE.RepeatWrapping;
// // texture_water.wrapT = THREE.RepeatWrapping;
// // texture_water.repeat.set( 1, 1);

// const texture_moon = new THREE.TextureLoader().load("textures/moon.jpeg");
// texture_moon.wrapS = THREE.RepeatWrapping;
// texture_moon.wrapT = THREE.RepeatWrapping;
// texture_moon.repeat.set(1, 1);

// const moon_geometry = new THREE.SphereGeometry(3.5, 50, 50);
// const moon_material = new THREE.MeshBasicMaterial({ map: texture_moon });
// const moon = new THREE.Mesh(moon_geometry, moon_material);

// const water_geometry = new THREE.SphereGeometry(30.5, 60, 60);
// const water_material = new THREE.MeshBasicMaterial({ color: 0x0000f0 });
// const water = new THREE.Mesh(water_geometry, water_material);

// const light_world = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.05);
// light_world.position.set(0, 0, 0);

// const light_moon = new THREE.DirectionalLight(0xffffff, 0.5);
// light_moon.position.set(0, 0, 0);

// moon.position.set(60, 0, 0)
// camera.position.z = 80;

// scene.add(moon)
// scene.add(water);
// scene.add(light_world);
// scene.add(light_moon);

// var radius = 40;
// var moon_mov = true;
// var moon_vel_x = 0.0, moon_vel_y = 0.0;
// var moon_orbit_x = 0.0, moon_orbit_y = 0.0;

// function animate() {
// 	requestAnimationFrame(animate);

	// if (earth != null) {
	// 	earth.rotation.y += 0.0005;
	// }

// 	if (water != null & moon_mov) {
// 		water.position.x = 0.5 * Math.sin(moon_orbit_x) * Math.sin(moon_orbit_y);
// 		water.position.y = 0.5 * Math.cos(moon_orbit_x)
// 		water.position.z = 0.5 * Math.sin(moon_orbit_x) * Math.cos(moon_orbit_y);
// 	}

// 	if (moon != null) {
// 		moon.rotation.x += 0.009;

// 		if (moon_mov) {
// 			moon_orbit_x += 1.4 * moon_vel_x;
// 			moon_orbit_y += 1.4 * moon_vel_y;

// 			moon.position.x = radius * Math.sin(moon_orbit_x) * Math.sin(moon_orbit_y);
// 			moon.position.y = radius * Math.cos(moon_orbit_x)
// 			moon.position.z = radius * Math.sin(moon_orbit_x) * Math.cos(moon_orbit_y);

// 			light_moon.position.x = moon.position.x;
// 			light_moon.position.y = moon.position.y;
// 			light_moon.position.z = moon.position.z;
// 		}
// 	}

// 	renderer.render(scene, camera);
// }

// document.onkeydown = function (e) {
// 	console.log(e.key);
// 	if (e.key == "ArrowUp") {
// 		moon_vel_x = -2 * Math.PI / 1000;
// 	}

// 	if (e.key == "ArrowDown") {
// 		moon_vel_x = 2 * Math.PI / 1000;
// 	}

// 	if (e.key == "ArrowLeft") {
// 		moon_vel_y = -2 * Math.PI / 1000;
// 	}

// 	if (e.key == "ArrowRight") {
// 		moon_vel_y = 2 * Math.PI / 1000;
// 	}

// 	if (e.key == " ") {
// 		moon_mov = false;
// 	}

// }

// document.onkeyup = function (e) {
// 	console.log(e);
// 	if (e.key == "ArrowUp" || e.key == "ArrowDown") {
// 		moon_vel_x += 0.0;
// 	}

// 	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
// 		moon_vel_y += 0.0;
// 	}

// 	if (e.key == " ") {
// 		moon_mov = true;
// 	}
// }

// animate();

import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import Stats from 'three/addons/libs/stats.module.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { TrackballControls } from 'three/addons/controls/TrackballControls.js';

let perspectiveCamera, orthographicCamera, controls, scene, renderer, stats;
var earth;
const params = {
	orthographicCamera: false
};

const frustumSize = 400;

init();
animate();

function init() {

	const aspect = window.innerWidth / window.innerHeight;

	perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 1000);
	perspectiveCamera.position.z = 500;

	orthographicCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
	orthographicCamera.position.z = 500;

	// world

	scene = new THREE.Scene();
	const backGround = new THREE.TextureLoader();
	scene.background = backGround.load('models/teste3.jpg',);

	const light_world = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.35);
	light_world.position.set(0, 0, 0);
	scene.add(light_world);


	const loader = new GLTFLoader();

	loader.load('models/planet_material.glb', function (gltf) {
		earth = gltf.scene;
		scene.add(earth);

	}, undefined, function (error) {
		console.error(error);
	});


	// renderer

	renderer = new THREE.WebGLRenderer({ antialias: true });

	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	stats = new Stats();
	document.body.appendChild(stats.dom);

	//

	const gui = new GUI();
	gui.add(params, 'orthographicCamera').name('use orthographic').onChange(function (value) {

		controls.dispose();

		createControls(value ? orthographicCamera : perspectiveCamera);

	});

	//

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

	requestAnimationFrame(animate);

	controls.update();

	stats.update();

	if (earth != null) {
		earth.rotation.y += 0.0015;
	}

	render();

}

function render() {
	const camera = (params.orthographicCamera) ? orthographicCamera : perspectiveCamera;

	renderer.render(scene, camera);

}
=======
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var earth;

const loader = new GLTFLoader();

loader.load( 'models/planet_material.glb', function ( gltf ){
    earth = gltf.scene;
	scene.add( earth );

}, undefined, function ( error ){
	console.error( error );
} );

// const texture_water = new THREE.TextureLoader().load( "textures/teste.jpg" );
// texture_water.wrapS = THREE.RepeatWrapping;
// texture_water.wrapT = THREE.RepeatWrapping;
// texture_water.repeat.set( 1, 1);

const texture_moon = new THREE.TextureLoader().load( "textures/moon.jpeg" );
texture_moon.wrapS = THREE.RepeatWrapping;
texture_moon.wrapT = THREE.RepeatWrapping;
texture_moon.repeat.set( 1, 1);

const moon_geometry = new THREE.SphereGeometry( 3.5, 50, 50 );
const moon_material = new THREE.MeshBasicMaterial( { map: texture_moon } );
const moon = new THREE.Mesh( moon_geometry, moon_material );

const water_geometry = new THREE.SphereGeometry( 30.5, 60, 60 );
const water_material = new THREE.MeshBasicMaterial( { color: 0x0000f0 } );
const water = new THREE.Mesh( water_geometry, water_material );

const light_world = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.05 );
light_world.position.set( 0, 0, 0 );

const light_moon = new THREE.DirectionalLight( 0xffffff, 0.5 );
light_moon.position.set( 0, 0, 0 );

moon.position.set( 60, 0, 0 )
camera.position.z = 80;

scene.add( moon )
scene.add( water );
scene.add( light_world );
scene.add( light_moon );

var radius = 40;
var moon_mov = true;
var moon_vel_x = 0.0, moon_vel_y = 0.0;
var moon_orbit_x = 0.0, moon_orbit_y = 0.0;

function animate() {
	requestAnimationFrame( animate );

	if(earth != null){
		earth.rotation.y += 0.0005;
	}

	if(water != null & moon_mov){
		water.position.x = 0.5 * Math.sin(moon_orbit_x) * Math.sin(moon_orbit_y);
		water.position.y = 0.5 * Math.cos(moon_orbit_x)
		water.position.z = 0.5 * Math.sin(moon_orbit_x) * Math.cos(moon_orbit_y);
	}

	if(moon != null){
		moon.rotation.x += 0.009;
		
		if(moon_mov){
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

	renderer.render( scene, camera );
}

document.onkeydown = function(e) {
	console.log(e.key);
    if(e.key == "ArrowUp") {
		moon_vel_x = -2 * Math.PI / 1000;
	}

	if(e.key == "ArrowDown") {
		moon_vel_x =  2 * Math.PI / 1000;
	}

	if(e.key == "ArrowLeft") {
		moon_vel_y = -2 * Math.PI / 1000;
	}

	if(e.key == "ArrowRight") {
		moon_vel_y =  2 * Math.PI / 1000;
	}

	if(e.key == " ") {
		moon_mov = false;
	}

}

document.onkeyup = function(e) {
	console.log(e);
	if(e.key == "ArrowUp" || e.key == "ArrowDown") {
		moon_vel_x += 0.0;
	}

	if(e.key == "ArrowLeft" || e.key == "ArrowRight") {
		moon_vel_y += 0.0;
	}

	if(e.key == " ") {
		moon_mov = true;
	}
}

animate();
>>>>>>> dc2c98eface599fa99e92d1e40d3bd08f2c7cba2

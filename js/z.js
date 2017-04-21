var THREE = require('three');
var TWEEN = require('tween.js');
var io = require('socket.io-client');
var atutil = require('atutil');

var socket;
var locationFull = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');

//GENERAL SETTINGS
var width = window.innerWidth;
var height = window.innerHeight;
var halfWidth = width / 2;
var halfHeight = height / 2;
//threejs stuff
var renderer, camera, scene;
var mesh;
//preload    
var loadedAssets = 0;
//weather color
var ColorA;
var ColorB;
//video
var frameLimit = 180;
var currentFrame = 0;

preload();
// preload
function preload() {
	if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
    socketInit();
    initWeather();
}
// assetLoaded
function assetLoaded() {
    ++loadedAssets;
    //attenzione perché se il valore max non è giusto, si chiama + volte la funzione start
    if (loadedAssets == 3) {
        allLoaded();
    }
}
// allLoaded
function allLoaded() {
    var spinner = document.getElementById('loading_spinner');
    spinner.style.opacity = 1.0;

    var outTween = new TWEEN.Tween( spinner.style )
        .to( { opacity: 0.1 }, 1500 )
        .easing( TWEEN.Easing.Quadratic.In )
        .onComplete(function () {
            spinner.style.display = "none";
        });
    outTween.start();
    start();
}
//start
function start() {
    setup();
    animate();
}
//initWeather
function initWeather() {
    var weather = require ('openweathermap');
    var Client = require('node-rest-client').Client;
    var config = require('./../config');
    var client = new Client();
    client.get(locationFull + "/getRandomCity", function (data, response) {
        weather.defaults({units: 'metric', lang: 'en', mode: 'json'});
        weather.now({id: data.cityID, APPID: config.openweathermap.APPID}, report);
        function report(err, json) {
            if(!err) {
                var weatherCode = json.weather[0].id;
                var weatherTemp = json.main.temp;
                var colors = weatherMapping.mapWeatherCode(weatherCode, weatherTemp);
                if(colors.colorA && colors.colorB) { 
                    ColorA = new THREE.Color(colors.colorA);
                    ColorB = new THREE.Color(colors.colorB);
                    socket.emit('weather', {    
                        description: json.weather[0].description,
                        temperature: weatherTemp,
                    });
                    createFragmentShaderScript(); 
                    assetLoaded();  
                }
            }
        }
    });
}
//createFragmentShaderScript
function createFragmentShaderScript() {
    var script = document.createElement('script');
    script.type = 'x-shader/x-fragment';
    script.id = 'fragmentShader';
    var randomFunc = randomShaderFunctions.randomFunction();
    var randomRedFunc = randomShaderFunctions.randomColorFunction("r");
    var randomGreenFunc = randomShaderFunctions.randomColorFunction("g");
    var randomBlueFunc = randomShaderFunctions.randomColorFunction("b");
    var colorOne = "vec3(" + ColorA.r + "," + ColorA.g + "," + ColorA.b + ")";
    var colorTwo = "vec3(" + ColorB.r + "," + ColorB.g + "," + ColorB.b + ")";
    script.text = [
        "#define PI 3.14159265359",
        "uniform vec2 u_resolution;",
        "uniform float u_time;",

        "void main(){",
            "vec3 colorA=" + colorOne + ";",
            "vec3 colorB=" + colorTwo + ";",
            "vec2 st=gl_FragCoord.xy/u_resolution.xy;",
            "vec3 color=vec3(.0);",
            "vec3 pct=vec3(" + randomFunc + ");",
            "pct.r=" + randomRedFunc + ";",
            "pct.g=" + randomGreenFunc + ";",
            "pct.b=" + randomBlueFunc + ";",
            "color=mix(colorA,colorB,pct);",
            "gl_FragColor=vec4(color,1.);",
        "}"
        ].join('\n');
    document.body.appendChild(script);
    socket.emit('shader', script.text);
    assetLoaded(); 
}
// setup
function setup() {
	var canvas = document.getElementById( "c" );
  	scene = new THREE.Scene();
  	camera = new THREE.OrthographicCamera( -halfWidth, halfWidth, halfHeight, -halfHeight, 0, 1 );
    camera.position.z = 1;

    var geometry = new THREE.PlaneBufferGeometry(2, 2);

    var uniforms = {
        u_time: { type: "f", value: 1.0 },
        u_resolution: { type: "v2", value: new THREE.Vector2() }
    };
    uniforms.u_resolution.value.x = width;
    uniforms.u_resolution.value.y = height;
    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent
    } );
    mesh = new THREE.Mesh( geometry, material );
    scene.add( mesh );

	renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( width , height );

    setTimeout( function(){ currentFrame=1 }, 100);

    onWindowResize();
    window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize( event ) {
    width = window.innerWidth;   
    height = window.innerHeight;
    halfWidth = window.innerWidth / 2;
	halfHeight = window.innerHeight / 2;
	camera.left = -halfWidth;
	camera.right = halfWidth;
	camera.top = halfHeight;
	camera.bottom = -halfHeight;
    camera.updateProjectionMatrix();
    mesh.material.uniforms.u_resolution.value.x = renderer.domElement.width;
    mesh.material.uniforms.u_resolution.value.y = renderer.domElement.height;
    renderer.setSize( width, height );
}

function animate() {
    requestAnimationFrame( animate );
    render();
    TWEEN.update();
}

function render() {
    renderer.render( scene, camera );
    mesh.material.uniforms.u_time.value += 0.05;
    renderFrame();
}

function renderFrame() {
    if(currentFrame >= 1 && currentFrame < frameLimit + 1) {
        if(currentFrame == 1){
            sendCover(); 
        }
        if(frameLimit != 1){
            sendFrame(); 
        }
        currentFrame++;
    }
}

function sendCover() {
    socket.emit('coverFrame',document.querySelector('canvas').toDataURL('image/jpeg', 1.0));
}

function sendFrame() {
    var currentFrameString = atutil.pad(currentFrame.toString(), 3);
    socket.emit('renderFrame', {    
        frame: currentFrameString,
        file: document.querySelector('canvas').toDataURL()
    });
}

function socketInit() {
    socket = io.connect(locationFull);
    socket.emit("frameLimit", frameLimit);
    socket.emit('bot', 'gradient');
    assetLoaded();
}

console.log("client is running");
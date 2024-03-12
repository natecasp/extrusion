import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { STLExporter } from 'three/addons/exporters/STLExporter.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
console.clear();
var sandbox = document.getElementById('sandbox');
let scene = new THREE.Scene();
let exporter;
let camera = new THREE.PerspectiveCamera(60, sandbox.offsetWidth / sandbox.offsetHeight, .1, 10000);
camera.position.set(-3, 5, 20).setLength(.75);
let orthoCamera = new THREE.OrthographicCamera(sandbox.offsetWidth/-2, sandbox.offsetWidth/2, sandbox.offsetHeight/2, sandbox.offsetHeight/-2, 1,1000);
orthoCamera.position.set(-3,5,20).setLength(.75);
orthoCamera.lookAt(new THREE.Vector3(0,0,0));
scene.add(orthoCamera);
let renderer = new THREE.WebGLRenderer({
  antialias: true,
  preserveDrawingBuffer: true
});
exporter = new STLExporter();
renderer.shadowMap.enabled = true;
renderer.setSize(sandbox.offsetWidth, sandbox.offsetHeight);
renderer.setClearColor(0xffffff, 0);
sandbox.appendChild(renderer.domElement);
window.addEventListener("resize", event => {
  camera.aspect = sandbox.offsetWidth / sandbox.offsetHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(sandbox.offsetWidth, sandbox.offsetHeight);
})

let controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.minDistance = .5;
controls.maxDistance = 4;
let light = new THREE.DirectionalLight(0xffffff, 2);
let light2 = new THREE.DirectionalLight(0xffffff, 1);
const amb = new THREE.AmbientLight( 0x404040 ); 
//scene.add( amb );
light2.position.setScalar(-1);
light.position.setScalar(1);
light.castShadow = true;
scene.add(light2);
scene.add(light, new THREE.AmbientLight(0xffffff, 2));
const gui = new GUI();
const params = {
      OD: 0.15,
      ID: 0.1,
      Length: 0.2,
      takeScreenshot: takeScreenshot,
      exportBinary: exportBinary
}

const folder = gui.addFolder( 'Export' );
const odController = folder.add( params, 'OD', .03, .5, .001).onChange( createShape );   
const idController = folder.add( params, 'ID', .02, .45, .001).onChange( createShape ); 
const lengthController = folder.add(params, 'Length', 0, 100, .2).onChange( createShape );
lengthController.hide();
idController.hide();
odController.hide();
const imageController = folder.add( params, 'takeScreenshot').name('Save as Image');
const stlController = folder.add( params, 'exportBinary').name('Save as STL');
folder.open();
const spheregeometry = new THREE.SphereGeometry( 15, 32, 16 );
const material = new THREE.MeshStandardMaterial({color: "#333", roughness: .8});
const sphere = new THREE.Mesh( spheregeometry, material ); 
sphere.material.side = THREE.BackSide;
sphere.receiveShadow = true;

const bg = new THREE.Object3D();

bg.name = "bg";
bg.add(sphere);
scene.add(bg);
function createShape(){

if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}
if((params.OD - params.ID) < 0) {
  var od = params.ID + tol;
  this.setValue(od);
} else {
  var od = params.OD;
}
if((params.ID - params.OD) > 0) {
  var id = params.OD - tol;
  this.setValue(id);
} else {
  var id = params.ID;
}
let shape = new THREE.Shape()
shape.absarc(0, 0, od, 0, Math.PI * 2);
shape.holes.push(new THREE.Path().absarc(0, 0, id, 0, Math.PI * 2, false));
let g = new THREE.ExtrudeGeometry(shape, {steps: 1, bevelEnabled: false, bevelSegments:5, bevelSize: .001,bevelThickness:.001, depth: params.Length, curveSegments: 100});
let m = new THREE.MeshStandardMaterial({color: "#8ac1c3", roughness: .4});

var previous = scene.getObjectByName( "obj" );
if (previous != "") {
scene.remove(previous);
}
let o = new THREE.Mesh(g, m);
o.geometry.center();
o.material.shading = THREE.SmoothShading;


const obj = new THREE.Object3D();

obj.name = "obj";
obj.add(o);
scene.add(obj);

}

createShape(0.05);
let clock = new THREE.Clock();
$("#id-range").on('input', function() {
$("#id-2").val(Number(this.value).toFixed(3));
var od = Number($("#od-range").val());
if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}
if(Number(this.value) >= (od - tol)) {

var expandedOD = Number(this.value) + tol;
odController.setValue(expandedOD);
$("#od-range").val(expandedOD.toFixed(3));
$("#od-3").val(expandedOD.toFixed(3));
}

idController.setValue(Number(this.value));
});

$("#id-2").on('change', function() {
$("#id-range").val(Number(this.value).toFixed(3));

var od = Number($("#od-range").val());
if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}
if(Number(this.value) >= (od - tol)) {
var expandedOD = Number(this.value) + tol;
odController.setValue(expandedOD);
$("#od-range").val(expandedOD.toFixed(3));
$("#od-3").val(expandedOD.toFixed(3));
}

idController.setValue(Number(this.value));
});
$("#od-range").on('input', function() {
$("#od-3").val(Number(this.value).toFixed(3));

var id = Number($("#id-range").val());
if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}

if(Number(this.value) < (id + tol)) {
var expandedID = Number(this.value) - tol;
idController.setValue(expandedID);
$("#id-range").val(expandedID.toFixed(3));
 $("#id-2").val(expandedID.toFixed(3));
}
odController.setValue(Number(this.value));
});

$("#od-3").on('change', function() {
var id = Number($("#id-range").val()).toFixed(3);
if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}
if(Number(this.value) <= (id + tol)) {
var expandedID = Number(this.value) - tol;

idController.setValue(expandedID);
 
$("#id-range").val(expandedID.toFixed(3));
$("#id-2").val(expandedID.toFixed(3));
}
  
odController.setValue(Number(this.value));

$("#od-range").val(Number(this.value).toFixed(3));
});

$("#len-range").on('input', function() {
$("#length-2").val(this.value);
});

$("#length-2").on('change', function() {
$("#len-range").val(this.value);
});

renderer.setAnimationLoop((_) => {
let t = clock.getElapsedTime();
var obj = scene.getObjectByName( "obj" );
scene.rotation.y += 0.005;
controls.update();
renderer.render(scene, camera);
});

function takeScreenshot() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
scene.rotation.y = 35;
renderer.render(scene, camera);
renderer.domElement.toBlob(function(blob){
var a = document.createElement('a');
var url = URL.createObjectURL(blob); 
var reader = new FileReader();
reader.readAsDataURL(blob); 
reader.onloadend = function() {
var base64data = reader.result;                
}
a.href = url;
a.download = 'Extrusion.png';
a.click();
}, 'image/png', 1.0);

bg.visible = true;
}
function sendScreenshot() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
scene.rotation.y = 35;
renderer.render(scene, camera);
renderer.domElement.toBlob(function(blob){
var a = document.createElement('a');
var url = URL.createObjectURL(blob);
var reader = new FileReader();
reader.readAsDataURL(blob); 
reader.onloadend = function() {
var base64data = reader.result;                
$("#screenshot").val(base64data);
}
}, 'image/png', 1.0);
bg.visible = true;
}
$(window).keydown(function(event){
if(event.keyCode == 13) {
event.preventDefault();
return false;
}
});
$("#submit").hover(function(){
sendScreenshot();
});

function exportBinary() {
var bg = scene.getObjectByName( "bg" );
bg.visible = false;
var len = $("#length-2").val();
lengthController.setValue(len);
var obj = scene.getObjectByName( "obj" );
const result = exporter.parse( obj, { binary: true } );
saveArrayBuffer( result, 'extrusion.stl' );
lengthController.setValue(0.2);
bg.visible = true;
}
function save( blob, filename ) {
const link = document.createElement( 'a' );
link.href = URL.createObjectURL( blob );
link.download = filename;
link.click();
}
function saveArrayBuffer( buffer, filename ) {
save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

}
$("#unit").on('change', function() {
if(this.value == 'in'){
var originalID  = Number($("#id-range").val());
var originalOD  = Number($("#od-range").val());
var originalLEN = Number($("#len-range").val());
$("#id-range,#od-range").attr({
"min": 0.02,
"max": 0.45,
"step": 0.001
});
$("#len-range").attr({
"max": 100,
"step": 0.01
});
camera.position.set(-3, 5, 20).setLength(.75);
controls.maxDistance = 4;

$("#id-range,#id-2").val((originalID / 25.4).toFixed(3));
$("#len-range,#length-2").val((originalLEN / 25.4).toFixed(3));
$("#od-range,#od-3").val((originalOD / 25.4).toFixed(3));
idController.setValue(originalID / 25.4);
odController.setValue(originalOD / 25.4);

lengthController.setValue(.2);
}
else {
var originalID = Number($("#id-range").val());
var originalOD = Number($("#od-range").val());
var originalLEN = Number($("#len-range").val());
$("#id-range,#od-range").attr({
"min": 0.508,
"max": 11.43,
"step": 0.025
});
$("#len-range").attr({
"max": 2540,
"step": 0.001
});
camera.position.set(-3, 5, 20).setLength(19);
controls.maxDistance = 50;

$("#id-range,#id-2").val((originalID * 25.4).toFixed(3));
$("#len-range,#length-2").val((originalLEN * 25.4).toFixed(3));
odController.setValue(originalOD * 25.4);
idController.setValue(originalID * 25.4);
$("#od-range,#od-3").val((originalOD * 25.4).toFixed(3));
lengthController.setValue(5);
 }
 });
 var lineItem = 1;

$("#add-extrusion").click(function() {
console.log('clicked');
var id = $("#id-2").val();
var od = $("#od-3").val();
var length = $("#length-2").val();
var idTol = $("#id-tol-2").val();
var odTol = $("#od-tol-2").val();
var lenTol = $("#length-tol-2").val();
var material = $("#material-2").val();
var additive = $("#color-2").val();
var color = $("#colorant").val();
var quantity = $("#quantity-2").val();
//var price =;
var lineHtml = 
`<div class="line">
<div><p class="delete">x</p><p class="line-title">Line `+ lineItem +`</p></div>
<p class="edit" id="`+ lineItem +`">Edit</p>
<div class="row">
	<div class="col">
		<div class="item"><p class="label">ID</p><input class="quote-input" id="l`+lineItem+`-id" value="`+id+`" readonly></input></div>
  	<div class="item"><p class="label">OD</p><input class="quote-input" id="l`+lineItem+`-od" value="`+od+`" readonly></input></div>
  	<div class="item"><p class="label">Length</p><input class="quote-input" id="l`+lineItem+`-length" value="`+length+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+material+`" readonly></input></div>
    <div class="item"><p class="label">Color</p><input class="quote-input" id="l`+lineItem+`-color" value="`+color+`" readonly></input></div>
    <div class="item"><p class="label">Price</p><input class="quote-input" id="l`+lineItem+`-price" value="" readonly></input></div>
	</div>
	<div class="col">
  	<div class="item"><p class="label">ID Tol</p><input class="quote-input" id="l`+lineItem+`-id-tol" value="`+idTol+`" readonly></input></div>
    <div class="item"><p class="label">OD Tol</p><input class="quote-input" id="l`+lineItem+`-od-tol" value="`+odTol+`" readonly></input></div>
    <div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-length-tol" value="`+lenTol+`" readonly></input></div>
    <div class="item"><p class="label">Additive</p><input class="quote-input" id="l`+lineItem+`-additive" value="`+additive+`" readonly></input></div>
    <div class="item"><p class="label">Quantity</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
  </div>
  </div>
</div>`;
$("#quote").append(lineHtml);
++lineItem;
});

$(document).on("click", ".edit", function(){
var line = this.id;
$("#id-2, #id-range").val($("#l"+ line + "-id").val());
  //idController.setValue(Number($("#l"+ line + "-id").val()));
$("#od-3, #od-range").val($("#l"+ line + "-od").val());
  //odController.setValue(Number($("#l"+ line + "-od").val()));
$("#length-2, #len-range").val($("#l"+ line + "-length").val());
$("#id-tol-2").val($("#l"+ line + "-idTol").val());
$("#od-tol-2").val($("#l"+ line + "-odTol").val());
$("#length-tol-2").val($("#l"+ line + "-lenTol").val());
$("#material-2").val($("#l"+ line + "-material").val());
$("#color-2").val($("#l"+ line + "-additive").val());
$("#colorant").val($("#l"+ line + "-color").val());
$("#quantity-2").val($("#l"+ line + "-quantity").val());
$("#editing").css('display', 'flex');
$("#now-editing").val(line);
$(".update, .update-button").css('display', 'flex');
});

$("#update").click(function(){
var line = $("#now-editing").val();
$("#l"+ line + "-id").val($("#id-2").val());
$("#l"+ line + "-od").val($("#od-3").val());
$("#l"+ line + "-length").val($("#length-2").val());
$("#l"+ line + "-idTol").val($("#id-tol-2").val());
$("#l"+ line + "-odTol").val($("#od-tol-2").val());
$("#l"+ line + "-lenTol").val($("#length-tol-2").val());
$("#l"+ line + "-material").val($("#material-2").val());
$("#l"+ line + "-additive").val($("#color-2").val());
$("#l"+ line + "-color").val($("#colorant").val());
$("#l"+ line + "-quantity").val($("#quantity-2").val());
$("#editing").css('display', 'none');
$(".update, .update-button").css('display', 'none');

});
$(document).on("click", ".delete", function(){
  $(this).closest('.line').remove();
  var lineItem = 1;
  $(".line").map(function() {
    $(this).children('.line-title').innerText('Line '+ lineItem);
    $(this).children('.edit').attr("id", lineItem);
    $(this).children('input').map(function(){
      this.id = this.id.replace(/[0-9]/g, line);
    });
  ++lineItem;
  });
});

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
      OD: 0.12,
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
shape.absarc(0, 0, od/2, 0, Math.PI * 2);
shape.holes.push(new THREE.Path().absarc(0, 0, id/2, 0, Math.PI * 2, false));
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

$(".cost").prop("readonly",true);

$("#4-week-date").text(dayjs().add(28, 'day').format('MMMM DD'));
$("#3-week-date").text(dayjs().add(21, 'day').format('MMMM DD'));
$("#2-week-date").text(dayjs().add(14, 'day').format('MMMM DD'));
$("#1-week-date").text(dayjs().add(7, 'day').format('MMMM DD'));
$("#2-day-date").text(dayjs().add(2, 'day').format('MMMM DD'));

$("#4-week-price").on('change', function(){
$("#3-week-price").val(Number(this.value)+300);
$("#2-week-price").val(Number(this.value)+600);
$("#1-week-price").val(Number(this.value)+1100);
$("#2-day-price").val(Number(this.value)+1600);
});



function calculate(isTol) {
console.log(isTol)
if( isTol === false ) { console.log('===')}
if( isTol == false ) { console.log('==')}
if( isTol = false ) { console.log('=')}
//IF MATERIAL IS HARD
var id = Number($("#id-2").val());
var greenlight = $("#greenlight");
var wall = Number($("#wall").val());
var length = Number($("#length-2").val());
var lengthTol = $("#length-tol-2").val().toLowerCase();
var idTolerance = $("#id-tol-2").val();
var wallTolerance = $("#wall-tol").val();

//VALIDATE
function validate(wallMin, wallMax, idTol, wallTol){
  if((wall >= wallMin && wall <= wallMax) && (length <=60) && (lengthTol == 'min')) { 
    greenlight.prop('checked', true);
    greenlight.trigger('change'); 
    $("#wall").css('border', 'none');
    $("#length-2").css('border', 'none');
    $("#length-tol-2").css('border', '1px solid white');
    $("#id-tol-2").css('border', '1px solid white');
    $("#wall-tol").css('border', '1px solid white');
  } else { 
    greenlight.prop('checked', false); 
    greenlight.trigger('change'); 
    //Check Wall
    if ( wall < wallMin ) { $("#wall").css('border', '2px solid #ff6f6f'); } else {$("#wall").css('border', 'none');}
    if ( wall > wallMax ) { $("#wall").css('border', '2px solid #ff6f6f'); } else {$("#wall").css('border', 'none');}
    //Check length
    if ( length > 60 ) { $("#length-2").css('border', '2px solid #ff6f6f'); } else { $("#length-2").css('border', 'none');}
    //Check Tolerances
    if ( lengthTol !== 'min' ) { $("#length-tol-2").css('border', '2px solid #ff6f6f'); } else { $("#length-tol-2").css('border', '1px solid white');}
    if ( Number(idTol) !== Number(idTolerance) ) { $("#id-tol-2").css('border', '2px solid #ff6f6f'); } else {$("#id-tol-2").css('border', '1px solid white');}
    if ( Number(wallTol) !== Number(wallTolerance) ) { $("#wall-tol").css('border', '2px solid #ff6f6f'); } else {$("#wall-tol").css('border', '1px solid white');}
  }
  
}


  
if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21 (Nylon 12)'].includes($("#material-2").val()) ){
  $("#4-week-price").val(900);
  //CATEGORY 1 .014-.050
  if(id >= 0.014 && id <=0.050) { 
  if(isTol === false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.0005);} var wallMin = 0.002; var wallMax = 0.010; var idTol = 0.001; var wallTol = 0.0005;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 2 .051-.100
  if(id >= 0.051 && id <=0.100) { 
    if(isTol === false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.001);} var wallMin = 0.003; var wallMax = 0.015; var idTol = 0.001; var wallTol = 0.001;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 3 .101-.150
  if(id >= 0.101 && id <=0.150) { 
    if(isTol === false) {$("#id-tol-2").val(0.0015); $("#wall-tol").val(0.001);} var wallMin = 0.003; var wallMax = 0.020;  var idTol = 0.0015; var wallTol = 0.001;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 4 .151-.200
  if(id >= 0.151 && id <=0.200) { 
    if(isTol === false) {$("#id-tol-2").val(0.002); $("#wall-tol").val(0.0015);} var wallMin = 0.004; var wallMax = 0.025;  var idTol = 0.002; var wallTol = 0.0015;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 5 .201-.250
  if(id >= 0.201 && id <=0.250) { 
    if(isTol === false) {$("#id-tol-2").val(0.0025); $("#wall-tol").val(0.0015);} var wallMin = 0.005; var wallMax = 0.025;  var idTol = 0.0025; var wallTol = 0.0015;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 6 .251-.300
  if(id >= 0.251 && id <=0.300) { 
    if(isTol === false) {$("#id-tol-2").val(0.003); $("#wall-tol").val(0.002);} var wallMin = 0.006; var wallMax = 0.025;  var idTol = 0.003; var wallTol = 0.002;
    validate(wallMin, wallMax, idTol, wallTol);
  }
$("#4-week-price").trigger('change');
}
//IF MATERIAL IS SOFT
else {
 //CATEGORY 1 .014-.050
  if(id >= 0.014 && id <=0.050) { 
    $("#id-tol-2").val(0.001); $("#wall-tol").val(0.0005); var wallMin = 0.002; var wallMax = 0.010;
    $("#4-week-price").val(1200);
    
  }
  //CATEGORY 2 .051-.100
  if(id >= 0.051 && id <=0.100) { 
    $("#id-tol-2").val(0.001); $("#wall-tol").val(0.001); var wallMin = 0.003; var wallMax = 0.015;
    $("#4-week-price").val(1200);
  }
  //CATEGORY 3 .101-.150
  if(id >= 0.101 && id <=0.150) { 
    $("#id-tol-2").val(0.0015); $("#wall-tol").val(0.001); var wallMin = 0.003; var wallMax = 0.020;
    $("#4-week-price").val(1200);
  }
  //CATEGORY 4 .151-.200
  if(id >= 0.151 && id <=0.200) { 
    $("#id-tol-2").val(0.002); $("#wall-tol").val(0.0015); var wallMin = 0.004; var wallMax = 0.025; 
    $("#4-week-price").val(1200);
  }
  //CATEGORY 5 .201-.250
  if(id >= 0.201 && id <=0.250) { 
    $("#id-tol-2").val(0.0025); $("#wall-tol").val(0.0015); var wallMin = 0.005; var wallMax = 0.025; 
    $("#4-week-price").val(1350);
  }
  //CATEGORY 6 .251-.300
  if(id >= 0.251 && id <=0.300) { 
    $("#id-tol-2").val(0.003); $("#wall-tol").val(0.002); var wallMin = 0.006; var wallMax = 0.025; 
    $("#4-week-price").val(1350);
  }
  $("#4-week-price").trigger('change');
}
}
$("#greenlight").on('change', function() {
if(this.checked){
  $("#price-block").css('display', 'flex');
  $("#custom-dialogue").css('display', 'none');
} else {
  $("#price-block").css('display', 'none');
}
  
});
$('input[data-name=REF]').on('change', function() {
if($(this).val() == 'id' && $(this).is(":checked")) {  $("#id-2, #id-range, #id-tol-2").prop('disabled', true); $("#od-3, #od-range, #wall, #wall-range, #od-tol-2, #wall-tol").prop('disabled', false); }
if($(this).val() == 'od' && $(this).is(":checked")) { $("#od-3, #od-range, #od-tol-2").prop('disabled', true); $("#id-2, #id-range, #wall, #wall-range, #wall-tol, #id-tol-2").prop('disabled', false); }
if($(this).val() == 'wall' && $(this).is(":checked")) {  $("#wall, #wall-range, #wall-tol").prop('disabled', true); $("#id-2, #id-range, #od-3, #od-range, #od-tol-2, #id-tol-2").prop('disabled', false); }
});
  
$("#id-range").on('input', function() {
  
$("#id-2").val(Number(this.value).toFixed(3));

var od = Number($("#od-range").val());
var wall = Number($("#wall-range").val());
if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}
if(Number(this.value) >= (od - tol)) {

var expandedOD = Number(this.value) + tol;
odController.setValue(expandedOD);
$("#od-range").val(expandedOD.toFixed(3));
$("#od-3").val(expandedOD.toFixed(3));

}

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val((od-Number(this.value))/2);
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val(Number(this.value)+(wall*2));
  odController.setValue(Number(this.value)+(wall*2))
};
idController.setValue(Number(this.value));
  calculate(false);
});

$("#id-2").on('change', function() {

$("#id-range").val(Number(this.value).toFixed(3));

var od = Number($("#od-range").val());
var wall = Number($("#wall-range").val());
if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}
if(Number(this.value) >= (od - tol)) {
var expandedOD = Number(this.value) + tol;
odController.setValue(expandedOD);
$("#od-range").val(expandedOD.toFixed(3));
$("#od-3").val(expandedOD.toFixed(3));
}

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val((od-Number(this.value))/2);
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val(Number(this.value)+(wall*2));
  odController.setValue(Number(this.value)+(wall*2))
};
idController.setValue(Number(this.value));
calculate(false);
});

  
$("#od-range").on('input', function() {
$("#od-3").val(Number(this.value).toFixed(3));

var id = Number($("#id-range").val());
var wall = Number($("#wall-range").val());
if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}

if(Number(this.value) < (id + tol)) {
var expandedID = Number(this.value) - tol;
idController.setValue(expandedID);
$("#id-range").val(expandedID.toFixed(3));
 $("#id-2").val(expandedID.toFixed(3));
}

if($(":radio[value=id]").is(":checked")) {
  $("#id-2, #id-range").val(Number(this.value)-(wall*2));
  idController.setValue(Number(this.value)-(wall*2));
};

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val((Number(this.value)-id)/2);
};
odController.setValue(Number(this.value));
  calculate(false);
});

$("#od-3").on('change', function() {
var id = Number($("#id-range").val()).toFixed(3);
var wall = Number($("#wall-range").val());
if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}
if(Number(this.value) <= (id + tol)) {
var expandedID = Number(this.value) - tol;

idController.setValue(expandedID);
 
$("#id-range").val(expandedID.toFixed(3));
$("#id-2").val(expandedID.toFixed(3));
}

if($(":radio[value=id]").is(":checked")) {
  $("#id-2, #id-range").val(Number(this.value)-(wall*2));
  idController.setValue(Number(this.value)-(wall*2));
};

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val((Number(this.value)-id)/2);
};
odController.setValue(Number(this.value));

$("#od-range").val(Number(this.value).toFixed(3));
  calculate(false);
});



$("#wall-range").on('input', function() {
$("#wall").val(Number(this.value).toFixed(4));
var id = Number($("#id-range").val());
var od = Number($("#od-range").val());

if($(":radio[value=id]").is(":checked")) {
  if(("#unit").val() == 'in'){ var margin = 0.02; } else { var margin =  .508; }
  $("wall, #wall-range").attr("max", (Number($("#od-3").val())-.02)/2);
  $("#id-2, #id-range").val((od-(Number(this.value)*2)).toFixed(3));
  idController.setValue((od-(Number(this.value)*2)).toFixed(3));
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val((id+(Number(this.value)*2)).toFixed(3));
  odController.setValue((id+(Number(this.value)*2)).toFixed(3));
};
  calculate(false);
});

$("#wall").on('change', function() {
$("#wall-range").val(Number(this.value).toFixed(3));
var id = Number($("#id-range").val());
var od = Number($("#od-range").val());

if($(":radio[value=id]").is(":checked")) {
  if(("#unit").val() == 'in'){ var margin = 0.02; } else { var margin =  .508; }
  $("wall, #wall-range").attr("max", (Number($("#od-3").val())-.02)/2);
  $("#id-2, #id-range").val((od-(Number(this.value)*2)).toFixed(3));
  idController.setValue((od-(Number(this.value)*2)).toFixed(3));
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val((id+(Number(this.value)*2)).toFixed(3));
  odController.setValue((id+(Number(this.value)*2)).toFixed(3));
};
  calculate(false);
});

  
$("#len-range").on('input', function() {
$("#length-2").val(this.value);
calculate(true);
});

$("#length-2").on('change', function() {
$("#len-range").val(this.value);
calculate(true);
});

$("#material-2").on('change', function() {
  $(this).css('border', '0px');
  calculate(true);
});

$("#length-tol-2").on('change', function() {
  calculate(true);
});

$("#id-tol-2").on('change', function() {
  calculate(true);
});

$("#wall-tol").on('change', function() {
  calculate(true);
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
//$("#submit").hover(function(){
//sendScreenshot();
//});

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

function createLine(){
  var find = $(".line");
var lineItem = find.length +1
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
var price = $('#'+ $('input[data-name=price]:checked').val()).val();
var leadtime =  $('input[data-name=price]:checked').val();
var lineHtml = 
`<div class="line">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +`</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
		<div class="item"><p class="label">ID</p><input class="quote-input" id="l`+lineItem+`-id" value="`+id+`" readonly></input></div>
  	<div class="item"><p class="label">OD</p><input class="quote-input" id="l`+lineItem+`-od" value="`+od+`" readonly></input></div>
  	<div class="item"><p class="label">Length</p><input class="quote-input" id="l`+lineItem+`-length" value="`+length+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+material+`" readonly></input></div>
    <div class="item"><p class="label">Color</p><input class="quote-input" id="l`+lineItem+`-color" value="`+color+`" readonly></input></div>
    <div class="item"><p class="label">Price($)</p><input class="quote-input" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    
	</div>
	<div class="col">
  	<div class="item"><p class="label">ID Tol</p><input class="quote-input" id="l`+lineItem+`-id-tol" value="`+idTol+`" readonly></input></div>
    <div class="item"><p class="label">OD Tol</p><input class="quote-input" id="l`+lineItem+`-od-tol" value="`+odTol+`" readonly></input></div>
    <div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-length-tol" value="`+lenTol+`" readonly></input></div>
    <div class="item"><p class="label">Additive</p><input class="quote-input" id="l`+lineItem+`-additive" value="`+additive+`" readonly></input></div>
    <div class="item"><p class="label">Quantity</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item"><p class="label">Lead Time</p><input class="quote-input" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input>
  </div>
  </div>
</div>`;
$("#quote").append(lineHtml);
}

$("#add-extrusion").click(function() {
if($("#material-2").val() == '') {$("#material-2").css('border', '3px solid #ff6f6f');$("#material-2").get(0).scrollIntoView();return;}
if ($("#greenlight").is(":checked")){

createLine();

$("#continue").css('display', 'block');
$("#price-block").css('display', 'none');
} else {
  if(!$("#custom-quote").is(":checked")){
  $("#custom-dialogue").css('display', 'flex');
  }
}
});

$("#custom-change").click(function() {
  $("#custom-quote").prop('checked', true);
  createLine();
  $("#custom-dialogue").css('display', 'none');
});

$("#continue").click(function() {
  $("#final-details").css('display', 'block');
});


$("#view-carrier").click(function() {
  $("#carrier-details").css('display', 'flex');
});
$("#view-po").click(function() {
  $("#po-details").css('display', 'flex');
});



$(document).on("click", ".edit", function(){
var line = this.id;
var radioId = $("#l"+line+"-leadtime").val().replace('-price','');
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
$("#"+radioId).prop('checked', true);
$("#id-2, #od-3, #wall, #material-2").trigger('change');
$("#submit-container").css('display', 'none');
  if(!$("#custom-quote").is(":checked")){
    $("#price-block").css('display', 'flex');
  }
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
$("#l"+ line + "-price").val($('#'+ $('input[data-name=price]:checked').val()).val());
$("#l"+ line + "-leadtime").val($('input[data-name=price]:checked').val().replace('-price', ''));
$("#editing").css('display', 'none');
$(".update, .update-button").css('display', 'none');
$("#submit-container").css('display', 'flex');
$("#price-block").css('display', 'none');
});
$(document).on("click", ".delete", function(){
  $(this).closest('.line').remove();
  var lineItem = 1;
  $(".line").map(function() {
    $(this).find('.line-title').first().text('Line '+ lineItem);
    $(this).find('.edit').first().attr("id", lineItem);
    $(this).find('input').map(function(){
      this.id = this.id.replace(/[0-9]/g, lineItem);
    });
  ++lineItem;
  });
});

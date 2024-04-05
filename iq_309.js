import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { STLExporter } from 'three/addons/exporters/STLExporter.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

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
      exportBinary: exportBinary,
      modelColor: "#ffffff",
      opacity: .85
}

const folder = gui.addFolder( 'Export' );
const odController = folder.add( params, 'OD', .03, .5, .001).onChange( createShape );   
const idController = folder.add( params, 'ID', .02, .45, .001).onChange( createShape ); 
const lengthController = folder.add(params, 'Length', 0, 100, .2).onChange( createShape );
const materialController = folder.add(params, 'modelColor', ['#ffffff','#000000','#97999B','#00AB8E','#006A52', '#004B87', '#002855', '#9678D3']).onChange( createShape );
const opacityController = folder.add(params, 'opacity', 0.1, 1, 0.6).onChange ( createShape );
opacityController.hide();
materialController.hide();
lengthController.hide();
idController.hide();
odController.hide();
const imageController = folder.add( params, 'takeScreenshot').name('Save as Image');
const stlController = folder.add( params, 'exportBinary').name('Save as STL');
folder.open();
const spheregeometry = new THREE.SphereGeometry( 40, 32, 16 );
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
if(params.modelColor == '#ffffff') {var color = '#ffffff' };
if(params.modelColor == 'White') {var color = '#ffffff' };
if(params.modelColor == 'Black') {var color = '#000000' };
if(params.modelColor == 'Cool Grey (7C)') {var color = '#97999B' };
if(params.modelColor == 'Green (3268C)') {var color = '#00AB8E' };
if(params.modelColor == 'Green (3298C)') {var color = '#006A52' };
if(params.modelColor == 'Blue (301C)') {var color = '#004B87' };
if(params.modelColor == 'Blue (295C)') {var color = '#002855' };
if(params.modelColor == 'Purple (2655C)') {var color = '#9678D3' };
if(params.modelColor == 'Cool Grey (4C)') {var color = '#BBBCBC' };
if(params.modelColor == 'Green (3248C)') {var color = '#6DCDB8' };
if(params.modelColor == 'Blue (2925C)') {var color = '#009CDE' };
if(params.modelColor == 'Blue (290C)') {var color = '#B9D9EB' };
  
let shape = new THREE.Shape()
shape.absarc(0, 0, od/2, 0, Math.PI * 2);
shape.holes.push(new THREE.Path().absarc(0, 0, id/2, 0, Math.PI * 2, false));
let g = new THREE.ExtrudeGeometry(shape, {steps: 1, bevelEnabled: false, bevelSegments:5, bevelSize: .001,bevelThickness:.001, depth: params.Length, curveSegments: 100});
let m = new THREE.MeshStandardMaterial({color: color, roughness: .4});

var previous = scene.getObjectByName( "obj" );
if (previous != "") {
scene.remove(previous);
}
let o = new THREE.Mesh(g, m);
o.geometry.center();
o.material.shading = THREE.SmoothShading;
o.material.side = THREE.DoubleSide;
o.material.transparent = true;
o.material.opacity = params.opacity;


const obj = new THREE.Object3D();

obj.name = "obj";
obj.add(o);
scene.add(obj);

}

createShape(0.05);
let clock = new THREE.Clock();

$(".cost").prop("readonly",true);

$("#4-week-date").text(dayjs().add(29, 'day').format('MMMM DD'));
$("#3-week-date").text(dayjs().add(22, 'day').format('MMMM DD'));
$("#2-week-date").text(dayjs().add(15, 'day').format('MMMM DD'));
$("#1-week-date").text(dayjs().add(8, 'day').format('MMMM DD'));
$("#2-day-date").text(dayjs().add(3, 'day').format('MMMM DD'));

$("#4-week-price").on('change', function(){
$("#3-week-price").val(Number(this.value)+300);
$("#2-week-price").val(Number(this.value)+600);
$("#1-week-price").val(Number(this.value)+1100);
$("#2-day-price").val(Number(this.value)+2100);
});
$(document).ready(function() {
$('#qty-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#qty-popup",
    collision: "none"
  }
  });
$('#shipping-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#shipping-method",
    collision: "none"
  }
  });
$('#account-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#shipping-account",
    collision: "none"
  }
  });
$('#2day-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#2-day-date",
    collision: "none"
  }
  });
$('#verification').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#po-verification",
    collision: "none"
  }
  });
  $('#empty-po').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#po-number",
    collision: "none"
  }
  });
$('#cert-0').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-0-dialog",
    collision: "none"
  }
  });
$('#cert-1').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-1-dialog",
    collision: "none"
  }
  });
$('#cert-2').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-2-dialog",
    collision: "none"
  }
  });
$('#cert-3').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#cert-3-dialog",
    collision: "none"
  }
  });
$('#wall-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#wall",
    collision: "none"
  }
  });
$('#length-dialog').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#length-2",
    collision: "none"
  }
  });
  $('#ref-dialog').dialog({
    autoOpen : false, modal : true, dialogClass: 'no-close', position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#id-3",
    collision: "none"
  },
  buttons: {
    'Continue Anyway': function() { 
              $("#custom-quote").prop('checked', true);
              $("#custom-quote").trigger('change');
              $(this).dialog("close");
              calculate(true);
    },
    'Go Back': function() { 
              $("#od-4").prop("checked", true);
              $("#od-4").trigger("change");
              
              $(this).dialog("close");
              calculate(false);
    }
  }
  });
});
function calculate(isTol) {
//IF CUSTOM QUOTE, IGNORE
//if ($("#custom-quote").is(":checked")) {
//  return;
//}

//IF MATERIAL IS HARD
var id = Number($("#id-2").val());
var greenlight = $("#greenlight");
var wall = Number($("#wall").val());
var odRef = $("#od-4").is(":checked");
var length = Number($("#length-2").val());
var lengthElement = $("#length-2").hasClass('error');
var lengthTol = $("#length-tol-2").val().toLowerCase();
var idTolerance = $("#id-tol-2").val();
var wallTolerance = $("#wall-tol").val();
var material = $("#material-2").val();
var qty = Number($("#quantity-2").val());
var unit =$("#unit").val();
if (unit == 'in') {
//VALIDATE
function validate(wallMin, wallMax, idTol, wallTol){
  var lengthTol = $("#length-tol-2").val().toLowerCase();
  var idTolerance = $("#id-tol-2").val();
  var wallTolerance = $("#wall-tol").val();
  var length = Number($("#length-2").val());
  if((wall >= wallMin && wall <= wallMax) && (length <=60) && (length >=12) && (odRef == true) && (qty <= 300) && ( id <= 0.300 ) && ( id >= 0.014 ) && ((lengthTol == 'min') || (Number(lengthTol) >= 0.25)) && (material !== '') && (Number(idTol) == Number(idTolerance)) && (Number(wallTol) == Number(wallTolerance))) { 
    $("#custom-quote").prop('checked', false);
    $("#custom-quote").trigger('change');
    greenlight.prop('checked', true);
    greenlight.trigger('change'); 
    $("#wall,#length-2,#length-tol-2,#id-tol-2,#wall-tol,#id-2,#quantity-2").removeClass("error");
    $("#wall-dialog").dialog("close");
    $("#length-dialog").dialog("close");
    $("qty-dialog").dialog("close");
  } else { 
    $("#custom-quote").prop('checked', true);
    $("#custom-quote").trigger('change');
    greenlight.prop('checked', false); 
    greenlight.trigger('change'); 
    //Check Wall
    if ( wall < wallMin ) { if( !$("#wall").hasClass('error') ){$("#wall-dialog").dialog('option', 'title', 'Wall Thickness Too Low').dialog("open");$("#wall").addClass("error");} else {console.log('already has error')}}
    else if ( wall > wallMax ) { if( !$("#wall").hasClass('error') ){$("#wall-dialog").dialog('option', 'title', 'Wall Thickness Too High').dialog("open");$("#wall").addClass("error");} else {console.log('already has error')}}  else {$("#wall").removeClass("error");$("#wall-dialog").dialog("close");}
                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    //Check ID
    if ( id > 0.300 ) { $("#id-2").addClass("error"); } 
    else if ( id < 0.014 ) { $("#id-2").addClass("error"); } else {$("#id-2").removeClass("error");}
    //Check length 
    
    if ( length > 60 ) {console.log(length+100); if( !$("#length-2").hasClass('error') ){ $("#length-dialog").dialog('option', 'title', 'Length Is Too High').dialog("open");$("#length-2").addClass("error");} else {console.log('already has error')}} 
    
    else if ( length < 12 ) { console.log(length+100); if( !$("#length-2").hasClass('error') ){$("#length-dialog").dialog('option', 'title', 'Length Is Too Low').dialog("open");$("#length-2").addClass("error");} else {console.log('already has error')}}  else { console.log('length reset');$("#length-2").removeClass("error");$("#length-dialog").dialog("close");}
    //Check Quantity
    if ( qty > 300 ) { if( !$("#quantity-2").hasClass('error') ){$("#qty-dialog").dialog("open");$("#quantity-2").addClass("error")} else {console.log('already has error')}} else { $("#quantity-2").removeClass("error"); $("qty-dialog").dialog("close");}
    //Check Tolerances
    if ( (lengthTol !== 'min') || (Number(lengthTol) < 0.25) ) { $("#length-tol-2").addClass("error"); } else { $("#length-tol-2").removeClass("error");}
    if ( Number(idTol) !== Number(idTolerance) ) { $("#id-tol-2").addClass("error"); } else {$("#id-tol-2").removeClass("error");}
    if ( Number(wallTol) !== Number(wallTolerance) ) { $("#wall-tol").addClass("error"); } else {$("#wall-tol").removeClass("error");}
    
  }
  
}


  
if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21'].includes($("#material-2").val()) ){
  $("#4-week-price").val(900);
  //CATEGORY 1 .014-.050
  if(id >= 0.014 && id <=0.050) { 
  if(isTol == false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.0005);} var wallMin = 0.002; var wallMax = 0.010; var idTol = 0.001; var wallTol = 0.0005;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 2 .051-.100
  if(id >= 0.051 && id <=0.100) { 
    if(isTol == false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.001);} var wallMin = 0.003; var wallMax = 0.015; var idTol = 0.001; var wallTol = 0.001;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 3 .101-.150
  if(id >= 0.101 && id <=0.150) { 
    if(isTol == false) {$("#id-tol-2").val(0.0015); $("#wall-tol").val(0.001);} var wallMin = 0.003; var wallMax = 0.020;  var idTol = 0.0015; var wallTol = 0.001;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 4 .151-.200
  if(id >= 0.151 && id <=0.200) { 
    if(isTol == false) {$("#id-tol-2").val(0.002); $("#wall-tol").val(0.0015);} var wallMin = 0.004; var wallMax = 0.025;  var idTol = 0.002; var wallTol = 0.0015;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 5 .201-.250
  if(id >= 0.201 && id <=0.250) { 
    if(isTol == false) {$("#id-tol-2").val(0.0025); $("#wall-tol").val(0.0015);} var wallMin = 0.005; var wallMax = 0.025;  var idTol = 0.0025; var wallTol = 0.0015;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 6 .251-.300
  if(id >= 0.251 && id <=0.300) { 
    if(isTol == false) {$("#id-tol-2").val(0.003); $("#wall-tol").val(0.002);} var wallMin = 0.006; var wallMax = 0.025;  var idTol = 0.003; var wallTol = 0.002;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  if(id> 0.300) {
    if(isTol == false) {$("#id-tol-2").val(0.003); $("#wall-tol").val(0.002);} var wallMin = 0.006; var wallMax = 0.025;  var idTol = 0.003; var wallTol = 0.002;
    validate(wallMin, wallMax, idTol, wallTol);
  }
$("#4-week-price").trigger('change');
}
//IF MATERIAL IS SOFT
else {
 //CATEGORY 1 .014-.050
  if(id >= 0.014 && id <=0.050) { 
   if(isTol == false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.0005);} var wallMin = 0.002; var wallMax = 0.010; var idTol = 0.001; var wallTol = 0.0005;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1200);
    
  }
  //CATEGORY 2 .051-.100
  if(id >= 0.051 && id <=0.100) { 
     if(isTol == false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.001);} var wallMin = 0.003; var wallMax = 0.015; var idTol = 0.001; var wallTol = 0.001;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1200);
  }
  //CATEGORY 3 .101-.150
  if(id >= 0.101 && id <=0.150) { 
    if(isTol == false) {$("#id-tol-2").val(0.0015); $("#wall-tol").val(0.001);} var wallMin = 0.003; var wallMax = 0.020;  var idTol = 0.0015; var wallTol = 0.001;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1200);
  }
  //CATEGORY 4 .151-.200
  if(id >= 0.151 && id <=0.200) { 
    if(isTol == false) {$("#id-tol-2").val(0.002); $("#wall-tol").val(0.0015);} var wallMin = 0.004; var wallMax = 0.025;  var idTol = 0.002; var wallTol = 0.0015;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1200);
  }
  //CATEGORY 5 .201-.250
  if(id >= 0.201 && id <=0.250) { 
    if(isTol == false) {$("#id-tol-2").val(0.0025); $("#wall-tol").val(0.0015);} var wallMin = 0.005; var wallMax = 0.025;  var idTol = 0.0025; var wallTol = 0.0015;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1350);
  }
  //CATEGORY 6 .251-.300
  if(id >= 0.251 && id <=0.300) { 
   if(isTol == false) {$("#id-tol-2").val(0.003); $("#wall-tol").val(0.002);} var wallMin = 0.006; var wallMax = 0.025;  var idTol = 0.003; var wallTol = 0.002;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1350);
  }
   if(id> 0.300) {
    if(isTol == false) {$("#id-tol-2").val(0.003); $("#wall-tol").val(0.002);} var wallMin = 0.006; var wallMax = 0.025;  var idTol = 0.003; var wallTol = 0.002;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  $("#4-week-price").trigger('change');
} // end else
} // end if inches
///////////////////////////////////////////////////////////////////////////////////////////////////////////// MM
///////////////////////////////////////////////////////////////////////////////////////////////////////////// MM
///////////////////////////////////////////////////////////////////////////////////////////////////////////// MM
else {
  //VALIDATE
function validate(wallMin, wallMax, idTol, wallTol){
  var lengthTol = $("#length-tol-2").val().toLowerCase();
  var idTolerance = $("#id-tol-2").val();
  var wallTolerance = $("#wall-tol").val();
  if((wall >= wallMin && wall <= wallMax) && (length <=1524) && (length >=304) && (odRef == true) && (qty <= 300) && ( id <= 7.62 ) && ( id >= 0.355 ) && ((lengthTol == 'min') || (Number(lengthTol) >= 6.35)) && (material !== '') && (Number(idTol) == Number(idTolerance)) && (Number(wallTol) == Number(wallTolerance))) { 
    greenlight.prop('checked', true);
    greenlight.trigger('change'); 
    $("#wall,#length-2,#length-tol-2,#id-tol-2,#wall-tol,#id-2,#quantity-2").removeClass("error");
    $("#wall-dialog").dialog("close");
    $("#length-dialog").dialog("close");
    $("qty-dialog").dialog("close");
  } else { 
    greenlight.prop('checked', false); 
    greenlight.trigger('change'); 
    //Check Wall
    if ( wall < wallMin ) { $("#wall").addClass("error"); $("#wall-dialog").dialog('option', 'title', 'Wall Thickness Too Low').dialog("open");} else {$("#wall").removeClass("error");$("#wall-dialog").dialog("close"); }
    if ( wall > wallMax ) { $("#wall").addClass("error"); $("#wall-dialog").dialog('option', 'title', 'Wall Thickness Too High').dialog("open");} else {if(wall > wallMin){$("#wall").removeClass("error");$("#wall-dialog").dialog("close");}}
    //Check ID
    if ( id > 7.62 ) { $("#id-2").addClass("error"); } else {$("#id-2").removeClass("error");}
    if ( id < 0.355 ) { $("#id-2").addClass("error"); } else {if(id < 7.62){$("#id-2").removeClass("error");}}
    //Check length
    if ( length > 1524 ) { $("#length-2").addClass("error"); $("#length-dialog").dialog('option', 'title', 'Length Is Too High').dialog("open");} else { $("#length-2").removeClass("error");$("#length-dialog").dialog("close");}
    if ( length < 304 ) { $("#length-2").addClass("error"); $("#length-dialog").dialog('option', 'title', 'Length Is Too Low').dialog("open");} else { if(length < 1524) {$("#length-2").removeClass("error");$("#length-dialog").dialog("close");}}
    //Check Quantity
    if ( qty > 300 ) { $("#quantity-2").addClass("error"); $("#qty-dialog").dialog("open");} else { $("#quantity-2").removeClass("error"); $("qty-dialog").dialog("close");}
    //Check Tolerances
    if ( (lengthTol !== 'min') || (Number(lengthTol) < 6.35 )) { $("#length-tol-2").addClass("error"); } else { $("#length-tol-2").removeClass("error");}
    if ( Number(idTol) !== Number(idTolerance) ) { $("#id-tol-2").addClass("error"); } else {$("#id-tol-2").removeClass("error");}
    if ( Number(wallTol) !== Number(wallTolerance) ) { $("#wall-tol").addClass("error"); } else {$("#wall-tol").removeClass("error");}
  }
  
}


  
if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21'].includes($("#material-2").val()) ){
  $("#4-week-price").val(900);
  //CATEGORY 1 .355-.1.27
  if(id >= 0.355 && id <= 1.27) { 
  if(isTol == false) {$("#id-tol-2").val(0.03); $("#wall-tol").val(0.013);} var wallMin = 0.0508; var wallMax = 0.254; var idTol = 0.0254; var wallTol = 0.0127;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 2 1.2954 - 2.54
  if(id >= 1.2954 && id <= 2.54) { 
    if(isTol == false) {$("#id-tol-2").val(0.03); $("#wall-tol").val(0.025);} var wallMin = 0.0762; var wallMax = 0.381; var idTol = 0.0254; var wallTol = 0.0254;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 3 2.5654 - 3.81
  if(id >= 2.5654 && id <= 3.81 ) { 
    if(isTol == false) {$("#id-tol-2").val(0.04); $("#wall-tol").val(0.025);} var wallMin = 0.0762; var wallMax = 0.508;  var idTol = 0.0381; var wallTol = 0.0254;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 4 3.8354 - 5.08
  if(id >= 3.8354 && id <= 5.08) { 
    if(isTol == false) {$("#id-tol-2").val(0.05); $("#wall-tol").val(0.038);} var wallMin = 0.1016; var wallMax = 0.635;  var idTol = 0.0508; var wallTol = 0.0381;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 5 5.105 - 6.35
  if(id >= 5.105 && id <= 6.35) { 
    if(isTol == false) {$("#id-tol-2").val(0.06); $("#wall-tol").val(0.038);} var wallMin = 0.127; var wallMax = 0.635;  var idTol = 0.0635; var wallTol = 0.0381;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  //CATEGORY 6 6.375 - 7.62
  if(id >= 6.375 && id <= 7.62) { 
    if(isTol == false) {$("#id-tol-2").val(0.08); $("#wall-tol").val(0.051);} var wallMin = 0.1524; var wallMax = 0.635;  var idTol = 0.0762; var wallTol = 0.0508;
    validate(wallMin, wallMax, idTol, wallTol);
  }
   if(id> 7.62) {
    if(isTol == false) {$("#id-tol-2").val(0.08); $("#wall-tol").val(0.051);} var wallMin = 0.1524; var wallMax = 0.635;  var idTol = 0.0762; var wallTol = 0.0508;
    validate(wallMin, wallMax, idTol, wallTol);
  }
$("#4-week-price").trigger('change');
}
//IF MATERIAL IS SOFT
else {
//CATEGORY 1 .355-.1.27
  if(id >= 0.355 && id <= 1.27) { 
  if(isTol == false) {$("#id-tol-2").val(0.0254); $("#wall-tol").val(0.0127);} var wallMin = 0.0508; var wallMax = 0.254; var idTol = 0.0254; var wallTol = 0.0127;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1200);
    
  }
  //CATEGORY 2 1.2954 - 2.54
  if(id >= 1.2954 && id <= 2.54) { 
    if(isTol == false) {$("#id-tol-2").val(0.0254); $("#wall-tol").val(0.0254);} var wallMin = 0.0762; var wallMax = 0.381; var idTol = 0.0254; var wallTol = 0.0254;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1200);
  }
  //CATEGORY 3 2.5654 - 3.81
  if(id >= 2.5654 && id <= 3.81 ) { 
    if(isTol == false) {$("#id-tol-2").val(0.0381); $("#wall-tol").val(0.0254);} var wallMin = 0.0762; var wallMax = 0.508;  var idTol = 0.0381; var wallTol = 0.0254;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1200);
  }
  //CATEGORY 4 3.8354 - 5.08
  if(id >= 3.8354 && id <= 5.08) { 
    if(isTol == false) {$("#id-tol-2").val(0.0508); $("#wall-tol").val(0.0381);} var wallMin = 0.1016; var wallMax = 0.635;  var idTol = 0.0508; var wallTol = 0.0381;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1200);
  }
   //CATEGORY 5 5.105 - 6.35
  if(id >= 5.105 && id <= 6.35) { 
    if(isTol == false) {$("#id-tol-2").val(0.0635); $("#wall-tol").val(0.0381);} var wallMin = 0.127; var wallMax = 0.635;  var idTol = 0.0635; var wallTol = 0.0381;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1350);
  }
  //CATEGORY 6 6.375 - 7.62
  if(id >= 6.375 && id <= 7.62) { 
    if(isTol == false) {$("#id-tol-2").val(0.0762); $("#wall-tol").val(0.0508);} var wallMin = 0.1524; var wallMax = 0.635;  var idTol = 0.0762; var wallTol = 0.0508;
    validate(wallMin, wallMax, idTol, wallTol);
    $("#4-week-price").val(1350);
  }
  if(id> 7.62) {
    if(isTol == false) {$("#id-tol-2").val(0.0762); $("#wall-tol").val(0.0508);} var wallMin = 0.1524; var wallMax = 0.635;  var idTol = 0.0762; var wallTol = 0.0508;
    validate(wallMin, wallMax, idTol, wallTol);
  }
  $("#4-week-price").trigger('change');
} // end else
}
} // end calculate
  
$("#greenlight").on('change', function() {
if(this.checked){
  $("#price-block").css('display', 'flex');
  $("#custom-dialogue").css('display', 'none');
} else {
  $("#price-block").css('display', 'none');
}
  
});
$('input[data-name=REF]').on('click', function() {
    if((($(this).val() == 'id') || ($(this).val() == 'wall'))) {

$('#ref-dialog').dialog("open");


}
    
});

$('input[data-name=REF]').on('change', function() {
$("span.blue").removeClass('hide-price');
$("#title-"+$(this).val()).addClass('hide-price');
$(".div-block-264").css('opacity', 1);
$(this).closest('div.div-block-264').css('opacity', .1);
if($(this).val() == 'id' && $(this).is(":checked")) {  $("#id-tol-2").val('REF'); $("#id-2, #id-range, #id-tol-2").prop('disabled', true); $("#od-3, #od-range, #wall, #wall-range, #od-tol-2, #wall-tol").prop('disabled', false); if($("#wall-tol").val() == 'REF') {$("#wall-tol").val(0.001)}; if($("#od-tol-2").val() == 'REF') {$("#od-tol-2").val(0.001)};}
if($(this).val() == 'od' && $(this).is(":checked")) { $("#od-tol-2").val('REF'); $("#od-3, #od-range, #od-tol-2").prop('disabled', true); $("#id-2, #id-range, #wall, #wall-range, #wall-tol, #id-tol-2").prop('disabled', false); if($("#wall-tol").val() == 'REF') {$("#wall-tol").val(0.001)}; if($("#id-tol-2").val() == 'REF') {$("#id-tol-2").val(0.001)}; calculate(false);}
if($(this).val() == 'wall' && $(this).is(":checked")) {  $("#wall-tol").val('REF'); $("#wall, #wall-range, #wall-tol").prop('disabled', true); $("#id-2, #id-range, #od-3, #od-range, #od-tol-2, #id-tol-2").prop('disabled', false); if($("#id-tol-2").val() == 'REF') {$("#id-tol-2").val(0.001)}; if($("#od-tol-2").val() == 'REF') {$("#od-tol-2").val(0.001)};}
});
$("#cert-0-dialog").click(function(){ $("#cert-0").dialog("open"); });
$("#cert-1-dialog").click(function(){ $("#cert-1").dialog("open"); });
$("#cert-2-dialog").click(function(){ $("#cert-2").dialog("open"); });
$("#cert-3-dialog").click(function(){ $("#cert-3").dialog("open"); });
$("#qty-popup").click(function(){ $("#qty-dialog").dialog("open"); });
$("#id-range").on('input', function() {
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;}else{var tol= 0.05;var sig = 2; var wsig = 3;}
$("#id-2").val(Number(this.value).toFixed(sig));

var od = Number($("#od-range").val());
var wall = Number($("#wall-range").val());

if(Number(this.value) >= (od - tol)) {

var expandedOD = Number(this.value) + tol;
odController.setValue(expandedOD);
$("#od-range").val(expandedOD.toFixed(sig));
$("#od-3").val(expandedOD.toFixed(sig));

}

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val(((od-Number(this.value))/2).toFixed(wsig));
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val((Number(this.value)+(wall*2)).toFixed(sig));
  odController.setValue((Number(this.value)+(wall*2)).toFixed(sig))
};
idController.setValue(Number(this.value).toFixed(sig));
  calculate(false);
});

$("#id-2").on('change', function() {
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;}else{var tol= 0.05;var sig = 2; var wsig = 3;}
$("#id-range").val(Number(this.value).toFixed(sig));

var od = Number($("#od-range").val());
var wall = Number($("#wall-range").val());
if(Number(this.value) >= (od - tol)) {
var expandedOD = Number(this.value) + tol;
odController.setValue(expandedOD);
$("#od-range").val(expandedOD.toFixed(sig));
$("#od-3").val(expandedOD.toFixed(sig));
}

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val(((od-Number(this.value))/2).toFixed(wsig));
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val((Number(this.value)+(wall*2)).toFixed(sig));
  odController.setValue((Number(this.value)+(wall*2)).toFixed(sig))
};
idController.setValue(Number(this.value).toFixed(sig));
calculate(false);
});

  
$("#od-range").on('input', function() {
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;}else{var tol= 0.05;var sig = 2; var wsig = 3;}
$("#od-3").val(Number(this.value).toFixed(sig));

var id = Number($("#id-range").val());
var wall = Number($("#wall-range").val());

if(Number(this.value) < (id + tol)) {
var expandedID = Number(this.value) - tol;
idController.setValue(expandedID);
$("#id-range").val(expandedID.toFixed(sig));
 $("#id-2").val(expandedID.toFixed(sig));
}

if($(":radio[value=id]").is(":checked")) {
  $("#id-2, #id-range").val((Number(this.value)-(wall*2)).toFixed(sig));
  idController.setValue((Number(this.value)-(wall*2)).toFixed(sig));
};

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val(((Number(this.value)-id)/2).toFixed(wsig));
};
odController.setValue(Number(this.value).toFixed(sig));
  calculate(false);
});

$("#od-3").on('change', function() {
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;}else{var tol= 0.05;var sig = 2; var wsig = 3;}
var id = Number($("#id-range").val()).toFixed(sig);
var wall = Number($("#wall-range").val());
if(Number(this.value) <= (id + tol)) {
var expandedID = Number(this.value) - tol;

idController.setValue(expandedID);
 
$("#id-range").val(expandedID.toFixed(sig));
$("#id-2").val(expandedID.toFixed(sig));
}

if($(":radio[value=id]").is(":checked")) {
  $("#id-2, #id-range").val((Number(this.value)-(wall*2)).toFixed(sig));
  idController.setValue((Number(this.value)-(wall*2)).toFixed(sig));
};

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val(((Number(this.value)-id)/2).toFixed(wsig));
};
odController.setValue(Number(this.value).toFixed(sig));

$("#od-range").val(Number(this.value).toFixed(sig));
  calculate(false);
});



$("#wall-range").on('input', function() {
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;}else{var tol= 0.05;var sig = 2; var wsig = 3;}
$("#wall").val(Number(this.value).toFixed(wsig));
var id = Number($("#id-range").val());
var od = Number($("#od-range").val());

if($(":radio[value=id]").is(":checked")) {
  if($("#unit").val() == 'in'){ var margin = 0.02; } else { var margin =  .508; }
  $("wall, #wall-range").attr("max", (Number($("#od-3").val())-.02)/2);
  $("#id-2, #id-range").val((od-(Number(this.value)*2)).toFixed(sig));
  idController.setValue((od-(Number(this.value)*2)).toFixed(sig));
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val((id+(Number(this.value)*2)).toFixed(sig));
  odController.setValue((id+(Number(this.value)*2)).toFixed(sig));
};
  calculate(false);
});

$("#wall").on('change', function() {
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;}else{var tol= 0.05;var sig = 2; var wsig = 3;}
$("#wall-range").val(Number(this.value).toFixed(wsig));
var id = Number($("#id-range").val());
var od = Number($("#od-range").val());

if($(":radio[value=id]").is(":checked")) {
  if($("#unit").val() == 'in'){ var margin = 0.02; } else { var margin =  .508; }
  $("wall, #wall-range").attr("max", (Number($("#od-3").val())-.02)/2);
  $("#id-2, #id-range").val((od-(Number(this.value)*2)).toFixed(sig));
  idController.setValue((od-(Number(this.value)*2)).toFixed(sig));
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val((id+(Number(this.value)*2)).toFixed(sig));
  odController.setValue((id+(Number(this.value)*2)).toFixed(sig));
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
$("#quantity-2").on('change', function() {

calculate(true);
});
$("#material-2").on('change', function() {
  $(this).css('border', '0px');
  calculate(true);
  if (['Pebax 25D','Pebax 35D','Pebax 45D','Pebax 55D','Pebax 63D','Pebax 72D','Vestamid ML21'].includes(this.value)) { $("#colorant").empty().append('<option value="">Select a Color...</option><option value="White">White</option><option value="Black">Black</option><option value="Cool Grey (7C)">Cool Grey (7C)</option><option value="Green (3248C)">Green (3248C)</option><option value="Green (3268C)">Green (3268C)</option><option value="Green (3298C)">Green (3298C)</option><option value="Blue (290C)">Blue (290C)</option><option value="Blue (295C)">Blue (295C)</option><option value="Blue (2925C)">Blue (2925C)</option><option value="Blue (301C)">Blue (301C)</option><option value="Purple (2655C)">Purple (2655C)</option>') }
  if (['LDPE'].includes(this.value)) {$("#color-2").empty().append('<option value="20% BaSO4">20% BaSO4</option>'); $("#colorant").empty().append('<option value="None">None</option><option value="Cool Grey (4C)">Cool Grey (4C)</option>')}
  if (['HDPE','Delrin','PET','Tecoflex 80A','Pellethane 80AE','Pellethane 90AE','Pellethane 55D','Pellethane 65D','NeuSoft UR862A','NeuSoft UR842A','NeuSoft UR852A','NeuSoft UR873A'].includes(this.value)) { $("#colorant option:first-child").prop("selectedIndex",0); $("input[id=color]").prop("checked", false).trigger("change").prop("disabled", true); $("#colorant").css('display', 'none'); } else { $("input[id=color]").prop("disabled", false); }
  if (['Pebax 25D','Pebax 35D','Pebax 55D', 'Pebax 63D', 'Pebax 72D', 'Pebax 45D'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="20% BaSO4">20% BaSO4</option><option value="Mobilize">Mobilize</option><option value="20% BaSO4 & Mobilize">20% BaSO4 & Mobilize</option>'); return;} 
  if (['Pebax 40D','Pebax 70D'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="20% BaSO4">20% BaSO4</option>'); return;} 
  if (['Vestamid ML21'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="Mobilize">Mobilize</option>'); return; }
  //else { $("#color-2").empty().append('<option value="None">None</option>'); }
 
});
$("#color").on('change', function() {
if ($(this).is(':checked')) {
opacityController.setValue(1);
if($("#colorant").val()){var mat = $("#colorant").val();} else {var mat ='#ffffff';}
materialController.setValue(mat);
} else {
opacityController.setValue(.85);
materialController.setValue('#ffffff');
  
}
});
$("#colorant").on('change', function() {
materialController.setValue(this.value);
  
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
var originalWALL = Number($("#wall-range").val());
$("#id-range,#od-range").attr({
"min": 0.020,
"max": 0.450,
"step": 0.001
});
$("#len-range").attr({
"max": 100,
"step": 1
});
$("#wall-range").attr({
  "min": .0005,
  "max": .1000,
  "step": .0005
});
camera.position.set(-3, 5, 20).setLength(.75);
controls.maxDistance = 4;

$("#id-range,#id-2").val((originalID / 25.4).toFixed(3));
$("#len-range,#length-2").val((originalLEN / 25.4).toFixed(0));
$("#od-range,#od-3").val((originalOD / 25.4).toFixed(3));
$("#wall, #wall-range").val((originalWALL / 25.4).toFixed(4));
idController.setValue(originalID / 25.4);
odController.setValue(originalOD / 25.4);

lengthController.setValue(.2);
}
else {
var originalID = Number($("#id-range").val());
var originalOD = Number($("#od-range").val());
var originalLEN = Number($("#len-range").val());
var originalWALL = Number($("#wall-range").val());
$("#id-range,#od-range").attr({
"min": 0.51,
"max": 11.5,
"step": 0.025
});
$("#len-range").attr({
"max": 2540,
"step": 25
});
$("#wall-range").attr({
  "min": .013,
  "max": 2.54,
  "step": .013
});
camera.position.set(-3, 5, 20).setLength(19);
controls.maxDistance = 50;

$("#id-range,#id-2").val((originalID * 25.4).toFixed(2));
$("#len-range,#length-2").val((originalLEN * 25.4).toFixed(0));
$("#wall, #wall-range").val((originalWALL * 25.4).toFixed(3));
odController.setValue(originalOD * 25.4);
idController.setValue(originalID * 25.4);
$("#od-range,#od-3").val((originalOD * 25.4).toFixed(2));
lengthController.setValue(5);
 }
calculate(false);
 });

function createLine(){
  var find = $(".line");
var lineItem = find.length +1
var id = $("#id-2").val();
var od = $("#od-3").val();
var wall = $("#wall").val();
var length = $("#length-2").val();
var idTol = $("#id-tol-2").val();
var odTol = $("#od-tol-2").val();
var wallTol = $("#wall-tol").val();
var lenTol = $("#length-tol-2").val();
var material = $("#material-2").val();
var additive = $("#color-2").val();
var color = $("#colorant").val();
var quantity = $("#quantity-2").val();
var cert = $('input[data-name=cert]:checked').val();
var unit = $("#unit").val();
var price = $('#'+ $('input[data-name=price]:checked').val()).val();
var leadtime =  $('input[data-name=price]:checked').val();
if(!$("#custom-quote").is(":checked")){
var lineHtml = 
`<div class="line" id="line`+lineItem+`">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +`</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
		<div class="item"><p class="label">ID</p><input class="quote-input" id="l`+lineItem+`-id" value="`+id+`" readonly></input></div>
  	<div class="item"><p class="label">OD</p><input class="quote-input" id="l`+lineItem+`-od" value="`+od+`" readonly></input></div>
    <div class="item"><p class="label">Wall</p><input class="quote-input" id="l`+lineItem+`-wall" value="`+wall+`" readonly></input></div>
  	<div class="item"><p class="label">Length</p><input class="quote-input" id="l`+lineItem+`-length" value="`+length+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+material+`" readonly></input></div>
    <div class="item"><p class="label">Color</p><input class="quote-input" id="l`+lineItem+`-color" value="`+color+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;"></input>
    
	</div>
	<div class="col">
  	<div class="item"><p class="label">ID Tol</p><input class="quote-input" id="l`+lineItem+`-id-tol" value="`+idTol+`" readonly></input></div>
    <div class="item"><p class="label">OD Tol</p><input class="quote-input" id="l`+lineItem+`-od-tol" value="`+odTol+`" readonly></input></div>
    <div class="item"><p class="label">Wall Tol</p><input class="quote-input" id="l`+lineItem+`-wall-tol" value="`+wallTol+`" readonly></input></div>
    <div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-length-tol" value="`+lenTol+`" readonly></input></div>
    <div class="item"><p class="label">Additive</p><input class="quote-input" id="l`+lineItem+`-additive" value="`+additive+`" readonly></input></div>
    <div class="item"><p class="label">Quantity</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input>
  </div>
  </div>
</div>`;} else {
var lineHtml = 
`<div class="line" id="line`+lineItem+`">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +`</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
		<div class="item"><p class="label">ID</p><input class="quote-input" id="l`+lineItem+`-id" value="`+id+`" readonly></input></div>
  	<div class="item"><p class="label">OD</p><input class="quote-input" id="l`+lineItem+`-od" value="`+od+`" readonly></input></div>
    <div class="item"><p class="label">Wall</p><input class="quote-input" id="l`+lineItem+`-wall" value="`+wall+`" readonly></input></div>
  	<div class="item"><p class="label">Length</p><input class="quote-input" id="l`+lineItem+`-length" value="`+length+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+material+`" readonly></input></div>
    <div class="item"><p class="label">Color</p><input class="quote-input" id="l`+lineItem+`-color" value="`+color+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;" checked></input>
    
	</div>
	<div class="col">
  	<div class="item"><p class="label">ID Tol</p><input class="quote-input" id="l`+lineItem+`-id-tol" value="`+idTol+`" readonly></input></div>
    <div class="item"><p class="label">OD Tol</p><input class="quote-input" id="l`+lineItem+`-od-tol" value="`+odTol+`" readonly></input></div>
    <div class="item"><p class="label">Wall Tol</p><input class="quote-input" id="l`+lineItem+`-wall-tol" value="`+wallTol+`" readonly></input></div>
    <div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-length-tol" value="`+lenTol+`" readonly></input></div>
    <div class="item"><p class="label">Additive</p><input class="quote-input" id="l`+lineItem+`-additive" value="`+additive+`" readonly></input></div>
    <div class="item"><p class="label">Quantity</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input>
  </div>
  </div>
</div>`;  
}
 
$("#quote").append(lineHtml);
}
var user = JSON.parse(localStorage.getItem('pocketbase_auth'));
function styles() {
  var lineItem = 1;
  var greenlight = $(".line-greenlight");
  for(var i = 0; i < greenlight.length; i++){
    if ($(greenlight[i]).is(":checked")) {
    var line = $(greenlight[i]).closest('.line');
    line.find('.quote-input').addClass('red-input');
    line.addClass('red-line');
    line.find('.input-remove').addClass('hide-price');
    }
    else {
    var line = $(greenlight[i]).closest('.line');
    line.find('.quote-input').removeClass('red-input');
    line.removeClass('red-line');
    line.find('.input-remove').removeClass('hide-price');
    }
  }
  if($('.line-greenlight:checkbox:checked').length > 0) {
  
    $("#view-quote").text("View Custom Quote");
    $("#view-quote").closest('div').css('background-color', '#f06f59');
    $('input[id="final-check"]').prop("checked", false);
    $("#final-check-text").val(false);
  } else {
  
    $("#view-quote").text("View Instant Quote");
    $("#view-quote").closest('div').css('background-color', '#91c765');
    $('input[id="final-check"]').prop("checked", true);
    $("#final-check-text").val(true);
  }
  var leadtime =$(".line-leadtime");
  for(var i = 0; i < leadtime.length; i++){
    if ($(leadtime[i]).val() == '2-day') {  
      
      if ( user.model.credit_terms == false ) {
      $("#view-po").addClass('hide-price');
      } else {
      $("#view-po").removeClass('hide-price');
      }
      return;
    } else {
      $("#view-po").removeClass('hide-price');
    }
  }
  
}


$("#add-extrusion").click(function() {
if($("#material-2").val() == '') {$("#material-2").css('border', '3px solid #ff6f6f');$("#material-2").get(0).scrollIntoView(); $("#greenlight").prop('checked', false); $("greenlight").trigger('change');  return;}
if ($("#greenlight").is(":checked")){

createLine();
styles();
resetInputs();
$("#quote-panel").css('display', 'flex');
$("#price-block").css('display', 'none');
$("#level-0").prop('checked', true);
$("#next-step").removeClass('hide-price');

} else {
  if($("#custom-quote").is(":checked")){
  $("#custom-dialogue").css('display', 'flex');
  } 
  //else { createLine(); $("#price-block").css('display', 'none'); $("#quote-panel").css('display', 'flex'); styles();}
}
});


function resetInputs() {
  $("#unit").val('in');
  $("#id-2,#id-range").val(0.100);
  $("#id-tol-2,#wall-tol").val(0.001);
  $("#od-3,#od-range").val(0.120);
  $("#length-2,#len-range").val(12);
  $("#length-tol-2").val('MIN');
  $("#od-tol-2").val('REF');
  $("#quantity-2").val(300);
  $('input[id="od-4"]').prop("checked",true);
  $('input[id="od-4"]').trigger("change");
  $("#material-2").val($("#material-2 option:first").val());
  $("#color-2").val($("#color-2 option:first").val());
  $("#colorant").val($("#colorant option:first").val());
  $("#color").trigger("change");
  $("#price-block").css('display', 'none');
}

$("input[id=2-day]").click(function() {
  if( user.model.credit_terms == false ) {
  $("#2day-dialog").dialog("open");
  }
});

$("#custom-change").click(function() {
  
  $("#wall, #id-2, #od-3, #length-2").css('border', 'none');
  $("#id-tol-2, #od-tol-2, #length-tol-2, #wall-tol").css('border', '1px solid white');
  $("#custom-quote").prop('checked', true);
  $("#custom-quote").trigger('change');
  if($('#editing').css('display') == 'none') { createLine(); styles();$("#next-step").removeClass('hide-price');} else { update(); styles();}
  $("#quote-panel").css('display', 'flex');
  $("#custom-dialogue").css('display', 'none');
  $(".ui-dialog-content").dialog("close");
  resetInputs();
});
$("#custom-quote").on('change', function() {
  if ($(this).is(":checked")) {
    
    $("#price-block").css('display', 'none');
    //document.querySelectorAll('.input-remove').forEach(e => e.hide());
    
    //$("#wall,#length-2,#length-tol-2,#id-tol-2,#wall-tol,#id-2,#quantity-2").removeClass("error");
  }
});

$("#continue").click(function() {
  if($('input[id="final-check"]').is(":checked")) {
  //Order is greenlight
  $("#final-details").css('display', 'block');  
  $('html, body').animate({
        scrollTop: $("#final-details").offset().top
    }, 2000);
  } else {
  //Order is custom
  $("#custom-menu").removeClass('hide-price');
  $('html, body').animate({
        scrollTop: $("#custom-menu").offset().top
    }, 2000);
  }
  
  $("#next-step").addClass('hide-price');
});

$("#add-another").click(function(){
  $("#next-step").addClass('hide-price');
  $("#quote-panel").css('display', 'none');
});
$("#view-carrier").click(function() {
  if($("#carrier-details").hasClass('hide-price')) {
  $("#carrier-details").removeClass('hide-price');
  $(this).text("I don't want to use my shipping account");
  } else {
  $("#carrier-details").addClass('hide-price');
  $(this).text('Charge to your shipping account');
  $("#shipping-account").val('');
  }
});
$("#view-po").click(function() {
  $("#po-details").css('display', 'flex');
});

$("#shipping-carrier").on('change', function() {
  if(this.value == 'UPS') {
    $("#custom-method").empty().append('<option value="UPS Ground">UPS Ground</option><option value="UPS 2nd Day Air">UPS 2nd Day Air</option><option value="UPS 3rd Day Select">UPS 3rd Day Select</option><option value="UPS Next Day Air">UPS Next Day Air</option><option value="UPS Worldwide Expedited">UPS Worldwide Expedited</option><option value="UPS Worldwide Saver">UPS Worldwide Saver</option>');
    
  } else {
    $("#custom-method").empty().append('<option value="FedEx Ground">FedEx Ground</option><option value="FedEx Priority Overnight">FedEx Priority Overnight</option><option value="FedEx Standard Overnight">FedEx Standard Overnight</option><option value="FedEx 2 Day">FedEx 2 Day</option><option value="FedEx Express Saver">FedEx Express Saver</option><option value="FedEx International First">FedEx International First</option><option value="FedEx International Priority">FedEx International Priority</option><option value="FedEx International Priority Express">FedEx International Priority Express</option><option value="FedEx International Economy">FedEx International Economy</option>');
  }
});

$(document).on("click", ".edit", function(){
$("#next-step").addClass('hide-price');
$("#final-details").css('display', 'none');
$("#custom-menu").addClass('hide-price');
var line = this.id;
$(".line").not("#line"+line).addClass('opacity');
$("#").prop("checked",($("#l"+ line + "-greenlight").is(":checked")));
$("#unit").val($("#l"+ line + "-unit").val());
$("#unit").trigger('change');
$("#id-2, #id-range").val($("#l"+ line + "-id").val());
  //idController.setValue(Number($("#l"+ line + "-id").val()));
$("#od-3, #od-range").val($("#l"+ line + "-od").val());
  //odController.setValue(Number($("#l"+ line + "-od").val()));
$("#length-2, #len-range").val($("#l"+ line + "-length").val());
$("#id-tol-2").val($("#l"+ line + "-id-tol").val());
$("#wall").val($("#l"+ line + "-wall").val());
$("#od-tol-2").val($("#l"+ line + "-od-tol").val());
$("#wall-tol").val($("#l"+ line + "-wall-tol").val());
$("#length-tol-2").val($("#l"+ line + "-length-tol").val());
$("#material-2").val($("#l"+ line + "-material").val());
$("#color-2").val($("#l"+ line + "-additive").val());
$("#colorant").val($("#l"+ line + "-color").val());
$("#quantity-2").val($("#l"+ line + "-quantity").val());
$("#editing").css('display', 'flex');
$("#now-editing").val(line);
$(".update, .update-button").css('display', 'flex');
   if(!$("#custom-quote").is(":checked")){
var radioId = $("#l"+line+"-leadtime").val().replace('-price','');
var certId = $("#l"+line+"-cert").val();
$("#"+radioId).prop('checked', true);
$("#level-"+certId).prop('checked', true);
   }
$("#id-2, #od-3, #wall, #material-2").trigger('change');
$("#submit-container").css('display', 'none');
  if(!$("#custom-quote").is(":checked")){
    $("#price-block").css('display', 'flex');
  }
  if($("#l"+ line + "-id-tol").val() == 'REF') { $("#id-3").prop("checked", true); $("#id-3").trigger('change');}
  if($("#l"+ line + "-od-tol").val() == 'REF') { $("#od-4").prop("checked", true); $("#od-4").trigger('change');}
  if($("#l"+ line + "-wall-tol").val() == 'REF') { $("#wall-2").prop("checked", true); $("#wall-2").trigger('change');}

  calculate(false);
});


function update() {
var line = $("#now-editing").val();
$("#l"+ line + "-unit").val($("#unit").val());
$("#l"+ line + "-id").val($("#id-2").val());
$("#l"+ line + "-od").val($("#od-3").val());
$("#l"+ line + "-wall").val($("#wall").val());
$("#l"+ line + "-length").val($("#length-2").val());
$("#l"+ line + "-id-tol").val($("#id-tol-2").val());
$("#l"+ line + "-od-tol").val($("#od-tol-2").val());
$("#l"+ line + "-wall-tol").val($("#wall-tol").val());
$("#l"+ line + "-length-tol").val($("#length-tol-2").val());
$("#l"+ line + "-material").val($("#material-2").val());
$("#l"+ line + "-additive").val($("#color-2").val());
$("#l"+ line + "-color").val($("#colorant").val());
$("#l"+ line + "-quantity").val($("#quantity-2").val());
 if(!$("#custom-quote").is(":checked")){
$("#l"+ line + "-cert").val($('input[data-name=cert]:checked').val());
$("#l"+ line + "-price").val($('#'+ $('input[data-name=price]:checked').val()).val());
$("#l"+ line + "-leadtime").val($('input[data-name=price]:checked').val().replace('-price', ''));
 }
$("#editing").css('display', 'none');
$(".update, .update-button").css('display', 'none');
$("#submit-container").css('display', 'flex');
$("#price-block").css('display', 'none');
$("#l"+ line + "-greenlight").prop("checked",($("#custom-quote").is(":checked")));
}


$("#update").click(function(){

update();
styles();
$(".line").removeClass('opacity');
$("#next-step").removeClass('hide-price');
});

$(document).on("click", ".delete", function(){
  $(this).closest('.line').remove();
  var lineItem = 1;
  $(".line").map(function() {
    $(this).find('.line-title').first().text('Line '+ lineItem);
    $(this).find('.linenumber').val(lineItem);
    $(this).find('.edit').first().attr("id", lineItem);
    $(this).find('input').map(function(){
      this.id = this.id.replace(/[0-9]/g, lineItem);
      
    });
  ++lineItem;
  });
});

function createArray() {
   
  var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
    total += Number($(getTotal[i]).val());
}

  if($('input[id="final-check"]').is(":checked")) {
  var fee = total * 0.03;
   
  ///////// Ad cc processing fee
var find = $(".line");
var lineItem = find.length + 1;
var lineHtml = 
`<div class="line" id="line`+lineItem+`" style="display:none;">
		<input class="quote-input" id="l`+lineItem+`-id" value="CC Processing Fee" readonly></input>
  	<input class="quote-input" id="l`+lineItem+`-price" value="`+fee+`" readonly></input>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
</div>`;
    if(!$("#po-number").val()) {
$("#quote").append(lineHtml);  
    }
$("#total-price").val(total);
  }
  
   
  /////////
  let order = [];
  var lines = $(".line");
  for (let i = 0; i < lines.length; ++i) {
    
    let line = {};
    var inputs = $("#"+lines[i].id).find('input');
    for (let a = 0; a < inputs.length; ++a) {
      
      var id = inputs[a].id;
      if (inputs[a].id.includes('greenlight')) {
      var value = $(inputs[a]).is(":checked");
      } else {
      var value = inputs[a].value;
      }
      //line.push({ [id] : value });
      line[id] = value;
    }
    order = order.concat(line);
    
}
var output = JSON.stringify(order);
 $("#order").val(output);
 $("#shipping").val($("#shipping-method").val());
 $("#custom-carrier").val($("#shipping-carrier").val());
 $("#account-number").val($("#shipping-account").val());
 $("#user-details").val(JSON.stringify(JSON.parse(localStorage.getItem("pocketbase_auth"))));
 $("#po-number-submit").val($("#purchase-order-file").val());
 $("#preferred-method").val($("#custom-method").val());
 //$("#po-file").val($("#purchase-order-file").val());
 $("#quote").submit();

}
$("#checkout").click(function() {
  if(!$("#shipping-carrier").val() && !$("#shipping-method").val()) {
    $("#shipping-dialog").dialog("open");
    return false;
  }
  if($("#shipping-carrier").val() && !$("#shipping-account").val()) {
    $("#account-dialog").dialog("open");
    return false;
  }
  if( !$("#po-number").val() ) {
  createArray();
  $("#loading").css("display", "flex");
  }
  if( $("#po-number").val().length > 0) {
    if ($('input[id="po-verification"]').is(":checked")) { createArray(); $("#loading").css("display", "flex"); }
    else {  $('#verification').dialog("open"); }
  } 
});

$("#upload-po").click(function() {
  if(!$("#shipping-carrier").val() && !$("#shipping-method").val()) {
    $("#shipping-dialog").dialog("open");
    return false;
  }
  if($("#shipping-carrier").val() && !$("#shipping-account").val()) {
    $("#account-dialog").dialog("open");
    return false;
  }
  $("#upload-container").removeClass('hide-price');
});
$("#po-buy").click(function() {
  if(!$("#shipping-carrier").val() && !$("#shipping-method").val()) {
    $("#shipping-dialog").dialog("open");
    return false;
  }
  if($("#shipping-carrier").val() && !$("#shipping-account").val()) {
    $("#account-dialog").dialog("open");
    return false;
  }
  $("#po-accept").removeClass('hide-price');
  
  
});
$("#po-verification").click(function() {
  if($(this).is(":checked")) {
    $("#no-po-checkout").removeClass('hide-price');
  } else {
    $("#no-po-checkout").addClass('hide-price');
  }
});

$("#no-po-checkout").click(function() {
  if ($('input[id="po-verification"]').is(":checked")) { createArray(); $("#loading").css("display", "flex"); }
    else {  $('#verification').dialog("open"); }
  
});
$("#po-checkout").click(function() {
   createArray(); $("#loading").css("display", "flex");
  
});
$("#purchase-order-file").on('change', function() {
  $("#upload-container").addClass('hide-price');
  $("#po-checkout").removeClass('hide-price');
  setTimeout(function() {
  $("#upload-po").text($(".text-block-57.w-file-upload-file-name").text());  
  }, 100);
  $("#upload-po").css('background-color', '#91c765');
  
});
$(".close-upload").click(function() {
  $("#upload-container").addClass('hide-price');
});
$("#po-checkout").click(function() {
   createArray(); $("#loading").css("display", "flex");
});
$("#continue-with-custom").click(function() {
  createArray();
  $("#loading").css("display", "flex");
  
});

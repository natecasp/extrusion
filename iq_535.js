import * as THREE from 'three';

			import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
			import { STLExporter } from 'three/addons/exporters/STLExporter.js';
			import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

var sandbox = document.getElementById('sandbox');

let exporter;
let journey;

function updateJourney(step) {
  journey += '[' + step + ']';
  var message = {
  "customer_journey": journey
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
}

let scene = new THREE.Scene();
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
      opacity: .85,
      rotation: true,
      sphereColor: "#333"
}

const folder = gui.addFolder( 'Export' );
const odController = folder.add( params, 'OD', .03, .5, .001).onChange( createShape );   
const idController = folder.add( params, 'ID', .02, .45, .001).onChange( createShape ); 
const lengthController = folder.add(params, 'Length', 0, 100, .2).onChange( createShape );
const materialController = folder.add(params, 'modelColor', ['#ffffff','#000000','#97999B','#00AB8E','#006A52', '#004B87', '#002855', '#9678D3']).onChange( createShape );
const opacityController = folder.add(params, 'opacity', 0.1, 1, 0.6).onChange ( createShape );
const sphereController = folder.add(params, 'sphereColor', ['#333', '#e0e0e0']).onChange( createSphere );
sphereController.hide();
opacityController.hide();
materialController.hide();
lengthController.hide();
idController.hide();
odController.hide();
const imageController = folder.add( params, 'takeScreenshot').name('Save as Image');
const stlController = folder.add( params, 'exportBinary').name('Save as STL');
const rotationController = folder.add( params, 'rotation' ).name('Rotate').onChange( createShape );
folder.open();

function createSphere() {
const spheregeometry = new THREE.SphereGeometry( 40, 32, 16 );
const material = new THREE.MeshStandardMaterial({color: params.sphereColor, roughness: .8});
const sphere = new THREE.Mesh( spheregeometry, material ); 
sphere.material.side = THREE.BackSide;
sphere.receiveShadow = true;

const bg = new THREE.Object3D();

bg.name = "bg";
bg.add(sphere);
scene.add(bg);
console.log('i have been loaded');
}
createSphere();
let rotate = 0.005;
function createShape(){

if ($("#unit").val() == 'in'){var tol = 0.002;}else{var tol= 0.05;}
if((Number(params.OD) - Number(params.ID)) < 0) {
  var od = Number(params.ID) + Number(tol);
  //this.setValue(od);
} else {
  var od = Number(params.OD);
}
if((params.ID - params.OD) > 0) {
  var id = Number(params.OD) - Number(tol);
  //this.setValue(id);
} else {
  var id = Number(params.ID);
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
if(params.rotation == true) { rotate = 0.005;} else {rotate = 0;};
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

var day = dayjs().day();
if (day == 6) {
$("#4-week-date").text(dayjs().add(30, 'day').format('MMMM DD'));
$("#3-week-date").text(dayjs().add(23, 'day').format('MMMM DD'));
$("#2-week-date").text(dayjs().add(16, 'day').format('MMMM DD'));
$("#1-week-date").text(dayjs().add(9, 'day').format('MMMM DD'));
$("#2-day-date").text(dayjs().add(5, 'day').format('MMMM DD'));
}
else if (day == 7) {
$("#4-week-date").text(dayjs().add(29, 'day').format('MMMM DD'));
$("#3-week-date").text(dayjs().add(22, 'day').format('MMMM DD'));
$("#2-week-date").text(dayjs().add(15, 'day').format('MMMM DD'));
$("#1-week-date").text(dayjs().add(8, 'day').format('MMMM DD'));
$("#2-day-date").text(dayjs().add(4, 'day').format('MMMM DD'));
} else {
$("#4-week-date").text(dayjs().add(28, 'day').format('MMMM DD'));
$("#3-week-date").text(dayjs().add(21, 'day').format('MMMM DD'));
$("#2-week-date").text(dayjs().add(14, 'day').format('MMMM DD'));
$("#1-week-date").text(dayjs().add(7, 'day').format('MMMM DD'));
$("#2-day-date").text(dayjs().add(3, 'day').format('MMMM DD'));
}


var user = "";
setTimeout(function() {
user = JSON.parse(localStorage.getItem('pocketbase_auth'));
var reward = user.model.reward;
if((sessionStorage.getItem("rewards") !== null) && (Number((sessionStorage.getItem("rewards"))) > 0)) {
var storedReward = Number(sessionStorage.getItem("rewards"));
var checkReward = Math.min(reward, storedReward);
} else {
var checkReward = reward;
}
$("#reward-counter").val(checkReward);
if(reward > 0) {
$("#reward-box").removeClass("hide-price");
$("#reward-counter").val(checkReward);
$("#expedites-remaining").text(checkReward);
}
}, 1500);

$(document).on("change", "#apply-expedite", function(){
if($(this).is(":checked")) {
$("#2-week-price").val($("#4-week-price").val());
$("#2-week").prop('checked', true).trigger('change');
} else {
$("#4-week-price").trigger('change');
}
});


$("#4-week-price").on('change', function(){
var discount = 1 - Number(user.model.discount);
var startPrice = this.value;
$("#4-week-price").val((Number(startPrice)*discount).toFixed(2));
$("#4-week-discount").text('$' + (Number(startPrice).toFixed(2)));
$("#3-week-price").val(((Number(startPrice)+300)*discount).toFixed(2));
$("#3-week-discount").text('$' + (Number(startPrice)+300).toFixed(2));
$("#2-week-price").val(((Number(startPrice)+600)*discount).toFixed(2));
$("#2-week-discount").text('$' + (Number(startPrice)+600).toFixed(2));
$("#1-week-price").val(((Number(startPrice)+1100)*discount).toFixed(2));
$("#1-week-discount").text('$' + (Number(startPrice)+1100).toFixed(2));
$("#2-day-price").val(((Number(startPrice)+2100)*discount).toFixed(2));
$("#2-day-discount").text('$' + (Number(startPrice)+2100).toFixed(2));
});

$(document).ready(function() {
 var browser = $.browser.name +
               " v" + $.browser.versionNumber + 
               " on " + $.browser.platform;
 var message = {
    "system": browser
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
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
  $('#too-many-lines').dialog({
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
  $('#high-tol').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#id-tol-2",
    collision: "none"
  }
  });
  $('#wall-savings').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#wall",
    collision: "none"
  }
  });
  $('#wall-tol-savings').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#wall-tol",
    collision: "none"
  }
  });
   $('#id-tol-savings').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#id-tol-2",
    collision: "none"
  }
  });
   $('#od-tol-savings').dialog({
    autoOpen : false, position: { 
    my: "left+10 top", 
    at: "right top",
    of: "#od-tol-2",
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
              if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21', 'Grilamid L25'].includes($("#material-2").val()) ){
              $("#od-4").prop("checked", true);
              $("#od-4").trigger("change");
              } else {
              $("#id-3").prop("checked", true);
              $("#id-3").trigger("change");
              }
              $(this).dialog("close");
              calculate(false);
    }
  }
  });
});

function checkLenTol(lengthTol) {
 
  if ( lengthTol !== 'min' ) { 
    $("#length-tol-2").addClass("error"); 
  } else { 
    $("#length-tol-2").removeClass("error");
}
}
function checkRefTol(yellowRefTol, refTolerance, isSoft) {
  console.log('check ref');
  if(isSoft) { console.log('ref firing');
  if ( Number(yellowRefTol) > Number(refTolerance) ) {console.log('refTol' + yellowRefTol + 'refTolerance'+refTolerance); $("#od-tol-savings").dialog("close");$("#od-tol-2").addClass("error"); } else {$("#od-tol-2").removeClass("error"); console.log('remove error');}
  } else {
  if ( Number(yellowRefTol) > Number(refTolerance) ) { $("#id-tol-savings").dialog("close");$("#id-tol-2").addClass("error"); } else {$("#id-tol-2").removeClass("error");}
  }
}
function checkWallTol(yellowWallTol, wallTolerance) {
   if ( Number(yellowWallTol) > Number(wallTolerance) ) { $("#wall-savings").dialog("close");$("#wall-tol").addClass("error"); } else {$("#wall-tol").removeClass("error");}
}
function identifyCostSavings(wallMin, wallMax, refTol, wallTol, refTolerance, isSoft) {
  var wall = Number($("#wall").val());
  var wallTolerance = Number($("#wall-tol").val());
  
  if(wall < wallMin || wall > wallMax) {
    var message = 'You could save $300 dollars if your wall thickness is between ' + wallMin + ' - ' + wallMax + '.';
    $("#wall-savings").dialog('option', 'title', message).dialog("open");
  } else if(wall >= wallMin || wall<= wallMax) {
    $("#wall-savings").dialog("close");
  }
  if(wallTolerance < wallTol) {
    var message = 'You could save $300 dollars if your wall tolerance is ' + wallTol + ' or greater.';
    $("#wall-tol-savings").dialog('option', 'title', message).dialog("open");
  } else if(wallTolerance >= wallTol){
    $("#wall-tol-savings").dialog("close");
  }

  if(isSoft) { var identifier = 'OD'; var target= 'od-tol-savings'} else {var identifier = 'ID'; var target = 'id-tol-savings'}
  if(refTolerance < refTol) {
    var message = 'You could save $300 dollars if your ' + identifier + ' tolerance is ' + refTol + ' or greater.';
    $("#" + target).dialog('option', 'title', message).dialog("open");
  } else if(refTolerance >= refTol) {
    $("#" + target).dialog("close");
  }
  
}

function calculate(isTol) {
//IF CUSTOM QUOTE, IGNORE
//if ($("#custom-quote").is(":checked")) {
//  return;
//}

//IF MATERIAL IS HARD
var id = Number($("#id-2").val());
var od = Number($("#od-3").val());
var greenlight = $("#greenlight");
var wall = Number($("#wall").val());
var length = Number($("#length-2").val());
var lengthElement = $("#length-2").hasClass('error');
var refTolerance = $("#id-tol-2").val();
var wallTolerance = $("#wall-tol").val();
var material = $("#material-2").val();
var qty = Number($("#quantity-2").val());
var unit =$("#unit").val();
if (unit == 'in') {
//VALIDATE
function validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, isSoft){
  var lengthTol = $("#length-tol-2").val().toLowerCase();
  if(isSoft) {var refTarget = $("#id-3").is(":checked"); var refTolerance = $("#od-tol-2").val();} else {var refTarget = $("#od-4").is(":checked"); var refTolerance = $("#id-tol-2").val();};
  console.log(refTarget);
  var wallTolerance = $("#wall-tol").val();
  var length = Number($("#length-2").val());
  if((wall >= yellowWallMin && wall <= yellowWallMax) && (length <=60) && (length >=12) && (refTarget == true) && (qty <= 2500) && ( id <= 0.300 ) && ( id >= 0.014 ) && (lengthTol == 'min') && (material !== '') && (Number(refTolerance) >= Number(yellowRefTol)) && (Number(wallTolerance) >= Number(yellowWallTol))) { 

    //Set yellow light price, or greenlight price 
    $("#4-week-price").val(Number(basePrice) + 300);
    identifyCostSavings(wallMin, wallMax, refTol, wallTol, refTolerance, isSoft);
    if((wall >= wallMin && wall <= wallMax) && (Number(refTolerance) >= Number(refTol)) && (Number(wallTolerance) >= Number(wallTol))) {
    //close all cost savings dialogs as specs are greenlight
    //
    //
    $("#4-week-price").val(basePrice);
    }
    var preQtyPrice = Number($("#4-week-price").val());
    if(Number($("#quantity-2").val()) == 300) {
    $("#4-week-price").val(preQtyPrice);
  } else if (Number($("#quantity-2").val()) == 1000) {
    $("#4-week-price").val(preQtyPrice + 1050);
  } else if (Number($("#quantity-2").val()) == 2500) {
    $("#4-week-price").val(preQtyPrice + 2200);
  }
  $("#4-week-price").trigger('change');
    //End price determination
    
    $("#custom-quote").prop('checked', false);
    console.log('not-greenlight');
    $("#custom-quote").trigger('change');
    greenlight.prop('checked', true);
    greenlight.trigger('change'); 
    $("#wall,#length-2,#length-tol-2,#od-tol-2,#id-tol-2,#wall-tol,#id-2,#quantity-2").removeClass("error");
    $("#wall-dialog").dialog("close");
    $("#length-dialog").dialog("close");
    $("#qty-dialog").dialog("close");
  } else { 
    $("#custom-quote").prop('checked', true);
    $("#custom-quote").trigger('change');
    greenlight.prop('checked', false); 
    greenlight.trigger('change'); 
    //Check Wall
    if ( wall < yellowWallMin ) { if( !$("#wall").hasClass('error') ){$("#wall-savings").dialog("close");$("#wall-dialog").dialog('option', 'title', 'Wall Thickness Too Low').dialog("open");$("#wall").addClass("error");} }
    else if ( wall > yellowWallMax ) { if( !$("#wall").hasClass('error') ){$("#wall-savings").dialog("close");$("#wall-dialog").dialog('option', 'title', 'Wall Thickness Too High').dialog("open");$("#wall").addClass("error");} }  else {$("#wall").removeClass("error");$("#wall-dialog").dialog("close");}
                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    //Check ID
    if ( id > 0.300 ) { $("#id-2").addClass("error"); } 
    else if ( id < 0.014 ) { $("#id-2").addClass("error"); } else {$("#id-2").removeClass("error");}
    
    //Check length 
    
    if ( length > 60 ) {console.log(length+100); if( !$("#length-2").hasClass('error') ){ $("#length-dialog").dialog('option', 'title', 'Length Is Too High').dialog("open");$("#length-2").addClass("error");} } 
    
    else if ( length < 12 ) { console.log(length+100); if( !$("#length-2").hasClass('error') ){$("#length-dialog").dialog('option', 'title', 'Length Is Too Low').dialog("open");$("#length-2").addClass("error");} }  else { $("#length-2").removeClass("error");$("#length-dialog").dialog("close");}
    //Check Quantity
    if ( qty > 2500 ) { if( !$("#quantity-2").hasClass('error') ){$("#qty-dialog").dialog("open");$("#quantity-2").addClass("error")} } else { $("#quantity-2").removeClass("error"); $("qty-dialog").dialog("close");};
    //Check Tolerances
    checkLenTol(lengthTol);
    checkRefTol( yellowRefTol, refTolerance, isSoft);
    checkWallTol(yellowWallTol, wallTolerance);
    
    
  }
  
}


  
if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21','PET','Delrin','Grilamid L25'].includes($("#material-2").val()) ){
  var basePrice = 900;
    if (id < 0.014) {
    if(isTol == false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.0005);} var yellowWallMin = 0.002; var yellowWallTol = 0.0005; var yellowWallMax = 0.01; var yellowRefTol = 0.001; var wallMin = 0.002; var wallMax = 0.010; var refTol = 0.001; var wallTol = 0.0005;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
    
  }
  //CATEGORY 1 .014-.050
  if(id >= 0.014 && id <=0.050) { 
  if(isTol == false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.0005);} var yellowWallMin = 0.0015; var yellowWallTol = 0.0005; var yellowWallMax = 0.0125; var yellowRefTol = 0.0005; var wallMin = 0.002; var wallMax = 0.010; var refTol = 0.001; var wallTol = 0.0005;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 2 .051-.100
  if(id >= 0.051 && id <=0.100) { 
    if(isTol == false) {$("#id-tol-2").val(0.001); $("#wall-tol").val(0.001);} var yellowWallMin = 0.0025; var yellowWallTol = 0.001; var yellowWallMax = 0.020; var yellowRefTol = 0.0005; var wallMin = 0.003; var wallMax = 0.015; var refTol = 0.001; var wallTol = 0.001;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 3 .101-.150
  if(id >= 0.101 && id <=0.150) { 
    if(isTol == false) {$("#id-tol-2").val(0.0015); $("#wall-tol").val(0.001);} var yellowWallMin = 0.0025; var yellowWallTol = 0.0005; var yellowWallMax = 0.020; var yellowRefTol = 0.001; var wallMin = 0.003; var wallMax = 0.020;  var refTol = 0.0015; var wallTol = 0.001;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 4 .151-.200
  if(id >= 0.151 && id <=0.200) { 
    if(isTol == false) {$("#id-tol-2").val(0.002); $("#wall-tol").val(0.0015);} var yellowWallMin = 0.0025; var yellowWallTol = 0.0005; var yellowWallMax = 0.025; var yellowRefTol = 0.002; var wallMin = 0.004; var wallMax = 0.025;  var refTol = 0.002; var wallTol = 0.0015;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 5 .201-.250
  if(id >= 0.201 && id <=0.250) { 
    if(isTol == false) {$("#id-tol-2").val(0.0025); $("#wall-tol").val(0.0015);} var yellowWallMin = 0.005; var yellowWallTol = 0.0015; var yellowWallMax = 0.025; var yellowRefTol = 0.0025; var wallMin = 0.005; var wallMax = 0.025;  var refTol = 0.0025; var wallTol = 0.0015;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 6 .251-.300
  if(id >= 0.251 && id <=0.300) { 
    if(isTol == false) {$("#id-tol-2").val(0.003); $("#wall-tol").val(0.002);} var yellowWallMin = 0.006; var yellowWallTol = 0.002; var yellowWallMax = 0.030; var yellowRefTol = 0.003; var wallMin = 0.006; var wallMax = 0.025;  var refTol = 0.003; var wallTol = 0.002;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  if(id> 0.300) {
    if(isTol == false) {$("#id-tol-2").val(0.003); $("#wall-tol").val(0.002);} var yellowWallMin = 0.006; var yellowWallTol = 0.002; var yellowWallMax = 0.030; var yellowRefTol = 0.003; var wallMin = 0.006; var wallMax = 0.025;  var refTol = 0.003; var wallTol = 0.002;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }

}
//IF MATERIAL IS SOFT
else {
 //CATEGORY 1 .014-.050

  if (id < 0.014) {
    if(isTol == false) {$("#od-tol-2").val(0.001); $("#wall-tol").val(0.0005);} var yellowWallMin = 0.002; var yellowWallTol = 0.0005; var yellowWallMax = 0.01; var yellowRefTol = 0.001; var basePrice = 1200; var wallMin = 0.002; var wallMax = 0.010; var refTol = 0.001; var wallTol = 0.0005;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
    
  }
  
  if(id >= 0.014 && id <=0.050) { 
   if(isTol == false) {$("#od-tol-2").val(0.001); $("#wall-tol").val(0.0005);} var yellowWallMin = 0.0015; var yellowWallTol = 0.0005; var yellowWallMax = 0.0125; var yellowRefTol = 0.001; var basePrice = 1200; var wallMin = 0.002; var wallMax = 0.010; var refTol = 0.001; var wallTol = 0.0005;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);

    
  }
  //CATEGORY 2 .051-.100
  if(id >= 0.051 && id <=0.100) { 
     if(isTol == false) {$("#od-tol-2").val(0.001); $("#wall-tol").val(0.001);} var yellowWallMin = 0.003; var yellowWallTol = 0.0005; var yellowWallMax = 0.015; var yellowRefTol = 0.001; var basePrice = 1200;var wallMin = 0.003; var wallMax = 0.015; var refTol = 0.001; var wallTol = 0.001;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);

  }
  //CATEGORY 3 .101-.150
  if(id >= 0.101 && id <=0.150) { 
    if(isTol == false) {$("#od-tol-2").val(0.0015); $("#wall-tol").val(0.001);} var yellowWallMin = 0.003; var yellowWallTol = 0.001; var yellowWallMax = 0.020; var yellowRefTol = 0.0015; var basePrice = 1200; var wallMin = 0.003; var wallMax = 0.020;  var refTol = 0.0015; var wallTol = 0.001;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);

  }
  //CATEGORY 4 .151-.200
  if(id >= 0.151 && id <=0.200) { 
    if(isTol == false) {$("#od-tol-2").val(0.002); $("#wall-tol").val(0.0015);} var yellowWallMin = 0.004; var yellowWallTol = 0.001; var yellowWallMax = 0.025; var yellowRefTol = 0.002; var basePrice = 1200; var wallMin = 0.004; var wallMax = 0.025;  var refTol = 0.002; var wallTol = 0.0015;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);

  }
  //CATEGORY 5 .201-.250
  if(id >= 0.201 && id <=0.250) { 
    if(isTol == false) {$("#od-tol-2").val(0.0025); $("#wall-tol").val(0.0015);} var yellowWallMin = 0.005; var yellowWallTol = 0.0015; var yellowWallMax = 0.025; var yellowRefTol = 0.0025; var basePrice = 1350; var wallMin = 0.005; var wallMax = 0.025;  var refTol = 0.0025; var wallTol = 0.0015;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
  
  }
  //CATEGORY 6 .251-.300
  if(id >= 0.251 && id <=0.300) { 
   if(isTol == false) {$("#od-tol-2").val(0.003); $("#wall-tol").val(0.002);} var yellowWallMin = 0.006; var yellowWallTol = 0.002; var yellowWallMax = 0.025; var yellowRefTol = 0.003; var basePrice = 1350; var wallMin = 0.006; var wallMax = 0.025;  var refTol = 0.003; var wallTol = 0.002;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
   
  }
   if(id> 0.300) {
    if(isTol == false) {$("#od-tol-2").val(0.003); $("#wall-tol").val(0.002);} var yellowWallMin = 0.006; var yellowWallTol = 0.002; var yellowWallMax = 0.025; var yellowRefTol = 0.003; var basePrice = 1350; var wallMin = 0.006; var wallMax = 0.025;  var refTol = 0.003; var wallTol = 0.002;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
  }

} // end else
} // end if inches
///////////////////////////////////////////////////////////////////////////////////////////////////////////// MM
///////////////////////////////////////////////////////////////////////////////////////////////////////////// MM
///////////////////////////////////////////////////////////////////////////////////////////////////////////// MM
else {
  //VALIDATE
function validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, isSoft){
  var lengthTol = $("#length-tol-2").val().toLowerCase();
  if(isSoft) {var refTarget = $("#id-3").is(":checked"); var refTolerance = $("#od-tol-2").val();} else {var refTarget = $("#od-4").is(":checked"); var refTolerance = $("#id-tol-2").val();};
  var wallTolerance = $("#wall-tol").val();
  var length = Number($("#length-2").val());
  if((wall >= yellowWallMin && wall <= yellowWallMax) && (length <=1524) && (length >=304) && (refTarget == true) && (qty <= 2500) && ( id <= 7.62 ) && ( id >= 0.355 ) && (lengthTol == 'min') && (material !== '') && (Number(refTolerance) >= Number(yellowRefTol)) && (Number(wallTolerance) >= Number(yellowWallTol))) { 
    
     //Set yellow light price, or greenlight price 
    $("#4-week-price").val(Number(basePrice) + 300);
    identifyCostSavings(wallMin, wallMax, refTol, wallTol, refTolerance, isSoft);
    if((wall >= wallMin && wall <= wallMax) && (Number(refTolerance) >= Number(refTol)) && (Number(wallTolerance) >= Number(wallTol))) {
    $("#4-week-price").val(basePrice);
    }
    var preQtyPrice = Number($("#4-week-price").val());
    if(Number($("#quantity-2").val()) == 300) {
    $("#4-week-price").val(preQtyPrice);
  } else if (Number($("#quantity-2").val()) == 1000) {
    $("#4-week-price").val(preQtyPrice + 1050);
  } else if (Number($("#quantity-2").val()) == 2500) {
    $("#4-week-price").val(preQtyPrice + 2200);
  }
  $("#4-week-price").trigger('change');
    //End price determination
    
    $("#custom-quote").prop('checked', false);
    $("#custom-quote").trigger('change');
    greenlight.prop('checked', true);
    greenlight.trigger('change'); 
    $("#wall,#length-2,#length-tol-2,#id-tol-2,#od-tol-2,#wall-tol,#id-2,#quantity-2").removeClass("error");
    $("#wall-dialog").dialog("close");
    $("#length-dialog").dialog("close");
    $("#qty-dialog").dialog("close");
  } else { 
    $("#custom-quote").prop('checked', true);
    $("#custom-quote").trigger('change');
    greenlight.prop('checked', false); 
    greenlight.trigger('change'); 
    //Check Wall
    if ( wall < yellowWallMin ) { if( !$("#wall").hasClass('error') ){$("#wall-savings").dialog("close");$("#wall-dialog").dialog('option', 'title', 'Wall Thickness Too Low').dialog("open");$("#wall").addClass("error");} else {console.log('already has error')}}
    else if ( wall > yellowWallMax ) { if( !$("#wall").hasClass('error') ){$("#wall-savings").dialog("close");$("#wall-dialog").dialog('option', 'title', 'Wall Thickness Too High').dialog("open");$("#wall").addClass("error");} else {console.log('already has error')}}  else {$("#wall").removeClass("error");$("#wall-dialog").dialog("close");}
    //Check ID
    if ( id > 7.62 ) { $("#id-2").addClass("error"); } 
    else if ( id < 0.355 ) { $("#id-2").addClass("error"); } else {$("#id-2").removeClass("error");}

    //Check length
    if ( length > 1524 ) { if( !$("#length-2").hasClass('error') ){ $("#length-dialog").dialog('option', 'title', 'Length Is Too High').dialog("open");$("#length-2").addClass("error");} else {console.log('already has error')}} 
    else if ( length < 304 ) { if( !$("#length-2").hasClass('error') ){$("#length-dialog").dialog('option', 'title', 'Length Is Too Low').dialog("open");$("#length-2").addClass("error");} else {console.log('already has error')}}  else { console.log('length reset');$("#length-2").removeClass("error");$("#length-dialog").dialog("close");}
    
   
    //Check Quantity
    if ( qty > 2500 ) { if( !$("#quantity-2").hasClass('error') ){$("#qty-dialog").dialog("open");$("#quantity-2").addClass("error")} else {console.log('already has error')}} else { $("#quantity-2").removeClass("error"); $("qty-dialog").dialog("close");}
    //Check Tolerances
    checkLenTol(lengthTol);
    checkRefTol( yellowRefTol, refTolerance);
    checkWallTol(yellowWallTol, wallTolerance);
  }
  
}


  
if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21','PET','Delrin','Grilamid L25'].includes($("#material-2").val()) ){
  var basePrice = 900;
    if (id < 0.355) {
    if(isTol == false) {$("#id-tol-2").val(0.03); $("#wall-tol").val(0.013);} var yellowWallMin = 0.0508; var yellowWallTol = 0.0127; var yellowWallMax = 0.254; var yellowRefTol = 0.025; var wallMin = 0.0508; var wallMax = 0.254; var refTol = 0.03; var wallTol = 0.013;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
    
  }
  //CATEGORY 1 .355-.1.27
  if(id >= 0.355 && id <= 1.27) { 
  if(isTol == false) {$("#id-tol-2").val(0.03); $("#wall-tol").val(0.013);} var yellowWallMin = 0.0381; var yellowWallTol = 0.0127; var yellowWallMax = 0.318; var yellowRefTol = 0.0127; var wallMin = 0.0508; var wallMax = 0.254; var refTol = 0.03; var wallTol = 0.013;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 2 1.2954 - 2.54
  if(id >= 1.2954 && id <= 2.54) { 
    if(isTol == false) {$("#id-tol-2").val(0.03); $("#wall-tol").val(0.025);} var yellowWallMin = 0.0635; var yellowWallTol = 0.025; var yellowWallMax = 0.508; var yellowRefTol = 0.0127; var wallMin = 0.0762; var wallMax = 0.381; var refTol = 0.03; var wallTol = 0.025;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 3 2.5654 - 3.81
  if(id >= 2.5654 && id <= 3.81 ) { 
    if(isTol == false) {$("#id-tol-2").val(0.04); $("#wall-tol").val(0.025);} var yellowWallMin = 0.0635; var yellowWallTol = 0.0127; var yellowWallMax = 0.508; var yellowRefTol = 0.025; var wallMin = 0.0762; var wallMax = 0.508;  var refTol = 0.04; var wallTol = 0.025;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 4 3.8354 - 5.08
  if(id >= 3.8354 && id <= 5.08) { 
    if(isTol == false) {$("#id-tol-2").val(0.05); $("#wall-tol").val(0.038);} var yellowWallMin = 0.0635; var yellowWallTol = 0.0127; var yellowWallMax = 0.635; var yellowRefTol = 0.0508; var wallMin = 0.1016; var wallMax = 0.635;  var refTol = 0.05; var wallTol = 0.038;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 5 5.105 - 6.35
  if(id >= 5.105 && id <= 6.35) { 
    if(isTol == false) {$("#id-tol-2").val(0.06); $("#wall-tol").val(0.038);} var yellowWallMin = 0.127; var yellowWallTol = 0.0381; var yellowWallMax = 0.635; var yellowRefTol = 0.0635; var wallMin = 0.127; var wallMax = 0.635;  var refTol = 0.06; var wallTol = 0.038;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
  //CATEGORY 6 6.375 - 7.62
  if(id >= 6.375 && id <= 7.62) { 
    if(isTol == false) {$("#id-tol-2").val(0.08); $("#wall-tol").val(0.051);} var yellowWallMin = 0.1524; var yellowWallTol = 0.0508; var yellowWallMax = 0.762; var yellowRefTol = 0.0762; var wallMin = 0.1524; var wallMax = 0.635;  var refTol = 0.08; var wallTol = 0.051;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }
   if(id> 7.62) {
    if(isTol == false) {$("#id-tol-2").val(0.08); $("#wall-tol").val(0.051);} var yellowWallMin = 0.1524; var yellowWallTol = 0.0508; var yellowWallMax = 0.762; var yellowRefTol = 0.0762; var wallMin = 0.1524; var wallMax = 0.635;  var refTol = 0.08; var wallTol = 0.051;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, false);
  }

}
//IF MATERIAL IS SOFT
else {
if (id < 0.355) {
    if(isTol == false) {$("#od-tol-2").val(0.03); $("#wall-tol").val(0.013);} var yellowWallMin = 0.0508; var yellowWallTol = 0.0127; var yellowWallMax = 0.254; var yellowRefTol = 0.025; var wallMin = 0.0508; var wallMax = 0.254; var refTol = 0.03; var wallTol = 0.013;
    var basePrice = 1200;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
    
  }
//CATEGORY 1 .355-.1.27
  if(id >= 0.355 && id <= 1.27) { 
  if(isTol == false) {$("#od-tol-2").val(0.03); $("#wall-tol").val(0.013);} var yellowWallMin = 0.0381; var yellowWallTol = 0.0127; var yellowWallMax = 0.3175; var yellowRefTol = 0.025; var wallMin = 0.0508; var wallMax = 0.254; var refTol = 0.03; var wallTol = 0.013;
    var basePrice = 1200;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
    
  }
  //CATEGORY 2 1.2954 - 2.54
  if(id >= 1.2954 && id <= 2.54) { 
    if(isTol == false) {$("#od-tol-2").val(0.03); $("#wall-tol").val(0.025);} var yellowWallMin = 0.0762; var yellowWallTol = 0.0127; var yellowWallMax = 0.381; var yellowRefTol = 0.025; var wallMin = 0.0762; var wallMax = 0.381; var refTol = 0.03; var wallTol = 0.025;
    var basePrice = 1200;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
  }
  //CATEGORY 3 2.5654 - 3.81
  if(id >= 2.5654 && id <= 3.81 ) { 
    if(isTol == false) {$("#od-tol-2").val(0.04); $("#wall-tol").val(0.025);} var yellowWallMin = 0.0762; var yellowWallTol = 0.025; var yellowWallMax = 0.508; var yellowRefTol = 0.0381; var wallMin = 0.0762; var wallMax = 0.508;  var refTol = 0.04; var wallTol = 0.025;
    var basePrice = 1200;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
  }
  //CATEGORY 4 3.8354 - 5.08
  if(id >= 3.8354 && id <= 5.08) { 
    if(isTol == false) {$("#od-tol-2").val(0.05); $("#wall-tol").val(0.038);} var yellowWallMin = 0.1016; var yellowWallTol = 0.025; var yellowWallMax = 0.635; var yellowRefTol = 0.0508; var wallMin = 0.1016; var wallMax = 0.635;  var refTol = 0.05; var wallTol = 0.038;
    var basePrice = 1200;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
    
  }
   //CATEGORY 5 5.105 - 6.35
  if(id >= 5.105 && id <= 6.35) { 
    if(isTol == false) {$("#od-tol-2").val(0.06); $("#wall-tol").val(0.038);} var yellowWallMin = 0.127; var yellowWallTol = 0.0381; var yellowWallMax = 0.635; var yellowRefTol = 0.0635; var wallMin = 0.127; var wallMax = 0.635;  var refTol = 0.06; var wallTol = 0.038;
    var basePrice = 1350;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
  
  }
  //CATEGORY 6 6.375 - 7.62
  if(id >= 6.375 && id <= 7.62) { 
    if(isTol == false) {$("#od-tol-2").val(0.08); $("#wall-tol").val(0.051);} var yellowWallMin = 0.1524; var yellowWallTol = 0.0508; var yellowWallMax = 0.635; var yellowRefTol = 0.0762; var wallMin = 0.1524; var wallMax = 0.635;  var refTol = 0.08; var wallTol = 0.051;
    var basePrice = 1350;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
    
  }
  if(id> 7.62) {
    if(isTol == false) {$("#od-tol-2").val(0.08); $("#wall-tol").val(0.051);} var yellowWallMin = 0.1524; var yellowWallTol = 0.0508; var yellowWallMax = 0.635; var yellowRefTol = 0.0762; var wallMin = 0.1524; var wallMax = 0.635;  var refTol = 0.08; var wallTol = 0.051;
    var basePrice = 1350;
    validate(basePrice, yellowWallMin, yellowWallMax, yellowRefTol, yellowWallTol, wallMin, wallMax, refTol, wallTol, true);
  }

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
if (['Pebax 45D','Pebax 55D','Pebax 63D', 'Pebax 70D', 'Pebax 72D', 'Pebax 74D', 'Vestamid ML21','Grilamid L25'].includes($("#material-2").val()) ){
  if((($(this).val() == 'id') || ($(this).val() == 'wall'))) {
  $('#ref-dialog').dialog("open");
  }
} else {
  if((($(this).val() == 'od') || ($(this).val() == 'wall'))) {
  $('#ref-dialog').dialog("open");
}
}
});
$('#mode').on('change', function() {
if($(this).is(":checked")) {
$(".white-text,.text-block-71,.radio-button-label-3,.cert-title,.radio-button-label-2,.sales-rep,.text-block-38,.price-title,.cost,.text-block-37,.text-block-64,.text-block-65,.slider,.text-field-3,.leadtime,.shipping-title,.tol").addClass('light-text');
$('.image-171,.image-167').addClass('reverse');
$('.column-7').addClass('white-background');
$('.text-field-3.tol,.divider').addClass('gray-background');
$('.slim').addClass('no-border');
$('.range-slider').addClass('light-border');
$('#add-extrusion').addClass('blue-button');
sphereController.setValue("#e0e0e0");
$('.price-line').removeClass('chosen');
$('input[data-name=price]:checked').trigger('change');
} else {
$(".white-text,.text-block-71,.radio-button-label-3,.cert-title,.radio-button-label-2,.sales-rep,.text-block-38,.price-title,.cost,.text-block-37,.text-block-64,.text-block-65,.slider,.text-field-3,.leadtime,.shipping-title,.tol").removeClass('light-text');
$('.image-171,.image-167').removeClass('reverse');
$('.column-7').removeClass('white-background');
$('.text-field-3.tol,.divider').removeClass('gray-background');
$('.slim').removeClass('no-border');
$('.range-slider').removeClass('light-border');
$('#add-extrusion').removeClass('blue-button');
sphereController.setValue("#333");
$('.price-line').removeClass('chosen-light');
$('input[data-name=price]:checked').trigger('change');
}
});

$('input[data-name=price]').on('change', function() {
  if($("#mode").is(":checked")) {
  $('.price-line').removeClass('chosen-light');
  $(this).closest('div').addClass('chosen-light');
  } else {
  $('.price-line').removeClass('chosen');
  $(this).closest('div').addClass('chosen'); 
  }
  $("#apply-expedite").trigger('change');
});

$('input[data-name=REF]').on('change', function() {
$("span.blue").removeClass('hide-price');
$("#title-"+$(this).val()).addClass('hide-price');
$(".div-block-264").css('opacity', 1);
$(this).closest('div.div-block-264').css('opacity', .1);
if($(this).val() == 'id' && $(this).is(":checked")) {  $("#id-tol-2").val('REF'); $("#id-2, #id-range, #id-tol-2").prop('disabled', true); $("#od-3, #od-range, #wall, #wall-range, #od-tol-2, #wall-tol").prop('disabled', false); if($("#wall-tol").val() == 'REF') {$("#wall-tol").val(0.001)}; if($("#od-tol-2").val() == 'REF') {$("#od-tol-2").val(0.001)}; calculate(false);}
if($(this).val() == 'od' && $(this).is(":checked")) { $("#od-tol-2").val('REF'); $("#od-3, #od-range, #od-tol-2").prop('disabled', true); $("#id-2, #id-range, #wall, #wall-range, #wall-tol, #id-tol-2").prop('disabled', false); if($("#wall-tol").val() == 'REF') {$("#wall-tol").val(0.001)}; if($("#id-tol-2").val() == 'REF') {$("#id-tol-2").val(0.001)}; calculate(false);}
if($(this).val() == 'wall' && $(this).is(":checked")) {  $("#wall-tol").val('REF'); $("#wall, #wall-range, #wall-tol").prop('disabled', true); $("#id-2, #id-range, #od-3, #od-range, #od-tol-2, #id-tol-2").prop('disabled', false); if($("#id-tol-2").val() == 'REF') {$("#id-tol-2").val(0.001)}; if($("#od-tol-2").val() == 'REF') {$("#od-tol-2").val(0.001)};}
calculate(true);
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
var od = Number($("#od-range").val());
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;var min = 0.014; var max = 0.300;}else{var tol= 0.05;var sig = 2; var wsig = 3;var min = 0.355; var max = 7.62;}
if(this.value > max) { this.value = max; }
else if(this.value < min) { this.value = min;}
$(this).val(Number(this.value).toFixed(sig));
var getValue = $(this).val();
$("#id-range").val(Number(getValue).toFixed(sig));

var wall = Number($("#wall-range").val());
if(Number(getValue) >= (od - tol)) {
var expandedOD = Number(getValue) + Number(tol);

odController.setValue(expandedOD);
$("#od-range").val(expandedOD.toFixed(sig));
$("#od-3").val(expandedOD.toFixed(sig)).trigger('change');
}

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val(((od-Number(getValue))/2).toFixed(wsig)).trigger('change');
};
idController.setValue(Number(getValue).toFixed(sig));
if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val((Number(getValue)+(wall*2)).toFixed(sig));
  odController.setValue((Number(getValue)+(wall*2)).toFixed(sig));
};

calculate(false);

});

  
$("#od-range").on('input', function(e) {
if ($("#unit").val() == 'in'){var idMin = 0.014; var tol = 0.002;var sig = 3; var wsig = 4;}else{var idMin = 0.355; var tol= 0.05;var sig = 2; var wsig = 3;}
$("#od-3").val(Number(this.value).toFixed(sig));

var id = Number($("#id-range").val());
var wall = Number($("#wall-range").val());

if((Number(this.value)-(wall*2)) < idMin) { $("#od-range,#od-3").val((wall*2) + id); e.preventDefault(); return false; }
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
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4; var min = 0.018; var max = 0.350;}else{var tol= 0.05;var sig = 2; var wsig = 3;var min = 0.457; var max = 8.89;}
var id = Number($("#id-range").val()).toFixed(sig);
var preRoll = this.value;
if(this.value > max) { this.value = max;}
else if(this.value < min) { this.value = min;}
$(this).val(Number(this.value).toFixed(sig));
var getValue = $(this).val();
$("#od-range").val(Number(getValue).toFixed(sig));

var wall = Number($("#wall-range").val());
if(Number(getValue) <= (id + tol)) {
var expandedID = Number(getValue) - tol;

idController.setValue(expandedID);
 
$("#id-range").val(expandedID.toFixed(sig));
$("#id-2").val(expandedID.toFixed(sig));
}
if(preRoll > max) {odController.setValue(Number(getValue).toFixed(sig));};
if($(":radio[value=id]").is(":checked")) {

  $("#id-2, #id-range").val((Number(getValue)-(Number(wall)*2)).toFixed(sig));
  $("#wall, #wall-range").val(((Number(getValue)-Number($("#id-2").val()))/2).toFixed(wsig));
  //causing max stack loop $("#id-2, #id-range").trigger('change');
  //idController.setValue((Number(getValue)-(wall*2)).toFixed(sig));
};

if($(":radio[value=wall]").is(":checked")) {
  $("#wall, #wall-range").val(((Number(getValue)-id)/2).toFixed(wsig)).trigger('change');
};
if(preRoll < min) {odController.setValue(Number(getValue).toFixed(sig));};
  calculate(false);

});



$("#wall-range").on('input', function() {
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4;}else{var tol= 0.05;var sig = 2; var wsig = 3;}
$("#wall").val(Number(this.value).toFixed(wsig));
var id = Number($("#id-range").val());
var od = Number($("#od-range").val());

if($(":radio[value=id]").is(":checked")) {
  if($("#unit").val() == 'in'){ var margin = 0.014; } else { var margin =  .0355; }
  $("wall, #wall-range").attr("max", (Number($("#od-3").val())-margin)/2);
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
if ($("#unit").val() == 'in'){var tol = 0.002;var sig = 3; var wsig = 4; var max = 0.05; var min = 0.0005;}else{var tol= 0.05;var sig = 2; var wsig = 3; var max = 1.27; var min = 0.0127;}
if(this.value > max) { this.value = max;}
else if(this.value < min) { this.value = min;}
$(this).val(Number(this.value).toFixed(wsig));
var getValue = $(this).val();
$("#wall-range").val(Number(getValue).toFixed(wsig)).trigger('change');
var id = Number($("#id-range").val());
var od = Number($("#od-range").val());

if($(":radio[value=id]").is(":checked")) {
  if($("#unit").val() == 'in'){ var margin = 0.02; } else { var margin =  .508; }
  $("wall, #wall-range").attr("max", (Number($("#od-3").val())-margin)/2);
  $("#id-2, #id-range").val((od-(Number(getValue)*2)).toFixed(sig)).trigger('change');
  idController.setValue((od-(Number(getValue)*2)).toFixed(sig));
};

if($(":radio[value=od]").is(":checked")) {
  $("#od-3, #od-range").val((id+(Number(getValue)*2)).toFixed(sig)).trigger('change');
  odController.setValue((id+(Number(getValue)*2)).toFixed(sig));
};
  calculate(false);

});
$("#wall").on('focusout', function() {
  var step = 'WT changed to: ' + this.value;
  updateJourney(step);  
});
$("#wall-range").on('mouseup', function() {
  var step = 'WT changed to: ' + this.value;
  updateJourney(step); 
});
$("#id-2").on('focusout', function() {
  var step = 'ID changed to: ' + this.value;
  updateJourney(step);  
});
$("#id-range").on('mouseup', function() {
  var step = 'ID changed to: ' + this.value;
  updateJourney(step); 
});
$("#od-3").on('focusout', function() {
  var step = 'OD changed to: ' + this.value;
  updateJourney(step);  
});
$("#od-range").on('mouseup', function() {
  var step = 'OD changed to: ' + this.value;
  updateJourney(step); 
});
$("#length-2").on('focusout', function() {
  var step = 'Length changed to: ' + this.value;
  updateJourney(step);  
});
$("#len-range").on('mouseup', function() {
  var step = 'Length changed to: ' + this.value;
  updateJourney(step); 
});
$("#id-tol-2,#od-tol-2,#wall-tol").on('input', function() {
if(this.value > (Number($("#id-2").val())*.2)) {
  $("#high-tol").dialog("open");
}
  
});  
$("#len-range").on('input', function() {
$("#length-2").val(this.value);
calculate(true);
});

$("#length-2").on('change', function() {
$("#len-range").val(this.value);
calculate(true);
var step = 'Length changed to: ' + this.value;
updateJourney(step);
});
$("#custom-quantity").on('change', function() {
  if(this.value < 2501) {$("#custom-quantity").val(2501)}
  var step = 'QTY changed to: ' + this.value;
  updateJourney(step);
});
$("#quantity-2").on('change', function() {
if(this.value == 'More') {
$("#custom-quantity").css('display', 'block');
} else {
$("#custom-quantity").css('display', 'none');
}
calculate(true);
var step = 'QTY changed to: ' + this.value;
updateJourney(step);
});

function changeRef(material) {
if (['Pebax 45D','Pebax 55D','Pebax 63D','Pebax 72D','Vestamid ML21','PET','Delrin','Grilamid L25'].includes(material)) {
  $("input[id=od-4]").prop('checked', true).trigger('change');
  
} else {
  $("input[id=id-3]").prop('checked', true).trigger('change');
}
}
$("#material-2").on('change', function() {
  var step = 'Material changed to: ' + this.value;
  updateJourney(step);
  $(this).css('border', '0px');
  changeRef(this.value);
  calculate(false);
  
  if (['Pebax 25D','Pebax 35D','Pebax 45D','Pebax 55D','Pebax 63D','Pebax 72D','Vestamid ML21'].includes(this.value)) { $("#colorant").empty().append('<option value="">Select a Color...</option><option value="White">White</option><option value="Black">Black</option><option value="Cool Grey (7C)">Cool Grey (7C)</option><option value="Green (3248C)">Green (3248C)</option><option value="Green (3268C)">Green (3268C)</option><option value="Green (3298C)">Green (3298C)</option><option value="Blue (290C)">Blue (290C)</option><option value="Blue (295C)">Blue (295C)</option><option value="Blue (2925C)">Blue (2925C)</option><option value="Blue (301C)">Blue (301C)</option><option value="Purple (2655C)">Purple (2655C)</option>') }
  if (['LDPE'].includes(this.value)) {$("#color-2").empty().append('<option value="BaSO4">20% BaSO4</option>'); $("#colorant").empty().append('<option value="None">None</option><option value="Cool Grey (4C)">Cool Grey (4C)</option>')}
  if (['HDPE'].includes(this.value)) {$("#color-2").empty().append('<option value="None">None</option>'); $("#colorant").empty().append('<option value="None">None</option><option value="Cool Grey (4C)">Cool Grey (4C)</option>')}
  if (['Delrin','PET','Tecoflex 80A','Pellethane 80AE','Pellethane 90AE','Pellethane 55D','Pellethane 65D','NeuSoft UR862A','NeuSoft UR842A','NeuSoft UR852A','NeuSoft UR873A'].includes(this.value)) { $("#colorant option:first-child").prop("selectedIndex",0); $("input[id=color]").prop("checked", false).trigger("change").prop("disabled", true); $("#colorant").css('display', 'none'); } else { $("input[id=color]").prop("disabled", false); }
  if (['Pebax 25D','Pebax 35D','Pebax 55D', 'Pebax 63D', 'Pebax 72D', 'Pebax 45D'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="BaSO4">20% BaSO4</option><option value="Lubricious Additive">Lubricious Additive</option><option value="BaSO4 & Lubricious Additive">20% BaSO4 & Lubricious Additive</option>'); return;} 
  if (['Pebax 40D','Pebax 70D'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="BaSO4">20% BaSO4</option>'); return;} 
  if (['Vestamid ML21'].includes(this.value)) { $("#color-2").empty().append('<option value="None">None</option><option value="Lubricious Additive">Lubricious Additive</option>'); return; }
  else { $("#color-2").empty().append('<option value="None">None</option>'); }

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
$("#color").on('click', function() {
var step = 'Color Toggled: ' + this.value;
updateJourney(step);
});
$("#colorant").on('change', function() {
materialController.setValue(this.value);
var step = 'Color changed to: ' + this.value;
updateJourney(step);  
});
$("#color-2").on('change', function() {
var step = 'Additive changed to: ' + this.value;
updateJourney(step);  
});
$("#length-tol-2").on('change', function() {
  calculate(true);
});
$("#length-tol-2").on('focusout', function() {
  var step = 'Length Tol changed to: ' + this.value;
  updateJourney(step);  
});

$("#id-tol-2").on('change', function() {
  calculate(true);
});
$("#id-tol-2").on('focusout', function() {
  var step = 'ID Tol changed to: ' + this.value;
  updateJourney(step);
});
$("#od-tol-2").on('change', function() {
  calculate(true);
});
$("#od-tol-2").on('focusout', function() {
  var step = 'OD Tol changed to: ' + this.value;
  updateJourney(step);
});
$("#wall-tol").on('change', function() {
  calculate(true);

});
$("#wall-tol").on('focusout', function() {
  var step = 'Wall Tol changed to: ' + this.value;
  updateJourney(step);
});
$("#id-3").on('click', function() {
 var step = 'ID Set to REF';
 updateJourney(step); 
});
$("input[name=cert]").on('click', function() {
 var step = 'Cert changed to:' + this.id;
 updateJourney(step); 
});
$("input[name=price]").on('click', function() {
 var step = 'Leadtime changed to:' + this.id;
 updateJourney(step); 
});
$("#od-4").on('click', function() {
 var step = 'OD Set to REF';
 updateJourney(step); 
});
$("#wall-2").on('click', function() {
 var step = 'Wall Set to REF';
 updateJourney(step); 
});
renderer.setAnimationLoop((_) => {
let t = clock.getElapsedTime();
var obj = scene.getObjectByName( "obj" );
scene.rotation.y += rotate;
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
$("#unit").on('change', function(event, previousUnit) {
var step = 'Unit changed to: ' + this.value;
updateJourney(step);
if(this.value == previousUnit) {return;}
if(this.value == 'in'){
var originalID  = Number($("#id-range").val());
var originalOD  = Number($("#od-range").val());
var originalLEN = Number($("#len-range").val());
var originalWALL = Number($("#wall-range").val());
$("#id-range").attr({
"min": 0.014,
"max": 0.300,
"step": 0.001
});
$("#od-range").attr({
"min": 0.018,
"max": 0.350,
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
$("#id-range").attr({
"min": 0.51,
"max": 7.62,
"step": 0.025
});
$("#od-range").attr({
"min": 0.020,
"max": 8.85,
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

function storeHistory() {
  if(sessionStorage.getItem("history") !== null) {
  sessionStorage.removeItem("history");
  sessionStorage.removeItem("rewards");
  }
  var previous = $("#quote").html();
  var previousReward = Number($("#reward-counter").val());
  sessionStorage.setItem("history", previous);
  sessionStorage.setItem("rewards", previousReward);
}
function getHistory() {
  var history = sessionStorage.getItem("history");
  if(history !== null) {
    if (confirm("Looks like you were already working on a quote, would you like to pick up where you left off?") == true) {
      $("#quote").empty().append(history);
      $("#quote-panel").css('display', 'flex');
      $(".lil-gui").addClass('hide-price');
       var getTotal = $(".price-item");
       var total = 0;
       for(var i = 0; i < getTotal.length; i++){
       total += Number($(getTotal[i]).val());
       }
      var shippingTotal = Number($("#shipping-total").val());
      $("#total-text").text(total + shippingTotal);
      $("#continue-to-checkout").removeClass('hide-price');
      styles();
      updateTotal();
      if (user.model.expand.blanket_po){
      updateBlanket();
      }
      var totalExpedites = Number(sessionStorage.getItem("rewards"));
      var expeditesInQuote = $(document).find('.expedited:checked').length;
      if ( totalExpedites > 0 ) {
      $("#reward-counter").val(totalExpedites);
      $("#expedites-remaining").text(totalExpedites);
      $("#reward-box").removeClass('hide-price');
      } else {
      $("#reward-box").addClass('hide-price');
      }
    } else {
      sessionStorage.removeItem("history");
      sessionStorage.removeItem("rewards");
    }
  }
}
getHistory();
function createLine(){
  var find = $(".line");
var lineItem = find.length +1
var id = $("#id-2").val();
var od = $("#od-3").val();
var wall = $("#wall").val();
var length = $("#length-2").val();
var refTol = $("#id-tol-2").val();
var odTol = $("#od-tol-2").val();
var wallTol = $("#wall-tol").val();
var lenTol = $("#length-tol-2").val();
var material = $("#material-2").val();
var additive = $("#color-2").val();

if($("#apply-expedite").is(":checked")) {
  var expedite = `style="display: block;margin-right:5px;" checked`;
  var label = `style="display:flex;"`;
  } else {
  var expedite = `style="display:none;margin-right:5px;"`;
  var label = `style="display:none;"`;
  }
  
var color = $("#colorant").val();
if($("#quantity-2").val() == 'More') {
  var quantity = $("#custom-quantity").val();
} else {
  var quantity = $("#quantity-2").val();
}
var cert = $('input[data-name=cert]:checked').val();
var unit = $("#unit").val();
var price = $('#'+ $('input[data-name=price]:checked').val()).val();
var leadtime =  $('input[data-name=price]:checked').val();
if($("#shipping-carrier").val()) {var shipping = $("#custom-method").val(); var account = $("#shipping-account").val(); var carrier = $("#shipping-carrier").val(); $("#custom-carrier").val(carrier); $("#account-number").val(account);} else  {var shipping = $("#shipping-method").val(); var account = ""; var carrier = "";};
if(!$("#custom-quote").is(":checked")){
var lineHtml = 
`<div class="line" id="line`+lineItem+`">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +` (`+ unit +`)</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
		<div class="item"><p class="label">ID</p><input class="quote-input" id="l`+lineItem+`-id" value="`+id+`" readonly></input></div>
  	<div class="item"><p class="label">OD</p><input class="quote-input" id="l`+lineItem+`-od" value="`+od+`" readonly></input></div>
    <div class="item"><p class="label">Wall</p><input class="quote-input" id="l`+lineItem+`-wall" value="`+wall+`" readonly></input></div>
  	<div class="item"><p class="label">Length</p><input class="quote-input line-length" id="l`+lineItem+`-length" value="`+length+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+material+`" readonly></input></div>
    <div class="item"><p class="label">Color</p><input class="quote-input" id="l`+lineItem+`-color" value="`+color+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input unit" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;"></input>
    <label class="label" `+ label +`><input type="checkbox" class="expedited" id="l`+lineItem+`-expedite" readonly `+ expedite +` onclick="return false"></input>Free Expedite Applied</label>
	</div>
	<div class="col">
  	<div class="item"><p class="label">ID Tol</p><input class="quote-input" id="l`+lineItem+`-id-tol" value="`+refTol+`" readonly></input></div>
    <div class="item"><p class="label">OD Tol</p><input class="quote-input" id="l`+lineItem+`-od-tol" value="`+odTol+`" readonly></input></div>
    <div class="item"><p class="label">Wall Tol</p><input class="quote-input" id="l`+lineItem+`-wall-tol" value="`+wallTol+`" readonly></input></div>
    <div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-length-tol" value="`+lenTol+`" readonly></input></div>
    <div class="item"><p class="label">Additive</p><input class="quote-input" id="l`+lineItem+`-additive" value="`+additive+`" readonly></input></div>
    <div class="item"><p class="label">Quantity (Feet)</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Shipping Method</p><input class="quote-input shipping-line-item" id="l`+lineItem+`-shipping" value="`+shipping+`" readonly method="`+shipping+`" carrier="`+carrier+`" account="`+account+`"></input></div>
    
  </div>
  </div>
</div>`;} else {
var lineHtml = 
`<div class="line" id="line`+lineItem+`">
<div class="title-block"><p class="delete">x</p><p class="line-title">Line `+ lineItem +` (`+ unit +`)</p><p class="edit" id="`+ lineItem +`">Edit</p></div>

<div class="row">
	<div class="col">
		<div class="item"><p class="label">ID</p><input class="quote-input" id="l`+lineItem+`-id" value="`+id+`" readonly></input></div>
  	<div class="item"><p class="label">OD</p><input class="quote-input" id="l`+lineItem+`-od" value="`+od+`" readonly></input></div>
    <div class="item"><p class="label">Wall</p><input class="quote-input" id="l`+lineItem+`-wall" value="`+wall+`" readonly></input></div>
  	<div class="item"><p class="label">Length</p><input class="quote-input line-length" id="l`+lineItem+`-length" value="`+length+`" readonly></input></div>
    <div class="item"><p class="label">Material</p><input class="quote-input" id="l`+lineItem+`-material" value="`+material+`" readonly></input></div>
    <div class="item"><p class="label">Color</p><input class="quote-input" id="l`+lineItem+`-color" value="`+color+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Price($)</p><input class="quote-input price-item" id="l`+lineItem+`-price" value="`+price+`" readonly></input></div>
    <div class="item"><p class="label">Cert Level</p><input class="quote-input" id="l`+lineItem+`-cert" value="`+cert+`" readonly></input></div>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
    <input class="quote-input unit" id="l`+lineItem+`-unit" value="`+unit+`" readonly style="display:none;"></input>
    <input type="checkbox" class="line-greenlight" id="l`+lineItem+`-greenlight" value="`+greenlight+`" readonly style="display:none;" checked></input>
    <label class="label" `+ label +`><input type="checkbox" class=" expedited" id="l`+lineItem+`-expedite" readonly `+ expedite +` onclick="return false"></input>Free Expedite Applied</label>
	</div>
	<div class="col">
  	<div class="item"><p class="label">ID Tol</p><input class="quote-input" id="l`+lineItem+`-id-tol" value="`+refTol+`" readonly></input></div>
    <div class="item"><p class="label">OD Tol</p><input class="quote-input" id="l`+lineItem+`-od-tol" value="`+odTol+`" readonly></input></div>
    <div class="item"><p class="label">Wall Tol</p><input class="quote-input" id="l`+lineItem+`-wall-tol" value="`+wallTol+`" readonly></input></div>
    <div class="item"><p class="label">Length Tol</p><input class="quote-input" id="l`+lineItem+`-length-tol" value="`+lenTol+`" readonly></input></div>
    <div class="item"><p class="label">Additive</p><input class="quote-input" id="l`+lineItem+`-additive" value="`+additive+`" readonly></input></div>
    <div class="item"><p class="label">Quantity (Feet)</p><input class="quote-input" id="l`+lineItem+`-quantity" value="`+quantity+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Lead Time</p><input class="quote-input line-leadtime" id="l`+lineItem+`-leadtime" value="`+leadtime.replace('-price','')+`" readonly></input></div>
    <div class="item input-remove"><p class="label">Shipping Method</p><input class="quote-input shipping-line-item" id="l`+lineItem+`-shipping" value="`+shipping+`" readonly method="`+shipping+`" carrier="`+carrier+`" account="`+account+`"></input></div>
  </div>
  </div>
</div>`;  
}
 
$("#quote").append(lineHtml);
storeHistory();
  

if (user.model.expand.blanket_po){
 
updateBlanket();
}
updateTotal();
}
function updateBlanket() {
updateTotal();
var total = Number($("#total-price").val());
$("#blanket-value").text($("#selectedBlanket").val());
$("#remaining").text(Number($("#selectedBlanket").val()) - total);
$("#order-price").text(total);
if ( Number($("#selectedBlanket").val()) - total <= -10000 ) {
  $("#open-blanket").addClass('hide-price');
  $("#blanket-box").addClass('hide-price');
  $("#po-details").append(`<a href="mailto:`+user.model.sales_rep+`"><p class="text-block-39 center">Blanket PO has been exhausted. Click here to contact your rep.</p></a>`);
}
$("#blanket-po-number").val($('#selectedBlanket option:selected').attr('recordid'));  
$("#new-blanket-po-amount").val($("#remaining").text());
}
$("#selectedBlanket").on('change', function(){
  updateBlanket();
  var step = 'Blanket PO has been changed to: ' + this.value;
  updateJourney(step); 
});
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
 if(!$("#shipping-carrier").val() && !$("#shipping-method").val()) {
    $("#shipping-dialog").dialog("open");
    return false;
  }
  if($("#shipping-carrier").val() && !$("#shipping-account").val()) {
    $("#account-dialog").dialog("open");
    return false;
  }
  if ($(".line").length >= 9) {
    $("#too-many-lines").dialog("open");
    return false;
  }
createLine();
styles();

if( $("#apply-expedite").is(":checked") ) {
  //get total number of expedites used in the quote, including the one that was potentially just added
  var expeditesInQuote = $(document).find('.expedited:checked').length;
  var expeditesRemaining = Number($("#reward-counter").val()) - 1;
  if ( expeditesRemaining > 0 ) {
  $("#reward-counter").val(Number($("#reward-counter").val()) - 1);
  $("#expedites-remaining").text(expeditesRemaining);
  } else {
  $("#reward-counter").val(Number($("#reward-counter").val()) - 1);
  $("#expedites-remaining").text(expeditesRemaining);
  $("#reward-box").addClass('hide-price');
  }
  }
  
resetInputs();
$("#quote-panel").css('display', 'flex');
$("#left-panel-download").removeClass('hide-price');
$(".lil-gui").addClass('hide-price');
$("#price-block").css('display', 'none');
$("#level-0").prop('checked', true);
$("#next-step").removeClass('hide-price');
$("#continue-to-checkout").removeClass('hide-price');
} else {
  if($("#custom-quote").is(":checked")){
  $("#custom-dialogue").css('display', 'flex');
  } 
  //else { createLine(); $("#price-block").css('display', 'none'); $("#quote-panel").css('display', 'flex'); $(".lil-gui").addClass('hide-price'); styles();}
}
storeHistory();
var find = $(".line");
packageQuote();
var quoteContents = JSON.parse($("#order").val());
var message = {
  "number_of_lines": find.length,
  "quote_contents": quoteContents
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
 setTimeout(function() {
 var step = 'Line Added To Quote';
 updateJourney(step); 
}, 1000);


});


function resetInputs() {
  $("#apply-expedite").prop('checked', false);
  if(Number($("#reward-counter").val()) <= 0) {
  $("#reward-box").addClass('hide-price');
  }
  if ( $("#unit").val() == 'mm' ) { $("#unit").val('in').trigger('change'); }
  setTimeout(function() {
  $("#od-3,#od-range").val(0.120);
  $("#id-2,#id-range").val(0.100);
  $("#wall, #wall-range").val(0.01);
  $("#od-3,#od-range,#id-2,#id-range,#wall,#wall-range").trigger('change');
  $("#id-tol-2,#wall-tol").val(0.001).trigger('change');
}, 500);

  
  $("#length-2,#len-range").val(12);
  $("#length-tol-2").val('MIN');
  $("#od-tol-2").val('REF');
  $("#quantity-2").val(300);
  $("#custom-quantity").val('');
  $("#custom-quantity").css('display','none');
  $('input[id="od-4"]').prop("checked",true);
  $('input[id="od-4"]').trigger("change");
  $("#material-2").val($("#material-2 option:first").val());
  $("#color-2").val($("#color-2 option:first").val());
  $("#colorant").val($("#colorant option:first").val());
  $("#color").trigger("change");
  $("#price-block").css('display', 'none');
  $("#carrier-details").addClass('hide-price');
  $("#view-carrier").text("Charge to your shipping account");
  $("#shipping-account").val("");
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  $("#shipping-method").val($("#shipping-method option:first").val());
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
  $(".lil-gui").addClass('hide-price');
  $("#custom-dialogue").css('display', 'none');
  $(".ui-dialog-content").dialog("close");
  resetInputs();
  var message = {
  "custom_line_added": true
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
});
$("#custom-quote").on('change', function() {
  if ($(this).is(":checked")) {
    
    $("#price-block").css('display', 'none');
    //document.querySelectorAll('.input-remove').forEach(e => e.hide());
    
    //$("#wall,#length-2,#length-tol-2,#id-tol-2,#wall-tol,#id-2,#quantity-2").removeClass("error");
  }
});

$("#continue,#continue-to-checkout,#editContinue").click(function() {
  styles();
  if($('input[id="final-check"]').is(":checked")) {
  //Order is greenlight
  $("#final-details").css('display', 'block');  
  $('html, body').animate({
        scrollTop: $("#final-details").offset().top
    }, 2000);
    updateTotal();
    if (user.model.expand.blanket_po){
    updateBlanket();
    }
  } else {
  //Order is custom
  $("#custom-menu").removeClass('hide-price');
  $('html, body').animate({
        scrollTop: $("#custom-menu").offset().top
    }, 2000);
  }
  
  $("#next-step").addClass('hide-price');
 var step = 'Continue to checkout clicked';
 updateJourney(step); 
});

$("#close-quote").click(function(){
  $(".lil-gui").removeClass('hide-price');
});

$("#open-quote").click(function(){
  $(".lil-gui").addClass('hide-price');
});
$("#close-terms").click(function(){
  $("#terms").addClass('hide-price');
});
$("#add-another").click(function(){
  $("#next-step").addClass('hide-price');
  $("#quote-panel").css('display', 'none');
  $(".lil-gui").removeClass('hide-price');
  var step = 'Add another extrusion was clicked';
  updateJourney(step); 
});

$("#view-carrier").click(function() {
  if($("#carrier-details").hasClass('hide-price')) {
  $("#carrier-details").removeClass('hide-price');
  $(this).text("I don't want to use my shipping account");
  $("#shipping-account").val($("#account-number").val());
  if($("#custom-carrier").val()) {$("#shipping-carrier").val($("#custom-carrier").val());};
  } else {
  $("#carrier-details").addClass('hide-price');
  $(this).text('Charge to your shipping account');
  $("#shipping-account").val('');
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  }
  $("#shipping-carrier").trigger("change");
   var step = 'Custom shipping toggled';
   updateJourney(step); 
});
$("#shipping-method").on('change', function() {
  $("#shipping-account").val('');
  $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option>').val($("#custom-method option:first").val());
  $("#shipping-carrier").val($("#shipping-carrier option:first").val());
  $("#carrier-details").addClass('hide-price');

 var step = 'Shipping method changed to:' + this.value;
 updateJourney(step); 

});
$("#view-po").click(function() {
  $("#po-details").css('display', 'flex');
  var step = 'PO selected as checkout method';
  updateJourney(step); 
});

$("#shipping-carrier").on('change', function() {
  if(this.value == 'UPS') {
    $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option><option value="UPS Ground">UPS Ground</option><option value="UPS 2nd Day Air">UPS 2nd Day Air</option><option value="UPS 3rd Day Select">UPS 3rd Day Select</option><option value="UPS Next Day Air">UPS Next Day Air</option><option value="UPS Worldwide Expedited">UPS Worldwide Expedited</option><option value="UPS Worldwide Saver">UPS Worldwide Saver</option>');
    
  } else {
    $("#custom-method").empty().append('<option value="Select Method...">Select Method...</option><option value="FedEx Ground">FedEx Ground</option><option value="FedEx Priority Overnight">FedEx Priority Overnight</option><option value="FedEx Standard Overnight">FedEx Standard Overnight</option><option value="FedEx 2 Day">FedEx 2 Day</option><option value="FedEx Express Saver">FedEx Express Saver</option><option value="FedEx International First">FedEx International First</option><option value="FedEx International Priority">FedEx International Priority</option><option value="FedEx International Priority Express">FedEx International Priority Express</option><option value="FedEx International Economy">FedEx International Economy</option>');
  }
 var step = 'Custom shipping carrier changed to: ' + this.value;
 updateJourney(step); 
});
$("#shipping-account").on('change', function() {
 var step = 'Shipping account number changed to :' + this.value;
 updateJourney(step); 
});
$("#custom-method").on('change', function() {
 var step = 'Custom shipping method changed to: ' + this.value;
 updateJourney(step); 
});
$(document).on("click", ".edit", function(){
//resetInputs();
$("#next-step").addClass('hide-price');
$("#final-details").css('display', 'none');
$("#custom-menu").addClass('hide-price');
var line = this.id;
$(".line").not("#line"+line).addClass('opacity');
$("#custom-quote").prop("checked",($("#l"+ line + "-greenlight").is(":checked")));
var previousUnit = $("#unit").val();
$("#unit").val($("#l"+ line + "-unit").val());
$("#unit").trigger('change', [previousUnit]);
$("#od-3, #od-range").val($("#l"+ line + "-od").val());
  //odController.setValue(Number($("#l"+ line + "-od").val()));
$("#id-2, #id-range").val($("#l"+ line + "-id").val());
  //idController.setValue(Number($("#l"+ line + "-id").val()));
$("#length-2, #len-range").val($("#l"+ line + "-length").val());
$("#id-tol-2").val($("#l"+ line + "-id-tol").val());
$("#wall").val($("#l"+ line + "-wall").val());
$("#od-tol-2").val($("#l"+ line + "-od-tol").val());
$("#wall-tol").val($("#l"+ line + "-wall-tol").val());
$("#length-tol-2").val($("#l"+ line + "-length-tol").val());
$("#material-2").val($("#l"+ line + "-material").val()).trigger('change');
setTimeout(function() {
$("#color-2").val($("#l"+ line + "-additive").val());
$("#colorant").val($("#l"+ line + "-color").val());
}, 500);
if(Number($("#l"+ line + "-quantity").val()) > 2500) {
  $("#custom-quantity").css('display', 'block');
  $("#quantity-2").val('More');
  $("#custom-quantity").val(Number($("#l"+ line + "-quantity").val()));
} else {
  $("#quantity-2").val($("#l"+ line + "-quantity").val()); 
}  
$("#editing").css('display', 'flex');
$("#now-editing").val(line);
$(".update, .update-button").css('display', 'flex');
   if(!$("#l" + line +  "-greenlight").is(":checked")){
//var radioId = $("#l"+line+"-leadtime").val().replace('-price','');
var radioId = $("#l"+line+"-leadtime").val();
var certId = $("#l"+line+"-cert").val();
$("#"+radioId).prop('checked', true).trigger('change');
$("#level-"+certId).prop('checked', true);
   }
$("#od-3").trigger('change');

if($("#l"+ line + "-shipping").attr("account").length > 0) {
  $("#carrier-details").removeClass('hide-price');
  $("#view-carrier").text("I don't want to use my shipping account");
  $("#shipping-carrier").val($("#l"+ line + "-shipping").attr("carrier")).trigger('change');
  $("#shipping-account").val($("#l"+ line + "-shipping").attr("account"));
  $("#custom-method").val($("#l"+ line + "-shipping").attr("method"));
  $("#shipping-method").val($("#shipping-method option:first").val());
  
} else {
   $("#carrier-details").addClass('hide-price');
   $("#view-carrier").text("Charge to your shipping account");
   $("#shipping-method").val($("#l"+ line + "-shipping").attr("method"));
   $("#shipping-account").val("");
   $("#custom-method").val($("#custom-method option:first").val());
   $("#shipping-carrier").val($("#shipping-carrier option:first").val());
}
  
$("#submit-container").css('display', 'none');
  
  if($("#l"+ line + "-id-tol").val() == 'REF') { $("#id-3").prop("checked", true); $("#id-3").trigger('change');}
  if($("#l"+ line + "-od-tol").val() == 'REF') { $("#od-4").prop("checked", true); $("#od-4").trigger('change');}
  if($("#l"+ line + "-wall-tol").val() == 'REF') { $("#wall-2").prop("checked", true); $("#wall-2").trigger('change');}
  $("#id-2, #wall, #material-2").trigger('change');
  $("#id-tol-2").val($("#l"+ line + "-id-tol").val());
  $("#od-tol-2").val($("#l"+ line + "-od-tol").val());
  $("#wall-tol").val($("#l"+ line + "-wall-tol").val());
  $("#length-tol-2").val($("#l"+ line + "-length-tol").val());
  calculate(false);
  if($("#l" + line +  "-greenlight").is(":checked")){
    $("#price-block").css('display', 'none');
  } else {
    $("#price-block").css('display', 'flex');
  }
  $("#id-tol-2").val($("#l"+ line + "-id-tol").val());
  $("#od-tol-2").val($("#l"+ line + "-od-tol").val());
  $("#wall-tol").val($("#l"+ line + "-wall-tol").val());
  $("#length-tol-2").val($("#l"+ line + "-length-tol").val());
  
if( $("#l"+ line + "-expedite").is(":checked") ) {
  //get total number of expedites used in the quote, including the one that was potentially just added
  $("#reward-box").removeClass("hide-price");
  var expeditesRemaining = Number($("#reward-counter").val()) + 1;
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
  $("#apply-expedite").prop('checked', true).trigger('change');
}
 var step = 'A quote line was edited';
 updateJourney(step); 
});


function update() {
var line = $("#now-editing").val();
$("#l"+ line + "-unit").val($("#unit").val());
$("#line"+line).find('.line-title').text("Line "+line+" ("+$("#unit").val()+")");
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

if($("#shipping-carrier").val()) {var shipping = $("#custom-method").val(); var account = $("#shipping-account").val(); var carrier = $("#shipping-carrier").val(); $("#custom-carrier").val(carrier); $("#account-number").val(account);} else  {var shipping = $("#shipping-method").val(); var account = ""; var carrier = "";};
$("#carrier-details").addClass('hide-price');
$("#l"+ line + "-shipping").val(shipping);
$("#l"+ line + "-shipping").attr("account", account);  
$("#l"+ line + "-shipping").attr("method", shipping);
$("#l"+ line + "-shipping").attr("carrier", carrier);  
  
if($("#quantity-2").val() == 'More')  {
  $("#l"+ line + "-quantity").val($("#custom-quantity").val());
} else {
$("#l"+ line + "-quantity").val($("#quantity-2").val());
}
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
storeHistory();
updateTotal();
if ( $("#apply-expedite").is(":checked") ) {
  $("#l"+ line + "-expedite").prop('checked', true);
  $("#l"+ line + "-expedite").closest(".label").css('display', 'flex')
  var expeditesRemaining = Number($("#reward-counter").val()) - 1
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
  } else {
  $("#l"+ line + "-expedite").prop('checked', false);
  $("#l"+ line + "-expedite").closest(".label").css('display', 'none')
}  
}

function updateTotal() {
  calcShipping();
  var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
  total += Number($(getTotal[i]).val());
}
var shippingTotal = Number($("#shipping-total").val());    
$("#total-price").val(total+shippingTotal);
$("#total-text").text(total+shippingTotal);
}

$("#update").click(function(){

update();
styles();
resetInputs();
$(".line").removeClass('opacity');
$("#next-step").removeClass('hide-price');
var step = 'A quote line was updated';
updateJourney(step); 
});

$(document).on("click", ".delete", function(){
  var lineId = $(this).attr('id');
  if( $("#l"+ lineId + "-expedite").is(":checked") ) {
  var expeditesRemaining = Number($("#reward-counter").val()) + 1
  $("#reward-counter").val(expeditesRemaining);
  $("#expedites-remaining").text(expeditesRemaining);
  }
  $(this).closest('.line').remove();
  var lineItem = 1;
  $(".line").map(function() {
    var unit = $(this).find('.unit').val();
    $(this).find('.line-title').first().text('Line '+ lineItem + ' (' + unit + ')');
    $(this).find('.linenumber').val(lineItem);
    $(this).find('.edit').first().attr("id", lineItem);
    $(this).find('input').map(function(){
      this.id = this.id.replace(/[0-9]/g, lineItem);
      
    });
  ++lineItem;
  });
  storeHistory();
  updateTotal();
  if (user.model.expand.blanket_po){
  updateBlanket();
  }
 var step = 'A quote line was deleted';
 updateJourney(step); 
});

function calcShipping() {
var shippingLines = $(".shipping-line-item");
let finalShipping = [];

var priceMatchSmall = {
  "UPS Ground": 18,
  "UPS Second Day Air": 45,
  "UPS Next Day Air": 75,
  "UPS Worldwide Expedited": 90,
  "UPS Worldwide Saver": 110
};
var priceMatchLarge = {
  "UPS Ground": 55,
  "UPS Second Day Air": 105,
  "UPS Next Day Air": 140,
  "UPS Worldwide Expedited": 140,
  "UPS Worldwide Saver": 160
};
for (let i = 0; i < shippingLines.length; ++i) {
  
  if ( !$(shippingLines[i]).attr("account").length > 0 ) {
  let shippingArray = {};
  var leadtime = 'leadtime';
  var shipping = 'shipping';
  var price = 'price';
  var line = $(shippingLines[i]).closest('.line');
  var leadVal = line.find('.line-leadtime').val();
  var shipVal = $(shippingLines[i]).val();
  if ( line.find('.unit').val() == 'in' ) {
    if ( Number(line.find('.line-length').val()) < 30 ) {
    var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Next Day Air|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchSmall[matched]);
    } else {
    var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Next Day Air|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchLarge[matched]); 
    }
  } else {
    if ( Number($(shippingLines[i]).closest('.line-length').val()) < 762 ) {
    var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchSmall[matched]);
    } else {
    var priceVal = $(shippingLines[i]).val().replace(/UPS Ground|UPS Second Day Air|UPS Worldwide Expedited|UPS Worldwide Saver/g, matched => priceMatchLarge[matched]); 
    }
    
  }
  shippingArray[leadtime] = leadVal;
  shippingArray[shipping] = shipVal;
  shippingArray[price] = priceVal;
  finalShipping = finalShipping.concat(shippingArray);
  }
  
  
}
console.log(finalShipping);
//let result = finalShipping.filter(
//  (finalShipping, index) => index === finalShipping.findIndex(
//    other => finalShipping.leadtime === other.leadtime
//      && finalShipping.shipping === other.shipping
//  ));

let result = finalShipping.filter((value, index, self) =>
  index === self.findIndex((t) => (
    t.leadtime === value.leadtime && t.shipping === value.shipping
  ))
)
  
var totalShipping = 0;
result.forEach(item => {
    totalShipping += Number(item.price);
});
if ( totalShipping > 0 ) {
   $("#shipping-total").val(totalShipping);
} else {
  $("#shipping-total").val('0');
}
  
}

function packageQuote() {
  
  var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
    total += Number($(getTotal[i]).val());
}
    
$("#total-price").val(total); 
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
      } else if ( inputs[a].id.includes('shipping') ) { 

      if ($(inputs[a]).attr("account").length > 0) { var acct = ' Account #: ' + $(inputs[a]).attr("account"); } else { var acct = ''; };
      var value = inputs[a].value + acct; 
        
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
}

function createArray() {
packageQuote();
calcShipping();
 $("#quoteNum").val(sessionStorage.getItem("quoteNum"));
 $("#quoteId").val(sessionStorage.getItem("quoteId"));
 
 $("#shipping").val($("#shipping-method").val());
 $("#custom-carrier").val($("#shipping-carrier").val());
 //$("#account-number").val($("#shipping-account").val());
 $("#user-details").val(JSON.stringify(JSON.parse(localStorage.getItem("pocketbase_auth"))));
 $("#po-number-submit").val($("#purchase-order-file").val());
 $("#preferred-method").val($("#custom-method").val());
 //$("#po-file").val($("#purchase-order-file").val());
 sessionStorage.removeItem("history");
 sessionStorage.removeItem("rewards");
 $("#quote").submit();

}
$("#checkout").click(function() {

 var getTotal = $(".price-item");
  var total = 0;
  for(var i = 0; i < getTotal.length; i++){
    total += Number($(getTotal[i]).val());
}
    var fee = (total * 0.03).toFixed(2);
   
  ///////// Ad cc processing fee
var find = $(".line");
var message = {
  "number_of_lines": find.length,
  "submitted": true,
  "checkout_method": "CC"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
var lineItem = find.length + 1;
var lineHtml = 
`<div class="line" id="line`+lineItem+`" style="display:none;">
		<input class="quote-input" id="l`+lineItem+`-id" value="CC Processing Fee" readonly></input>
  	<input class="quote-input price-item" id="l`+lineItem+`-price" value="`+fee+`" readonly></input>
    <input class="linenumber" id="l`+lineItem+`-line" value="`+lineItem+`" readonly style="display:none;"></input>
</div>`;
   
$("#quote").append(lineHtml);  
  
 
  if( !$("#po-number").val() ) {
  $("#terms").removeClass('hide-price');
  
  }
  if( $("#po-number").val().length > 0) {
    if ($('input[id="po-verification"]').is(":checked")) { $("#terms").removeClass('hide-price'); }
    else {  $('#verification').dialog("open"); }
  } 
 var step = 'Credit Card checkout was selected';
 updateJourney(step); 
});

$("#upload-po").click(function() {
  $("#quote-panel").css('display','flex');
  $("#upload-container").removeClass('hide-price');
  $(this).fadeTo(1000, 1);
  $("#po-buy").fadeTo(1000, 0.2);
  var step = 'Customer has chosen to upload a PO now';
  updateJourney(step); 
});
$("#po-buy").click(function() {
  
  $("#po-accept").removeClass('hide-price');
  $(this).fadeTo(1000, 1);
  $("#upload-po").fadeTo(1000, 0.2);
  $("#po-checkout").addClass('hide-Price');
  var step = 'Customer has chosen to upload a PO later';
  updateJourney(step); 
});
$("#po-verification").click(function() {
  if($(this).is(":checked")) {
    $("#no-po-checkout").removeClass('hide-price');
  } else {
    $("#no-po-checkout").addClass('hide-price');
  }
});
$("#charge-to-blanket").click(function() {
  $("#terms").removeClass('hide-price');
  $("#blanket-po-selected").val(true);
  var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
 // $("#po-number-submit").val($("#blanket-number").text());
 var step = 'Customer has continued to terms with a blanket PO';
 updateJourney(step); 
});
$("#no-po-checkout").click(function() {
  if ($('input[id="po-verification"]').is(":checked")) { 
    $("#purchase-order-no-upload").val('no-upload'); 
    $("#terms").removeClass('hide-price');
    var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
  }
    else {  $('#verification').dialog("open"); }
 var step = 'Customer will upload PO later and has proceeded to terms';
 updateJourney(step);   
});
$("#send").click(function() {
 var message = {
    "order_placed": true,
    "ended": new Date()
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
createArray();
$("#loading").css("display", "flex");
 var step = 'Customer agreed to terms, order created';
 updateJourney(step); 
});
$("#po-checkout").click(function() {
   $("#terms").removeClass('hide-price');
    var find = $(".line");
    var message = {
    "number_of_lines": find.length,
    "submitted": true,
    "checkout_method": "PO"
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
  var step = 'Customer has uploaded PO and has proceeded to final terms';
  updateJourney(step); 
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
   $("#terms").removeClass('hide-price');
});
$(".download-quote").click(function(){
  $("#download-quote").val('true');
  $("#loading").css("display", "flex");
  $("#save-quote").val("true");
  createArray();
  var step = 'A quote was saved for later';
  updateJourney(step); 
});
$("#continue-with-custom").click(function() {
  createArray();
  $("#loading").css("display", "flex");
  var find = $(".line");
  var message = {
  "number_of_lines": find.length,
  "submitted": true
  }
  window.parent.postMessage(message,"https://orders.midwestint.com/instant-quote/designer.html");
 var step = 'Redlight line added to quote';
 updateJourney(step); 
});

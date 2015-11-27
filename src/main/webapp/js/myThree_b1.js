SV = SV || {};
SV.Three = {};

THREE = THREE || {};
var WIDTH, HEIGHT;
var scene, camera, renderer;
var controls, cubes, mouse, raycaster, cams;

SV.Three.startMap = function() {
    SV.Three.init();

    SV.Three.addAxes();
    //SV.Three.addSphere();
    SV.Three.addLight();
    SV.Three.setControls();
    //SV.Three.addCubes();
    
    SV.Three.addCameras();
    SV.Three.addPointcloud();
    //renderer.render(scene, camera); // render 1x
    //render(); // start render loop


    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    document.getElementById("map").addEventListener('click', SV.Three.onMouseClick, false);

    SV.Three.animate();
};

SV.Three.onMouseClick = function(e) {
    var parentPosition = SV.Three.getPosition(e.currentTarget);
    var xPosition = e.clientX - parentPosition.x;
    var yPosition = e.clientY - parentPosition.y;

    mouse.x = 2 * (xPosition / WIDTH) - 1;
    mouse.y = 1 - 2 * (yPosition / HEIGHT);

    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(cams.children);

    if (intersects.length > 0) {
        cams.children.forEach(function (cube) {
            cube.material.color.setRGB(0, 1, 1);
        });

        var intersection = intersects[0]; // erster würfel
        var obj = intersection.object;
        obj.material.color.setRGB(1, 1, 0);
        
        console.log(obj.img.id);
        $('#bigimg img').attr("src", obj.img.url);
    }

};
// get absolute click position
SV.Three.getPosition = function (element) {
    var xPosition = 0;
    var yPosition = 0;
      
    while (element) {
        xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
        yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
        element = element.offsetParent;
    }
    return { x: xPosition, y: yPosition };
};



////// RENDERING ///////
SV.Three.render = function() {
    requestAnimationFrame(SV.Three.render); // render loop
    renderer.render(scene, camera);
};
SV.Three.animate = function() {
    requestAnimationFrame(SV.Three.animate);
    raycaster.setFromCamera( mouse, camera );
    controls.update();
    renderer.render(scene, camera);
    //console.log(camera.position);
};
////////////////////////


SV.Three.init = function() {
    // scene size
    WIDTH = $('#map').width();
    HEIGHT = $('#map').height();

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(0x555555);

    $("#map").append(renderer.domElement);

    // cam attr
    var VIEW_ANGLE = 50;
    var ASPECT = WIDTH / HEIGHT;
    var NEAR = 0.1;
    var FAR = 1000;

    // camera
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    camera.position.z = 10; // cam starts at 0,0,0 -> pull back cam
    camera.position.set(-8, 1, 1.5);
    
    scene = new THREE.Scene();
    scene.add(camera);

};

SV.Three.addSphere = function() {
    // sphere vars
    var radius = 0.1;
    var segments = 20;
    var rings = 10;

    var geometry = new THREE.SphereGeometry(radius, segments, rings);
    //var material = new THREE.MeshBasicMaterial( {color: 0xCC0000} );
    var material = new THREE.MeshLambertMaterial({color: 0xCC0000});
    var sphere = new THREE.Mesh(geometry, material);
    
    scene.add(sphere);
};

SV.Three.addLight = function() {

    // create a point light
    var pointLight = new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
   scene.add(pointLight);
    
    
    // Ambient Light
   var ambientLight = new THREE.AmbientLight(0x444444);
   scene.add(ambientLight);
};

SV.Three.setControls = function() {
    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
};

SV.Three.addCubes = function() {

    var geometry = new THREE.BoxGeometry(10, 10, 10);
    var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    var rect = new THREE.Mesh(geometry, material);
    rect.position.set(50, 50, 50);
    scene.add(rect);
    
    
    // cube positions
    var positions = [
        [ 0,  0, 50],
        [ 0, 50,  0],
        [50,  0,  0],
        [50, 50,  0]
    ];
    var imgs = [
        {id: "img1", url: "http://localhost:8084/images/00000000.jpg"},
        {id: "img1", url: "http://localhost:8084/images/00000001.jpg"},
        {id: "img1", url: "http://localhost:8084/images/00000002.jpg"},
        {id: "img1", url: "http://localhost:8084/images/00000003.jpg"}
    ];

    var g = new THREE.BoxGeometry(10, 10, 10);
    
    cubes = new THREE.Object3D();
    scene.add(cubes);
    
    $.each(positions, function(i, position) {
        var m = new THREE.MeshBasicMaterial({color: 0x0000ff});
        var cube = new THREE.Mesh(g, m);
        cube.position.set(position[0], position[1], position[2]);
        cube.img = imgs[i];
        cubes.add(cube);
    });
    

    
};

SV.Three.addCameras = function() {
    if(!SV.Init.data) {
        setTimeout(function(){SV.Three.addCameras();}, 1000);
    } else {
    
    // sphere vars
    var radius = 0.1;
    var segments = 20;
    var rings = 10;
    var gCam = new THREE.SphereGeometry(radius, segments, rings);
    
    cams = new THREE.Object3D();
    $.each(SV.Init.data, function(i, picture) {
        var mCam = new THREE.MeshLambertMaterial({color: 0x00FFFF});
        var cam = new THREE.Mesh(gCam, mCam);
        
        var posCam = picture.position;
        cam.position.set(posCam[0], posCam[1], posCam[2]);
        cam.img = picture;
        cams.add(cam);
    });
    scene.add(cams);
    }
};

SV.Three.addAxes = function () {
// http://soledadpenades.com/articles/three-js-tutorials/drawing-the-coordinate-axes/
        var axes = new THREE.Object3D();
        var length = 1;
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( length, 0, 0 ), 0xFF0000, false ) ); // +X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( -length, 0, 0 ), 0xFF0000, true) ); // -X
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, length, 0 ), 0x00FF00, false ) ); // +Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, -length, 0 ), 0x00FF00, true ) ); // -Y
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, length ), 0x0000FF, false ) ); // +Z
        axes.add( buildAxis( new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, -length ), 0x0000FF, true ) ); // -Z

        scene.add(axes);

};
function buildAxis( src, dst, colorHex, dashed ) {
        var geom = new THREE.Geometry(),
            mat;

        if(dashed) {
                mat = new THREE.LineDashedMaterial({ linewidth: 3, color: colorHex, dashSize: 0.1, gapSize: 0.1 });
        } else {
                mat = new THREE.LineBasicMaterial({ linewidth: 3, color: colorHex });
        }

        geom.vertices.push( src.clone() );
        geom.vertices.push( dst.clone() );
        geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

        var axis = new THREE.Line( geom, mat, THREE.LinePieces );

        return axis;

};

SV.Three.addPointcloud = function() {
// Points aka particles
  var particles = new THREE.Geometry();
  var material = new THREE.PointsMaterial({ size: 0.001,  transparent: true, color:0x00ff00 });
    $.each(pointcloudcoordinates, function (i, coord) {
        var vertex = new THREE.Vector3();
        vertex.x = coord[0];
        vertex.y = coord[1];
        vertex.z = coord[2];
        particles.vertices.push(vertex);
    });
  var pc = new THREE.Points(particles, material);
  scene.add(pc);
    
};
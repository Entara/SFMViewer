SV = SV || {};
SV.Three = {};

THREE = THREE || {};
var WIDTH, HEIGHT;
var scene, camera, renderer;
var controls, cubes, mouse, raycaster, cams, model, pc;

SV.Three.startMap = function() {
    SV.Three.init();

    SV.Three.addAxes();
    SV.Three.addLight();
    SV.Three.setControls();
    //SV.Three.addCubes();
    
    SV.Three.addCameras();
    SV.Three.addPointcloud();
    SV.Three.addModelOBJ();
    
    //renderer.render(scene, camera); // render 1x
    //render(); // start render loop

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();
    document.getElementById("map").addEventListener('click', SV.Three.onMouseClick, false);
    document.getElementById("map").addEventListener('dblclick', SV.Three.onCameraDblClick, false);

    SV.Three.animate();
    
    //logCam();
};

SV.Three.onCameraDblClick = function(e) {
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
        obj.material.color.setRGB(1, 0.4, 0.4);
        
        $('#bigimg img').attr("src", obj.img.url);
        camera.position.set(obj.matrixWorld.elements[12], obj.matrixWorld.elements[13], obj.matrixWorld.elements[14]); // TODO position mit matrix4.decompose rausholen
        var vecInit = new THREE.Vector4(0, 0, 3, 1);
        vecInit = vecInit.applyMatrix4(obj.matrixWorld);
        controls.target.copy(vecInit); // camera.lookAt wird von den controls überschrieben.
    }
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
        obj.material.color.setRGB(1, 0.4, 0.4);
        
        //console.log(obj.img.id);
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
    renderer.setClearColor(0xDDDDDD);

    $("#map").append(renderer.domElement);

    // cam attr
    var VIEW_ANGLE = 45;
    var ASPECT = WIDTH / HEIGHT;
    var NEAR = 0.1;
    var FAR = 1000;

    // camera
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    //camera.position.z = 10; // cam starts at 0,0,0 -> pull back cam
    camera.position.set(-9.6308274918445280e-001, -1.2129332461575911e+001, 1.5646438368281723e+001);
    
    scene = new THREE.Scene();
    scene.add(camera);

};

SV.Three.addLight = function() {

    // create a point light
    var pointLight = new THREE.PointLight(0xFFFFFF);

    // set its position
    pointLight.position.x = 10;
    pointLight.position.y = 50;
    pointLight.position.z = 130;

    // add to the scene
   //scene.add(pointLight);
    
    
    // Ambient Light
   var ambientLight = new THREE.AmbientLight(0xFFFFFF);
   scene.add(ambientLight);
};

SV.Three.setControls = function() {
    // controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
};

SV.Three.addCameras = function() {
    if(!SV.Init.data) {
        setTimeout(function(){SV.Three.addCameras();}, 1000);
    } else {
        // sphere vars
        var radius = 1;
        var imgH = 2736 * 1.6791758040935675e-003;
        var imgW = 3648 * 1.6791758040935675e-003;
        var gCam = new THREE.PlaneGeometry(imgW, imgH);


        cams = new THREE.Object3D();
        $.each(SV.Init.data, function(i, nextCam) {
            var matrix = nextCam.matrix;
            var mCam = new THREE.MeshLambertMaterial({color: 0x00FFFF, transparent: true, opacity: 0.6});
            mCam.side = THREE.DoubleSide;
            var cam = new THREE.Mesh(gCam, mCam);
            cam.matrixAutoUpdate = false;
            cam.matrix.set(
                    matrix[0], matrix[1], matrix[2], matrix[3], 
                    matrix[4], matrix[5], matrix[6], matrix[7], 
                    matrix[8], matrix[9], matrix[10], matrix[11], 
                    matrix[12], matrix[13], matrix[14], matrix[15]
                );
            cam.img = nextCam;
            cams.add(cam);
        }); 
       
        cams.matrixAutoUpdate = false;
        cams.matrix.set( // steht in cam_xml <transform><rotation>, muss angepasst werden
                5.7413032872442193e-001, -2.6939859495990626e-001, 7.7317447104286596e-001, 0,
                -2.8919352765010311e-002, -9.5040226353390644e-001, -3.0967597340652708e-001, 0,
                8.1825303951433048e-001, 1.5543466313295615e-001, -5.5344559698519991e-001, 0,
                0, 0, 0, 1
            );
        
        scene.add(cams);

        cams.children[0].material.color.setRGB(1, 0.4, 0.4);
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
  var material = new THREE.PointsMaterial({ size: 0.001,  transparent: true, color:0xffa500 });
    $.each(pc_krieger, function (i, coord) {
        var vertex = new THREE.Vector3();
        vertex.x = coord[0];
        vertex.y = coord[1];
        vertex.z = coord[2];
        particles.vertices.push(vertex);
    });
  pc = new THREE.Points(particles, material);
  scene.add(pc);
  pc.visible = false;

    
};

SV.Three.addModelOBJ = function () {
    var loader = new THREE.OBJMTLLoader();
    loader.load(
        '/data/krieger.obj', '/data/krieger.mtl',
        function (object) {
            model = object;
            scene.add(model);
        }
    );
};

SV.Three.toggle = function (obj) {
    if (obj.visible) {
        //scene.remove(model);
        obj.visible = false;
    } else {
        //scene.add(model);
        obj.visible = true;
    }
};

logCam = function () {
    console.log(camera.matrix.elements);
    setTimeout(function() {logCam();}, 3000);
    
};

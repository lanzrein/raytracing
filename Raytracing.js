//camera thingy..
var camera;

//translate keypress events to strings
//from http://javascript.info/tutorial/keyboard-events
function getChar(event) {
    if (event.which == null) {
        return String.fromCharCode(event.keyCode) // IE
    } else if (event.which != 0 && event.charCode != 0) {
        return String.fromCharCode(event.which)   // the rest
    } else {
        return null // special key
    }
}

//given
function handleKeyPress(event) {
    var ch = getChar(event);
    objectRotation(ch)
    if (cameraControl(camera, ch)) return;
}

//handle stopping the rabbit
function objectRotation(ch) {
    switch (ch) {
        case ' ':
            paused = !paused;
            return true;
        default:
    }
}


//we start with a normal presentation....

function cameraSetup(scene) {
    camera = new THREE.PerspectiveCamera(60, 800.0/600.0, 0.5, 100);
    camera.position.set(4, 4, 4);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
}

/**
 * put some nice lights on our scene..
 * we choose them bright so it makes a good
 * raycast...
 * we take one ambiant and two light point..
 * @param scene
 */
function setupLights(scene) {
    //ambiant
    var lightAmbiant = new THREE.AmbientLight((0x222222));
    scene.add(lightAmbiant);
    var light1 = new THREE.PointLight(0xfffff, 10.0);
    var light2 = new THREE.PointLight(0xfffff, 10.0);
    light1.position.set(-5, 5, 5);
    scene.add(light1);
    light2.position.set(0, -5, 0);
    scene.add(light2);


}

//taken from http://web.cs.iastate.edu/~smkautz/cs336f17/examples/threejs_examples/RotatingCubeWithCamera.html
function add_axis(scene) {
    // Make some axes
    var material = new THREE.LineBasicMaterial({color: 0xff0000});
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(20, 0, 0)
    );
    var line = new THREE.Line(geometry, material);
    scene.add(line);

    material = new THREE.LineBasicMaterial({color: 0x00ff00});
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 20, 0)
    );
    line = new THREE.Line(geometry, material);
    scene.add(line);

    material = new THREE.LineBasicMaterial({color: 0x0000ff});
    geometry = new THREE.Geometry();
    geometry.vertices.push(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 20)
    );
    line = new THREE.Line(geometry, material);
    scene.add(line);

    //add a small ball so we can see where it is.

}


function add_origin_cube(scene) {
    var cube = new THREE.CubeGeometry(1, 1, 1);
    var materialWhite = new THREE.MeshPhongMaterial({color: 0x000000, specular: 0, shininess: 0})

    var obj = new THREE.Mesh(cube, materialWhite);
    obj.position.set(0, 0, 0);
    scene.add(obj);
}

/**
 * the background is actually object.
 * the reason is taht we want the background colors to participate
 * in the raycasting.
 * if we put it in background it wont be "in the scene"
 * @param scene
 */
//all the planes.
var ny;
var py;
var nx;
var px;
var nz;
var pz;

function setupBackGround(scene) {
    //everything will be in our 5x5 box
    var plane = new THREE.PlaneGeometry(10, 10);
    var materialRed = new THREE.MeshPhongMaterial({color: 0xff0000, specular: 0x440000, shininess: 50});

    ny = new THREE.Mesh(plane, materialRed);
    ny.position.set(0, -5, 0);
    ny.rotation.set(-Math.PI / 2.0, 0, 0);
    py = new THREE.Mesh(plane, materialRed);
    py.position.set(0, 5, 0);
    py.rotation.set((-Math.PI / 2.0, 0, 0));

    var materialGreen = new THREE.MeshPhongMaterial({color: 0x00ff00, specular: 0x004400, shininess: 50});

    nx = new THREE.Mesh(plane, materialGreen);
    nx.position.set(-5, 0, 0);
    nx.rotation.y = Math.PI / 2.0;
    px = new THREE.Mesh(plane, materialGreen);
    px.position.set(5, 0, 0);
    px.rotation.y = Math.PI / 2.0;

    var materialBlue = new THREE.MeshPhongMaterial({color: 0x0000ff, specular: 0x000044, shininess: 50});


    pz = new THREE.Mesh(plane, materialBlue);
    pz.position.set(0, 0, 5);
    nz = new THREE.Mesh(plane, materialBlue);
    nz.position.set(0, 0, -5);

    //add all that background...
    dummy.add(px);
    dummy.add(py);
    dummy.add(pz);
    dummy.add(nx);
    dummy.add(ny);
    dummy.add(nz);


}

/**
 * add a few basic objects for now just one sphere...
 * @param scene
 */
function setup_objects(scene) {
    var sphere = new THREE.SphereGeometry(1, 32, 48);
    var materialWhite = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x111111, shininess: 40});

    var obj = new THREE.Mesh(sphere, materialWhite);
    obj.position.set(0, -4, 0);
    dummy.add(obj);

}


var dummy;
var scene;

function start() {
    window.onclick = raytrace_click;
    window.onkeypress = handleKeyPress;

    scene = new THREE.Scene();
    var ourCanvas = document.getElementById('theCanvas');
    var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
    renderer.setClearColor(0xf0f0f0);
    // renderer.setSize(window.innerWidth,window.innerHeight);

    //do all the stuff.
    dummy = new THREE.Object3D();
    scene.add(dummy);
    cameraSetup(scene);
    setupLights(scene);
    // setupBackGround(scene);
    setup_objects(scene);
    add_axis(scene);
    // add_origin_cube(scene);

    var render = function () {
        renderer.render(scene, camera);
        requestAnimationFrame(render);

    }
    render();


}


var raycaster = new THREE.Raycaster();

//playing around with the Raytracer options....
function raytrace_click(event) {

    if(event.clientX > 800 || event.clientY > 600){console.log("TOOOUT:"+event.x+":"+event.y);return;}
    var x = event.clientX / 800.0*2 - 1;
    var y = -(event.clientY / 600.0)*2 + 1;
    console.log(event);

    console.log("Casting a ray at pos : (" + x + "," + y + ")");
    //we need to compute it to a frame that can be interpretated by both..
    //(x,y,+inf) are clip coordinate.
    //then make a ray from camera but convert it in clip coordinate...
    //
    var vec = new THREE.Vector2(x, y);

    raycaster.setFromCamera(vec, camera);
    // console.log(raycaster.ray.direction);
    var intersections = raycaster.intersectObjects(scene.children,true);
    //we only want the first intersect..

    console.log(raycaster.ray.origin.x+";"+raycaster.ray.origin.y+":"+raycaster.ray.origin.z);
    console.log(camera.position.x+";"+camera.position.y+":"+camera.position.z);
    var direction = new THREE.Vector3(raycaster.ray.direction.x,raycaster.ray.direction.y,raycaster.ray.direction.z);
    direction.y *= 1000;
    direction.x*= 1000;
    direction.z*=1000;


    addAsLine(raycaster.ray.origin,direction,0xff00ff);
    for(var i = 0; i < intersections.length; i++){
        var obj = intersections[i];
        // console.log(obj);
        console.log("Intersection : " +obj.object.position.x);
        console.log("Intersection : " +obj.object.position.y);
        console.log("Intersection : " +obj.object.position.z);

        obj.object.material.color.set(0x111111);
        compute_rebound(raycaster.ray.direction,obj)
    }






}

/**
 * Compute the rebound and what to do with it.
 * We pass the ray and the object that it touched.
 * take care when handling the ray you might want to use ray.direction.
 * @param ray
 * @param object
 */
function compute_rebound(ray, object){
    //objct has point of intersection in world coord,
    //face intersected
    //uv coord at point of intersection.
    var origin = object.point;
    var face = object.face;
    if(face != null) {
        var facenormal = face.normal
        var vertexnormal = face.vertexNormals;
        console.log("Test");
        var cosA = ray.lengthSq() / facenormal.lengthSq();
        console.log(cosA + " : " + facenormal.lengthSq())

        var reflect = ray.reflect(facenormal);
        reflect.x *= 100;
        reflect.y *= 100;
        reflect.z *= 100;
        addAsLine(origin, reflect, 0x001100);
        addAsLine(origin,facenormal,0x000011);
        //So we need to work with ray.reflect on the face normal. It might look weird on the testing.
        //but it seems okay.
        //now we need to recurse on this ray a set level (say 3 to start with)
        /*
        idea of algorithm (not sure)
        raytracing(scene, camera, level):
        for every pixel :
            do the ray tracing. if there is no intersection. leave it as is.
            if there is and intersection :
                compute the lighting ads,
                reflect the vector and
                    if(level >= MAXLEVEL){stop}else
                        raytracing(scene,camera,level+1)



         moreover we need to find a factor or constant for the level of recursion
         because the deeper it is. the less it will have an impact.
         



         */
    }

}

/**
 * debugging function.
 * creates a line from origin to end with said color.
 * @param origin
 * @param end
 * @param color
 */
function addAsLine(origin, end,color){
    var material = new THREE.LineBasicMaterial({color: color});
    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        origin,
        end
    );
    var line = new THREE.Line(geometry, material);

    dummy.add(line);

}




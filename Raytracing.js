var MAXLEVEL = 3;

var debug = false;
var WIDTH = 400.0;
var HEIGHT = 300.0;

//camera thingy..
var camera;
//for threejs
var dummy;
var scene;


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
    if (cameraControl(camera, ch)) return;
}


//we start with a normal presentation....

function cameraSetup(scene) {
    camera = new THREE.PerspectiveCamera(60, WIDTH/HEIGHT, 0.5, 100);
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
    var materialRed = new THREE.MeshPhongMaterial({color: 0xff0000, specular: 0x440000, shininess: 50, vertexColors: THREE.FaceColors});

    ny = new THREE.Mesh(plane, materialRed);
    ny.position.set(0, -5, 0);
    ny.rotation.set(-Math.PI / 2.0, 0, 0);
    py = new THREE.Mesh(plane, materialRed);
    py.position.set(0, 5, 0);
    py.rotation.set((-Math.PI / 2.0, 0, 0));

    var materialGreen = new THREE.MeshPhongMaterial({color: 0x00ff00, specular: 0x004400, shininess: 50,vertexColors: THREE.FaceColors});

    nx = new THREE.Mesh(plane, materialGreen);
    nx.position.set(-5, 0, 0);
    nx.rotation.y = Math.PI / 2.0;
    px = new THREE.Mesh(plane, materialGreen);
    px.position.set(5, 0, 0);
    px.rotation.y = Math.PI / 2.0;

    var materialBlue = new THREE.MeshPhongMaterial({color: 0x0000ff, specular: 0x000044, shininess: 50,vertexColors: THREE.FaceColors});


    pz = new THREE.Mesh(plane, materialBlue);
    pz.position.set(0, 0, 5);
    nz = new THREE.Mesh(plane, materialBlue);
    nz.position.set(0, 0, -5);

    //add all that background...
    // dummy.add(px);
    // dummy.add(py);
    // dummy.add(pz);
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
    var materialWhite = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x111111, shininess: 40,vertexColors: THREE.FaceColors});

    var obj = new THREE.Mesh(sphere, materialWhite);
    obj.position.set(0, -4, 0);
    dummy.add(obj);

}



function start() {
    window.onclick = raytrace_click;
    window.onkeypress = handleKeyPress;
    setupFirstCanvas();

    setupRayCanvas();



}

function setupFirstCanvas(){
    scene = new THREE.Scene();
    var ourCanvas = document.getElementById('theCanvas');
    var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
    renderer.setClearColor(0xf0f0f0);

    //do all the stuff.
    dummy = new THREE.Object3D();
    scene.add(dummy);
    cameraSetup(scene);
    setupLights(scene);
    setupBackGround(scene);
    setup_objects(scene);

    // function render(){
    //     renderer.render(scene,camera);
    //     requestAnimationFrame(render);
    // }
    // render();
    renderer.render(scene,camera);

}
function setupRayCanvas(){
    var ourCanvas = document.getElementById('canvasRay');
    var context = ourCanvas.getContext('2d' );

    var image = context.getImageData(0,0,400,300);
    var data = image.data;
    var idx = 0;
    //this is not very three.js like or what we learnt.
    //however it was the easiest way
    for(var y = 0; y < HEIGHT; y++){

        for(var x = 0; x < WIDTH;x++){
            var perc = (x*HEIGHT+y)/(WIDTH*HEIGHT)*100.0;
            perc = Math.floor(perc);
            if(perc % 10 === 0) {
                console.log("Percentage :" + perc);
            }

            //we need to compute it in NFC
            var xNFC = x / WIDTH*2 - 1;
            var yNFC = -(y / HEIGHT)*2 + 1;
            //TODO in here we need to do our little computation for every pixel :)
            var c = new THREE.Color();
            c.set(spawn_raytracer(xNFC,yNFC));

            data[idx] = c.r*255;//r
            data[idx+1] = c.g*255;//g
            data[idx+2] = c.b*255;//b
            data[idx+3] = 255;//a
            idx+=4;
        }
    }

    context.putImageData(image,0,0);

}


/**
 * Compute the rebound and what to do with it.
 * We pass the ray and the object that it touched.
 * take care when handling the ray you might want to use ray.direction.
 * @param ray
 * @param object
 * @param level of recursion
 */
function compute_rebound(ray, object, level){
    //objct has point of intersection in world coord,
    //face intersected
    //uv coord at point of intersection.

    //we need to apply the model view matrix to the facenormal..
    var origin = object.point;
    var face = object.face;
    console.log("At level "+level+", " +object);
    if(face != null) {
        //TODO Why does it not apply the color. ????
        face.color = new THREE.Color(0.0,0.0,0.0);
        var matrix = object.object.matrixWorld;
        // var matrix = object.object.modelViewMatrix;
        // var rotation = new THREE.Matrix4();
        // rotation.extractRotation(matrix);
        // var facenormal = face.normal.applyMatrix4(rotation);
        var quartenion = object.object.quaternion;
        var facenormal = face.normal.applyQuaternion(quartenion);
        var vertexnormal = face.vertexNormals;
        console.log("Test");

        var reflect = new THREE.Vector3();
        reflect.copy(ray);
        reflect.reflect(facenormal.normalize()).normalize();
        raytrace(origin,reflect, level+1);
        var reflectThousand = new THREE.Vector3(
        reflect.x * 1000,
        reflect.y * 1000,
        reflect.z * 1000);
        addAsLine(origin, reflectThousand, 0xffff00);
        var norm = new THREE.Vector3(facenormal.x*10+origin.x,facenormal.y*10+origin.y,facenormal.z*10+origin.z);
        addAsLine(origin,norm,0x000000);
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
 * Do the ray tracing work with a basic given line.
 *
 * @param origin
 * @param direction
 * @param level the level of recursion.
 */
function raytrace(origin, dir, level){
    if(level >= MAXLEVEL){return;}
    var raycaster = new THREE.Raycaster();
    raycaster.set(origin,dir);

    var intersections = raycaster.intersectObjects(scene.children,true);
    //we only want the first intersect..

    console.log(raycaster.ray.origin.x+";"+raycaster.ray.origin.y+":"+raycaster.ray.origin.z);

    for(var i = 0; i < intersections.length; i++){
        var obj = intersections[i];
        // console.log(obj);
        console.log("Intersection : " +obj.object.position.x);
        console.log("Intersection : " +obj.object.position.y);
        console.log("Intersection : " +obj.object.position.z);

        compute_rebound(raycaster.ray.direction,obj, level)
    }

}




/**********************************************************************
 *
 *
 * FOLLOWING IS THE ACTUAL CODE (TENTATIVE) FOR THE PROJECT!
 * idea :
 * foreach pixel(x,y):
 *      spawn_raytracer(x,y)
 * .....
 *
 *
 *
 *
 *
 *
 **********************************************************************/
//first hit is where we spawn the ray - and the first intersection is where we need to decide the
//color
var raycaster = new THREE.Raycaster();

/**
 * Spawn a ray tracer from the given coordinare.
 * They are already in NFC
 * @param x x coord in NFC
 * @param y y coord in NFC
 * @returns {H} the color.
 */
function spawn_raytracer(x,y){
    //make a vector.
    var vec = new THREE.Vector2(x, y);

    raycaster.setFromCamera(vec, camera);
    // console.log(raycaster.ray.direction);
    var intersections = raycaster.intersectObjects(scene.children,true);
    //we only want the first intersect..

    if(debug) {
        var direction = new THREE.Vector3(raycaster.ray.direction.x, raycaster.ray.direction.y, raycaster.ray.direction.z);
        direction.y *= 1000;
        direction.x *= 1000;
        direction.z *= 1000;


        addAsLine(raycaster.ray.origin, direction, 0xff00ff);
    }

    if(intersections.length>0){
        var hitObj = intersections[0];
        //TODO here instead of returning the color we need to do the ADS Computation.
        return hitObj.object.material.color;
    }else{
        //no hit so we return the ambiant color..

        // console.log(" MISS");
        return new THREE.Color(0.0,0.0,0.0);
    }



}

function compute_color(direction,object,level){

    var origin = object.point;
    var face = object.face;
    console.log("At level "+level+", " +object);
    if(face != null) {
        var matrix = object.object.matrixWorld;

        var quartenion = object.object.quaternion;
        var facenormal = face.normal.applyQuaternion(quartenion);
        var vertexnormal = face.vertexNormals;
        console.log("Test");

        var curr_color = new THREE.Color();
        //TODO compute color according to ADS idea...
        ads_shading(object, curr_color);


        var reflect = new THREE.Vector3();
        reflect.copy(ray);
        reflect.reflect(facenormal.normalize()).normalize();
        return curr_color + (raytrace_color(origin, reflect, level + 1))*coeff_level(level);



    }

}

/**
 * TODO
 * compute the color
 * @param object
 * @param color
 */
function ads_shading(object,color){
//recall the phong model of lighting...
    //TODO ask teacher how to do it..???


}




function raytrace_color(origin, direction, level){
    if(level >= MAXLEVEL){return;}
    var raycaster = new THREE.Raycaster();
    raycaster.set(origin,direction);

    var intersections = raycaster.intersectObjects(scene.children,true);
    //we only want the first intersect..

    console.log(raycaster.ray.origin.x+";"+raycaster.ray.origin.y+":"+raycaster.ray.origin.z);

    if(intersections.length>0){
        var obj = intersections[0];
        // console.log(obj);
        console.log("Intersection : " +obj.object.position.x);
        console.log("Intersection : " +obj.object.position.y);
        console.log("Intersection : " +obj.object.position.z);

        return compute_color(raycaster.ray.direction,obj, level);
    }

    //if no intersection we return 0..
    //maybe return 1 or whatever the background is...
    return 0.0;

}


/**
 * the coefficient of how much it influences the current level..
 * @param level
 * @returns {number}
 */
function coeff_level(level){
    return 1;
    // if(level === 0){
    //     return 0.5;
    // }else if(level === 1){
    //     return 0.25;
    // }else if(level === 2){
    //     return 0.125;
    // }
    // return 0;
}









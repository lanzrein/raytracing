//max lvl of recursion
var MAXLEVEL = 10.0;
//debug flag. leave it to false or it takes very long.
var debug = false;
//size of canvas.
var WIDTH = 400.0;
var HEIGHT = 300.0;

//camera thing..
var camera;
//for threejs
var dummy;
var scene;
var renderer;


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
/**
 * Setup the camera for the scene
 * @param scene the scene
 */
function cameraSetup(scene) {
    camera = new THREE.PerspectiveCamera(60, WIDTH/HEIGHT, 0.5, 100);
    camera.position.set(4, -1, 4);
    camera.lookAt(new THREE.Vector3(0, -4, 0));
}
var lights_array = [];
//only compute it once as it is the same everywhere.
var ambientLight;
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
    var light1 = new THREE.PointLight(0x333333, 10.0);
    var light2 = new THREE.PointLight(0x333333, 10.0);
    light1.position.set(-5, 5, 5);
    scene.add(light1);
    light2.position.set(0, 0, 0);

    scene.add(light2);

    lights_array.push(light1);
    lights_array.push(light2);
    // lights_array.push(lightAmbiant);
    ambientLight = new THREE.Light();
    ambientLight.copy(light1);
    ambientLight.color.add(light2.color);
    ambientLight.color.add(lightAmbiant.color);


}



/**
 * the background is actually object.
 * the reason is taht we want the background colors to participate
 * in the raycasting.
 * if we put it in background it wont be "in the scene"
 * @param scene
 */
//all the planes.
var ny;//red
var nx;//green
var nz;//blue

function setupBackGround(scene) {
    //everything will be in our 5x5 box
    var plane = new THREE.PlaneGeometry(10, 10);
    var materialRed = new THREE.MeshPhongMaterial({color: 0xff0000, specular: 0x440000, shininess: 10000, vertexColors: THREE.NoColors});

    ny = new THREE.Mesh(plane, materialRed);
    ny.position.set(0, -5, 0);
    ny.rotation.set(-Math.PI / 2.0, 0, 0);


    var materialGreen = new THREE.MeshPhongMaterial({color: 0x00ff00, specular: 0x004400, shininess: 50,vertexColors: THREE.FaceColors});

    nx = new THREE.Mesh(plane, materialGreen);
    nx.position.set(-5, 0, 0);
    nx.rotation.y = Math.PI / 2.0;

    var materialBlue = new THREE.MeshPhongMaterial({color: 0x0000ff, specular: 0x000044, shininess: 50,vertexColors: THREE.FaceColors});


    nz = new THREE.Mesh(plane, materialBlue);
    nz.position.set(0, 0, -5);

    //add all that background...

    dummy.add(nx);
    dummy.add(ny);
    dummy.add(nz);


}

/**
 * add a few basic objects for now just one sphere...
 * @param scene
 */
function setup_objects(scene) {
    var sphere = new THREE.SphereGeometry(1, 90, 90);
    var materialWhite = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x000011, shininess: 4,vertexColors: THREE.FaceColors, reflectivity:1});

    var obj = new THREE.Mesh(sphere, materialWhite);
    obj.position.set(0, -4, 0);
    dummy.add(obj);

    var materialYellow = new THREE.MeshPhongMaterial({color: 0xffff00, specular: 0x001111, shininess: 40,vertexColors: THREE.FaceColors, reflectivity:0.1});

    obj = new THREE.Mesh(sphere, materialYellow);
    obj.position.set(-2,-4, 0);
    dummy.add(obj);



}


/**
 * entry point of the program
 */
function start() {
    window.onclick = raytrace_click;
    window.onkeypress = handleKeyPress;
    setupScene();
    setupFirstCanvas();

    setupRayCanvas();



}

/**
 * Setup the THREE.JS scene.
 * Needs to be called before rendering
 */
function setupScene(){
    scene = new THREE.Scene();
    var ourCanvas = document.getElementById('theCanvas');
    renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
    renderer.setClearColor(0xf0f0f0);

    //do all the stuff.
    dummy = new THREE.Object3D();
    scene.add(dummy);
    cameraSetup(scene);
    setupLights(scene);
    setupBackGround(scene);
    setup_objects(scene);
}

/**
 * Setup and render the first canvas
 */
function setupFirstCanvas(){


    function render(){
        renderer.render(scene,camera);
        requestAnimationFrame(render);
    }
    render();
    // renderer.render(scene,camera);

}

/**
 * Setup and render the raytracing canvas
 */
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
            //maybe add something to show progress...

            var c = new THREE.Color();
            c.set(spawn_raytracer(x,y));

            //modulate by MAXLEVEL.
            //not sure if correct..
            // c.r/=MAXLEVEL;
            // c.g/=MAXLEVEL;
            // c.b/=MAXLEVEL;
            // c.multiplyScalar(1/MAXLEVEL);

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
 * Start of the recursive loop for every pixel.
 * We start with index x , y and spawn a raytracer.
 * @param x x coordinate
 * @param y y coordinate.
 * @returns {H} the color of the pixel it hit.
 */
function spawn_raytracer(x,y){
    //convert to nfc

    var xNFC = x / WIDTH*2 - 1;
    var yNFC = -(y / HEIGHT)*2 + 1;
    //make a vector.
    var vec = new THREE.Vector2(xNFC, yNFC);
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(vec, camera);
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
        //since its the first hit object this is where the computation starts.
        var c = new THREE.Color();
        c.set(compute_color(raycaster.ray.direction,hitObj,0));
        return c;
    }else{
        //no hit so we return the ambiant color..
        return ambientLight.color;
    }



}

/**
 * Compute the color for a given point
 * @param ray the ray that hit the object.
 * @param object the hit object
 * @param level the level of recursion
 * @returns {H} a THREE.js color
 */
function compute_color(ray,object,level){

    var origin = new THREE.Vector3();
    origin.copy(object.point);
    var face = object.face;
    if(face != null) {
        var rotation = object.object.rotation;
        var facenormal = new THREE.Vector3();
        facenormal.copy(face.normal).applyEuler(rotation);


        var curr_color = new THREE.Color();

            var reflect = new THREE.Vector3();
            reflect.copy(ray);
            reflect.reflect(facenormal).normalize();
            curr_color.set(ads_shading(object, facenormal, ray, origin, reflect));
            var next_color = new THREE.Color();
            next_color.copy(raytrace_color(origin, reflect, level + 1)).multiplyScalar(object.object.material.reflectivity);
            (curr_color.add(next_color));

        return curr_color;



    }

}

/**
 * Does thes Ambient,Diffuse,Specular computation
 * that is usually done in shader code.
 * @param object the object hit
 * @param facenormal the face normal of the object.
 * @param reflect the reflected vector.
 * @param hitpoint the hitpoint.
 * @returns {H}
 */
function compute_ads(object, facenormal, reflect, hitpoint) {

    var view = camera.position.sub(object.point);
    var V = new THREE.Vector3(view.x, view.y, view.z).normalize();
    var N = facenormal.normalize();
    var R = reflect;
    var t = object.object.material.shininess;
    var L = new THREE.Vector3();
    var ambientLightColor;


    var diffColor = new THREE.Color(0, 0, 0).copy(object.object.material.color);

    var currentLightVector = new THREE.Vector3(0, 0, 0);


    var color = new THREE.Color(0, 0, 0);

    for (var i = 0; i < lights_array.length; i++) {
        var currentLight = lights_array[i];
        currentLightVector = new THREE.Vector3(0, 0, 0);
        var lightColor = currentLight.color;
        var colorVector = new THREE.Vector3(lightColor.r, lightColor.g, lightColor.b);

        // lights_array[i].position.sub(object.point);

        //console.log(pointSum);

        L.copy(currentLight.position);
        L.sub(hitpoint);
        L.normalize();

        ambientLightColor = ambientLight.color;

        var dotimus = Math.max(N.dot(currentLightVector), 0.0);
        var intensity = dotimus * currentLight.intensity;

        var lightCont = new THREE.Color(0, 0, 0);

        lightCont.copy(diffColor);
        lightCont.multiply(lightColor);
        lightCont.multiplyScalar(intensity);

        color.add(lightCont);


        var ambientColor = new THREE.Color(0, 0, 0).copy(ambientLightColor);
        var diffuseColor = new THREE.Color(0, 0, 0).copy(diffColor);//.multiply(diffuseLightColor);
        var specularColor = new THREE.Color(0, 0, 0).copy(object.object.material.specular);//.multiply(specularLightColor);



        var ambientFactor = .05;
        var diffuseFactor = Math.max(0.0, L.dot(N));
        var specularFactor = Math.max(0.0, Math.pow(R.dot(V), t));

        var tempColor = new THREE.Color(0, 0, 0);
        tempColor.add(ambientColor.multiplyScalar(ambientFactor));
        tempColor.add(diffuseColor.multiplyScalar(diffuseFactor));
        tempColor.add(specularColor.multiplyScalar(specularFactor));

        color.add(tempColor);
    }

    return color;
}

/**
 * compute the color
 * @param object
 * @param facenormal
 * @param eye
 * @param hitpoint
 * @param reflect
 */
function ads_shading(object,facenormal,eye,hitpoint,reflect){

    return compute_ads(object, facenormal, reflect, hitpoint);

}
//just testing but not working...
function inShadow(light, originPoint){
    //just do a ray trace and check if first object intersected is the light.
    var raytrace = new THREE.Raycaster();
    raytrace.set(originPoint,light.position);
    var intersections = raytrace.intersectObjects(scene.children,true);
    if(intersections.length>0){
        var intersect = intersections[0];
        if(intersect.object.object instanceof THREE.Light){
            var pos = intersect.object.position;
            return pos.equals(light.position);
        }
    }

    return false;
}

/**
 * subroutine of ray tracing.
 * It works exaclty like the main method.
 *
 * @param origin where to start from
 * @param direction where to go
 * @param level current lvl of recursion
 */
function raytrace_color(origin, direction, level){
    if(level >= MAXLEVEL){return ambientLight.color;}
    var raycaster = new THREE.Raycaster();
    raycaster.set(origin,direction);

    var intersections = raycaster.intersectObjects(scene.children,true);
 //only want the first intersect
    if(intersections.length>0){
        var hitObj = intersections[0];

        return compute_color(raycaster.ray.direction,hitObj, level);
    }

    //if no intersection we return 0..
    //maybe return 1 or whatever the background is...
    return ambientLight.color;

}










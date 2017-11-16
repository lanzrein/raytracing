



//we start with a normal presentation....
var camera;

function cameraSetup(scene) {
    camera = new THREE.PerspectiveCamera(60,1.5,0.1,1000);
    camera.position.set(4,4,4);
    camera.lookAt(new THREE.Vector3(0,0,0));
}

/**
 * put some nice lights on our scene..
 * we choose them bright so it makes a good
 * raycast...
 * we take one ambiant and two light point..
 * @param scene
 */
function setupLights(scene){
    //ambiant
    var lightAmbiant = new THREE.AmbientLight((0x222222));
    scene.add(lightAmbiant);
    var light1 = new THREE.PointLight(0xfffff,10.0);
    var light2 = new THREE.PointLight(0xfffff,10.0);
    light1.position.set(-5,5,5);
    scene.add(light1);
    light2.position.set(0,-5,0);
    scene.add(light2);


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
function setupBackGround(scene){
    //everything will be in our 5x5 box
    var plane = new THREE.PlaneGeometry(10,10);
    var materialRed = new THREE.MeshPhongMaterial({color : 0xff0000, specular : 0x440000, shininess: 50});

    ny = new THREE.Mesh(plane, materialRed);
    ny.position.set(0,-5,0);
    ny.rotation.set(-Math.PI/2.0,0,0);
    py = new THREE.Mesh(plane, materialRed);
    py.position.set(0,5,0);
    py.rotation.set((-Math.PI/2.0,0,0));

    var materialGreen = new THREE.MeshPhongMaterial({color : 0x00ff00, specular : 0x004400, shininess : 50});

    nx = new THREE.Mesh(plane, materialGreen);
    nx.position.set(-5,0,0);
    nx.rotation.y = Math.PI/2.0;
    px = new THREE.Mesh(plane, materialGreen);
    px.position.set(5,0,0);
    px.rotation.y = Math.PI/2.0;

    var materialBlue = new THREE.MeshPhongMaterial({color : 0x0000ff, specular : 0x000044, shininess : 50});


    pz = new THREE.Mesh(plane, materialBlue);
    pz.position.set(0,0,5);
    nz = new THREE.Mesh(plane, materialBlue);
    nz.position.set(0,0,-5);

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
function setup_objects(scene){
    var sphere = new THREE.SphereGeometry(1,32,48);
    var materialWhite = new THREE.MeshPhongMaterial({color : 0xffffff, specular : 0x111111, shininess : 40})

    var obj = new THREE.Mesh(sphere,materialWhite);
    obj.position.set(0,-4.5,0);
    dummy.add(obj);

}


var dummy;

function start(){
    var scene = new THREE.Scene();
    var ourCanvas = document.getElementById('theCanvas');
    var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
    renderer.setClearColor(0xffffff);

    //do all the stuff.
    dummy = new THREE.Object3D();
    scene.add(dummy);
    cameraSetup(scene);
    setupLights(scene);
    setupBackGround(scene);
    setup_objects(scene);

    var render = function () {
        raytrace(scene)
        renderer.render(scene,camera);

    }
    //since raycasting is very expensive we only render it once...
    render();
}


var raycaster = new THREE.Raycaster();
//playing around with the Raytracer options....
function raytrace(scene){

    for(var x = 0; x < 100; x ++){
        for(var y = 0; y < 10; y++){
            console.log("Casting a ray at pos : ("+x+","+y+")");
            //we need to compute it to a frame that can be interpretated by both..
            //(x,y,+inf) are clip coordinate.
            //then make a ray from camera but convert it in clip coordinate...
            //
            var vec = new THREE.Vector2(x,y);

            raycaster.setFromCamera(vec,camera);

            var intersections = raycaster.intersectObjects(dummy.children);
            //we only want the first intersect..
            if(intersections.length> 0){
                var obj = intersections[0];
                console.log(obj);
            }





        }
    }


}

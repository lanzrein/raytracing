



//we start with a normal presentation....
var camera;

function cameraSetup(scene) {
    camera = new THREE.PerspectiveCamera(60,1.5,0.1,1000);
    camera.position.set(10,10,10);
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
    var lightAmbiant = new THREE.AmbientLight((0x11111));
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
function setupBackGround(scene){
    //everything will be in our 5x5 box
    var plane = new THREE.PlaneGeometry(10,10);
    var materialRed = new THREE.MeshPhongMaterial({color : 0xff0000, specular : 0x440000, shininess: 50});

    var ny = new THREE.Mesh(plane, materialRed);
    ny.position.set(0,-5,0);
    ny.rotation.set(Math.PI/2.0,0,0);
    var py = new THREE.Mesh(plane, materialRed);
    py.position.set(0,5,0);
    py.rotation.x = Math.PI/2.0;

    var materialGreen = new THREE.MeshPhongMaterial({color : 0x00ff00, specular : 0x004400, shininess : 50});

    var nx = new THREE.Mesh(plane, materialGreen);
    nx.position.set(-5,0,0);
    nx.rotation.y = Math.PI/2.0;
    var px = new THREE.Mesh(plane, materialGreen);
    px.position.set(5,0,0);
    px.rotation.y = Math.PI/2.0;

    var materialBlue = new THREE.MeshPhongMaterial({color : 0x0000ff, specular : 0x000044, shininess : 50});


    var pz = new THREE.Mesh(plane, materialBlue);
    pz.position.set(0,0,5);
    var nz = new THREE.Mesh(plane, materialBlue);
    nz.position.set(0,0,-5);

    //add all that background...
    scene.add(px);
    scene.add(py);
    scene.add(pz);
    scene.add(nx);
    scene.add(ny);
    scene.add(nz);





}

/**
 * add a few basic objects for now just one sphere...
 * @param scene
 */
function setup_objects(scene){
    var sphere = new THREE.SphereGeometry(1,32,48);
    var materialWhite = new THREE.MeshPhongMaterial({color : 0xffffff, specular : 0x444444, shininess : 40})

    var obj = new THREE.Mesh(sphere,materialWhite);
    obj.position.set(0,-4.5,0);
    scene.add(obj);

}


function start(){
    var scene = new THREE.Scene();
    var ourCanvas = document.getElementById('theCanvas');
    var renderer = new THREE.WebGLRenderer({canvas: ourCanvas});
    renderer.setClearColor(0xffffff);

    //do all the stuff.
    cameraSetup(scene);
    setupLights(scene);
    setupBackGround(scene);
    setup_objects(scene);

    var render = function () {
        requestAnimationFrame(render);
        renderer.render(scene,camera);
    }

    render();
}

/**
 * Do a ray tracing where we click..
 *
 * @param event
 */
function raytrace_click(event) {

    if(event.clientX > WIDTH || event.clientY > HEIGHT){console.log("TOOOUT:"+event.x+":"+event.y);return;}
    var x = event.clientX / WIDTH*2 - 1;
    var y = -(event.clientY / HEIGHT)*2 + 1;
    console.log(event);

    console.log("Casting a ray at pos : (" + x + "," + y + ")");
    //we need to compute it to a frame that can be interpretated by both..
    //(x,y,+inf) are clip coordinate.
    //then make a ray from camera but convert it in clip coordinate...
    //
    var vec = new THREE.Vector2(x, y);
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(vec, camera);
    // console.log(raycaster.ray.direction);
    var intersections = raycaster.intersectObjects(scene.children,true);
    //we only want the first intersect..

    var direction = new THREE.Vector3(raycaster.ray.direction.x,raycaster.ray.direction.y,raycaster.ray.direction.z);
    direction.y *= 1000;
    direction.x*= 1000;
    direction.z*=1000;


    addAsLine(raycaster.ray.origin,direction,0xff00ff,true);
    if(intersections.length > 0){
        var obj = intersections[0];
        // console.log(obj);
        console.log("Intersection : " +obj.object.position.x);
        console.log("Intersection : " +obj.object.position.y);
        console.log("Intersection : " +obj.object.position.z);

        // obj.object.material.color.set(0x111111);
        compute_rebound(raycaster.ray.direction,obj,0)
    }






}



/**
 * debugging function.
 * creates a line from origin to end with said color.
 * @param origin
 * @param end
 * @param color
 */
function addAsLine(origin, end,color, force){
    if(debug || force) {
        var material = new THREE.LineBasicMaterial({color: color});
        var geometry = new THREE.Geometry();
        geometry.vertices.push(
            origin,
            end
        );
        var line = new THREE.Line(geometry, material);

        dummy.add(line);
    }

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
    // console.log("At level "+level+", " +object);
    if(face != null) {


        var matrix = object.object.normalMatrix;
        // var matrix = object.object.modelViewMatrix;
        // var rotation = new THREE.Matrix4();
        var rotation = object.object.rotation;
        // rotation.extractRotation(matrix);
        var facenormal = face.normal.applyEuler(rotation);
        // var quartenion = object.object.quaternion;
        // var facenormal = face.normal.applyQuaternion(quartenion);
        // var vertexnormal = face.vertexNormals;
        // var normal = new THREE.Vector3();
        // for(var i = 0; i < vertexnormal.length; i++){
        //     normal.add(vertexnormal[i]);
        // }
        //     normal.divide(3.0);

        var reflect = new THREE.Vector3();
        reflect.copy(ray);
        reflect.reflect(facenormal.normalize()).normalize();
        raytrace(origin,reflect, level+1);

            var reflectThousand = new THREE.Vector3(
                reflect.x * 1000,
                reflect.y * 1000,
                reflect.z * 1000);
            addAsLine(origin, reflectThousand, 0xffff00,true);
            var norm = new THREE.Vector3(facenormal.x * 10 + origin.x, facenormal.y * 10 + origin.y, facenormal.z * 10 + origin.z);
            addAsLine(origin, norm, 0x000000,true);


    }

}


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

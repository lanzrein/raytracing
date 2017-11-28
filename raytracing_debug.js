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

    raycaster.setFromCamera(vec, camera);
    // console.log(raycaster.ray.direction);
    var intersections = raycaster.intersectObjects(scene.children,true);
    //we only want the first intersect..

    var direction = new THREE.Vector3(raycaster.ray.direction.x,raycaster.ray.direction.y,raycaster.ray.direction.z);
    direction.y *= 1000;
    direction.x*= 1000;
    direction.z*=1000;


    addAsLine(raycaster.ray.origin,direction,0xff00ff);
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
function addAsLine(origin, end,color){
    if(debug) {
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
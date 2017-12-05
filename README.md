# Raytracing project
We list the function and the line number. And if it was adapted or used as is, we say from where 
and what part. 

Aspect of the codes we wrote ourselves : 
l.36 cameraSetup
l.51 setupLights
l.88 setupBackGround
l.123 setup_objects
l.143 start
l.156 setupScene
l.170 setupFirstCanvas
l.381 ads_shading
l.490 raytrace_color

Parts adapted from existing examples : 
l.181 setupRayCanvas - http://alteredqualia.com/three/examples/raytracer_sandbox_reflection.html how to use the imageData
1.230 spawn_raytracer - https://threejs.org/examples/#webgl_geometry_terrain_raycast - understand how to use the ray caster and setFromCamera
l.264 compute_color - http://alteredqualia.com/three/examples/raytracer_sandbox_reflection.html - used to help understand the coloring
l.297 compute_ads - http://alteredqualia.com/three/examples/raytracer_sandbox_reflection.html used as a help to find errors in code. 


Parts used from exisiting examples without modification: 
l.17 getChar - taken from the examples studied in class
l.28 handleKeyPress - taken from examples studied in class 


The methods in raytracing_debug are not used in the project and where just here to help understand how the raytracing worked..
It is still possible to see how we used it : 
- When you click on the upper image on a pixel of the screen. It will spawn a ray and make the rebound computations..


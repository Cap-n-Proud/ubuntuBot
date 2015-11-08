//Rendering parameters
//$fn = 50;
FN=50;

baseX = 59 + 5;
baseY = 83 + 5;
baseZ= 3;

odroid_supportZ = 10;
odroid_supportDE = 7/2;
odroid_supportDI = 3 + 0.2;

odroid_screwDistanceX = 52;
odroid_screwDistanceY = 76;

base_screwDistanceX = 28;
base_screwDistanceY = 35;



module SUB_screwM(diam, lenght, T) {
    //Tolerance should be around 0.3
    cylinder(r = diam / 2-T, h = lenght,$fn=FN);
    translate([0, 0, -3.5]) cylinder(r = 1.15*diam, h = 3.5,$fn=FN);
}

module SUB_support(diam, diamI, lenght, T) {
    difference(){
        cylinder(r=diam/2,h=lenght,center=true, ,$fn=FN);       
        cylinder(r=diamI/2,h=1.2*lenght,center=true, ,$fn=FN);
    }
    
}


difference(){
minkowski(){
    cube([baseX,baseY,baseZ], center=true);
    sphere(2);
}
translate([odroid_screwDistanceX/2,odroid_screwDistanceY/2,0])SUB_screwM(3,2*baseZ,-0.3);
translate([-odroid_screwDistanceX/2,odroid_screwDistanceY/2,0])SUB_screwM(3,2*baseZ,-0.3);
translate([-odroid_screwDistanceX/2,-odroid_screwDistanceY/2,0])SUB_screwM(3,2*baseZ,-0.3);
translate([odroid_screwDistanceX/2,-odroid_screwDistanceY/2,0])SUB_screwM(3,2*baseZ,-0.3);



translate([base_screwDistanceX/2,base_screwDistanceY/2,0])rotate([0,180,0])SUB_screwM(3,2*baseZ,-0.3);
translate([-base_screwDistanceX/2,base_screwDistanceY/2,0])rotate([0,180,0])SUB_screwM(3,2*baseZ,-0.3);
translate([-base_screwDistanceX/2,-base_screwDistanceY/2,0])rotate([0,180,0])SUB_screwM(3,2*baseZ,-0.3);
translate([base_screwDistanceX/2,-base_screwDistanceY/2,0])rotate([0,180,0])SUB_screwM(3,2*baseZ,-0.3);
}
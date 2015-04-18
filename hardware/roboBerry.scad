include <rpi.scad>;

baseX = 150;
baseY = 100;
baseZ = 60; 
baseThickness = 3;
frontZ = 50;
optHoleD = 2;
optHoleLenght = 10;
casterD = 20;
frontWheelD = 50;
casterPillarZ = baseZ + (frontWheelD-casterD)/2;

module base()
{
    cube([baseX , baseY, baseThickness], center = true);
    translate([0,baseY/2-baseThickness/2,-baseZ/2])SUB_sideWall();
    translate([0,-baseY/2+baseThickness/2,-baseZ/2])SUB_sideWall();
    translate([baseX/2+25,0,-frontZ/2+baseThickness/2])SUB_front();
    translate([-baseX/2,0,-casterPillarZ/2])casterSupport();
    
}


module SUB_front()
{
cube([baseThickness, 0.5*baseY, frontZ], center = true);
translate([0,0.5*baseY/2-baseThickness,-frontZ/2])rotate([0,0,45])cube([baseThickness, 0.5*baseY , frontZ], center = false);
mirror([0,1,0])translate([0,0.5*baseY/2-baseThickness,-frontZ/2])rotate([0,0,45])cube([baseThickness, 0.5*baseY , frontZ], center = false);
}
module SUB_sideWall()
{
    difference(){
        cube([baseX , baseThickness, baseZ], center = true);
    //rotate([-90,0,0])linear_extrude(height = 2*baseThickness, center = true, convexity = 10, twist = 0, slices = 200, scale = 1.0) polygon([[-baseX/2,-baseZ/2],[-baseX/4,baseZ/2],[-baseX/2,baseZ/2]], convexity = N);
       
       for (x = [0:2*optHoleLenght:baseX-60]) // two iterations, z = -1, z = 1
{

for (z = [0:5*optHoleD:baseZ]) // two iterations, z = -1, z = 1
{
    translate([-baseX/2+15+x,0,baseZ/2-15-z])rotate([90,0,0])adjustablengHole(optHoleD,optHoleLenght);
}

}
       
       
       
        
    }
}

module adjustablengHole(diam, lenght)
{
    hull(){
        cylinder(r= diam/2, h=3*baseThickness, center=true);
        translate([lenght-diam,0,0])cylinder(r= diam/2, h=3*baseThickness, center=true);
        
    }
}



module casterSupport(){
    intersection()
{
    difference()
{
translate([0.9*baseY,0,0])rotate([0,0,0])cylinder(r=baseY, h=casterPillarZ,center=true);
translate([0.9*baseY,0,0])rotate([0,0,0])cylinder(r=baseY-1*baseThickness, h=1.1*casterPillarZ,center=true);
translate([0,0,-casterPillarZ/2])
sphere(r=1.2*casterD,center=true);
}
cube([baseX,baseY,500], center=true);
}
}

base();

//SUB_sideWall();

//casterPillarZ
//rotate([0,15,0])cube([baseThickness, baseY , casterPillarZ], center = true);

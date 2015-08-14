include <rpi.scad>;
$fn = 150;
edgeRounding=2; //Useful to calculate size aftere Minkowski transformation
baseX = 165;
baseY = 120;
baseZ = 60; 
baseThickness = 4;
frontZ = 50;
optHoleD = 3+0.4;
optHoleLenght = 10;
FN=50;
casterD = 20-edgeRounding;
frontWheelD = 90;
frontWheelZ= 40;
casterPillarZ = frontWheelZ+ frontWheelD/2 - casterD/2;
T=0.5;


module SUB_screwM(diam, lenght, tolerance) {
    //Tolerance should be around 0.3
    cylinder(r = diam / 2+tolerance, h = lenght,$fn=FN);
    translate([0, 0, -3]) cylinder(r = diam + tolerance, h = 3.5,$fn=FN);
}


module caster(casterD)
{
  difference()
    {  
      minkowski()
      {
  difference()
        {
sphere(r=casterD/2, center=true); 
        
translate([0,0,3*casterD/2+casterD/4-edgeRounding])cube([3*casterD,3*casterD,3*casterD], center=true);
translate([0,0,-(3*casterD/2+casterD/4-edgeRounding)])cube([3*casterD,3*casterD,3*casterD], center=true);
      

}
sphere(r=edgeRounding, center=true);
}
translate([0,0,-3-casterD/4])SUB_screwM(3,20,0.2);

}
}



module base() {
	union() {
		
			//Need to add here a shape to cut the li parts at tcaster
			difference() {
				cube([baseX, baseY, baseThickness], center = true);
				topHoles();
			}
			translate([0, baseY / 2 - baseThickness / 2, -baseZ / 2]) SUB_sideWall();
			translate([0, -baseY / 2 + baseThickness / 2, -baseZ / 2]) SUB_sideWall();

			difference()
			{
                
					translate([baseX / 2, 0, -baseZ / 2 + baseThickness / 2])
		SUB_front();
                //Top
                    for (y = [0: 2 * optHoleD: 10]) 
		{     
                 for (x = [0: 2 * optHoleD: baseY - 48]) 
		{
            translate([baseX / 2 + 5 + y, +baseY/2-25-x, 0]) {
					adjustablengHole(optHoleD, optHoleD);

				}
            }
        }
    frontHoles();
          sidefrontholes();
   mirror([0,1,0])sidefrontholes(); 
        
        
        
			}

		
	

		translate([-baseX / 2-baseThickness-2, 0, -casterPillarZ / 2]) rotate([0, 0, 0]) back();

	}
}

module frontHoles()
{
    //Front
 for (y = [65: 3 * optHoleD: baseY]) 
		{     
                 for (z = [0: 3 * optHoleD: baseZ - 15]) 
		{
  translate([baseX/2 +25 , 30+baseY/2-y, -10-z])  rotate([0,90,0])
					adjustablengHole(optHoleD, optHoleD);
       
        }
        }     
    }   
module sidefrontholes()
        {
            //Side
translate([72+baseX/2,10,0])rotate([0,0,-45])
 for (y = [65: 3 * optHoleD: baseY-20]) 
		{     
                 for (z = [0: 3 * optHoleD: baseZ - 15]) 
		{
  translate([ 0, 0-y, -10-z])  rotate([0,90,0])
					adjustablengHole(optHoleD, optHoleD);
       
        }
        }     
    }
    

  
        
module topHoles()
{
    translate([0,-(baseY-15)/2,0])
{
    for (x = [0: 4 * optHoleD: baseX - 18]) 
		{
			for (y = [0: 5 * optHoleD: baseY-15]) // two iterations, z = -1, z = 1
			{
				translate([-baseX / 2 + 15 + x, y, 0]) rotate([0, 0, 90]) adjustablengHole(optHoleD, optHoleLenght*0.8);
			}

		}
     translate([0,baseY/2-5*optHoleD/2,0])adjustablengHole(5*optHoleD, 3.5*optHoleLenght);
        }
}
module SUB_front()
//need to do better calculation andeliminate all h^the numbers
translate([0,0,0])
scale([0.5,1,1])difference(){
{
rotate([0,0,90])cylinder(r=baseY/2,h=baseZ, center=true,$fn=6);


translate([0,0,-baseThickness])
    {rotate([0,0,90])cylinder(r=baseY/2-baseThickness,h=baseZ, center=true,$fn=6);
translate([-baseY/2,0,5])cube([baseY,baseY,1.2*baseZ],center=true);

    }

  
}
}

module SUB_frontOLD()
{
cube([baseThickness, 0.5*baseY, frontZ], center = true);

translate([0,0.5*baseY/2-baseThickness,-frontZ/2])rotate([0,0,45])cube([baseThickness, 0.5*baseY , frontZ], center = false);
mirror([0,1,0])translate([0,0.5*baseY/2-baseThickness,-frontZ/2])rotate([0,0,45])cube([baseThickness, 0.5*baseY , frontZ], center = false);


}

module SUB_sideWall() {
	difference() {
		cube([baseX, baseThickness, baseZ], center = true);

		for (x = [0: 2 * optHoleLenght: baseX - 80]) // two iterations, z = -1, z = 1
		{
			for (z = [0: 5 * optHoleD: baseZ]) // two iterations, z = -1, z = 1
			{
				translate([-baseX / 2 + 15 + x, 0, baseZ / 2 - 15 - z]) rotate([90, 0, 0]) adjustablengHole(optHoleD, optHoleLenght);
			}

		}
       
       
       
        
    }
}

module adjustablengHole(diam, lenght)
{
    translate([-(lenght-diam)/2,0,0])hull(){
        cylinder(r= diam/2, h=3*baseThickness, center=true);
        translate([lenght-diam,0,0])cylinder(r= diam/2, h=3*baseThickness, center=true);
        
    }
}



module back(){
    intersection()
{
    difference()
{
translate([0.9*baseY,0,0])rotate([0,0,0])cylinder(r=baseY, h=casterPillarZ,center=true);
translate([0.9*baseY,0,0])rotate([0,0,0])cylinder(r=baseY-1*baseThickness, h=1.1*casterPillarZ,center=true);
translate([0,0,-casterPillarZ/2+casterD/2])
rotate([90,90,0])caster(2*casterD);
    //sphere(r=1.2*casterD,center=true);
}
cube([baseX,baseY,500], center=true);
}
}


//base();
//translate([-baseX/2,-baseY/2,0])cube([4,130,24]);
//adjustablengHole(5*optHoleD, 3*optHoleLenght);
//SUB_front();

//casterPillarZ
//rotate([0,15,0])cube([baseThickness, baseY , casterPillarZ], center = true);
//casterSupport();
//translate([0,0,-3-casterD/4])SUB_screwM(3,20,0);
//rotate([90,90,0])caster(1.2*casterD);


module SUB_casterPillar(){
{
    difference(){{cube([casterD/2,10,casterD],center=true);
translate([-casterD/2+6,0,-casterD/2+4])
rotate([0,90,0])SUB_screwM(3,casterD,-0.15);
}
}
}
}

//translate([0,casterD/2+T,0])
module casterPillarL()
{
//    translate([-T,0,0])SUB_casterPillar();
//translate([casterD/2,0,-casterD/2+4])rotate([0,90,0])caster(casterD);
translate([casterD/4+3/2*casterD/2+T,0,0])rotate([0,0,180])SUB_casterPillar();
}

module casterPillarR()
{
    translate([-T,0,0])SUB_casterPillar();
//translate([casterD/2,0,-casterD/2+4])rotate([0,90,0])caster(casterD);
//translate([casterD/4+3/2*casterD/2+T,0,0])rotate([0,0,180])SUB_casterPillar();
}
module nema17(L, negHoles, T)
{
   cylinder(r=(5+T)/2,h=24, center=false);
   translate([0,0,24])cylinder(r=22/2,h=2, center=false);

   
  if (negHoles== "N")
{
    translate([0,0,24+2+L/2])cube([42.3,42.3,L], center=true); 
translate([-((31+3)/2),-((31+3)/2),0]){
   translate([31,0,0])cylinder(r=4/2,h=50, center=false);
   translate([31,31,0])cylinder(r=4/2,h=50, center=false);
   translate([0,31,0])cylinder(r=4/2,h=50, center=false);
   translate([0,0,0])cylinder(r=4/2,h=50, center=false);
    }} 
    else
        {
            difference(){
    translate([0,0,24+2+L/2])cube([42.3,42.3,L], center=true); 
translate([-((31+3)/2),-((31+3)/2),0]){
   translate([31,0,0])cylinder(r=4/2,h=50, center=false);
   translate([31,31,0])cylinder(r=4/2,h=50, center=false);
   translate([0,31,0])cylinder(r=4/2,h=50, center=false);
   translate([0,0,0])cylinder(r=4/2,h=50, center=false);
    }
}  
}

}

difference(){
base();
translate([baseX/2-30,baseY-32.84-baseThickness,-frontWheelZ])rotate([0,90,-90])nema17(32.84,"N",1);
translate([baseX/2-30,-(baseY-32.84-baseThickness),-frontWheelZ])rotate([0,90,90])nema17(32.84,"N",1);
}

/*
difference(){
rotate([0,0,90])translate([-casterD/2,+casterD/2,-2*casterD]){
    
        casterPillarL();
        casterPillarR();
}
    back();

}*/

//base();


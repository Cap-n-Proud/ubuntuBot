$fn = 300;

PiSupportH = 10;
PiSupportD = 8;

PiSupportScrew = 3;
T = 0.2;

PIcameraDiam = 8;
PIcameraX = 25;
PIcameraY = 25;
module PiStud(){
difference(){
    
cylinder(d = PiSupportD, h = PiSupportH , center = true);
cylinder(d = PiSupportScrew+T,h = PiSupportH , center = true);
   
}
}


module PiSupport2(){
        linear_extrude(height = 6, center = true, convexity = 10, twist = 0, slices = 20, scale = 1.0) hull(){circle(r=3/2-T, center = true); translate([15.5-3-2*T,0,0])   circle(r=3/2-T,center = true);}
translate([15.5-10-3,0,0])difference(){

cube([10,20,3]);

translate([5,11,+PiSupportH/2])cylinder(d = PiSupportD+T, h = PiSupportH , center = true);
}

}


module SUB_PiCamHoles(T) {
// T is the T for holes
        translate([PIcameraX/2-2, 0, PIcameraY/2-2])rotate([90,0,0])cylinder(r=1+T,h=15, center=true);
		translate([-(PIcameraX/2-2), 0, PIcameraY/2-2])rotate([90,0,0])cylinder(r=1+T,h=15, center=true);
		translate([PIcameraX/2-2, 0, (PIcameraY/2-2)-12.5])rotate([90,0,0])cylinder(r=1+T,h=15, center=true);
		translate([-(PIcameraX/2-2), 0, (PIcameraY/2-2)-12.5])rotate([90,0,0])cylinder(r=1+T,h=15, center=true); 
    
}    
    


difference(){
    translate([0, -6/2, 20/4])cube([28,6,20], center=true);
    {translate([-10, -5, 20/4])rotate([90,0,0])cylinder(r=2.5+T,h=3, center=true);
    translate([-10, 0, 20/4])rotate([90,0,0])cylinder(r=1+T,h=15, center=true);
    translate([+10, -5, 20/4])rotate([90,0,0])cylinder(r=2.5+T,h=3, center=true);
    translate([+10, 0, 20/4])rotate([90,0,0])cylinder(r=1+T,h=15, center=true);
    translate([0, 0, 20/4])rotate([90,0,0])cylinder(r=8,h=15, center=true);    
    SUB_PiCamHoles(-T);
        }
}
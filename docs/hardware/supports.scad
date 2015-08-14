//$fn=150;

module support(D1,H1, D2, H2, offsetval)
{
    difference()
    {
        union(){
            cylinder(r=2.5*(D1/2), h=H1, center=false);
    translate([offsetval,0,H1])cylinder(r=2.5*(D2/2), h=H2, center=false);
             translate([0,0,H1-(H1+H2)/6])
hull()
        {
         cylinder(r=2.5*(D1/2), h=(H1+H2)/3, center=false);
          translate([offsetval,0,0])cylinder(r=2.5*(D2/2), h=(H1+H2)/3, center=false);   
            
        }    
            }
        cylinder(r=D1/2-0.2, h=2*H1, center=false);
         translate([offsetval,0,H1-(H1+H2)/3])cylinder(r=D2/2-0.2, h=3*H2, center=false);
    }
   
}

support(1.90,25, 1.90, 5, 15.75);
translate([35,0,0])support(1.90,25, 1.90, 5, 20);
translate([35,0,35])support(1.90,25, 1.90, 5, 14.5);
translate([0,0,35])support(1.90,25, 1.90, 5, 15.75);
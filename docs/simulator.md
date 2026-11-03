# 3D view of the design

<a class="app-link" href="../navigator/#/?m=v3d">Open the 3D view</a> <a href="../viewer/">Open the viewer alone</a>

The 3D view shows the kart as designed. It is drawn from `docs/data/design.json`, which `calc/design.py` writes from the values of the record. It does not hold numbers of its own.

In the navigator you can switch between the summer, winter, and transport configurations, put an adult, a child, or no rider on the seat, show the loading space of the Delica D:5, show dimensions, and look from an oblique, side, top, or front view.

Selecting a requirement, value, hazard, or part in the navigator lights the parts it concerns in the 3D view. Picking a part in the 3D view selects that part in the navigator and shows its values and requirements.

!!! warning "Illustrations, not verification"
    The view shows the designed geometry. It does not verify any requirement. Checks are recorded in the record, not here.

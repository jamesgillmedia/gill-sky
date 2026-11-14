/* about-calc-3d · the calculator's relief, measured from the clip (media/about/calculator.mp4, 360 x 640, frame at 8 s).
   Every feature is a quad in video pixels (TL, TR, BR, BL; the calculator is upside down and turned about 3.5 deg in the photo, so
   the quads are measured as they sit, not squared up). z is in video pixels too: + is towards the viewer, 0 is the face plate.
   Nothing here is a picture: the model is only shape. Its colour is the clip itself, projected from the rest camera. */
window.GJ_CALC3D_MODEL={
  /* the light edge of the case (left), raised a little */
  rim:   {q:[[76,82],[105,82],[55,556],[29,556]],z:3,taper:1},
  /* the six keys the photo shows (three cut by the frame at the top): caps, tapered */
  keys:[
    {q:[[122,82],[186,82],[186,116],[122,117]],z:6},   /* ↕ */
    {q:[[210,83],[273,84],[273,124],[210,123]],z:6},   /* ♪ */
    {q:[[295,90],[360,92],[360,137],[295,135]],z:6},   /* % */
    {q:[[117,142],[178,143],[178,178],[117,177]],z:6}, /* C·CE (red) */
    {q:[[200,153],[263,155],[263,194],[200,192]],z:6}, /* π */
    {q:[[285,164],[348,166],[348,204],[285,202]],z:6}  /* 1/X */
  ],
  keyRound:6,keyTaper:2.2,
  /* the green display, a window set into the plate */
  disp:  {q:[[94,218],[360,237],[360,416],[78,393]],z:-7,taper:3},
  /* the 'Calculator' name plate, a shallow step */
  plate: {q:[[79,400],[360,422],[360,480],[71,459]],z:-2,taper:1},
  /* beyond the rim: the case side and the dark behind it, set well back */
  side:  {z:-20},
  /* the OFF / ON slide, on the case side */
  sw:    {q:[[2,381],[40,383],[40,472],[2,470]],z:-11,taper:1},
  /* the body's own thickness behind the face (only seen when it is turned) */
  slab:30
};

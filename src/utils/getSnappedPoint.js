 
// utils/getSnappedPoint.js
export function getSnappedPoint(
  mouseNDC,
  worldPoint,
  snapPoints,
  camera,
  renderer,
  options = {}
) {
  const { snapMode = true, objectSnap = true  } = options;

  if (!snapMode || !objectSnap) {
    return { finalPoint: worldPoint.clone(), snapped: false, snapSource: null };
  }
  let snapped = false;
  let finalPoint = worldPoint.clone();
  let snapSource = null; 
  for (let sp of snapPoints) {
    const projected = sp.position.clone().project(camera);
    const screenX = (projected.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const screenY = (1 - (projected.y * 0.5 + 0.5)) * renderer.domElement.clientHeight;

    const mouseX = (mouseNDC.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const mouseY = (1 - (mouseNDC.y * 0.5 + 0.5)) * renderer.domElement.clientHeight;

    const dx = screenX - mouseX;
    const dy = screenY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      finalPoint = sp.position.clone();
      snapSource = sp;
      snapped = true;
      break;
    }
  }

  return { finalPoint, snapped, snapSource };
}
export function getSnappedPointForLightBuat(
  mouseNDC,
  worldPoint,
  snapPoints,
  camera,
  renderer,
  options = {}
) {
  const { snapMode = true, objectSnap = true  } = options;
  
  if (!snapMode || !objectSnap) {
    return { finalPoint: worldPoint.clone(), snapped: false, snapSource: null };
  }
  let snapped = false;
  let finalPoint = worldPoint.clone();
  let snapSource = null;
  for (let sp of snapPoints) {
    if(sp.type!=="buatLightingSquare") continue    
    const rect = renderer.domElement.getBoundingClientRect();

    const projected = sp.position.clone();
    projected.project(camera);
    
    const screenX = (projected.x * 0.5 + 0.5) * rect.width + rect.left;
    const screenY = (1 - (projected.y * 0.5 + 0.5)) * rect.height + rect.top;
    
    const mouseX = (mouseNDC.x * 0.5 + 0.5) * rect.width + rect.left;
    const mouseY = (1 - (mouseNDC.y * 0.5 + 0.5)) * rect.height + rect.top;
    

    const dx = screenX - mouseX;
    const dy = screenY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    console.log("getSnappedPointForLightBuat : ",distance,sp)

    if (distance < 10) {
      finalPoint = sp.position.clone();
      snapSource = sp;
      snapped = true;
      console.log("getSnappedPointForLightBuat snapSource : ",snapSource)
      break;
    }
  }

  return { finalPoint, snapped, snapSource };
}
export function getSnappedPointForPanel(
  mouseNDC,
  worldPoint,
  snapPoints,
  camera,
  renderer,
  options = {}
) {
  const {forWhere="draw", snapMode = true, objectSnap = true } = options;

  if (!snapMode || !objectSnap) {
    return { finalPoint: worldPoint.clone(), snapped: false, snapSource: null };
  }
  let snapped = false;
  let finalPoint = worldPoint.clone();
  let snapSource = null;
 let minDistance = Infinity;
let bestSnap = null;

  for (let sp of snapPoints) {
    dongu(sp)

/*     if (forWhere === "panel" )  {
      if(sp.connection)dongu(sp)
    } else if(forWhere === "draw" ){
      dongu(sp)
    } */
  }

  function dongu(sp){ 
    const projected = sp.position.clone().project(camera);
    const screenX = (projected.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const screenY = (1 - (projected.y * 0.5 + 0.5)) * renderer.domElement.clientHeight;
    
    const mouseX = (mouseNDC.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const mouseY = (1 - (mouseNDC.y * 0.5 + 0.5)) * renderer.domElement.clientHeight;
    
    const dx = screenX - mouseX;
    const dy = screenY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance < minDistance && distance < 10) {
      minDistance = distance;
      bestSnap = sp;
    }
    if (bestSnap) {
      finalPoint = bestSnap.position.clone();
      snapSource = bestSnap;
      snapped = true;
    }}
  return { finalPoint, snapped, snapSource };
}
// utils/getSnappedPointLightFixture.js
// utils/getSnappedPointLightFixture.js
export function getSnappedPointLightFixture(
  mouseNDC,
  worldPoint,
  snapPoints,
  camera,
  renderer,
  options = {}
) {
  let snapped = false;
  let finalPoint = worldPoint.clone();
  let snapSource = null;

  // Snap noktaları üzerinde döngü başlatıyoruz
  for (let sp of snapPoints) {
    // Sadece lightingBuat tipi için işlem yapıyoruz
    if (sp.snapType !== 'lightingBuat') continue;

    const rect = renderer.domElement.getBoundingClientRect();
    const projected = sp.position.clone();
    projected.project(camera);
    
    const screenX = (projected.x * 0.5 + 0.5) * rect.width + rect.left;
    const screenY = (1 - (projected.y * 0.5 + 0.5)) * rect.height + rect.top;
    
    const mouseX = (mouseNDC.x * 0.5 + 0.5) * rect.width + rect.left;
    const mouseY = (1 - (mouseNDC.y * 0.5 + 0.5)) * rect.height + rect.top;

    const dx = screenX - mouseX;
    const dy = screenY - mouseY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 10) {
      finalPoint = sp.position.clone();
      snapSource = sp;
      snapped = true;
      break;
    }
  }

  return { finalPoint, snapped, snapSource };
}

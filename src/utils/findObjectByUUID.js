export function findObjectByUUID(scene, uuid) {
    let found = null;
    scene.traverse(obj => {
      if (obj.uuid === uuid) {
        found = obj;
      }
    });
    return found;
  }
  
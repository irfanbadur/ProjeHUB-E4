// utils/getObjectById.js
export const getObjectById = (scene, id) => {
    return scene.children.find((obj) => obj.userData?.id === id);
  };
  
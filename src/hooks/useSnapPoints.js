// hooks/useSnapPoints.js
import { useEffect, useState } from 'react';
import { getSnapPointsFromScene } from '../utils/getSnapPointsFromScene';

const useSnapPoints = (scene) => {
  const [snapPoints, setSnapPoints] = useState([]);

  const refreshSnapPoints = () => {
    if (!scene) return;
    const points = getSnapPointsFromScene(scene);
    setSnapPoints(points);
  };

  useEffect(() => {
    refreshSnapPoints(); // Başlangıçta yükle
  }, [scene?.children.length]);

  return { snapPoints, refreshSnapPoints };
};

export default useSnapPoints;



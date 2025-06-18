import { useEffect, useState } from 'react';
import { getSnapPointsFromScene } from '../utils/getSnapPointsFromScene';

export default function useSnapManager(scene) {
  const [snapPoints, setSnapPoints] = useState([]);

  useEffect(() => {
    if (!scene) return;

    const update = () => {
      const points = getSnapPointsFromScene(scene);
      setSnapPoints(points);
    };

    const interval = setInterval(update, 500); // Her 0.5 saniyede güncellesin
    update(); // ilk seferde hemen güncelle

    return () => clearInterval(interval);
  }, [scene]);

  return snapPoints;
}

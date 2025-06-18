import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
    setCommandMessage,
    resetOperation,
    setOperationData,
    setOperationStep,
} from '../redux/operationSlice';
import { getSnapPointsFromScene } from '../utils/getSnapPointsFromScene';
import { getSnappedPoint } from '../utils/getSnappedPoint';
import { createSnapMarker } from '../utils/createSnapMarker';
import { generateUniqueId } from '../utils/generateUniqueId';

const useDrawArc = (scene, camera, renderer,snapPoints) => {
    const snapMarkerRef = useRef(null);
    const tempArcRef = useRef(null);
    const dispatch = useDispatch();

    const { commandType, step, data } = useSelector(state => state.operation);
    const gridSnap = useSelector(state => state.mods.gridSnap);
    const objectSnap = useSelector(state => state.mods.objectSnap);
    const snapMode = useSelector((state) => state.mods.snapMode);

    const gridSize = 10;

    const applyGridSnap = (point) => {
        return new THREE.Vector3(
            Math.round(point.x / gridSize) * gridSize,
            Math.round(point.y / gridSize) * gridSize,
            0
        );
    };

    const serializeVector = (v) => ({ x: v.x, y: v.y, z: v.z });

    useEffect(() => {
        if (commandType !== 'drawArc' || !scene || !camera || !renderer) return;

        const domElement = renderer.domElement;
        dispatch(setCommandMessage("Yay merkezi için nokta seçin."));

        const handleClick = (e) => {
            const rect = domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            const mouseNDC = new THREE.Vector2(x, y);
            const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
 
            
            let { finalPoint, snapped, snapSource  } = getSnappedPoint(mouseNDC, worldPoint, snapPoints, camera, renderer, {snapMode:snapMode });

            const point = (objectSnap && snapped) ? finalPoint.clone() : (gridSnap ? applyGridSnap(worldPoint) : worldPoint.clone());

            if (snapMarkerRef.current) {
                scene.remove(snapMarkerRef.current);
                snapMarkerRef.current.geometry.dispose();
                snapMarkerRef.current.material.dispose();
                snapMarkerRef.current = null;
            }

            if (snapped && snapSource) {
                const marker = createSnapMarker(8, snapSource);
                marker.position.copy(finalPoint);
                scene.add(marker);
                snapMarkerRef.current = marker;
            }

            if (step === 0) {
                dispatch(setOperationData({ center: serializeVector(point) }));
                dispatch(setOperationStep(1));
                dispatch(setCommandMessage("Başlangıç noktası için tıklayın."));
            } else if (step === 1) {
                dispatch(setOperationData({ ...data, start: serializeVector(point) }));
                dispatch(setOperationStep(2));
                dispatch(setCommandMessage("Bitiş noktası için tıklayın."));
            } else if (step === 2) {
                const center = new THREE.Vector3(data.center.x, data.center.y, data.center.z);
                const start = new THREE.Vector3(data.start.x, data.start.y, data.start.z);
                const end = point;

                const radius = center.distanceTo(start);
                const vStart = new THREE.Vector2(start.x - center.x, start.y - center.y);
                const vEnd = new THREE.Vector2(end.x - center.x, end.y - center.y);

                let startAngle = Math.atan2(vStart.y, vStart.x);
                let endAngle = Math.atan2(vEnd.y, vEnd.x);

                if (endAngle <= startAngle) endAngle += Math.PI * 2;

                const angleStep = (endAngle - startAngle) / 64;
                const arcPoints = [];
                for (let i = 0; i <= 64; i++) {
                    const angle = startAngle + i * angleStep;
                    arcPoints.push(new THREE.Vector3(
                        center.x + radius * Math.cos(angle),
                        center.y + radius * Math.sin(angle),
                        0
                    ));
                }

                const geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
                const material = new THREE.LineBasicMaterial({ color: 0xffffff });
                const arc = new THREE.Line(geometry, material);
                arc.userData = {
                    id: generateUniqueId(),
                    isSelectable: true,
                    type: 'arc',
                    center: { x: center.x, y: center.y, z:0 },
                    radius: radius,
                        // yayın yarıçapı
                  };
                scene.add(arc);

                if (tempArcRef.current) {
                    scene.remove(tempArcRef.current);
                    tempArcRef.current.geometry.dispose();
                    tempArcRef.current.material.dispose();
                    tempArcRef.current = null;
                }

                dispatch(resetOperation());
                dispatch(setCommandMessage(""));
            }
        };

        const handleMouseMove = (e) => {
            const rect = domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            const mouseNDC = new THREE.Vector2(x, y);
            const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
  
            const { finalPoint, snapped, snapSource } = getSnappedPoint(
                mouseNDC,
                worldPoint,
                snapPoints,
                camera,
                renderer,
                { snapMode }
              );
            const point = (objectSnap && snapped) ? finalPoint.clone() : (gridSnap ? applyGridSnap(worldPoint) : worldPoint.clone());

            if (snapMarkerRef.current) {
                scene.remove(snapMarkerRef.current);
                snapMarkerRef.current.geometry.dispose();
                snapMarkerRef.current.material.dispose();
                snapMarkerRef.current = null;
            }

            if (snapped && snapSource) {
                const marker = createSnapMarker(8, snapSource);
                marker.position.copy(finalPoint);
                scene.add(marker);
                snapMarkerRef.current = marker;
            }

            if (step < 2) return;

            const center = new THREE.Vector3(data.center.x, data.center.y, data.center.z);
            const start = new THREE.Vector3(data.start.x, data.start.y, data.start.z);
            const end = point;

            const radius = center.distanceTo(start);
            const vStart = new THREE.Vector2(start.x - center.x, start.y - center.y);
            const vEnd = new THREE.Vector2(end.x - center.x, end.y - center.y);

            let startAngle = Math.atan2(vStart.y, vStart.x);
            let endAngle = Math.atan2(vEnd.y, vEnd.x);
            if (endAngle <= startAngle) endAngle += Math.PI * 2;

            const angleStep = (endAngle - startAngle) / 64;
            const arcPoints = [];
            for (let i = 0; i <= 64; i++) {
                const angle = startAngle + i * angleStep;
                arcPoints.push(new THREE.Vector3(
                    center.x + radius * Math.cos(angle),
                    center.y + radius * Math.sin(angle),
                    0
                ));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(arcPoints);
            const material = new THREE.LineBasicMaterial({ color: 0xffff00 });

            if (tempArcRef.current) {
                scene.remove(tempArcRef.current);
                tempArcRef.current.geometry.dispose();
                tempArcRef.current.material.dispose();
            }

            tempArcRef.current = new THREE.Line(geometry, material);
            scene.add(tempArcRef.current);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (tempArcRef.current) {
                    scene.remove(tempArcRef.current);
                    tempArcRef.current.geometry.dispose();
                    tempArcRef.current.material.dispose();
                    tempArcRef.current = null;
                }
                if (snapMarkerRef.current) {
                    scene.remove(snapMarkerRef.current);
                    snapMarkerRef.current.geometry.dispose();
                    snapMarkerRef.current.material.dispose();
                    snapMarkerRef.current = null;
                }
                dispatch(resetOperation());
                dispatch(setCommandMessage(""));
            }
        };

        domElement.addEventListener('click', handleClick);
        domElement.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            domElement.removeEventListener('click', handleClick);
            domElement.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [commandType, step, data, scene, camera, renderer, dispatch, gridSnap,snapMode, objectSnap]);
};

export default useDrawArc;

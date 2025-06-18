import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
    setCommandMessage,
    resetOperation,
    setOperationData,
    setOperationStep,
} from '../redux/operationSlice';
import { getSnappedPoint } from '../utils/getSnappedPoint';
import { createSnapMarker } from '../utils/createSnapMarker';
import { generateUniqueId } from '../utils/generateUniqueId';

const useDrawEllipse = (scene, camera, renderer,snapPoints) => {
    const snapMarkerRef = useRef(null);
    const tempEllipseRef = useRef(null);
    const dispatch = useDispatch();

    const { commandType, step, data } = useSelector(state => state.operation);
    const gridSnap = useSelector(state => state.mods.gridSnap);
    const objectSnap = useSelector(state => state.mods.objectSnap);
    const orthoMode = useSelector(state => state.mods.orthoMode);
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

    const getOrthoSnappedPoint = (center, current) => {
        const dx = Math.abs(current.x - center.x);
        const dy = Math.abs(current.y - center.y);
        if (dx > dy) {
            return new THREE.Vector3(current.x, center.y, 0); // yatay
        } else {
            return new THREE.Vector3(center.x, current.y, 0); // dikey
        }
    };

    useEffect(() => {
        if (commandType !== 'drawEllipse' || !scene || !camera || !renderer) return;

        const domElement = renderer.domElement;
        dispatch(setCommandMessage("Merkez noktasını seçin."));

        const handleClick = (e) => {
            const rect = domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
            const mouseNDC = new THREE.Vector2(x, y);
            const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

            let { finalPoint, snapped, snapSource } = getSnappedPoint(mouseNDC, worldPoint, snapPoints, camera, renderer, {snapMode:snapMode });

            const point = (objectSnap && snapped) ? finalPoint.clone() : (gridSnap ? applyGridSnap(worldPoint) : worldPoint.clone());

            if (snapped && snapSource) {
                if (snapMarkerRef.current) {
                    scene.remove(snapMarkerRef.current);
                    snapMarkerRef.current.geometry.dispose();
                    snapMarkerRef.current.material.dispose();
                    snapMarkerRef.current = null;
                }
                const marker = createSnapMarker(8, snapSource);
                marker.position.copy(finalPoint);
                scene.add(marker);
                snapMarkerRef.current = marker;
            }

            if (step === 0) {
                dispatch(setOperationData({ center: serializeVector(point) }));
                dispatch(setOperationStep(1));
                dispatch(setCommandMessage("Uzun kenar (major axis) için tıklayın."));
            } else if (step === 1) {
                const center = new THREE.Vector3(data.center.x, data.center.y, data.center.z);
                const major = orthoMode ? getOrthoSnappedPoint(center, point) : point;
                dispatch(setOperationData({ ...data, major: serializeVector(major) }));
                dispatch(setOperationStep(2));
                dispatch(setCommandMessage("Kısa kenar (minor axis) için tıklayın."));
            } else if (step === 2) {
                const center = new THREE.Vector3(data.center.x, data.center.y, data.center.z);
                const major = new THREE.Vector3(data.major.x, data.major.y, data.major.z);
                const minor = point;

                const majorVec = major.clone().sub(center);
                const minorVec = minor.clone().sub(center);

                const majorRadius = majorVec.length();
                const minorRadius = minorVec.length();

                const angle = Math.atan2(majorVec.y, majorVec.x);

                const ellipsePoints = [];
                for (let i = 0; i <= 64; i++) {
                    const theta = (i / 64) * Math.PI * 2;
                    const x = majorRadius * Math.cos(theta);
                    const y = minorRadius * Math.sin(theta);
                    const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
                    const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
                    ellipsePoints.push(new THREE.Vector3(center.x + rotatedX, center.y + rotatedY, 0));
                }

                const geometry = new THREE.BufferGeometry().setFromPoints(ellipsePoints);
                const material = new THREE.LineBasicMaterial({ color: 0xffffff });
                const ellipse = new THREE.LineLoop(geometry, material);
                ellipse.userData = { id: generateUniqueId(), 
                    isSelectable: true, 
                    type: 'ellipse' ,
                    center: center,
                    majorRadius:majorRadius,
                    minorRadius:minorRadius,
                    angle:angle,
                    major:major,


                };
                scene.add(ellipse);

                if (tempEllipseRef.current) {
                    scene.remove(tempEllipseRef.current);
                    tempEllipseRef.current.geometry.dispose();
                    tempEllipseRef.current.material.dispose();
                    tempEllipseRef.current = null;
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

            if (step < 1 || !data.center) return;

            const center = new THREE.Vector3(data.center.x, data.center.y, data.center.z);
            const major = (step === 1)
                ? (orthoMode ? getOrthoSnappedPoint(center, point) : point)
                : new THREE.Vector3(data.major.x, data.major.y, data.major.z);

            const minor = (step === 2) ? point : null;

            const majorVec = major.clone().sub(center);
            const majorRadius = majorVec.length();
            const angle = Math.atan2(majorVec.y, majorVec.x);

            const minorRadius = minor ? minor.clone().sub(center).length() : majorRadius * 0.5;

            const ellipsePoints = [];
            for (let i = 0; i <= 64; i++) {
                const theta = (i / 64) * Math.PI * 2;
                const x = majorRadius * Math.cos(theta);
                const y = minorRadius * Math.sin(theta);
                const rotatedX = x * Math.cos(angle) - y * Math.sin(angle);
                const rotatedY = x * Math.sin(angle) + y * Math.cos(angle);
                ellipsePoints.push(new THREE.Vector3(center.x + rotatedX, center.y + rotatedY, 0));
            }

            const geometry = new THREE.BufferGeometry().setFromPoints(ellipsePoints);
            const material = new THREE.LineBasicMaterial({ color: 0xffff00 });

            if (tempEllipseRef.current) {
                scene.remove(tempEllipseRef.current);
                tempEllipseRef.current.geometry.dispose();
                tempEllipseRef.current.material.dispose();
            }

            tempEllipseRef.current = new THREE.Line(geometry, material);
            scene.add(tempEllipseRef.current);
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (tempEllipseRef.current) {
                    scene.remove(tempEllipseRef.current);
                    tempEllipseRef.current.geometry.dispose();
                    tempEllipseRef.current.material.dispose();
                    tempEllipseRef.current = null;
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
    }, [commandType, step, data, scene, camera, renderer, dispatch, gridSnap, objectSnap,snapMode, orthoMode]);
};

export default useDrawEllipse;

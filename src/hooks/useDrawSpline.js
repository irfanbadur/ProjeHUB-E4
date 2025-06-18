import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import {
    setCommandMessage,
    resetOperation
} from '../redux/operationSlice';
import { getSnapPointsFromScene } from '../utils/getSnapPointsFromScene';
import { getSnappedPoint } from '../utils/getSnappedPoint';
import { createSnapMarker } from '../utils/createSnapMarker';
import { generateUniqueId } from '../utils/generateUniqueId';

const useDrawSpline = (scene, camera, renderer,snapPoints) => {
    const pointsRef = useRef([]);
    const curveObjectRef = useRef(null);
    const snapMarkerRef = useRef(null);
    const dispatch = useDispatch();

    const { commandType } = useSelector(state => state.operation);
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

    useEffect(() => {
        if (commandType !== 'drawSpline' || !scene || !camera || !renderer) return;

        const domElement = renderer.domElement;
        dispatch(setCommandMessage("Spline için noktaları seçin. Bitirmek için Enter, iptal için ESC."));

        const handleClick = (e) => {
            const rect = domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            const mouseNDC = new THREE.Vector2(x, y);
            const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

             const { finalPoint } = getSnappedPoint(mouseNDC,worldPoint,snapPoints, camera, renderer,{snapMode:snapMode });
            let point = finalPoint instanceof THREE.Vector3 ? finalPoint : (gridSnap ? applyGridSnap(worldPoint) : worldPoint);

            if (!(point instanceof THREE.Vector3)) {
                console.warn("Geçersiz snap noktası:", point);
                return;
            }

            pointsRef.current.push(point);

            if (pointsRef.current.length < 2) return;

            if (curveObjectRef.current) {
                scene.remove(curveObjectRef.current);
                curveObjectRef.current.geometry.dispose();
                curveObjectRef.current.material.dispose();
                curveObjectRef.current = null;
            }

            const curve = new THREE.CatmullRomCurve3(pointsRef.current);
            const curvePoints = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
            const curveObject = new THREE.Line(geometry, material);
            scene.add(curveObject);
            curveObjectRef.current = curveObject;
        };

        const handleMouseMove = (e) => {
            const rect = domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            const mouseNDC = new THREE.Vector2(x, y);
            const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);

            const { finalPoint, snapped, snapSource } = getSnappedPoint(mouseNDC,worldPoint, snapPoints, camera, renderer, {snapMode:snapMode  });

         //   if (!finalPoint || !(finalPoint instanceof THREE.Vector3)) return;

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

            if (pointsRef.current.length === 0) return;

            const previewPoints = [...pointsRef.current, finalPoint];
            const curve = new THREE.CatmullRomCurve3(previewPoints);
            const curvePoints = curve.getPoints(50);
            const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
            const material = new THREE.LineBasicMaterial({ color: 0xffff00 });

            if (curveObjectRef.current) {
                scene.remove(curveObjectRef.current);
                curveObjectRef.current.geometry.dispose();
                curveObjectRef.current.material.dispose();
            }

            const curveObject = new THREE.Line(geometry, material);
            scene.add(curveObject);
            curveObjectRef.current = curveObject;
        };

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (curveObjectRef.current) {
                    scene.remove(curveObjectRef.current);
                    curveObjectRef.current.geometry.dispose();
                    curveObjectRef.current.material.dispose();
                    curveObjectRef.current = null;
                }
                if (snapMarkerRef.current) {
                    scene.remove(snapMarkerRef.current);
                    snapMarkerRef.current.geometry.dispose();
                    snapMarkerRef.current.material.dispose();
                    snapMarkerRef.current = null;
                }
                pointsRef.current = [];
                dispatch(resetOperation());
                dispatch(setCommandMessage(""));
            } else if (e.key === 'Enter'|| e.key === ' ' && pointsRef.current.length >= 2) {
                const curve = new THREE.CatmullRomCurve3(pointsRef.current);
                const curvePoints = curve.getPoints(50);
                const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
                const material = new THREE.LineBasicMaterial({ color: 0xffffff });
                const curveLine = new THREE.Line(geometry, material);
                curveLine.userData = { 
                    id: generateUniqueId(),
                     isSelectable: true,
                     type:"spline",
                     };
                scene.add(curveLine);

                if (curveObjectRef.current) {
                    scene.remove(curveObjectRef.current);
                    curveObjectRef.current.geometry.dispose();
                    curveObjectRef.current.material.dispose();
                    curveObjectRef.current = null;
                }

                pointsRef.current = [];
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
    }, [commandType, scene, camera, renderer, gridSnap, objectSnap, snapPoints, dispatch,snapMode]); 
     

};

export default useDrawSpline;
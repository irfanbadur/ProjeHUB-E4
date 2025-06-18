import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import { resetOperation, setCommandMessage } from '../../redux/operationSlice';
import { addAction } from '../../redux/operationHistorySlice';
import { setGlobalMachineWireVerticesRef } from '../../utils/sceneAction';
import { getClosestSegment2D } from '../../utils/wiring/getSegmentOfPolyline';
const useDrawWire = (scene, camera, renderer, options = {}) => {
    const {
        enabled = () => true,
        onWireEnd = () => { },
        onWireStart = () => { },
        onPreviewUpdate = () => { },
    } = options;

    const startRef = useRef(false);
    const verticesRef = useRef([]);
    const parallelDirRef = useRef(null);
    const tempLineRef = useRef(null);
    const tempLineStartPointRef = useRef(null);
    const previewEndPointRef = useRef({ x: 0, y: 0 });
    const offsetPreviewRef = useRef(null);
    const lastMouse = useRef({ x: 0, y: 0 });
    const projectedVertexRef = useRef(null);
    const redPolylineRef = useRef(null);
    const isOnWall = useRef(false);
    const activeOffsetPolylineRef = useRef(null);
    const startIndexRef = useRef(null);

    const projectedStartRef = useRef(null); // başlangıç dikme noktasını saklar
    const projectedStartSegmentIndexRef = useRef(null); // hangi segmentten başladığımızı bilir

    const [step, setStep] = useState(0);
    const dispatch = useDispatch();
    const { commandType } = useSelector((state) => state.operation);
    const gridSnap = useSelector((state) => state.mods.gridSnap);
    const orthoMode = useSelector((state) => state.mods.orthoMode);

    const movementOffset = 5;
    const snapState = { x: 0, y: 0 };
    const gridSize = 10;
    const highlightedPolylineRef = useRef(null);

    const applyGridSnap = (point) => {
        return new THREE.Vector3(
            Math.round(point.x / gridSize) * gridSize,
            Math.round(point.y / gridSize) * gridSize,
            0
        );
    };

    const getOrthoSnappedPoint = (startPoint, currentPoint) => {
        const dx = Math.abs(currentPoint.x - startPoint.x);
        const dy = Math.abs(currentPoint.y - startPoint.y);
        return dx > dy
            ? new THREE.Vector3(currentPoint.x, startPoint.y, 0)
            : new THREE.Vector3(startPoint.x, currentPoint.y, 0);
    };

    useEffect(() => {
        setGlobalMachineWireVerticesRef(verticesRef);
    }, []);

    useEffect(() => {

        if (commandType !== 'drawWire' || !scene || !camera || !renderer) return;

        const domElement = renderer.domElement;
        dispatch(setCommandMessage('İlk noktayı seçin'));
        function click(worldPoint) {
            let pointToAdd;
            const finalPoint = gridSnap ? applyGridSnap(worldPoint) : worldPoint;
            pointToAdd = (orthoMode && verticesRef.current.length > 0)
                ? getOrthoSnappedPoint(verticesRef.current.at(-1), finalPoint)
                : finalPoint;

            verticesRef.current.push(pointToAdd);

            if (tempLineRef.current) {
                scene.remove(tempLineRef.current);
                tempLineRef.current.geometry.dispose();
                tempLineRef.current.material.dispose();
            }
            if (previewEndPointRef.current && projectedStartRef.current) {
                verticesRef.current.push(previewEndPointRef.current.clone());
            }
            const geometry = new THREE.BufferGeometry().setFromPoints(verticesRef.current);
            const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
            tempLineRef.current = new THREE.Line(geometry, material);
            scene.add(tempLineRef.current);

            previewEndPointRef.current = pointToAdd;
            setStep(1);
            dispatch(setCommandMessage('Sonraki noktaları seçin. Bitirmek için Enter, iptal için ESC.'));

        }
        const handleClick = (event) => {
            if (!enabled()) return;
            const rect = domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            lastMouse.current = { x, y };


            // Normal davranış
            const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
            let point
            if (isOnWall.current) {
                point = worldPoint
            } else {
                point = previewEndPointRef.current

            }
            click(point)
        };


        const createOffsetPolylinePreview = (polyline, offsetDistance = -5, scene, previewRef) => {
            if (!polyline || !polyline.geometry) return;

            const posAttr = polyline.geometry.attributes.position;
            const count = posAttr.count;

            // En az 3 nokta gereklidir
            if (count < 3) return;

            const points = [];
            for (let i = 0; i < count; i++) {
                points.push(new THREE.Vector3().fromBufferAttribute(posAttr, i));
            }

            // Polyline kapalı mı?
            const isClosed = points[0].distanceTo(points[count - 1]) < 0.001;
            if (!isClosed) return;

            const offsetPoints = [];

            for (let i = 0; i < count - 1; i++) {
                const prev = points[(i - 1 + count - 1) % (count - 1)];
                const curr = points[i];
                const next = points[(i + 1) % (count - 1)];

                // Segment yönlerini al
                const dirPrev = new THREE.Vector3().subVectors(curr, prev).normalize();
                const dirNext = new THREE.Vector3().subVectors(next, curr).normalize();

                // Normalleri hesapla (saat yönüne göre dışa doğru)
                const normalPrev = new THREE.Vector3(-dirPrev.y, dirPrev.x, 0);
                const normalNext = new THREE.Vector3(-dirNext.y, dirNext.x, 0);

                // Ortalama normal (dışa doğru)
                const avgNormal = new THREE.Vector3()
                    .addVectors(normalPrev, normalNext)
                    .normalize()
                    .multiplyScalar(offsetDistance);

                // Offset nokta
                const offsetPoint = curr.clone().add(avgNormal);
                offsetPoints.push(offsetPoint);
            }

            // 🔄 Kapat
            offsetPoints.push(offsetPoints[0].clone());

            // Eski varsa kaldır
            if (previewRef.current) {
                scene.remove(previewRef.current);
                previewRef.current.geometry.dispose();
                previewRef.current.material.dispose();
            }

            // Geçici offset çizgiyi oluştur
            const geometry = new THREE.BufferGeometry().setFromPoints(offsetPoints);
            const material = new THREE.LineDashedMaterial({
                color: 0x00ffff,
                dashSize: 4,
                gapSize: 2,
            });

            const previewLine = new THREE.LineLoop(geometry, material);
            previewLine.computeLineDistances();
            previewLine.userData.isPreviewOffset = true;
            scene.add(previewLine);
            previewRef.current = previewLine;
            return previewLine
        };


  
        const handleMouseMove = (event) => {
          if (!enabled()) return;
        
          const rect = domElement.getBoundingClientRect();
          const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
          const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
          lastMouse.current = { x, y };
        
          const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
          let previewPoint = gridSnap ? applyGridSnap(worldPoint) : worldPoint;
        
          if (orthoMode && verticesRef.current.length > 0) {
            previewPoint = getOrthoSnappedPoint(verticesRef.current.at(-1), previewPoint);
          }
        
          previewEndPointRef.current = previewPoint;
        
          // 🔍 En yakın polyline (ilk segment için)
          let closestPolyline = null;
          let minDistance = Infinity;
          let bestSegment = null;
        
          scene.traverse((child) => {
            if (child.userData?.type === 'polyline') {
              const pos = child.geometry.attributes.position;
              if (pos.count < 2) return;
        
              const first = new THREE.Vector3().fromBufferAttribute(pos, 0);
              const last = new THREE.Vector3().fromBufferAttribute(pos, pos.count - 1);
              if (first.distanceTo(last) > 0.001) return;
        
              for (let i = 0; i < pos.count - 1; i++) {
                const a = new THREE.Vector3().fromBufferAttribute(pos, i);
                const b = new THREE.Vector3().fromBufferAttribute(pos, i + 1);
                const seg = new THREE.Line3(a, b);
                const proj = seg.closestPointToPoint(worldPoint, true, new THREE.Vector3());
                const dist = proj.distanceTo(worldPoint);
        
                if (dist < minDistance) {
                  minDistance = dist;
                  closestPolyline = child;
                  bestSegment = seg;
                  startIndexRef.current=i
                }
              }
            }
          });
        
          // Başlangıçta offset çizgisini oluştur
          if (minDistance < 50 && closestPolyline && step === 0 && verticesRef.current.length === 1) {
            highlightedPolylineRef.current = closestPolyline;
            isOnWall.current = true;
            closestPolyline.material.color.set(0xffff00);
          
            // ✅ OffsetPolyline oluştur ve sakla
            const offsetPolyline = createOffsetPolylinePreview(
              closestPolyline,
              -5,
              scene,
              offsetPreviewRef
            );
            activeOffsetPolylineRef.current = offsetPolyline;
          console.log("activeOffsetPolylineRef.current",activeOffsetPolylineRef.current)
            // ✅ OffsetPolyline üzerinden en yakın noktayı al
            const offsetAttr = offsetPolyline.geometry.attributes.position;
            let offsetVerts = [];
            for (let i = 0; i < offsetAttr.count; i++) {
              offsetVerts.push(offsetAttr.getX(i), offsetAttr.getY(i));
            }
          
            const result = getClosestSegment2D(offsetVerts, worldPoint);
            if (!result) return;
          
            const offsetPoint = new THREE.Vector3(result.projection.x, result.projection.y, 0);
          
            tempLineStartPointRef.current = offsetPoint;
            projectedVertexRef.current = offsetPoint;
            verticesRef.current.push(offsetPoint);
            setStep(1);
          }
          
        
          // 🔴 Offset polyline üzerinde segment yakalama ve wire ön izlemesi
          if (activeOffsetPolylineRef.current) {
            const posAttr = activeOffsetPolylineRef.current.geometry.attributes.position;
            const flatVerts = [];
        
            for (let i = 0; i < posAttr.count; i++) {
              flatVerts.push(posAttr.getX(i), posAttr.getY(i));
            }
        
            const result = getClosestSegment2D(flatVerts, worldPoint);
            // result.index kadar segmenti atla → her segment 2 koordinat içerir: x, y
            const trimmedFlatVerts = flatVerts.slice(result.index * 2);
         //   console.log("flatVerts",flatVerts.length,trimmedFlatVerts.length)
       //     console.log("result",result)
            if (result) {
         /*      drawRedPolylineUpToProjection(
                trimmedFlatVerts,
                (flatVerts.length-trimmedFlatVerts.length-4)-result.index,
                result.projection,
                scene,
                redPolylineRef, 
                0xff0000
              ); */

              if( projectedStartSegmentIndexRef.current != result.index){
                console.log("DEĞİŞİK : ",previewEndPointRef.current,result.index)
                console.log("verticesRef.current : ",verticesRef.current)
                console.log("offsetPoint   : ", projectedVertexRef.current)
                click({x:result.p1.x, y:result.p1.y, z:0})
              }
              if(projectedStartSegmentIndexRef.current> result.index){
                verticesRef.current = verticesRef.current.slice(0, result.index);
              }
              previewEndPointRef.current = new THREE.Vector3(result.projection.x, result.projection.y, 0);
              projectedStartSegmentIndexRef.current = result.index;
            //  click(previewEndPointRef.current)
              // wire preview çizimi
              const previewPoints = [...verticesRef.current, previewEndPointRef.current];
              if (tempLineRef.current) {
                scene.remove(tempLineRef.current);
                tempLineRef.current.geometry.dispose();
                tempLineRef.current.material.dispose();
              }
        
              const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
              const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
              tempLineRef.current = new THREE.Line(geometry, material);
              scene.add(tempLineRef.current);
            }
          }
        
          // ❌ Uzaklaşınca sıfırla
          if (minDistance >= 50 && isOnWall.current) {
            isOnWall.current = false;
        
            if (highlightedPolylineRef.current) {
              highlightedPolylineRef.current.material.color.set(
                highlightedPolylineRef.current.userData.originalColor || 0xffffff
              );
              highlightedPolylineRef.current = null;
            }
        
            if (offsetPreviewRef.current) {
              scene.remove(offsetPreviewRef.current);
              offsetPreviewRef.current.geometry.dispose();
              offsetPreviewRef.current.material.dispose();
              offsetPreviewRef.current = null;
            }
        
            if (redPolylineRef.current) {
              scene.remove(redPolylineRef.current);
              redPolylineRef.current.geometry.dispose();
              redPolylineRef.current.material.dispose();
              redPolylineRef.current = null;
            }
        
            if (projectedVertexRef.current) {
              verticesRef.current.pop();
              projectedVertexRef.current = null;
            }
        
            projectedStartRef.current = null;
            projectedStartSegmentIndexRef.current = null;
            activeOffsetPolylineRef.current = null;
          }
        };
        
  
        
        function drawRedPolylineUpToProjection(vertices, upToIndex, projectionPoint, scene, ref,  color = 0xff0000) {
            if (ref.current) {
                scene.remove(ref.current);
                ref.current.geometry.dispose();
                ref.current.material.dispose();
                ref.current = null;
            }

            const points = [];

            // 🔴 Tam segmentleri ekle
            for (let i = 0; i < upToIndex; i++) {
                const x1 = vertices[i * 2];
                const y1 = vertices[i * 2 + 1];
                const x2 = vertices[(i + 1) * 2];
                const y2 = vertices[(i + 1) * 2 + 1];

                points.push(new THREE.Vector3(x1, y1, 0));
                points.push(new THREE.Vector3(x2, y2, 0));
            } 

            // 🔴 Son aktif segment: baştan projeksiyon noktasına kadar
            if (upToIndex >= 0 && projectionPoint) {
                const x = vertices[upToIndex * 2];
                const y = vertices[upToIndex * 2 + 1];

                points.push(new THREE.Vector3(x, y, 0));                    // segment başlangıcı
                points.push(new THREE.Vector3(projectionPoint.x, projectionPoint.y, 0)); // mouse hizasına kadar
            }

            // Oluşturulacak çizgi en az 2 nokta içermeli
            if (points.length >= 2) {
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color });
                const line = new THREE.LineSegments(geometry, material);
                scene.add(line);
                ref.current = line;
            }
        }



        const handleKeyDown = (e) => {
            if (!enabled()) return;

            const previousPos = verticesRef.current.at(-1);
            if (!previousPos) return;

            let newPos = previousPos.clone();

            if (e.key === 'a') newPos.x -= movementOffset;
            if (e.key === 'd') newPos.x += movementOffset;
            if (e.key === 'w') newPos.y += movementOffset;
            if (e.key === 's') newPos.y -= movementOffset;
            if (e.key === 'q') {
                const dir = new THREE.Vector3().subVectors(previewEndPointRef.current, previousPos).normalize();
                newPos.add(dir.multiplyScalar(movementOffset));
            }
            if (e.key === 'e') {
                const dx = movementOffset / Math.sqrt(2);
                const dy = dx;
                const delta = new THREE.Vector3(
                    lastMouse.current.x - previousPos.x,
                    lastMouse.current.y - previousPos.y,
                    0
                );
                newPos.add(new THREE.Vector3(Math.sign(delta.x) * dx, Math.sign(delta.y) * dy, 0));
            }

            if (['a', 'd', 'w', 's', 'q', 'e'].includes(e.key)) {
                verticesRef.current.push(newPos);
                if (tempLineRef.current) {
                    scene.remove(tempLineRef.current);
                    tempLineRef.current.geometry.dispose();
                    tempLineRef.current.material.dispose();
                }
                const geometry = new THREE.BufferGeometry().setFromPoints(verticesRef.current);
                const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
                tempLineRef.current = new THREE.Line(geometry, material);
                scene.add(tempLineRef.current);
            }

            if (e.key === 'Escape') {
                if (tempLineRef.current) {
                    scene.remove(tempLineRef.current);
                    tempLineRef.current.geometry.dispose();
                    tempLineRef.current.material.dispose();
                }
                verticesRef.current = [];
                dispatch(resetOperation());
                dispatch(setCommandMessage(''));
                startRef.current = false;
                setStep(0);
                if (tempLineRef.current) {
                    scene.remove(tempLineRef.current);
                    tempLineRef.current.geometry.dispose();
                    tempLineRef.current.material.dispose();
                }
            }

            if (e.key === 'Enter') {
                if (verticesRef.current.length > 1) {
                    const id = THREE.MathUtils.generateUUID();
                    const color = 0x0045ff;
                    dispatch(addAction({
                        type: 'create',
                        objectUUID: id,
                        after: {
                            uuid: id,
                            type: 'polyline',
                            points: verticesRef.current.map((p) => ({ x: p.x, y: p.y, z: p.z })),
                            materialColor: color,
                        },
                    }));
                    onWireEnd(verticesRef.current);
                }
                if (tempLineRef.current) {
                    scene.remove(tempLineRef.current);
                    tempLineRef.current.geometry.dispose();
                    tempLineRef.current.material.dispose();
                }
                verticesRef.current = [];
                dispatch(resetOperation());
                dispatch(setCommandMessage(''));
                startRef.current = false;
                setStep(0);
                if (tempLineRef.current) {
                    scene.remove(tempLineRef.current);
                    tempLineRef.current.geometry.dispose();
                    tempLineRef.current.material.dispose();
                }
            }
        };

        domElement.addEventListener('click', handleClick);
        domElement.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keyup', handleKeyDown);

        return () => {
            domElement.removeEventListener('click', handleClick);
            domElement.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('keyup', handleKeyDown);
        };
    }, [commandType, scene, camera, renderer, gridSnap, orthoMode, dispatch]);
};

export default useDrawWire;
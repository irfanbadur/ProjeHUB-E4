import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useDispatch, useSelector } from 'react-redux';
import { resetOperation, setCommandMessage } from '../../redux/operationSlice';
import Offset from 'polygon-offset';
import ClipperLib from 'clipper-lib';
import { generateUniqueId } from '../../utils/generateUniqueId';
//import { addAction, undoAction, redoAction } from '../../redux/operationHistorySlice';
import { useStore } from 'react-redux'; // 💡 Eklemeyi unutma
import { redo } from '../../utils/undoRedo';
import { click } from '@testing-library/user-event/dist/click';
//import { setGlobaVerticesRef, setGlobalTempLineRef } from '../../utils/sceneAction';

export default function useWiring(scene, camera, renderer, snapPoints, options = {}) {
    const {
      enabled = () => true,
      commandType: expectedCommandType = null, // ✅ opsiyonel
      onPolylineComplete = () => {},
      onWireStart = () => {},
      onPreviewUpdate = () => {},
    } = options;

    const dispatch = useDispatch();
    const verticesRef = useRef([]);
    const tempLineRef = useRef(null);
    const previewEndPointRef = useRef(null);
    const snapMarkerRef = useRef(null);
    const lastMouse = useRef({ x: 0, y: 0 });
    const snapState = useRef({ x: 0, y: 0 });
    const startIndexRef = useRef(null);
    const highlightedPolylineRef = useRef(null);
    const offsetPreviewRef = useRef(null);
    const activeOffsetPolylineRef = useRef(null);
    const tempLineStartPointRef = useRef(null);
    const projectedVertexRef = useRef(null);
    const isOnWallRef = useRef(null);
    const redPolylineRef = useRef(null);
    const projectedStartRef = useRef(null);
    const projectedStartSegmentIndexRef = useRef(null);
    const sourceOffsetedPolylineRef = useRef(null);
    const lastOffsetIndexRef = useRef(null);
    const directionRef = useRef(null);
    const store = useStore();

    const [currentUUID, setCurrentUUID] = useState(generateUniqueId());
    const [step, setStep] = useState(0);

    const commandType = useSelector(state => state.operation.commandType);
    const gridSnap = useSelector((state) => state.mods.gridSnap);
    const orthoMode = useSelector((state) => state.mods.orthoMode);
    const snapMode = useSelector((state) => state.mods.snapMode);
    const gridSize = 10;

/*     const pastLength = useSelector(state => state.operationHistory.past.length);
    const present = useSelector((state) => state.operationHistory.present);
 */ 
    const applyGridSnap = (point) => {
        return new THREE.Vector3(
            Math.round(point.x / gridSize) * gridSize,
            Math.round(point.y / gridSize) * gridSize,
            0
        );
    };

    const getOrthoSnappedPoint = (start, current) => {
        const dx = Math.abs(current.x - start.x);
        const dy = Math.abs(current.y - start.y);
        return dx > dy
            ? new THREE.Vector3(current.x, start.y, 0)
            : new THREE.Vector3(start.x, current.y, 0);
    };
    function isClockwise(points) {
        let sum = 0;
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
            sum += (p2.x - p1.x) * (p2.y + p1.y);
        }
        return sum > 0;
    }

    const createOffsetPolylinePreview = (polyline, offsetDistance = -5) => {
        if (!polyline || !polyline.geometry) return;
      
        if (activeOffsetPolylineRef.current) {
          scene.remove(activeOffsetPolylineRef.current);
          activeOffsetPolylineRef.current.geometry.dispose();
          activeOffsetPolylineRef.current.material.dispose();
          activeOffsetPolylineRef.current = null;
        }
      
        const posAttr = polyline.geometry.attributes.position;
        const points = [];
        for (let i = 0; i < posAttr.count; i++) {
          const p = new THREE.Vector3().fromBufferAttribute(posAttr, i);
          points.push(new THREE.Vector3(p.x, p.y, 0));
        }
      
        if (points.length < 3) return;
      
        // Clipper ile kapalı kabul edilecek, son noktayı tekrar eklemeye gerek yok
        const isClosed = true;
      
        const clockwise = isClockwise(points);
        const scale = 1000;
        const inputPath = points.map(p => ({ X: p.x * scale, Y: p.y * scale }));
      
        const co = new ClipperLib.ClipperOffset();
        co.AddPath(inputPath, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
      
        // ✅ İçeri offset: saat yönünde ise +, ters ise -
        const signedOffset = clockwise ? Math.abs(offsetDistance) : -Math.abs(offsetDistance);
      
        const result = new ClipperLib.Paths();
        co.Execute(result, signedOffset * scale);
      
        if (result.length === 0) return;
      
        const offsetPoints = result[0].map(p => new THREE.Vector3(p.X / scale, p.Y / scale, 0));
        offsetPoints.push(offsetPoints[0].clone()); // Kapalı hale getir
      
        const geometry = new THREE.BufferGeometry().setFromPoints(offsetPoints);
        const material = new THREE.LineDashedMaterial({
          color: 0xff00ff,
          dashSize: 4,
          gapSize: 2,
        });
      
        const line = new THREE.LineLoop(geometry, material);
        line.computeLineDistances();
        line.userData.type = 'offsetPreview';
        line.userData.id = generateUniqueId('offset');
        line.userData.snapVertices = offsetPoints.map(p => p.clone());
      
        scene.add(line);
        activeOffsetPolylineRef.current = line;
      };
      

    const rebuildTempLine = () => {

        if (tempLineRef.current) {
            scene.remove(tempLineRef.current);
            tempLineRef.current.geometry.dispose();
            tempLineRef.current.material.dispose();
            tempLineRef.current = null;
        }

        if (verticesRef.current.length === 0) return;

        const geometry = new THREE.BufferGeometry().setFromPoints(verticesRef.current);
        const material = new THREE.LineBasicMaterial({ color: 0xffff00 });
        tempLineRef.current = new THREE.Line(geometry, material);
        tempLineRef.current.name = "wirePolyline"
        tempLineRef.current.userData.id = generateUniqueId('polyline')
        scene.add(tempLineRef.current);

    };


    function click(worldPoint) {
        const finalPoint = gridSnap ? applyGridSnap(worldPoint) : worldPoint;
        const pointToAdd = orthoMode && verticesRef.current.length > 0
            ? getOrthoSnappedPoint(verticesRef.current.at(-1), finalPoint)
            : finalPoint;


        verticesRef.current.push(pointToAdd);
        previewEndPointRef.current = pointToAdd;
        setStep(1);
    //    dispatch(setCommandMessage('Sonraki noktaları seçin. Bitirmek için Enter, iptal için ESC.'));
        const beforePoints = [...verticesRef.current.map(p => ({ x: p.x, y: p.y, z: p.z }))];
        verticesRef.current.push(pointToAdd);
        const afterPoints = [...verticesRef.current.map(p => ({ x: p.x, y: p.y, z: p.z }))];
 

        rebuildTempLine();
    }
 
    useEffect(() => {
      //  if (commandType !== 'createWire' || !scene || !camera || !renderer) return;
      if (!enabled() || !scene || !camera || !renderer) return;
      if (expectedCommandType && commandType !== expectedCommandType) return; // ✅ esnek komut kontrolü
  
       

        const domElement = renderer.domElement;
      //  dispatch(setCommandMessage("FIND ROOM: İlk noktayı seçin"));
        const updatePreviewLine = (endPoint) => {

            if (verticesRef.current.length > 0) {
                const previewPoints = [...verticesRef.current, endPoint];
                const geometry = new THREE.BufferGeometry().setFromPoints(previewPoints);
                const material = new THREE.LineBasicMaterial({ color: 0xffff00 });

                if (tempLineRef.current) {
                    scene.remove(tempLineRef.current);
                    tempLineRef.current.geometry.dispose();
                    tempLineRef.current.material.dispose();
                }

                tempLineRef.current = new THREE.Line(geometry, material);
                tempLineRef.current.name = "wirePolyline"
                tempLineRef.current.userData.id = generateUniqueId('polyline')
                scene.add(tempLineRef.current);
                if (options.onPreviewUpdate) {
                    options.onPreviewUpdate(verticesRef.current);
                }
            }
        };
        function isPointOnVertex(worldPoint, polyline, tolerance = 0.5) {
            const posAttr = polyline.geometry.attributes.position;
            console.log("WORLD POİNT :", worldPoint, posAttr)

            for (let i = 0; i < posAttr.count; i++) {
                const vertex = new THREE.Vector3().fromBufferAttribute(posAttr, i);
                if (vertex.distanceTo(worldPoint) < tolerance) {
                    return true; // worldPoint bir köşe
                }
            }
            return false; // worldPoint köşe değil
        }

        const handleClick = (event) => {
            if (!enabled()) return;

            const rect = domElement.getBoundingClientRect();
            const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            lastMouse.current = { x, y };

            const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);
            let point;
            // ✅ SnapMarker varsa onun koordinatını kullan
            if (snapMarkerRef.current && snapMarkerRef.current.length > 0) {
                const snapVertices = activeOffsetPolylineRef.current?.userData?.snapVertices;
                const snapPos = snapMarkerRef.current[0].position.clone();
                snapPos.z = 0;
                if (Array.isArray(snapVertices)) {
                    const currentIndex = snapVertices.findIndex(v => v.distanceTo(snapPos) < 0.1);
                    const lastIndex = lastOffsetIndexRef.current;

                    if (lastOffsetIndexRef.current === null) {
                        // İlk tıklama → sadece indexi kaydetme, doğrudan ilk noktayı çiz
                        sourceOffsetedPolylineRef.current = offsetPreviewRef.current;
                        lastOffsetIndexRef.current = currentIndex;
                        click(snapPos.clone()); // ✅ İlk noktayı da ekle
                    }
                    else {

                        if (!isPointOnVertex(snapPos, sourceOffsetedPolylineRef.current)) {
                            console.log("NOKTA POLYLİNE  içinde DEĞİL")
                            click(snapPos)
                        } else {
                            console.log("NOKTA POLYLİNE  içinde ")

                            const delta = currentIndex - lastIndex;
                            // Yönü ilk defa belirle
                            if (directionRef.current === null && delta !== 0) {
                                directionRef.current = Math.sign(delta); // 1 (ileri) veya -1 (geri)
                            }

                            const dir = Math.sign(delta);
                            let vertices = snapVertices.slice(lastIndex, currentIndex)
                            if (directionRef.current === -1) {
                                if (lastIndex > currentIndex) {
                                    vertices = snapVertices.slice(currentIndex, lastIndex)
                                    vertices.reverse();
                                    vertices.forEach((vertex) => {
                                        if (vertex) {
                                            click(vertex.clone());
                                        }
                                    })
                                } else {
                                    vertices = snapVertices.slice(0, lastIndex)
                                    vertices.reverse();
                                    vertices = vertices.concat(snapVertices.slice(currentIndex, snapVertices.length).reverse())
                                    vertices.forEach((vertex) => {
                                        if (vertex) {
                                            click(vertex.clone());
                                        }

                                    })

                                }

                            } else if (directionRef.current === 1) {
                                if (lastIndex < currentIndex) {
                                    vertices = snapVertices.slice(lastIndex, currentIndex)
                                    vertices.forEach((vertex) => {
                                        if (vertex) {
                                            click(vertex.clone());
                                        }
                                    })
                                } else {
                                    vertices = snapVertices.slice(lastIndex, snapVertices.length)
                                        .concat(snapVertices.slice(0, currentIndex))
                                    vertices.forEach((vertex) => {
                                        if (vertex) {
                                            click(vertex.clone());
                                        }
                                    })
                                }

                            }
                            lastOffsetIndexRef.current = currentIndex;
                        }
                    }

                    point = snapMarkerRef.current[0].position.clone();
                }
            } else if (isOnWallRef.current) {
                point = worldPoint;
            } else {
                point = previewEndPointRef.current;
            }

            click(point);
        };



        const handleMouseMove = (e) => {
            if (!enabled()) return;

            const rect = domElement.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            lastMouse.current = { x, y };
            const mouseNDC = new THREE.Vector2(x, y);
            const worldPoint = new THREE.Vector3(x, y, 0).unproject(camera);


            let finalPoint = worldPoint;
            if (orthoMode && verticesRef.current.length > 0) {
                finalPoint = getOrthoSnappedPoint(verticesRef.current.at(-1), worldPoint);
            }


            let closestPolyline = null;
            let minDistance = Infinity;
            let bestSegment = null;

            scene.traverse((child) => {
                if (child.userData?.type === 'polyline') {
                    const pos = child.geometry.attributes.position;
                    if (pos.count < 2) return;

                    const first = new THREE.Vector3().fromBufferAttribute(pos, 0);
                    const last = new THREE.Vector3().fromBufferAttribute(pos, pos.count - 1);
                    //  if (first.distanceTo(last) > 0.001) return;

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
                            startIndexRef.current = i
                        }
                    }
                }
            });

            if (minDistance < 50 && closestPolyline) {

                highlightedPolylineRef.current = closestPolyline;
                isOnWallRef.current = true;
                closestPolyline.material.color.set(0xffff00);

                // ✅ OffsetPolyline oluştur ve sakla
                const offsetPolyline = createOffsetPolylinePreview(
                    closestPolyline,
                    5,
                    scene,
                    offsetPreviewRef
                );
                if (!offsetPolyline) return; // ❗ Eğer oluşturulamadıysa devam etme

                activeOffsetPolylineRef.current = offsetPolyline;
                // ✅ OffsetPolyline üzerinden en yakın noktayı al
                const offsetAttr = offsetPolyline.geometry.attributes.position;
                let offsetVerts = [];
                for (let i = 0; i < offsetAttr.count; i++) {
                    offsetVerts.push(offsetAttr.getX(i), offsetAttr.getY(i));
                }

            }
            // ❌ Uzaklaşınca sıfırla
            if (minDistance >= 50 && isOnWallRef.current) {
                isOnWallRef.current = false;

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
            //--------------------------------------------
            previewEndPointRef.current = finalPoint;
            if (
                activeOffsetPolylineRef.current &&
                activeOffsetPolylineRef.current.userData?.snapVertices
            ) {
                updateSnapMarkers(
                    scene,
                    activeOffsetPolylineRef.current.userData.snapVertices,
                    finalPoint,
                    snapMarkerRef,
                    20 // yakınlık eşiği
                );
            }

            updatePreviewLine(finalPoint);

            if (options.onPreviewUpdate && verticesRef.current.length > 0) {
                const previewPoints = [...verticesRef.current, finalPoint];
                options.onPreviewUpdate(previewPoints); // ✅ Kareyi uca getir
            }

        };
        const createSquareMarker = (point, size = 4, color = 0xff00ff) => {
            const geometry = new THREE.PlaneGeometry(size, size);
            const material = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide });
            const marker = new THREE.Mesh(geometry, material);
            marker.position.copy(point);
            marker.position.z += 0.1;
            marker.rotation.z = Math.PI / 4; // Kare gibi görünmesi için
            return marker;
        };

        const updateSnapMarkers = (scene, snapVertices, mousePoint, snapMarkerRef, threshold = 20) => {
            // Önceki marker'ları temizle
            if (snapMarkerRef.current) {
                snapMarkerRef.current.forEach(marker => {
                    scene.remove(marker);
                    marker.geometry.dispose();
                    marker.material.dispose();
                });
            }

            snapMarkerRef.current = [];

            let minDist = Infinity;
            let closestVertex = null;

            // En yakın vertex'i bul
            snapVertices.forEach((v) => {
                const dist = v.distanceTo(mousePoint);
                if (dist < threshold && dist < minDist) {
                    minDist = dist;
                    closestVertex = v;
                }
            });

            // Eğer yakın bir vertex varsa, marker oluştur
            if (closestVertex) {
                const marker = createSquareMarker(closestVertex);
                scene.add(marker);
                snapMarkerRef.current.push(marker);
            }
        };

        const handleKeyDown = (e) => {
            const offset = 5;
            const last = verticesRef.current.at(-1);
            const snapPos =
                snapMarkerRef.current && snapMarkerRef.current.length > 0
                    ? snapMarkerRef.current[0].position.clone()
                    : previewEndPointRef.current?.clone();

            if (!last || !snapPos) return;

            let newPos = last.clone();
            let changed = false;

/*             if (e.ctrlKey && e.key === 'z') {
                dispatch(undoAction());
                return;
            }
            if (e.ctrlKey && e.key === 'y') {
                dispatch(redoAction());

                return;
            }
 */






            if (e.key === 'a' && snapPos.x <= last.x) {
                snapState.current.y = 0;
                if (snapState.current.x === 0) {
                    newPos.x = snapPos.x + offset;
                    snapState.current.x = 1;
                } else if (snapState.current.x === 1) {
                    newPos.x = snapPos.x;
                    snapState.current.x = 2;
                } else {
                    newPos.x = snapPos.x - offset;
                    snapState.current.x = 0;
                }
                changed = true;
            } else if (e.key === 'd' && snapPos.x >= last.x) {
                snapState.current.y = 0;
                if (snapState.current.x === 0) {
                    newPos.x = snapPos.x - offset;
                    snapState.current.x = 1;
                } else if (snapState.current.x === 1) {
                    newPos.x = snapPos.x;
                    snapState.current.x = 2;
                } else {
                    newPos.x = snapPos.x + offset;
                    snapState.current.x = 0;
                }
                changed = true;
            } else if (e.key === 'w' && snapPos.y >= last.y) {
                snapState.current.x = 0;
                if (snapState.current.y === 0) {
                    newPos.y = snapPos.y - offset;
                    snapState.current.y = 1;
                } else if (snapState.current.y === 1) {
                    newPos.y = snapPos.y;
                    snapState.current.y = 2;
                } else {
                    newPos.y = snapPos.y + offset;
                    snapState.current.y = 0;
                }
                changed = true;
            } else if (e.key === 's' && snapPos.y <= last.y) {
                snapState.current.x = 0;
                if (snapState.current.y === 0) {
                    newPos.y = snapPos.y + offset;
                    snapState.current.y = 1;
                } else if (snapState.current.y === 1) {
                    newPos.y = snapPos.y;
                    snapState.current.y = 2;
                } else {
                    newPos.y = snapPos.y - offset;
                    snapState.current.y = 0;
                }
                changed = true;
            }
            if (e.key === 'q') {
                const previousPos = verticesRef.current.at(-1);
                if (!previousPos || !previewEndPointRef.current) return;

                const direction = new THREE.Vector3().subVectors(previewEndPointRef.current, previousPos).normalize();
                const offset = direction.multiplyScalar(5); // 5 birimlik uzama

                const newPos = previousPos.clone().add(offset);
                verticesRef.current.push(newPos);
                setStep(prev => prev + 1);
                rebuildTempLine();
                return;
            }
            if (e.key === 'e') {
                const previousPos = verticesRef.current.at(-1);
                if (!previousPos || !previewEndPointRef.current) return;

                const delta = new THREE.Vector3().subVectors(previewEndPointRef.current, previousPos);
                const offsetLength = 7.07106781187; // 5√2 ≈ 7.07
                const dx = offsetLength / Math.sqrt(2); // ≈ 3.5355
                const dy = dx;

                let offset = new THREE.Vector3();
                if (delta.x >= 0 && delta.y >= 0) {
                    offset.set(dx, dy, 0); // sağ üst
                } else if (delta.x < 0 && delta.y >= 0) {
                    offset.set(-dx, dy, 0); // sol üst
                } else if (delta.x < 0 && delta.y < 0) {
                    offset.set(-dx, -dy, 0); // sol alt
                } else {
                    offset.set(dx, -dy, 0); // sağ alt
                }

                const newPos = previousPos.clone().add(offset);
                verticesRef.current.push(newPos);
                setStep(prev => prev + 1);
                rebuildTempLine();
                return;
            }

            if (changed && !newPos.equals(last)) {
                verticesRef.current.push(newPos);
                setStep(prev => prev + 1);
                updatePreviewLine(newPos);
            }

            if (e.key === 'Enter' || e.key === ' ') {
                const geometry = new THREE.BufferGeometry().setFromPoints(verticesRef.current);
                const material = new THREE.LineBasicMaterial({ color: 0x00ff00 });
                const polyline = new THREE.Line(geometry, material);
                polyline.name = 'wirePolyline';
                polyline.userData.type = 'polyline';
                polyline.userData.originalColor = 0x00ff00;
                polyline.userData.id = generateUniqueId('polyline')

                scene.add(polyline);
                highlightedPolylineRef.current = null;
                activeOffsetPolylineRef.current = null;
                offsetPreviewRef.current = null;

                onPolylineComplete(verticesRef.current);
                cleanup();
            } else if (e.key === 'Escape') {
                cleanup();
            }
        };

        const cleanup = () => {
            if (activeOffsetPolylineRef.current) {
                scene.remove(activeOffsetPolylineRef.current);
                activeOffsetPolylineRef.current.geometry.dispose();
                activeOffsetPolylineRef.current.material.dispose();
                activeOffsetPolylineRef.current = null;
            }
            if (offsetPreviewRef.current) {
                scene.remove(offsetPreviewRef.current);
                offsetPreviewRef.current.geometry.dispose();
                offsetPreviewRef.current.material.dispose();
                offsetPreviewRef.current = null;
            }

            if (tempLineRef.current) {
                scene.remove(tempLineRef.current);
                tempLineRef.current.geometry.dispose();
                tempLineRef.current.material.dispose();
                tempLineRef.current = null;
            }
            if (snapMarkerRef.current) {
                snapMarkerRef.current.forEach(marker => {
                    scene.remove(marker);
                    marker.geometry.dispose();
                    marker.material.dispose();
                });
                snapMarkerRef.current = null;
            }
            verticesRef.current = [];
            lastOffsetIndexRef.current = null;
            directionRef.current = null;

         //   dispatch(resetOperation());
        //    dispatch(setCommandMessage(""));
            setStep(0);
            if (tempLineRef.current) {
                scene.remove(tempLineRef.current);
                tempLineRef.current.geometry.dispose();
                tempLineRef.current.material.dispose();
                tempLineRef.current = null;
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
    }, [commandType, scene, camera, renderer, snapPoints, enabled]);
    return {
  startWiring: () => {
    verticesRef.current = [];
    lastOffsetIndexRef.current = null;
    directionRef.current = null;
    tempLineRef.current && scene.remove(tempLineRef.current);
    tempLineRef.current = null;
  },        stopWiring: () => { },
        isDrawing: () => verticesRef.current.length > 0,
        wireDataRef: verticesRef, // ya da daha anlamlı bir veri yapısı
        tempLineRef,
        handleMouseMove: (event) => {
            // dışarıdan mouseMove tetiklenirse offset rehber çizgiler oluşur
            if (!enabled()) return;
            // buraya orijinal mouseMove içeriğini koyabilirsin (veya dışarı çıkarıp çağırabilirsin)
          }
    };
};

 
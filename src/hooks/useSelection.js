// src/hooks/useSelection.js

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useSelector, useDispatch } from 'react-redux';
import {
  addSelectedObjectID,
  clearSelection,
} from '../redux/selectionSlice';
import { useSelectedObjectRef } from './useSelectedObjectRef';

export function useSelection(scene, camera, renderer,
  ignoreSelectionRef = { current: false }
) {
  const dispatch = useDispatch();
  const selectedObjectIds = useSelector((state) => state.selection.selectedObjectIds);
  const command = useSelector((state) => state.operation);

  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const hoveredObjectRef = useRef(null);
  const hoveredGroupRef = useRef(null);
  const hoveredBranchIDRef = useRef(null);

  // Seçim dikdörtgeni çizimi için referanslar
  const isDrawingRef = useRef(false);
  const startPointRef = useRef(new THREE.Vector3());
  const rectangleMeshRef = useRef(null);

  const clickedObjectColor = "#ff0000"
  const clickedGroupColor = "#ffff00"
  // Seçim dikdörtgeni içindeki nesneler
  const objectsInsideRef = useRef(new Set());

  // Seçim modu ('inside' veya 'overlap')
  const selectionModeRef = useRef('inside');
  const selectedObjectRef = useSelectedObjectRef();
  useEffect(() => {
    if (!renderer || !scene || !scene.children) return;
    const handleMouseDown = (event) => {
      if (ignoreSelectionRef && ignoreSelectionRef.current) return;
      if (event.button !== 0) return; // Sadece sol tıklamayı işle

      if (command.commandType != null && command.commandType.slice(0, 4) === 'draw') {
        return;
      }
      // Mouse koordinatlarını normalize et
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      // Seçim işlemi
      const objects = scene.children.filter(
        (obj) =>
          (obj.isMesh || obj.isLine || obj.isSprite || obj.isGroup) && // Grubu da ekleyin
          obj.userData.isSelectable !== false &&
          obj !== rectangleMeshRef.current
      );

      const intersects = raycaster.current.intersectObjects(objects, true);

      if (intersects.length > 0) {
        
// handleMouseDown içinde, intersects.length > 0 bloğunda
const clickedObject = intersects[0].object;
console.log("TIKLANAN NESNE : ",clickedObject)
// 🔥 wireTitle grubu kontrolü
let current = clickedObject;
while (current) {
  if (current.userData?.type === 'wireTitle') {
    const groupId = current.userData.id;
    if (!selectedObjectIds.includes(groupId)) {
      dispatch(addSelectedObjectID(groupId));
    }

    // Hover rengi
    current.traverse((child) => {
      if (child.material && child.material.color && !child.userData.originalColor) {
        child.userData.originalColor = child.material.color.getHex();
        child.material.color.set(0x00ffff);
      }
    });


    return; // wireTitle bulundu, diğer seçimleri es geç
  }
  current = current.parent;
}
        
        selectedObjectRef.current = clickedObject;
      

// ...handleMouseDown içinde...
if (clickedObject.parent.isGroup) {
  const group = clickedObject.parent;
  console.log("TIKLANAN NESNE  GRUP : ",group)

  dispatch(addSelectedObjectID(group.parent.userData.id));
  hoveredGroupRef.current = group;

  group.children.forEach((child) => {
    // 1) Sadece boyanabilir objelerle ilgilen
    if (!child.isMesh && !child.isLine && !child.isSprite) return;

    // 2) Materyal ve renk var mı diye kontrol et
    const mat = child.material;
    if (!mat) return;

    // (Opsiyonel) Çoklu materyal desteği varsa
    const materials = Array.isArray(mat) ? mat : [mat];

    // 3) Orijinal rengi sakla
    if (!child.userData.originalColor) {
      child.userData.originalColor = materials.map(m => 
        m.color ? m.color.getHex() : null
      );
    }

    // 4) Gizmo’ları atla
    const isGizmo = ['rotateGizmo','symetricGizmo','stretchGizmo']
      .includes(child.userData.type);
    if (isGizmo) return;

    // 5) Tüm materyallerin rengini değiştir
    materials.forEach(m => {
      if (m.color) {
        m.color.set(clickedGroupColor);
      }
    });
  });
}


        // Eğer tıklanan nesne bir grup ise
        if (clickedObject.parent.isGroup) {
          // Grup nesnesi ID'sine nasıl ulaşılacağı
          const groupId = clickedObject.parent.userData.id;  // Grup ID'si

          if (!selectedObjectIds.includes(groupId)) {
            if (!clickedObject.userData.originalColor) {
              clickedObject.userData.originalColor = clickedObject.material.color.getHex();
            }
            dispatch(addSelectedObjectID(groupId)); // Grup ID'si ekleniyor
          }
        } else {
          // Diğer nesneleri seç
          if (!selectedObjectIds.includes(clickedObject.userData.id)) {
            if (!clickedObject.userData.originalColor) {
              clickedObject.userData.originalColor = clickedObject.material.color.getHex();
            }
            clickedObject.material.color.set(clickedObjectColor); // Nesne için renk değişimi
            dispatch(addSelectedObjectID(clickedObject.userData.id)); // Nesne ID'si ekleniyor
          }
        }
      } else {
        // Boş alana tıklandıysa seçim dikdörtgenini başlat
        if (!isDrawingRef.current) {
          // Çizime başla
          isDrawingRef.current = true;

          // Düzlem tanımla (z=0 düzlemi)
          const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
          const intersectPoint = new THREE.Vector3();
          raycaster.current.ray.intersectPlane(plane, intersectPoint);

          if (intersectPoint) {
            startPointRef.current.copy(intersectPoint);

            // Başlangıçta küçük bir dikdörtgen oluştur
            const initialGeometry = new THREE.PlaneGeometry(0.1, 0.1);
            const initialMaterial = new THREE.MeshBasicMaterial({
              color: 0x0000ff,
              transparent: true,
              opacity: 0.25,
            });
            const rectangleMesh = new THREE.Mesh(initialGeometry, initialMaterial);
            rectangleMesh.position.copy(startPointRef.current);
            rectangleMesh.userData.isSelectable = false; // Seçilemez olarak işaretle
            scene.add(rectangleMesh);

            rectangleMeshRef.current = rectangleMesh;
          }
        }
      }

      renderer.render(scene, camera);
    };
    const handleMouseMove = (event) => {
      if (ignoreSelectionRef && ignoreSelectionRef.current) return;

      if (command.commandType != null && command.commandType.slice(0, 4) === 'draw') {
        return;
      }

      // Mouse koordinatlarını normalize et
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.current.setFromCamera(mouse.current, camera);

      // Eğer seçim dikdörtgeni çiziliyorsa, güncelle
      if (isDrawingRef.current && rectangleMeshRef.current) {
        // Düzlem tanımla (örneğin, z=0 düzlemi)
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.current.ray.intersectPlane(plane, intersectPoint);

        if (intersectPoint) {
          const start = startPointRef.current;
          const end = intersectPoint.clone();

          // Dikdörtgenin genişlik ve yüksekliğini hesapla
          const width = end.x - start.x;
          const height = end.y - start.y;

          // Çizim yönüne göre renk belirle
          const isRight = width >= 0;
          const color = isRight
            ? new THREE.Color(0x0000ff) // Mavi
            : new THREE.Color(0x00ff00); // Yeşil

          // Dikdörtgen geometrisini güncelle
          rectangleMeshRef.current.geometry.dispose(); // Eski geometriyi sil
         const safeWidth = Number.isFinite(width) ? Math.abs(width) : 0.1;
const safeHeight = Number.isFinite(height) ? Math.abs(height) : 0.1;
rectangleMeshRef.current.geometry = new THREE.PlaneGeometry(safeWidth, safeHeight);


          // Dikdörtgen pozisyonunu güncelle
          rectangleMeshRef.current.position.set(
            start.x + width / 2,
            start.y + height / 2,
            0
          );

          // Dikdörtgen rengini güncelle
          rectangleMeshRef.current.material.color.set(color);

          // Seçim modunu güncelle
          selectionModeRef.current = isRight ? 'inside' : 'overlap';

          // Dikdörtgen sınırlarını hesapla
          const minX = Math.min(start.x, end.x);
          const maxX = Math.max(start.x, end.x);
          const minY = Math.min(start.y, end.y);
          const maxY = Math.max(start.y, end.y);

          // Geçici olarak seçilen nesneleri tutan set
          const currentObjectsInside = new Set();

          // Seçilebilir nesneleri al
          const objects = scene.children.filter(
            (obj) =>
              (obj.isMesh || obj.isLine || obj.isSprite || obj.isGroup) &&
              obj.userData.isSelectable !== false &&
              obj !== rectangleMeshRef.current
          );
          
          objects.forEach((obj) => {
            // Nesne zaten seçiliyse atla
            if (selectedObjectIds.includes(obj.userData.id)) return;
            if (obj.type === "Sprite") return;

            // Nesnenin bounding box'ını hesapla
            const boundingBox = new THREE.Box3().setFromObject(obj);

            if (selectionModeRef.current === 'inside') {
              // Nesne tamamen dikdörtgen içinde mi?
              if (
                boundingBox.min.x >= minX &&
                boundingBox.max.x <= maxX &&
                boundingBox.min.y >= minY &&
                boundingBox.max.y <= maxY
              ) {
                currentObjectsInside.add(obj);

                // Nesne daha önce eklenmemişse
                if (!objectsInsideRef.current.has(obj)) {
                  // Orijinal rengi sakla
                  if (obj.isGroup) {
                    
                    if (!selectedObjectIds.includes(obj.userData.id)) {
                      hoveredGroupRef.current = obj;
                      obj.children.forEach((obje) => {
                        if (obje.material&&!obje.userData.originalColor) {
                          obje.userData.originalColor = obje.material.color.getHex();
                        }
                        // Hover rengi camgöbeği olarak ayarla
                        if(obje.material) obje.material.color.set(0x00ffff);  // Camgöbeği rengi
                      })
                    }

                  } else {
                    if (obj.material && !obj.userData.originalColor) {
                      obj.userData.originalColor = obj.material.color.getHex();
                    }
                    // Geçici renk (camgöbeği)
                    if (obj.material) {
                      obj.material.color.set(0x00ffff);
                    }
                  }
                }
              }
            } else if (selectionModeRef.current === 'overlap') {
              const rectBox = new THREE.Box2(
                new THREE.Vector2(minX, minY),
                new THREE.Vector2(maxX, maxY)
              );
 
              if (
              (  obj.geometry &&
                obj.geometry.attributes &&
                obj.geometry.attributes.position)
              //  ||obj.isGroup
              ) {
                
                let intersects = false;
                  if(obj.isGroup){
                    
 

                  }else {
                    const pos = obj.geometry.attributes.position;
                    isIntersect(pos)
                  }

                function isIntersect(positions){
                for (let i = 0; i < positions.count - 1; i++) {
                  const p1 = new THREE.Vector3().fromBufferAttribute(positions, i);
                  const p2 = new THREE.Vector3().fromBufferAttribute(positions, i + 1);

                  obj.localToWorld(p1);
                  obj.localToWorld(p2);

                  if (doesLineSegmentIntersectBox(p1, p2, rectBox)) {
                    intersects = true;
                    break;
                  }
                }
              }
                if (intersects) {
                  currentObjectsInside.add(obj);

                  if (!objectsInsideRef.current.has(obj)) {
                     if (obj.isGroup) {
                      if (!selectedObjectIds.includes(obj.userData.id)) {
                        hoveredGroupRef.current = obj;
                        obj.children.forEach((obje) => {
                          if (!obje.userData.originalColor) {
                            obje.userData.originalColor = obje.material.color.getHex();
                          }
                          // Hover rengi camgöbeği olarak ayarla
                          obje.material.color.set(0x00ffff);  // Camgöbeği rengi
                        })
                      }
  
                    } else{

                      if (obj.material && !obj.userData.originalColor) {
                        obj.userData.originalColor = obj.material.color.getHex();
                      }
                      obj.material.color.set(0x00ffff); // geçici camgöbeği rengi
                    }
                    
                  }

                }
              }
            }

          });

          // Artık dikdörtgen içinde olmayan nesnelerin rengini geri al
          objectsInsideRef.current.forEach((obj) => {
            if (!currentObjectsInside.has(obj)) {
              if(obj.isGroup){
                obj.children.forEach(obje=>{
                  if (obje.userData.originalColor) {
                    obje.material.color.setHex(obje.userData.originalColor);
                  }
                  objectsInsideRef.current.delete(obj);
                })             
              }else{
                if (obj.userData.originalColor) {
                  obj.material.color.setHex(obj.userData.originalColor);
                }
                objectsInsideRef.current.delete(obj);
              }              
            }            
          });

          // Yeni eklenen nesneleri referans setine ekle
          currentObjectsInside.forEach((obj) => {
            objectsInsideRef.current.add(obj);
          });
        }

        renderer.render(scene, camera);
        return;
      }

      // Normal seçim ve hover işlemleri
      const objects = scene.children.filter(
        (obj) =>
          (obj.isMesh || obj.isLine || obj.isGroup) &&
          obj.userData.isSelectable !== false &&
          obj !== rectangleMeshRef.current
      );  
      // Kesişimleri bul
      const intersects = raycaster.current.intersectObjects(objects, true);
       if (intersects.length > 0) {
 

         const intersectedObject = intersects[0].object;
        const branchID = intersectedObject.userData?.branchID;

  if (branchID) {
    // Sahnedeki tüm nesneleri tara
    scene.traverse((child) => {
      if (child.userData?.branchID === branchID) {
        if (child.isMesh || child.isLine) {
          if (!child.userData.originalColor && child.material && child.material.color) {
            child.userData.originalColor = child.material.color.getHex();
          }
          if (child.material && child.material.color) {
            child.material.color.set(0x00ffff); // Hover rengi: Camgöbeği
          }
        }
      }
    });

    // Hover referansı olarak branchID kaydedebilirsin istersen
    hoveredBranchIDRef.current = branchID;

  } else {
        // Nesne seçili değilse ve hover edilmiyorsa
        if (intersectedObject.parent.isGroup) {

          const group = intersectedObject.parent
          if (!selectedObjectIds.includes(group.userData.id)) {
            hoveredGroupRef.current = group;

            group.children.forEach((obj) => {
                if (obj.material && obj.material.color && !obj.userData.originalColor) {
                  obj.userData.originalColor = obj.material.color.getHex();
                }

              // Hover rengi camgöbeği olarak ayarla
              if (obj.material && obj.material.color) {
                obj.material.color.set(0x00ffff); // örnek: camgöbeği rengi
              }
                          })
          }
        }
        if (!selectedObjectIds.includes(intersectedObject.userData.id) && !intersectedObject.parent.isGroup) {
          if (hoveredObjectRef.current !== intersectedObject) {
            // Önceki hover nesnesinin rengini geri al
            if (
              hoveredObjectRef.current &&
              !selectedObjectIds.includes(hoveredObjectRef.current.userData.id)
            ) {
              hoveredObjectRef.current.material.color.setHex(
                hoveredObjectRef.current.userData.originalColor
              );
            }

            // Orijinal rengi sakla
            if (!intersectedObject.userData.originalColor) {
              intersectedObject.userData.originalColor =
                intersectedObject.material.color.getHex();
            }

            // Hover rengi (camgöbeği)
            intersectedObject.material.color.set(0x00ffff);
            hoveredObjectRef.current = intersectedObject;
          }
        } else {
          // Nesne zaten seçiliyse rengini kırmızıya ayarla
          if (!intersectedObject.parent.isGroup) intersectedObject.material.color.set(clickedObjectColor);

          // Hover referansını temizle
          if (
            hoveredObjectRef.current &&
            hoveredObjectRef.current !== intersectedObject
          ) {
            if (
              !selectedObjectIds.includes(hoveredObjectRef.current.userData.id)
            ) {
              hoveredObjectRef.current.material.color.setHex(
                hoveredObjectRef.current.userData.originalColor
              );

            }
            hoveredObjectRef.current = null;
          }
        }
      }
      } else {
        // Kesişim yoksa hover efektini kaldır
        if (hoveredObjectRef.current) {
          if (hoveredObjectRef.current.isGroup) {
            hoveredObjectRef.current.children.forEach((child) => {
              if (child.material && child.userData.originalColor) {
                child.material.color.setHex(child.userData.originalColor);
              }
            });
          } else if (
              hoveredObjectRef.current.material &&
              hoveredObjectRef.current.userData.originalColor &&
              selectedObjectRef.current != hoveredObjectRef.current
            ) {
              hoveredObjectRef.current.material.color.setHex(hoveredObjectRef.current.userData.originalColor
              );
            }
          hoveredObjectRef.current = null;
        }
        if (hoveredGroupRef.current) {
          if (!selectedObjectIds.includes(hoveredGroupRef.current.userData.id)) {
            hoveredGroupRef.current.children.forEach((obj) => {
              if (
                obj.material &&
                obj.userData.originalColor
              ) {
                obj.material.color.setHex(obj.userData.originalColor);
              }
            })
          }

          hoveredGroupRef.current = null;
        }
        const branchID = hoveredBranchIDRef.current;
  
        scene.traverse((child) => {
          if (child.userData?.branchID === branchID) {
            if (child.isMesh || child.isLine) {
           if (child.material && child.material.color && child.userData.originalColor !== undefined) {
  child.material.color.setHex(child.userData.originalColor);
}

            }
          }
        });
      
        hoveredBranchIDRef.current = null;
      }

      renderer.render(scene, camera);
    };
    function doesLineSegmentIntersectBox(p1, p2, box) {
      // Segment'in tamamı kutunun içindeyse zaten intersect var
      if (box.containsPoint(new THREE.Vector2(p1.x, p1.y)) ||
        box.containsPoint(new THREE.Vector2(p2.x, p2.y))) {
        return true;
      }

      // Dörtgenin kenarlarıyla kesişim kontrolü
      const boxEdges = [
        [new THREE.Vector2(box.min.x, box.min.y), new THREE.Vector2(box.max.x, box.min.y)],
        [new THREE.Vector2(box.max.x, box.min.y), new THREE.Vector2(box.max.x, box.max.y)],
        [new THREE.Vector2(box.max.x, box.max.y), new THREE.Vector2(box.min.x, box.max.y)],
        [new THREE.Vector2(box.min.x, box.max.y), new THREE.Vector2(box.min.x, box.min.y)],
      ];

      const segStart = new THREE.Vector2(p1.x, p1.y);
      const segEnd = new THREE.Vector2(p2.x, p2.y);

      for (const [edgeStart, edgeEnd] of boxEdges) {
        if (doSegmentsIntersect(segStart, segEnd, edgeStart, edgeEnd)) {
          return true;
        }
      }

      return false;
    }
    // İki doğru parçası kesişiyor mu?
    function doSegmentsIntersect(p1, p2, q1, q2) {
      const ccw = (a, b, c) => {
        return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
      };
      return ccw(p1, q1, q2) !== ccw(p2, q1, q2) && ccw(p1, p2, q1) !== ccw(p1, p2, q2);
    }
    const handleMouseUp = (event) => {
      if (command.commandType != null && command.commandType.slice(0, 4) === 'draw') return;
      if (ignoreSelectionRef && ignoreSelectionRef.current) return;
      if (event.button !== 0) return;

      if (isDrawingRef.current && rectangleMeshRef.current) {
        // Seçimi finalize et

        objectsInsideRef.current.forEach((obj) => {
          if (!selectedObjectIds.includes(obj.userData.id)) {
            if(obj.isGroup){
              obj.children.forEach(obje=>{
                if (obje.material && !obje.userData.originalColor) {
                  obje.userData.originalColor = obje.material.color.getHex();
                }
                if (obje.material) {
               
                  obje.material.color.set(clickedGroupColor); // Seçili renk
                }
                // ✅ Redux'a kaydet
                dispatch(addSelectedObjectID(obj.userData.id));
              })
           
            }else{
              if (obj.material && !obj.userData.originalColor) {
                obj.userData.originalColor = obj.material.color.getHex();
              }
              if (obj.material) {
                obj.material.color.set(clickedObjectColor); // Seçili renk
              }
              // ✅ Redux'a kaydet
              dispatch(addSelectedObjectID(obj.userData.id));
            }

          }
        });

        // Dikdörtgeni kaldır
        scene.remove(rectangleMeshRef.current);
        rectangleMeshRef.current.geometry.dispose();
        rectangleMeshRef.current.material.dispose();
        rectangleMeshRef.current = null;

        isDrawingRef.current = false;
        objectsInsideRef.current.clear();

        renderer.render(scene, camera);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        // 🔴 Seçili objeleri geri döndür

        const allObjects = scene.children.filter(
          (obj) =>
            (obj.isMesh || obj.isLine || obj.isSprite || obj.isGroup) &&
            obj.userData.isSelectable !== false
        );
        allObjects.forEach((obj) => {
          if (selectedObjectIds.includes(obj.userData.id)) {
            obj.traverse((child) => {
              if (child.material && child.userData?.originalColor !== undefined) {
                child.material.color.setHex(child.userData.originalColor);
              }
            });
          }
        });
        

        dispatch(clearSelection());

        // 🔵 Hover nesnesini de temizle
        if (
          hoveredObjectRef.current &&
          !selectedObjectIds.includes(hoveredObjectRef.current.userData.id)
        ) {
          if (hoveredObjectRef.current.userData.originalColor) {
            hoveredObjectRef.current.material.color.setHex(
              hoveredObjectRef.current.userData.originalColor
            );
          }
          hoveredObjectRef.current = null;
        }

        // 🔶 Dikdörtgen varsa iptal et
        if (isDrawingRef.current && rectangleMeshRef.current) {
          scene.remove(rectangleMeshRef.current);
          rectangleMeshRef.current.geometry.dispose();
          rectangleMeshRef.current.material.dispose();
          rectangleMeshRef.current = null;
          isDrawingRef.current = false;

          // Geçici renklendirmeyi de sıfırla
          objectsInsideRef.current.forEach((obj) => {
            if (obj.userData.originalColor) {
              obj.material.color.setHex(obj.userData.originalColor);
            }
          });
          objectsInsideRef.current.clear();
        }

        renderer.render(scene, camera);
      }
    };


    // Event listener'ları ekle
    renderer.domElement.addEventListener('mousemove', handleMouseMove);
    renderer.domElement.addEventListener('mousedown', handleMouseDown);
    renderer.domElement.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup işlemleri
    return () => {
      renderer.domElement.removeEventListener('mousemove', handleMouseMove);
      renderer.domElement.removeEventListener('mousedown', handleMouseDown);
      renderer.domElement.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    scene,
    camera,
    renderer,
    selectedObjectIds,
    dispatch,
    ignoreSelectionRef,
  ]);



  return null;
};



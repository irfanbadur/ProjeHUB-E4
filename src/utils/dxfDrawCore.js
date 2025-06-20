// src/utils/dxfDrawCore.js
import * as THREE from 'three';

import { drawLineFromCode } from '../commands/drawLineFromCode';
import { drawCircleFromCode } from '../commands/drawCircleFromCode';
import { drawArcFromCode } from '../commands/drawArcFromCode';
import { drawEllipticArcFromCode } from '../commands/drawEllipticArcFromCode';
import { drawEllipseFromCode } from '../commands/drawEllipseFromCode';
import { drawRectFromCode } from '../commands/drawRectFromCode';
import { drawPolylineFromCode } from '../commands/drawPolylineFromCode';
import { drawSplineFromCode } from '../commands/drawSplineFromCode';
import { drawTextFromCode } from '../commands/drawTextFromCode';
import { drawMtextFromCode } from '../commands/drawMtextFromCode';
import { createSolidHatchFromBoundary } from '../commands/createSolidHatchFromBoundary';
import { generateUniqueId } from '../utils/generateUniqueId'

function convertHAlign(halign) {
  switch (halign) {
    case 0: return 'left';     // Horizontal Left
    case 1: return 'center';   // Center
    case 2: return 'right';    // Right
    default: return 'left';    // Default fallback
  }
}

export function dxfDrawCore(scene, entities = [], blocks = {}, target) {
  if (!scene || !Array.isArray(entities)) return;
  const drawingGroup = new THREE.Group();
  entities.forEach((entity) => {
    const type = entity.type;
    const color = entity.color ?? 0xffffff;

    switch (type) {
      case 'LINE': {
        const [start, end] = entity.vertices || [];
        if (start && end) {
          const line = drawLineFromCode(null, 
            start,
            end,
            color,
          );
          
          if (target === "scene") {
            scene.add(line);
          } else if (target === "group") {
            drawingGroup.add(line);
          }
        }
        break;
      }

      case 'CIRCLE':
       const circle =  drawCircleFromCode( null, {
          center: entity.center,
          radius: entity.radius,
          color,
        });
        if (target === "scene") {
          scene.add(circle);
        } else if (target === "group") {
          drawingGroup.add(circle);
        }
        break;

      case 'ARC': {
        // Saat yönü belirleme mantığı
        let clockwise = false;
        if (entity.angleLength < 0) {
          clockwise = false;
        } else {
          clockwise = true;
        }
        if (entity.startAngle < entity.endAngle) {
          clockwise = !clockwise;
        }

       const arc = drawArcFromCode( null, {
          center: entity.center,
          radius: entity.radius,
          startAngle: entity.startAngle,
          endAngle: entity.endAngle,
          clockwise,
          color,
        }
      );
        if (target === "scene") {
          scene.add(arc);
        } else if (target === "group") {
          drawingGroup.add(arc);
        }
        break;
      }
      case 'ELLIPSE': {
        const isFullEllipse = entity.startAngle === 0 && entity.endAngle === 2 * Math.PI;
        let ellipse
        if (!isFullEllipse) {
           ellipse=drawEllipticArcFromCode( null, {
            center: entity.center,
            majorAxisEndPoint: entity.majorAxisEndPoint,
            axisRatio: entity.axisRatio,
            startAngle: entity.startAngle,
            endAngle: entity.endAngle,
            color,
          });
        } else {
          const majorX = entity.majorAxisEndPoint.x;
          const majorY = entity.majorAxisEndPoint.y;
          const radiusX = Math.sqrt(majorX ** 2 + majorY ** 2);
          const radiusY = radiusX * entity.axisRatio;
          const rotation = Math.atan2(majorY, majorX);

         ellipse= drawEllipseFromCode(null,  {
            center: entity.center,
            radiusX,
            radiusY,
            rotation,
            color,
          });
        }
        if (target === "scene") {
          scene.add(ellipse);
        } else if (target === "group") {
          drawingGroup.add(ellipse);
        }
        break;
      }
      case 'RECT':

        const rect = drawRectFromCode( null,  {
          start: entity.start,
          end: entity.end,
          color,
        });
        if (target === "scene") {
          scene.add(rect);
        } else if (target === "group") {
          drawingGroup.add(rect);
        }
        break;
      case 'LWPOLYLINE': {
        let polyline
        if (Array.isArray(entity.vertices) && entity.vertices.length >= 2) {
         polyline = drawPolylineFromCode( null, {
            points: entity.vertices,
            color,
            closed: entity.shape
          });
        } else {
          console.warn('POLYLINE entity has invalid vertices:', entity);
        }
                if (target === "scene") {
          scene.add(polyline);
        } else if (target === "group") {
          drawingGroup.add(polyline);
        }
        break;
      }
      case 'SPLINE': {
        let spline
        if (Array.isArray(entity.fitPoints) && entity.fitPoints.length >= 2) {
          spline = drawSplineFromCode( null,  {
            points: entity.fitPoints,
            color,
          });
        } else {
          console.warn('SPLINE entity has invalid fitPoints:', entity);
        }
          if (target === "scene") {
          scene.add(spline);
        } else if (target === "group") {
          drawingGroup.add(spline);
        }
        break;
      }
      case 'INSERT': {
        const block = blocks[entity.name];
        if (!block) {
          console.warn(`dxfDrawCore: Block '${entity.name}' bulunamadı`);
          return;
        }

        const group = new THREE.Group();
        dxfDrawCore(group, block.entities, blocks); // recursive çağrı

        // Pozisyon
        const { x = 0, y = 0, z = 0 } = entity.position || {};
        group.position.set(x, y, z);

        // Rotasyon (Z ekseni etrafında)
        if (entity.rotation) {
          group.rotation.z = THREE.MathUtils.degToRad(entity.rotation);
        }

        group.userData = {
          id: generateUniqueId("block"),
          type: 'block',
          name: entity.name,
          isSelectable: true,
        };

        scene.add(group);
        if (target === "group") {
          drawingGroup.add(group);
        }else if (target === "scene") {
          scene.add(group);
        }
        break;
      }

      case 'TEXT': {
        console.log("dxfDrawCore: TEXT entity found:", entity);
        const text = drawTextFromCode( null, {
          text: entity.text,
          position: entity.startPoint,                  // ✅ DXF verisinden
          endPoint:  entity.endPoint || entity.startPoint,                    // ✅ DXF verisinden
          fontSize: entity.textHeight || 20,            // ✅ DXF'de textHeight
          color: entity.color || 0xffffff,
          alignment: convertHAlign(entity.halign),      // ✅ alignment karşılığı
          // font, bold, italic gibi gömülü değilse varsayılana düşer
          halign: entity.halign,
          valign: entity.valign,
          rotation: entity.rotation || 0
        });
        if (target === "scene") {
          scene.add(text);
        } else if (target === "group") {
          drawingGroup.add(text);
        }
        break;
      }


       case 'MTEXT':
       const mtext = drawMtextFromCode( null, {
          text: entity.text,
          position: entity.position,
          font: entity.font,
          fontSize: entity.textHeight,
          color: entity.color,
          colorIndex: entity.colorIndex,
          bold: entity.bold,
          italic: entity.italic,
          underline: entity.underline,
          alignment: convertHAlign(entity.halign),
          height: entity.height,
          width: entity.width,
          attachmentPoint: entity.attachmentPoint
        });
        if (target === "scene") {
          scene.add(mtext);
        } else if (target === "group") {
          drawingGroup.add(mtext);
        }
        break;

      case 'solidhatch':
       const solidHatch = createSolidHatchFromBoundary( null, {
          segments: entity.segments,
          color,
        });
        if (target === "scene") {
          scene.add(solidHatch);
        } else if (target === "group") {
          drawingGroup.add(solidHatch);
        }
        break;

      default:
      // console.warn(`dxfDrawCore: Tanınmayan type: ${type}`);
    }
  });
  return drawingGroup;
}

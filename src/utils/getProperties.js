import { generateUniqueId } from './generateUniqueId';

export const cloneUserDataForCopy = (originalUserData) => {
  if (!originalUserData || !originalUserData.type) return {};

  const { type } = originalUserData;

  const base = {
    id: generateUniqueId(),
    isSelectable: true,
    type,
  };

  switch (type) {
    case 'line':
      return {
        ...base,
        pos: [...originalUserData.pos],
      };
    case 'circle':
      return {
        ...base,
        center: { ...originalUserData.center },
        radius: originalUserData.radius,
      };
    case 'arc':
      return {
        ...base,
        center: { ...originalUserData.center },
        radius: originalUserData.radius,
      };
    case 'ellipse':
      return {
        ...base,
        center: { ...originalUserData.center },
        majorRadius: originalUserData.majorRadius,
        minorRadius: originalUserData.minorRadius,
        angle: originalUserData.angle,
        major: originalUserData.major,
      };
    case 'polyline':
      return base;
    case 'rect':
      return {
        ...base,
        start: { ...originalUserData.start },
        width: originalUserData.width,
        height: originalUserData.height,
        angle: originalUserData.angle,
      };
    case 'spline':
      return base;
    case 'text':
    case 'mtext':
      return {
        ...base,
        text: originalUserData.text,
        font: originalUserData.font,
        fontSize: originalUserData.fontSize,
        alignment: originalUserData.alignment,
        bold: originalUserData.bold,
        italic: originalUserData.italic,
        underline: originalUserData.underline,
        color: originalUserData.color,
      };
    default:
      return base;
  }
};
// src/hooks/useDxfLoader.js
import { useDispatch } from 'react-redux';
import DxfParser from 'dxf-parser';
import { setDxfData } from '../redux/dxfSlice';
import { setLayers } from '../redux/layerSlice';

export const useDxfLoader = () => {
  const dispatch = useDispatch();

  const loadDxfFile = (file, onSuccess, onError) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const parser = new DxfParser();
      try {
        const dxf = parser.parseSync(e.target.result);
        dispatch(setDxfData(dxf));
        dispatch(setLayers(dxf.tables?.layer?.layers || []));
        if (onSuccess) onSuccess(dxf);
        } catch (err) {
        console.error('DXF parsing error:', err);
        if (onError) onError(err);
      }
    };

    reader.readAsText(file);
  };

  return { loadDxfFile };
};
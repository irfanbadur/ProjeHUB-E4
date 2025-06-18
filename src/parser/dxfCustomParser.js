//src/components/Screene/dxfOku
let lType = [];
var l_typeName = [];
let Varliklar = [];
let LTYPES = [];
var dizin = [];
let ENTITIES = [];
let TABLES = [];
let KATMANLAR = [];
let Layers = [];
let LTypes = [];
let LINES = [];
let CIRCLES = [];
let TEXT = [];
let e, b, d, c;
let ARCS = [];
let POLYLINES = [];
let SPLINES = [];
let DASHARRAY = [];
let renkFlag = false
let LineTypeFlag = false;
let DefaultCizgiK = 40;

var INSERTS = [];
var l_typeName = [];
var TextString, TextStyleName, TextArc, AttachmentPoint, RefRectH, RefRectW;
var ais1, renk, kalinlik, Stroke_DashArray, NesneNo, StartArc, EndArc;
var LayerName, LayerOnOff, layerLock, layerFreeze, LineType, LayerlineTypeName, Color, LayerColor;
var LineScale = 1, LineWeight = 40, EndPointX, EndPointY, EndPointZ, Thickness, X, Y, Z, R, TextH, relativeXScale, relativeXScale, StartParameter, EndParameter, TextGenerationFlags, HorFlagJustification, secondAligmentX, secondAligmentY, secondAligmentZ, ExtrusionDirectionX, ExtrusionDirectionY, ExtrusionDirectionZ, obliqueAngle, VerticalTextJustification
var Color24 = "";

export function getHatchFromDXF(dxfkodu) {
	LineType = "ByLayer";
	let HATCH = [];
	let no = dxfkodu.indexOf("TABLES");
	while (dxfkodu[no] != "ENDSEC") {
		TABLES.push(dxfkodu[no]);
		no++;
	}
	TABLES.push(dxfkodu[no]);

	//TABLES DİZİSİ İÇİNDE LAYER DİZİSİ Oluşturuluyor
	let k = TABLES.indexOf("LAYER");
	let m = k - 3;
	while (TABLES[m] != "ENDTAB") {
		m++;
		Layers.push(TABLES[m]);
	}
	//TABLES DİZİSİ İÇİNDE LTYPE DİZİSİ Oluşturuluyor
	k = TABLES.indexOf("LTYPE");
	m = k - 3;
	while (TABLES[m] != "ENDTAB") {
		m++;
		LTypes.push(TABLES[m]);
	}
	no = dxfkodu.indexOf("ENTITIES");

	while (dxfkodu[no] != "ENDSEC") {
		HATCH.push(dxfkodu[no]);
		no++;
	}
	// ENTITIES dizisini yazma			
	LTypeOku(LTypes);
	LayerOku(Layers);
	const hatch = hacthOku(HATCH)
	return { hatch }
}
export function getLayers(){

}

function LTypeOku(Linetip) {
	//for (var a=0 ;a<=tablodizi.length-1;a++){
	let a = 0;
	while (Linetip[a] != "ENDTAB") {
		let l_tipi = [];
		if (Linetip[a] == "AcDbLinetypeTableRecord") {
			//	if (Linetip[a]=="2"){
			l_tipi.push(Linetip[a + 2]);//Ltype Name yazıldı
			l_typeName.push(Linetip[a + 2]);
			//	}
			let v = 0;
			while (Linetip[a] != 73) {
				a++;
			}
			if (Linetip[a] == 73) {
				let elemansay = parseInt(Linetip[a + 1]);
				l_tipi.push(elemansay);//Ltype elemansayısı yazıldı	
				if (elemansay != 0) {
					for (var x = a + 4; x <= a + elemansay * 4; x += 4) {
						l_tipi.push(parseInt(Linetip[x + 1]) * LineScale);				//l_tipi.push(parseInt(Linetip[x+5])*LineScale);			
					}
				}
			}
			a++;
			LTYPES.push(l_tipi);
		}
		a++;
	}
}
function LayerOku(tablodizi) {
	//for (var a=0 ;a<=tablodizi.length-1;a++){
	let a = 0;
	while (tablodizi[a] != "ENDTAB") {
		let Katman = [];
		if (tablodizi[a] == "AcDbLayerTableRecord") {
			let b = a;
			if (tablodizi[b + 1] == 2) {
				Katman.push(tablodizi[b + 2]);//Layer Name yazıldı		
			}
			while (tablodizi[b] != "347") {
				if (tablodizi[b] == 62) {
					if (tablodizi[b + 1] < 0) {
						Katman.push("off");
						Katman.push(tablodizi[b + 1] * -1);// Color
						LayerColor = (tablodizi[b + 1] * -1);
					} else {
						Katman.push("on");
						Katman.push(tablodizi[b + 1] * 1);// Color
						LayerColor = (tablodizi[b + 1]);
					}
				}
				if (tablodizi[b] == 70) {
					let vv = tablodizi[b + 1] * 1;
					if (vv == 4) {
						Katman.push("NoneFreeze");
						Katman.push("Locked");
					} else if (vv == 1 || vv == 2) {
						Katman.push("Freeze");
						Katman.push("NoneLock");
					} else if (vv == 5) {
						Katman.push("Freeze");
						Katman.push("Locked");
					} else if (vv == 7) {
						Katman.push("Freeze");
						Katman.push("Locked");
					} else if (vv == 0) {
						Katman.push("NoneFreeze");
						Katman.push("NoneLock");
					}
				}
				if (tablodizi[b] == 6) {
					Katman.push(tablodizi[b + 1]);// Color
				}
				if (tablodizi[b] == 370) {
					if (tablodizi[b + 1] == "    -3") {
						Katman.push(DefaultCizgiK);// Color	
					} else {
						Katman.push(tablodizi[b + 1]);// Color	
					}
				}
				b++;
			}
			a = b + 1;
			KATMANLAR.push(Katman);
		}
		a++;
	}
}
function katmanRenk(katmanadı) {
	for (var a = 0; a <= KATMANLAR.length - 1; a++) {

		if (KATMANLAR[a][0] == katmanadı) {

			return KATMANLAR[a][4];
		}
	}
}
function hacthOku(varlikdizi) {
	var cizim2 = [];
	for (var a = 0; a <= varlikdizi.length - 1; a++) {
		// TEXT (tek SATIR) OKUNMASI------------------------	
		if (varlikdizi[a] == "HATCH") {
			let handle;
			if (parseInt(varlikdizi[a + 1]) == 5) {			//handle	 				 
				handle = varlikdizi[a + 2];
			}
			let b = a + 1;
			// Hatch işleme kodları buradalet b = a + 1;
			let HatchPatternName, SolidFillFlag, MPolygon, AssociativityFlag, NumberOfBoundaryPaths, HatchPatternAngle, HatchPatternSpacing, edgeType, IsClosedFlag, NumberOfPolylineVertices, HatchPatternScale
			let pattern = {}
			let boundaryPath = { groups: [] }
			let boundaryPathlar = []

			while (varlikdizi[b] != "AcDbEntity" && b < varlikdizi.length) {
				b++
			}
			Color24 = "";
			let c = b + 1;
			while (varlikdizi[c] != "AcDbHatch") {
				if ((varlikdizi[c]) == 8) {		//Layer	name				 
					LayerName = varlikdizi[c + 1];
					LineType = AttributeAl(LayerName, "LayerlineTypeName");
					Color = AttributeAl(LayerName, "lineColor");
					LineWeight = AttributeAl(LayerName, "lineWeight");
					LayerOnOff = AttributeAl(LayerName, "LayerOnOff");
					layerFreeze = AttributeAl(LayerName, "layerFreeze");
					layerLock = AttributeAl(LayerName, "layerLock");
					c++;
				}
				if ((varlikdizi[c]) == 6) {				//LineType				 
					LineType = varlikdizi[c + 1];
					c++;
				}
				if ((varlikdizi[c]) == 62) {
					Color = varlikdizi[c + 1];
					renkFlag = true;
					c++;
					//LayerName=dxfkodu[c+1];
				}
				if ((varlikdizi[c]) == 420) {			//Color
					Color = "";
					Color24 = convertColor24ToHex(varlikdizi[c + 1]);
					renkFlag = true;
					c++;
				}
				if ((varlikdizi[c]) == 440) {			//
					c++;
				}
				if ((varlikdizi[c]) == 48) {				//Line Scale
					LineScale = varlikdizi[c + 1];
					c++;
				}

				if ((varlikdizi[c]) == 370) {			//Line Weight
					LineWeight = varlikdizi[c + 1];
				}
				c++;
				e = c + 2;
			}
			if (renkFlag == false) {
				Color = katmanRenk(LayerName);
				if (typeof (Color) === String) { Color = ColorIndex(Color.trim()) }
			}
			if (LineTypeFlag == false) {
				LineType = "ByLayer";
			}
			TextArc = 0;
			let hatchFinishFlag = false

			while (hatchFinishFlag != true) {
				if (
					((varlikdizi[e - 1]) == 10)
					&& (parseInt(varlikdizi[e + 1]) == 20)
					&& (parseInt(varlikdizi[e + 3]) == 30)
					&& (parseInt(varlikdizi[e + 5]) == 210)
					&& (parseInt(varlikdizi[e + 7]) == 220)
					&& (parseInt(varlikdizi[e + 9]) == 230)
					&& (parseInt(varlikdizi[e + 11]) == 2)
					&& (parseInt(varlikdizi[e + 13]) == 70)
				) {			//Y	
					X = (1 * varlikdizi[e]);
					Y = (-1 * varlikdizi[e + 2]);
					Z = 0;
					ExtrusionDirectionX = (1 * varlikdizi[e + 6]);
					ExtrusionDirectionY = (1 * varlikdizi[e + 8]);
					ExtrusionDirectionZ = (1 * varlikdizi[e + 10]);
					HatchPatternName = varlikdizi[e + 12];
					SolidFillFlag = parseInt(varlikdizi[e + 14])
					if (parseInt(varlikdizi[e + 15]) == 63) {
						MPolygon = parseInt(varlikdizi[e + 16]);
					} else if (parseInt(varlikdizi[e + 15]) == 71) {
						MPolygon = null
						AssociativityFlag = parseInt(varlikdizi[e + 16]);
					}
				}

				if ((parseInt(varlikdizi[e]) === (91 || "91"))) {	       // Name			 
					NumberOfBoundaryPaths = parseInt(varlikdizi[e + 1]);
					let boundaryPathArrayDXF = []
					let BoundaryPathTypeFlagFLAG = false
					let k = e + 2
					//while (BoundaryPathTypeFlagFLAG != true) {
					while (BoundaryPathTypeFlagFLAG != true) {
						if (varlikdizi[k]) {
							boundaryPathArrayDXF.push(varlikdizi[k])
							if ((parseInt(varlikdizi[k + 1]) == 75)
								&& (parseInt(varlikdizi[k + 3]) == 76)
							) {
								if ((parseInt(varlikdizi[k + 5]) == 52)
									&& (parseInt(varlikdizi[k + 7]) == 41)
								) {
									HatchPatternAngle = parseInt(varlikdizi[k + 6])
									HatchPatternSpacing = parseInt(varlikdizi[k + 8])
								}
								BoundaryPathTypeFlagFLAG = true
							}
							k++
						}
					}
					const BoundaryPathsS = extractBoundaryPaths(boundaryPathArrayDXF, NumberOfBoundaryPaths)

					BoundaryPathsS.forEach((boundary, b) => {
						boundaryPath = boundaryPathGET(boundary)

						if (boundaryPath !== "none") {
							boundaryPathlar.push(boundaryPath)
						}

					})

				}
				if (parseInt(varlikdizi[e]) == 41) {				//Line Scale
					HatchPatternScale = parseFloat(varlikdizi[e + 1]);
					e++;
				}

				if ((parseInt(varlikdizi[e]) == 77)
					&& (parseInt(varlikdizi[e + 2]) == 78)
				) {

					pattern.lineCount = parseFloat(varlikdizi[e + 3]);
					let patternLine = []

					let patternLineFlag = false
					while (patternLineFlag != true) {
						if ((parseInt(varlikdizi[e]) == 53)
							&& (parseInt(varlikdizi[e + 2]) == 43)
							&& (parseInt(varlikdizi[e + 4]) == 44)
							&& (parseInt(varlikdizi[e + 6]) == 45)
							&& (parseInt(varlikdizi[e + 8]) == 46)
							&& (parseInt(varlikdizi[e + 10]) == 79)
						) {
							let line = {}
							line.lineAngle = parseFloat(varlikdizi[e + 1]);
							line.LineBasePointX = parseFloat(varlikdizi[e + 3]);
							line.LineBasePointY = parseFloat(varlikdizi[e + 5]);
							line.LineOffsetX = parseFloat(varlikdizi[e + 7]);
							line.LineOffsetY = parseFloat(varlikdizi[e + 9]);
							let dashCount = parseFloat(varlikdizi[e + 11]);
							line.dashCount = dashCount
							if (dashCount >= 1) {

								let dashes = []
								for (var dc = 0; dc <= dashCount - 1; dc++) {
									if (parseInt(varlikdizi[e + 12]) == 49) {
										dashes.push(parseFloat(varlikdizi[e + 13 + dc * 2]))
									}
								}
								line.dashes = dashes
							}
							patternLine.push(line)
						}
						if ((parseInt(varlikdizi[e]) == 98)
							&& (parseInt(varlikdizi[e - 2]) == 47)
						) {
							patternLineFlag = true
							pattern.patternLine = patternLine
					hatchFinishFlag = true
						}
						e++;
					}
			
				}
				if ((parseInt(varlikdizi[e]) == 98)
					&& (parseInt(varlikdizi[e - 2]) == 47)
				) {

					hatchFinishFlag = true
				}
				/* 			if ((parseInt(varlikdizi[e]) == 0)
								&& (parseInt(varlikdizi[e - 2]) == 1030)
								&& (parseInt(varlikdizi[e - 4]) == 1020)
								&& (parseInt(varlikdizi[e - 6]) == 1010)
								&& (parseInt(varlikdizi[e - 8]) == 1001)
							) {
								hatchFinishFlag = true
							} */
				e++;
			}
			Color = ColorIndex(Color)
			if ((SolidFillFlag != 0 && HatchPatternName == "SOLID") || HatchPatternName !== "SOLID") {
				let hatch = {
					type: "HATCH", handle, layer: LayerName, color: Color, colorIndex: Color24.trim(), LineScale: LineScale, LineType: LineType, Kalinlik: LineWeight, x: X, y: Y, HatchPatternName, SolidFillFlag, MPolygon, AssociativityFlag, HatchPatternSpacing, HatchPatternAngle, NumberOfBoundaryPaths, boundaryPath: boundaryPathlar, edgeType, IsClosedFlag, NumberOfPolylineVertices, HatchPatternScale, pattern
				}
				cizim2.push(hatch);
			}
		}

	}
	return cizim2;

}


function AttributeAl(katmanAdı, nitelik) {
	let u = 0;
	let sonuc
	while (katmanAdı != KATMANLAR[u][0]) {
		u++;
	}
	switch (nitelik) {
		case "LayerOnOff":
			sonuc = KATMANLAR[u][3];
			break;
		case "lineColor":
			sonuc = KATMANLAR[u][4];
			break;
		case "LayerlineTypeName":
			sonuc = KATMANLAR[u][5];
			break;
		case "lineWeight":
			sonuc = KATMANLAR[u][6];
			break;
		case "layerFreeze":
			sonuc = KATMANLAR[u][1];
			break;
		case "layerLock":
			sonuc = KATMANLAR[u][2];
			break;
	}
	return sonuc;
}

function ColorIndex(index) {
	let colorindex = []
	colorindex[0] = '#000000 ';
	colorindex[1] = '#FF0000 ';
	colorindex[2] = '#FFFF00 ';
	colorindex[3] = '#00FF00 ';
	colorindex[4] = '#00FFFF ';
	colorindex[5] = '#0000FF ';
	colorindex[6] = '#FF00FF ';
	colorindex[7] = '#FFFFFF ';
	colorindex[8] = '#808080 ';
	colorindex[9] = '#C0C0C0 ';
	colorindex[10] = '#FF0000 ';
	colorindex[11] = '#FF7F7F ';
	colorindex[12] = '#A50000 ';
	colorindex[13] = '#A55252 ';
	colorindex[14] = '#7F0000 ';
	colorindex[15] = '#803F3F ';
	colorindex[16] = '#4C0000 ';
	colorindex[17] = '#4C2626 ';
	colorindex[18] = '#260000 ';
	colorindex[19] = '#261313 ';
	colorindex[20] = '#FF3F00 ';
	colorindex[21] = '#FF9F7F ';
	colorindex[22] = '#CC3300 ';
	colorindex[23] = '#CC7F66 ';
	colorindex[24] = '#992600 ';
	colorindex[25] = '#995F4C ';
	colorindex[26] = '#7F1F00 ';
	colorindex[27] = '#7F4F3F ';
	colorindex[28] = '#4C1300 ';
	colorindex[29] = '#4C2F26 ';
	colorindex[30] = '#FF7F00 ';
	colorindex[31] = '#FFBF7F ';
	colorindex[32] = '#CC6600 ';
	colorindex[33] = '#CC9966 ';
	colorindex[34] = '#994C00 ';
	colorindex[35] = '#99724C ';
	colorindex[36] = '#7F3F00 ';
	colorindex[37] = '#7F5F3F ';
	colorindex[38] = '#4C2600 ';
	colorindex[39] = '#4C3926 ';
	colorindex[40] = '#FFBF00 ';
	colorindex[41] = '#FFDF7F ';
	colorindex[42] = '#CC9900 ';
	colorindex[43] = '#CCB266 ';
	colorindex[44] = '#997200 ';
	colorindex[45] = '#99854C ';
	colorindex[46] = '#7F5F00 ';
	colorindex[47] = '#7F6F3F ';
	colorindex[48] = '#4C3900 ';
	colorindex[49] = '#4C4226 ';
	colorindex[50] = '#FFFF00 ';
	colorindex[51] = '#FFFF7F ';
	colorindex[52] = '#CCCC00 ';
	colorindex[53] = '#CCCC66 ';
	colorindex[54] = '#989800 ';
	colorindex[55] = '#98984C ';
	colorindex[56] = '#7F7F00 ';
	colorindex[57] = '#7F7F3F ';
	colorindex[58] = '#4C4C00 ';
	colorindex[59] = '#4C4C26 ';
	colorindex[60] = '#BFFF00 ';
	colorindex[61] = '#DFFF7F ';
	colorindex[62] = '#99CC00 ';
	colorindex[63] = '#B2CC66 ';
	colorindex[64] = '#729800 ';
	colorindex[65] = '#85984C ';
	colorindex[66] = '#5F7F00 ';
	colorindex[67] = '#6F7F3F ';
	colorindex[68] = '#394C00 ';
	colorindex[69] = '#424C26 ';
	colorindex[70] = '#7FFF00 ';
	colorindex[71] = '#BFFF7F ';
	colorindex[72] = '#66CC00 ';
	colorindex[73] = '#99CC66 ';
	colorindex[74] = '#4C9800 ';
	colorindex[75] = '#72984C ';
	colorindex[76] = '#3F7F00 ';
	colorindex[77] = '#5F7F3F ';
	colorindex[78] = '#264C00 ';
	colorindex[79] = '#394C26 ';
	colorindex[80] = '#3FFF00 ';
	colorindex[81] = '#9FFF7F ';
	colorindex[82] = '#33CC00 ';
	colorindex[83] = '#7FCC66 ';
	colorindex[84] = '#269800 ';
	colorindex[85] = '#5F984C ';
	colorindex[86] = '#1F7F00 ';
	colorindex[87] = '#4F7F3F ';
	colorindex[88] = '#134C00 ';
	colorindex[89] = '#2F4C26 ';
	colorindex[90] = '#00FF00 ';
	colorindex[91] = '#7FFF7F ';
	colorindex[92] = '#00CC00 ';
	colorindex[93] = '#66CC66 ';
	colorindex[94] = '#009800 ';
	colorindex[95] = '#4C984C ';
	colorindex[96] = '#007F00 ';
	colorindex[97] = '#3F7F3F ';
	colorindex[98] = '#004C00 ';
	colorindex[99] = '#264C26 ';
	colorindex[100] = '#00FF3F ';
	colorindex[101] = '#7FFF9F ';
	colorindex[102] = '#00CC33 ';
	colorindex[103] = '#66CC7F ';
	colorindex[104] = '#009826 ';
	colorindex[105] = '#4C985F ';
	colorindex[106] = '#007F1F ';
	colorindex[107] = '#3F7F4F ';
	colorindex[108] = '#004C13 ';
	colorindex[109] = '#264C2F ';
	colorindex[110] = '#00FF7F ';
	colorindex[111] = '#7FFFBF ';
	colorindex[112] = '#00CC66 ';
	colorindex[113] = '#66CC99 ';
	colorindex[114] = '#00984C ';
	colorindex[115] = '#4C9872 ';
	colorindex[116] = '#007F3F ';
	colorindex[117] = '#3F7F5F ';
	colorindex[118] = '#004C26 ';
	colorindex[119] = '#264C39 ';
	colorindex[120] = '#00FFBF ';
	colorindex[121] = '#7FFFDF ';
	colorindex[122] = '#00CC99 ';
	colorindex[123] = '#66CCB2 ';
	colorindex[124] = '#009872 ';
	colorindex[125] = '#4C9885 ';
	colorindex[126] = '#007F5F ';
	colorindex[127] = '#3F7F6F ';
	colorindex[128] = '#004C39 ';
	colorindex[129] = '#264C42 ';
	colorindex[130] = '#0019FF ';
	colorindex[131] = '#7FFFFF ';
	colorindex[132] = '#00CCCC ';
	colorindex[133] = '#66CCCC ';
	colorindex[134] = '#009898 ';
	colorindex[135] = '#4C9898 ';
	colorindex[136] = '#007F7F ';
	colorindex[137] = '#3F7F7F ';
	colorindex[138] = '#004C4C ';
	colorindex[139] = '#264C4C ';
	colorindex[140] = '#00BFFF ';
	colorindex[141] = '#7FDFFF ';
	colorindex[142] = '#0099CC ';
	colorindex[143] = '#66B2CC ';
	colorindex[144] = '#007298 ';
	colorindex[145] = '#4C8598 ';
	colorindex[146] = '#005F7F ';
	colorindex[147] = '#3F0B7F ';
	colorindex[148] = '#00394C ';
	colorindex[149] = '#26424C ';
	colorindex[150] = '#007FFF ';
	colorindex[151] = '#7FBFFF ';
	colorindex[152] = '#0066CC ';
	colorindex[153] = '#6699CC ';
	colorindex[154] = '#004C98 ';
	colorindex[155] = '#4C7298 ';
	colorindex[156] = '#003F7F ';
	colorindex[157] = '#3F5F7F ';
	colorindex[158] = '#00264C ';
	colorindex[159] = '#26394C ';
	colorindex[160] = '#003FFF ';
	colorindex[161] = '#7F9FFF ';
	colorindex[162] = '#0033CC ';
	colorindex[163] = '#667FCC ';
	colorindex[164] = '#002698 ';
	colorindex[165] = '#4C5F98 ';
	colorindex[166] = '#001F7F ';
	colorindex[167] = '#3F4F7F ';
	colorindex[168] = '#00134C ';
	colorindex[169] = '#262F4C ';
	colorindex[170] = '#0000FF ';
	colorindex[171] = '#7F7FFF ';
	colorindex[172] = '#0000CC ';
	colorindex[173] = '#6666CC ';
	colorindex[174] = '#000098 ';
	colorindex[175] = '#4C4C98 ';
	colorindex[176] = '#00007F ';
	colorindex[177] = '#3F3F7F ';
	colorindex[178] = '#00004C ';
	colorindex[179] = '#26264C ';
	colorindex[180] = '#3F00FF ';
	colorindex[181] = '#9F7FFF ';
	colorindex[182] = '#3300CC ';
	colorindex[183] = '#7F66CC ';
	colorindex[184] = '#260098 ';
	colorindex[185] = '#5F4C98 ';
	colorindex[186] = '#1F007F ';
	colorindex[187] = '#4F3F7F ';
	colorindex[188] = '#13004C ';
	colorindex[189] = '#131758 ';
	colorindex[190] = '#7F00FF ';
	colorindex[191] = '#BF7FFF ';
	colorindex[192] = '#6600CC ';
	colorindex[193] = '#9966CC ';
	colorindex[194] = '#4C0098 ';
	colorindex[195] = '#724C98 ';
	colorindex[196] = '#3F007F ';
	colorindex[197] = '#5F3F7F ';
	colorindex[198] = '#26004C ';
	colorindex[199] = '#39264C ';
	colorindex[200] = '#BF00FF ';
	colorindex[201] = '#DF7FFF ';
	colorindex[202] = '#9900CC ';
	colorindex[203] = '#B266CC ';
	colorindex[204] = '#720098 ';
	colorindex[205] = '#854C98 ';
	colorindex[206] = '#5F007F ';
	colorindex[207] = '#6F3F7F ';
	colorindex[208] = '#39004C ';
	colorindex[209] = '#42264C ';
	colorindex[210] = '#9B00FF ';
	colorindex[211] = '#9B7FFF ';
	colorindex[212] = '#CC00CC ';
	colorindex[213] = '#CC66CC ';
	colorindex[214] = '#980098 ';
	colorindex[215] = '#984C98 ';
	colorindex[216] = '#7F007F ';
	colorindex[217] = '#7F3F7F ';
	colorindex[218] = '#4C004C ';
	colorindex[219] = '#4C264C ';
	colorindex[220] = '#FF00BF ';
	colorindex[221] = '#FF7FDF ';
	colorindex[222] = '#CC0099 ';
	colorindex[223] = '#CC66B2 ';
	colorindex[224] = '#980072 ';
	colorindex[225] = '#984C85 ';
	colorindex[226] = '#7F005F ';
	colorindex[227] = '#7F28DB ';
	colorindex[228] = '#4C0039 ';
	colorindex[229] = '#4C2642 ';
	colorindex[230] = '#FF007F ';
	colorindex[231] = '#FF7FBF ';
	colorindex[232] = '#CC0066 ';
	colorindex[233] = '#CC6699 ';
	colorindex[234] = '#98004C ';
	colorindex[235] = '#984C72 ';
	colorindex[236] = '#7F003F ';
	colorindex[237] = '#7F3F5F ';
	colorindex[238] = '#4C0026 ';
	colorindex[239] = '#4C2639 ';
	colorindex[240] = '#FF003F ';
	colorindex[241] = '#FF7F9F ';
	colorindex[242] = '#CC0033 ';
	colorindex[243] = '#CC667F ';
	colorindex[244] = '#980026 ';
	colorindex[245] = '#984C5F ';
	colorindex[246] = '#7F001F ';
	colorindex[247] = '#7F3F4F ';
	colorindex[248] = '#4C0013 ';
	colorindex[249] = '#4C262F ';
	colorindex[250] = '#333333 ';
	colorindex[251] = '#5F5B5B ';
	colorindex[252] = '#848484 ';
	colorindex[253] = '#ADADAD ';
	colorindex[254] = '#D6D6D6 ';
	colorindex[255] = '#FFFFFF ';
	var sonuc = colorindex[index]
	if (sonuc == undefined) {
		sonuc = ""
	}
	return sonuc;
}
export function ColorIndex1(index) {
	let colorindex = []
	colorindex[0] = '#000000 ';
	colorindex[1] = '#FF0000 ';
	colorindex[2] = '#FFFF00 ';
	colorindex[3] = '#00FF00 ';
	colorindex[4] = '#00FFFF ';
	colorindex[5] = '#0000FF ';
	colorindex[6] = '#FF00FF ';
	colorindex[7] = '#FFFFFF ';
	colorindex[8] = '#808080 ';
	colorindex[9] = '#C0C0C0 ';
	colorindex[10] = '#FF0000 ';
	colorindex[11] = '#FF7F7F ';
	colorindex[12] = '#A50000 ';
	colorindex[13] = '#A55252 ';
	colorindex[14] = '#7F0000 ';
	colorindex[15] = '#803F3F ';
	colorindex[16] = '#4C0000 ';
	colorindex[17] = '#4C2626 ';
	colorindex[18] = '#260000 ';
	colorindex[19] = '#261313 ';
	colorindex[20] = '#FF3F00 ';
	colorindex[21] = '#FF9F7F ';
	colorindex[22] = '#CC3300 ';
	colorindex[23] = '#CC7F66 ';
	colorindex[24] = '#992600 ';
	colorindex[25] = '#995F4C ';
	colorindex[26] = '#7F1F00 ';
	colorindex[27] = '#7F4F3F ';
	colorindex[28] = '#4C1300 ';
	colorindex[29] = '#4C2F26 ';
	colorindex[30] = '#FF7F00 ';
	colorindex[31] = '#FFBF7F ';
	colorindex[32] = '#CC6600 ';
	colorindex[33] = '#CC9966 ';
	colorindex[34] = '#994C00 ';
	colorindex[35] = '#99724C ';
	colorindex[36] = '#7F3F00 ';
	colorindex[37] = '#7F5F3F ';
	colorindex[38] = '#4C2600 ';
	colorindex[39] = '#4C3926 ';
	colorindex[40] = '#FFBF00 ';
	colorindex[41] = '#FFDF7F ';
	colorindex[42] = '#CC9900 ';
	colorindex[43] = '#CCB266 ';
	colorindex[44] = '#997200 ';
	colorindex[45] = '#99854C ';
	colorindex[46] = '#7F5F00 ';
	colorindex[47] = '#7F6F3F ';
	colorindex[48] = '#4C3900 ';
	colorindex[49] = '#4C4226 ';
	colorindex[50] = '#FFFF00 ';
	colorindex[51] = '#FFFF7F ';
	colorindex[52] = '#CCCC00 ';
	colorindex[53] = '#CCCC66 ';
	colorindex[54] = '#989800 ';
	colorindex[55] = '#98984C ';
	colorindex[56] = '#7F7F00 ';
	colorindex[57] = '#7F7F3F ';
	colorindex[58] = '#4C4C00 ';
	colorindex[59] = '#4C4C26 ';
	colorindex[60] = '#BFFF00 ';
	colorindex[61] = '#DFFF7F ';
	colorindex[62] = '#99CC00 ';
	colorindex[63] = '#B2CC66 ';
	colorindex[64] = '#729800 ';
	colorindex[65] = '#85984C ';
	colorindex[66] = '#5F7F00 ';
	colorindex[67] = '#6F7F3F ';
	colorindex[68] = '#394C00 ';
	colorindex[69] = '#424C26 ';
	colorindex[70] = '#7FFF00 ';
	colorindex[71] = '#BFFF7F ';
	colorindex[72] = '#66CC00 ';
	colorindex[73] = '#99CC66 ';
	colorindex[74] = '#4C9800 ';
	colorindex[75] = '#72984C ';
	colorindex[76] = '#3F7F00 ';
	colorindex[77] = '#5F7F3F ';
	colorindex[78] = '#264C00 ';
	colorindex[79] = '#394C26 ';
	colorindex[80] = '#3FFF00 ';
	colorindex[81] = '#9FFF7F ';
	colorindex[82] = '#33CC00 ';
	colorindex[83] = '#7FCC66 ';
	colorindex[84] = '#269800 ';
	colorindex[85] = '#5F984C ';
	colorindex[86] = '#1F7F00 ';
	colorindex[87] = '#4F7F3F ';
	colorindex[88] = '#134C00 ';
	colorindex[89] = '#2F4C26 ';
	colorindex[90] = '#00FF00 ';
	colorindex[91] = '#7FFF7F ';
	colorindex[92] = '#00CC00 ';
	colorindex[93] = '#66CC66 ';
	colorindex[94] = '#009800 ';
	colorindex[95] = '#4C984C ';
	colorindex[96] = '#007F00 ';
	colorindex[97] = '#3F7F3F ';
	colorindex[98] = '#004C00 ';
	colorindex[99] = '#264C26 ';
	colorindex[100] = '#00FF3F ';
	colorindex[101] = '#7FFF9F ';
	colorindex[102] = '#00CC33 ';
	colorindex[103] = '#66CC7F ';
	colorindex[104] = '#009826 ';
	colorindex[105] = '#4C985F ';
	colorindex[106] = '#007F1F ';
	colorindex[107] = '#3F7F4F ';
	colorindex[108] = '#004C13 ';
	colorindex[109] = '#264C2F ';
	colorindex[110] = '#00FF7F ';
	colorindex[111] = '#7FFFBF ';
	colorindex[112] = '#00CC66 ';
	colorindex[113] = '#66CC99 ';
	colorindex[114] = '#00984C ';
	colorindex[115] = '#4C9872 ';
	colorindex[116] = '#007F3F ';
	colorindex[117] = '#3F7F5F ';
	colorindex[118] = '#004C26 ';
	colorindex[119] = '#264C39 ';
	colorindex[120] = '#00FFBF ';
	colorindex[121] = '#7FFFDF ';
	colorindex[122] = '#00CC99 ';
	colorindex[123] = '#66CCB2 ';
	colorindex[124] = '#009872 ';
	colorindex[125] = '#4C9885 ';
	colorindex[126] = '#007F5F ';
	colorindex[127] = '#3F7F6F ';
	colorindex[128] = '#004C39 ';
	colorindex[129] = '#264C42 ';
	colorindex[130] = '#0019FF ';
	colorindex[131] = '#7FFFFF ';
	colorindex[132] = '#00CCCC ';
	colorindex[133] = '#66CCCC ';
	colorindex[134] = '#009898 ';
	colorindex[135] = '#4C9898 ';
	colorindex[136] = '#007F7F ';
	colorindex[137] = '#3F7F7F ';
	colorindex[138] = '#004C4C ';
	colorindex[139] = '#264C4C ';
	colorindex[140] = '#00BFFF ';
	colorindex[141] = '#7FDFFF ';
	colorindex[142] = '#0099CC ';
	colorindex[143] = '#66B2CC ';
	colorindex[144] = '#007298 ';
	colorindex[145] = '#4C8598 ';
	colorindex[146] = '#005F7F ';
	colorindex[147] = '#3F0B7F ';
	colorindex[148] = '#00394C ';
	colorindex[149] = '#26424C ';
	colorindex[150] = '#007FFF ';
	colorindex[151] = '#7FBFFF ';
	colorindex[152] = '#0066CC ';
	colorindex[153] = '#6699CC ';
	colorindex[154] = '#004C98 ';
	colorindex[155] = '#4C7298 ';
	colorindex[156] = '#003F7F ';
	colorindex[157] = '#3F5F7F ';
	colorindex[158] = '#00264C ';
	colorindex[159] = '#26394C ';
	colorindex[160] = '#003FFF ';
	colorindex[161] = '#7F9FFF ';
	colorindex[162] = '#0033CC ';
	colorindex[163] = '#667FCC ';
	colorindex[164] = '#002698 ';
	colorindex[165] = '#4C5F98 ';
	colorindex[166] = '#001F7F ';
	colorindex[167] = '#3F4F7F ';
	colorindex[168] = '#00134C ';
	colorindex[169] = '#262F4C ';
	colorindex[170] = '#0000FF ';
	colorindex[171] = '#7F7FFF ';
	colorindex[172] = '#0000CC ';
	colorindex[173] = '#6666CC ';
	colorindex[174] = '#000098 ';
	colorindex[175] = '#4C4C98 ';
	colorindex[176] = '#00007F ';
	colorindex[177] = '#3F3F7F ';
	colorindex[178] = '#00004C ';
	colorindex[179] = '#26264C ';
	colorindex[180] = '#3F00FF ';
	colorindex[181] = '#9F7FFF ';
	colorindex[182] = '#3300CC ';
	colorindex[183] = '#7F66CC ';
	colorindex[184] = '#260098 ';
	colorindex[185] = '#5F4C98 ';
	colorindex[186] = '#1F007F ';
	colorindex[187] = '#4F3F7F ';
	colorindex[188] = '#13004C ';
	colorindex[189] = '#131758 ';
	colorindex[190] = '#7F00FF ';
	colorindex[191] = '#BF7FFF ';
	colorindex[192] = '#6600CC ';
	colorindex[193] = '#9966CC ';
	colorindex[194] = '#4C0098 ';
	colorindex[195] = '#724C98 ';
	colorindex[196] = '#3F007F ';
	colorindex[197] = '#5F3F7F ';
	colorindex[198] = '#26004C ';
	colorindex[199] = '#39264C ';
	colorindex[200] = '#BF00FF ';
	colorindex[201] = '#DF7FFF ';
	colorindex[202] = '#9900CC ';
	colorindex[203] = '#B266CC ';
	colorindex[204] = '#720098 ';
	colorindex[205] = '#854C98 ';
	colorindex[206] = '#5F007F ';
	colorindex[207] = '#6F3F7F ';
	colorindex[208] = '#39004C ';
	colorindex[209] = '#42264C ';
	colorindex[210] = '#9B00FF ';
	colorindex[211] = '#9B7FFF ';
	colorindex[212] = '#CC00CC ';
	colorindex[213] = '#CC66CC ';
	colorindex[214] = '#980098 ';
	colorindex[215] = '#984C98 ';
	colorindex[216] = '#7F007F ';
	colorindex[217] = '#7F3F7F ';
	colorindex[218] = '#4C004C ';
	colorindex[219] = '#4C264C ';
	colorindex[220] = '#FF00BF ';
	colorindex[221] = '#FF7FDF ';
	colorindex[222] = '#CC0099 ';
	colorindex[223] = '#CC66B2 ';
	colorindex[224] = '#980072 ';
	colorindex[225] = '#984C85 ';
	colorindex[226] = '#7F005F ';
	colorindex[227] = '#7F28DB ';
	colorindex[228] = '#4C0039 ';
	colorindex[229] = '#4C2642 ';
	colorindex[230] = '#FF007F ';
	colorindex[231] = '#FF7FBF ';
	colorindex[232] = '#CC0066 ';
	colorindex[233] = '#CC6699 ';
	colorindex[234] = '#98004C ';
	colorindex[235] = '#984C72 ';
	colorindex[236] = '#7F003F ';
	colorindex[237] = '#7F3F5F ';
	colorindex[238] = '#4C0026 ';
	colorindex[239] = '#4C2639 ';
	colorindex[240] = '#FF003F ';
	colorindex[241] = '#FF7F9F ';
	colorindex[242] = '#CC0033 ';
	colorindex[243] = '#CC667F ';
	colorindex[244] = '#980026 ';
	colorindex[245] = '#984C5F ';
	colorindex[246] = '#7F001F ';
	colorindex[247] = '#7F3F4F ';
	colorindex[248] = '#4C0013 ';
	colorindex[249] = '#4C262F ';
	colorindex[250] = '#333333 ';
	colorindex[251] = '#5F5B5B ';
	colorindex[252] = '#848484 ';
	colorindex[253] = '#ADADAD ';
	colorindex[254] = '#D6D6D6 ';
	colorindex[255] = '#FFFFFF ';
	var sonuc = colorindex[index]
	if (sonuc == undefined) {
		sonuc = ""
	}
	return sonuc;
}

function convertColor24ToHex(color24) {
	// Onaltılık değere çevirin
	let hexColor = parseInt(color24).toString(16);

	// 6 haneli bir hex değeri almak için sıfır ekleyin
	while (hexColor.length < 6) {
		hexColor = '0' + hexColor;
	}

	// Renk kodunu # ile birlikte döndürün
	return '#' + hexColor.toUpperCase();
}
function getEdge(dizi) {
	let sonuc = [];
	let geciciDizi = [];

	dizi.forEach((eleman) => {
		if (eleman === '72') {
			if (geciciDizi.length > 0) {
				sonuc.push(geciciDizi);
			}
			geciciDizi = ['72'];
		} else {
			geciciDizi.push(eleman);
		}
	});
	// Son grubu da sonuca ekleyelim
	if (geciciDizi.length > 0) {
		sonuc.push(geciciDizi);
	}
	return sonuc;
}
function boundaryPathGET(boundaryPathArrayDXF) {
	let edgeType
	let boundaryPath = { groups: [] }
	if ((boundaryPathArrayDXF[0]) == 92) {			// 		

		boundaryPath.BoundaryPathTypeFlag = parseInt(boundaryPathArrayDXF[1]);
		if ((boundaryPathArrayDXF[2]) == 93) {
			//boundaryPathArrayDXF.path=boundaryPathArrayDXF.path.slice(4)
			const kenarlar = getEdge(boundaryPathArrayDXF.slice(4));
			kenarlar.forEach((kenar, k) => {
				edgeType = parseInt(kenar[3])
				boundaryPath.groups.push(getBoundary(kenar))
			})
		}
		else if (((boundaryPathArrayDXF[2]) == 72)) {
			edgeType = parseInt(boundaryPathArrayDXF[3])
			//boundaryPathArrayDXF.unshift(edgeType)
			//boundaryPathArrayDXF.unshift(72)			 
			boundaryPath.groups.push(getBoundary(boundaryPathArrayDXF.slice(2)))
		}
	} else {
		console.error("HAtalı boundary flag", boundaryPathArrayDXF)
		boundaryPath = "none"
	}
	return boundaryPath


}

function getBoundary(kenar) {
 	let group = {}
	let knots = []
	let points = []
	let fits = []
	let edgeType
	edgeType = parseInt(kenar[1])

	kenar.forEach((kod, k) => {
		if (kenar[0] == 72) {
			//console.log("Kenar dizisi 72 kodu   .", kenar)

			edgeType = parseInt(kenar[1])
			switch (edgeType) {
				case (0)://   Polyline      
					group.edgeType = "Polyline"
					if (kod == 73) {
						group.IsClosedFlag = parseInt(kenar[k + 1])
					}
					if (kod == 93) {
						group.NumberOfPolylineVertices = parseInt(kenar[k + 1])
					}
					if (kod == 10 && parseInt(kenar[k + 2]) == 20) {
						points.push(parseFloat(kenar[k + 1]))
						points.push(parseFloat(kenar[k + 3]))
						if (parseFloat(kenar[k + 4]) === 42) {
							group.bulge = true
							points.push(parseFloat(kenar[k + 15]))
						}
					}
					if (k === kenar.length - 1) {
						group.points = points
					}
					break;
				case (1)://    line		
					group.edgeType = "Line"
					let bulgeFlag = false
					let indes42 = kenar.indexOf('42')
					if (indes42 >= -1) {
						if (parseFloat(kenar[indes42 - 2]) === 20) {
							bulgeFlag = true
						}
					}
					if (kod == 73) {
						group.IsClosedFlag = parseInt(kenar[k + 1])
					}
					if (kod == 93) {
						group.NumberOfPolylineVertices = parseInt(kenar[k + 1])
					}
					if (bulgeFlag === true) {
						if ((kod) == 10) {
							points.push(parseFloat(kenar[k + 1]))
						}
						if ((kod) == 20) {
							points.push(parseFloat(kenar[k + 1]))
						}
						if ((kod) == 42) {
							points.push(parseFloat(kenar[k + 1]))
							group.bulge = true
						}
						if (k === kenar.length - 1) {
							group.points = points
						}

					} else {

						if ((kod) == "10") {
							group.x1 = parseFloat(kenar[k + 1])
						}
						if ((kod) == "20") {
							group.y1 = parseFloat(kenar[k + 1])
						}
						if ((kod) == "11") {
							group.x2 = parseFloat(kenar[k + 1])
						}
						if ((kod) == "21") {
							group.y2 = (parseFloat(kenar[k + 1]))
						}
					}
					break;
				case (2): //   CircularArc
					group.edgeType = "CircularArc"

					if ((kod) == 10) {
						group.x = parseFloat(kenar[k + 1])
					}
					if ((kod) == 20) {
						group.y = parseFloat(kenar[k + 1])
					}
					if ((kod) == 40) {
						group.radius = parseFloat(kenar[k + 1])
					}
					if ((kod) == 50) {
						group.StartAngle = parseFloat(kenar[k + 1])
					}
					if ((kod) == 51) {
						group.EndAngle = parseFloat(kenar[k + 1])
					}
					if ((kod) == 73) {
						group.IsCounterclockwiseFlag = parseFloat(kenar[k + 1])
					}
					break;
				case (3)://EllipticArc
					group.edgeType = "EllipticArc"
					if (kod == 10) {
						group.x = parseFloat(kenar[k + 1])
					}
					if (kod == 20) {
						group.y = parseFloat(kenar[k + 1])
					}
					if (kod == 11) {
						group.EndPointX = parseFloat(kenar[k + 1])
					}
					if (kod == 21) {
						group.EndPointY = parseFloat(kenar[k + 1])
					}
					if (kod == 40) {
						group.ratioOfMinor = parseFloat(kenar[k + 1])
					}
					if (kod == 50) {
						group.StartAngle = parseFloat(kenar[k + 1])
					}
					if (kod == 51) {
						group.EndAngle = parseFloat(kenar[k + 1])
					}
					if (kod == 73) {
						group.IsCounterclockwiseFlag = parseFloat(kenar[k + 1])
					}
					break;
				case (4):    //Spline
					group.edgeType = "Spline"
					if (kod == 94) {
						group.Degree = parseFloat(kenar[k + 1])
					}
					if (kod == 73) {
						group.rational = parseFloat(kenar[k + 1])
					}
					if (kod == 74) {
						group.preiodic = parseFloat(kenar[k + 1])
					}
					if (kod == 95) {
						group.numberOfKnots = parseFloat(kenar[k + 1])
					}
					if (kod == 96) {
						group.numberOfControlPoints = parseFloat(kenar[k + 1])
					}
					if (kod == 40) {
						knots.push(parseFloat(kenar[k + 1]))
					}
					if (kod == 10 && (kenar[k + 2]) == 20) {
						points.push(parseFloat(kenar[k + 1]))
						points.push(parseFloat(kenar[k + 3]))
					}

					if (kod == 11) {
						fits.push(parseFloat(kenar[k + 1]))
						fits.push(parseFloat(kenar[k + 3]))
					}
					if (k === kenar.length - 1) {
						group.knots = knots
						group.points = points
						group.fits = fits
					}
					break;
			}
		} else {
			console.error("Kenar dizisi 72 kodu ile başlamıyor.", kenar)
		}
	})

	return group

}

function extractBoundaryPaths(varlikdizi, NumberOfBoundaryPaths) {
	let boundaryPaths = [];
	if (NumberOfBoundaryPaths === 1) {
		boundaryPaths = [varlikdizi]
	} else {
		let count = NumberOfBoundaryPaths
		let c1 = 0
		while (count != 0) {
			let currentBoundaryPath = [];
			while (c1 < varlikdizi.length && varlikdizi[c1] !== '97') {
				currentBoundaryPath.push(varlikdizi[c1])
				c1++
			}
			const referenceCount = parseInt(varlikdizi[c1 + 1]);
			c1 += 2 + (2 * referenceCount);
			boundaryPaths.push(currentBoundaryPath)
			currentBoundaryPath = []
			count--
		}
	}
	return boundaryPaths;
}


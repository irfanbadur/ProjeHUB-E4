// src/utils/sembolSvg.js

import React from "react";

  const Priz = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <path
    d="M 23.5,14 A 14,14 0 0,0 51.5,14 "
    stroke={color}   
    strokeWidth="2"    
  />    
    <line x1="23.5" y1="28" x2="51.5" y2="28" stroke={color} strokeWidth="2" />
    <line x1="37.5" y1="28" x2="37.5" y2="68" stroke={color} strokeWidth="2" />

 

  </svg>
  );
  const EtanjPriz = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <path
    d="M 23.5,14 A 14,14 0 0,0 51.5,14 "
    stroke={color}   
    strokeWidth="2"    
  />    
    <path
    d="M 37.5,28 A 14,14 0 0,0 51.5,14 L 37.5 14 Z "
    stroke={color}   
    fill={color}   
    strokeWidth="2"    
  />    
    <line x1="23.5" y1="28" x2="51.5" y2="28" stroke={color} strokeWidth="2" />
    <line x1="37.5" y1="28" x2="37.5" y2="68" stroke={color} strokeWidth="2" />

 

  </svg>
);
  const TriFazPriz = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <path
       d="M 23.5,14 A 14,14 0 0,0 51.5,14 "
    stroke={color}   
    strokeWidth="2"    
  />    
     
     <line x1="23.5" y1="28" x2="51.5" y2="28" stroke={color} strokeWidth="2" />
    <line x1="37.5" y1="28" x2="37.5" y2="68" stroke={color} strokeWidth="2" />
    <text x="47.5" y="5" textAnchor="middle" fontSize="16" 
    fill={color}  
    fontFamily="Arial"
    rotate={90}
    >
    3
    </text>
 

  </svg>
);
  const Priz_2x300W = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <Priz  color={color}  />     
    <text x="50" y="12" textAnchor="middle" fontSize="16" 
    fill={color}  
    fontFamily="Arial">2</text>
  </svg>
);
  const Priz_3x300W = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <Priz  color={color}  />     
    <text x="50" y="12" textAnchor="middle" fontSize="16" 

    fill={color}  
    fontFamily="Arial">3</text>
  </svg>
);
  const Priz_4x300W = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <Priz  color={color}  />     
    <text x="50" y="12" textAnchor="middle" fontSize="16" 

    fill={color}  
    fontFamily="Arial">4</text>
  </svg>
);
  const Priz_5x300W = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <Priz  color={color}  />     
    <text x="50" y="12" textAnchor="middle" fontSize="16" 

    fill={color}  
    fontFamily="Arial">5</text>
  </svg>
);
  const Priz_6x300W = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <Priz  color={color}  />     
    <text x="50" y="12" textAnchor="middle" fontSize="16" 

    fill={color}  
    fontFamily="Arial">6</text>
  </svg>
);
  const Komb_Kutu_1Faz = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <Priz  color={color}  />     
    <rect x="13.5" y="0" width="48" height="70" stroke={color} strokeWidth="2" fill="none" />

  </svg>
);
  const Komb_Kutu_3Faz = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <Priz  color={color}  />     
    <rect x="13.5" y="0" width="48" height="70" stroke={color} strokeWidth="2" fill="none" />
    <line x1="30" y1="55" x2="46" y2="55" stroke={color} strokeWidth="2" />
    <line x1="30" y1="50" x2="46" y2="50" stroke={color} strokeWidth="2" />
    <line x1="30" y1="45" x2="46" y2="45" stroke={color} strokeWidth="2" />

  </svg>
);
  const Avize = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <circle cx="37.5" cy="30" r="18" stroke={color} strokeWidth="1" fill="none" />
    <circle cx="37.5" cy="30" r="14" stroke={color} strokeWidth="1" fill="none" />
    <line x1="50.2279" y1="16.22" x2="24.7721" y2="43.78" stroke={color} strokeWidth="1" />
    <line x1="50.2279" y1="43.78" x2="24.7721" y2="16.22" stroke={color} strokeWidth="1" />

        {/* Dinamik Metinler */}
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>

  </svg>
);
  const CircleLamp = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <circle cx="37.5" cy="30" r="18" stroke={color} strokeWidth="1" fill="none" />
    <line x1="50.2279" y1="16.22" x2="24.7721" y2="43.78" stroke={color} strokeWidth="1" />
    <line x1="50.2279" y1="43.78" x2="24.7721" y2="16.22" stroke={color} strokeWidth="1" />

        {/* Dinamik Metinler */}
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>

 
  </svg>
);
  const YuvarlakLedPanel = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <circle cx="37.5" cy="30" r="20" stroke={color} strokeWidth="1" fill="none" />
    <circle cx="37.5" cy="30" r="15" stroke={color} strokeWidth="1" fill="none" />
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const YuvarlakEtanjLedPanel = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <circle cx="37.5" cy="30" r="20" stroke={color} strokeWidth="1" fill="none" />
    <circle cx="37.5" cy="30" r="15" stroke={color} strokeWidth="1" fill="none" />
    <path
    d="M 26.93,40.64 A 15,15 0 0,0 48.06,19.35 L 37.5,30 Z"
    fill={color}      
  />
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const HavuzArmatur = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <circle cx="37.5" cy="30" r="18" stroke={color} strokeWidth="1" fill="none" />
    <circle cx="37.5" cy="30" r="8" stroke={color} strokeWidth="1" fill="none" />
    <path
    d="M 40.32,12.22 A 18,18 0 0,1 34.67,47.77 L 37.5,30 Z"
    fill={color}      
  />
    <path
    d="M 36.24,37.9 A 8,8 0 0,1 38.75,22.09 L 37.5,30 Z"
    fill={color}      
  />
    {/* Dinamik Metinler */}
    <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const TabloArmatur = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <polyline  points="2,39 0,39 0,30 75 30 75 39 72 39" stroke={color} stroke-width="1"   />
    <rect x="2" y="35.5" width="71" height="7" stroke={color} strokeWidth="1" fill="none" />

    <path
    d="M 31.5,30 A 5,5 0 0,1 42.5,30 L 37.5,30 Z"
    fill="none" 
    stroke={color}     
  />
     
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>

 
  </svg>
);
  const YuksekTavanArmatur = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
     
    <rect x="0" y="20" width="75" height="20" stroke={color} strokeWidth="1" fill="none" />
    <rect x="7" y="20" width="61" height="20" stroke={color} strokeWidth="1" fill="none" />
    <rect x="12.5" y="25" width="51" height="10" stroke={color} strokeWidth="1" fill="none" />
    <line x1="12.5" y1="30" x2="63.5" y2="30" stroke={color} strokeWidth="1" />

     
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const SquareLamp = ({ text1, text2,color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <rect x="15" y="2" width="50" height="50" stroke={color} strokeWidth="1" fill="none" />
    <rect x="20" y="7" width="40" height="40" stroke={color} strokeWidth="1" fill="none" />
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
const Aplik = ({ text1, text2,color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="30" r="12" stroke={color} strokeWidth="1" fill="none" />
  <line x1="41.85" y1="18.81" x2="33.14" y2="41.18" stroke={color} strokeWidth="1" />
  <line x1="27.5" y1="47" x2="47.5" y2="47" stroke={color} strokeWidth="1" />
  <line x1="37.5" y1="42" x2="37.5" y2="52" stroke={color} strokeWidth="1" />

        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
</svg>
);
  const FluorescentLamp = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <rect x="5" y="30" width="65" height="12" stroke={color} strokeWidth="1" fill="none" />
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const AsmaFloresan = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <rect x="12.5" y="10" width="50" height="40" stroke={color} strokeWidth="1" fill="none" />
    <rect x="16.5" y="14" width="42" height="5" stroke={color} strokeWidth="1" fill="none" />
    <rect x="16.5" y="23" width="42" height="5" stroke={color} strokeWidth="1" fill="none" />
    <rect x="16.5" y="32" width="42" height="5" stroke={color} strokeWidth="1" fill="none" />
    <rect x="16.5" y="41" width="42" height="5" stroke={color} strokeWidth="1" fill="none" />
   
    {/* Dinamik Metinler */}
    <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const AsmaEtanjFloresan = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <rect x="12.5" y="10" width="50" height="40" stroke={color} strokeWidth="1" fill="none" />
    <rect x="16.5" y="14" width="42" height="5" stroke={color} strokeWidth="1" fill="none" />
    <rect x="16.5" y="23" width="42" height="5" stroke={color} strokeWidth="1" fill="none" />
    <rect x="16.5" y="32" width="42" height="5" stroke={color} strokeWidth="1" fill="none" />
    <rect x="16.5" y="41" width="42" height="5" stroke={color} strokeWidth="1" fill="none" />
    <rect x="37.5" y="14" width="21" height="5" stroke={color} strokeWidth="1" fill={color} />
    <rect x="37.5" y="23" width="21" height="5" stroke={color} strokeWidth="1" fill={color} />
    <rect x="37.5" y="32" width="21" height="5" stroke={color} strokeWidth="1" fill={color} />
    <rect x="37.5" y="41" width="21" height="5" stroke={color} strokeWidth="1" fill={color} />
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const AsmaKareLedPanel = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <rect x="7.5" y="10" width="60" height="60" stroke={color} strokeWidth="1" fill="none" />
    <rect x="12.5" y="15" width="25" height="25" stroke={color} strokeWidth="1" fill="none" />
    <rect x="37.5" y="15" width="25" height="25" stroke={color} strokeWidth="1" fill="none" />
    <rect x="12.5" y="40" width="25" height="25" stroke={color} strokeWidth="1" fill="none" />
    <rect x="37.5" y="40" width="25" height="25" stroke={color} strokeWidth="1" fill="none" />
    
    {/* Dinamik Metinler */}
    <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const AsmaEtanjKareLedPanel = ({ text1, text2, color }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <rect x="7.5" y="10" width="60" height="60" stroke={color} strokeWidth="1" fill="none" />
    <rect x="12.5" y="15" width="25" height="25" stroke={color} strokeWidth="1" fill={color} />
    <rect x="37.5" y="15" width="25" height="25" stroke={color} strokeWidth="1" fill="none" />
    <rect x="12.5" y="40" width="25" height="25" stroke={color} strokeWidth="1" fill="none" />
    <rect x="37.5" y="40" width="25" height="25" stroke={color} strokeWidth="1" fill={color} />
    
    {/* Dinamik Metinler */}
    <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
  const EtanjLamba = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <circle cx="37.5" cy="30" r="18" stroke={color} strokeWidth="1" fill="none" />
    <path
    d="M 50.2279,16.22 A 18,18 0 0,1 24.7721,43.78 L 37.5,30 Z"
    fill={color}      
  />
    <line x1="50.2279" y1="16.22" x2="24.7721" y2="43.78" stroke={color} strokeWidth="1" />

        {/* Dinamik Metinler */}
        <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text>
  </svg>
);
const CamasirMakinasi = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="20" stroke={color} strokeWidth="2" fill="none" />
  <circle cx="37.5" cy="37.5" r="10" stroke={color} strokeWidth="2" fill="none" />
  <rect x="12.5" y="12.5" width="50" height="50" stroke={color} strokeWidth="2" fill="none" />
</svg>
);
const BulasikMakinasi = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="20" stroke={color} strokeWidth="2" fill="none" />
  <circle cx="37.5" cy="37.5" r="10" stroke={color} strokeWidth="2" fill="none" />
  <rect x="12.5" y="12.5" width="50" height="50" stroke={color} strokeWidth="2" fill="none" />
  <line x1="12.5" y1="12.5" x2="23.3579" y2="23.3579" stroke={color} strokeWidth="2" />
  <line x1="51.6421" y1="23.3579" x2="62.5" y2="12.5" stroke={color} strokeWidth="2" />
  <line x1="51.6421" y1="51.6421" x2="62.5" y2="62.5" stroke={color} strokeWidth="2" />
  <line x1="12.5" y1="62.5" x2="23.3579" y2="51.6421" stroke={color} strokeWidth="2" />
</svg>
);
const Firin = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="20" r="5"   strokeWidth="2" fill={color} />
  <rect x="12.5" y="12.5" width="50" height="50" stroke={color} strokeWidth="2" fill="none" />
  <line x1="12.5" y1="27.5" x2="62.5" y2="27.55" stroke={color} strokeWidth="2" />
</svg>
);
const AnaDagPano = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <rect x="0" y="20" width="75" height="25" stroke={color} strokeWidth="2" fill="none" />
  <path d="M 0,20 L 75,45 L 75,20 L 0,45 Z" fill={color} stroke={color}/>

</svg>
);
const TaliPano = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <rect x="5" y="25" width="65" height="30" stroke={color} strokeWidth="2" fill="none" />
  <path d="M 5,25 L 70,55 L 5,55 Z" fill={color} stroke={color}/>

</svg>
);
const Kofre = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
    <path
    d="M 5,37.5 
    L 20,37.5 
    L 30,25 
    L 30,50 
    L 20,37.5 
    L 30,25 
    L 50,50 
    L 50,25 
    L 30,50 
    L 50,50 
    L 50,37.5 
    L 65,37.5 
    L 50,37.5 
    L 50,25 
    L 30,25 
    "
    fill="none"  stroke={color}    
  />
{/*     <line x1="50.2279" y1="16.22" x2="24.7721" y2="43.78" stroke={color} strokeWidth="1" />
      <text x="37.5" y="63" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text1}
    </text>
    <text x="37.5" y="75" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
      {text2}
    </text> */}
  </svg>
);
const Klima = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="42.5" r="5"   strokeWidth="2" fill={color} />
   <rect x="12.5" y="12.5" width="50" height="50" stroke={color} strokeWidth="2" fill="none" />
  <line x1="12.5" y1="27.5" x2="62.5" y2="27.5" stroke={color} strokeWidth="2" />
   

</svg>
);
const Ocak = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="27.2244" cy="43.4326" r="5"   strokeWidth="2" fill={color} />
  <circle cx="47.7756" cy="43.4326" r="5"   strokeWidth="2" fill={color} />
  <circle cx="37.5" cy="25.6347" r="5"   strokeWidth="2" fill={color} />
   <rect x="12.5" y="12.5" width="50" height="50" stroke={color} strokeWidth="2" fill="none" />
</svg>
);
const Motor = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="20" stroke={color} strokeWidth="2" fill="none" />
  <rect x="12.5" y="12.5" width="50" height="50" stroke={color} strokeWidth="2" fill="none" />
  <text x="37" y="45" textAnchor="middle" fontSize="22" fill={color}  fontFamily="Arial">
      M    </text>
  </svg>
);
const Generator = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="20" stroke={color} strokeWidth="2" fill="none" />
  <rect x="12.5" y="12.5" width="50" height="50" stroke={color} strokeWidth="2" fill="none" />
  <text x="37" y="45" textAnchor="middle" fontSize="22" fill={color}  fontFamily="Arial">
  G    </text>
  </svg>
);
 
const Fan = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="20" stroke={color} strokeWidth="2" fill="none" />
  <rect x="12.5" y="12.5" width="50" height="50" stroke={color} strokeWidth="2" fill="none" />
  <text x="37" y="45" textAnchor="middle" fontSize="22" fill={color}  fontFamily="Arial">
  Fan
  </text>
  </svg> 
  
);
const Interkon = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <rect x="10" y="27.5" width="60" height="20" stroke={color} strokeWidth="2" fill="none" />
  <text x="38" y="45" textAnchor="middle" fontSize="13" fill={color}  fontFamily="Arial">
  İnterkom
  </text>
  </svg> 
  
);
const ZilTrafo = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="42.5" cy="37.5" r="10" stroke={color} strokeWidth="1" fill="none" />
  <circle cx="32.5" cy="37.5" r="10" stroke={color} strokeWidth="1" fill="none" />

  </svg> 
  
);
const Buton = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="37.5" cy="37.5" r="4" stroke={color} strokeWidth="1" fill={color}  />
  <rect x="30" y="30" width="15" height="15" stroke={color} strokeWidth="1" fill="none" />
 
  </svg> 
  
);
const ButonGrup = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <circle cx="57.5" cy="22.5" r="3" stroke={color} strokeWidth="1" fill={color} />
  <circle cx="57.5" cy="32.5" r="3" stroke={color} strokeWidth="1" fill={color} />
  <circle cx="57.5" cy="42.5" r="3" stroke={color} strokeWidth="1" fill={color} />
  <circle cx="57.5" cy="52.5" r="3" stroke={color} strokeWidth="1" fill={color} />
  <rect x="12.5" y="17.5" width="50" height="10" stroke={color} strokeWidth="1" fill="none" />
  <rect x="12.5" y="27.5" width="50" height="10" stroke={color} strokeWidth="1" fill="none" />
  <rect x="12.5" y="37.5" width="50" height="10" stroke={color} strokeWidth="1" fill="none" />
  <rect x="12.5" y="47.5" width="50" height="10" stroke={color} strokeWidth="1" fill="none" />
  <line x1="52.5" y1="17.5" x2="52.5" y2="57.5" stroke={color} strokeWidth="2" />

  </svg> 
  
);
const KapiOtomatik = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
  <text x="33" y="42" textAnchor="middle" fontSize="14" fill={color}  fontFamily="Arial">
  K.O.
  </text>
  <path d="M 45,27.5 L 60,47.5 L 45,47.5 L 45,27.5 L 15,27.5 L 15,47.5 L 45,47.5 Z"  fill="none" stroke={color}/>

  </svg> 
  
);
const Zil = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">

  <path
    d="M 20,28 A 14,14 0 0,0 55,28 "
    stroke={color}   
    strokeWidth="2"    
  />    
    <line x1="20" y1="28" x2="55" y2="28" stroke={color} strokeWidth="2" />
    <line x1="26" y1="35" x2="49" y2="35" stroke={color} strokeWidth="2" />
  </svg> 
  
);
const YanginİhbarSantrali = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
   <rect x="10" y="20" width="55" height="35" stroke={color} strokeWidth="2" fill="none" />
  <text x="39" y="45" textAnchor="middle" fontSize="20" fill={color}  fontFamily="Arial">
  Y.İ.S.
  </text>
  </svg> 
  
);
const Supply = ({ text1, text2, color }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="75" height="75" viewBox="0 0 75 75">
   <rect x="0" y="20" width="75" height="35" stroke={color} strokeWidth="2" fill="none" />
  <text x="39" y="45" textAnchor="middle" fontSize="20" fill={color}  fontFamily="Arial">
  {text1}
  </text>
  </svg> 
  
);



export const formIcons = {
    "Lamba": CircleLamp,
    "Yuvarlak Led Panel": CircleLamp, // Örneğin aynı sembolü kullanıyorsa
    "KareLedPanel": SquareLamp,
    "ÇubukFloüresan": FluorescentLamp,
    "Avize": Avize,
    "EtanjLamba": EtanjLamba,
    "Aplik":Aplik,
    "AsmaFloresan":AsmaFloresan,
    "AsmaEtanjFloresan":AsmaEtanjFloresan,
    "AsmaKareLedPanel":AsmaKareLedPanel,
    "AsmaEtanjKareLedPanel":AsmaEtanjKareLedPanel,
    "YuvarlakLedPanel":YuvarlakLedPanel,
    "YuvarlakEtanjLedPanel":YuvarlakEtanjLedPanel,
    "HavuzArmatur":HavuzArmatur,
    "TabloArmatur":TabloArmatur,
    "YuksekTavanArmatur":YuksekTavanArmatur,
    //------------THE PLUGS-----------------------

    "Priz":Priz,
    "Etanj Priz":EtanjPriz,
    "TriFazPriz":TriFazPriz,
    "Priz_2x300W":Priz_2x300W,
    "Priz_3x300W":Priz_3x300W,
    "Priz_4x300W":Priz_4x300W,
    "Priz_5x300W":Priz_5x300W,
    "Priz_6x300W":Priz_6x300W,
    "Komb_Kutu_1Faz":Komb_Kutu_1Faz,
    "Komb_Kutu_3Faz":Komb_Kutu_3Faz,
    //------------THE MACHINES-----------------------
    "Çamaşır Makinası":CamasirMakinasi,
    "Bulaşık Makinası":BulasikMakinasi,
    "Fırın":Firin, 
    "Klima":Klima,
    "Ocak":Ocak,
    "Motor":Motor,
    "Generator":Generator,
    "Fan":Fan,
    //------------THE PANELS-----------------------

    "AnaDağıtımPanosu":AnaDagPano,
    "TaliPano":TaliPano,
    "Şebeke":Supply,
    "Kofre":Kofre,
    //------------THE LOW CURRENT -----------------------

    "İnterkon":Interkon,
    "Zil Trafosu":ZilTrafo,
    "Kapı otomatiği":KapiOtomatik,
    "Buton":Buton,
    "Buton Grup":ButonGrup,
    "Zil":Zil,
    "Yangın İhbar Santrali":YanginİhbarSantrali,
  };
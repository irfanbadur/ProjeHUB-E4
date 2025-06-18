// utils/icons.js

export const getIcon = (name, size = 100) => {
    const commonProps = {
      xmlns: "http://www.w3.org/2000/svg",
      width: size,
      height: size,
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      viewBox:`0 0 100 100`
    };
 
    switch (name) {
      case "moves":
        return (
          <svg {...commonProps}>
{/*             <path d="M50,10 L60,20 L55,20 L55,45 L80,45 L80,40 L90,50 L80,60 L80,55 L55,55 L55,80 L60,80 L50,90 L40,80 L45,80 L45,55 L20,55 L20,60 L10,50 L20,40 L20,45 L45,45 L45,20 L40,20 Z"></path> */}
<path fill="currentColor" d="M22.017 12.008L18.019 8.01l-.002 2.993h-5.001v-4.99l2.993.002l-4.002-4.002l-3.998 3.998l2.994.001v4.991h-5L6.002 8.01l-3.998 3.998l4.002 4.002l-.002-2.993h4.999v4.993l-2.994.001l3.998 3.999l4.002-4.002l-2.993.001v-4.992h5l-.001 2.993z"/>
            
          </svg>
        );
        
      case "move":
        return (
         
          <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><path stroke="#888" d="M22.017 12.008L18.019 8.01l-.002 2.993h-5.001v-4.99l2.993.002l-4.002-4.002l-3.998 3.998l2.994.001v4.991h-5L6.002 8.01l-3.998 3.998l4.002 4.002l-.002-2.993h4.999v4.993l-2.994.001l3.998 3.999l4.002-4.002l-2.993.001v-4.992h5l-.001 2.993z"/></svg>
        );
      case "rotate":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><g fill="none" stroke="#888"  strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"><path d="M19.95 11a8 8 0 1 0-.5 4m.5 5v-5h-5"/><path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0-2 0"/></g></svg>
        );
      case "trim":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 512 512"><path fill="#888"   d="M103.48 224a71.64 71.64 0 0 0 44.76-15.66l41.5 16.89l6.82-12.63a39 39 0 0 1 4.32-6.37l14.22-14.42l-41.17-24.94A72 72 0 1 0 103.48 224m0-112a40 40 0 1 1-40 40a40 40 0 0 1 40-40"/><path  fill="#888"  d="m480 169l-5.52-12.58c-4.48-10.42-14.74-16-32.78-17.85c-10.12-1-26.95-1.24-49.69 3.81c-20 4.45-122.14 28.2-164.95 58.62c-20.25 14.39-24.06 33.67-27.06 49.16c-2.78 14.14-5 25.31-18 35c-15 11.14-27.27 16.38-33.58 18.6a71.74 71.74 0 1 0 24.79 38Zm-224.52 87a16 16 0 1 1 16-16a16 16 0 0 1-16 16m-152 144a40 40 0 1 1 40-40a40 40 0 0 1-40 40"/><path  fill="#888"  d="m343.79 259.87l-83.74 48.18l27.63 13.08l3.62 1.74C310 331.92 359.74 356 410.53 359c3.89.23 7.47.34 10.78.34C442 359.31 453 354 459.75 350L480 336Z"/></svg>
        );
      case "mirror":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path stroke="#888" fill="#3472ff" d="M13 2v20h-2V2zM9 4.64V18.5H1.3zm6 0l7.7 13.86H15z"/></svg>
        );
      case "erase":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 20 20"><path fill="#ff0000" d="M11.197 2.44a1.5 1.5 0 0 1 2.121 0l4.243 4.242a1.5 1.5 0 0 1 0 2.121L9.364 17H14.5a.5.5 0 1 1 0 1H7.82a1.5 1.5 0 0 1-1.14-.437L2.437 13.32a1.5 1.5 0 0 1 0-2.121zM9.781 15.168l-4.95-4.95l-1.687 1.687a.5.5 0 0 0 0 .707l4.243 4.243a.5.5 0 0 0 .707 0z"/></svg>
        );
      case "copy":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><g stroke="#888" fill="none"  strokeWidth="2"><path d="M14 7c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C12.398 4 11.932 4 11 4H8c-1.886 0-2.828 0-3.414.586S4 6.114 4 8v3c0 .932 0 1.398.152 1.765a2 2 0 0 0 1.083 1.083C5.602 14 6.068 14 7 14"/><rect width="10" height="10" x="10" y="10" rx="2"/></g></svg>  
        );
      case "fillet":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 24 24"><g fill="none" stroke="#888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M2 20v-4C2 8.268 8.268 2 16 2h4m.839 18.84h-3.536m3.536 0v-3.536m0 3.535L18 18"/><path strokeDasharray="2 3" d="m9 9l7 7"/></g></svg>   
        );
      case "scale":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 48 48"><g fill="none" stroke="#888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4"><path d="M30 6H42V18"/><path d="M31 29L19 29L19 17"/><path d="M42 6L19 29"/><path d="M22 6H8C6.89543 6 6 6.89543 6 8V40C6 41.1046 6.89543 42 8 42H40C41.1046 42 42 41.1046 42 40V26"/></g></svg>   
        );
    
      case "ofset":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 100 100"><path fill="#888" d="m96 70.895l-8.267 8.267L74.571 66L66 74.571l13.162 13.162L70.895 96H96Z"  /><path fill="#888"   d="M48.813 4c-.166 13.107-2.064 24.688-8.276 33.084S23.647 51.357 4 52.588l.438 6.986c20.918-1.31 34.117-8.044 41.726-18.328s9.475-23.45 9.648-37.158ZM74.78 6.123c-.068 3.29-.221 6.565-.513 9.813l4.98.447c.305-3.393.461-6.782.531-10.156zm-1.058 14.664c-.442 3.219-1.043 6.405-1.85 9.526l4.84 1.251c.862-3.334 1.499-6.712 1.963-10.097zM70.51 34.95a64 64 0 0 1-3.686 8.881l4.457 2.264a69 69 0 0 0 3.977-9.574zm-6.024 13.072c-1.678 2.741-3.543 5.349-5.629 7.737l3.766 3.289c2.3-2.634 4.325-5.471 6.127-8.414ZM55.56 59.213a58 58 0 0 1-7.446 6.021l2.819 4.131a63 63 0 0 0 8.088-6.543zm-11.52 8.584a71 71 0 0 1-8.672 4.24l1.895 4.627a76 76 0 0 0 9.279-4.539zm-13.213 5.94a88 88 0 0 1-9.361 2.605l1.078 4.883a93 93 0 0 0 9.895-2.756zM16.68 77.272c-3.208.541-6.443.926-9.694 1.168l.371 4.987c3.398-.254 6.788-.657 10.155-1.225z" /></svg>
        );
      case "line":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
          <circle cx="6" cy="18" r="2" stroke="#3535FF" strokeWidth="2" fill="none"/>
          <circle cx="18" cy="6" r="2" stroke="#3535FF" strokeWidth="2" fill="none"/>
          <line x1="6" y1="18" x2="18" y2="6" stroke="#aaa" strokeWidth="1" />

          </svg>
        );
      case "line2":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path stroke="#888"    strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0M16 6a2 2 0 1 0 4 0a2 2 0 1 0-4 0M7.5 16.5l9-9"/></svg>
        );
      case "polyline":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100">
     {/*        <path fill="#888" d="M32.55 11C25.662 11 20 16.661 20 23.55c0 3.887 1.802 7.38 4.61 9.688L14.481 54.166a12 12 0 0 0-1.93-.166C5.66 54 0 59.661 0 66.55S5.661 79.1 12.55 79.1c6.652 0 12.106-5.288 12.48-11.852a3.5 3.5 0 0 0 .07-.697a3.5 3.5 0 0 0-.07-.697c-.196-3.441-1.797-6.522-4.225-8.684L31.049 36c.494.06.993.1 1.502.1c4.613 0 8.647-2.546 10.812-6.295l17.807 4.707c.934 5.845 5.95 10.384 12.002 10.568l7.006 21.356C77.052 68.726 75 72.412 75 76.55c0 6.89 5.661 12.55 12.55 12.55c6.652 0 12.106-5.288 12.48-11.852a3.5 3.5 0 0 0 .07-.697a3.5 3.5 0 0 0-.07-.697C99.655 69.29 94.201 64 87.55 64c-.266 0-.527.022-.79.04l-6.805-20.743c3.451-2.09 5.832-5.797 6.074-10.049a3.5 3.5 0 0 0 .07-.697a3.5 3.5 0 0 0-.07-.697C85.656 25.29 80.202 20 73.551 20c-5.1 0-9.519 3.106-11.475 7.512l-17.02-4.5l-.027-.158C44.656 16.29 39.202 11 32.551 11m0 7c3.107 0 5.55 2.444 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55S27 26.657 27 23.55S29.444 18 32.55 18m41 9c3.107 0 5.55 2.444 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55S68 35.657 68 32.55S70.444 27 73.55 27m-61 34c3.107 0 5.55 2.444 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55S7 69.657 7 66.55S9.444 61 12.55 61m75 10c3.107 0 5.55 2.444 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55S82 79.657 82 76.55S84.444 71 87.55 71" color="currentColor"/> */}
     <path fill="none" stroke="#888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M10 90 L40 20 L80 20 L80 90"  />
   
    <circle cx="10" cy="90" r="10" stroke="#3535FF" strokeWidth="4" fill="none"/>
    <circle cx="40" cy="20" r="10" stroke="#3535FF" strokeWidth="4" fill="none"/>
    <circle cx="80" cy="20" r="10" stroke="#3535FF" strokeWidth="4" fill="none"/>
    <circle cx="80" cy="90" r="10" stroke="#3535FF" strokeWidth="4" fill="none"/>
          </svg>
        );
      case "circle":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
          <circle cx="18" cy="6" r="2" stroke="#3535FF" strokeWidth="2" fill="none"/>
          <path fill="none" stroke="#888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 4.252A8.01 8.01 0 0 1 19.748 10M10 4.252A8.01 8.01 0 0 0 4.252 10m0 4A8.01 8.01 0 0 0 10 19.748m4 0A8.01 8.01 0 0 0 19.748 14m-9.455-8.293C10.586 6 11.057 6 12 6s1.414 0 1.707-.293m-3.414 0C10 5.414 10 4.943 10 4s0-1.414.293-1.707m0 3.414q0 0 0 0m3.414 0C14 5.414 14 4.943 14 4s0-1.414-.293-1.707m0 3.414q0 0 0 0m0-3.414C13.414 2 12.943 2 12 2s-1.414 0-1.707.293m3.414 0q0 0 0 0m-3.414 0q0 0 0 0m0 19.414C10.586 22 11.057 22 12 22s1.414 0 1.707-.293m-3.414 0C10 21.414 10 20.943 10 20s0-1.414.293-1.707m0 3.414q0 0 0 0m3.414 0C14 21.414 14 20.943 14 20s0-1.414-.293-1.707m0 3.414q0 0 0 0m0-3.414C13.414 18 12.943 18 12 18s-1.414 0-1.707.293m3.414 0q0 0 0 0m-3.414 0q0 0 0 0m8-8C18 10.586 18 11.057 18 12s0 1.414.293 1.707m0-3.414C18.586 10 19.057 10 20 10s1.414 0 1.707.293m-3.414 0q0 0 0 0m0 3.414C18.586 14 19.057 14 20 14s1.414 0 1.707-.293m-3.414 0q0 0 0 0m3.414 0C22 13.414 22 12.943 22 12s0-1.414-.293-1.707m0 3.414q0 0 0 0m0-3.414q0 0 0 0m-19.414 0C2 10.586 2 11.057 2 12s0 1.414.293 1.707m0-3.414C2.586 10 3.057 10 4 10s1.414 0 1.707.293m-3.414 0q0 0 0 0m0 3.414C2.586 14 3.057 14 4 14s1.414 0 1.707-.293m-3.414 0q0 0 0 0m3.414 0C6 13.414 6 12.943 6 12s0-1.414-.293-1.707m0 3.414q0 0 0 0m0-3.414q0 0 0 0" color="currentColor"/></svg>
        );
 
      case "arc":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><g fill="none" stroke="#888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path d="M22 16c0-5.523-4.477-10-10-10S2 10.477 2 16"/><path fill="currentColor" d="M2 17a1 1 0 1 0 0-2a1 1 0 0 0 0 2m20 0a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/></g></svg>
        );
      case "rect":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100"><path fill="#888" d="M12.55 15C5.662 15 0 20.661 0 27.55c0 6.017 4.317 11.096 10 12.286v20.428c-5.683 1.19-10 6.27-10 12.287C0 79.44 5.661 85.1 12.55 85.1c6.047 0 11.09-4.374 12.241-10.1h50.455c1.152 5.732 6.253 10.1 12.305 10.1c6.65 0 12.105-5.288 12.478-11.852a3.5 3.5 0 0 0 .07-.697a3.5 3.5 0 0 0-.07-.697C99.703 66.117 95.495 61.356 90 60.246V39.854c5.495-1.11 9.703-5.87 10.03-11.606a3.5 3.5 0 0 0 .07-.697a3.5 3.5 0 0 0-.07-.697C99.655 20.29 94.201 15 87.55 15c-6.016 0-11.096 4.317-12.286 10H24.77c-1.19-5.676-6.209-10-12.22-10m0 7c3.107 0 5.55 2.444 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55S7 30.657 7 27.55S9.444 22 12.55 22m75 0c3.107 0 5.55 2.444 5.55 5.55c0 3.107-2.443 5.55-5.55 5.55S82 30.657 82 27.55S84.444 22 87.55 22M24.218 32h51.62A12.68 12.68 0 0 0 83 39.225v21.65A12.68 12.68 0 0 0 75.875 68h-51.7A12.64 12.64 0 0 0 17 60.838V39.262A12.64 12.64 0 0 0 24.217 32M12.55 67c3.106 0 5.549 2.444 5.549 5.55c0 3.107-2.443 5.55-5.55 5.55S7 75.657 7 72.55S9.444 67 12.55 67m75 0c3.106 0 5.549 2.444 5.549 5.55c0 3.107-2.443 5.55-5.55 5.55S82 75.657 82 72.55S84.444 67 87.55 67" color="currentColor"/></svg>
        );
      case "spline":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 15 15"><path fill="none" stroke="#888" d="M2.5 1.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0Zm0 0h2a3 3 0 0 1 3 3v6a3 3 0 0 0 3 3h2m0 0a1 1 0 1 0 2 0a1 1 0 0 0-2 0Z" strokeWidth="1"/></svg>
        );
      case "ellipse":
        return (
          <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><g fill="none" stroke="#888" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"><path fill="currentColor" d="M12 3a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/><path d="M12 22c4.418 0 8-4.477 8-10S16.418 2 12 2S4 6.477 4 12s3.582 10 8 10"/><path fill="currentColor" d="M12 23a1 1 0 1 0 0-2a1 1 0 0 0 0 2"/></g></svg>
        );
      case "text":
        return (
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 512 512"><path fill="currentColor" d="m292.6 407.78l-120-320a22 22 0 0 0-41.2 0l-120 320a22 22 0 0 0 41.2 15.44l36.16-96.42a2 2 0 0 1 1.87-1.3h122.74a2 2 0 0 1 1.87 1.3l36.16 96.42a22 22 0 0 0 41.2-15.44m-185.84-129l43.37-115.65a2 2 0 0 1 3.74 0l43.37 115.67a2 2 0 0 1-1.87 2.7h-86.74a2 2 0 0 1-1.87-2.7ZM400.77 169.5c-41.72-.3-79.08 23.87-95 61.4a22 22 0 0 0 40.5 17.2c8.88-20.89 29.77-34.44 53.32-34.6c32.32-.22 58.41 26.5 58.41 58.85a1.5 1.5 0 0 1-1.45 1.5c-21.92.61-47.92 2.07-71.12 4.8c-54.75 6.44-87.43 36.29-87.43 79.85c0 23.19 8.76 44 24.67 58.68C337.6 430.93 358 438.5 380 438.5c31 0 57.69-8 77.94-23.22h.06a22 22 0 1 0 44 .19v-143c0-56.18-45-102.56-101.23-102.97M380 394.5c-17.53 0-38-9.43-38-36c0-10.67 3.83-18.14 12.43-24.23c8.37-5.93 21.2-10.16 36.14-11.92c21.12-2.49 44.82-3.86 65.14-4.47a2 2 0 0 1 2 2.1C455 370.1 429.46 394.5 380 394.5"/></svg>        );
      case "mtext":
        return (
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9a3 3 0 1 0 6 0a3 3 0 0 0-6 0M4 12V7a3 3 0 1 1 6 0v5M4 9h6m10-3v6M4 16h12M4 20h6m4 0l2 2l5-5"/></svg>);      // Diğer ikonlar eklenebilir
      case "font":
        return (
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="currentColor" d="M5 4h14v4h-1.5C17 6 17 5 15 5h-5v7h3c1 0 2-.5 2-2h1v5h-1c0-1.5-1-2-2-2h-3v4.5c0 2.5 3.5 2.5 3.5 2.5v1H5v-1c2-.5 2-1.5 2-2.5v-10c0-1 0-2-2-2.5z"/></svg>
);      // Diğer ikonlar eklenebilir
      case "fontSize":
        return (
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="currentColor" d="m22 6l-3-4l-3 4h2v4h-2l3 4l3-4h-2V6zM9.307 4l-6 16h2.137l1.875-5h6.363l1.875 5h2.137l-6-16zm-1.239 9L10.5 6.515L12.932 13z"/></svg>
);      // Diğer ikonlar eklenebilir
      case "bold":
        return (
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 16 16"><path fill="currentColor" d="M4 2h4.5a3.501 3.501 0 0 1 2.852 5.53A3.499 3.499 0 0 1 9.5 14H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1m1 7v3h4.5a1.5 1.5 0 0 0 0-3Zm3.5-2a1.5 1.5 0 0 0 0-3H5v3Z"/></svg>
);      // Diğer ikonlar eklenebilir
      case "italic":
        return (
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="M13.34 10c-.918 2.734-2.34 7-2.34 7m3.21-10h-.01"/></svg>
);      // Diğer ikonlar eklenebilir
      case "alignment":
        return (
<svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 9a3 3 0 1 0 6 0a3 3 0 0 0-6 0M4 12V7a3 3 0 1 1 6 0v5M4 9h6m10-3v6M4 16h12M4 20h6m4 0l2 2l5-5"/></svg>
);      // Diğer ikonlar eklenebilir
      default:
        return null; // Belirtilmeyen ikon ismi için null döner
    }
  };
  
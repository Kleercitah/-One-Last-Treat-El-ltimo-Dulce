// Original inline vector placeholders. No downloads, external fonts or raster dependencies.
export function symbolSvg(id) {
  const shapes = {
    moon: '<path d="M19 3A11 11 0 1 0 28 20 10 10 0 0 1 19 3Z"/>',
    leaf: '<path d="M26 4C8 4 3 10 6 22c8 6 19 0 20-18Z"/><path d="m5 29 15-17" fill="none" stroke="currentColor" stroke-width="2"/>',
    star: '<path d="m16 2 4 9 10 1-8 7 3 10-9-5-9 5 3-10-8-7 10-1Z"/>',
  };
  return `<svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">${shapes[id]}</svg>`;
}

export const porchArt = `<svg viewBox="0 0 720 238" aria-hidden="true" class="porch-art">
  <rect width="720" height="238" fill="#242e39"/><path d="M0 18H720M0 57H720M0 92H720M0 127H720M0 162H720M0 197H720" stroke="#67706b" opacity=".2"/>
  <path d="M0 12 720 0V28L0 36Z" fill="#51484b"/><path d="m86 32 13 36-9 24 18 16m508-81-17 30 9 24-13 28" stroke="#111c27" fill="none" stroke-width="3"/>
  <g class="breathing-windows"><rect x="26" y="65" width="100" height="113" fill="#3d4655"/><rect x="590" y="65" width="102" height="113" fill="#3d4655"/></g>
  <path d="M24 63h104v118H24Zm564 0h106v118H588Z" fill="none" stroke="#786c64" stroke-width="6"/>
  <path d="M77 65v113m-51-57h99m516-56v113m-49-57h100" stroke="#222a38" stroke-width="5"/>
  <path d="m19 84 113 42-5 14L14 98m573 56 112-63 7 12-112 63" fill="#695a50"/>
  <rect x="150" y="36" width="420" height="33" rx="3" fill="#71634f"/><text x="360" y="57" text-anchor="middle" fill="#e3d1a8" font-size="13" font-family="Georgia,serif">Cae la hoja · Despierta la luna · Guía la estrella</text>
  <path d="M137 30q220 65 444 0" fill="none" stroke="#84664f" stroke-width="2"/>
  <path d="m169 41 8 17 8-14m61 10 8 17 8-15m202 2 8 17 8-18m58-7 8 17 8-20" fill="#8e674e"/>
  <path d="M0 211H720V238H0" fill="#4b4140"/><path d="M0 220H720M0 233H720" stroke="#756254"/>
  <g class="rocking-chair" fill="none" stroke="#aa8c6a" stroke-width="5"><path d="m34 213q33 13 70-2M48 205l8-65m0 0h31v42H52m7-36 2 30m12-30 1 30m9 7 11 23M47 186h43"/></g>
  <path d="m648 211 12-22 22 3 8 21Z" fill="#785345"/><path d="m661 191 5-8" stroke="#78784f" stroke-width="4"/>
  <path d="m2 38 20 5-12 15m-8-20 7 35m-7-35 35 15m653-18 11 10 17-13m-28 3 17 29m-17-29 31 11" stroke="#b2b3a2" opacity=".35" fill="none"/>
</svg>`;

export function photoSvg(year, index) {
  const decorations = [
    '<path d="M0 25H180M10 0V100M160 0V100" stroke="#797366" stroke-width="8"/><rect x="22" y="40" width="40" height="40" fill="#696351"/>',
    '<path d="M0 15q90 40 180 0" fill="none" stroke="#c3b58e"/><path d="m25 22 9 16 10-10m20 3 9 16 10-13m38-6 9 17 10-21" fill="#b3a27d"/>',
    '<path d="m3 85 25-61 27 61Z" fill="#626759"/><path d="M0 13H180" stroke="#aaa17f"/><path d="M10 13v8m25-8v8m25-8v8m25-8v8m25-8v8m25-8v8m25-8v8" stroke="#e0c18b" stroke-width="3"/>',
  ][index];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="240" viewBox="0 0 180 120">
    <rect width="180" height="120" fill="#d8c39b"/><rect x="6" y="6" width="168" height="98" fill="#4e5351"/>${decorations}
    <g fill="#a58e72"><circle cx="40" cy="69" r="7"/><path d="m30 96 5-19h10l6 19Z"/><circle cx="66" cy="73" r="6"/><path d="m58 96 3-16h10l5 16Z"/></g>
    <g fill="#252a30"><path d="m113 41-9 43-3 17h8l8-31 4 31h8l-4-28-3-32Z"/><path d="m111 46-14 25 4 3 15-21m9-8 13 25-4 3-14-23"/><rect x="109" y="17" width="17" height="17"/><rect x="103" y="31" width="29" height="4"/></g>
    <ellipse cx="118" cy="40" rx="8" ry="9" fill="#d3c2a0"/><path d="M113 42q5 6 10 0" stroke="#f5ead4" stroke-width="2" fill="none"/><path d="m114 51 4 10 4-10" fill="#dfd4bc"/><path d="m113 53 5 2 5-2v5l-5-3-5 3Z" fill="#171e26"/>
    <path d="m96 70 6 1-1 7-6-1m38-5 6-2 2 7-6 2" fill="#f0e4c9"/>
    <path d="m7 7 32 2m121 91 12-22M13 95l5-28" stroke="#d4c8a6" opacity=".45"/>
    <rect x="6" y="104" width="168" height="13" fill="#d8c39b"/><text x="90" y="114" text-anchor="middle" fill="#443d39" font-size="10" font-family="Georgia,serif">Halloween · ${year}</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

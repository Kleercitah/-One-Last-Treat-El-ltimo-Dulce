// Original vector placeholders, shared between the panel and credits; no remote assets.
export function hostSvg(monster = false) {
  return `<svg viewBox="0 0 220 280" role="img" aria-label="Señor Sonrisas, alto, con traje morado a rayas, sombrero de copa y bastón">
  <ellipse cx="114" cy="266" rx="80" ry="10" fill="#12121d"/>
  <g transform="${monster ? 'translate(6 -10) skewX(-5)' : ''}">
  <path d="M91 171 L82 259 L98 260 L111 196 L122 260 L139 260 L130 168" fill="#292436"/>
  <path d="M83 91 L137 90 L150 192 L123 182 L109 145 L98 182 L69 191Z" fill="#4e355e" stroke="#997480"/>
  <path d="M90 100L81 175 M99 106L92 160 M125 100L138 178 M133 102L144 177" stroke="#967084" stroke-width="2"/>
  <path d="M98 94L122 94L119 145L107 153L100 143" fill="#b99854"/><path d="M95 94L108 111L93 119 M124 94L111 111L130 120" fill="#241d31"/>
  <path d="M82 99L${monster ? '32 213' : '58 169'} M138 100L${monster ? '185 211' : '159 165'}" stroke="#56395e" stroke-width="14"/>
  <ellipse cx="${monster ? 32 : 58}" cy="${monster ? 213 : 170}" rx="8" ry="11" fill="#e8dfcb"/><ellipse cx="${monster ? 185 : 159}" cy="${monster ? 211 : 168}" rx="8" ry="11" fill="#e8dfcb"/>
  <path d="M165 155Q176 143 181 159L175 263" fill="none" stroke="#cfad68" stroke-width="5"/>
  <g transform="rotate(${monster ? 24 : -5} 110 83)"><ellipse cx="110" cy="68" rx="24" ry="31" fill="#e2d9b9"/>
  <path d="M${monster ? 86 : 95} 73Q110 ${monster ? 113 : 93} ${monster ? 136 : 126} 72Q110 89 95 73" fill="#352335"/>
  <path d="M96 76Q110 85 126 75" stroke="#fff0d2" stroke-width="4" fill="none"/>
  <circle cx="100" cy="63" r="3" fill="#ffdf83"/><circle cx="120" cy="63" r="3" fill="#ffdf83"/>
  <path d="M79 45H142V51H79Z M91 10H131V46H91Z" fill="#191922"/><path d="M92 35H130" stroke="#ac8651" stroke-width="6"/></g>
  <path d="M108 96L95 90V101Z M112 96L125 89V102Z" fill="#e2b766"/></g></svg>`;
}
export const manorSvg = `<svg viewBox="0 0 700 210" role="img" aria-label="Mansión victoriana torcida, ventanas doradas y puerta demasiado alta">
<rect width="700" height="210" fill="#18232f"/><path d="M115 188L128 66L257 57L277 17L311 57L573 73L590 190" fill="#544159" stroke="#b28d78" stroke-width="3"/>
<path d="M95 72L158 14L258 48L276 3L317 49L546 24L605 81" fill="#30273d" stroke="#ad8370" stroke-width="3"/>
<g fill="#ffdf8c" stroke="#b09063" stroke-width="5"><path d="M152 88H205V147H152Z M226 92H264V151H226Z M430 83H472V150H430Z M500 88H550V155H500Z"/></g>
<path d="M306 188V79Q350 25 393 80V188Z" fill="#171523"/>
<g class="manor-guest"><path d="M333 120H367L375 188H325Z" fill="#63456e"/><path d="M345 120H357V162H345Z" fill="#d3ac61"/><ellipse cx="350" cy="99" rx="13" ry="20" fill="#e7dbbb"/><path d="M339 104Q350 120 362 103" fill="#322338"/><path d="M329 80H372V85H329Z M338 59H363V81H338Z" fill="#0a0b12"/></g>
<g class="manor-door"><path d="M306 188V79Q350 25 393 80V188Z" fill="#261e30" stroke="#d3a969" stroke-width="5"/><circle cx="382" cy="135" r="3" fill="#ffe1a0"/></g>
<path d="M140 72Q350 125 558 79" fill="none" stroke="#c8a274" stroke-width="2"/>
<g fill="#ad6858"><path d="M170 79L184 103L197 86 M225 90L235 111L251 93 M439 94L450 116L467 91 M500 87L514 110L525 82"/></g>
<g fill="#d08840"><ellipse cx="269" cy="176" rx="23" ry="20"/><ellipse cx="427" cy="176" rx="23" ry="20"/></g>
<g fill="#2a2431"><path d="M254 178Q269 197 284 177 M412 177Q427 196 442 178"/></g>
<path d="M285 195H415" stroke="#bb9270" stroke-width="12"/><text x="350" y="203" text-anchor="middle" fill="#f6dbab" font-size="9">LA FIESTA NO TERMINA SI NADIE SE VA</text></svg>`;

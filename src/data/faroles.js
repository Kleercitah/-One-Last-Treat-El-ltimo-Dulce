export const lanterns = [
  { id: 'moon', name: 'Luna', key: '1', x: -76 },
  { id: 'leaf', name: 'Hoja', key: '2', x: 0 },
  { id: 'star', name: 'Estrella', key: '3', x: 76 },
];
export const lanternOrder = ['leaf', 'moon', 'star'];
export const lanternRiddle = 'Primero cae la hoja. Después despierta la luna. Solo entonces la estrella guía el regreso.';
export const hostRules = [
  'Las luces encendidas de los porches dibujan un límite que el anfitrión no puede cruzar para entrar en las casas.',
  'El Señor Sonrisas ofrece el Caramelo de Oro para conseguir invitados permanentes. Solo puede reclamar a quien lo acepte voluntariamente.',
  'No acepten su último dulce, aunque lo presente como un premio.',
  'Cuando las luces se apagan, las calles dejan de ser seguras. No se separen.',
  'Si un niño toca y dice «Dulce o truco», el anfitrión debe responder. Puede elegir truco. Ese instante puede dar tiempo para escapar.',
];
export const farolesDialogues = {
  locked: [{ speaker: 'Allen', text: 'Antes de entrar aquí, terminemos la visita a Carmesí y salgamos juntos de su porche.' }],
  intro: [
    { speaker: 'Allen', text: 'Esta casa lleva años cerrada. Mira las guirnaldas… y esa mecedora.' },
    { speaker: 'Riliane', text: 'Será el viento. Aunque… aquí no se mueve ni una hoja. Quédate a mi lado.' },
    { speaker: 'Allen', text: 'Hay tres faroles y algo tallado en el dintel. Quizá podamos iluminar el porche sin entrar.' },
    { speaker: 'Riliane', text: 'Me parece una idea excelente. Las princesas también saben cuándo no abrir una puerta.' },
    { speaker: 'Allen', text: 'Voy a copiar la inscripción. Los símbolos de los faroles coinciden con los del relieve.' },
  ],
  photos: [
    { speaker: 'Allen', text: '1912, 1956, 1998… Han cambiado las casas y los disfraces. Ese hombre no.' },
    { speaker: 'Riliane', text: 'Podría ser su abuelo. O… no. Hasta la sonrisa es la misma.' },
    { speaker: 'Allen', text: 'Debajo pone «Nuestro anfitrión: el Señor Sonrisas». Tiene el mismo sombrero y los mismos guantes en todas.' },
    { speaker: 'Riliane', text: 'El del concurso… Allen, ya no quiero ese premio. ¿Podemos irnos?' },
    { speaker: 'Allen', text: 'Sí. Pero primero leamos la hoja que está junto al álbum. Puede decirnos por dónde volver.' },
  ],
  rules: [
    { speaker: 'Riliane', text: '«Invitados permanentes»… No suena a una fiesta que se termine. Yo solo quería ganar un caramelo.' },
    { speaker: 'Allen', text: 'Todavía no lo has aceptado. Mira: la luz de los porches le impide entrar. No estamos indefensos.' },
    { speaker: 'Riliane', text: 'Y si alguien llama con «Dulce o truco», tiene que responder. Eso sí me lo voy a aprender.' },
    { speaker: 'Allen', text: 'Hay un plano del paso lateral hacia nuestro portón. Lo guardaré. La última casa queda al otro extremo; vayamos juntos y sin aceptar nada.' },
    { speaker: 'Riliane', text: 'Juntos. Y esta vez, si dices que nos vayamos, te haré caso.' },
  ],
};
export const farolesClues = {
  inscription: { id: 'faroles-inscription', house: 'Faroles', title: 'El dintel de los tres faroles', text: `El relieve muestra una hoja caída, una luna sobre ella y una estrella al final del camino. La nota dice: «${lanternRiddle}». En el porche, los faroles están colocados Luna, Hoja, Estrella. Hay que seguir la historia, no su posición.` },
  solved: { id: 'faroles-solved', house: 'Faroles', title: 'Una luz tras otra', text: 'Encendimos Hoja, Luna y Estrella, en ese orden. Los tres faroles quedaron encendidos y un cajón bajo la repisa cedió. Dentro había un álbum y una hoja doblada. La mecedora seguía moviéndose sin nadie sentado.' },
  photos: { id: 'faroles-photos', house: 'Faroles', title: 'El mismo anfitrión', text: 'En fotografías de 1912, 1956 y 1998 aparece el mismo hombre alto, vestido de gala, con sombrero de copa, guantes blancos y una sonrisa fija. No parece envejecer. El álbum lo llama «el Señor Sonrisas». Riliane ya no quiere el Caramelo de Oro.' },
  rules: { id: 'faroles-rules', house: 'Faroles', title: 'Las reglas del anfitrión', text: hostRules.join(' ') },
  map: { id: 'faroles-map', house: 'Faroles', title: 'El plano del paso lateral', text: 'El plano señala un acceso lateral desde Faroles hacia el portón de nuestra casa. Lo he copiado para poder reconocerlo después. Aún no hemos recorrido ese paso. Sabemos cómo protegernos de la oferta del anfitrión; la siguiente parada es la Última Casa.' },
};

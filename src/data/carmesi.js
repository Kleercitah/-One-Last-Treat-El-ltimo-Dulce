export const carmesiDialogues = {
  lockedMagnolia: [{ speaker: 'Allen', text: 'Esa cortina se ha movido… Pero primero íbamos a casa de Magnolia. No cambiemos el recorrido todavía.' }],
  lockedBasilio: [{ speaker: 'Allen', text: 'Antes de seguir, terminemos la visita a Don Basilio. Quiero entender lo que pasa con sus muñecos.' }],
  intro: [
    { speaker: 'Riliane', text: '¡Dulce o truco, señorita Carmesí! ¿No va a abrirnos?' },
    { speaker: 'Señorita Carmesí', text: 'Desde aquí os oigo perfectamente. Las puertas abiertas dejan entrar más cosas que el frío.' },
    { speaker: 'Allen', text: 'Venimos de Magnolia y de Don Basilio. Uno de sus juguetes nos ha hablado.' },
    { speaker: 'Señorita Carmesí', text: 'Entonces recordad lo que han visto. Hay noches en que una promesa se disfraza de premio.' },
    { speaker: 'Riliane', text: 'Tengo buena memoria. Allen también. Puede preguntarnos.' },
    { speaker: 'Señorita Carmesí', text: 'Tres recuerdos, nada más. Si dudáis, consultad vuestro cuaderno. Lo escrito pesa más que un rumor.' },
  ],
  warning: [
    { speaker: 'Señorita Carmesí', text: 'Una tarjeta, un muñeco que cambia y un camino dibujado. Habéis prestado atención. Ahora escuchad bien.' },
    { speaker: 'Señorita Carmesí', text: 'Cuando él sonría, no le devuelvan la sonrisa' },
    { speaker: 'Riliane', text: '¿Él? ¿Habla de alguien del concurso?' },
    { speaker: 'Señorita Carmesí', text: 'No todas las sonrisas son una bienvenida. No confundáis la cortesía con una promesa.' },
    { speaker: 'Allen', text: 'Voy a escribir sus palabras exactas. No quiero acordarme a medias después.' },
    { speaker: 'Señorita Carmesí', text: 'Hacedlo. Y quedaos juntos cuando salgáis de mi porche.' },
    { speaker: 'Riliane', text: 'Ven, Allen. Caminemos juntos. Esta vez el premio puede esperar.' },
  ],
  outside: [
    { speaker: 'Allen', text: 'Riliane… se ha apagado la luz de Carmesí. Estaba encendida hace un momento.' },
    { speaker: 'Riliane', text: 'Y ha cerrado las cortinas. ¿Crees que nos está mirando todavía?' },
    { speaker: 'Allen', text: 'No lo sé. La calle parece distinta sin esa luz. Voy a apuntar dónde estábamos cuando se apagó.' },
  ],
  repeat: [
    { speaker: 'Señorita Carmesí', text: 'Ya os he dicho lo que podía. No necesitáis llamar otra vez para recordar mis palabras.' },
    { speaker: 'Allen', text: 'Las tengo guardadas. No le devolveremos la sonrisa.' },
  ],
};

export const carmesiQuestions = [
  {
    id: 'magnolia-card', text: '¿Qué os entregó Magnolia para hablaros del premio?',
    options: [{ id: 'invitation', label: 'Una invitación a tomar el té' }, { id: 'card', label: 'Una tarjeta del concurso del Caramelo de Oro' }, { id: 'watch', label: 'Un reloj de bolsillo' }],
    answer: 'card', hint: 'Allen: «Guardé la tarjeta junto a los dulces. Podemos leer la primera página del cuaderno».',
    reaction: 'Allen: «La tarjeta de Magnolia. La guardé para que no se perdiera».',
  },
  {
    id: 'basilio-doll', text: 'En el escaparate de Basilio, ¿qué muñeco cambió al apartar la mirada?',
    options: [{ id: 'knight', label: 'El caballero se volvió de espaldas' }, { id: 'princess', label: 'La princesa perdió la corona' }, { id: 'both', label: 'Los dos desaparecieron' }],
    answer: 'knight', hint: 'Allen: «La princesa seguía igual. Comparamos las caras con mi primera observación».',
    reaction: 'Allen: «El caballero. Antes nos miraba; después solo veíamos su espalda».',
  },
  {
    id: 'basilio-sketch', text: '¿Qué os dio Basilio para reconocer el camino de vuelta?',
    options: [{ id: 'key', label: 'La llave de un portón' }, { id: 'candle', label: 'Una vela roja' }, { id: 'lamps', label: 'Un dibujo de las farolas' }],
    answer: 'lamps', hint: 'Allen: «Está en la página del dibujo de las farolas. Aún no hemos recibido ninguna llave».',
    reaction: 'Allen: «El dibujo de las farolas. Nos ayudará a reconocer la calle».',
  },
];

export const carmesiClues = {
  warning: { id: 'carmesi-warning', house: 'Carmesí', title: 'La advertencia tras las cortinas', text: 'La señorita Carmesí nos hizo recordar la tarjeta de Magnolia, el caballero de Basilio y el dibujo de las farolas. Luego dijo: «Cuando él sonría, no le devuelvan la sonrisa». No explicó a quién se refería. Riliane dejó de bromear; me pidió que siguiéramos juntos.' },
  light: { id: 'carmesi-light', house: 'Carmesí', title: 'La primera luz apagada', text: 'La lámpara del porche de Carmesí se apagó al alejarnos de la puerta. Las cortinas rojas quedaron cerradas. Las luces de Magnolia y Basilio seguían encendidas. La calle parecía más fría. No sabemos por qué ocurrió.' },
};

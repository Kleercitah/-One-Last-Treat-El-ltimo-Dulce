const line = (speaker, text, hold = 0) => ({ speaker, text, hold });
const r = text => line('Riliane', text);
const a = text => line('Allen', text);
const h = (text, hold) => line('Señor Sonrisas', text, hold);
export const bellSymbols = ['Calabaza', 'Vela', 'Luna'];
export const bellOrder = ['Vela', 'Calabaza', 'Luna'];
export const bellHint = 'Primero, la vela guarda el umbral. Después, la calabaza recibe a los invitados. Al final, la luna despide la noche.';
export const finalLines = {
  arrival: [a('Riliane… ¿desde cuándo había una casa al final de esta calle?'), r('No lo sé… pero mira ese cartel. ¡Dice que hemos ganado!'), a('Hasta las ventanas parecen mirar hacia allí. No me gusta. Deberíamos volver.'), r('Solo vamos a mirar. Te lo prometo.')],
  welcome: [h('¡Maravilloso! ¡Mis últimos invitados han llegado!', 650), h('¡Riliane Lucifen! ¡Allen Avadonia! ¡Qué alegría verlos otra vez!'), a('¿Otra vez?'), h('¡Oh! ¡Los niños de hoy hacen preguntas encantadoras!'), r('¿Usted tiene el Caramelo de Oro?'), h('¡Naturalmente, princesa! ¡Y llevo toda la noche esperándote!')],
  choices: [
    [r('Es tan bonito… Solo quería ganar una vez.'), a('¡Espera! La nota de Faroles: aceptar es quedarse. Todavía no lo has cogido.'), r('Está bien. No lo quiero. Suelta mi manga… No, mejor no la sueltes.')],
    [r('Muchas gracias, señor. Pero mamá nos espera. No aceptamos.'), h('¡Qué educación tan exquisita! ¿Ni siquiera una última función?')],
    [a('¿Cómo sabe nuestros nombres?'), h('¡Un buen anfitrión recuerda a sus invitados! Los aplausos, en cambio, nunca duran bastante.'), r('Pues nosotros no recordamos haber venido. Y no queremos el dulce.')],
  ],
  game: [h('¡Entonces juguemos por la salida! Tres campanas, tres pequeños recuerdos. El friso tiene la respuesta.'), a('La vela protege, la calabaza recibe y la luna despide. Podemos hacerlo juntos.')],
  betrayal: [h('¡Bravo! ¡Una actuación maravillosa!'), r('¡Ganamos! ¡Ahora déjenos salir!'), h('¿Salir?', 1600), h('Pero, querida… ¡la fiesta apenas comienza!', 900)],
  revelation: [h('¡Oh, pequeños! ¡Todavía no hemos terminado de jugar!'), r('Allen… No estoy temblando. Es el suelo.'), a('Mírame. La palanca de latón enciende el porche. Las luces le impiden cruzar.'), r('Tú abre el pestillo. Yo alcanzo la palanca.')],
  escape: [h('¡Ay, qué luces tan desagradables! ¡Arruinan toda la decoración!'), a('¡Abierto! A la izquierda. La calle se está doblando: sigue las flechas y busca los interruptores dorados.'), r('El premio puede quedárselo. Mi hermano viene conmigo.')],
  farewell: [h('¡Qué pena! Justo cuando empezábamos a divertirnos…', 600), h('Pero no se preocupen, pequeños.', 1000), h('Siempre queda el próximo Halloween.', 1200)],
  home: [line('Mamá', 'Vamos, pequeños. Es tarde. Ya terminó Halloween.'), r('Mamá… Yo…'), a('Ya estamos los dos. Eso es lo importante.'), r('Allen, la próxima vez tú eliges cuándo volvemos.'), a('La calle está quieta otra vez. No veo a nadie.')],
  candy: [r('Espera… Este caramelo no estaba en mi bolsa.'), a('No lo abras. Encontrarlo no significa que lo hayas aceptado.'), line('La nota', '«¡Gracias por jugar!»', 1200), h('¡Nos vemos el próximo año!', 1600)],
};
export const finalClues = [
  { id: 'host-bells', house: 'Última Casa', title: 'Las tres campanadas', text: `${bellHint} Ganamos su juego, pero no quería dejarnos salir. Riliane no aceptó el Caramelo de Oro.` },
  { id: 'host-light', house: 'Última Casa', title: 'Una salida entre los dos', text: 'Riliane encendió la luz; yo abrí el pestillo. El anfitrión retrocedió ante el umbral. El paso lateral de Faroles sigue siendo nuestro camino a casa.' },
  { id: 'home-together', house: 'Nuestra casa', title: 'Los dos de vuelta', text: 'Riliane volvió por mí. Encendimos nuestro porche. No aceptamos su último dulce. No necesitamos ganar ningún concurso.' },
];
export const credits = [
  ['Una historia de Halloween', 'Riliane Lucifen · Allen Avadonia'],
  ['Antagonista', 'El Señor Sonrisas'],
  ['Creado con', 'JavaScript · Phaser 3'],
  ['Arte y sonido de esta edición', 'Ilustraciones y síntesis originales del proyecto'],
  ['Gracias por jugar', 'Y por volver a casa juntos.'],
];

// The host folds the SAME street twice. Continuous coordinates, no teleports or hidden countdown.
export const CHASE = Object.freeze({ width: 7200, start: { x: 6910, y: 450 }, enemyStart: { x: 7170, y: 450 },
  speed: 143, nearSpeed: 132, recoverySpeed: 165, captureRadius: 24, stunSeconds: 4, recoverySeconds: 2,
  lightHold: 2, rescueHold: 1.4, rescueWindow: 10, homeHold: 0.65, home: { x: 140, y: 370 },
  porches: [{ x: 6480, y: 370, name: 'Faroles', gate: 6280 }, { x: 3650, y: 370, name: 'El porche de Carmesí', gate: 3450 }],
  fallAt: 1130, fallPosition: { x: 1190, y: 452 },
});
export const chaseObstacles = [
  { x: 5940, y: 340, width: 38, height: 112 }, { x: 5460, y: 440, width: 38, height: 110 },
  { x: 4970, y: 340, width: 38, height: 112 }, { x: 4460, y: 440, width: 38, height: 110 },
  { x: 3070, y: 340, width: 38, height: 112 }, { x: 2580, y: 440, width: 38, height: 110 },
  { x: 2080, y: 340, width: 38, height: 112 }, { x: 1600, y: 440, width: 38, height: 110 },
];

export const basilioDialogues = {
  locked: [
    { speaker: 'Allen', text: 'Podemos saludar al relojero después. Primero íbamos a casa de Magnolia, ¿recuerdas?' },
  ],
  intro: [
    { speaker: 'Riliane', text: '¡Dulce o truco, Don Basilio! ¿Ha oído hablar del Caramelo de Oro?' },
    { speaker: 'Don Basilio', text: 'Buenas noches. Hasta mis relojes oyen hablar de ese concurso. Yo fabrico premios que no se comen: mirad el escaparate.' },
    { speaker: 'Riliane', text: '¡Esa muñeca lleva mi corona! Aunque la mía es mucho más elegante.' },
    { speaker: 'Allen', text: 'Y el caballero tiene mi capa y mi espada de madera… ¿Cuándo nos vio para hacerlos?' },
    { speaker: 'Don Basilio', text: 'Un artesano se fija en los detalles. Observadlos bien; luego dense una vuelta y diganme si algo ha cambiado.' },
    { speaker: 'Allen', text: 'Los dibujaré de frente. Así podremos comparar cuando volvamos.' },
  ],
  changed: [
    { speaker: 'Allen', text: 'Espera… ha sonado el timbre del taller. No hemos tocado nada.' },
    { speaker: 'Riliane', text: 'Será uno de sus juguetes. Vamos a ver. Quédate conmigo, Allen.' },
  ],
  solved: [
    { speaker: 'Allen', text: 'El caballero. Antes nos miraba y ahora nos da la espalda. La princesa sigue igual. Lo tengo dibujado.' },
    { speaker: 'Riliane', text: 'Buen truco, Don Basilio. ¿Dónde está la cuerda?' },
    { speaker: 'Don Basilio', text: 'Ese caballero no tiene cuerda… Quizá quedó mal apoyado. Dejadlo ahí, por favor.' },
    { speaker: 'Muñeco', text: '«No acepten el último dulce».', },
    { speaker: 'Allen', text: 'Riliane, eso lo has oído tú también, ¿verdad? Voy a apuntarlo tal como lo ha dicho.' },
    { speaker: 'Riliane', text: 'Sí… lo he oído. No te separes. Podemos dejar el concurso si hace falta.' },
    { speaker: 'Don Basilio', text: 'Allen, lleva este dibujo de las farolas. Te ayudará a reconocer la calle al volver. Ya va siendo hora.' },
  ],
  repeat: [
    { speaker: 'Don Basilio', text: 'Conservad el dibujo, pequeños. Y no os entretengáis demasiado.' },
    { speaker: 'Allen', text: 'Está junto a mis apuntes de los muñecos. No me gusta que el caballero siga de espaldas.' },
  ],
};

export const basilioClues = {
  reference: { id: 'dolls-reference', house: 'Basilio', title: 'Antes de apartar la mirada', text: 'He dibujado dos muñecos mirándonos de frente: una princesa con corona amarilla a la izquierda y un caballero con capa y espada de madera a la derecha. Se parecen demasiado a nosotros.' },
  anomaly: { id: 'dolls-warning', house: 'Basilio', title: 'El caballero se ha girado', text: 'Al dar la espalda al escaparate sonó el timbre sin que lo tocáramos. Al volver, solo el caballero estaba de espaldas. Basilio dice que no tiene cuerda. Oímos al juguete susurrar: «No acepten el último dulce». Riliane también lo oyó.' },
  lamps: { id: 'lamps-sketch', house: 'Basilio', kind: 'lamps', title: 'El dibujo de las farolas', text: 'Don Basilio me regaló este dibujo para reconocer la calle al volver. He marcado las dos casas que ya visitamos. Lo guardaré junto a la tarjeta de Magnolia.' },
};

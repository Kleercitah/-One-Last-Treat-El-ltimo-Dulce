# Música del jugador

Coloca aquí tus canciones, con estos nombres exactos:

- musica1.mp3: menú, Magnolia y comienzo; bucle.
- musica2.mp3: después de Basilio, Carmesí y Faroles; bucle.
- musica3.mp3: aparición de la Última Casa, encuentro y persecución; bucle.

No hay canciones de sustitución. Si falta alguna, esa etapa permanece sin música; los efectos originales siguen funcionando. El manifiesto de Vite anuncia solamente archivos que existen para evitar peticiones 404. En desarrollo vuelve a cargar la página después de añadir archivos. Para distribución, vuelve a ejecutar `npm.cmd run build`.

La reproducción comienza tras una interacción. Puedes activar la música en el menú sin empezar la partida. Las canciones conservan su posición entre escenas y se funden al cambiar. La pausa detiene la reproducción; los silencios narrativos atenúan el volumen sin perder la posición. El volumen musical tiene su propio control en la pausa.

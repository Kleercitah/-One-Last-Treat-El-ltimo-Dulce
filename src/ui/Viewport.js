export async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (document.querySelector('#app').requestFullscreen) await document.querySelector('#app').requestFullscreen();
    else return false;
    return true;
  } catch { return false; }
}
export function installViewport(game) {
  const overlay = document.createElement('section'); overlay.id = 'rotate-screen'; overlay.hidden = true;
  overlay.innerHTML = '<span aria-hidden="true">☾</span><h2>Una noche juntos</h2><p>Gira tu teléfono para ver el camino completo.</p><small>Tu partida te espera.</small>';
  document.querySelector('#app').append(overlay);
  const resize = () => {
    const portrait = matchMedia('(pointer: coarse)').matches && innerHeight > innerWidth;
    overlay.hidden = !portrait;
    if (portrait) {
      const scene = game.scene.getScenes(true)[0]; scene?.pause?.();
      scene?.voice?.update(0, true); scene?.controls?.clear();
    }
    game.scale.refresh();
  };
  window.addEventListener('resize', resize); window.addEventListener('orientationchange', resize);
  game.events.once('ready', resize);
  game.events.once('destroy', () => { window.removeEventListener('resize', resize); window.removeEventListener('orientationchange', resize); overlay.remove(); });
}

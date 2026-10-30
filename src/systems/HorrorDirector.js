// Authored beats, once per run, never random. They cannot change progression or collision state.
export class HorrorDirector {
  constructor(scene) {
    this.scene=scene; this.seen=new Set(); this.history=[]; this.current=null; this.duck=1;
    this.shade=scene.add.rectangle(0,0,960,540,0x10121e).setOrigin(0).setScrollFactor(0).setDepth(6100).setAlpha(0);
    this.figure=scene.add.graphics().setDepth(400).setVisible(false);
    this.figure.fillStyle(0x171523,.95).fillRect(-14,-80,28,65).fillRect(-5,-18,10,18).fillEllipse(0,-94,28,38).fillRect(-24,-115,48,6).fillRect(-15,-146,30,33);
    this.figure.lineStyle(6,0x171523,.95).lineBetween(-17,-78,-30,-20).lineBetween(17,-78,35,-18);
    this.eyes=scene.add.graphics().setDepth(420).setVisible(false);
    this.eyes.fillStyle(0xe2d9bd).fillEllipse(-12,-9,7,10).fillEllipse(12,-9,7,10);
    this.eyes.lineStyle(3,0xe2d9bd).beginPath().arc(0,-5,24,0,Math.PI).strokePath();
    this.pumpkin=scene.add.graphics().setDepth(421).setVisible(false);
    this.pumpkin.fillStyle(0xd58a4c).fillRect(0,0,20,16);
    this.pumpkin.fillStyle(0x302232).fillTriangle(2,3,7,1,7,6).fillTriangle(13,1,18,3,13,6);
    this.pumpkin.lineStyle(2,0x302232).beginPath().arc(10,7,7,0,Math.PI).strokePath();
    this.overlay=document.createElement('div'); this.overlay.className='horror-glimpse'; this.overlay.hidden=true;
    this.overlay.innerHTML='<svg viewBox="0 0 160 100" aria-hidden="true"><ellipse cx="80" cy="50" rx="70" ry="47" fill="#171624"/><ellipse cx="52" cy="30" rx="5" ry="10" fill="#e8dbb7"/><ellipse cx="108" cy="30" rx="5" ry="10" fill="#e8dbb7"/><path d="M25 48Q80 110 135 48Q80 77 25 48" fill="#e8dbb7"/></svg>';
    this.overlay.innerHTML+='<svg class="shadow-glimpse" viewBox="0 0 100 220" aria-hidden="true"><path d="M25 0H70V38H90V45H5V38H25ZM33 49Q48 38 64 49L69 76L61 88L75 110L93 186L86 190L63 130L63 190L75 218H54L46 172L38 218H18L27 190L28 133L10 179L3 175L18 108L36 86L28 73Z" fill="#0a0b16"/><path d="M35 65Q48 83 61 63" fill="none" stroke="#d5c9ab" stroke-width="3"/></svg>';
    scene.ui.root.append(this.overlay);
  }
  trigger(id, x, y, { kind='figure', delay=1.2, duration=1.2, text='', important=false }={}) {
    if (this.seen.has(id) || this.current) return false;
    this.seen.add(id); this.current={id,x,y,kind,delay,duration,text,important,time:0,revealed:false}; this.history.push(id); return true;
  }
  clear() { this.current=null; this.figure.setVisible(false); this.eyes.setVisible(false); this.pumpkin.setVisible(false); this.overlay.hidden=true; this.shade.setAlpha(0); this.duck=1; }
  update(delta) {
    const s=this.scene;
    if (['pause','notebook','apparition'].includes(s.modal) || document.hidden) { this.clear(); return; }
    if (!this.current) {
      const f=s.progress.flags, x=s.player.x;
      if (!this.seen.has('window-visitor') && f.has('magnoliaVisited') && !f.has('basilioVisited') && x>510 && x<740 && !s.blocked) this.trigger('window-visitor',390+62,269,{kind:'figure',delay:.5,duration:1.3,text:'Allen: «Había alguien detrás del cristal. Magnolia estaba en la puerta…». '});
      else if (!this.seen.has('pumpkin-smile') && this.seen.has('window-visitor') && !f.has('basilioVisited') && x>630 && x<810 && !s.blocked) this.trigger('pumpkin-smile',458,318,{kind:'pumpkin',delay:1,duration:2,text:'Riliane: «Esa calabaza antes no… Nada. Vamos». '});
      else if (s.progress.phase==='basilio_compare' && !s.dialogue.active && !s.modal) this.trigger('dolls-knock',882,267,{kind:'face',delay:1.3,duration:1.1,important:true,text:'Allen: «Los muñecos no podían golpear el cristal. Estaban en la repisa». '});
      else if (!this.seen.has('street-visitor') && f.has('basilioVisited') && !f.has('carmesiLightOut') && x>930 && x<1060 && !s.blocked) this.trigger('street-visitor',1150,390,{delay:.4,duration:2.8,text:'Allen: «El hombre del sombrero… Estaba justo ahí». '});
      else if (f.has('carmesiLightOut') && x>1320 && x<1550 && !s.blocked) this.trigger('wrong-shadow',s.allen.x,s.allen.y,{kind:'shadow',delay:.7,duration:2.8,text:'Allen: «Mi sombra… No te detengas a mirarla». '});
      else if (s.faroles.display.settled && !f.has('farolesVisited')) this.trigger('faroles-eyes',1680,244,{kind:'house',delay:.8,duration:1.4,important:true,text:'Allen: «Ha dejado de respirar. Creo que ahora nos está escuchando». '});
      else if (s.progress.phase==='host_reveal') this.trigger('host-shadow',2110,354,{kind:'shadow',delay:1.4,duration:1.8,important:true,text:'La sombra se inclina antes que su dueño.'});
    }
    const e=this.current; if (!e) return;
    e.time+=Math.min(delta,100)/1000;
    const reduced=s.reducedMotion || s.registry.get('reducedEffects'); this.duck=e.important && e.time<e.delay ? 0 : .45;
    if (e.time>=e.delay && !e.revealed) {
      e.revealed=true;
      s.finale.audio.start(); s.finale.audio.cue(e.important ? 'wood' : 'cane');
      if (e.text) s.ui.toast(e.text);
      if (e.important && !reduced) s.cameras.main.shake(140,.0015);
    }
    if (e.revealed) {
      const fade=Math.min(1,(e.delay+e.duration-e.time)/.3), strength=reduced ? .45 : .9;
      this.shade.setAlpha(e.important ? Math.max(0,fade)*(reduced ? .07 : .22) : 0);
      if (e.kind==='pumpkin') this.pumpkin.setPosition(e.x,e.y).setVisible(true).setAlpha(fade);
      else if (['face','house'].includes(e.kind)) {
        this.overlay.classList.remove('is-shadow');
        this.eyes.setPosition(e.x,e.y).setScale(e.kind==='house'?2:1).setAlpha(strength*fade).setVisible(true);
        this.overlay.hidden=s.modal!=='faroles'; this.overlay.style.opacity=String(strength*fade);
      } else {
        this.overlay.classList.add('is-shadow'); this.overlay.hidden=!(e.id==='host-shadow' && s.modal==='final'); this.overlay.style.opacity=String(strength*fade);
        const scale=e.id==='window-visitor' ? .27 : .8;
        this.figure.setPosition(e.kind==='shadow'?s.allen.x+26:e.x,e.kind==='shadow'?s.allen.y+25:e.y).setScale(e.kind==='shadow'?1.1:scale,e.kind==='shadow'?.75:scale).setAlpha(strength*fade).setVisible(true);
      }
      if (e.kind==='figure' && Math.abs(s.player.x-e.x)<80) { this.clear(); return; }
    }
    if (e.time>=e.delay+e.duration) this.clear();
  }
  destroy() { this.clear(); this.overlay.remove(); }
}

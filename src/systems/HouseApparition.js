import { houseLayer } from '../assets/drawStreet.js';
export const apparitionClue = { id:'house-appeared', house:'La calle', title:'Una casa donde no había nada', text:'Al cerrar el álbum de Faroles, la niebla ocultó el final de la calle. Apareció una casa entre los árboles. Allen vio cómo las ventanas se encendían a la vez. No estaba allí cuando salimos de casa.' };
export class HouseApparition {
  constructor(scene, house) {
    this.scene=scene; this.house=house; this.clock=0; this.active=false; this.finished=false;
    this.layer=houseLayer(scene,house).setVisible(false).setAlpha(0);
    this.marker=scene.add.text(house.x,301,'05  ÚLTIMA CASA',{fontFamily:'monospace',fontSize:'11px',color:'#ffe4b8',backgroundColor:'#433d4b',padding:{x:6,y:4}}).setOrigin(.5).setDepth(10).setVisible(false);
    this.collider=scene.add.rectangle(house.x,251,252,158).setVisible(false);
    scene.physics.add.existing(this.collider,true); scene.obstacles.add(this.collider); this.collider.body.enable=false;
    this.fog=Array.from({length:5},(_,i)=>scene.add.ellipse(100+i*210,280+(i%2)*95,440,180,0xabb2b4,0.12).setScrollFactor(0).setDepth(6000).setVisible(false));
  }
  start() {
    if (this.active || this.finished) return;
    const s=this.scene; this.active=true; this.clock=0; this.startScroll=s.cameras.main.scrollX;
    s.modal='apparition'; s.player.stop(); s.controls.clear(); s.physics.world.pause(); s.cameras.main.stopFollow();
    s.finale.audio.start(); s.finale.audio.cue('clock'); s.music.select('Street','musica3.mp3',0.42);
    s.ui.toast('Allen: «Espera. Ese camino… antes continuaba entre los árboles».');
    this.fog.forEach(f=>f.setVisible(true));
  }
  complete({ dialogue=true }={}) {
    const s=this.scene; if (this.finished) return;
    this.active=false; this.finished=true; this.layer.setVisible(true).setAlpha(1).setScale(2);
    this.marker.setVisible(true); this.collider.body.enable=true; s.finale.appear(1);
    s.progress.flags.add('lastHouseAppeared'); s.progress.addClue(apparitionClue);
    this.fog.forEach(f=>f.setVisible(false));
    if (s.modal==='apparition') { s.modal=null; s.controls.clear(); s.physics.world.resume(); }
    s.cameras.main.setZoom(1).startFollow(s.player,true,1,0,0,35);
    if (dialogue) s.dialogue.start([{speaker:'Allen',text:'No estaba ahí. La calle acaba de cambiar… Lo estoy dibujando para no olvidarlo.'},{speaker:'Riliane',text:'Entonces no te alejes. Ni aunque te lo pida.'}]);
    s.ui.updateProgress(s.progress);
  }
  update(delta) {
    if (!this.active || this.scene.modal!=='apparition' || document.hidden) return;
    const s=this.scene; this.clock+=Math.min(delta,100); const t=Math.min(1,this.clock/4200);
    const reduced=s.reducedMotion || s.registry.get('reducedEffects');
    const fog=Math.sin(t*Math.PI)*(reduced ? .14 : .42);
    this.fog.forEach((f,i)=>{f.setAlpha(fog); if (!reduced) f.x=100+i*210+Math.sin(t*4+i)*35;});
    const scroll=Math.min(1440,Math.max(0,this.house.x-480));
    s.cameras.main.setScroll(reduced ? scroll : this.startScroll+(scroll-this.startScroll)*Math.min(1,t*2),s.cameras.main.scrollY);
    const reveal=Math.max(0,Math.min(1,(t-.25)/.55)); this.layer.setVisible(reveal>0).setAlpha(reveal);
    if (!reduced) this.layer.setScale(2+(1-reveal)*.06,2-(1-reveal)*.08);
    s.finale.appear(reveal);
    if (t>=1) this.complete();
  }
}

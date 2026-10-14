const config=window.RYU_CONFIG;
const showcase=document.querySelector('.showcase');
const projects=document.querySelector('#projects');
const motion=document.querySelector('#motion');
let paused=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function syncMotion(){motion.textContent=paused?'Play trailers':'Pause trailers';motion.setAttribute('aria-pressed',String(paused));showcase.querySelectorAll('video').forEach(v=>{if(paused)v.pause();else v.play().catch(()=>{});});}
function openProject(p){
 const dlg=document.querySelector('#work-dialog');document.querySelector('#work-title').textContent=p.title;
 const media=document.querySelector('#work-media');media.replaceChildren();const src=p.fullVideo||p.video;
 const el=document.createElement(src?'video':'img');el.src=src||p.poster;
 if(src){el.controls=true;el.playsInline=true;el.poster=p.poster;}else el.alt=p.title;
 media.append(el);document.querySelector('#work-note').textContent=src?p.artist:'Trailer preview · '+p.artist+'. Video coming soon.';dlg.showModal();
}
config.projects.forEach(p=>{
 const trailer=document.createElement('button');trailer.className='trailer';trailer.setAttribute('aria-label',(p.video?'Watch ':'Preview ')+p.title);
 const frame=document.createElement('div');frame.className='trailer-media';
 const img=document.createElement('img');img.src=p.poster;img.alt=p.title;frame.append(img);
 if(p.video){const v=document.createElement('video');v.src=p.video;v.poster=p.poster;v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.autoplay=!paused;v.preload='metadata';v.setAttribute('aria-hidden','true');v.addEventListener('error',()=>v.remove());frame.append(v);motion.hidden=false;}
 const label=document.createElement('span');label.className='trailer-name';label.textContent=p.title;
 trailer.append(frame,label);document.querySelector('.trailer-grid').append(trailer);trailer.addEventListener('click',()=>openProject(p));
 const card=document.createElement('button');card.className='project';card.setAttribute('aria-label',(p.fullVideo||p.video?'Watch ':'Preview ')+p.title);
 const holder=document.createElement('div');holder.className='project-image';const cover=document.createElement('img');cover.src=p.poster;cover.alt=p.title+' — '+p.artist;cover.loading='lazy';holder.append(cover);
 const badge=document.createElement('span');badge.textContent=p.fullVideo||p.video?'Watch film':'View still';holder.append(badge);
 const artist=document.createElement('small');artist.textContent=p.artist;const title=document.createElement('h3');title.textContent=p.title;card.append(holder,artist,title);projects.append(card);card.addEventListener('click',()=>openProject(p));
});
motion.addEventListener('click',()=>{paused=!paused;syncMotion();});syncMotion();
document.addEventListener('visibilitychange',()=>{if(document.hidden)showcase.querySelectorAll('video').forEach(v=>v.pause());else syncMotion();});
const booking=document.querySelector('#booking-dialog');
document.querySelectorAll('.book').forEach(b=>b.addEventListener('click',()=>{if(config.bookingUrl){location.href=config.bookingUrl;return;}booking.showModal();}));
if(config.bookingEmail){document.querySelector('#booking-note').textContent='Tell me what you have in mind. Let’s bring it to life.';document.querySelector('#inquiry-action').textContent='Open email inquiry';}
document.querySelectorAll('dialog').forEach(d=>{d.querySelector('.close').addEventListener('click',()=>d.close());d.addEventListener('close',()=>d.querySelectorAll('video').forEach(v=>v.pause()));});
document.querySelector('#inquiry').addEventListener('submit',e=>{e.preventDefault();const data=new FormData(e.target);const brief=`RYU Films — Project Inquiry\n\nName: ${data.get('name')}\nEmail: ${data.get('email')}\nProject: ${data.get('type')}\n\n${data.get('details')}`;
if(config.bookingEmail){location.href='mailto:'+encodeURIComponent(config.bookingEmail)+'?subject='+encodeURIComponent('RYU Films project inquiry')+'&body='+encodeURIComponent(brief);document.querySelector('.form-status').textContent='Your email app will open. Send the email there to complete your inquiry.';}else{const url=URL.createObjectURL(new Blob([brief],{type:'text/plain'}));const a=document.createElement('a');a.href=url;a.download='RYU-Films-Project-Brief.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('.form-status').textContent='Project brief downloaded. Nothing has been sent; share this file directly with RYU.';}});

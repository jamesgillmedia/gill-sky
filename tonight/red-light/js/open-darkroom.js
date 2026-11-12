/* Darkroom opens on the hung prints with the red light on (tonight, item 7). One room here: no horizon/darkroom switch.
 The red light is set for this visit only (not stored), so the Photo lab's own safelight setting is untouched. */
(function(){if(!window.LAB)return;
  function red(){document.body.classList.add('safe');var b=document.getElementById('safe');if(b){b.classList.add('on');b.setAttribute('aria-pressed','true')}if(LAB.ambient&&LAB.ambient.get)LAB.ambient.set(LAB.ambient.get())}
  if(LAB.rooms&&LAB.rooms.set)LAB.rooms.set('red-light-gallery',false);
  red();
  setTimeout(function(){if(LAB.hint)LAB.hint('darkroom: prints on the walls · tap one to look closer · salon changes how they hang',3200)},60);
})();

/* Room sliders: Film, Sound, Objects, Spaces, Photo — saved on device; reset. */
(function (global) {
  'use strict';
  var KEY = 'gs.proto.rooms.v1';
  var ROOMS = [
    { k: 'film', label: 'Film' },
    { k: 'sound', label: 'Sound' },
    { k: 'objects', label: 'Objects' },
    { k: 'spaces', label: 'Spaces' },
    { k: 'photo', label: 'Photo' }
  ];
  var DEF = { film: 0.72, sound: 0.65, objects: 0.58, spaces: 0.55, photo: 0.7 };

  function load() {
    var out = Object.assign({}, DEF);
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return out;
      var o = JSON.parse(raw);
      ROOMS.forEach(function (r) {
        var v = parseFloat(o[r.k]);
        if (isFinite(v)) out[r.k] = Math.max(0, Math.min(1, v));
      });
    } catch (e) {}
    return out;
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function reset() {
    var s = Object.assign({}, DEF);
    save(s);
    return s;
  }

  function mount(root, onChange) {
    var state = load();
    root.innerHTML = '';
    root.classList.add('gs-tune');
    var h = document.createElement('h2');
    h.textContent = 'tune';
    root.appendChild(h);
    var note = document.createElement('p');
    note.className = 'gs-tune-note';
    note.textContent = 'room presence · saved on this device';
    root.appendChild(note);
    var rows = document.createElement('div');
    rows.className = 'gs-tune-rows';
    ROOMS.forEach(function (r) {
      var row = document.createElement('label');
      row.className = 'gs-tune-row';
      var lab = document.createElement('span');
      lab.textContent = r.label;
      var input = document.createElement('input');
      input.type = 'range'; input.min = '0'; input.max = '100'; input.step = '1';
      input.value = String(Math.round(state[r.k] * 100));
      input.setAttribute('aria-label', r.label + ' room');
      var val = document.createElement('span');
      val.className = 'gs-tune-val';
      val.textContent = input.value;
      input.addEventListener('input', function () {
        state[r.k] = parseInt(input.value, 10) / 100;
        val.textContent = input.value;
        save(state);
        if (onChange) onChange(state);
      });
      row.appendChild(lab); row.appendChild(input); row.appendChild(val);
      rows.appendChild(row);
    });
    root.appendChild(rows);
    var resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'gs-tune-reset';
    resetBtn.textContent = 'reset';
    resetBtn.addEventListener('click', function () {
      state = reset();
      rows.querySelectorAll('input').forEach(function (input, i) {
        input.value = String(Math.round(state[ROOMS[i].k] * 100));
        input.nextElementSibling.textContent = input.value;
      });
      if (onChange) onChange(state);
    });
    root.appendChild(resetBtn);
    return {
      get: function () { return Object.assign({}, state); },
      set: function (s) { state = Object.assign({}, DEF, s); save(state); }
    };
  }

  global.GSTune = { mount: mount, load: load, reset: reset, rooms: ROOMS, defaults: DEF };
})(window);

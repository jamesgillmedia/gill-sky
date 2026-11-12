/* The Photo reel's list: m4's Photo chapter (data.json) + Gill's Nov 9 photos (js/nov9.js), in m4's own board order.
   Paths are rewritten relative to 3d/. Series = where each photo comes from in m4's data (names are labels, not titles). */
window.GJ3_PHOTOS = function () {
  var SERIES = { main: 'photographs', nov9: 'Nov 9' };
  var PRIVATE = /IMG_1936|IMG_1188|IMG_1189|IMG_6405|IMG_6606|IMG_6612|22179A95|IMG_5722|IMG_1187|IMG_6881|IMG_1342/i;
  var up = function (p) { return p ? '../' + p : '' };
  return fetch('../data.json').then(function (r) { return r.json() }).then(function (d) {
    var out = [];
    var ch = (d.chapters || []).filter(function (c) { return c.k === 'photo' })[0];
    (ch ? ch.cards : []).forEach(function (c) {
      var m = c.media || {};
      out.push({ id: c.id, series: SERIES.main, title: c.title && c.title !== 'untitled' ? c.title : '',
        thumb: up(m.thumb), big: up(m.big || m.thumb), w: m.w || 4, h: m.h || 5, page: '../photo/' + c.slug + '/' });
    });
    (window.NOV9 || []).forEach(function (f) {
      if (f.k !== 'photo') return;
      var slug = 'nov9-' + f.name.toLowerCase();
      out.push({ id: 'photo/' + slug, series: SERIES.nov9, title: '', thumb: up(f.thumb), big: up(f.big), w: f.w, h: f.h, page: '../photo/' + slug + '/' });
    });
    return out.filter(function (p) { return !PRIVATE.test(p.big + p.thumb + p.id) });
  });
};

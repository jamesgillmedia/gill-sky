/* Analytics config. Nothing is sent until `provider` and `endpoint` are both set.
   provider  ''            off (default): no network calls, no storage
             'goatcounter' endpoint 'https://YOUR-CODE.goatcounter.com/count'   (GET image beacon: p, t, e)
             'plausible'   endpoint 'https://plausible.io/api/event'            (POST JSON: name, url, domain, props)
             'custom'      endpoint any URL; receives the same JSON as Plausible via POST
   domain    Plausible site domain (e.g. 'jamesgillmedia.github.io')
   See README.md, "Tour analytics". */
window.GJ_ANALYTICS_CONFIG = {
  provider: '',
  endpoint: '',
  domain: ''
};

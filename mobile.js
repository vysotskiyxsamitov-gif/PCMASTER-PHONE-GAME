/* PC МАСТЕР — mobile.js: облегчённая версия для телефонов.
   Без теней, отражений, обводок и тяжёлых текстур; меньше источников света; кнопка действия; полный экран и альбомная ориентация. */
(function () {
  if (window.__mobileLoaded) return;
  window.__mobileLoaded = 1;
  var MAXL = 5;   // сколько точечных/прожекторных ламп оставляем (каждая лампа — это стоимость в каждом пикселе)
  function ready() { try { return typeof THREE !== 'undefined' && !!scene && !!cam && !!R && typeof opt === 'object' && !!window.__roomLoaded && !!window.__windowsLoaded; } catch (e) { return false; } }
  function safe(f) { try { return f(); } catch (e) { console.warn('[mobile]', e); } }

  function go() {
    safe(function () { opt.ul = 0; });
    safe(function () { R.shadowMap.enabled = false; });
    /* тени и вторичные карты выключаем у всех */
    safe(function () {
      var lights = [];
      scene.traverse(function (o) {
        if (o.isLight) { o.castShadow = false; if (o.isPointLight || o.isSpotLight) lights.push(o); }
        if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; var ms = Array.isArray(o.material) ? o.material : [o.material]; ms.forEach(function (m) { if (m && m.isMeshStandardMaterial) { m.envMapIntensity = 0; if (m.bumpMap) { m.bumpMap = null; } m.needsUpdate = true; } }); }
      });
      lights.sort(function (a, b) { return (b.intensity || 0) - (a.intensity || 0); });
      for (var i = MAXL; i < lights.length; i++) lights[i].visible = false;
      console.log('[mobile] ламп оставлено', Math.min(MAXL, lights.length), 'из', lights.length);
    });
    /* дальность прорисовки и туман */
    safe(function () { cam.far = 40; cam.updateProjectionMatrix(); if (scene.fog) { scene.fog.near = 12; scene.fog.far = 30; } });
    /* кнопка действия вместо нажатия по предмету */
    safe(function () {
      var b = document.createElement('button');
      b.id = 'mact'; b.textContent = 'ДЕЙСТВИЕ';
      b.style.cssText = 'position:fixed;right:max(18px,env(safe-area-inset-right,0px));bottom:max(22px,env(safe-area-inset-bottom,0px));width:92px;height:92px;border-radius:50%;border:2px solid #6ee7ff;background:rgba(40,110,140,.55);color:#fff;font:800 12px system-ui,sans-serif;letter-spacing:.05em;z-index:30;display:none;touch-action:none;backdrop-filter:blur(4px)';
      b.addEventListener('pointerdown', function (e) { e.preventDefault(); e.stopPropagation(); try { if (typeof interact == 'function') interact(); } catch (_) { } });
      document.body.appendChild(b);
      setInterval(function () { b.style.display = (typeof mode !== 'undefined' && mode == 'play' && !PZ) ? 'block' : 'none'; }, 250);
    });
    /* полный экран, альбомная ориентация, экран не гаснет */
    function fs() {
      var el = document.documentElement;
      try { if (!document.fullscreenElement && el.requestFullscreen) el.requestFullscreen({ navigationUI: 'hide' }).catch(function () { }); } catch (e) { }
      try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () { }); } catch (e) { }
      try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(function () { }); } catch (e) { }
    }
    addEventListener('pointerdown', function once() { fs(); removeEventListener('pointerdown', once); }, { once: false });
    document.addEventListener('visibilitychange', function () { if (!document.hidden) try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(function () { }); } catch (e) { } });
    document.addEventListener('gesturestart', function (e) { e.preventDefault(); });
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.__mobile = { light: true };
    console.log('[mobile] готово');
  }
  if (ready()) setTimeout(go, 300); else { var n = 0, iv = setInterval(function () { if (ready()) { clearInterval(iv); setTimeout(go, 300); } else if (++n > 600) clearInterval(iv); }, 100); }
})();

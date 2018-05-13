const staticCacheName = 'mws-restaurant-v1';
const contentImgsCache = 'mws-restaurant-imgs-v1';
const allCaches = [staticCacheName, contentImgsCache];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(staticCacheName).then(function (cache) {
    return cache.addAll(
      [
        '/index.html', 
        '/restaurant.html', 
        '/css/styles.css', 
        '/js/main.js', 
        '/js/dbhelper.js', 
        '/js/restaurant_info.js', 
        '/data/restaurants.json' 
      ]);
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.filter(function (cacheName) {
      return cacheName.startsWith('mws-restaurant-') && !allCaches.includes(cacheName);
    }).map(function (cacheName) {
      return caches['delete'](cacheName);
    }));
  }));
});


self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url);
  
  if (requestUrl.origin === location.origin) {
    if (requestUrl.pathname.startsWith('/img/')) {
      
      event.respondWith(
        servePhoto(event.request)
        //return fetch("https://images.pexels.com/photos/248797/pexels-photo-248797.jpeg?auto=compress&cs=tinysrgb&h=650&w=940")
      );
      return;
    }
  }

  //return cached file
  event.respondWith( caches.match(event.request).then(function (response) {
    return response || fetch(event.request);
    /*return response || 
            fetch(event.request).then(function(response) {
              let responseClone = response.clone();
              caches.open(staticCacheName).then(function(cache) {
                cache.put(event.request, responseClone);
              });
              return response;
            })*/
  }));
});



function servePhoto(request) {
  var storageUrl = request.url.replace(/-\d+px\.jpg$/, '');

  return caches.open(contentImgsCache).then(function (cache) {
    return cache.match(storageUrl).then(function (response) {
      if (response) return response;

      return fetch(request).then(function (networkResponse) {
        cache.put(storageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}
import 'whatwg-fetch';

export function get(input, options = {}) {
   options.method = 'GET';
   return fetch(input, options);
}

export function post(input, options = {}) {
   options.method = 'POST';
   return fetch(input, options);
}

export function put(input, options = {}) {
   options.method = 'PUT';
   return fetch(input, options);
}

export function del(input, options = {}) {
   options.method = 'DELETE';
   return fetch(input, options);
}

export function fetch(input, options = {}) {
   options.credentials = options.credentials || 'include';
   options.mode = options.mode || 'cors';

   return window.fetch(input, options).then((response) => {
      const success = response.status >= 200 && response.status < 300;
      return response.json().then(json => (success ? json : Promise.reject(json)));
   });
}

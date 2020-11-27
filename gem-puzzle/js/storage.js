/*eslint no-useless-rename: ["error", { ignoreExport: true }]*/

export function set(name, value) {
  localStorage.setItem(name, value);
}

export function get(name, subst) {
  return localStorage.getItem(name) || subst;
}

export function del(name) {
  localStorage.removeItem(name);
}

export function clear() {
  localStorage.clear();
}
export function set(name, value) {
    localStorage.setItem(name, value);
}

export function get(name, subst) {
    return localStorage.getItem(name) || subst;
}

export function del(name) {
    localStorage.removeItem(name);
}
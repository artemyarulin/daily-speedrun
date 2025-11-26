// Common Utilities and Animation Registry

// Global registry for animations
window.speedrunAnimations = [];

window.registerAnimation = function (fn) {
    window.speedrunAnimations.push(fn);
};

window.getUrl = function (path) {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL) {
        return chrome.runtime.getURL(path);
    }
    return path;
};

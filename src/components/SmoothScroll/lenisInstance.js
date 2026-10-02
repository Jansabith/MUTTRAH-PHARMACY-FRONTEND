let lenis = null

// The running smooth-scroll instance (null until mounted), for code that
// scrolls the page itself, e.g. jumping to the top on page change
export const getLenis = () => lenis

export const setLenis = (instance) => {
  lenis = instance
}

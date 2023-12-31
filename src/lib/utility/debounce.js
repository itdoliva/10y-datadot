export default function debounce(callback, delay=1000) {
  let timeout
  return (...args) => {
    clearTimeout(timeout)
    setTimeout(() => {
      callback(...args)
    }, delay)
  }
}
export default function throttle(callback, delay = 1000) {
  let shouldWait = false
  let waitingArgs = null

  const timeoutFunc = () => {
    if (waitingArgs == null) {
      shouldWait = false
    } 
    else {
      callback(...waitingArgs)
      waitingArgs = null
      setTimeout(timeoutFunc, delay)
    }
  }

  return (...args) => {
    if (shouldWait) {
      waitingArgs = args
      return
    }

    callback(...args)
    shouldWait = true

    setTimeout(timeoutFunc, delay)
  }
}
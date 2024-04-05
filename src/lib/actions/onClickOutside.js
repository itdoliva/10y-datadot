/** Dispatch event on click outside of node */
export default function clickOutside(node) {
  
  function handleClick(e) {
    if (!node || node.contains(e.target) || e.defaultPrevented) {
      return
    }

    return node.dispatchEvent(new CustomEvent('outsideclick', node))
  }


  document.addEventListener('click', handleClick, true)

  return {
    destroy: () => document.removeEventListener('click', handleClick, true)
  }

}
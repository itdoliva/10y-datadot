export function load({ params }) {
  const nNodes = 387

  const firstDt = new Date(2014, 0, 1)
  const lastDt = new Date(2023, 11, 1)

  const nodes = []

  for (let i = 0; i < nNodes; i++) {
    const year = firstDt.getFullYear() + Math.floor(Math.random()*10)
    const month = Math.floor(Math.random()*12)
    const date = new Date(year, month, 1)

    nodes.push({ 
      id: i, 
      date, 
      year: date.getFullYear() 
    })
  }

  return {
    nodes,
    dates: [ firstDt, lastDt ]
  }
}
function getNCats() {
  const num = Math.random()
  if (num < .4) {
    return 1
  } 
  else if (num < .65) {
    return 2
  } 
  else if (num < .8) {
    return 3
  }
  else if (num < .925) {
    return 4
  }
  return 5
}

function getCategories(catList, multi=true) {
  if (!multi) {
    return catList[Math.floor(Math.random() * catList.length)].id
  } 
  else {
    const list = [...catList]
    const values = []
    for (let i=0; i<getNCats(); i++) {
      const index = Math.floor(Math.random() * list.length)
      values.push(list.splice(index, 1)[0].id)
    }
    return values
  }
}

export async function load({ fetch }) {
  const categories = await fetch("/categories.json")
    .then(d => d.json())

  const { products, designs, channels, goals, industries } = categories

  const nNodes = 387

  const firstDt = new Date(2014, 0, 1)
  const lastDt = new Date(2023, 11, 1)

  const nodes = []

  for (let i = 0; i < nNodes; i++) {
    const year = firstDt.getFullYear() + Math.floor(Math.random()*10)

    const prodList = []
    prodList.push(products.slice(products.length-2)[Math.random() < .5 ? 0 : 1].id)
    prodList.push(products.slice(0, products.length-2)[Math.floor(Math.random()*(products.length-2))].id)

    nodes.push({ 
      id: i, 
      year,
      channel: getCategories(channels, false),
      designs: getCategories(designs),
      goals: getCategories(goals),
      industry: getCategories(industries, false),
      products: prodList
    })
  }

  return {
    nodes,
    dates: [ firstDt, lastDt ],
    categories
  }
}
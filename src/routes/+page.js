const productCats = [
  'anima/video',
  'publicacao',
  'relatorio',
  'apresentacao',
  'site-institucional',
  'infografico',
  'site-editorial', 
  'dashboard'
]

const designCats = [
  'ilustracao',
  'editorial',
  'motion',
  'servicos',
  'ui'
]

const bases = [
  'digital',
  'print',
  'consulting'
]

const goals = [
  'educacional',
  'informacional',
  'impacto',
  'institucional',
  'editorial'
]

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
    return catList[Math.floor(Math.random() * catList.length)]
  } 
  else {
    const list = [...catList]
    const values = []
    for (let i=0; i<getNCats(); i++) {
      const index = Math.floor(Math.random() * list.length)
      values.push(list.splice(index, 1)[0])
    }
    return values
  }
}

export function load() {
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
      year,
      basis: getCategories(bases, false),
      products: getCategories(productCats),
      designs: getCategories(designCats),
      goals: getCategories(goals),
    })
  }

  return {
    nodes,
    dates: [ firstDt, lastDt ]
  }
}
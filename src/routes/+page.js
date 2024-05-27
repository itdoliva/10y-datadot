import "$lib/i18n"

import * as d3 from "d3"

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
  const nClients = Math.floor(nNodes *.95)
  const nProjects = Math.floor(nNodes *.975)

  const firstDt = new Date(2014, 0, 1)
  const lastDt = new Date(2023, 11, 1)

  const nodes = Array.from({ length: nNodes }, (d, i) => {
    const year = firstDt.getFullYear() + Math.floor(Math.random()*10)

    const prodList = []
    prodList.push(products.slice(products.length-2)[Math.random() < .5 ? 0 : 1].id)
    prodList.push(products.slice(0, products.length-2)[Math.floor(Math.random()*(products.length-2))].id)

    const projectId = Math.floor(Math.random() * nProjects)

    const node = { 
      id: i, 
      year,

      channel: getCategories(channels, false),
      designs: getCategories(designs),
      goals: getCategories(goals),
      industry: getCategories(industries, false),
      products: prodList,

      active: true,
      complexity: .4 + Math.random()*.7,

      projectId,
    }

    node.ids = [
      node.channel, 
      node.designs, 
      node.goals, 
      node.industry, 
      node.products
    ].flat()

    return node
  })

  const projects = d3.groups(nodes, d => d.projectId)
    .map(([ id, deliveryNodes ], i) => ({
      id,
      name: `Project #${i+100}`,
      clientId: Math.floor(Math.random() * nClients),
      deliveries: deliveryNodes
    }))
    .sort((a, b) => a.id - b.id)

  const clients = d3.groups(projects, d => d.clientId)
    .map(([ id, projectNodes ], i) => ({
      id,
      name: `Client ${i}`,
      projects: projectNodes
    }))
    .sort((a, b) => a.id - b.id)

  nodes.forEach(node => {
    node.clientId = projects.find(project => project.id === node.projectId).clientId
  })


  return {
    nodes,
    projects,
    clients,
    dates: [ firstDt, lastDt ],
    categories
  }
}
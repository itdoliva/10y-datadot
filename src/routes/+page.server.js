import { 
  getRecords,
  deliverableColumns, 
  categoryColumns, 
  categoryOrders, 
  parseDeliverables, 
  parseCategories 
} from '$lib/utils/database'

import * as d3 from "d3"

export async function load({ fetch }) {
  // Get deliverables and categories from the database
  const deliverables = await getRecords('deliverables', deliverableColumns).then(parseDeliverables)
  const categories = await getRecords('categories', categoryColumns).then(parseCategories)

  // Sort categories
  categories.sort((a, b) => categoryOrders.indexOf(a.id) - categoryOrders.indexOf(b.id))
  
  // Get unique projects and clients
  const projects = new Set()
  const clients = new Set()

  deliverables.forEach(deliverable => {
    projects.add(deliverable.project)
    clients.add(deliverable.client)
  })

  return {
    deliverables,
    categories,
    projects: Array.from(projects),
    clients: Array.from(clients),
    dates: d3.extent(deliverables, d => d.dt),
  }
}

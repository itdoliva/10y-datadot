import { XATA_API_KEY, DATABASE_URL } from '$env/static/private';

export async function load({ fetch }) {

  async function getRecords(table, columns, parseCallback) {
    const url = DATABASE_URL + `/tables/${table}/query`

    return fetch(url, {
      method: 'POST',
      headers: { 
        Authorization: `Bearer ${XATA_API_KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        columns,
        page: { size: 1000 }
      })
    })
    .then(response => response.json())
    .then(json => json.records.map(parseCallback))
  }

  const deliverablesParse = (row, i) => {
    const dt = new Date(row.dt_start)
    return {
      id: i,
      
      client: row.client,
      project: row.project,
      description: row.description,
      dt: dt.getTime() / 1000,
      date: `${(dt.getUTCMonth()+1).toString().padStart(2, "0")}/${dt.getUTCFullYear()}`,
      year: dt.getFullYear(),
  
      channel: "channel." + row.channel,
      industry: "industry." + row.industry,
      product: JSON.parse(row.product.replace(/'/g, '"')).filter(d => d !== undefined).map(d => "product." + d),
      design: JSON.parse(row.design.replace(/'/g, '"')).filter(d => d !== undefined).map(d => "design." + d),
      goal: JSON.parse(row.goal.replace(/'/g, '"')).filter(d => d !== undefined).map(d => "goal." + d),
  
      complexity: +row.complexity
    }
  }

  const categoriesParse = (row) => ({
    id: `${row.type}.${row.name}`,
    type: row.type,
    name: row.name,
    data: JSON.parse(row.data)
  })

  const deliverables = await getRecords('deliverables', [ "client", "industry", "project", "description", "dt_start", "channel", "product", "design", "goal", "complexity" ], deliverablesParse)
  const categories = await getRecords('categories', [ "name", "data", "type" ], categoriesParse)

  const projects = new Set()
  const clients = new Set()
  
  let dtMax
  let dtMin

  deliverables.forEach(deliverable => {
    if (!dtMax || deliverable.dt > dtMax ) {
      dtMax = deliverable.dt
    }

    if (!dtMin || deliverable.dt < dtMin) {
      dtMin = deliverable.dt
    }

    projects.add(deliverable.project)
    clients.add(deliverable.client)

  })

  

  return {
    deliverables,
    categories,
    projects: Array.from(projects),
    clients: Array.from(clients),
    dates: [ dtMin, dtMax ]
  }
}

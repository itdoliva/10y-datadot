import { XATA_API_KEY, DATABASE_URL } from '$env/static/private';
import { dev } from '$app/environment';

export async function load({ fetch }) {

  // Define columns to get from each table
  const deliverableColumns = [ 
    "client", 
    "industry", 
    "project", 
    "description", 
    "dt_start", 
    "channel", 
    "product", 
    "design", 
    "goal", 
    "complexity"
  ]

  const categoryColumns = [ "name", "data", "type" ]

  const categoryOrders = [
      'channel.digital',
      'channel.impresso',
      'channel.consultoria',

      'goal.educacional',
      'goal.informacional',
      'goal.impacto-positivo',
      'goal.jornalistico-editorial',
      'goal.institucional',

      'industry.servicos-e-tecnologia',
      'industry.automotivo',
      'industry.varejo',
      'industry.educacao',
      'industry.financeiro',
      'industry.ongs-orgs',
      'industry.consultorias',
      'industry.imobiliario',
      'industry.comunicacao',
      'industry.jornalismo',
      'industry.pesquisa',

      'product.video', 
      'product.infografico',
      'product.publicacao',
      'product.apresentacao',
      'product.site-editorial',
      'product.site-institucional',
      'product.relatorios',
      'product.outras-interfaces',

      'design.ilustracao',
      'design.infografia',
      'design.motion-graphics',
      'design.editorial',
      'design.user-interface',
      'design.datavis', 
      'design.design-de-servicos',
  ]




  // Fetch Function
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
    .then(json => json.records.map(parseCallback).filter(d => d))
  }

  const deliverablesParse = (row, i) => {
    const dt = new Date(row.dt_start)

    if (!row.industry) {
      return
    }

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

  const deliverables = await getRecords('deliverables', deliverableColumns, deliverablesParse)
  const categories = await getRecords('categories', categoryColumns, categoriesParse)

  categories.sort((a, b) => categoryOrders.indexOf(a.id) - categoryOrders.indexOf(b.id))

  
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

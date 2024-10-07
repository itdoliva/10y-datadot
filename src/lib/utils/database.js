// import { XATA_API_KEY, DATABASE_URL } from '$env/static/private';
import * as d3 from "d3"

export const deliverableColumns = [ 
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

export const categoryColumns = [ "name", "data", "type" ]

export const categoryOrders = [
  'channel.digital',
  'channel.impressa',
  'channel.consultoria',

  'goal.educacional',
  'goal.informacional',
  'goal.impacto-positivo',
  'goal.jornalistico-editorial',
  'goal.institucional',

  'industry.servicos-e-tecnologia',
  'industry.educacao',
  'industry.financeiro',
  'industry.ongs-orgs',
  'industry.consultorias',
  'industry.comunicacao',
  'industry.jornalismo',
  'industry.pesquisa',
  'industry.outros',

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


// export async function getRecords(table, columns) {
//   const url = DATABASE_URL + `/tables/${table}/query`

//   return fetch(url, {
//     method: 'POST',
//     headers: { 
//       Authorization: `Bearer ${XATA_API_KEY}`, 
//       'Content-Type': 'application/json' 
//     },
//     body: JSON.stringify({
//       columns,
//       page: { size: 1000 }
//     })
//   })
//   .then(response => response.json())
//   .then(json => json.records)
// }

export async function getRecords(path) {
  return d3.csv(path)
}


export function parseDeliverables(values) {
  return values.map((row, i) => {
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
  })
}

export function parseCategories(values) {
  return values.map((row) => ({
    id: `${row.type}.${row.name}`,
    type: row.type,
    name: row.name,
    data: JSON.parse(row.data)
  }))
}
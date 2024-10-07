import * as d3 from "d3";
const XATA_API_KEY = "xau_1EkLMZoimHHeYEvsEA3oNzHvuq5Cvn4d2";
const DATABASE_URL = "https://datadotestudio-s-workspace-9srl26.us-east-1.xata.sh/db/deliverables:main";
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
];
const categoryColumns = ["name", "data", "type"];
const categoryOrders = [
  "channel.digital",
  "channel.impressa",
  "channel.consultoria",
  "goal.educacional",
  "goal.informacional",
  "goal.impacto-positivo",
  "goal.jornalistico-editorial",
  "goal.institucional",
  "industry.servicos-e-tecnologia",
  "industry.educacao",
  "industry.financeiro",
  "industry.ongs-orgs",
  "industry.consultorias",
  "industry.comunicacao",
  "industry.jornalismo",
  "industry.pesquisa",
  "industry.outros",
  "product.video",
  "product.infografico",
  "product.publicacao",
  "product.apresentacao",
  "product.site-editorial",
  "product.site-institucional",
  "product.relatorios",
  "product.outras-interfaces",
  "design.ilustracao",
  "design.infografia",
  "design.motion-graphics",
  "design.editorial",
  "design.user-interface",
  "design.datavis",
  "design.design-de-servicos"
];
async function getRecords(table, columns) {
  const url = DATABASE_URL + `/tables/${table}/query`;
  return fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${XATA_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      columns,
      page: { size: 1e3 }
    })
  }).then((response) => response.json()).then((json) => json.records);
}
function parseDeliverables(values) {
  return values.map((row, i) => {
    const dt = new Date(row.dt_start);
    if (!row.industry) {
      return;
    }
    return {
      id: i,
      client: row.client,
      project: row.project,
      description: row.description,
      dt: dt.getTime() / 1e3,
      date: `${(dt.getUTCMonth() + 1).toString().padStart(2, "0")}/${dt.getUTCFullYear()}`,
      year: dt.getFullYear(),
      channel: "channel." + row.channel,
      industry: "industry." + row.industry,
      product: JSON.parse(row.product.replace(/'/g, '"')).filter((d) => d !== void 0).map((d) => "product." + d),
      design: JSON.parse(row.design.replace(/'/g, '"')).filter((d) => d !== void 0).map((d) => "design." + d),
      goal: JSON.parse(row.goal.replace(/'/g, '"')).filter((d) => d !== void 0).map((d) => "goal." + d),
      complexity: +row.complexity
    };
  });
}
function parseCategories(values) {
  return values.map((row) => ({
    id: `${row.type}.${row.name}`,
    type: row.type,
    name: row.name,
    data: JSON.parse(row.data)
  }));
}
async function load({ fetch: fetch2 }) {
  const deliverables = await getRecords("deliverables", deliverableColumns).then(parseDeliverables);
  const categories = await getRecords("categories", categoryColumns).then(parseCategories);
  categories.sort((a, b) => categoryOrders.indexOf(a.id) - categoryOrders.indexOf(b.id));
  const projects = /* @__PURE__ */ new Set();
  const clients = /* @__PURE__ */ new Set();
  deliverables.forEach((deliverable) => {
    projects.add(deliverable.project);
    clients.add(deliverable.client);
  });
  return {
    deliverables,
    categories,
    projects: Array.from(projects),
    clients: Array.from(clients),
    dates: d3.extent(deliverables, (d) => d.dt)
  };
}
export {
  load
};

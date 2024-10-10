import * as d3 from "d3"
import { authenticate } from "$lib/googleAuth";
import { getSheetValues, parseDeliverables, parseCategories } from "$lib/utils/database";

import { DELIVERABLES_RANGE, CATEGORIES_RANGE } from "$lib/utils/constants";
import { getLocaleFromRequest, format } from "$lib/utils/i18n";

export async function load({ request }) {
  await authenticate()

  // Get deliverables and categories from sheets
  const deliverables = await getSheetValues(DELIVERABLES_RANGE).then(parseDeliverables)
  const categories = await getSheetValues(CATEGORIES_RANGE).then(parseCategories)

  // Get unique projects and clients
  const projects = new Set()
  const clients = new Set()

  deliverables.forEach(d => {
    projects.add(d.project)
    clients.add(d.client)
  })

  const locale = getLocaleFromRequest(request.headers)

  return {
    deliverables,
    categories,
    projects: Array.from(projects),
    clients: Array.from(clients),
    dates: d3.extent(deliverables, d => d.dt),
    meta: {
      title: format("page.name", locale),
      description: format("page.description", locale),
    }
  }
}

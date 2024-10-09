// import { XATA_API_KEY, DATABASE_URL } from '$env/static/private';
import { sheetsClient } from "$lib/googleAuth";
import { SHEET_ID } from '$env/static/private';
import { CATEGORIES_ORDER } from '$lib/utils/constants';


export async function getSheetValues(range) {

  if (!sheetsClient) {
    return console.error('Google Sheets API not initialized')
  }

	// Fetch sheet data from Google Sheets
	const response = await sheetsClient.spreadsheets.values.get({
		spreadsheetId: SHEET_ID,
		range
	});

	const values = response.data.values

	return values
}


export function parseDeliverables(values) {
  const data = []

  // Remove column names
  values.splice(0, 1)
  values.forEach(([ client, industry, project, description, dt_start, channel, product, design, goal, complexity ], i) => {
    const [ day, month, year ] = dt_start.split('/')

    const date = new Date(year, month - 1, day)

    try {
      data.push({
        id: i,
      
        client,
        project,
        description,
        dt: date.getTime() / 1000,
        date: month + '/' + year,
        year,
    
        channel: "channel." + channel,
        industry: "industry." + industry,
        product: JSON.parse(product.replace(/'/g, '"')).map(d => "product." + d),
        design: JSON.parse(design.replace(/'/g, '"')).map(d => "design." + d),
        goal: JSON.parse(goal.replace(/'/g, '"')).map(d => "goal." + d),
    
        complexity: +complexity
      })
    }
    catch (e) {
      return
    }
  })

  return data
}

export function parseCategories(values) {
  const data = []

  // Remove column names
  values.splice(0, 1)
  values.forEach(([ type, name, data_ ], i) => {

    data.push({
      id: type + '.' + name,
      type,
      name,
      data: JSON.parse(data_.replace(/'/g, '"'))
    })

  })

  data.sort((a, b) => CATEGORIES_ORDER.indexOf(a.id) - CATEGORIES_ORDER.indexOf(b.id))

  return data
}




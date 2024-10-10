import * as PIXI from "pixi.js"


export const AWS_SOUND_URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/969699'

export const DELIVERABLES_RANGE = 'master!A1:J2000'
export const CATEGORIES_RANGE = 'categories!A1:C50'

export const LAYOUT_PARAMS = {
  shifts: 1,

  // Radial
  radialMaxDelay: .7, // c.maxDelayRadial

  // Block
  blockMaxEntryDelay: .2, // c.colEntranceUpTo
  blockMaxEntryDuration: .8, // c.fullColEntranceMaxDuration

  // Filter
  filterTotalDuration: 1, // c.filterTotalDuration
  filterBetweenGap: .15, // c.filterBetweenGap
  filterDuration: .85, // c.filterDuration

}

export const ONBOARDING_PARAMS = {
  fadeoutDuration: .15,
  fadeoutOpacity: .1,
  offset: 12,
}


export const LINK_STYLES = {
  alpha: 1,
  alphaHover: 1,
  lineWidth: 2,
  lineWidthHover: 4,
  radius: 0,
  join: PIXI.LINE_JOIN.ROUND,
  cap: PIXI.LINE_CAP.ROUND
}

export const CATEGORIES_ORDER = [
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
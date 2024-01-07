import illustrationTemplate from "$lib/templates/drawers/design.illustration"
import editorialTemplate from "$lib/templates/drawers/design.editorial"
import serviceTemplate from "$lib/templates/drawers/design.service"
import uiTemplate from "$lib/templates/drawers/design.ui"
import motionTemplate from "$lib/templates/drawers/design.motion"
import dashboardTemplate from "$lib/templates/drawers/product.dashboard"
import infographicTemplate from "$lib/templates/drawers/product.infographic"
import presentationTemplate from "$lib/templates/drawers/product.presentation"
import publicationTemplate from "$lib/templates/drawers/product.publication"
import reportTemplate from "$lib/templates/drawers/product.report"
import siteEditorialTemplate from "$lib/templates/drawers/product.siteEditorial"
import siteInstitutionalTemplate from "$lib/templates/drawers/product.siteInstitutional"
import videoTemplate from "$lib/templates/drawers/product.video"
import consultingTemplate from "$lib/templates/drawers/channel.consulting"
import digitalTemplate from "$lib/templates/drawers/channel.digital"
import printTemplate from "$lib/templates/drawers/channel.print"


const options = {
  nodeSize: 20,
  lineWidth: 1.5,
}

const templates = {
  illustration: illustrationTemplate,
  editorial: editorialTemplate,
  service: serviceTemplate,
  ui: uiTemplate,
  motion: motionTemplate,
  dashboard: dashboardTemplate,
  infographic: infographicTemplate,
  presentation: presentationTemplate,
  publication: publicationTemplate,
  report: reportTemplate,
  siteEditorial: siteEditorialTemplate,
  siteInstitutional: siteInstitutionalTemplate,
  video: videoTemplate,
  consulting: consultingTemplate,
  digital: digitalTemplate,
  print: printTemplate,
  options
}



export default templates
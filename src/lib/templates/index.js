import illustration from "$lib/templates/drawers/design.illustration"
import editorial from "$lib/templates/drawers/design.editorial"
import service from "$lib/templates/drawers/design.service"
import ui from "$lib/templates/drawers/design.ui"
import motion from "$lib/templates/drawers/design.motion"
import dashboard from "$lib/templates/drawers/product.dashboard"
import infographic from "$lib/templates/drawers/product.infographic"
import presentation from "$lib/templates/drawers/product.presentation"
import publication from "$lib/templates/drawers/product.publication"
import report from "$lib/templates/drawers/product.report"
import siteEditorial from "$lib/templates/drawers/product.siteEditorial"
import siteInstitutional from "$lib/templates/drawers/product.siteInstitutional"
import video from "$lib/templates/drawers/product.video"
import consulting from "$lib/templates/drawers/channel.consulting"
import digital from "$lib/templates/drawers/channel.digital"
import print from "$lib/templates/drawers/channel.print"


const templates = {
  illustration,
  editorial,
  service,
  ui,
  motion,
  dashboard,
  infographic,
  presentation,
  publication,
  report,
  siteEditorial,
  siteInstitutional,
  video,
  consulting,
  digital,
  print,

  0: digital,
  1: print,
  2: consulting,
  
  10: video,
  11: publication,
  12: report,
  13: presentation,
  14: siteInstitutional,
  15: siteEditorial,
  16: dashboard,
  17: infographic,
  
  20: illustration,
  21: editorial,
  22: motion,
  23: service,
  24: ui,
}


export default templates
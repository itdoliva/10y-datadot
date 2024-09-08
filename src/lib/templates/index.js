import illustration from "$lib/templates/drawers/design.illustration"
import editorial from "$lib/templates/drawers/design.editorial"
import service from "$lib/templates/drawers/design.service"
import ui from "$lib/templates/drawers/design.ui"
import motion from "$lib/templates/drawers/design.motion"
import datavis from "$lib/templates/drawers/design.datavis"
import infograph from "$lib/templates/drawers/design.infograph"

import otherInterfaces from "$lib/templates/drawers/product.otherInterfaces"
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
import { goalTemplateFactory } from "$lib/templates/drawers/goal"


const templates = {
  "channel.digital": digital,
  "channel.impresso": print,
  "channel.consultoria": consulting,
  
  "product.site-editorial": siteEditorial,
  "product.outras-interfaces": otherInterfaces,
  "product.relatorios": report,
  "product.apresentacao": presentation,
  "product.infografico": infographic,
  "product.publicacao": publication,
  "product.site-institucional": siteInstitutional,
  "product.video": video,
  
  "design.user-interface": ui,
  "design.datavis": datavis,
  "design.ilustracao": illustration,
  "design.design-de-servicos": service,
  "design.editorial": editorial,
  "design.infografia": infograph,
  "design.motion-graphics": motion,

  "goal.educacional": goalTemplateFactory("goal.educacional"),
  "goal.informacional": goalTemplateFactory("goal.informacional"),
  "goal.impacto-positivo": goalTemplateFactory("goal.impacto-positivo"),
  "goal.jornalistico-editorial": goalTemplateFactory("goal.jornalistico-editorial"),
  "goal.institucional": goalTemplateFactory("goal.institucional"),
}


export default templates
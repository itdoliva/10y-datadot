import illustration from "./design.illustration"
import editorial from "./design.editorial"
import service from "./design.service"
import ui from "./design.ui"
import motion from "./design.motion"
import datavis from "./design.datavis"
import infograph from "./design.infograph"

import otherInterfaces from "./product.otherInterfaces"
import infographic from "./product.infographic"
import presentation from "./product.presentation"
import publication from "./product.publication"
import report from "./product.report"
import siteEditorial from "./product.siteEditorial"
import siteInstitutional from "./product.siteInstitutional"
import video from "./product.video"

import consulting from "./channel.consulting"
import digital from "./channel.digital"
import print from "./channel.print"
import { goalTemplateFactory } from "./goal"


const templates = {
  "channel.digital": digital,
  "channel.impressa": print,
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
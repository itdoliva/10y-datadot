import illustrationTemplate from "$lib/geometries/templates/design.illustration"
import consultingTemplate from "$lib/geometries/templates/channel.consulting"
import digitalTemplate from "$lib/geometries/templates/channel.digital"
import printTemplate from "$lib/geometries/templates/channel.print"


const options = {
  nodeSize: 20,
  lineWidth: 1.5,
}


// DESIGNS
const illustration = illustrationTemplate(options)

// CHANNELS
const consulting = consultingTemplate(options)
const digital = digitalTemplate(options)
const print = printTemplate(options)


export default {
  illustration,
  consulting,
  digital,
  print
}
import * as d3 from "d3"

export default function wrapSVGText(node, { text, maxWidth, lineHeight=1.3, verticalCenter=false }) {
  node.each(function() {
    const textNode = d3.select(this)
    const words = text.split(/\s+/).reverse()
    textNode.text(null)

    // Text Attr Y Pos
    const x = textNode.attr('x') ? textNode.attr('x') : 0
    const y = textNode.attr('y') ? textNode.attr('y') : 0
    const dy = textNode.attr('dy') ? parseFloat(textNode.attr('dy')) : 0

    // Dummy TSPAN to check its width for every new word added
    const tspan = textNode.append("tspan")
    const lines = []
    let line = []
    while (words.length) {
      const word = words.pop()
      line.push(word)

      const tspanWidth = Math.ceil(tspan.text(line.join(" ")).node().getComputedTextLength())

      if (tspanWidth > maxWidth) {
        line.pop()
        lines.push(line.join(" "))
        line = [ word ]
      }
    }
    lines.push(line.join(" "))

    // Remove dummy TSPAN and add real TSPANs
    tspan.remove()
    textNode.selectAll('tspan')
      .data(lines)
      .enter()
    .append('tspan')
      .attr('x', x)
      .attr('y', y)
      .attr('dy', (_, i) => {
        return verticalCenter 
          ? Math.ceil(i - (lines.length/2)) * lineHeight + dy + "em"
          : i * lineHeight + dy + "em"
      })
      .text(d => d)
  })
}
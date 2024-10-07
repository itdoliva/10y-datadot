import { n as noop, g as get_store_value, s as subscribe, c as assign, d as identity, e as set_store_value } from "../../chunks/utils.js";
import { c as create_ssr_component, e as escape, a as each, b as add_attribute, v as validate_component, m as missing_component, g as getContext, s as setContext, d as add_styles, o as onDestroy, f as createEventDispatcher, h as spread, i as escape_object } from "../../chunks/ssr.js";
import { $ as $format, a as $locale } from "../../chunks/runtime.js";
import * as d3 from "d3";
import _, { intersection } from "lodash";
import { w as writable, d as derived } from "../../chunks/index2.js";
import gsap$1, { gsap } from "gsap";
import * as PIXI from "pixi.js";
import * as Tone from "tone";
import textures from "textures";
import lottie from "lottie-web";
const is_client = typeof window !== "undefined";
let now = is_client ? () => window.performance.now() : () => Date.now();
let raf = is_client ? (cb) => requestAnimationFrame(cb) : noop;
const tasks = /* @__PURE__ */ new Set();
function run_tasks(now2) {
  tasks.forEach((task) => {
    if (!task.c(now2)) {
      tasks.delete(task);
      task.f();
    }
  });
  if (tasks.size !== 0) raf(run_tasks);
}
function loop(callback) {
  let task;
  if (tasks.size === 0) raf(run_tasks);
  return {
    promise: new Promise((fulfill) => {
      tasks.add(task = { c: callback, f: fulfill });
    }),
    abort() {
      tasks.delete(task);
    }
  };
}
const loaded = writable(false);
class Loader {
  constructor(minLoadingTime2) {
    this.toLoad = [
      "nodes"
    ];
    this.setLoaded = (key) => {
      if (!this.toLoad.includes(key)) {
        return;
      }
      const index = this.toLoad.indexOf(key);
      this.toLoad.splice(index, 1);
      if (this.toLoad.length === 0) {
        const runningTime = Date.now() - this.initAt;
        setTimeout(() => {
          loaded.set(true);
        }, Math.max(this.minLoadingTime - runningTime, 0));
      }
    };
    this.initAt = Date.now();
    this.minLoadingTime = minLoadingTime2;
  }
}
const minLoadingTime = 0;
const loader = new Loader(minLoadingTime);
const app = writable();
const width = writable(100);
const height = writable(100);
const pixelRatio = writable(1);
const figureWidth = writable(0);
const figureHeight = writable(0);
const hoveredFilter = writable({ active: false });
const hovered = writable();
const complexityOn = writable(false);
const linkClientOn = writable(false);
const linkProjectOn = writable(false);
const isSwitchingLayout = writable(false);
const clients = writable([]);
const projects = writable([]);
const categories = writable([]);
const sortBy = writable("dt");
const fyears = writable();
const fdesigns = writable([]);
const fgoals = writable([]);
const findustries = writable([]);
const fproducts = writable([]);
const selected = writable();
const categoriesEnriched = writable();
const nodeSize = derived([width], ([$width]) => {
  if ($width < 768) {
    return 30;
  }
  return Math.round(0.01 * $width + 12.5);
});
const lineWidth = derived([nodeSize], ([$nodeSize]) => {
  return Math.max(1, Math.round($nodeSize / 25));
});
const gap = derived(nodeSize, ($nodeSize) => {
  return $nodeSize * 0.9;
});
function randomDensity(maxInteger, size = 100, normalize = true) {
  const distribution = Array.from({ length: size }, d3.randomInt(maxInteger));
  const bin = d3.bin().thresholds(d3.range(maxInteger));
  let density = bin(distribution).map((d) => d.length / size);
  if (normalize) {
    const maxDensity = d3.max(density);
    density = density.map((d) => +(d / maxDensity).toFixed(1));
  }
  return density;
}
function makeSectorData(data, groupBy, maxStack) {
  const acc = (d) => d[groupBy];
  const unique = Array.from(new Set(data.map(acc))).sort(d3.ascending);
  let lastSectorIndex = 0;
  let pileIndex = 0;
  let inPileIndex = 0;
  const sectorData = [];
  data.sort((a, b) => d3.ascending(acc(a), acc(b) || a.i - b.i)).forEach((dataPoint) => {
    const sectorIndex = unique.indexOf(acc(dataPoint));
    if (lastSectorIndex !== sectorIndex || inPileIndex === maxStack) {
      pileIndex += 1;
      inPileIndex = 0;
    }
    sectorData.push({
      id: dataPoint.id,
      sectorIndex,
      pileIndex,
      inPileIndex,
      sectorName: `${unique[sectorIndex]}`
    });
    inPileIndex++;
    lastSectorIndex = sectorIndex;
  });
  const nSectors = unique.length;
  const nGaps = nSectors === 1 ? 0 : nSectors + 1;
  const nPiles = d3.max(sectorData, (d) => d.pileIndex);
  const metadata = {
    nGaps,
    nPiles,
    sectorNames: unique.map((d) => `${d}`)
  };
  return [sectorData, metadata];
}
function rotationOffset(theta) {
  return theta + Math.PI / 2;
}
class AttributeController {
  constructor(deliverable) {
    this.queue = [];
    this.render = {
      fx: 0,
      fy: 0,
      px: 0,
      py: 0,
      theta: 0,
      radius: 0,
      rotation: 0,
      alpha: 1,
      scale: 1,
      renderable: false
    };
    this.set = (attr) => {
      this.queue.push(attr);
    };
    this.pop = (attrId) => {
      const attrIdx = this.queue.findIndex((d) => d.id === attrId);
      const attr = this.queue.splice(attrIdx, 1)[0];
      return attr;
    };
    this.scale = () => {
      return get_store_value(complexityOn) ? this.simulation.complexityScale(this.deliverable.complexity) : 1;
    };
    this.makeTimeline = (forTransitionType, overwrite = "auto") => {
      const onComplete = () => {
        tl.kill();
      };
      const tl = gsap.timeline({
        overwrite,
        onComplete,
        onInterrupt: onComplete
      });
      return tl;
    };
    this.entrance = (isBlock) => {
      const active = this.cur.active;
      const { x, y, theta, radius, time } = this.cur;
      const delay = time;
      const tl = this.makeTimeline("entrance");
      if (isBlock) {
        tl.set(this.render, { px: x, py: y, radius, theta, alpha: 0, rotation: 0 }).set(this.render, { renderable: active, delay: 0.05 }).set(this.render, { alpha: 1, delay });
      } else {
        tl.set(this.render, {
          px: 0,
          py: 0,
          radius: radius - 24,
          theta: theta - Math.PI / 8,
          alpha: 0,
          rotation: rotationOffset(theta - Math.PI / 8),
          renderable: active
        }).to(this.render, {
          radius,
          theta,
          alpha: 1,
          rotation: rotationOffset(theta),
          delay,
          duration: c.maxDurationRadial,
          ease: "power3.inOut"
        });
      }
      return tl;
    };
    this.exit = () => {
      const yOffset = get_store_value(figureHeight) * (Math.random() * 0.5 + 0.3);
      const delay = Math.random() * 0.5;
      const duration = c.shifts - delay - Math.random() * 0.3;
      const tl = this.makeTimeline("exit");
      this.simulation.onSelectedState ? tl.fromTo(this.render, { py: 0 }, { py: yOffset, alpha: 0, duration, delay, ease: "power1.in" }) : tl.to(this.render, { py: this.render.py + yOffset, alpha: 0, duration, delay, ease: "power1.in" });
      return tl;
    };
    this.filterIn = (isBlock) => {
      const tl = this.makeTimeline("filterIn");
      const isEntering = !this.prev.active && this.cur.active;
      if (isBlock) {
        if (isEntering) {
          tl.set(this.render, { px: this.cur.x, py: this.cur.y }).set(this.render, {
            renderable: this.cur.active,
            delay: this.cur.time * c.filterDuration + 0.4 + c.filterBetweenGap
          });
        } else {
          tl.to(this.render, {
            px: this.cur.x,
            py: this.cur.y,
            ease: d3.easeQuadInOut,
            duration: 0.6,
            delay: this.prev.time * 0.4
          });
        }
      } else {
        tl.to(this.render, {
          alpha: 0,
          theta: this.prev.theta - Math.PI / 24,
          rotation: rotationOffset(this.prev.theta - Math.PI / 24),
          radius: this.prev.radius + 24,
          duration: 0.15,
          ease: d3.easeQuadInOut,
          delay: d3.easeQuadInOut(this.cur.time) * 0.3
        }).set(this.render, {
          alpha: 0,
          theta: this.cur.theta - Math.PI / 24,
          radius: this.cur.radius,
          rotation: rotationOffset(this.cur.theta - Math.PI / 24)
        }).set(this.render, {
          renderable: this.cur.active,
          delay: 0.05
        }).to(this.render, {
          theta: this.cur.theta,
          rotation: rotationOffset(this.cur.theta),
          alpha: 1,
          duration: 0.6,
          ease: d3.easeQuadInOut,
          delay: d3.easeQuadInOut(this.cur.time) * 0.4
        });
      }
      return tl;
    };
    this.filterOut = (isBlock) => {
      const tl = this.makeTimeline("filterOut");
      if (isBlock) {
        const active = this.cur.active;
        const delay = this.prev.time * c.filterDuration;
        tl.set(this.render, { renderable: active, delay }).to(this.render, {
          px: this.cur.x,
          py: this.cur.y,
          duration: c.filterDuration,
          delay: c.filterBetweenGap,
          ease: d3.easeQuadInOut
        });
      } else {
        const delayHalf1 = this.prev.time * 0.4;
        const durationStepHalf2 = 0.6 / 2;
        const isLeaving = this.prev.active && !this.cur.active;
        if (isLeaving) {
          tl.to(this.render, {
            theta: this.prev.theta + Math.PI / 8,
            rotation: rotationOffset(this.prev.theta + Math.PI / 8),
            radius: this.prev.radius + 24,
            alpha: 0,
            duration: 0.4,
            delay: delayHalf1,
            ease: d3.easeQuadIn
          }).set(this.render, { renderable: false });
        } else {
          tl.to(this.render, {
            theta: this.prev.theta - Math.PI / 24,
            rotation: rotationOffset(this.prev.theta - Math.PI / 24),
            radius: this.prev.radius - 24,
            alpha: 0,
            duration: durationStepHalf2,
            delay: delayHalf1 + c.filterBetweenGap,
            ease: d3.easeQuadIn
          }).set(this.render, {
            theta: this.cur.theta - Math.PI / 8,
            rotation: rotationOffset(this.cur.theta - Math.PI / 8),
            radius: this.cur.radius - 24
          }).to(this.render, {
            theta: this.cur.theta,
            rotation: rotationOffset(this.cur.theta),
            radius: this.cur.radius,
            alpha: 1,
            duration: durationStepHalf2,
            ease: d3.easeQuadOut
          });
        }
      }
      return tl;
    };
    this.sort = (isBlock) => {
      const tl = this.makeTimeline("sort");
      if (isBlock) {
        tl.to(this.render, {
          px: this.cur.x,
          py: this.cur.y,
          ease: d3.easeQuadInOut,
          duration: 0.6,
          delay: this.prev.time * 0.4
        });
      } else {
        tl.to(this.render, {
          theta: this.prev.theta - Math.PI / 24,
          radius: this.prev.radius + 24,
          rotation: rotationOffset(this.prev.theta - Math.PI / 24),
          alpha: 0,
          duration: 0.15,
          delay: d3.easeQuadInOut(this.cur.time) * 0.3,
          ease: d3.easeQuadInOut
        }).set(this.render, {
          theta: this.cur.theta - Math.PI / 24,
          rotation: rotationOffset(this.cur.theta - Math.PI / 24),
          radius: this.cur.radius,
          alpha: 0,
          renderable: this.cur.active
        }).to(this.render, {
          theta: this.cur.theta,
          rotation: rotationOffset(this.cur.theta),
          alpha: 1,
          duration: 0.6,
          ease: d3.easeQuadInOut,
          delay: d3.easeQuadInOut(this.cur.time) * 0.4
        });
      }
      return tl;
    };
    this.selected = (isSelected) => {
      if (isSelected) {
        const tl = this.makeTimeline();
        tl.to(this.render, { alpha: 0, scale: this.scale() * 2, duration: 0.3, ease: d3.easeQuadInOut }).set(this.render, { scale: this.scale() });
      }
    };
    this.complexity = () => {
      const tl = this.makeTimeline();
      tl.to(this.render, {
        scale: this.scale(),
        delay: Math.random() * 0.7,
        duration: 0.3,
        ease: d3.easeQuadInOut
      });
    };
    this.deliverable = deliverable;
    this.simulation = deliverable.simulation;
  }
  // Transitions
  play(transition) {
    const { type, attrId, layout } = transition;
    if (attrId) {
      this.prev = this.cur;
      this.cur = this.pop(attrId);
    }
    return this[type](layout === "block");
  }
}
function illustrationTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const edges = [
    [0, -size * 0.98],
    //top
    [size * 0.84, size * 0.84],
    //right
    [0, size],
    // bottom
    [-size * 0.84, size * 0.84]
    // left
  ];
  edges.forEach((edge) => {
    template.lineStyle(strokeWidth, 0);
    template.moveTo(0, 0);
    template.lineTo(...edge);
    template.endFill();
  });
  return template;
}
function editorialTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const triangle = [
    0,
    0,
    -size * 0.33,
    -size * 0.83,
    size * 0.33,
    -size * 0.83
  ];
  const square = [
    -size * 0.33,
    size * 0.5,
    size * 0.33,
    size * 0.5,
    size * 0.33,
    size * 0.66,
    -size * 0.33,
    size * 0.66
  ];
  const shapes = [triangle, square];
  shapes.forEach((shapePoints) => {
    template.lineStyle(strokeWidth, 0);
    template.drawPolygon(shapePoints);
    template.endFill();
  });
  return template;
}
function serviceTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const hline = [-size * 0.8, size * 0.33, size * 0.86, size * 0.33];
  const dline = [-size * 0.48, size * 0.85, size * 0.87, -size * 0.5];
  const lines = [hline, dline];
  template.lineStyle(strokeWidth, 0);
  lines.forEach((linePoints) => {
    for (let i = 0; i < linePoints.length; i += 2) {
      const points = linePoints.slice(i, i + 2);
      if (i === 0) {
        template.moveTo(...points);
      } else {
        template.lineTo(...points);
      }
    }
    template.endFill();
  });
  template.drawCircle(size * 0.15, 0, size * 0.5);
  template.endFill();
  return template;
}
function uiTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const uline = [
    -size * 0.83,
    -size * 0.5,
    size * 0.5,
    size * 0.83
  ];
  const lline = [
    -size * 0.83,
    -size * 0.17,
    size * 0.17,
    size * 0.83
  ];
  const lines = [uline, lline];
  lines.forEach((linePoints) => {
    template.lineStyle(strokeWidth, 0);
    for (let i = 0; i < linePoints.length; i += 2) {
      const points = linePoints.slice(i, i + 2);
      if (i === 0) {
        template.moveTo(...points);
      } else {
        template.lineTo(...points);
      }
    }
    template.endFill();
  });
  return template;
}
function motionTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  template.lineStyle(strokeWidth, 0);
  template.moveTo(-size * 0.17, size * 0.83);
  template.lineTo(size * 0.83, -size * 0.17);
  template.endFill();
  template.beginFill(16777215);
  template.lineStyle(strokeWidth, 0);
  template.drawCircle(size * 0.33, size * 0.33, size * 0.33 / 2);
  template.endFill();
  return template;
}
function datavis(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const dline = [0, 0, size * 0.65, -size * 0.65];
  const lline = [size * 0.65, -size * 0.65, size * 0.65 - size * 0.33, -size * 0.65];
  const rline = [size * 0.65, -size * 0.65, size * 0.65, -size * 0.65 + size * 0.33];
  const lines = [dline, lline, rline];
  template.lineStyle(strokeWidth, 0);
  lines.forEach((linePoints) => {
    for (let i = 0; i < linePoints.length; i += 2) {
      const points = linePoints.slice(i, i + 2);
      if (i === 0) {
        template.moveTo(...points);
      } else {
        template.lineTo(...points);
      }
    }
    template.endFill();
  });
  template.beginFill(16777215);
  template.lineStyle(strokeWidth, 0);
  template.drawCircle(size * 0.65, -size * 0.65, size * 0.15);
  template.endFill();
  return template;
}
function infograph(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const dline = [0, 0, -size * 0.75, -size * 0.75];
  const lline = [
    -size * 0.75,
    -size * 0.75 + size * 0.15,
    -size * 0.75,
    -size * 0.75,
    -size * 0.75 + size * 0.15,
    -size * 0.75
  ];
  const rline = [
    -size * 0.65,
    -size * 0.65 + size * 0.3,
    -size * 0.65,
    -size * 0.65,
    -size * 0.65 + size * 0.3,
    -size * 0.65
  ];
  const lines = [dline, lline, rline];
  template.lineStyle(strokeWidth, 0);
  lines.forEach((linePoints) => {
    for (let i = 0; i < linePoints.length; i += 2) {
      const points = linePoints.slice(i, i + 2);
      if (i === 0) {
        template.moveTo(...points);
      } else {
        template.lineTo(...points);
      }
    }
    template.endFill();
  });
  return template;
}
function otherInterfaces(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const yOffset = size * 0.15 / 2;
  const utriagnle = [
    -size * 0.33 / 2,
    0 - yOffset,
    size * 0.33 / 2,
    0 - yOffset,
    0,
    -size * 0.15 - yOffset
  ];
  const btriangle = [
    -size * 0.33 / 2,
    0 + yOffset,
    size * 0.33 / 2,
    0 + yOffset,
    0,
    -size * 0.15 + yOffset
  ];
  template.lineStyle(strokeWidth, 0);
  template.drawPolygon(utriagnle);
  template.endFill();
  template.beginFill(0);
  template.drawPolygon(btriangle);
  template.endFill();
  return template;
}
function infographicTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const otriangle = [0, 0, size * 0.5, size * 0.5, -size * 0.5, size * 0.5];
  template.lineStyle(strokeWidth, 0);
  template.drawPolygon(otriangle);
  template.endFill();
  const itriangle = [0, size * 0.33, size * 0.16, size * 0.5, -size * 0.16, size * 0.5];
  template.beginFill(0);
  template.drawPolygon(itriangle);
  template.endFill();
  return template;
}
function presentationTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  template.lineStyle(strokeWidth, 0);
  template.drawCircle(0, 0, size * 0.33 / 2);
  template.endFill();
  return template;
}
function getRegPolyPoints(cx, cy, size, sides, theta = 0) {
  const points = [];
  const radius = size * 0.5 / Math.cos(Math.PI / sides);
  const startAngle = Math.PI / sides + theta;
  const angle = 2 * Math.PI / sides;
  for (let i = 0; i < sides; i++) {
    const x = cx + radius * Math.cos(startAngle + angle * i);
    const y = cy + radius * Math.sin(startAngle + angle * i);
    points.push([x, y]);
  }
  return points;
}
function publicationTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const csquare = getRegPolyPoints(0, 0, size * 0.33, 4).flat();
  const usquare = [
    size * 0.33 / 2,
    -size * 0.15,
    size * 0.33 / 2,
    -size * 0.32,
    -size * 0.33 / 2,
    -size * 0.32,
    -size * 0.33 / 2,
    -size * 0.15
  ];
  template.beginFill(0);
  template.lineStyle(strokeWidth, 0);
  template.drawPolygon(csquare);
  template.endFill();
  template.lineStyle(strokeWidth, 0);
  template.drawPolygon(usquare);
  template.endFill();
  return template;
}
function reportTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const square = getRegPolyPoints(0, 0, size * 0.33, 4, Math.PI / 4).flat();
  template.beginFill(0);
  template.drawPolygon(square);
  template.endFill();
  return template;
}
function siteEditorialTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  template.beginFill(0);
  template.lineStyle(0);
  template.arc(0, 0, size * 0.33 / 2, -Math.PI / 4, Math.PI / 2 + Math.PI / 4);
  template.endFill();
  template.lineStyle(strokeWidth, 0);
  template.drawCircle(0, 0, size * 0.33 / 2);
  template.endFill();
  return template;
}
function siteInstitutionalTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const square = getRegPolyPoints(0, 0, size * 0.33, 4);
  const triangle = [...square];
  triangle.splice(3, 1);
  template.lineStyle(strokeWidth, 0);
  template.drawPolygon(square.flat());
  template.endFill();
  template.lineStyle(0);
  template.beginFill(0);
  template.drawPolygon(triangle.flat());
  template.endFill();
  return template;
}
function videoTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const triangle = [
    0,
    0,
    size * 0.12,
    size * 0.2252,
    -size * 0.12,
    size * 0.2252
  ];
  template.lineStyle(strokeWidth, 0);
  template.drawCircle(0, 0, size * 0.33 / 2);
  template.endFill();
  template.beginFill(0);
  template.drawPolygon(triangle);
  template.endFill();
  return template;
}
function consultingTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  template.beginFill(16777215);
  template.lineStyle(strokeWidth, 0);
  template.drawCircle(0, 0, size / 2);
  template.endFill();
  return template;
}
function digitalTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const points = getRegPolyPoints(0, 0, size, 4).flat();
  template.beginFill(16777215);
  template.lineStyle(strokeWidth, 0);
  template.drawPolygon(points);
  template.endFill();
  return template;
}
function printTemplate(template = new PIXI.Graphics(), size, strokeWidth) {
  if (size === void 0) {
    size = get_store_value(nodeSize);
  }
  if (strokeWidth === void 0) {
    strokeWidth = get_store_value(lineWidth);
  }
  const points = getRegPolyPoints(0, 0, size, 6).flat();
  template.beginFill(16777215);
  template.lineStyle(strokeWidth, 0, 1);
  template.drawPolygon(points);
  template.endFill();
  return template;
}
function goalTemplateFactory(id) {
  return async function(context, {
    anchor = [0.5, 0.9],
    rotateSprite = true
  } = {}) {
    const goals = get_store_value(categories).filter((d) => d.type === "goal");
    const index = goals.map((d) => d.id).indexOf(id);
    const goal = goals[index];
    return PIXI.Assets.load("petal").then((asset) => new PIXI.Sprite(asset)).then((sprite) => {
      sprite.anchor.set(...anchor);
      sprite.scale.set(get_store_value(nodeSize) / 25);
      sprite.tint = new PIXI.Color(goal.data.color).toNumber();
      sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      if (rotateSprite) {
        sprite.rotation = index * 2 * Math.PI / goals.length;
      }
      context.addChild(sprite);
    });
  };
}
const templates = {
  "channel.digital": digitalTemplate,
  "channel.impressa": printTemplate,
  "channel.consultoria": consultingTemplate,
  "product.site-editorial": siteEditorialTemplate,
  "product.outras-interfaces": otherInterfaces,
  "product.relatorios": reportTemplate,
  "product.apresentacao": presentationTemplate,
  "product.infografico": infographicTemplate,
  "product.publicacao": publicationTemplate,
  "product.site-institucional": siteInstitutionalTemplate,
  "product.video": videoTemplate,
  "design.user-interface": uiTemplate,
  "design.datavis": datavis,
  "design.ilustracao": illustrationTemplate,
  "design.design-de-servicos": serviceTemplate,
  "design.editorial": editorialTemplate,
  "design.infografia": infograph,
  "design.motion-graphics": motionTemplate,
  "goal.educacional": goalTemplateFactory("goal.educacional"),
  "goal.informacional": goalTemplateFactory("goal.informacional"),
  "goal.impacto-positivo": goalTemplateFactory("goal.impacto-positivo"),
  "goal.jornalistico-editorial": goalTemplateFactory("goal.jornalistico-editorial"),
  "goal.institucional": goalTemplateFactory("goal.institucional")
};
const primaryTints = [
  8555258,
  13565292
];
const secondaryTints = [
  7183868,
  16548461,
  16447874
];
const angles = Array.from({ length: 3 }).map((_2, i) => i / 3 * 360);
function getRandomSoundSprite() {
  const asset = PIXI.Assets.get("soundFX");
  const sprite = new PIXI.AnimatedSprite(asset.animations.tile);
  sprite.anchor.x = 0.5;
  sprite.anchor.y = 0.5;
  sprite.loop = false;
  sprite.zIndex = 10;
  sprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  sprite.angle = angles[Math.floor(Math.random() * angles.length)];
  sprite.tint = Math.random() < 0.66 ? primaryTints[Math.floor(Math.random() * primaryTints.length)] : secondaryTints[Math.floor(Math.random() * secondaryTints.length)];
  return sprite;
}
class DeliverableContext {
  constructor(deliverable, categories2) {
    this.context = new PIXI.Container();
    this.graphics = new PIXI.Graphics();
    this.ids = {
      background: [
        "design.ilustracao",
        "design.infografia",
        "design.motion-graphics",
        "design.editorial",
        "design.user-interface",
        "design.datavis",
        "design.design-de-servicos"
      ],
      base: [
        "channel.digital",
        "channel.impressa",
        "channel.consultoria"
      ],
      front: [
        "product.video",
        "product.publicacao",
        "product.apresentacao",
        "product.site-editorial",
        "product.site-institucional",
        "product.relatorios",
        "product.outras-interfaces"
      ],
      mask: [
        "product.infografico"
      ],
      sprite: [
        "goal.educacional",
        "goal.informacional",
        "goal.impacto-positivo",
        "goal.jornalistico-editorial",
        "goal.institucional"
      ]
    };
    this.toScene = (scene, ticker) => {
      ticker.add(this.tick);
      scene.addChild(this.context);
    };
    this.addGraphics = (id) => {
      let graphics;
      try {
        if (this.ids.sprite.includes(id)) {
          graphics = templates[id](this.context);
        } else if (this.ids.mask.includes(id)) {
          graphics = templates[id]();
          graphics.mask = new PIXI.Graphics(this.baseGraphics.geometry);
          graphics.addChild(graphics.mask);
          this.graphics.addChild(graphics);
        } else {
          graphics = templates[id](this.graphics);
        }
      } catch (e) {
        console.log(id, e, this.deliverable.categories);
      }
      return graphics;
    };
    this.onpointerenter = () => {
      hovered.set(this.deliverable);
    };
    this.onpointerleave = () => {
      hovered.set(null);
    };
    this.select = () => {
      selected.set(this.deliverable);
    };
    this.toggleEventMode = () => {
      const onSelectedState = !!this.deliverable.simulation.onSelectedState;
      const onTransition = this.deliverable.simulation.transition.running;
      this.context.eventMode = onSelectedState || onTransition ? "none" : "dynamic";
    };
    this.tick = () => {
      const { fx, fy, rotation, renderable, alpha, scale } = this.deliverable.attr.render;
      this.context.alpha = alpha;
      this.context.renderable = renderable;
      this.context.x = fx;
      this.context.y = fy;
      this.context.rotation = rotation;
      this.context.scale.set(scale);
    };
    this.deliverable = deliverable;
    this.context.alpha = 0;
    this.context.renderable = false;
    this.context.cursor = "pointer";
    this.context.eventMode = "none";
    this.context.onpointerenter = this.onpointerenter;
    this.context.onpointerleave = this.onpointerleave;
    this.context.onpointerup = this.select;
    this.context.addChild(this.graphics);
    this.graphics.cacheAsBitmap = true;
    const baseId = intersection(this.ids.base, categories2)[0];
    const bkgrIds = intersection(this.ids.background, categories2);
    const frntIds = intersection(this.ids.front, categories2);
    const maskIds = intersection(this.ids.mask, categories2);
    const sprtIds = intersection(this.ids.sprite, categories2);
    bkgrIds.forEach(this.addGraphics);
    this.baseGraphics = this.addGraphics(baseId);
    maskIds.forEach(this.addGraphics);
    frntIds.forEach(this.addGraphics);
    this.loading = Promise.all(sprtIds.map(this.addGraphics));
    return this;
  }
  animateSound() {
    const sprite = getRandomSoundSprite();
    sprite.x = this.context.x;
    sprite.y = this.context.y;
    this.context.parent.addChild(sprite);
    sprite.gotoAndPlay(0);
    sprite.onComplete = () => {
      this.context.parent.removeChild(sprite);
      sprite.destroy();
    };
  }
}
class Deliverable {
  constructor(simulation2, dataPoint) {
    this.active = true;
    this.selected = false;
    this.radius = () => this.active ? get_store_value(nodeSize) : 0;
    this.tick = () => {
      if (this.simulation.onSelectedState && this.selected) ;
      else if (this.simulation.onSelectedState === true && !this.selected) {
        this.fx = void 0;
        this.fy = void 0;
        this.attr.render.fx = this.x;
        this.attr.render.fy = this.y;
      } else if (this.simulation.onSelectedState === "leaving" && !this.selected) {
        this.attr.render.fy = this.y + this.attr.render.py;
      } else {
        const { theta, radius, px, py } = this.attr.render;
        this.fx = this.attr.render.fx = Math.cos(theta) * radius + px;
        this.fy = this.attr.render.fy = Math.sin(theta) * radius + py;
      }
    };
    this.setActive = (fyears2, findustries2, fdesigns2, fgoals2, fproducts2) => {
      this.active = !(fyears2 && (this.year < fyears2[0] || this.year > fyears2[1]) || fdesigns2 && fdesigns2.length > 0 && !this.designs.some((design) => fdesigns2.includes(design)) || fgoals2 && fgoals2.length > 0 && !this.goals.some((goal) => fgoals2.includes(goal)) || fproducts2 && fproducts2.length > 0 && !this.products.some((product) => fproducts2.includes(product)) || findustries2 && findustries2.length > 0 && !findustries2.includes(this.industry));
    };
    this.handleSelected = (selected2) => {
      this.selected = selected2 && this.id === selected2.id;
      this.context.toggleEventMode();
      this.attr.selected(this.selected);
    };
    this.simulation = simulation2;
    this.id = dataPoint.id;
    this.client = dataPoint.client;
    this.project = dataPoint.project;
    this.description = dataPoint.description;
    this.complexity = dataPoint.complexity;
    this.dt = dataPoint.dt;
    this.date = dataPoint.date;
    this.year = dataPoint.year;
    this.channel = dataPoint.channel;
    this.industry = dataPoint.industry;
    this.designs = dataPoint.design;
    this.goals = dataPoint.goal;
    this.products = dataPoint.product;
    this.categories = [
      dataPoint.channel,
      dataPoint.industry,
      ...dataPoint.design,
      ...dataPoint.goal,
      ...dataPoint.product
    ].flat();
    this.attr = new AttributeController(this);
    this.context = new DeliverableContext(this, this.categories);
  }
}
class NodeAttributes {
  constructor(id, attr) {
    this.id = id;
    this.active = attr.active;
    this.x = attr.x;
    this.y = attr.y;
    this.radius = attr.radius;
    this.theta = attr.theta;
    this.time = attr.time;
  }
}
const ongoing = writable(false);
const contentKeyIdx = writable();
class TransitionController {
  constructor(simulation2) {
    this.queue = [];
    this.firstTransition = false;
    this.running = false;
    this.updateState = (transition) => {
      const prev = this.cur;
      this.cur = transition;
      this.running = !!transition;
      if (!this.running && prev && prev.type === "exit") return;
      this.simulation.handleTransition(this.running);
      this.simulation.getDeliverableNodes().forEach((node) => node.context.toggleEventMode());
    };
    this.add = (options, playNext = true) => {
      if (this.simulation.onSelectedState) {
        this.cleanQueue();
        this.addSelectedLeaving(options);
        return;
      }
      this.queue.push(options);
      playNext && this.playNext();
    };
    this.addSelectedLeaving = (options) => {
      const { attrId, layout, layoutSize } = options;
      const onStart = () => {
        this.simulation.onSelectedState = "leaving";
      };
      const onComplete = () => {
        this.simulation.onSelectedState = false;
      };
      this.queue.push({ type: "exit", onStart, onComplete });
      this.queue.push({ type: "entrance", attrId, layout, layoutSize });
    };
    this.playNext = (forceRun = false) => {
      if (!forceRun && (this.running || this.queue.length === 0)) {
        return;
      }
      const transition = this.queue.shift();
      transition.onStart && transition.onStart();
      this.updateState(transition);
      if (transition.layout) {
        const { layout, layoutSize, layoutData } = transition;
        const moveOptions = {
          duration: transition.type === "entrance" ? 0 : 750
        };
        this.simulation.zoom.updateTranslateExtent(layout, layoutSize).updateScaleExtent(layout).reposition(layout, moveOptions);
      }
      const nodeTransitions = this.simulation.getDeliverableNodes().map((node) => node.attr.play(transition).then());
      this.simulation.interface.setInterfaceLabels(transition);
      Promise.all(nodeTransitions).catch((error) => console.error("Transition failed:", error)).finally(() => {
        this.updateState();
        transition.onComplete && transition.onComplete();
        if (!this.firstTransition) {
          this.firstTransition = true;
          ongoing.set(true);
        }
        this.playNext();
      });
    };
    this.cleanQueue = () => {
      while (this.queue.length) {
        const { attrId } = this.queue.pop();
        if (attrId) {
          this.simulation.getDeliverableNodes().forEach((node) => node.attr.pop(attrId));
        }
      }
    };
    this.simulation = simulation2;
  }
}
const cameraOffsetX = writable(0);
const cameraOffsetY = writable(0);
const zoom = writable(1);
class DummyDeliverable {
  constructor(simulation2) {
    this.id = -1;
    this.fx = 0;
    this.fy = 0;
    this.r = 0;
    this.radius = () => this.r;
    this.tick = () => {
    };
    this.handleSelected = (selected2) => {
      const tl = gsap.timeline({ overwrite: "auto", onUpdate: this.simulation.updateForceCollideRadius });
      if (selected2) {
        const { fx, fy } = selected2.attr.render;
        let r;
        tl.set(this, { fx, fy, r: 0 });
        if (get_store_value(width) < 768) {
          r = Math.max(get_store_value(figureWidth), get_store_value(figureHeight)) * 0.95 * (1 / get_store_value(zoom));
        } else {
          const tx = -get_store_value(cameraOffsetX);
          const ty = -get_store_value(cameraOffsetY);
          r = Math.max(get_store_value(figureWidth), get_store_value(figureHeight)) * 0.4;
          tl.to(this, { fx: tx, fy: ty, duration: 0.3, ease: d3.easeQuadInOut });
        }
        tl.to(this, { r, duration: 0.15, ease: d3.easeCubicInOut }, "<");
      } else {
        tl.set(this, { r: 0 });
      }
    };
    this.simulation = simulation2;
  }
}
function polarAngle(p1, p2) {
  return Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
}
function orientation(p, q, r) {
  const val = (q[1] - p[1]) * (r[0] - q[0]) - (q[0] - p[0]) * (r[1] - q[1]);
  if (val === 0) {
    return 0;
  }
  return val > 0 ? 1 : 2;
}
function grahamScan(points) {
  const n = points.length;
  if (n < 3) {
    return points;
  }
  const pivot = points.reduce((min, p) => p[1] < min[1] || p[1] === min[1] && p[0] < min[0] ? p : min, points[0]);
  const sortedPoints = points.slice().sort((p1, p2) => polarAngle(pivot, p1) - polarAngle(pivot, p2));
  const convexHull = [pivot, sortedPoints[0], sortedPoints[1]];
  for (let i = 2; i < n; i++) {
    while (convexHull.length > 1 && orientation(convexHull[convexHull.length - 2], convexHull[convexHull.length - 1], sortedPoints[i]) !== 1) {
      convexHull.pop();
    }
    convexHull.push(sortedPoints[i]);
  }
  return convexHull;
}
const LINK_STYLES = {
  alpha: 1,
  alphaHover: 1,
  lineWidth: 2,
  lineWidthHover: 4,
  radius: 0,
  join: PIXI.LINE_JOIN.ROUND,
  cap: PIXI.LINE_CAP.ROUND
};
class DeliverableGroup {
  constructor(simulation2, id, deliverables, color) {
    this.context = new PIXI.Graphics();
    this.active = false;
    this.hovered = false;
    this.render = {
      lineWidth: LINK_STYLES.lineWidth,
      radius: LINK_STYLES.radius,
      alpha: LINK_STYLES.alpha,
      renderable: false
    };
    this.toScene = (scene, ticker) => {
      scene.addChild(this.context);
      ticker.add(this.tick);
    };
    this.tick = () => {
      this.context.clear();
      this.context.renderable = this.render.renderable;
      const coordinates = this.deliverables.filter((d) => d.active).map((node) => grahamScan([node.attr.render.fx, node.attr.render.fy]));
      if (coordinates.length < 2) {
        return;
      }
      const lineStyle = {
        width: this.render.lineWidth,
        color: this.color,
        alpha: this.render.alpha,
        join: LINK_STYLES.join,
        cap: LINK_STYLES.cap
      };
      this.context.lineStyle(lineStyle);
      const [x0, y0] = coordinates[0];
      this.context.moveTo(x0, y0);
      coordinates.slice(1).forEach(([x, y]) => {
        this.context.lineTo(x, y);
      });
      this.context.lineStyle(0);
      this.context.beginFill(this.color, this.render.alpha);
      coordinates.forEach(([x, y]) => {
        this.context.drawCircle(x, y, this.render.radius);
      });
      this.context.endFill();
    };
    this.setHovered = (isHovered) => {
      const prevHovered = this.hovered;
      this.hovered = isHovered;
      if (prevHovered !== this.hovered) {
        const lineWidth2 = isHovered ? LINK_STYLES.lineWidthHover : LINK_STYLES.lineWidth;
        const alpha = isHovered ? LINK_STYLES.alphaHover : LINK_STYLES.alpha;
        const radius = isHovered ? get_store_value(nodeSize) : LINK_STYLES.radius;
        gsap.to(this.render, {
          lineWidth: lineWidth2,
          alpha,
          radius,
          duration: 0.3,
          ease: d3.easeCubicInOut,
          overwrite: "auto"
        });
      }
    };
    this.setActive = (isActive) => {
      const prev = this.active;
      const cur = isActive;
      this.active = cur;
      if (prev === cur) {
        return;
      }
      const tl = gsap.timeline({ overwrite: true });
      if (!prev && cur) {
        tl.set(this.render, { lineWidth: 0, alpha: 0, renderable: true }).to(this.render, { lineWidth: LINK_STYLES.lineWidth, duration: 0.5, ease: "elastic.out(2,1)", delay: Math.random() }).to(this.render, { alpha: LINK_STYLES.alphaHover * 0.5, duration: 0.5, ease: "power2.out" }, "<").to(this.render, { alpha: LINK_STYLES.alpha, duration: 0.5, ease: "power2.in" });
      } else if (prev && !cur) {
        tl.set(this.render, { alpha: LINK_STYLES.alpha, renderable: false });
      }
    };
    this.simulation = simulation2;
    this.id = id;
    this.deliverables = deliverables;
    this.color = color;
    this.context.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  }
}
function center(range) {
  return range[0] + (range[1] - range[0]) / 2;
}
class SignalController {
  constructor(id) {
    this.rejected = false;
    this.setVisibility = (to) => {
      const el = document.getElementById(this.id);
      if (!el) {
        return;
      }
      const tl = gsap.timeline({ overwrite: true });
      if (to) {
        tl.set(el, { display: "block" }).fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.5 });
      } else {
        tl.fromTo(el, { opacity: 1 }, { opacity: 0, duration: 0.5 }).set(el, { display: "none" });
      }
    };
    this.id = id;
  }
  prepare() {
    if (this.rejected || this.timeoutId) {
      return;
    }
    this.timeoutId = setTimeout(() => {
      this.setVisibility(true);
    }, 5e3);
  }
  stop() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = void 0;
    }
    this.setVisibility(false);
  }
  kill() {
    this.stop();
    this.rejected = true;
  }
}
class ZoomController {
  constructor(simulation2) {
    this.initialized = false;
    this.userActions = true;
    this.curTranslateExtentExceedsViewport = false;
    this.initZoom = (zoomBase) => {
      this.zoomBase = zoomBase;
      d3.select(this.zoomBase).call(this.zoom).on("pointerup", this.handlePointerUp);
    };
    this.onZoomStart = (e) => {
      this.dragging = false;
      this.dragT0 = Date.now();
      this.startEvent = e;
    };
    this.onZoomEnd = (e) => {
      this.dragging = false;
      this.dragT0 = void 0;
    };
    this.zoomed = (e) => {
      if (!!get_store_value(selected)) {
        return;
      }
      const { x, y, k } = e.transform;
      if (this.startEvent.sourceEvent) {
        const x0 = this.startEvent.transform.x;
        const y0 = this.startEvent.transform.y;
        const k0 = this.startEvent.transform.k;
        if (x0 !== x || y0 !== y) {
          this.panSignal.kill();
        }
        if (k0 !== k) {
          this.pinchSignal.kill();
        }
      }
      this.dragging = Date.now() - this.dragT0 >= 150;
      zoom.set(k);
      cameraOffsetX.set(x);
      cameraOffsetY.set(y);
    };
    this.handleWheel = (e) => {
      e.preventDefault();
    };
    this.handlePointerUp = (e) => {
      if (this.dragging) return;
      const { clientX, clientY } = e;
      d3.select("#canvas").node().dispatchEvent(new PointerEvent("pointerup", { clientX, clientY }));
    };
    this.getLayoutTranslateExtent = (layout, size) => {
      const s_nodeSize = get_store_value(nodeSize);
      const s_fw = get_store_value(figureWidth);
      const s_fh = get_store_value(figureHeight);
      let extentX = [0, s_fw];
      let extentY = [0, s_fh];
      if (layout === "block") {
        const margin = s_nodeSize;
        const exceedY = size.height + s_nodeSize - s_fh;
        if (exceedY > 0) {
          extentY = [
            -(exceedY / 2 + margin),
            +(exceedY / 2 + margin) + s_fh
          ];
        }
      } else {
        const margin = s_nodeSize * 3;
        const exceedX = size.width - s_fw;
        const exceedY = size.height - s_fh;
        if (exceedX > 0) {
          extentX = [
            -(exceedX / 2 + margin),
            +(exceedX / 2 + margin) + s_fw
          ];
        }
        if (exceedY > 0) {
          extentY = [
            -(exceedY / 2 + margin),
            +(exceedY / 2 + margin) + s_fh
          ];
        }
      }
      const extent = d3.range(2).map((i) => {
        return [extentX[i], extentY[i]];
      });
      return extent;
    };
    this.updateTranslateExtent = (layout, size) => {
      if (!this.initialized) {
        return this;
      }
      if (size) {
        this.curTranslateExtent = this.getLayoutTranslateExtent(layout, size);
        this.curTranslateExtentExceedsViewport = this.curTranslateExtent[0][0] < 0 || this.curTranslateExtent[0][1] < 0;
        this.curTranslateExtentCenter = [
          center(this.curTranslateExtent.map((d) => d[0])),
          center(this.curTranslateExtent.map((d) => d[1]))
        ];
        this.zoom.translateExtent(this.curTranslateExtent);
        if (this.curTranslateExtentExceedsViewport) {
          this.panSignal.prepare();
        } else {
          this.panSignal.stop();
        }
      }
      return this;
    };
    this.updateScaleExtent = (layout, windowWidth) => {
      console.log("UPDATESCALEEXTENT");
      if (!this.initialized) {
        return this;
      }
      if (windowWidth === void 0) {
        windowWidth = get_store_value(width);
      }
      let scaleExtent = [1, 1];
      let k = 1;
      let preparePinchSignal = false;
      if (layout === "radial" && windowWidth < 768) {
        scaleExtent = [0.3, 1];
        k = 0.5;
        preparePinchSignal = this.curTranslateExtentExceedsViewport;
      } else if (layout === "radial" && windowWidth >= 768) {
        scaleExtent = [0.8, 1];
        k = 1;
      }
      if (preparePinchSignal) {
        this.pinchSignal.prepare();
      } else {
        this.pinchSignal.stop();
      }
      this.curScaleIdeal = k;
      this.curScaleExtent = scaleExtent;
      this.zoom.scaleExtent(this.curScaleExtent);
      return this;
    };
    this.simulation = simulation2;
    this.pinchSignal = new SignalController("pinch-signal");
    this.panSignal = new SignalController("pan-signal");
    this.zoom = d3.zoom().on("zoom", this.zoomed).on("start", this.onZoomStart).on("end", this.onZoomEnd);
    this.initialized = true;
    return this;
  }
  reposition(layout, moveOptions) {
    const k = this.curScaleIdeal;
    let x;
    let y;
    if (layout === "block") {
      x = 0;
      y = -this.curTranslateExtent[0][1];
    } else {
      x = k === 1 ? 0 : this.curTranslateExtentCenter[0];
      y = k === 1 ? 0 : this.curTranslateExtentCenter[1];
    }
    const transform = new d3.ZoomTransform(k, k * x, k * y);
    let node = d3.select(this.zoomBase);
    if (moveOptions) {
      node = node.transition().duration(moveOptions.duration).ease(d3.easeCubicInOut);
    }
    node.call(this.zoom.transform, transform);
    return this;
  }
}
class SoundController {
  constructor(simulation2) {
    this.initialized = false;
    this.volPlayer = -5;
    this.volSynth = -15;
    this.columnTime = "12n";
    this.playing = false;
    this.stepCounter = 0;
    this.patternLength = 4;
    this.notes = _.range(3, 4 + 1).map((octave) => {
      return ["C", "D", "E", "G", "A"].map((note) => {
        return note + octave;
      });
    }).flat();
    this.noteIdx = 8;
    this.noteIncrement = -1;
    this.filterNext = false;
    this.reverbNext = false;
    this.release = 20;
    this.releaseMax = 30;
    this.releaseMin = 5;
    this.attack = 0.2;
    this.attackMax = 0.4;
    this.attackMin = 5e-3;
    this.snareCounter = 0;
    this.tick = (time) => {
      if (!this.playing || !_.isNumber(this.stepCounter)) return;
      const stepIdx = this.stepCounter % this.simulation.activeCount;
      const patternIdx = Math.floor(stepIdx / this.patternLength);
      const columnIdx = stepIdx % this.patternLength;
      const evenPattern = patternIdx % 2 === 0;
      const node = this.simulation.getDeliverableNodes().find((d) => d.active && d.i === stepIdx);
      const nodesInPattern = this.simulation.getDeliverableNodes().filter((d) => Math.floor(d.i / this.patternLength) === patternIdx);
      if (!node) return;
      let shouldAnimate = false;
      const { categories: categories2 } = node;
      if (categories2.includes("product.outras-interfaces")) {
        this.incrementNoteFrequency(2);
      }
      if (categories2.includes("goal.jornalistico-editorial")) {
        this.filterNext = true;
      }
      if (categories2.includes("goal.impacto-positivo")) {
        this.reverbNext = true;
      }
      if (categories2.includes("design.editorial")) {
        gsap.fromTo(
          this,
          { release: this.releaseMax },
          {
            release: this.releaseMin,
            duration: 2,
            ease: "power2.inOut",
            overwrite: "auto"
          }
        );
      }
      if (categories2.includes("design.datavis")) {
        gsap.fromTo(
          this,
          { attack: this.attackMax },
          {
            attack: this.attackMin,
            duration: 2.5,
            overwrite: "auto"
          }
        );
      }
      if (columnIdx % 2 === 0) {
        if (categories2.includes("design.infografia")) {
          shouldAnimate = true;
          this.drumPlayers.hihatClosed.start(time);
        }
        if (categories2.includes("design.user-interface") || categories2.includes("design.design-de-servicos")) {
          shouldAnimate = true;
          this.drumPlayers.hihatOpen.start(time);
        }
        if (categories2.includes("industry.comunicacao")) {
          shouldAnimate = true;
          this.drumPlayers.clapPingPong.start(time);
        }
      } else {
        if (categories2.includes("industry.educacao")) {
          shouldAnimate = true;
          this.drumPlayers.rimPingPong.start(time);
        }
      }
      if (columnIdx === 0) {
        if (nodesInPattern.filter((d) => d.categories.includes("product.video")).length >= 3) {
          this.noteIncrement = this.noteIncrement * -1;
        }
        if (categories2.includes("channel.digital")) {
          shouldAnimate = true;
          const note = this.notes[this.noteIdx];
          let poly = new Tone.PolySynth().toDestination();
          poly.set({ envelope: { attack: this.attack, release: this.release } });
          poly.volume.value = this.volSynth;
          if (this.filterNext) {
            poly.connect(this.autoFilter);
            this.filterNext = false;
          }
          if (this.reverbNext) {
            poly.connect(this.reverb);
            this.reverbNext = false;
          }
          poly.triggerAttackRelease(note, "8n");
          Tone.getTransport().scheduleOnce(() => {
            poly.dispose();
            poly = null;
          }, Tone.now() + Tone.Time("2n").toSeconds());
        }
        if (evenPattern && categories2.includes("design.ilustracao")) {
          shouldAnimate = true;
          const playerKey = categories2.includes("goal.educacional") ? "kickPingPong" : "kick";
          this.drumPlayers[playerKey].start(time);
        }
        if (categories2.includes("design.motion-graphics")) {
          if (!categories2.includes("product.outras-interfaces")) {
            this.incrementNoteFrequency();
          }
          this.snareCounter++;
          shouldAnimate = true;
          const playerKey = this.snareCounter % 3 === 0 ? "snarePingPong" : "snare";
          this.drumPlayers[playerKey].start(time);
        }
      }
      if (shouldAnimate) this.animate(node);
      this.stepCounter++;
    };
    this.simulation = simulation2;
  }
  loadPlayers(baseURL) {
    const soundURL = (route) => baseURL + route;
    this.autoFilter = new Tone.AutoFilter({ frequency: 15, wet: 0.8, depth: 0.9 }).toDestination();
    this.reverb = new Tone.Reverb(3).toDestination();
    this.pingPong = new Tone.PingPongDelay("4n", 0.2).toDestination();
    const drumReverb = new Tone.Convolver(soundURL("/small-drum-room.wav")).toDestination();
    const snarePanner = new Tone.Panner().connect(drumReverb);
    new Tone.LFO(0.13, -0.25, 0.25).connect(snarePanner.pan);
    this.drumPlayers = {
      kick: new Tone.Player(soundURL("/808-kick-vm.mp3")).toDestination(),
      snare: new Tone.Player(soundURL("/flares-snare-vm.mp3")).connect(snarePanner),
      hihatClosed: new Tone.Player(soundURL("/808-hihat-vm.mp3")).connect(new Tone.Panner(-0.5).connect(drumReverb)),
      hihatOpen: new Tone.Player(soundURL("/808-hihat-open-vm.mp3")).connect(new Tone.Panner(-0.5).connect(drumReverb)),
      tomLow: new Tone.Player(soundURL("/slamdam-tom-low-vm.mp3")).connect(new Tone.Panner(-0.4).connect(drumReverb)),
      tomMid: new Tone.Player(soundURL("/slamdam-tom-mid-vm.mp3")).connect(drumReverb),
      tomHigh: new Tone.Player(soundURL("/slamdam-tom-high-vm.mp3")).connect(new Tone.Panner(0.4).connect(drumReverb)),
      clap: new Tone.Player(soundURL("/909-clap-vm.mp3")).connect(new Tone.Panner(0.5).connect(drumReverb)),
      rim: new Tone.Player(soundURL("/909-rim-vm.wav")).connect(new Tone.Panner(0.5).connect(drumReverb))
    };
    Object.entries(this.drumPlayers).forEach(([key, player]) => {
      player.volume.value = this.volPlayer;
      const pingPongPlayer = new Tone.Player(player.buffer).connect(this.pingPong);
      pingPongPlayer.volume.value = this.volPlayer;
      this.drumPlayers[key + "PingPong"] = pingPongPlayer;
    });
  }
  init() {
    Promise.all([Tone.start(), Tone.loaded()]).then(() => {
      new Tone.Loop(this.tick, this.columnTime).start(0);
      Tone.getTransport().start();
      this.initialized = true;
    });
  }
  resetParams() {
    this.stepCounter = 0;
    this.release = 20;
    this.attack = 0.2;
    this.snareCounter = 0;
    this.filterNext = false;
    this.reverbNext = false;
    this.noteIdx = 8;
    this.noteIncrement = -1;
  }
  togglePlaying() {
    if (!this.initialized) {
      this.init();
    }
    this.resetParams();
    this.playing = !this.playing;
    return this.playing;
  }
  animate(node) {
    node.context.animateSound();
  }
  incrementNoteFrequency(k = 1) {
    let idx = this.noteIdx + this.noteIncrement * k;
    if (idx < 0 || idx >= this.notes.length) {
      this.noteIncrement = this.noteIncrement * -1;
      idx = this.noteIdx + this.noteIncrement * k;
    }
    this.noteIdx = idx;
  }
}
function getFontSizeLabel() {
  document.querySelector(".text-xxs");
  const computedStyle = getComputedStyle(root);
  return +computedStyle.fontSize.replace("px", "");
}
const ease = "power2.out";
class LayoutLabel {
  constructor(parent, sectorTitleData, radius, translate) {
    this.translate = translate;
    this.title = sectorTitleData.title;
    this.theta = sectorTitleData.thetaMin;
    this.outer = new PIXI.Container();
    this.inner = new PIXI.Container();
    this.text = new PIXI.Text("", {
      fontSize: getFontSizeLabel(),
      fontFamily: ["Rational", "monospace"],
      fontWeight: "300"
    });
    this.text.alpha = 0;
    this.inner.x = radius + get_store_value(nodeSize) * 1.5;
    this.inner.y = -get_store_value(nodeSize) * 1.75;
    this.outer.rotation = this.theta;
    this.inner.addChild(this.text);
    this.outer.addChild(this.inner);
    parent.addChild(this.outer);
    this.enter();
    return this;
  }
  enter() {
    this.updateText();
    this.entranceTl = gsap$1.timeline().to(this.text, {
      alpha: 1,
      duration: 1,
      delay: 0.75,
      ease
    }).from(this.outer, {
      rotation: this.theta - Math.PI / 16,
      duration: 1,
      ease
    }, "<");
    console.groupEnd();
  }
  toggleOpacity(to) {
    gsap$1.to(this.outer, {
      alpha: to,
      duration: 0.25,
      ease
    });
  }
  exit() {
    if (this.entranceTl.isActive()) {
      this.entranceTl.kill();
    }
    gsap$1.timeline({ overwrite: true }).to(this.outer, {
      alpha: 0,
      duration: 0.25
    }, "<").call(() => {
      this.outer.destroy({ children: true });
    });
  }
  updateText() {
    const { translate, title, text, theta } = this;
    text.text = (translate ? get_store_value($format)(title) : title).toLowerCase();
    if (theta >= Math.PI / 2 && theta <= 3 * Math.PI / 2) {
      text.pivot.set(text.width, text.height);
      text.rotation = Math.PI;
      text.style.align = "right";
    } else {
      text.style.align = "left";
    }
  }
}
class LayoutInterface {
  constructor(simulation2) {
    this.context = new PIXI.Container();
    this.nodes = [];
    this.queue = [];
    this.pop = (attrId) => {
      const attrIdx = this.queue.findIndex((d) => d.id === attrId);
      if (attrIdx === -1) return;
      const attr = this.queue.splice(attrIdx, 1)[0];
      return attr;
    };
    this.simulation = simulation2;
  }
  toScene(scene, ticker) {
    ticker.add(this.tick);
    scene.addChild(this.context);
  }
  enqueue(attrId, layoutData) {
    this.queue.push({
      id: attrId,
      ...layoutData
    });
  }
  toggleOpacity(to) {
    this.nodes.forEach((node) => node.toggleOpacity(to));
  }
  setInterfaceLabels(transition) {
    while (this.nodes.length) {
      const node = this.nodes.pop();
      if (node) {
        node.exit();
      }
    }
    const { type, attrId } = transition;
    if (attrId) {
      this.prev = this.cur;
      this.cur = this.pop(attrId);
    }
    if (!this.cur || type === "exit") return;
    const { sectorTitleData, minRadius, translate } = this.cur;
    sectorTitleData.forEach((sectorTitleDataPoint, i) => {
      const layoutLabel = new LayoutLabel(this.context, sectorTitleDataPoint, minRadius, translate);
      this.nodes.push(layoutLabel);
    });
  }
  updateText() {
    "updateText";
    if (!this.cur) return;
    this.nodes.forEach((node) => {
      node.updateText();
    });
  }
  tick() {
  }
}
const c = {};
c.shifts = 1;
c.maxDelayRadial = 0.7 * c.shifts;
c.colEntranceUpTo = c.shifts * 0.2;
c.fullColEntranceMaxDuration = c.shifts - c.colEntranceUpTo;
c.filterTotalDuration = c.shifts;
c.filterBetweenGap = c.filterTotalDuration * 0.15;
c.filterDuration = c.filterTotalDuration - c.filterBetweenGap;
c.maxDurationRadial = c.shifts - c.maxDelayRadial;
class Simulation {
  constructor() {
    this.onSelectedState = false;
    this.initialized = false;
    this.activeIds = [];
    this.activeCount = 0;
    this.attrId = 0;
    this.nodes = [];
    this.clients = [];
    this.projects = [];
    this.forceCollideRadius = (node) => node.radius();
    this.ticked = () => this.nodes.forEach((node) => node.tick());
    this.initSimulation = () => {
      this.forceCollide = d3.forceCollide().radius(this.forceCollideRadius);
      this.forceX = d3.forceX().strength(5e-3);
      this.forceY = d3.forceY().strength(5e-3);
      this.forceSimulation = d3.forceSimulation().alphaTarget(0.3).velocityDecay(0.25).force("charge", d3.forceManyBody().strength(-5)).force("x", this.forceX).force("y", this.forceY).force("collide", this.forceCollide).nodes(this.nodes).on("tick", this.ticked);
    };
    this.updateCategories = () => {
      const activeNodes = this.getDeliverableNodes().filter((d) => d.active);
      categoriesEnriched.set(
        get_store_value(categories).map((category) => {
          const enriched = { ...category };
          if (["product", "design", "industry"].includes(category.type)) {
            const filter_ = (node) => node.categories.includes(category.id);
            enriched.nNodes = activeNodes.filter(filter_).length;
            enriched.pctNodes = activeNodes.length > 0 ? +(enriched.nNodes / activeNodes.length).toFixed(2) : 0;
          }
          return enriched;
        })
      );
    };
    this.chainNodesBlockAttr = (attrId) => {
      const s_nodeSize = get_store_value(nodeSize);
      const s_gap = get_store_value(gap);
      const s_fw = get_store_value(figureWidth);
      const s_fh = get_store_value(figureHeight);
      const aspectRatio = s_fw / s_fh;
      const initRows = Math.ceil(Math.sqrt(this.activeCount / aspectRatio));
      const initColumns = Math.ceil(aspectRatio * initRows);
      let rows = Math.ceil(this.activeCount / initColumns);
      let columns = initColumns;
      let blockWidth = (columns + 1) * (s_nodeSize + s_gap) - s_gap;
      let blockHeight;
      while (blockWidth > s_fw) {
        blockWidth = --columns * (s_nodeSize + s_gap) - s_gap;
        rows = Math.ceil(this.activeCount / columns);
      }
      blockWidth = --columns * (s_nodeSize + s_gap) - s_gap;
      rows = Math.ceil(this.activeCount / columns);
      blockHeight = rows * (s_nodeSize + s_gap) - s_gap;
      const columnDensities = randomDensity(columns);
      const timeStepByRow = +(c.fullColEntranceMaxDuration / rows).toFixed(4);
      this.getDeliverableNodes().forEach((node) => {
        const attr = { x: 0, y: 0, radius: 0, theta: 0, time: 0, active: node.active };
        if (node.active) {
          const colIndex = Math.floor(node.i % columns);
          const rowIndex = Math.floor(node.i / columns);
          attr.x = colIndex * (s_nodeSize + s_gap) + s_nodeSize / 2 - blockWidth / 2;
          attr.y = rowIndex * (s_nodeSize + s_gap) + s_nodeSize / 2 - blockHeight / 2;
          attr.time = columnDensities[colIndex] * c.colEntranceUpTo + // column delay
          timeStepByRow * rowIndex;
        }
        node.attr.set(new NodeAttributes(attrId, attr));
      });
      const layoutSize = {
        width: blockWidth,
        height: blockHeight
      };
      return { layoutSize };
    };
    this.chainNodesRadialAttr = (attrId) => {
      const s_nodeSize = get_store_value(nodeSize);
      const s_fw = get_store_value(figureWidth);
      const s_fh = get_store_value(figureHeight);
      const s_sortBy = get_store_value(sortBy);
      const groupBy = s_sortBy === "dt" ? "year" : "industry";
      const data = this.getDeliverableNodes().filter((node) => node.active);
      const radialGap = s_nodeSize * 1.75;
      const stackGap = s_nodeSize * 1;
      const maxStack = this.activeCount ** (1 / 3);
      let curSectorData;
      let curSectorMetadata;
      let curRadius = Math.min(s_fw, s_fh) * 0.05;
      let isFitting = true;
      do {
        const circleLength = 2 * Math.PI * curRadius;
        const pileStacks = d3.range(1, maxStack + 1, 1);
        pileStacks.forEach((pileStack) => {
          const sectorData2 = makeSectorData(data, groupBy, pileStack);
          curSectorData = sectorData2[0];
          curSectorMetadata = sectorData2[1];
          const layoutCircleLength = (curSectorMetadata.nPiles + curSectorMetadata.nGaps) * radialGap;
          isFitting = circleLength < layoutCircleLength;
        });
        curRadius += stackGap;
      } while (isFitting);
      const sectorData = curSectorData;
      const sectorMetadata = curSectorMetadata;
      const minRadius = curRadius;
      const thetaScale = d3.scaleLinear().domain([0, sectorMetadata.nPiles + sectorMetadata.nGaps]).range([0, 2 * Math.PI]);
      const timeScale = d3.scaleLinear().domain([0, 2 * Math.PI]).range([0, c.maxDelayRadial]);
      let minX = 0;
      let maxX = 0;
      let minY = 0;
      let maxY = 0;
      const attributes = [];
      this.getDeliverableNodes().forEach((node) => {
        const attr = { x: 0, y: 0, theta: 0, radius: 0, time: 0, active: node.active };
        const sectorDataPoint = sectorData.find((d) => d.id === node.id);
        if (sectorDataPoint) {
          const { sectorIndex, pileIndex, inPileIndex, sectorName } = sectorDataPoint;
          attr.theta = thetaScale(pileIndex + sectorIndex);
          attr.radius = minRadius + inPileIndex * (stackGap + s_nodeSize);
          attr.x = Math.cos(attr.theta) * attr.radius;
          attr.y = Math.sin(attr.theta) * attr.radius;
          attr.time = timeScale(attr.theta);
          attributes.push({
            sectorName,
            ...attr
          });
        }
        if (attr.x < minX) {
          minX = attr.x;
        } else if (attr.x > maxX) {
          maxX = attr.x;
        }
        if (attr.y < minY) {
          minY = attr.y;
        } else if (attr.y > maxY) {
          maxY = attr.y;
        }
        node.attr.set(new NodeAttributes(attrId, attr));
      });
      const sectorTitleData = Array.from(d3.rollup(attributes, (arr) => {
        const [thetaMin, thetaMax] = d3.extent(arr, (d) => d.theta);
        const theta = thetaMin + (thetaMax - thetaMin) / 2;
        return {
          title: (groupBy === "industry" ? "category." : "") + arr[0].sectorName,
          thetaMin,
          thetaMax,
          theta
        };
      }, (d) => d.sectorName).values());
      const layoutData = {
        sectorTitleData,
        minRadius: minRadius - s_nodeSize * 2,
        translate: groupBy === "industry"
      };
      this.interface.enqueue(attrId, layoutData);
      const sectorSize = {
        width: maxX - minX,
        height: maxY - minY
      };
      return { layoutSize: sectorSize, layoutData };
    };
    this.chainNodeAttributes = (transitionType, delay = 0) => {
      if (!this.initialized) return;
      const attrId = ++this.attrId;
      const layoutSettings = this.layout === "block" ? this.chainNodesBlockAttr(attrId) : this.chainNodesRadialAttr(attrId);
      setTimeout(() => {
        this.transition.add({
          type: transitionType,
          attrId,
          layout: this.layout,
          ...layoutSettings
        });
      }, delay);
    };
    this.debounceInitialize = _.debounce(() => {
      this.initialized = true;
      this.chainNodeAttributes("entrance", 250);
    }, 300);
    this.handleFigureResize = (figureWidth2) => {
      if (!figureWidth2) return;
      if (!this.initialized) {
        this.debounceInitialize();
      }
    };
    this.handleWindowResize = (width2) => {
      if (!width2) return;
      this.zoom.updateScaleExtent(this.layout, width2);
    };
    this.handleLanguageChange = (locale) => {
      this.interface.updateText();
    };
    this.load = (dataArr) => {
      const loading = [];
      dataArr.forEach((dataPoint) => {
        const node = new Deliverable(this, dataPoint);
        this.nodes.push(node);
        loading.push(node.context.loading);
      });
      const deliverableNodes = this.getDeliverableNodes();
      this.activeIds = deliverableNodes.filter((d) => d.active).map((d) => d.id);
      this.activeCount = this.activeIds.length;
      this.complexityScale = d3.scaleLinear().domain(d3.extent(deliverableNodes, (d) => d.complexity)).range([0.75, 1.25]);
      d3.groups(deliverableNodes, (d) => d.client).forEach(([id, deliverables]) => {
        const client = new DeliverableGroup(this, id, deliverables, 8555258);
        this.clients.push(client);
      });
      d3.groups(deliverableNodes, (d) => d.project).forEach(([id, deliverables]) => {
        const project = new DeliverableGroup(this, id, deliverables, 11591736);
        this.projects.push(project);
      });
      this.sort(get_store_value(sortBy), true);
      Promise.all(loading).then(() => {
        this.updateCategories();
        this.initSimulation();
        loader.setLoaded("nodes");
      });
    };
    this.toScene = (context, ticker) => {
      this.clients.forEach((node) => node.toScene(context, ticker));
      this.projects.forEach((node) => node.toScene(context, ticker));
      this.getDeliverableNodes().forEach((node) => {
        node.context.toScene(context, ticker);
      });
      this.interface.toScene(context, ticker);
    };
    this.getDeliverableNodes = () => {
      return this.nodes.filter((d) => d.id >= 0);
    };
    this.updateForceCollideRadius = () => {
      if (!this.forceSimulation) {
        return;
      }
      this.forceCollide.radius(this.forceCollideRadius);
    };
    this.handleTransition = (isRunning) => {
      this.handleLinks("clients", !isRunning && get_store_value(linkClientOn));
      this.handleLinks("projects", !isRunning && get_store_value(linkProjectOn));
    };
    this.getClosestTo = (x, y) => {
      let curNodeDistance = 9999999;
      let curNode;
      const nodes = this.nodes.filter((d) => d.id !== -1);
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeX = node.context.context.x;
        const nodeY = node.context.context.y;
        const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
        if (distance < curNodeDistance) {
          curNode = node;
          curNodeDistance = distance;
        }
      }
      return curNode;
    };
    this.setLayout = (newLayout) => {
      if (newLayout === this.layout) return;
      this.layout = newLayout;
      if (!this.initialized) return;
      this.transition.add({ type: "exit" });
      this.chainNodeAttributes("entrance");
    };
    this.sort = (sortBy2, suppressEvents = false) => {
      const sortCb = sortBy2 === "dt" ? (a, b) => +b.active - +a.active || b[sortBy2] - a[sortBy2] : (a, b) => +b.active - +a.active || a[sortBy2].localeCompare(b[sortBy2]);
      this.getDeliverableNodes().sort(sortCb).forEach((node, i) => {
        node.i = i;
      });
      if (suppressEvents) {
        return;
      }
      this.chainNodeAttributes("sort");
    };
    this.filter = (fyears2, findustries2, fdesigns2, fgoals2, fproducts2) => {
      if (!this.initialized) return;
      this.getDeliverableNodes().forEach((node) => {
        node.setActive(fyears2, findustries2, fdesigns2, fgoals2, fproducts2);
      });
      const activeIds = this.getDeliverableNodes().filter((d) => d.active).map((d) => d.id);
      const equalIds = this.activeIds.length === activeIds.length && activeIds.every((d) => this.activeIds.includes(d));
      if (!equalIds) {
        const transitionType = this.activeCount > activeIds.length ? "filterOut" : "filterIn";
        this.activeIds = activeIds;
        this.activeCount = activeIds.length;
        this.sort(get_store_value(sortBy), true);
        this.updateCategories();
        this.chainNodeAttributes(transitionType);
      }
    };
    this.handleSelected = (selected2) => {
      if (this.onSelectedState && !selected2) {
        this.transition.playNext(true);
      } else if (!this.onSelectedState && selected2) {
        this.transition.addSelectedLeaving({ layout: this.layout });
        this.onSelectedState = !!selected2;
      }
      this.interface.toggleOpacity(+selected2);
      this.nodes.forEach((node) => node.handleSelected(selected2));
      this.handleLinks("clients", !selected2 && get_store_value(linkClientOn));
      this.handleLinks("projects", !selected2 && get_store_value(linkProjectOn));
    };
    this.handleHovered = (hovered2) => {
      this.clients.forEach((node) => node.setHovered(hovered2 && node.id === hovered2.client));
      this.projects.forEach((node) => node.setHovered(hovered2 && node.id === hovered2.project));
    };
    this.handleComplexity = (complexityOn2) => {
      this.getDeliverableNodes().forEach((node) => node.attr.complexity());
    };
    this.handleLinks = (target, isActive) => {
      this[target].forEach((node) => node.setActive(isActive));
    };
    this.transition = new TransitionController(this);
    this.zoom = new ZoomController(this);
    this.dummy = new DummyDeliverable(this);
    this.sound = new SoundController(this);
    this.interface = new LayoutInterface(this);
    this.nodes.push(this.dummy);
  }
}
const simulation = new Simulation();
const isSheetOpen = writable(false);
const isFilterOpen = writable(false);
const isToggleHidden = derived([isFilterOpen, selected], ([$isFilterOpen, $selected]) => {
  return $isFilterOpen || !!$selected;
});
const ProjectLogo = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe__();
  return `<figure class="flex items-end gap-2.5"><svg xmlns="http://www.w3.org/2000/svg" class="w-32 md:w-20" viewBox="0 0 217.04 61.863"><g id="Group_357" data-name="Group 357" transform="translate(-111.503 -1003.838)"><g id="Group_355" data-name="Group 355"><path id="Path_234" data-name="Path 234" d="M119.79,1047.038a12.222,12.222,0,0,0,2.7,8.214,8.847,8.847,0,0,0,6.99,3.207,9.3,9.3,0,0,0,7.278-3.1,13.339,13.339,0,0,0,0-16.286,9.173,9.173,0,0,0-7.206-3.134,8.964,8.964,0,0,0-6.99,3.17,11.693,11.693,0,0,0-2.774,7.927m19.24-43.2h8.143v60.854H139.03v-3.674a15.127,15.127,0,0,1-10.845,4.683,15.442,15.442,0,0,1-11.962-5.26,19.562,19.562,0,0,1-4.72-13.4,18.91,18.91,0,0,1,4.72-13.115,15.158,15.158,0,0,1,22.807-.252Z" fill="#0d0d0d"></path><path id="Path_235" data-name="Path 235" d="M162.034,1047.038a12.221,12.221,0,0,0,2.7,8.215,8.848,8.848,0,0,0,6.99,3.206,9.3,9.3,0,0,0,7.278-3.1,13.337,13.337,0,0,0,0-16.285,9.172,9.172,0,0,0-7.206-3.135,8.964,8.964,0,0,0-6.99,3.17,11.687,11.687,0,0,0-2.774,7.927m19.24-17.438h8.142v35.093h-8.142v-3.676q-5.01,4.685-10.773,4.684a15.521,15.521,0,0,1-12.034-5.26,19.56,19.56,0,0,1-4.72-13.4,18.959,18.959,0,0,1,4.72-13.151,15.215,15.215,0,0,1,11.818-5.26q6.124,0,10.989,5.044Z" fill="#0d0d0d"></path></g><path id="Path_236" data-name="Path 236" d="M209.448,1037.166v27.527h-8.106v-27.527H195.01V1029.6h6.331v-12.862h8.106V1029.6h6.305v7.566Z" fill="#0d0d0d"></path><path id="Path_237" data-name="Path 237" d="M227.581,1047.038a12.222,12.222,0,0,0,2.7,8.215,8.846,8.846,0,0,0,6.989,3.206,9.3,9.3,0,0,0,7.278-3.1,13.337,13.337,0,0,0,0-16.285,9.172,9.172,0,0,0-7.206-3.135,8.964,8.964,0,0,0-6.99,3.17,11.687,11.687,0,0,0-2.774,7.927m19.24-17.438h8.143v35.093h-8.143v-3.676q-5.009,4.685-10.773,4.684a15.521,15.521,0,0,1-12.034-5.26,19.56,19.56,0,0,1-4.72-13.4,18.959,18.959,0,0,1,4.72-13.151,15.218,15.218,0,0,1,11.818-5.26q6.124,0,10.989,5.044Z" fill="#0d0d0d"></path><g id="Group_356" data-name="Group 356"><path id="Path_238" data-name="Path 238" d="M286.74,1047.227a10.052,10.052,0,1,1-10.053-10.052,10.052,10.052,0,0,1,10.053,10.052" fill="#7781fa"></path><rect id="Rectangle_782" data-name="Rectangle 782" width="35.05" height="7.807" transform="translate(293.493 1057.084)" fill="#0d0d0d"></rect></g></g></svg> <p class="text-nowrap flex items-end">${escape($_("page.hero"))}</p></figure>`;
});
const css$m = {
  code: "fieldset.svelte-1vaa99e.svelte-1vaa99e.svelte-1vaa99e{border:none;padding:0;margin:0;display:flex;flex-direction:row;gap:var(--fs-label)}fieldset.svelte-1vaa99e label input.svelte-1vaa99e.svelte-1vaa99e{display:none}fieldset.svelte-1vaa99e label input.svelte-1vaa99e:checked+span.svelte-1vaa99e{font-weight:700}fieldset.svelte-1vaa99e label input.svelte-1vaa99e:not(:checked):hover+span.svelte-1vaa99e{font-weight:500;color:var(--clr-accent)}fieldset.svelte-1vaa99e label span.svelte-1vaa99e.svelte-1vaa99e{font-size:calc(1.2 * var(--fs-label))}",
  map: `{"version":3,"file":"LanguageChange.svelte","sources":["LanguageChange.svelte"],"sourcesContent":["<script>\\n  import { _, locale } from 'svelte-i18n'\\n\\n  const options = [\\n    { value: \\"pt\\", alias: \\"PT\\" },\\n    { value: \\"en\\", alias: \\"EN\\" },\\n  ]\\n\\n  let selectedLanguage = $locale.slice(0, 2)\\n\\n  $: locale.set(selectedLanguage.slice(0, 2))\\n<\/script>\\n\\n<fieldset>\\n  {#each options as { value, alias }}\\n    <label>\\n      <input type=\\"radio\\" value={value} bind:group={selectedLanguage} name=\\"language-change\\" />\\n      <span>{alias}</span>\\n    </label>\\n  {/each}\\n</fieldset>\\n\\n<style lang=\\"scss\\">fieldset {\\n  border: none;\\n  padding: 0;\\n  margin: 0;\\n  display: flex;\\n  flex-direction: row;\\n  gap: var(--fs-label);\\n}\\nfieldset label input {\\n  display: none;\\n}\\nfieldset label input:checked + span {\\n  font-weight: 700;\\n}\\nfieldset label input:not(:checked):hover + span {\\n  font-weight: 500;\\n  color: var(--clr-accent);\\n}\\nfieldset label span {\\n  font-size: calc(1.2 * var(--fs-label));\\n}</style>\\n\\n\\n<!-- <select bind:value={selectedLanguage}>\\n  <option value=\\"en\\">EN</option>\\n  <option value=\\"pt\\">PT</option>\\n</select> -->"],"names":[],"mappings":"AAsBmB,qDAAS,CAC1B,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,CAAC,CACV,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,GAAG,CAAE,IAAI,UAAU,CACrB,CACA,uBAAQ,CAAC,KAAK,CAAC,mCAAM,CACnB,OAAO,CAAE,IACX,CACA,uBAAQ,CAAC,KAAK,CAAC,oBAAK,QAAQ,CAAG,mBAAK,CAClC,WAAW,CAAE,GACf,CACA,uBAAQ,CAAC,KAAK,CAAC,oBAAK,KAAK,QAAQ,CAAC,MAAM,CAAG,mBAAK,CAC9C,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,YAAY,CACzB,CACA,uBAAQ,CAAC,KAAK,CAAC,kCAAK,CAClB,SAAS,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CACvC"}`
};
const LanguageChange = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $locale$1, $$unsubscribe_locale;
  $$unsubscribe_locale = subscribe($locale, (value) => $locale$1 = value);
  const options = [{ value: "pt", alias: "PT" }, { value: "en", alias: "EN" }];
  let selectedLanguage = $locale$1.slice(0, 2);
  $$result.css.add(css$m);
  {
    $locale.set(selectedLanguage.slice(0, 2));
  }
  $$unsubscribe_locale();
  return `<fieldset class="svelte-1vaa99e">${each(options, ({ value, alias }) => {
    return `<label><input type="radio"${add_attribute("value", value, 0)} name="language-change" class="svelte-1vaa99e"${value === selectedLanguage ? add_attribute("checked", true, 1) : ""}> <span class="svelte-1vaa99e">${escape(alias)}</span> </label>`;
  })}</fieldset>  `;
});
const Designs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_371_39)"><path d="M22.01 1H4.99C2.78638 1 1 2.78638 1 4.99V22.01C1 24.2136 2.78638 26 4.99 26H22.01C24.2136 26 26 24.2136 26 22.01V4.99C26 2.78638 24.2136 1 22.01 1Z" stroke="#1C1C1C" stroke-width="2" stroke-miterlimit="10"></path><path d="M1 18.9199H13.5V25.9999" stroke="#1C1C1C" stroke-width="2" stroke-miterlimit="10"></path><path d="M13.5 18.92V1" stroke="#1C1C1C" stroke-width="2" stroke-miterlimit="10"></path></g><defs><clipPath id="clip0_371_39"><rect width="27" height="27" fill="white"></rect></clipPath></defs></svg>`;
});
const Goals = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_371_57)"><path d="M13.5 26C20.4036 26 26 20.4036 26 13.5C26 6.59644 20.4036 1 13.5 1C6.59644 1 1 6.59644 1 13.5C1 20.4036 6.59644 26 13.5 26Z" stroke="#1C1C1C" stroke-width="2" stroke-miterlimit="10"></path><path d="M22.25 4.75L13.5 13.5L22.33 22.33" stroke="#1C1C1C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></g><defs><clipPath id="clip0_371_57"><rect width="27" height="27" fill="white"></rect></clipPath></defs></svg>`;
});
const Industries = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_371_13)"><path d="M26 13.5C26 6.59644 20.4036 1 13.5 1C6.59644 1 1 6.59644 1 13.5C1 20.4036 6.59644 26 13.5 26C20.4036 26 26 20.4036 26 13.5Z" stroke="#1C1C1C" stroke-width="2" stroke-miterlimit="10"></path><path d="M17.74 14.3599C20.0817 14.3599 21.98 12.4616 21.98 10.1199C21.98 7.7782 20.0817 5.87988 17.74 5.87988C15.3983 5.87988 13.5 7.7782 13.5 10.1199C13.5 12.4616 15.3983 14.3599 17.74 14.3599Z" stroke="#1C1C1C" stroke-width="0.9" stroke-miterlimit="10"></path><path d="M10.8203 11.46C12.3391 11.46 13.5703 10.2287 13.5703 8.70996C13.5703 7.19118 12.3391 5.95996 10.8203 5.95996C9.30153 5.95996 8.07031 7.19118 8.07031 8.70996C8.07031 10.2287 9.30153 11.46 10.8203 11.46Z" stroke="#1C1C1C" stroke-miterlimit="10"></path><path d="M10.8204 22.7302C13.9298 22.7302 16.4504 20.2096 16.4504 17.1002C16.4504 13.9909 13.9298 11.4702 10.8204 11.4702C7.71107 11.4702 5.19043 13.9909 5.19043 17.1002C5.19043 20.2096 7.71107 22.7302 10.8204 22.7302Z" stroke="#1C1C1C" stroke-width="0.9" stroke-miterlimit="10"></path></g><defs><clipPath id="clip0_371_13"><rect width="27" height="27" fill="white"></rect></clipPath></defs></svg>`;
});
const Layouts = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_371_51)"><path d="M13.5 26C20.4036 26 26 20.4036 26 13.5C26 6.59644 20.4036 1 13.5 1C6.59644 1 1 6.59644 1 13.5C1 20.4036 6.59644 26 13.5 26Z" stroke="#1C1C1C" stroke-width="2" stroke-miterlimit="10"></path><path d="M14.2598 19.46C17.5514 19.46 20.2198 16.7917 20.2198 13.5C20.2198 10.2084 17.5514 7.54004 14.2598 7.54004C10.9682 7.54004 8.2998 10.2084 8.2998 13.5C8.2998 16.7917 10.9682 19.46 14.2598 19.46Z" fill="#1C1C1C"></path><path d="M1 13.5C1 13.5 6.6 19.46 13.5 19.46C20.4 19.46 26 16.79 26 13.5C26 10.21 20.4 7.54004 13.5 7.54004C6.6 7.54004 1 13.5 1 13.5Z" stroke="#1C1C1C" stroke-miterlimit="10"></path></g><defs><clipPath id="clip0_371_51"><rect width="27" height="27" fill="white"></rect></clipPath></defs></svg>`;
});
const Period = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_371_62)"><path d="M13.5 26C20.4036 26 26 20.4036 26 13.5C26 6.59644 20.4036 1 13.5 1C6.59644 1 1 6.59644 1 13.5C1 20.4036 6.59644 26 13.5 26Z" stroke="#1C1C1C" stroke-width="2" stroke-miterlimit="10"></path><path d="M13.5 13.5L19.02 7.97998" stroke="#1C1C1C" stroke-miterlimit="10"></path><path d="M13.5 13.5L16.26 21.39" stroke="#1C1C1C" stroke-miterlimit="10"></path><path d="M13.5 15.54C14.6266 15.54 15.54 14.6266 15.54 13.5C15.54 12.3733 14.6266 11.46 13.5 11.46C12.3733 11.46 11.46 12.3733 11.46 13.5C11.46 14.6266 12.3733 15.54 13.5 15.54Z" fill="#1C1C1C"></path></g><defs><clipPath id="clip0_371_62"><rect width="27" height="27" fill="white"></rect></clipPath></defs></svg>`;
});
const Products = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_371_7)"><path d="M13.5 26C20.4036 26 26 20.4036 26 13.5C26 6.59644 20.4036 1 13.5 1C6.59644 1 1 6.59644 1 13.5C1 20.4036 6.59644 26 13.5 26Z" stroke="#1C1C1C" stroke-width="2" stroke-miterlimit="10"></path><path d="M21.86 21.86L13.5 13.5V1" stroke="#1C1C1C" stroke-miterlimit="10"></path><path d="M13.5004 13.5L1.61035 17.37" stroke="#1C1C1C" stroke-miterlimit="10"></path></g><defs><clipPath id="clip0_371_7"><rect width="27" height="27" fill="white"></rect></clipPath></defs></svg>`;
});
const BlockLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M27 9C28.1046 9 29 8.10457 29 7C29 5.89543 28.1046 5 27 5C25.8954 5 25 5.89543 25 7C25 8.10457 25.8954 9 27 9Z" fill="#1C1C1C"></path><path d="M2 7H27" stroke="#1C1C1C" stroke-width="1.5" stroke-miterlimit="10"></path><path d="M2 14.8599H19.43" stroke="#1C1C1C" stroke-width="1.5" stroke-miterlimit="10"></path><path d="M2 22.73H14.5" stroke="#1C1C1C" stroke-width="1.5" stroke-miterlimit="10"></path></svg>`;
});
const RadialLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.8278 25.6556C8.85085 25.6556 4 20.8047 4 14.8278C4 8.85085 8.85085 4 14.8278 4C20.8047 4 25.6556 8.85085 25.6556 14.8278" stroke="#1C1C1C" stroke-width="1.5" stroke-miterlimit="10"></path><path d="M25.7071 17.2359C26.6639 17.2359 27.4395 16.4602 27.4395 15.5034C27.4395 14.5466 26.6639 13.771 25.7071 13.771C24.7503 13.771 23.9746 14.5466 23.9746 15.5034C23.9746 16.4602 24.7503 17.2359 25.7071 17.2359Z" fill="#1C1C1C"></path></svg>`;
});
const Caret = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.27 17.76H11.29L7 7H9.31L12.3 15.64L15.42 7H17.73L13.26 17.76H13.27Z"></path></svg>`;
});
const Play = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19.6895 12.16L4.26953 21.31V3L19.6895 12.16Z"></path></svg>`;
});
const Pause = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 2.5H4.5V21.5H10.5V2.5Z"></path><path d="M19.5 2.5H13.5V21.5H19.5V2.5Z"></path></svg>`;
});
const css$l = {
  code: "svg.svelte-s8yumu.svelte-s8yumu{background:var(--clr-black)}svg.svelte-s8yumu .default.svelte-s8yumu{opacity:1}svg.svelte-s8yumu .active.svelte-s8yumu{opacity:0}svg.svelte-s8yumu.svelte-s8yumu:hover{background:var(--clr-black)}svg.svelte-s8yumu:hover .default.svelte-s8yumu{opacity:0}svg.svelte-s8yumu:hover .active.svelte-s8yumu{opacity:1}svg.svelte-s8yumu .i-char.default.svelte-s8yumu{fill:var(--clr-gray)}svg.svelte-s8yumu .i-char.active.svelte-s8yumu{fill:var(--clr-accent)}svg.svelte-s8yumu .underscore.default.svelte-s8yumu{stroke:var(--clr-gray)}svg.svelte-s8yumu .underscore.active.svelte-s8yumu{stroke:var(--clr-accent)}@media(min-width: 768px){svg.svelte-s8yumu.svelte-s8yumu{background:none}svg.svelte-s8yumu .i-char.default.svelte-s8yumu{fill:var(--clr-black)}svg.svelte-s8yumu .i-char.active.svelte-s8yumu{fill:var(--clr-accent)}svg.svelte-s8yumu .underscore.default.svelte-s8yumu{stroke:var(--clr-black)}svg.svelte-s8yumu .underscore.active.svelte-s8yumu{stroke:var(--clr-accent)}svg.svelte-s8yumu .square.svelte-s8yumu{stroke:var(--clr-black)}}",
  map: '{"version":3,"file":"InfoDefault.svelte","sources":["InfoDefault.svelte"],"sourcesContent":["<svg width=\\"100%\\" height=\\"100%\\" viewBox=\\"0 0 52 52\\" fill=\\"none\\" xmlns=\\"http://www.w3.org/2000/svg\\">\\n\\n  <path class=\\"i-char default\\" d=\\"M30.2201 33.0199V34.2299H20.3301V33.0199H24.6501V24.4699H21.2101V23.2599H25.9901V33.0199H30.2201ZM26.3001 21.1799H24.3701V18.8799H26.3001V21.1799Z\\"/>\\n\\n  <path class=\\"i-char active\\" d=\\"M31.3798 31.0699V33.7199H19.7598V31.0699H24.0098V25.2399H20.4798V22.5899H27.1498V31.0799H31.3798V31.0699ZM27.4298 20.9599H23.7498V17.6499H27.4298V20.9599Z\\"/>\\n\\n  <path class=\\"underscore default\\" d=\\"M13.8398 40.4902H36.3398\\"/>\\n\\n  <path class=\\"underscore active\\" d=\\"M14.3398 39.9902H36.8398\\" />\\n\\n  <path class=\\"square default\\" d=\\"M51.24 2.5H0.5V49.87H51.24V2.5Z\\"/>\\n\\n</svg>\\n\\n<style lang=\\"scss\\">svg {\\n  background: var(--clr-black);\\n}\\nsvg .default {\\n  opacity: 1;\\n}\\nsvg .active {\\n  opacity: 0;\\n}\\nsvg:hover {\\n  background: var(--clr-black);\\n}\\nsvg:hover .default {\\n  opacity: 0;\\n}\\nsvg:hover .active {\\n  opacity: 1;\\n}\\nsvg .i-char.default {\\n  fill: var(--clr-gray);\\n}\\nsvg .i-char.active {\\n  fill: var(--clr-accent);\\n}\\nsvg .underscore.default {\\n  stroke: var(--clr-gray);\\n}\\nsvg .underscore.active {\\n  stroke: var(--clr-accent);\\n}\\n@media (min-width: 768px) {\\n  svg {\\n    background: none;\\n  }\\n  svg .i-char.default {\\n    fill: var(--clr-black);\\n  }\\n  svg .i-char.active {\\n    fill: var(--clr-accent);\\n  }\\n  svg .underscore.default {\\n    stroke: var(--clr-black);\\n  }\\n  svg .underscore.active {\\n    stroke: var(--clr-accent);\\n  }\\n  svg .square {\\n    stroke: var(--clr-black);\\n  }\\n}</style>"],"names":[],"mappings":"AAcmB,+BAAI,CACrB,UAAU,CAAE,IAAI,WAAW,CAC7B,CACA,iBAAG,CAAC,sBAAS,CACX,OAAO,CAAE,CACX,CACA,iBAAG,CAAC,qBAAQ,CACV,OAAO,CAAE,CACX,CACA,+BAAG,MAAO,CACR,UAAU,CAAE,IAAI,WAAW,CAC7B,CACA,iBAAG,MAAM,CAAC,sBAAS,CACjB,OAAO,CAAE,CACX,CACA,iBAAG,MAAM,CAAC,qBAAQ,CAChB,OAAO,CAAE,CACX,CACA,iBAAG,CAAC,OAAO,sBAAS,CAClB,IAAI,CAAE,IAAI,UAAU,CACtB,CACA,iBAAG,CAAC,OAAO,qBAAQ,CACjB,IAAI,CAAE,IAAI,YAAY,CACxB,CACA,iBAAG,CAAC,WAAW,sBAAS,CACtB,MAAM,CAAE,IAAI,UAAU,CACxB,CACA,iBAAG,CAAC,WAAW,qBAAQ,CACrB,MAAM,CAAE,IAAI,YAAY,CAC1B,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,+BAAI,CACF,UAAU,CAAE,IACd,CACA,iBAAG,CAAC,OAAO,sBAAS,CAClB,IAAI,CAAE,IAAI,WAAW,CACvB,CACA,iBAAG,CAAC,OAAO,qBAAQ,CACjB,IAAI,CAAE,IAAI,YAAY,CACxB,CACA,iBAAG,CAAC,WAAW,sBAAS,CACtB,MAAM,CAAE,IAAI,WAAW,CACzB,CACA,iBAAG,CAAC,WAAW,qBAAQ,CACrB,MAAM,CAAE,IAAI,YAAY,CAC1B,CACA,iBAAG,CAAC,qBAAQ,CACV,MAAM,CAAE,IAAI,WAAW,CACzB,CACF"}'
};
const InfoDefault = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$l);
  return `<svg width="100%" height="100%" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" class="svelte-s8yumu"><path class="i-char default svelte-s8yumu" d="M30.2201 33.0199V34.2299H20.3301V33.0199H24.6501V24.4699H21.2101V23.2599H25.9901V33.0199H30.2201ZM26.3001 21.1799H24.3701V18.8799H26.3001V21.1799Z"></path><path class="i-char active svelte-s8yumu" d="M31.3798 31.0699V33.7199H19.7598V31.0699H24.0098V25.2399H20.4798V22.5899H27.1498V31.0799H31.3798V31.0699ZM27.4298 20.9599H23.7498V17.6499H27.4298V20.9599Z"></path><path class="underscore default svelte-s8yumu" d="M13.8398 40.4902H36.3398"></path><path class="underscore active svelte-s8yumu" d="M14.3398 39.9902H36.8398"></path><path class="square default svelte-s8yumu" d="M51.24 2.5H0.5V49.87H51.24V2.5Z"></path></svg>`;
});
const InfoActive = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M51.24 2.5H0.5V49.87H51.24V2.5Z" stroke="black" stroke-miterlimit="10"></path><path d="M30.8798 31.5699V34.2199H19.2598V31.5699H23.5098V25.7399H19.9798V23.0899H26.6498V31.5799H30.8798V31.5699ZM26.9298 21.4599H23.2498V18.1499H26.9298V21.4599Z" fill="#8D95FB"></path><path d="M13.8398 40.4902H36.3398" stroke="#8D95FB" stroke-miterlimit="10"></path></svg>`;
});
const InfoHover = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M51.74 2H1V49.37H51.74V2Z" fill="black"></path><path d="M31.3798 31.0699V33.7199H19.7598V31.0699H24.0098V25.2399H20.4798V22.5899H27.1498V31.0799H31.3798V31.0699ZM27.4298 20.9599H23.7498V17.6499H27.4298V20.9599Z" fill="#8D95FB"></path><path d="M14.3398 39.9902H36.8398" stroke="#8D95FB" stroke-miterlimit="10"></path></svg>`;
});
const Wireless = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 32 33" xmlns="http://www.w3.org/2000/svg"><path d="M8.64 18.9001C10.098 18.9001 11.28 17.7181 11.28 16.2601C11.28 14.8021 10.098 13.6201 8.64 13.6201C7.18197 13.6201 6 14.8021 6 16.2601C6 17.7181 7.18197 18.9001 8.64 18.9001Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M14.1173 6.71289C19.3879 11.9834 19.3879 20.5366 14.1173 25.8071L12.7031 24.3929C17.1926 19.9034 17.1926 12.6166 12.7031 8.1271L14.1173 6.71289Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M19.9171 1.00293C28.3477 9.43345 28.3477 23.0966 19.9171 31.5271L18.5029 30.1129C26.1524 22.4635 26.1524 10.0666 18.5029 2.41714L19.9171 1.00293Z"></path></svg>`;
});
const Return = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1.25 4.75C1.25 4.75 12.25 4.75 18.25 4.75C24.25 4.75 24.25 15.25 18.25 15.25C12.25 15.25 12.25 15.25 12.25 15.25M11.25 10.75L6.75 15L11.25 19.25" stroke-linecap="round"></path></svg>`;
});
const Collapse = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="12" fill="black"></circle><path d="M10.9991 6L13.2134 6L18 18L15.4166 18L12.0727 8.36431L8.58341 18L6 18L10.9991 6Z" fill="currentColor"></path></svg>`;
});
const ReturnBackground = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 91.42 43.51"><rect fill="var(--clr-black)" x="0" y="0" width="91.42" height="43.51" rx="3.9" ry="3.9"></rect><g fill="none" stroke="var(--clr-white)" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2"><path d="m22.98,8.41h34.35c6.13,0,11.1,4.97,11.1,11.1h0c0,6.13-4.97,11.1-11.1,11.1h-11.63"></path><polyline points="44.26 39.4 35.46 30.6 44.26 21.8"></polyline></g></svg>`;
});
const css$k = {
  code: ".d.svelte-tzmb8t{fill:#fff}.e.svelte-tzmb8t{fill:#1c1c1c}.f.svelte-tzmb8t,.g.svelte-tzmb8t{fill:none}.f.svelte-tzmb8t{stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px}.g.svelte-tzmb8t{stroke:#1c1c1c;stroke-miterlimit:10;stroke-width:2.66px}",
  map: '{"version":3,"file":"MousePan.svelte","sources":["MousePan.svelte"],"sourcesContent":["<svg width=\\"100%\\" height=\\"100%\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 95.76 95.76\\">\\n  <g>\\n    <g>\\n      <circle class=\\"g\\" cx=\\"47.88\\" cy=\\"47.88\\" r=\\"46.55\\"/>\\n      <circle class=\\"e\\" cx=\\"47.88\\" cy=\\"47.88\\" r=\\"38.83\\"/>\\n      <polyline class=\\"f\\" points=\\"40.57 74.54 47.88 81.85 55.19 74.54\\"/>\\n      <polyline class=\\"f\\" points=\\"21.22 40.57 13.91 47.88 21.22 55.19\\"/>\\n      <polyline class=\\"f\\" points=\\"55.19 21.22 47.88 13.91 40.57 21.22\\"/>\\n      <polyline class=\\"f\\" points=\\"74.54 55.19 81.85 47.88 74.54 40.57\\"/>\\n      <g>\\n        <rect class=\\"f\\" x=\\"37.28\\" y=\\"31.27\\" width=\\"21.2\\" height=\\"32.98\\" rx=\\"9.5\\" ry=\\"9.5\\"/>\\n        <rect class=\\"d\\" x=\\"46.7\\" y=\\"40.11\\" width=\\"2.36\\" height=\\"5.89\\" rx=\\"1.18\\" ry=\\"1.18\\" transform=\\"translate(95.76 86.1) rotate(180)\\"/>\\n      </g>\\n    </g>\\n  </g>\\n</svg>\\n\\n  <style>\\n    .d {\\n      fill: #fff;\\n    }\\n\\n    .e {\\n      fill: #1c1c1c;\\n    }\\n\\n    .f, .g {\\n      fill: none;\\n    }\\n\\n    .f {\\n      stroke: #fff;\\n      stroke-linecap: round;\\n      stroke-linejoin: round;\\n      stroke-width: 2px;\\n    }\\n\\n    .g {\\n      stroke: #1c1c1c;\\n      stroke-miterlimit: 10;\\n      stroke-width: 2.66px;\\n    }\\n  </style>"],"names":[],"mappings":"AAkBI,gBAAG,CACD,IAAI,CAAE,IACR,CAEA,gBAAG,CACD,IAAI,CAAE,OACR,CAEA,gBAAE,CAAE,gBAAG,CACL,IAAI,CAAE,IACR,CAEA,gBAAG,CACD,MAAM,CAAE,IAAI,CACZ,cAAc,CAAE,KAAK,CACrB,eAAe,CAAE,KAAK,CACtB,YAAY,CAAE,GAChB,CAEA,gBAAG,CACD,MAAM,CAAE,OAAO,CACf,iBAAiB,CAAE,EAAE,CACrB,YAAY,CAAE,MAChB"}'
};
const MousePan = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$k);
  return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.76 95.76"><g><g><circle class="g svelte-tzmb8t" cx="47.88" cy="47.88" r="46.55"></circle><circle class="e svelte-tzmb8t" cx="47.88" cy="47.88" r="38.83"></circle><polyline class="f svelte-tzmb8t" points="40.57 74.54 47.88 81.85 55.19 74.54"></polyline><polyline class="f svelte-tzmb8t" points="21.22 40.57 13.91 47.88 21.22 55.19"></polyline><polyline class="f svelte-tzmb8t" points="55.19 21.22 47.88 13.91 40.57 21.22"></polyline><polyline class="f svelte-tzmb8t" points="74.54 55.19 81.85 47.88 74.54 40.57"></polyline><g><rect class="f svelte-tzmb8t" x="37.28" y="31.27" width="21.2" height="32.98" rx="9.5" ry="9.5"></rect><rect class="d svelte-tzmb8t" x="46.7" y="40.11" width="2.36" height="5.89" rx="1.18" ry="1.18" transform="translate(95.76 86.1) rotate(180)"></rect></g></g></g></svg>`;
});
const css$j = {
  code: ".d.svelte-kbzk64{fill:#1c1c1c}.e.svelte-kbzk64{fill:#fff}.f.svelte-kbzk64,.g.svelte-kbzk64{fill:none}.e.svelte-kbzk64,.f.svelte-kbzk64{stroke:#fff;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px}.g.svelte-kbzk64{stroke:#1c1c1c;stroke-miterlimit:10;stroke-width:2.66px}",
  map: '{"version":3,"file":"Pinch.svelte","sources":["Pinch.svelte"],"sourcesContent":["<svg width=\\"100%\\" height=\\"100%\\" xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 95.76 95.76\\">\\n  <g>\\n    <g>\\n      <circle class=\\"g\\" cx=\\"47.88\\" cy=\\"47.88\\" r=\\"46.55\\"/>\\n      <circle class=\\"d\\" cx=\\"47.88\\" cy=\\"47.88\\" r=\\"38.83\\"/>\\n      <g>\\n        <line class=\\"f\\" x1=\\"52.97\\" y1=\\"17.38\\" x2=\\"63.4\\" y2=\\"20.74\\"/>\\n        <polyline class=\\"f\\" points=\\"49.03 28.11 63.4 20.74 60.04 31.17\\"/>\\n      </g>\\n      <g>\\n        <line class=\\"f\\" x1=\\"26.57\\" y1=\\"29.27\\" x2=\\"22.94\\" y2=\\"39.61\\"/>\\n        <polyline class=\\"f\\" points=\\"37.5 32.62 22.94 39.61 33.28 43.24\\"/>\\n      </g>\\n      <path class=\\"f\\" d=\\"m67.64,71.5h0s1.04-3.24,1.04-3.24l2.12-6.58c.61-1.91-.2-4.08-2.03-4.88-2.11-.92-4.5.2-5.19,2.33.65-2.01-.46-4.17-2.47-4.82-2.01-.65-4.17.46-4.82,2.47.65-2.01-.46-4.17-2.47-4.82h0c-2.01-.65-4.17.46-4.82,2.47l5.81-18.06c.61-1.91-.2-4.08-2.03-4.88-2.11-.92-4.5.2-5.19,2.33l-8.06,25.06h0c-.34-2.84-.68-5.68-1.01-8.51-.27-2.43-2.58-4.14-5.04-3.62-2.14.46-3.48,2.61-3.23,4.78l1.6,14.37.24,2.02c.84,6.93,5.63,12.74,12.28,14.87l.77.25\\"/>\\n      <line class=\\"e\\" x1=\\"39.53\\" y1=\\"58.88\\" x2=\\"38.59\\" y2=\\"61.81\\"/>\\n    </g>\\n  </g>\\n</svg>\\n\\n<style>\\n  .d {\\n    fill: #1c1c1c;\\n  }\\n\\n  .e {\\n    fill: #fff;\\n  }\\n\\n  .f, .g {\\n    fill: none;\\n  }\\n\\n  .e, .f {\\n    stroke: #fff;\\n    stroke-linecap: round;\\n    stroke-linejoin: round;\\n    stroke-width: 2px;\\n  }\\n\\n  .g {\\n    stroke: #1c1c1c;\\n    stroke-miterlimit: 10;\\n    stroke-width: 2.66px;\\n  }\\n</style>"],"names":[],"mappings":"AAoBE,gBAAG,CACD,IAAI,CAAE,OACR,CAEA,gBAAG,CACD,IAAI,CAAE,IACR,CAEA,gBAAE,CAAE,gBAAG,CACL,IAAI,CAAE,IACR,CAEA,gBAAE,CAAE,gBAAG,CACL,MAAM,CAAE,IAAI,CACZ,cAAc,CAAE,KAAK,CACrB,eAAe,CAAE,KAAK,CACtB,YAAY,CAAE,GAChB,CAEA,gBAAG,CACD,MAAM,CAAE,OAAO,CACf,iBAAiB,CAAE,EAAE,CACrB,YAAY,CAAE,MAChB"}'
};
const Pinch = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  $$result.css.add(css$j);
  return `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 95.76 95.76"><g><g><circle class="g svelte-kbzk64" cx="47.88" cy="47.88" r="46.55"></circle><circle class="d svelte-kbzk64" cx="47.88" cy="47.88" r="38.83"></circle><g><line class="f svelte-kbzk64" x1="52.97" y1="17.38" x2="63.4" y2="20.74"></line><polyline class="f svelte-kbzk64" points="49.03 28.11 63.4 20.74 60.04 31.17"></polyline></g><g><line class="f svelte-kbzk64" x1="26.57" y1="29.27" x2="22.94" y2="39.61"></line><polyline class="f svelte-kbzk64" points="37.5 32.62 22.94 39.61 33.28 43.24"></polyline></g><path class="f svelte-kbzk64" d="m67.64,71.5h0s1.04-3.24,1.04-3.24l2.12-6.58c.61-1.91-.2-4.08-2.03-4.88-2.11-.92-4.5.2-5.19,2.33.65-2.01-.46-4.17-2.47-4.82-2.01-.65-4.17.46-4.82,2.47.65-2.01-.46-4.17-2.47-4.82h0c-2.01-.65-4.17.46-4.82,2.47l5.81-18.06c.61-1.91-.2-4.08-2.03-4.88-2.11-.92-4.5.2-5.19,2.33l-8.06,25.06h0c-.34-2.84-.68-5.68-1.01-8.51-.27-2.43-2.58-4.14-5.04-3.62-2.14.46-3.48,2.61-3.23,4.78l1.6,14.37.24,2.02c.84,6.93,5.63,12.74,12.28,14.87l.77.25"></path><line class="e svelte-kbzk64" x1="39.53" y1="58.88" x2="38.59" y2="61.81"></line></g></g></svg>`;
});
const Close = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.1 19.2C15.1258 19.2 19.2 15.1258 19.2 10.1C19.2 5.07421 15.1258 1 10.1 1C5.07421 1 1 5.07421 1 10.1C1 15.1258 5.07421 19.2 10.1 19.2Z" stroke="currentColor" stroke-miterlimit="10"></path><path d="M5.7998 5.7998L14.3998 14.3998" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"></path><path d="M14.3998 5.7998L5.7998 14.3998" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"></path></svg>`;
});
const CloseX = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<svg width="100%" height="100%" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5.7998 5.7998L14.3998 14.3998" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"></path><path d="M14.3998 5.7998L5.7998 14.3998" stroke="currentColor" stroke-miterlimit="10" stroke-linecap="round"></path></svg>`;
});
const Icon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { icon } = $$props;
  const componentMapper = {
    designs: Designs,
    goals: Goals,
    industries: Industries,
    layouts: Layouts,
    period: Period,
    products: Products,
    block: BlockLayout,
    radial: RadialLayout,
    caret: Caret,
    play: Play,
    pause: Pause,
    wireless: Wireless,
    infoDefault: InfoDefault,
    infoActive: InfoActive,
    infoHover: InfoHover,
    return: Return,
    returnBackground: ReturnBackground,
    collapse: Collapse,
    mousePan: MousePan,
    pinch: Pinch,
    close: Close,
    closeX: CloseX
  };
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
  return `<div class="w-full h-full">${validate_component(componentMapper[icon] || missing_component, "svelte:component").$$render($$result, {}, {}, {})}</div>`;
});
const css$i = {
  code: 'div.container.svelte-1m03nv4.svelte-1m03nv4{width:100%;display:flex}div.container.svelte-1m03nv4 .panel-item.svelte-1m03nv4{display:grid;gap:0.8rem}div.container.svelte-1m03nv4 .panel-item__icon.svelte-1m03nv4{grid-area:icon}div.container.svelte-1m03nv4 .panel-item__title.svelte-1m03nv4{grid-area:title}div.container.svelte-1m03nv4 .panel-item__body.svelte-1m03nv4{grid-area:body}div.container.svelte-1m03nv4 .panel-item__title.svelte-1m03nv4{color:var(--clr-main);align-self:center;margin:0;font-weight:500}div.container.svelte-1m03nv4 .panel-item__icon.svelte-1m03nv4{display:none;color:var(--clr-main);fill:var(--clr-main)}@media(min-width: 768px){div.container.svelte-1m03nv4 .panel-item__icon.svelte-1m03nv4{display:block}}div.container.on-light.svelte-1m03nv4.svelte-1m03nv4{--clr-main:var(--clr-black)}div.container.on-dark.svelte-1m03nv4.svelte-1m03nv4{--clr-main:var(--clr-white)}div.container.column.svelte-1m03nv4.svelte-1m03nv4{align-items:stretch}div.container.column.svelte-1m03nv4 .panel-item.svelte-1m03nv4{width:100%;grid-template-columns:1.375rem minmax(0, 1fr);grid-template-rows:max-content min-content;grid-template-areas:"title title" "body body"}@media(min-width: 768px){div.container.column.svelte-1m03nv4 .panel-item.svelte-1m03nv4{grid-template-areas:"icon title" "body body"}}div.container.row.svelte-1m03nv4.svelte-1m03nv4{justify-content:center}div.container.row.svelte-1m03nv4 .panel-item.svelte-1m03nv4{grid-template-columns:1.375rem max-content max-content;grid-template-areas:"title title body"}@media(min-width: 768px){div.container.row.svelte-1m03nv4 .panel-item.svelte-1m03nv4{grid-template-areas:"icon title body"}}',
  map: '{"version":3,"file":"PanelItem.svelte","sources":["PanelItem.svelte"],"sourcesContent":["<script>\\n  import { getContext } from \\"svelte\\";\\n\\n  import Icon from \\"$lib/components/dom/atoms/Icon.svelte\\";\\n  \\n  export let title\\n  export let icon = undefined\\n  export let direction = \\"column\\"\\n\\n  const { theme } = getContext(\\"item-theme\\")\\n\\n\\n<\/script>\\n\\n<div \\n  class=\\"panel-item-container w-full flex container {direction} {theme}\\">\\n  <div class=\\"panel-item\\">\\n\\n    {#if icon}\\n      <div class=\\"panel-item__icon\\">\\n        <Icon {icon} />\\n      </div>\\n    {/if}\\n\\n    <h3 class=\\"panel-item__title text-xs\\">\\n      {title}\\n    </h3>\\n\\n    <div class=\\"panel-item__body\\">\\n      <slot />\\n    </div>\\n\\n  </div>\\n</div>\\n\\n<style lang=\\"scss\\">div.container {\\n  width: 100%;\\n  display: flex;\\n}\\ndiv.container .panel-item {\\n  display: grid;\\n  gap: 0.8rem;\\n}\\ndiv.container .panel-item__icon {\\n  grid-area: icon;\\n}\\ndiv.container .panel-item__title {\\n  grid-area: title;\\n}\\ndiv.container .panel-item__body {\\n  grid-area: body;\\n}\\ndiv.container .panel-item__title {\\n  color: var(--clr-main);\\n  align-self: center;\\n  margin: 0;\\n  font-weight: 500;\\n}\\ndiv.container .panel-item__icon {\\n  display: none;\\n  color: var(--clr-main);\\n  fill: var(--clr-main);\\n}\\n@media (min-width: 768px) {\\n  div.container .panel-item__icon {\\n    display: block;\\n  }\\n}\\ndiv.container.on-light {\\n  --clr-main: var(--clr-black);\\n}\\ndiv.container.on-dark {\\n  --clr-main: var(--clr-white);\\n}\\ndiv.container.column {\\n  align-items: stretch;\\n}\\ndiv.container.column .panel-item {\\n  width: 100%;\\n  grid-template-columns: 1.375rem minmax(0, 1fr);\\n  grid-template-rows: max-content min-content;\\n  grid-template-areas: \\"title title\\" \\"body body\\";\\n}\\n@media (min-width: 768px) {\\n  div.container.column .panel-item {\\n    grid-template-areas: \\"icon title\\" \\"body body\\";\\n  }\\n}\\ndiv.container.row {\\n  justify-content: center;\\n}\\ndiv.container.row .panel-item {\\n  grid-template-columns: 1.375rem max-content max-content;\\n  grid-template-areas: \\"title title body\\";\\n}\\n@media (min-width: 768px) {\\n  div.container.row .panel-item {\\n    grid-template-areas: \\"icon title body\\";\\n  }\\n}</style>"],"names":[],"mappings":"AAmCmB,GAAG,wCAAW,CAC/B,KAAK,CAAE,IAAI,CACX,OAAO,CAAE,IACX,CACA,GAAG,yBAAU,CAAC,0BAAY,CACxB,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,MACP,CACA,GAAG,yBAAU,CAAC,gCAAkB,CAC9B,SAAS,CAAE,IACb,CACA,GAAG,yBAAU,CAAC,iCAAmB,CAC/B,SAAS,CAAE,KACb,CACA,GAAG,yBAAU,CAAC,gCAAkB,CAC9B,SAAS,CAAE,IACb,CACA,GAAG,yBAAU,CAAC,iCAAmB,CAC/B,KAAK,CAAE,IAAI,UAAU,CAAC,CACtB,UAAU,CAAE,MAAM,CAClB,MAAM,CAAE,CAAC,CACT,WAAW,CAAE,GACf,CACA,GAAG,yBAAU,CAAC,gCAAkB,CAC9B,OAAO,CAAE,IAAI,CACb,KAAK,CAAE,IAAI,UAAU,CAAC,CACtB,IAAI,CAAE,IAAI,UAAU,CACtB,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,GAAG,yBAAU,CAAC,gCAAkB,CAC9B,OAAO,CAAE,KACX,CACF,CACA,GAAG,UAAU,uCAAU,CACrB,UAAU,CAAE,gBACd,CACA,GAAG,UAAU,sCAAS,CACpB,UAAU,CAAE,gBACd,CACA,GAAG,UAAU,qCAAQ,CACnB,WAAW,CAAE,OACf,CACA,GAAG,UAAU,sBAAO,CAAC,0BAAY,CAC/B,KAAK,CAAE,IAAI,CACX,qBAAqB,CAAE,QAAQ,CAAC,OAAO,CAAC,CAAC,CAAC,GAAG,CAAC,CAC9C,kBAAkB,CAAE,WAAW,CAAC,WAAW,CAC3C,mBAAmB,CAAE,aAAa,CAAC,WACrC,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,GAAG,UAAU,sBAAO,CAAC,0BAAY,CAC/B,mBAAmB,CAAE,YAAY,CAAC,WACpC,CACF,CACA,GAAG,UAAU,kCAAK,CAChB,eAAe,CAAE,MACnB,CACA,GAAG,UAAU,mBAAI,CAAC,0BAAY,CAC5B,qBAAqB,CAAE,QAAQ,CAAC,WAAW,CAAC,WAAW,CACvD,mBAAmB,CAAE,kBACvB,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,GAAG,UAAU,mBAAI,CAAC,0BAAY,CAC5B,mBAAmB,CAAE,iBACvB,CACF"}'
};
const PanelItem = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { icon = void 0 } = $$props;
  let { direction = "column" } = $$props;
  const { theme } = getContext("item-theme");
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0) $$bindings.direction(direction);
  $$result.css.add(css$i);
  return `<div class="${"panel-item-container w-full flex container " + escape(direction, true) + " " + escape(theme, true) + " svelte-1m03nv4"}"><div class="panel-item svelte-1m03nv4">${icon ? `<div class="panel-item__icon svelte-1m03nv4">${validate_component(Icon, "Icon").$$render($$result, { icon }, {}, {})}</div>` : ``} <h3 class="panel-item__title text-xs svelte-1m03nv4">${escape(title)}</h3> <div class="panel-item__body svelte-1m03nv4">${slots.default ? slots.default({}) : ``}</div></div> </div>`;
});
const css$h = {
  code: ".container.svelte-11shla7.svelte-11shla7{width:var(--fs-label);display:flex;flex-direction:center;align-items:center}.container.svelte-11shla7 svg.svelte-11shla7{--clr-outline:var(--clr-black);--clr-fill-selected:var(--clr-black);--clr-fill-hover:var(--clr-accent);--clr-minus:var(--clr-accent);width:100%;aspect-ratio:1;margin:0 auto;padding:0;overflow:visible}.container.svelte-11shla7 svg.on-dark.svelte-11shla7{--clr-outline:var(--clr-accent);--clr-fill-selected:var(--clr-accent);--clr-fill-hover:var(--clr-accent);--clr-minus:var(--clr-black)}.container.svelte-11shla7 svg .check__goal.svelte-11shla7{r:calc(0.8 * var(--fs-label))}.container.svelte-11shla7 svg .check__point.svelte-11shla7{r:calc(0.1 * var(--fs-label));fill:var(--clr-outline)}.container.svelte-11shla7 svg .check__main.svelte-11shla7{fill:transparent;stroke:var(--clr-outline);r:calc(0.4 * var(--fs-label));stroke-width:calc(0.1 * var(--fs-label))}.container.svelte-11shla7 svg .check__minus.svelte-11shla7{stroke:var(--clr-minus);stroke-width:calc(0.2 * var(--fs-label))}.container.svelte-11shla7 svg.active .check__main.svelte-11shla7{fill:var(--clr-fill-selected)}@media(min-width: 768px){.container.svelte-11shla7 svg.hovered .check__main.svelte-11shla7{fill:var(--clr-fill-hover)}}",
  map: '{"version":3,"file":"CheckIcon.svelte","sources":["CheckIcon.svelte"],"sourcesContent":["<script>\\n  export let active = false\\n  export let hoveredFilter = false\\n  export let onDark = false\\n\\n  export let backgroundColor = undefined\\n\\n  let size\\n  \\n<\/script>\\n\\n<div class=\\"container check-icon\\" bind:clientWidth={size}>\\n  {#if size}\\n    <svg \\n      width={size} \\n      height={size} \\n      viewBox=\\"0 0 {size} {size}\\"\\n      class:active={active}\\n      class:hovered={!active && hoveredFilter}\\n      class:on-dark={onDark}\\n    >\\n\\n      <g class=\\"check\\" transform=\\"translate({size/2}, {size/2})\\">\\n\\n        {#if backgroundColor}\\n          <circle class=\\"check__goal\\" fill={backgroundColor} />\\n        {/if}\\n\\n        <circle class=\\"check__point\\" />\\n        <circle class=\\"check__main\\" />\\n\\n        {#if active}\\n          <line class=\\"check__minus\\" x1={-size*.35} x2={size*.35} y1=0 y2=0 />\\n        {/if}\\n\\n      </g>\\n\\n    </svg>\\n  {/if}\\n</div>\\n\\n<style lang=\\"scss\\">.container {\\n  width: var(--fs-label);\\n  display: flex;\\n  flex-direction: center;\\n  align-items: center;\\n}\\n.container svg {\\n  --clr-outline: var(--clr-black);\\n  --clr-fill-selected: var(--clr-black);\\n  --clr-fill-hover: var(--clr-accent);\\n  --clr-minus: var(--clr-accent);\\n  width: 100%;\\n  aspect-ratio: 1;\\n  margin: 0 auto;\\n  padding: 0;\\n  overflow: visible;\\n}\\n.container svg.on-dark {\\n  --clr-outline: var(--clr-accent);\\n  --clr-fill-selected: var(--clr-accent);\\n  --clr-fill-hover: var(--clr-accent);\\n  --clr-minus: var(--clr-black);\\n}\\n.container svg .check__goal {\\n  r: calc(0.8 * var(--fs-label));\\n}\\n.container svg .check__point {\\n  r: calc(0.1 * var(--fs-label));\\n  fill: var(--clr-outline);\\n}\\n.container svg .check__main {\\n  fill: transparent;\\n  stroke: var(--clr-outline);\\n  r: calc(0.4 * var(--fs-label));\\n  stroke-width: calc(0.1 * var(--fs-label));\\n}\\n.container svg .check__minus {\\n  stroke: var(--clr-minus);\\n  stroke-width: calc(0.2 * var(--fs-label));\\n}\\n.container svg.active .check__main {\\n  fill: var(--clr-fill-selected);\\n}\\n@media (min-width: 768px) {\\n  .container svg.hovered .check__main {\\n    fill: var(--clr-fill-hover);\\n  }\\n}</style>"],"names":[],"mappings":"AAyCmB,wCAAW,CAC5B,KAAK,CAAE,IAAI,UAAU,CAAC,CACtB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MACf,CACA,yBAAU,CAAC,kBAAI,CACb,aAAa,CAAE,gBAAgB,CAC/B,mBAAmB,CAAE,gBAAgB,CACrC,gBAAgB,CAAE,iBAAiB,CACnC,WAAW,CAAE,iBAAiB,CAC9B,KAAK,CAAE,IAAI,CACX,YAAY,CAAE,CAAC,CACf,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,OAAO,CAAE,CAAC,CACV,QAAQ,CAAE,OACZ,CACA,yBAAU,CAAC,GAAG,uBAAS,CACrB,aAAa,CAAE,iBAAiB,CAChC,mBAAmB,CAAE,iBAAiB,CACtC,gBAAgB,CAAE,iBAAiB,CACnC,WAAW,CAAE,gBACf,CACA,yBAAU,CAAC,GAAG,CAAC,2BAAa,CAC1B,CAAC,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAC/B,CACA,yBAAU,CAAC,GAAG,CAAC,4BAAc,CAC3B,CAAC,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAC9B,IAAI,CAAE,IAAI,aAAa,CACzB,CACA,yBAAU,CAAC,GAAG,CAAC,2BAAa,CAC1B,IAAI,CAAE,WAAW,CACjB,MAAM,CAAE,IAAI,aAAa,CAAC,CAC1B,CAAC,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAC9B,YAAY,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAC1C,CACA,yBAAU,CAAC,GAAG,CAAC,4BAAc,CAC3B,MAAM,CAAE,IAAI,WAAW,CAAC,CACxB,YAAY,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAC1C,CACA,yBAAU,CAAC,GAAG,OAAO,CAAC,2BAAa,CACjC,IAAI,CAAE,IAAI,mBAAmB,CAC/B,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,yBAAU,CAAC,GAAG,QAAQ,CAAC,2BAAa,CAClC,IAAI,CAAE,IAAI,gBAAgB,CAC5B,CACF"}'
};
const CheckIcon = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { active = false } = $$props;
  let { hoveredFilter: hoveredFilter2 = false } = $$props;
  let { onDark = false } = $$props;
  let { backgroundColor = void 0 } = $$props;
  if ($$props.active === void 0 && $$bindings.active && active !== void 0) $$bindings.active(active);
  if ($$props.hoveredFilter === void 0 && $$bindings.hoveredFilter && hoveredFilter2 !== void 0) $$bindings.hoveredFilter(hoveredFilter2);
  if ($$props.onDark === void 0 && $$bindings.onDark && onDark !== void 0) $$bindings.onDark(onDark);
  if ($$props.backgroundColor === void 0 && $$bindings.backgroundColor && backgroundColor !== void 0) $$bindings.backgroundColor(backgroundColor);
  $$result.css.add(css$h);
  return `<div class="container check-icon svelte-11shla7">${``} </div>`;
});
const css$g = {
  code: '.container.svelte-1gcwn54.svelte-1gcwn54{display:grid;gap:0}.container.svelte-1gcwn54 .input-group.svelte-1gcwn54{display:grid}.container.svelte-1gcwn54 .input-group__item .item.svelte-1gcwn54{text-transform:lowercase;overflow:hidden;display:grid;align-items:center;row-gap:0.4rem;-moz-column-gap:0.4rem;column-gap:0.4rem}.container.svelte-1gcwn54 .input-group__item .item__check.svelte-1gcwn54{grid-area:check}.container.svelte-1gcwn54 .input-group__item .item__icon.svelte-1gcwn54{grid-area:icon}.container.svelte-1gcwn54 .input-group__item .item__label.svelte-1gcwn54{grid-area:label}.container.svelte-1gcwn54 .input-group__item .item__check.svelte-1gcwn54{grid-area:check;display:flex;justify-content:center;align-items:center}.container.svelte-1gcwn54 .input-group__item .item__icon.svelte-1gcwn54{position:relative;height:100%}.container.svelte-1gcwn54 .input-group__item.active .item__label.svelte-1gcwn54{font-weight:500}.container.row.svelte-1gcwn54.svelte-1gcwn54{grid-auto-flow:row}.container.row.svelte-1gcwn54 .input-group.svelte-1gcwn54{grid-auto-flow:column;grid-auto-columns:min-content;gap:0.6rem}.container.row.svelte-1gcwn54 .input-group__item .item.svelte-1gcwn54{grid-template-columns:calc(var(--fs-label) * 1.8) min-content min-content;grid-template-areas:"icon check label";align-items:center;row-gap:0.4rem;-moz-column-gap:0.4rem;column-gap:0.4rem}.container.column.svelte-1gcwn54.svelte-1gcwn54{grid-auto-flow:column;grid-auto-columns:min-content !important;gap:2rem !important;margin-right:auto}.container.column.svelte-1gcwn54 .input-group.svelte-1gcwn54{grid-auto-flow:column;grid-auto-columns:1fr;gap:calc(1.2 * var(--fs-label))}.container.column.svelte-1gcwn54 .input-group__item .item.svelte-1gcwn54{grid-template-columns:min-content min-content;grid-template-rows:1.4rem 1fr;grid-template-areas:"icon icon" "check label"}input.svelte-1gcwn54.svelte-1gcwn54{display:none}',
  map: `{"version":3,"file":"InputGroupLayout.svelte","sources":["InputGroupLayout.svelte"],"sourcesContent":["<script>\\n  // Store\\n  import { hoveredFilter } from '$lib/stores';\\n\\n  // DOM Components\\n\\timport CheckIcon from '$lib/components/dom/atoms/CheckIcon.svelte';\\n  import Icon from '$lib/components/dom/atoms/Icon.svelte';\\n\\n\\n  export let selected = []\\n  export let disabled = false\\n  export let direction = 'column'\\n\\n  const categories = [\\n    { alias: \\"Block\\", id: \\"block\\" },\\n    { alias: \\"Radial\\", id: \\"radial\\" },\\n  ]\\n\\n\\n<\/script>\\n\\n<div class=\\"container {direction}\\">\\n\\n  <ul class=\\"input-group\\">\\n\\n    {#each categories as { id, alias }}\\n    {@const active = selected === id}\\n\\n      <li class=\\"input-group__item\\" class:active={active}>\\n\\n        <label class=\\"item text-xxs\\"\\n          on:mouseenter={() => hoveredFilter.set(id)}\\n          on:mouseleave={() => hoveredFilter.set()}\\n        >\\n\\n          <div class=\\"item__check\\">\\n            <CheckIcon \\n              active={active} \\n              hoveredFilter={$hoveredFilter === id} \\n            />\\n          </div>\\n\\n          <div class=\\"item__icon\\">\\n            <Icon icon={id} />\\n          </div>\\n\\n          <div class=\\"item__label\\">\\n            <input type=\\"radio\\" value={id} {disabled} bind:group={selected}/>\\n            <span>{alias}</span>\\n          </div>\\n\\n        </label>\\n\\n      </li>\\n\\n    {/each}\\n\\n  </ul>\\n\\n</div>\\n\\n<style lang=\\"scss\\">.container {\\n  display: grid;\\n  gap: 0;\\n}\\n.container .input-group {\\n  display: grid;\\n}\\n.container .input-group__item .item {\\n  text-transform: lowercase;\\n  overflow: hidden;\\n  display: grid;\\n  align-items: center;\\n  row-gap: 0.4rem;\\n  -moz-column-gap: 0.4rem;\\n       column-gap: 0.4rem;\\n}\\n.container .input-group__item .item__check {\\n  grid-area: check;\\n}\\n.container .input-group__item .item__icon {\\n  grid-area: icon;\\n}\\n.container .input-group__item .item__label {\\n  grid-area: label;\\n}\\n.container .input-group__item .item__check {\\n  grid-area: check;\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n}\\n.container .input-group__item .item__icon {\\n  position: relative;\\n  height: 100%;\\n}\\n.container .input-group__item.active .item__label {\\n  font-weight: 500;\\n}\\n.container.row {\\n  grid-auto-flow: row;\\n}\\n.container.row .input-group {\\n  grid-auto-flow: column;\\n  grid-auto-columns: min-content;\\n  gap: 0.6rem;\\n}\\n.container.row .input-group__item .item {\\n  grid-template-columns: calc(var(--fs-label) * 1.8) min-content min-content;\\n  grid-template-areas: \\"icon check label\\";\\n  align-items: center;\\n  row-gap: 0.4rem;\\n  -moz-column-gap: 0.4rem;\\n       column-gap: 0.4rem;\\n}\\n.container.column {\\n  grid-auto-flow: column;\\n  grid-auto-columns: min-content !important;\\n  gap: 2rem !important;\\n  margin-right: auto;\\n}\\n.container.column .input-group {\\n  grid-auto-flow: column;\\n  grid-auto-columns: 1fr;\\n  gap: calc(1.2 * var(--fs-label));\\n}\\n.container.column .input-group__item .item {\\n  grid-template-columns: min-content min-content;\\n  grid-template-rows: 1.4rem 1fr;\\n  grid-template-areas: \\"icon icon\\" \\"check label\\";\\n}\\n\\ninput {\\n  display: none;\\n}</style>"],"names":[],"mappings":"AA6DmB,wCAAW,CAC5B,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,CACP,CACA,yBAAU,CAAC,2BAAa,CACtB,OAAO,CAAE,IACX,CACA,yBAAU,CAAC,kBAAkB,CAAC,oBAAM,CAClC,cAAc,CAAE,SAAS,CACzB,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,MAAM,CACf,eAAe,CAAE,MAAM,CAClB,UAAU,CAAE,MACnB,CACA,yBAAU,CAAC,kBAAkB,CAAC,2BAAa,CACzC,SAAS,CAAE,KACb,CACA,yBAAU,CAAC,kBAAkB,CAAC,0BAAY,CACxC,SAAS,CAAE,IACb,CACA,yBAAU,CAAC,kBAAkB,CAAC,2BAAa,CACzC,SAAS,CAAE,KACb,CACA,yBAAU,CAAC,kBAAkB,CAAC,2BAAa,CACzC,SAAS,CAAE,KAAK,CAChB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MACf,CACA,yBAAU,CAAC,kBAAkB,CAAC,0BAAY,CACxC,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,IACV,CACA,yBAAU,CAAC,kBAAkB,OAAO,CAAC,2BAAa,CAChD,WAAW,CAAE,GACf,CACA,UAAU,kCAAK,CACb,cAAc,CAAE,GAClB,CACA,UAAU,mBAAI,CAAC,2BAAa,CAC1B,cAAc,CAAE,MAAM,CACtB,iBAAiB,CAAE,WAAW,CAC9B,GAAG,CAAE,MACP,CACA,UAAU,mBAAI,CAAC,kBAAkB,CAAC,oBAAM,CACtC,qBAAqB,CAAE,KAAK,IAAI,UAAU,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CAAC,WAAW,CAAC,WAAW,CAC1E,mBAAmB,CAAE,kBAAkB,CACvC,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,MAAM,CACf,eAAe,CAAE,MAAM,CAClB,UAAU,CAAE,MACnB,CACA,UAAU,qCAAQ,CAChB,cAAc,CAAE,MAAM,CACtB,iBAAiB,CAAE,WAAW,CAAC,UAAU,CACzC,GAAG,CAAE,IAAI,CAAC,UAAU,CACpB,YAAY,CAAE,IAChB,CACA,UAAU,sBAAO,CAAC,2BAAa,CAC7B,cAAc,CAAE,MAAM,CACtB,iBAAiB,CAAE,GAAG,CACtB,GAAG,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CACjC,CACA,UAAU,sBAAO,CAAC,kBAAkB,CAAC,oBAAM,CACzC,qBAAqB,CAAE,WAAW,CAAC,WAAW,CAC9C,kBAAkB,CAAE,MAAM,CAAC,GAAG,CAC9B,mBAAmB,CAAE,WAAW,CAAC,aACnC,CAEA,mCAAM,CACJ,OAAO,CAAE,IACX"}`
};
const InputGroupLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $hoveredFilter, $$unsubscribe_hoveredFilter;
  $$unsubscribe_hoveredFilter = subscribe(hoveredFilter, (value) => $hoveredFilter = value);
  let { selected: selected2 = [] } = $$props;
  let { disabled = false } = $$props;
  let { direction = "column" } = $$props;
  const categories2 = [{ alias: "Block", id: "block" }, { alias: "Radial", id: "radial" }];
  if ($$props.selected === void 0 && $$bindings.selected && selected2 !== void 0) $$bindings.selected(selected2);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0) $$bindings.direction(direction);
  $$result.css.add(css$g);
  $$unsubscribe_hoveredFilter();
  return `<div class="${"container " + escape(direction, true) + " svelte-1gcwn54"}"><ul class="input-group svelte-1gcwn54">${each(categories2, ({ id, alias }) => {
    let active = selected2 === id;
    return ` <li class="${["input-group__item", active ? "active" : ""].join(" ").trim()}"><label class="item text-xxs svelte-1gcwn54"><div class="item__check svelte-1gcwn54">${validate_component(CheckIcon, "CheckIcon").$$render(
      $$result,
      {
        active,
        hoveredFilter: $hoveredFilter === id
      },
      {},
      {}
    )}</div> <div class="item__icon svelte-1gcwn54">${validate_component(Icon, "Icon").$$render($$result, { icon: id }, {}, {})}</div> <div class="item__label svelte-1gcwn54"><input type="radio"${add_attribute("value", id, 0)} ${disabled ? "disabled" : ""} class="svelte-1gcwn54"${id === selected2 ? add_attribute("checked", true, 1) : ""}> <span>${escape(alias)}</span> </div></label> </li>`;
  })}</ul> </div>`;
});
const InputLayout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  let $isSwitchingLayout, $$unsubscribe_isSwitchingLayout;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_isSwitchingLayout = subscribe(isSwitchingLayout, (value) => $isSwitchingLayout = value);
  let { layout } = $$props;
  let { direction = "column" } = $$props;
  let { theme = "on-light" } = $$props;
  setContext("item-theme", { theme });
  if ($$props.layout === void 0 && $$bindings.layout && layout !== void 0) $$bindings.layout(layout);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0) $$bindings.direction(direction);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(PanelItem, "PanelItem").$$render(
      $$result,
      {
        icon: "layouts",
        title: $_("input.layout"),
        direction
      },
      {},
      {
        default: () => {
          return `${validate_component(InputGroupLayout, "InputGroupLayout").$$render(
            $$result,
            {
              direction,
              disabled: $isSwitchingLayout,
              selected: layout
            },
            {
              selected: ($$value) => {
                layout = $$value;
                $$settled = false;
              }
            },
            {}
          )}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe__();
  $$unsubscribe_isSwitchingLayout();
  return $$rendered;
});
const css$f = {
  code: "button.svelte-2whk0p{width:100%;height:100%;padding:0;display:flex;align-items:center;gap:0.2rem;font-family:var(--ff-general);font-size:var(--fs-btn);font-weight:300;color:var(--clr-default);white-space:nowrap;cursor:pointer}button.svelte-2whk0p:not(:disabled):active{color:var(--clr-active) !important}button.svelte-2whk0p:not(:disabled):hover{color:var(--clr-hover)}button.svelte-2whk0p:disabled{color:var(--clr-disabled)}",
  map: '{"version":3,"file":"Button.svelte","sources":["Button.svelte"],"sourcesContent":["<script>\\n  export let onClick\\n  export let disabled = false\\n\\n  export let colorDefault = \\"var(--clr-accent)\\"\\n  export let colorActive = \\"var(--clr-white)\\"\\n  export let colorHover = \\"var(--clr-white)\\"\\n  export let colorDisabled = \\"var(--clr-gray)\\"\\n<\/script>\\n\\n<button \\n  class=\\"clean-btn\\"\\n  disabled={disabled}\\n  style:--clr-default={colorDefault}\\n  style:--clr-active={colorActive}\\n  style:--clr-hover={colorHover}\\n  style:--clr-disabled={colorDisabled}\\n  on:click={onClick}\\n>\\n  <slot />\\n</button>\\n\\n<style lang=\\"scss\\">button {\\n  width: 100%;\\n  height: 100%;\\n  padding: 0;\\n  display: flex;\\n  align-items: center;\\n  gap: 0.2rem;\\n  font-family: var(--ff-general);\\n  font-size: var(--fs-btn);\\n  font-weight: 300;\\n  color: var(--clr-default);\\n  white-space: nowrap;\\n  cursor: pointer;\\n}\\nbutton:not(:disabled):active {\\n  color: var(--clr-active) !important;\\n}\\nbutton:not(:disabled):hover {\\n  color: var(--clr-hover);\\n}\\nbutton:disabled {\\n  color: var(--clr-disabled);\\n}</style>"],"names":[],"mappings":"AAsBmB,oBAAO,CACxB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,CAAC,CACV,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,GAAG,CAAE,MAAM,CACX,WAAW,CAAE,IAAI,YAAY,CAAC,CAC9B,SAAS,CAAE,IAAI,QAAQ,CAAC,CACxB,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,aAAa,CAAC,CACzB,WAAW,CAAE,MAAM,CACnB,MAAM,CAAE,OACV,CACA,oBAAM,KAAK,SAAS,CAAC,OAAQ,CAC3B,KAAK,CAAE,IAAI,YAAY,CAAC,CAAC,UAC3B,CACA,oBAAM,KAAK,SAAS,CAAC,MAAO,CAC1B,KAAK,CAAE,IAAI,WAAW,CACxB,CACA,oBAAM,SAAU,CACd,KAAK,CAAE,IAAI,cAAc,CAC3B"}'
};
const Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { onClick } = $$props;
  let { disabled = false } = $$props;
  let { colorDefault = "var(--clr-accent)" } = $$props;
  let { colorActive = "var(--clr-white)" } = $$props;
  let { colorHover = "var(--clr-white)" } = $$props;
  let { colorDisabled = "var(--clr-gray)" } = $$props;
  if ($$props.onClick === void 0 && $$bindings.onClick && onClick !== void 0) $$bindings.onClick(onClick);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.colorDefault === void 0 && $$bindings.colorDefault && colorDefault !== void 0) $$bindings.colorDefault(colorDefault);
  if ($$props.colorActive === void 0 && $$bindings.colorActive && colorActive !== void 0) $$bindings.colorActive(colorActive);
  if ($$props.colorHover === void 0 && $$bindings.colorHover && colorHover !== void 0) $$bindings.colorHover(colorHover);
  if ($$props.colorDisabled === void 0 && $$bindings.colorDisabled && colorDisabled !== void 0) $$bindings.colorDisabled(colorDisabled);
  $$result.css.add(css$f);
  return `<button class="clean-btn svelte-2whk0p" ${disabled ? "disabled" : ""}${add_styles({
    "--clr-default": colorDefault,
    "--clr-active": colorActive,
    "--clr-hover": colorHover,
    "--clr-disabled": colorDisabled
  })}>${slots.default ? slots.default({}) : ``} </button>`;
});
const ClearFilterButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  let { onClick } = $$props;
  let { disabled } = $$props;
  let { uppercase = false } = $$props;
  if ($$props.onClick === void 0 && $$bindings.onClick && onClick !== void 0) $$bindings.onClick(onClick);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.uppercase === void 0 && $$bindings.uppercase && uppercase !== void 0) $$bindings.uppercase(uppercase);
  $$unsubscribe__();
  return `<button class="clear-filter-button" ${disabled ? "disabled" : ""}><p class="${"w-full text-left font-inherit text-nowrap text-xxs " + escape(uppercase ? "uppercase" : "", true)}">${slots.default ? slots.default({}) : ` <span class="font-inherit underline">${escape($_("input.unselect"))}</span> `}</p></button>`;
});
function is_date(obj) {
  return Object.prototype.toString.call(obj) === "[object Date]";
}
function get_interpolator(a, b) {
  if (a === b || a !== a) return () => a;
  const type = typeof a;
  if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
    throw new Error("Cannot interpolate values of different type");
  }
  if (Array.isArray(a)) {
    const arr = b.map((bi, i) => {
      return get_interpolator(a[i], bi);
    });
    return (t) => arr.map((fn) => fn(t));
  }
  if (type === "object") {
    if (!a || !b) throw new Error("Object cannot be null");
    if (is_date(a) && is_date(b)) {
      a = a.getTime();
      b = b.getTime();
      const delta = b - a;
      return (t) => new Date(a + t * delta);
    }
    const keys = Object.keys(b);
    const interpolators = {};
    keys.forEach((key) => {
      interpolators[key] = get_interpolator(a[key], b[key]);
    });
    return (t) => {
      const result = {};
      keys.forEach((key) => {
        result[key] = interpolators[key](t);
      });
      return result;
    };
  }
  if (type === "number") {
    const delta = b - a;
    return (t) => a + t * delta;
  }
  throw new Error(`Cannot interpolate ${type} values`);
}
function tweened(value, defaults = {}) {
  const store = writable(value);
  let task;
  let target_value = value;
  function set(new_value, opts) {
    if (value == null) {
      store.set(value = new_value);
      return Promise.resolve();
    }
    target_value = new_value;
    let previous_task = task;
    let started = false;
    let {
      delay = 0,
      duration = 400,
      easing = identity,
      interpolate = get_interpolator
    } = assign(assign({}, defaults), opts);
    if (duration === 0) {
      if (previous_task) {
        previous_task.abort();
        previous_task = null;
      }
      store.set(value = target_value);
      return Promise.resolve();
    }
    const start = now() + delay;
    let fn;
    task = loop((now2) => {
      if (now2 < start) return true;
      if (!started) {
        fn = interpolate(value, new_value);
        if (typeof duration === "function") duration = duration(value, new_value);
        started = true;
      }
      if (previous_task) {
        previous_task.abort();
        previous_task = null;
      }
      const elapsed = now2 - start;
      if (elapsed > /** @type {number} */
      duration) {
        store.set(value = new_value);
        return false;
      }
      store.set(value = fn(easing(elapsed / duration)));
      return true;
    });
    return task.promise;
  }
  return {
    set,
    update: (fn, opts) => set(fn(target_value, value), opts),
    subscribe: store.subscribe
  };
}
const css$e = {
  code: ".bar-container.svelte-1xji6c4.svelte-1xji6c4{width:100%;height:1em}.bar-container.svelte-1xji6c4 svg.svelte-1xji6c4{width:100%;height:100%}",
  map: '{"version":3,"file":"BarTween.svelte","sources":["BarTween.svelte"],"sourcesContent":["<script>\\n  import * as d3 from \\"d3\\"\\n  import { tweened } from \\"svelte/motion\\";\\n\\n  export let i\\n  export let number\\n  export let domain = [0, 1]\\n  export let options = {}\\n  \\n  let w = 0\\n  let h = 0\\n\\n  const defaultOptions = {\\n    duration: 1000,\\n    delay: i * .05 * 1000,\\n    easing: d3.easeCubicInOut,\\n  }\\n\\n  const tweenOptions = {\\n    ...defaultOptions,\\n    ...options\\n  }\\n\\n  const bw = tweened(0, tweenOptions)\\n\\n  $: xScale = d3.scaleLinear()\\n    .domain(domain)\\n    .range([0, w])\\n\\n  $: $bw = xScale(number)\\n\\n<\/script>\\n\\n\\n<div \\n  class=\\"bar-container\\"\\n  bind:clientWidth={w}\\n  bind:clientHeight={h}\\n>\\n  <svg>\\n    <line x1=0 x2={w} y1={h/2} y2={h/2} stroke=\\"black\\" stroke-dasharray=\\"1 3\\"/>\\n    <line x1=0 x2={$bw} y1={h/2} y2={h/2} stroke=\\"var(--clr-accent)\\" stroke-width=2/>\\n  </svg>\\n</div>\\n\\n\\n<style lang=\\"scss\\">.bar-container {\\n  width: 100%;\\n  height: 1em;\\n}\\n.bar-container svg {\\n  width: 100%;\\n  height: 100%;\\n}</style>"],"names":[],"mappings":"AA8CmB,4CAAe,CAChC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GACV,CACA,6BAAc,CAAC,kBAAI,CACjB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IACV"}'
};
const BarTween = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let xScale;
  let $bw, $$unsubscribe_bw;
  let { i } = $$props;
  let { number } = $$props;
  let { domain = [0, 1] } = $$props;
  let { options = {} } = $$props;
  let w = 0;
  let h = 0;
  const defaultOptions = {
    duration: 1e3,
    delay: i * 0.05 * 1e3,
    easing: d3.easeCubicInOut
  };
  const tweenOptions = { ...defaultOptions, ...options };
  const bw = tweened(0, tweenOptions);
  $$unsubscribe_bw = subscribe(bw, (value) => $bw = value);
  if ($$props.i === void 0 && $$bindings.i && i !== void 0) $$bindings.i(i);
  if ($$props.number === void 0 && $$bindings.number && number !== void 0) $$bindings.number(number);
  if ($$props.domain === void 0 && $$bindings.domain && domain !== void 0) $$bindings.domain(domain);
  if ($$props.options === void 0 && $$bindings.options && options !== void 0) $$bindings.options(options);
  $$result.css.add(css$e);
  xScale = d3.scaleLinear().domain(domain).range([0, w]);
  set_store_value(bw, $bw = xScale(number), $bw);
  $$unsubscribe_bw();
  return `<div class="bar-container svelte-1xji6c4"><svg class="svelte-1xji6c4"><line x1="0"${add_attribute("x2", w, 0)}${add_attribute("y1", h / 2, 0)}${add_attribute("y2", h / 2, 0)} stroke="black" stroke-dasharray="1 3"></line><line x1="0"${add_attribute("x2", $bw, 0)}${add_attribute("y1", h / 2, 0)}${add_attribute("y2", h / 2, 0)} stroke="var(--clr-accent)" stroke-width="2"></line></svg> </div>`;
});
const NumberTween = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $number_t, $$unsubscribe_number_t;
  let { number } = $$props;
  let { isPct = false } = $$props;
  let { options = {} } = $$props;
  const defaultOptions = { duration: 500, easing: d3.easeCubicInOut };
  const tweenOptions = { ...defaultOptions, ...options };
  const number_t = tweened(0, tweenOptions);
  $$unsubscribe_number_t = subscribe(number_t, (value) => $number_t = value);
  if ($$props.number === void 0 && $$bindings.number && number !== void 0) $$bindings.number(number);
  if ($$props.isPct === void 0 && $$bindings.isPct && isPct !== void 0) $$bindings.isPct(isPct);
  if ($$props.options === void 0 && $$bindings.options && options !== void 0) $$bindings.options(options);
  set_store_value(number_t, $number_t = number, $number_t);
  $$unsubscribe_number_t();
  return `<p class="text-xxs m-0">${escape(isPct ? Math.round($number_t * 100) + "%" : Math.round($number_t))}</p>`;
});
const css$d = {
  code: '.container.svelte-7uq28.svelte-7uq28.svelte-7uq28{display:grid;gap:0;width:100%}.container.on-dark.svelte-7uq28 .input-group__item .item__label input.svelte-7uq28:checked+span.svelte-7uq28{font-weight:700;color:var(--clr-accent)}.container.svelte-7uq28 .input-group.svelte-7uq28.svelte-7uq28{display:grid}.container.svelte-7uq28 .input-group__item .item.svelte-7uq28.svelte-7uq28{text-transform:lowercase;display:grid;align-items:center;-moz-column-gap:0.4rem;column-gap:0.4rem}.container.svelte-7uq28 .input-group__item .item__check.svelte-7uq28.svelte-7uq28{grid-area:check}.container.svelte-7uq28 .input-group__item .item__label.svelte-7uq28.svelte-7uq28{grid-area:label}.container.svelte-7uq28 .input-group__item .item__bar.svelte-7uq28.svelte-7uq28{grid-area:bar}.container.svelte-7uq28 .input-group__item .item__number.svelte-7uq28.svelte-7uq28{grid-area:num}.container.svelte-7uq28 .input-group__item .item__check.svelte-7uq28.svelte-7uq28{display:flex;justify-content:center;align-items:center}.container.svelte-7uq28 .input-group__item.active .item__label.svelte-7uq28.svelte-7uq28{font-weight:500}.container.row.svelte-7uq28.svelte-7uq28.svelte-7uq28{grid-auto-flow:column;margin-right:auto}.container.row.svelte-7uq28 .input-group.svelte-7uq28.svelte-7uq28{grid-auto-flow:column;grid-auto-columns:1fr;gap:0.25rem}.container.row.svelte-7uq28 .input-group__unselect-btn.svelte-7uq28.svelte-7uq28{align-self:end;display:flex}.container.column.svelte-7uq28.svelte-7uq28.svelte-7uq28{grid-auto-flow:row;grid-template-columns:max-content}.container.column.svelte-7uq28 .input-group.svelte-7uq28.svelte-7uq28{grid-auto-flow:row;grid-auto-rows:min-content;gap:0.4rem}.container.simple.svelte-7uq28 .input-group__item .item.svelte-7uq28.svelte-7uq28{grid-template-columns:min-content 1fr;grid-template-areas:"check label"}.container.design.svelte-7uq28.svelte-7uq28.svelte-7uq28{grid-template-columns:none}.container.design.svelte-7uq28 .input-group__item .item.svelte-7uq28.svelte-7uq28{grid-template-columns:min-content 1fr 2rem;grid-template-rows:auto min-content;grid-template-areas:"check label num" "bar bar num"}.container.product.svelte-7uq28.svelte-7uq28.svelte-7uq28{grid-auto-columns:max-content !important}.container.product.svelte-7uq28 .input-group.svelte-7uq28.svelte-7uq28{grid-auto-columns:96px !important}.container.product.svelte-7uq28 .input-group__item .item.svelte-7uq28.svelte-7uq28{grid-template-rows:min-content 2.4rem auto;grid-template-areas:"check" "icon" "label"}.container.product.svelte-7uq28 .input-group__item .item .item__label.svelte-7uq28.svelte-7uq28{text-align:center}.container.product.svelte-7uq28 .input-group__item .item .item__check.svelte-7uq28.svelte-7uq28{align-self:center}.container.product.svelte-7uq28 .input-group__unselect-btn.svelte-7uq28.svelte-7uq28{align-self:start !important;padding-top:calc(2.4rem + 10px)}input.svelte-7uq28.svelte-7uq28.svelte-7uq28{display:none}',
  map: `{"version":3,"file":"InputGroup.svelte","sources":["InputGroup.svelte"],"sourcesContent":["<script>\\n  import { getContext } from 'svelte';\\n  import { _ } from 'svelte-i18n'\\n\\n  // Stores\\n  import { hoveredFilter } from '$lib/stores/canvas.js';\\n\\n  // DOM Components\\n  import ClearFilterButton from \\"$lib/components/dom/molecules/ClearFilterButton.svelte\\";\\n  import BarTween from \\"$lib/components/dom/atoms/BarTween.svelte\\";\\n\\timport CheckIcon from '$lib/components/dom/atoms/CheckIcon.svelte';\\n  import NumberTween from '$lib/components/dom/atoms/NumberTween.svelte';\\n\\n  export let categories\\n  export let selected = []\\n  export let multiselect = true\\n  export let unselectBtn = multiselect\\n  export let disabled = false\\n  export let onDark = false\\n  export let i18nPrefix = \\"\\"\\n\\n  export let gridlayout = 'simple'\\n\\n  export let direction = 'row'\\n\\n  const { theme } = getContext(\\"item-theme\\")\\n\\n\\n\\n<\/script>\\n\\n<div class=\\"container {gridlayout} {direction} {theme}\\">\\n\\n  <ul class=\\"input-group\\">\\n    {#each categories as { id, pctNodes }, i}\\n    {@const active = multiselect ? selected.includes(id) : selected === id}\\n\\n      <li class=\\"input-group__item\\" class:active={active}>\\n\\n        <label class=\\"item text-xxs\\"\\n          on:mouseenter={() => $hoveredFilter = id}\\n          on:mouseleave={() => $hoveredFilter = undefined}\\n        >\\n\\n          <div class=\\"item__check\\">\\n            <CheckIcon \\n              onDark={onDark || theme === \\"on-dark\\"}\\n              active={active} \\n              hoveredFilter={$hoveredFilter === id} \\n            />\\n          </div>\\n\\n\\n          <div class=\\"item__label\\">\\n          {#if multiselect}\\n            <input type=\\"checkbox\\" value={id} {disabled} bind:group={selected}/>\\n          {:else}\\n            <input type=\\"radio\\" value={id} {disabled} bind:group={selected}/>\\n          {/if}\\n            <span class:on-dark={onDark}>{$_(i18nPrefix + id)}</span>\\n          </div>\\n\\n\\n          {#if gridlayout === 'design'}\\n            <div class=\\"item__bar\\">\\n              <BarTween {i} number={pctNodes}/>\\n            </div>\\n\\n            <div class=\\"item__number\\">\\n              <NumberTween number={pctNodes} isPct={true} />\\n            </div>\\n          {/if}\\n\\n        </label>\\n\\n      </li>\\n\\n    {/each}\\n\\n    {#if unselectBtn}\\n      <li class=\\"input-group__unselect-btn\\">\\n        <ClearFilterButton \\n          onClick={() => selected = []} \\n          disabled={selected.length === 0} \\n        />\\n      </li>\\n    {/if}\\n\\n  </ul>\\n\\n</div>\\n\\n<style lang=\\"scss\\">.container {\\n  display: grid;\\n  gap: 0;\\n  width: 100%;\\n}\\n.container.on-dark .input-group__item .item__label input:checked + span {\\n  font-weight: 700;\\n  color: var(--clr-accent);\\n}\\n.container .input-group {\\n  display: grid;\\n}\\n.container .input-group__item .item {\\n  text-transform: lowercase;\\n  display: grid;\\n  align-items: center;\\n  -moz-column-gap: 0.4rem;\\n       column-gap: 0.4rem;\\n}\\n.container .input-group__item .item__check {\\n  grid-area: check;\\n}\\n.container .input-group__item .item__label {\\n  grid-area: label;\\n}\\n.container .input-group__item .item__icon {\\n  grid-area: icon;\\n}\\n.container .input-group__item .item__bar {\\n  grid-area: bar;\\n}\\n.container .input-group__item .item__number {\\n  grid-area: num;\\n}\\n.container .input-group__item .item__check {\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n}\\n.container .input-group__item .item__icon {\\n  position: relative;\\n  height: 100%;\\n}\\n.container .input-group__item .item_number {\\n  text-align: right;\\n}\\n.container .input-group__item.active .item__label {\\n  font-weight: 500;\\n}\\n.container.row {\\n  grid-auto-flow: column;\\n  margin-right: auto;\\n}\\n.container.row .input-group {\\n  grid-auto-flow: column;\\n  grid-auto-columns: 1fr;\\n  gap: 0.25rem;\\n}\\n.container.row .input-group__unselect-btn {\\n  align-self: end;\\n  display: flex;\\n}\\n.container.column {\\n  grid-auto-flow: row;\\n  grid-template-columns: max-content;\\n}\\n.container.column .input-group {\\n  grid-auto-flow: row;\\n  grid-auto-rows: min-content;\\n  gap: 0.4rem;\\n}\\n.container.simple .input-group__item .item {\\n  grid-template-columns: min-content 1fr;\\n  grid-template-areas: \\"check label\\";\\n}\\n.container.design {\\n  grid-template-columns: none;\\n}\\n.container.design .input-group__item .item {\\n  grid-template-columns: min-content 1fr 2rem;\\n  grid-template-rows: auto min-content;\\n  grid-template-areas: \\"check label num\\" \\"bar bar num\\";\\n}\\n.container.product {\\n  grid-auto-columns: max-content !important;\\n}\\n.container.product .input-group {\\n  grid-auto-columns: 96px !important;\\n}\\n.container.product .input-group__item .item {\\n  grid-template-rows: min-content 2.4rem auto;\\n  grid-template-areas: \\"check\\" \\"icon\\" \\"label\\";\\n}\\n.container.product .input-group__item .item .item__label {\\n  text-align: center;\\n}\\n.container.product .input-group__item .item .item__check {\\n  align-self: center;\\n}\\n.container.product .input-group__unselect-btn {\\n  align-self: start !important;\\n  padding-top: calc(2.4rem + 10px);\\n}\\n\\ninput {\\n  display: none;\\n}</style>"],"names":[],"mappings":"AA4FmB,iDAAW,CAC5B,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,CAAC,CACN,KAAK,CAAE,IACT,CACA,UAAU,qBAAQ,CAAC,kBAAkB,CAAC,YAAY,CAAC,kBAAK,QAAQ,CAAG,iBAAK,CACtE,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,YAAY,CACzB,CACA,uBAAU,CAAC,sCAAa,CACtB,OAAO,CAAE,IACX,CACA,uBAAU,CAAC,kBAAkB,CAAC,+BAAM,CAClC,cAAc,CAAE,SAAS,CACzB,OAAO,CAAE,IAAI,CACb,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CAClB,UAAU,CAAE,MACnB,CACA,uBAAU,CAAC,kBAAkB,CAAC,sCAAa,CACzC,SAAS,CAAE,KACb,CACA,uBAAU,CAAC,kBAAkB,CAAC,sCAAa,CACzC,SAAS,CAAE,KACb,CAIA,uBAAU,CAAC,kBAAkB,CAAC,oCAAW,CACvC,SAAS,CAAE,GACb,CACA,uBAAU,CAAC,kBAAkB,CAAC,uCAAc,CAC1C,SAAS,CAAE,GACb,CACA,uBAAU,CAAC,kBAAkB,CAAC,sCAAa,CACzC,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MACf,CAQA,uBAAU,CAAC,kBAAkB,OAAO,CAAC,sCAAa,CAChD,WAAW,CAAE,GACf,CACA,UAAU,2CAAK,CACb,cAAc,CAAE,MAAM,CACtB,YAAY,CAAE,IAChB,CACA,UAAU,iBAAI,CAAC,sCAAa,CAC1B,cAAc,CAAE,MAAM,CACtB,iBAAiB,CAAE,GAAG,CACtB,GAAG,CAAE,OACP,CACA,UAAU,iBAAI,CAAC,oDAA2B,CACxC,UAAU,CAAE,GAAG,CACf,OAAO,CAAE,IACX,CACA,UAAU,8CAAQ,CAChB,cAAc,CAAE,GAAG,CACnB,qBAAqB,CAAE,WACzB,CACA,UAAU,oBAAO,CAAC,sCAAa,CAC7B,cAAc,CAAE,GAAG,CACnB,cAAc,CAAE,WAAW,CAC3B,GAAG,CAAE,MACP,CACA,UAAU,oBAAO,CAAC,kBAAkB,CAAC,+BAAM,CACzC,qBAAqB,CAAE,WAAW,CAAC,GAAG,CACtC,mBAAmB,CAAE,aACvB,CACA,UAAU,8CAAQ,CAChB,qBAAqB,CAAE,IACzB,CACA,UAAU,oBAAO,CAAC,kBAAkB,CAAC,+BAAM,CACzC,qBAAqB,CAAE,WAAW,CAAC,GAAG,CAAC,IAAI,CAC3C,kBAAkB,CAAE,IAAI,CAAC,WAAW,CACpC,mBAAmB,CAAE,iBAAiB,CAAC,aACzC,CACA,UAAU,+CAAS,CACjB,iBAAiB,CAAE,WAAW,CAAC,UACjC,CACA,UAAU,qBAAQ,CAAC,sCAAa,CAC9B,iBAAiB,CAAE,IAAI,CAAC,UAC1B,CACA,UAAU,qBAAQ,CAAC,kBAAkB,CAAC,+BAAM,CAC1C,kBAAkB,CAAE,WAAW,CAAC,MAAM,CAAC,IAAI,CAC3C,mBAAmB,CAAE,OAAO,CAAC,MAAM,CAAC,OACtC,CACA,UAAU,qBAAQ,CAAC,kBAAkB,CAAC,KAAK,CAAC,sCAAa,CACvD,UAAU,CAAE,MACd,CACA,UAAU,qBAAQ,CAAC,kBAAkB,CAAC,KAAK,CAAC,sCAAa,CACvD,UAAU,CAAE,MACd,CACA,UAAU,qBAAQ,CAAC,oDAA2B,CAC5C,UAAU,CAAE,KAAK,CAAC,UAAU,CAC5B,WAAW,CAAE,KAAK,MAAM,CAAC,CAAC,CAAC,IAAI,CACjC,CAEA,4CAAM,CACJ,OAAO,CAAE,IACX"}`
};
const InputGroup = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $hoveredFilter, $$unsubscribe_hoveredFilter;
  let $_, $$unsubscribe__;
  $$unsubscribe_hoveredFilter = subscribe(hoveredFilter, (value) => $hoveredFilter = value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  let { categories: categories2 } = $$props;
  let { selected: selected2 = [] } = $$props;
  let { multiselect = true } = $$props;
  let { unselectBtn = multiselect } = $$props;
  let { disabled = false } = $$props;
  let { onDark = false } = $$props;
  let { i18nPrefix = "" } = $$props;
  let { gridlayout = "simple" } = $$props;
  let { direction = "row" } = $$props;
  const { theme } = getContext("item-theme");
  if ($$props.categories === void 0 && $$bindings.categories && categories2 !== void 0) $$bindings.categories(categories2);
  if ($$props.selected === void 0 && $$bindings.selected && selected2 !== void 0) $$bindings.selected(selected2);
  if ($$props.multiselect === void 0 && $$bindings.multiselect && multiselect !== void 0) $$bindings.multiselect(multiselect);
  if ($$props.unselectBtn === void 0 && $$bindings.unselectBtn && unselectBtn !== void 0) $$bindings.unselectBtn(unselectBtn);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.onDark === void 0 && $$bindings.onDark && onDark !== void 0) $$bindings.onDark(onDark);
  if ($$props.i18nPrefix === void 0 && $$bindings.i18nPrefix && i18nPrefix !== void 0) $$bindings.i18nPrefix(i18nPrefix);
  if ($$props.gridlayout === void 0 && $$bindings.gridlayout && gridlayout !== void 0) $$bindings.gridlayout(gridlayout);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0) $$bindings.direction(direction);
  $$result.css.add(css$d);
  $$unsubscribe_hoveredFilter();
  $$unsubscribe__();
  return `<div class="${"container " + escape(gridlayout, true) + " " + escape(direction, true) + " " + escape(theme, true) + " svelte-7uq28"}"><ul class="input-group svelte-7uq28">${each(categories2, ({ id, pctNodes }, i) => {
    let active = multiselect ? selected2.includes(id) : selected2 === id;
    return ` <li class="${["input-group__item", active ? "active" : ""].join(" ").trim()}"><label class="item text-xxs svelte-7uq28"><div class="item__check svelte-7uq28">${validate_component(CheckIcon, "CheckIcon").$$render(
      $$result,
      {
        onDark: onDark || theme === "on-dark",
        active,
        hoveredFilter: $hoveredFilter === id
      },
      {},
      {}
    )}</div> <div class="item__label svelte-7uq28">${multiselect ? `<input type="checkbox"${add_attribute("value", id, 0)} ${disabled ? "disabled" : ""} class="svelte-7uq28"${~selected2.indexOf(id) ? add_attribute("checked", true, 1) : ""}>` : `<input type="radio"${add_attribute("value", id, 0)} ${disabled ? "disabled" : ""} class="svelte-7uq28"${id === selected2 ? add_attribute("checked", true, 1) : ""}>`} <span class="${["svelte-7uq28", onDark ? "on-dark" : ""].join(" ").trim()}">${escape($_(i18nPrefix + id))}</span></div> ${gridlayout === "design" ? `<div class="item__bar svelte-7uq28">${validate_component(BarTween, "BarTween").$$render($$result, { i, number: pctNodes }, {}, {})}</div> <div class="item__number svelte-7uq28">${validate_component(NumberTween, "NumberTween").$$render($$result, { number: pctNodes, isPct: true }, {}, {})} </div>` : ``}</label> </li>`;
  })} ${unselectBtn ? `<li class="input-group__unselect-btn svelte-7uq28">${validate_component(ClearFilterButton, "ClearFilterButton").$$render(
    $$result,
    {
      onClick: () => selected2 = [],
      disabled: selected2.length === 0
    },
    {},
    {}
  )}</li>` : ``}</ul> </div>`;
});
const InputDesign = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  let $categoriesEnriched, $$unsubscribe_categoriesEnriched;
  let $isSwitchingLayout, $$unsubscribe_isSwitchingLayout;
  let $fdesigns, $$unsubscribe_fdesigns;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_categoriesEnriched = subscribe(categoriesEnriched, (value) => $categoriesEnriched = value);
  $$unsubscribe_isSwitchingLayout = subscribe(isSwitchingLayout, (value) => $isSwitchingLayout = value);
  $$unsubscribe_fdesigns = subscribe(fdesigns, (value) => $fdesigns = value);
  let { theme = "on-light" } = $$props;
  setContext("item-theme", { theme });
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(PanelItem, "PanelItem").$$render(
      $$result,
      {
        icon: "designs",
        title: $_("input.design")
      },
      {},
      {
        default: () => {
          return `${validate_component(InputGroup, "InputGroup").$$render(
            $$result,
            {
              gridlayout: "design",
              categories: $categoriesEnriched.filter((d) => d.type === "design"),
              direction: "column",
              i18nPrefix: "category.",
              disabled: $isSwitchingLayout,
              selected: $fdesigns
            },
            {
              selected: ($$value) => {
                $fdesigns = $$value;
                $$settled = false;
              }
            },
            {}
          )}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe__();
  $$unsubscribe_categoriesEnriched();
  $$unsubscribe_isSwitchingLayout();
  $$unsubscribe_fdesigns();
  return $$rendered;
});
const css$c = {
  code: ".container.svelte-u3fm5r.svelte-u3fm5r{--fs-year-label:calc(var(--fs-label)*.9);display:grid;grid-auto-flow:row}.container.on-light.svelte-u3fm5r.svelte-u3fm5r{--clr-line-back:var(--clr-black);--clr-line-front:var(--clr-black);--clr-fst-circle-fill:transparent;--clr-fst-circle-inner:var(--clr-black);--clr-sec-circle-fill:var(--clr-black);--clr-sec-circle-inner:var(--clr-white)}.container.on-dark.svelte-u3fm5r.svelte-u3fm5r{--clr-line-back:var(--clr-white);--clr-line-front:var(--clr-accent);--clr-fst-circle-fill:var(--clr-accent);--clr-fst-circle-inner:transparent;--clr-sec-circle-fill:var(--clr-white);--clr-sec-circle-inner:var(--clr-accent)}.container.svelte-u3fm5r .labels.svelte-u3fm5r{height:var(--fs-year-label);position:relative;font-weight:600}.container.svelte-u3fm5r .labels .label.svelte-u3fm5r{position:absolute;pointer-events:none;transform:translate(-50%, -10%)}.container.svelte-u3fm5r .slider-container.svelte-u3fm5r{height:calc(2 * var(--fs-label))}.container.svelte-u3fm5r .slider-container .slider.svelte-u3fm5r{width:100%;height:100%;overflow:visible}.container.svelte-u3fm5r .slider-container .slider__lines.svelte-u3fm5r{stroke-width:3px}@media(min-width: 768px){.container.svelte-u3fm5r .slider-container .slider__lines.svelte-u3fm5r{stroke-width:1px}}.container.svelte-u3fm5r .slider-container .slider__lines .line-back.svelte-u3fm5r{stroke:var(--clr-line-back);stroke-dasharray:4}@media(min-width: 768px){.container.svelte-u3fm5r .slider-container .slider__lines .line-back.svelte-u3fm5r{stroke-dasharray:1 3}}.container.svelte-u3fm5r .slider-container .slider__lines .line-front.svelte-u3fm5r{stroke:var(--clr-line-front)}.container.svelte-u3fm5r .slider-container .slider__handlers .handler .outer-circle.svelte-u3fm5r{stroke-width:1px}@media(min-width: 768px){.container.svelte-u3fm5r .slider-container .slider__handlers .handler .outer-circle.svelte-u3fm5r{stroke:var(--clr-black)}}.container.svelte-u3fm5r .slider-container .slider__handlers .handler .inner-circle.svelte-u3fm5r{opacity:0}.container.svelte-u3fm5r .slider-container .slider__handlers .handler .hover-box.svelte-u3fm5r{fill:transparent}.container.svelte-u3fm5r .slider-container .slider__handlers .handler:first-child .outer-circle.svelte-u3fm5r{fill:var(--clr-fst-circle-fill)}.container.svelte-u3fm5r .slider-container .slider__handlers .handler:first-child .inner-circle.svelte-u3fm5r{fill:var(--clr-fst-circle-inner)}.container.svelte-u3fm5r .slider-container .slider__handlers .handler:last-child .outer-circle.svelte-u3fm5r{fill:var(--clr-sec-circle-fill)}.container.svelte-u3fm5r .slider-container .slider__handlers .handler:last-child .inner-circle.svelte-u3fm5r{fill:var(--clr-sec-circle-inner)}.container.svelte-u3fm5r .slider-container .slider__handlers .handler:hover .outer-circle.svelte-u3fm5r{fill:var(--clr-accent-hover) !important}.container.svelte-u3fm5r .slider-container .slider__handlers .handler:not(:hover) .inner-circle.svelte-u3fm5r{opacity:1}.unclickable.svelte-u3fm5r.svelte-u3fm5r{pointer-events:none}",
  map: `{"version":3,"file":"YearSliderPicker.svelte","sources":["YearSliderPicker.svelte"],"sourcesContent":["<script>\\n  // Libraries\\n  import * as d3 from \\"d3\\"\\n  import { getContext } from \\"svelte\\"\\n\\n  export let min\\n  export let max\\n  export let step = 1\\n  export let selected = [ min, max ]\\n  export let disabled\\n\\n  const drag = [ min, max ]\\n  const { theme } = getContext(\\"item-theme\\")\\n\\n  let svg\\n  let w = 100\\n  let h = 100\\n  let isBehaviourSet = false\\n\\n  const pad = { left: 8, right: 8 }\\n  const years = d3.range(min, max+step, step)\\n\\n  // Reactivity\\n  $: rCircle = h/4\\n  $: innerW = w - (pad.left + pad.right)\\n  \\n  $: year2pos = d3.scalePoint()\\n    .domain(years)\\n    .range([0, innerW])\\n\\n  $: pos2year = d3.scaleQuantize()\\n    .domain([0, innerW])\\n    .range(years)\\n\\n  $: if (svg && !isBehaviourSet) {\\n    const dragBehaviour = d3.drag()\\n      .on('start', dragStart)\\n      .on('drag', dragged)\\n      .on('end', dragEnd)\\n\\n    d3.select(svg)\\n      .selectAll('.slider__handlers > .handler')\\n      .call(dragBehaviour)\\n\\n      isBehaviourSet = true\\n  }\\n\\n  $: {\\n    // When selected changes, updates drag\\n    // This is particularly useful when changes to selected are made outside the component\\n    drag[0] = selected[0]\\n    drag[1] = selected[1]\\n  }\\n\\n  function dragged(e) {\\n    if (disabled) return\\n\\n    const i = +this.getAttribute('data-index')\\n    const newYear = pos2year(e.x)\\n    if (i === 0) {\\n      drag[i] = Math.min(newYear, drag[1])\\n    } \\n    else {\\n      drag[i] = Math.max(newYear, drag[0])\\n    }\\n  }\\n\\n  function dragStart() {\\n    if (disabled) return\\n    document.body.style.cursor = \\"pointer\\"\\n  }\\n\\n  function dragEnd() {\\n    document.body.style.cursor = \\"default\\"\\n    if (disabled) return\\n    selected = drag\\n  }\\n\\n\\n\\n\\n<\/script>\\n\\n\\n<div class=\\"container {theme}\\" >\\n\\n  <ul class=\\"labels\\">\\n    {#each drag as year}\\n    {@const x = year2pos(year) + pad.left }\\n      <p class=\\"label text-xxs\\" style:left=\\"{x}px\\">\\n        {year}\\n      </p>\\n    {/each}\\n  </ul>\\n\\n  <!-- svelte-ignore a11y-no-static-element-interactions -->\\n  <div \\n    class=\\"slider-container\\"\\n    bind:clientWidth={w} \\n    bind:clientHeight={h}\\n  >\\n    <svg class=\\"slider\\" bind:this={svg}>\\n\\n      <g transform=\\"translate({pad.left}, {h/2})\\">\\n\\n        <g class=\\"slider__lines\\">\\n          <line class=\\"line-back\\" x1=0 x2={innerW} />\\n          <line class=\\"line-front\\" x1={year2pos(drag[0])} x2={year2pos(drag[1])} />\\n        </g>\\n\\n        <g class=\\"slider__handlers\\">\\n\\n          {#each drag as year, i}\\n          {@const x = year2pos(year) }\\n          {@const unclickable = i === 1 && drag[0] === max }\\n          \\n            <!-- svelte-ignore a11y-no-static-element-interactions -->\\n            <g \\n              class=\\"handler\\" \\n              class:unclickable={unclickable}\\n              transform=\\"translate({x}, 0)\\"\\n              data-index={i}\\n              style:cursor=\\"pointer\\"\\n            >\\n\\n              <circle class=\\"outer-circle\\" r={rCircle} />\\n              <circle class=\\"inner-circle\\" r={rCircle/4} />\\n\\n              <rect \\n                class=\\"hover-box\\"\\n                x={-year2pos.step()/2}\\n                y={-h/2}\\n                width={year2pos.step()}\\n                height={h}\\n              />\\n            </g>\\n\\n          {/each}\\n\\n        </g>\\n\\n      </g>\\n    </svg>\\n  </div>\\n\\n</div>\\n\\n\\n<style lang=\\"scss\\">.container {\\n  --fs-year-label: calc(var(--fs-label)*.9);\\n  display: grid;\\n  grid-auto-flow: row;\\n}\\n.container.on-light {\\n  --clr-line-back: var(--clr-black);\\n  --clr-line-front: var(--clr-black);\\n  --clr-fst-circle-fill: transparent;\\n  --clr-fst-circle-inner: var(--clr-black);\\n  --clr-sec-circle-fill: var(--clr-black);\\n  --clr-sec-circle-inner: var(--clr-white);\\n}\\n.container.on-dark {\\n  --clr-line-back: var(--clr-white);\\n  --clr-line-front: var(--clr-accent);\\n  --clr-fst-circle-fill: var(--clr-accent);\\n  --clr-fst-circle-inner: transparent;\\n  --clr-sec-circle-fill: var(--clr-white);\\n  --clr-sec-circle-inner: var(--clr-accent);\\n}\\n.container .labels {\\n  height: var(--fs-year-label);\\n  position: relative;\\n  font-weight: 600;\\n}\\n.container .labels .label {\\n  position: absolute;\\n  pointer-events: none;\\n  transform: translate(-50%, -10%);\\n}\\n.container .slider-container {\\n  height: calc(2 * var(--fs-label));\\n}\\n.container .slider-container .slider {\\n  width: 100%;\\n  height: 100%;\\n  overflow: visible;\\n}\\n.container .slider-container .slider__lines {\\n  stroke-width: 3px;\\n}\\n@media (min-width: 768px) {\\n  .container .slider-container .slider__lines {\\n    stroke-width: 1px;\\n  }\\n}\\n.container .slider-container .slider__lines .line-back {\\n  stroke: var(--clr-line-back);\\n  stroke-dasharray: 4;\\n}\\n@media (min-width: 768px) {\\n  .container .slider-container .slider__lines .line-back {\\n    stroke-dasharray: 1 3;\\n  }\\n}\\n.container .slider-container .slider__lines .line-front {\\n  stroke: var(--clr-line-front);\\n}\\n.container .slider-container .slider__handlers .handler .outer-circle {\\n  stroke-width: 1px;\\n}\\n@media (min-width: 768px) {\\n  .container .slider-container .slider__handlers .handler .outer-circle {\\n    stroke: var(--clr-black);\\n  }\\n}\\n.container .slider-container .slider__handlers .handler .inner-circle {\\n  opacity: 0;\\n}\\n.container .slider-container .slider__handlers .handler .hover-box {\\n  fill: transparent;\\n}\\n.container .slider-container .slider__handlers .handler:first-child .outer-circle {\\n  fill: var(--clr-fst-circle-fill);\\n}\\n.container .slider-container .slider__handlers .handler:first-child .inner-circle {\\n  fill: var(--clr-fst-circle-inner);\\n}\\n.container .slider-container .slider__handlers .handler:last-child .outer-circle {\\n  fill: var(--clr-sec-circle-fill);\\n}\\n.container .slider-container .slider__handlers .handler:last-child .inner-circle {\\n  fill: var(--clr-sec-circle-inner);\\n}\\n.container .slider-container .slider__handlers .handler:hover .outer-circle {\\n  fill: var(--clr-accent-hover) !important;\\n}\\n.container .slider-container .slider__handlers .handler:not(:hover) .inner-circle {\\n  opacity: 1;\\n}\\n.unclickable {\\n  pointer-events: none;\\n}</style>"],"names":[],"mappings":"AAoJmB,sCAAW,CAC5B,eAAe,CAAE,wBAAwB,CACzC,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAClB,CACA,UAAU,qCAAU,CAClB,eAAe,CAAE,gBAAgB,CACjC,gBAAgB,CAAE,gBAAgB,CAClC,qBAAqB,CAAE,WAAW,CAClC,sBAAsB,CAAE,gBAAgB,CACxC,qBAAqB,CAAE,gBAAgB,CACvC,sBAAsB,CAAE,gBAC1B,CACA,UAAU,oCAAS,CACjB,eAAe,CAAE,gBAAgB,CACjC,gBAAgB,CAAE,iBAAiB,CACnC,qBAAqB,CAAE,iBAAiB,CACxC,sBAAsB,CAAE,WAAW,CACnC,qBAAqB,CAAE,gBAAgB,CACvC,sBAAsB,CAAE,iBAC1B,CACA,wBAAU,CAAC,qBAAQ,CACjB,MAAM,CAAE,IAAI,eAAe,CAAC,CAC5B,QAAQ,CAAE,QAAQ,CAClB,WAAW,CAAE,GACf,CACA,wBAAU,CAAC,OAAO,CAAC,oBAAO,CACxB,QAAQ,CAAE,QAAQ,CAClB,cAAc,CAAE,IAAI,CACpB,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CACjC,CACA,wBAAU,CAAC,+BAAkB,CAC3B,MAAM,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAClC,CACA,wBAAU,CAAC,iBAAiB,CAAC,qBAAQ,CACnC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,QAAQ,CAAE,OACZ,CACA,wBAAU,CAAC,iBAAiB,CAAC,4BAAe,CAC1C,YAAY,CAAE,GAChB,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,wBAAU,CAAC,iBAAiB,CAAC,4BAAe,CAC1C,YAAY,CAAE,GAChB,CACF,CACA,wBAAU,CAAC,iBAAiB,CAAC,cAAc,CAAC,wBAAW,CACrD,MAAM,CAAE,IAAI,eAAe,CAAC,CAC5B,gBAAgB,CAAE,CACpB,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,wBAAU,CAAC,iBAAiB,CAAC,cAAc,CAAC,wBAAW,CACrD,gBAAgB,CAAE,CAAC,CAAC,CACtB,CACF,CACA,wBAAU,CAAC,iBAAiB,CAAC,cAAc,CAAC,yBAAY,CACtD,MAAM,CAAE,IAAI,gBAAgB,CAC9B,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,CAAC,2BAAc,CACpE,YAAY,CAAE,GAChB,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,CAAC,2BAAc,CACpE,MAAM,CAAE,IAAI,WAAW,CACzB,CACF,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,CAAC,2BAAc,CACpE,OAAO,CAAE,CACX,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,CAAC,wBAAW,CACjE,IAAI,CAAE,WACR,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,YAAY,CAAC,2BAAc,CAChF,IAAI,CAAE,IAAI,qBAAqB,CACjC,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,YAAY,CAAC,2BAAc,CAChF,IAAI,CAAE,IAAI,sBAAsB,CAClC,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,WAAW,CAAC,2BAAc,CAC/E,IAAI,CAAE,IAAI,qBAAqB,CACjC,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,WAAW,CAAC,2BAAc,CAC/E,IAAI,CAAE,IAAI,sBAAsB,CAClC,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,MAAM,CAAC,2BAAc,CAC1E,IAAI,CAAE,IAAI,kBAAkB,CAAC,CAAC,UAChC,CACA,wBAAU,CAAC,iBAAiB,CAAC,iBAAiB,CAAC,QAAQ,KAAK,MAAM,CAAC,CAAC,2BAAc,CAChF,OAAO,CAAE,CACX,CACA,wCAAa,CACX,cAAc,CAAE,IAClB"}`
};
const YearSliderPicker = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let rCircle;
  let innerW;
  let year2pos;
  let { min } = $$props;
  let { max } = $$props;
  let { step = 1 } = $$props;
  let { selected: selected2 = [min, max] } = $$props;
  let { disabled } = $$props;
  const drag = [min, max];
  const { theme } = getContext("item-theme");
  let svg;
  let w = 100;
  let h = 100;
  const pad = { left: 8, right: 8 };
  const years = d3.range(min, max + step, step);
  if ($$props.min === void 0 && $$bindings.min && min !== void 0) $$bindings.min(min);
  if ($$props.max === void 0 && $$bindings.max && max !== void 0) $$bindings.max(max);
  if ($$props.step === void 0 && $$bindings.step && step !== void 0) $$bindings.step(step);
  if ($$props.selected === void 0 && $$bindings.selected && selected2 !== void 0) $$bindings.selected(selected2);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  $$result.css.add(css$c);
  rCircle = h / 4;
  innerW = w - (pad.left + pad.right);
  year2pos = d3.scalePoint().domain(years).range([0, innerW]);
  d3.scaleQuantize().domain([0, innerW]).range(years);
  {
    {
      drag[0] = selected2[0];
      drag[1] = selected2[1];
    }
  }
  return `<div class="${"container " + escape(theme, true) + " svelte-u3fm5r"}"><ul class="labels svelte-u3fm5r">${each(drag, (year) => {
    let x = year2pos(year) + pad.left;
    return ` <p class="label text-xxs svelte-u3fm5r"${add_styles({ "left": `${x}px` })}>${escape(year)} </p>`;
  })}</ul>  <div class="slider-container svelte-u3fm5r"><svg class="slider svelte-u3fm5r"${add_attribute("this", svg, 0)}><g transform="${"translate(" + escape(pad.left, true) + ", " + escape(h / 2, true) + ")"}"><g class="slider__lines svelte-u3fm5r"><line class="line-back svelte-u3fm5r" x1="0"${add_attribute("x2", innerW, 0)}></line><line class="line-front svelte-u3fm5r"${add_attribute("x1", year2pos(drag[0]), 0)}${add_attribute("x2", year2pos(drag[1]), 0)}></line></g><g class="slider__handlers">${each(drag, (year, i) => {
    let x = year2pos(year), unclickable = i === 1 && drag[0] === max;
    return `   <g class="${["handler svelte-u3fm5r", unclickable ? "unclickable" : ""].join(" ").trim()}" transform="${"translate(" + escape(x, true) + ", 0)"}"${add_attribute("data-index", i, 0)}${add_styles({ "cursor": `pointer` })}><circle class="outer-circle svelte-u3fm5r"${add_attribute("r", rCircle, 0)}></circle><circle class="inner-circle svelte-u3fm5r"${add_attribute("r", rCircle / 4, 0)}></circle><rect class="hover-box svelte-u3fm5r"${add_attribute("x", -year2pos.step() / 2, 0)}${add_attribute("y", -h / 2, 0)}${add_attribute("width", year2pos.step(), 0)}${add_attribute("height", h, 0)}></rect></g>`;
  })}</g></g></svg></div> </div>`;
});
const InputPeriod = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  let $isSwitchingLayout, $$unsubscribe_isSwitchingLayout;
  let $fyears, $$unsubscribe_fyears;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_isSwitchingLayout = subscribe(isSwitchingLayout, (value) => $isSwitchingLayout = value);
  $$unsubscribe_fyears = subscribe(fyears, (value) => $fyears = value);
  let { theme = "on-light" } = $$props;
  setContext("item-theme", { theme });
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(PanelItem, "PanelItem").$$render(
      $$result,
      {
        icon: "period",
        title: $_("input.period")
      },
      {},
      {
        default: () => {
          return `${validate_component(YearSliderPicker, "YearSliderPicker").$$render(
            $$result,
            {
              disabled: $isSwitchingLayout,
              min: 2014,
              max: 2023,
              selected: $fyears
            },
            {
              selected: ($$value) => {
                $fyears = $$value;
                $$settled = false;
              }
            },
            {}
          )}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe__();
  $$unsubscribe_isSwitchingLayout();
  $$unsubscribe_fyears();
  return $$rendered;
});
const css$b = {
  code: '.container.svelte-1knrbk.svelte-1knrbk.svelte-1knrbk{display:grid;grid-auto-flow:row;gap:0}.container.on-dark.svelte-1knrbk .input-group__item .item__label input.svelte-1knrbk:checked+span.svelte-1knrbk{font-weight:700;color:var(--clr-accent)}.container.svelte-1knrbk .input-group.svelte-1knrbk.svelte-1knrbk{display:grid;grid-auto-flow:column;grid-template-rows:repeat(var(--items-by-column), auto);grid-template-columns:repeat(var(--n-columns), 1fr);align-items:start;-moz-column-gap:0.8rem;column-gap:0.8rem;row-gap:0.4rem;columns:var(--n-columns);-webkit-columns:var(--n-columns);-moz-columns:var(--n-columns)}.container.svelte-1knrbk .input-group__item .item.svelte-1knrbk.svelte-1knrbk{text-transform:lowercase;display:grid;grid-template-columns:min-content 1fr;grid-template-areas:"check label";align-items:center;-moz-column-gap:0.4rem;column-gap:0.4rem}.container.svelte-1knrbk .input-group__item .item__check.svelte-1knrbk.svelte-1knrbk{grid-area:check}.container.svelte-1knrbk .input-group__item .item__label.svelte-1knrbk.svelte-1knrbk{grid-area:label}.container.svelte-1knrbk .input-group__item .item__check.svelte-1knrbk.svelte-1knrbk{display:flex;justify-content:center;align-items:center}.container.svelte-1knrbk .input-group__item.active .item__label.svelte-1knrbk.svelte-1knrbk{font-weight:500}input.svelte-1knrbk.svelte-1knrbk.svelte-1knrbk{display:none}',
  map: `{"version":3,"file":"InputGroupGoal.svelte","sources":["InputGroupGoal.svelte"],"sourcesContent":["<script>\\n  import { getContext } from 'svelte';\\n  import { _ } from 'svelte-i18n'\\n\\n  // Actions\\n  import { hoveredFilter } from '$lib/stores/canvas.js';\\n\\n  // DOM Components\\n  import Button from \\"$lib/components/dom/atoms/Button.svelte\\";\\n\\timport CheckIcon from '$lib/components/dom/atoms/CheckIcon.svelte';\\n  import ClearFilterButton from '$lib/components/dom/molecules/ClearFilterButton.svelte';\\n  \\n  export let categories\\n  export let selected = []\\n  export let disabled = false\\n  export let nColumns = 1\\n\\n  // +1 for unselect btn\\n  $: itemsByColumn = Math.ceil((categories.length + 1)/nColumns)\\n\\n  const { theme } = getContext(\\"item-theme\\")\\n\\n<\/script>\\n\\n<div class=\\"container {theme}\\">\\n\\n  <ul class=\\"input-group\\" \\n    style:--n-columns={nColumns}\\n    style:--items-by-column={itemsByColumn} \\n  >\\n    {#each categories as { id, data }}\\n    {@const active = selected.includes(id)}\\n\\n      <li class=\\"input-group__item\\" class:active={active}>\\n\\n        <label class=\\"item text-xxs\\"\\n          on:mouseenter={() => hoveredFilter.set(id)}\\n          on:mouseleave={() => hoveredFilter.set()}\\n        >\\n\\n          <div class=\\"item__check\\">\\n            <CheckIcon \\n              active={active} \\n              hoveredFilter={$hoveredFilter === id} \\n              backgroundColor={data.color}\\n            />\\n          </div>\\n\\n          <div class=\\"item__label\\">\\n            <input type=\\"checkbox\\" value={id} {disabled} bind:group={selected}/>\\n            <span>{$_(\\"category.\\" + id)}</span>\\n          </div>\\n\\n        </label>\\n\\n      </li>\\n\\n    {/each}\\n\\n    <li class=\\"input-group__unselect-btn\\">\\n      <ClearFilterButton \\n        onClick={() => selected = []} \\n        disabled={selected.length === 0} \\n      />\\n    </li>\\n  </ul>\\n\\n</div>\\n\\n<style lang=\\"scss\\">.container {\\n  display: grid;\\n  grid-auto-flow: row;\\n  gap: 0;\\n}\\n.container.on-dark .input-group__item .item__label input:checked + span {\\n  font-weight: 700;\\n  color: var(--clr-accent);\\n}\\n.container .input-group {\\n  display: grid;\\n  grid-auto-flow: column;\\n  grid-template-rows: repeat(var(--items-by-column), auto);\\n  grid-template-columns: repeat(var(--n-columns), 1fr);\\n  align-items: start;\\n  -moz-column-gap: 0.8rem;\\n       column-gap: 0.8rem;\\n  row-gap: 0.4rem;\\n  columns: var(--n-columns);\\n  -webkit-columns: var(--n-columns);\\n  -moz-columns: var(--n-columns);\\n}\\n.container .input-group__item .item {\\n  text-transform: lowercase;\\n  display: grid;\\n  grid-template-columns: min-content 1fr;\\n  grid-template-areas: \\"check label\\";\\n  align-items: center;\\n  -moz-column-gap: 0.4rem;\\n       column-gap: 0.4rem;\\n}\\n.container .input-group__item .item__check {\\n  grid-area: check;\\n}\\n.container .input-group__item .item__label {\\n  grid-area: label;\\n}\\n.container .input-group__item .item__check {\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n}\\n.container .input-group__item.active .item__label {\\n  font-weight: 500;\\n}\\n\\ninput {\\n  display: none;\\n}</style>"],"names":[],"mappings":"AAqEmB,oDAAW,CAC5B,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,GAAG,CAAE,CACP,CACA,UAAU,sBAAQ,CAAC,kBAAkB,CAAC,YAAY,CAAC,mBAAK,QAAQ,CAAG,kBAAK,CACtE,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,YAAY,CACzB,CACA,wBAAU,CAAC,wCAAa,CACtB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,kBAAkB,CAAE,OAAO,IAAI,iBAAiB,CAAC,CAAC,CAAC,IAAI,CAAC,CACxD,qBAAqB,CAAE,OAAO,IAAI,WAAW,CAAC,CAAC,CAAC,GAAG,CAAC,CACpD,WAAW,CAAE,KAAK,CAClB,eAAe,CAAE,MAAM,CAClB,UAAU,CAAE,MAAM,CACvB,OAAO,CAAE,MAAM,CACf,OAAO,CAAE,IAAI,WAAW,CAAC,CACzB,eAAe,CAAE,IAAI,WAAW,CAAC,CACjC,YAAY,CAAE,IAAI,WAAW,CAC/B,CACA,wBAAU,CAAC,kBAAkB,CAAC,iCAAM,CAClC,cAAc,CAAE,SAAS,CACzB,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,WAAW,CAAC,GAAG,CACtC,mBAAmB,CAAE,aAAa,CAClC,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CAClB,UAAU,CAAE,MACnB,CACA,wBAAU,CAAC,kBAAkB,CAAC,wCAAa,CACzC,SAAS,CAAE,KACb,CACA,wBAAU,CAAC,kBAAkB,CAAC,wCAAa,CACzC,SAAS,CAAE,KACb,CACA,wBAAU,CAAC,kBAAkB,CAAC,wCAAa,CACzC,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MACf,CACA,wBAAU,CAAC,kBAAkB,OAAO,CAAC,wCAAa,CAChD,WAAW,CAAE,GACf,CAEA,+CAAM,CACJ,OAAO,CAAE,IACX"}`
};
const InputGroupGoal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let itemsByColumn;
  let $hoveredFilter, $$unsubscribe_hoveredFilter;
  let $_, $$unsubscribe__;
  $$unsubscribe_hoveredFilter = subscribe(hoveredFilter, (value) => $hoveredFilter = value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  let { categories: categories2 } = $$props;
  let { selected: selected2 = [] } = $$props;
  let { disabled = false } = $$props;
  let { nColumns = 1 } = $$props;
  const { theme } = getContext("item-theme");
  if ($$props.categories === void 0 && $$bindings.categories && categories2 !== void 0) $$bindings.categories(categories2);
  if ($$props.selected === void 0 && $$bindings.selected && selected2 !== void 0) $$bindings.selected(selected2);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.nColumns === void 0 && $$bindings.nColumns && nColumns !== void 0) $$bindings.nColumns(nColumns);
  $$result.css.add(css$b);
  itemsByColumn = Math.ceil((categories2.length + 1) / nColumns);
  $$unsubscribe_hoveredFilter();
  $$unsubscribe__();
  return `<div class="${"container " + escape(theme, true) + " svelte-1knrbk"}"><ul class="input-group svelte-1knrbk"${add_styles({
    "--n-columns": nColumns,
    "--items-by-column": itemsByColumn
  })}>${each(categories2, ({ id, data }) => {
    let active = selected2.includes(id);
    return ` <li class="${["input-group__item", active ? "active" : ""].join(" ").trim()}"><label class="item text-xxs svelte-1knrbk"><div class="item__check svelte-1knrbk">${validate_component(CheckIcon, "CheckIcon").$$render(
      $$result,
      {
        active,
        hoveredFilter: $hoveredFilter === id,
        backgroundColor: data.color
      },
      {},
      {}
    )}</div> <div class="item__label svelte-1knrbk"><input type="checkbox"${add_attribute("value", id, 0)} ${disabled ? "disabled" : ""} class="svelte-1knrbk"${~selected2.indexOf(id) ? add_attribute("checked", true, 1) : ""}> <span class="svelte-1knrbk">${escape($_("category." + id))}</span> </div></label> </li>`;
  })} <li class="input-group__unselect-btn">${validate_component(ClearFilterButton, "ClearFilterButton").$$render(
    $$result,
    {
      onClick: () => selected2 = [],
      disabled: selected2.length === 0
    },
    {},
    {}
  )}</li></ul> </div>`;
});
const InputGoal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  let $categoriesEnriched, $$unsubscribe_categoriesEnriched;
  let $isSwitchingLayout, $$unsubscribe_isSwitchingLayout;
  let $fgoals, $$unsubscribe_fgoals;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_categoriesEnriched = subscribe(categoriesEnriched, (value) => $categoriesEnriched = value);
  $$unsubscribe_isSwitchingLayout = subscribe(isSwitchingLayout, (value) => $isSwitchingLayout = value);
  $$unsubscribe_fgoals = subscribe(fgoals, (value) => $fgoals = value);
  let { nColumns = 1 } = $$props;
  let { theme = "on-light" } = $$props;
  setContext("item-theme", { theme });
  if ($$props.nColumns === void 0 && $$bindings.nColumns && nColumns !== void 0) $$bindings.nColumns(nColumns);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(PanelItem, "PanelItem").$$render($$result, { icon: "goals", title: $_("input.goal") }, {}, {
      default: () => {
        return `${validate_component(InputGroupGoal, "InputGroupGoal").$$render(
          $$result,
          {
            categories: $categoriesEnriched.filter((d) => d.type === "goal"),
            disabled: $isSwitchingLayout,
            nColumns,
            selected: $fgoals
          },
          {
            selected: ($$value) => {
              $fgoals = $$value;
              $$settled = false;
            }
          },
          {}
        )}`;
      }
    })}`;
  } while (!$$settled);
  $$unsubscribe__();
  $$unsubscribe_categoriesEnriched();
  $$unsubscribe_isSwitchingLayout();
  $$unsubscribe_fgoals();
  return $$rendered;
});
const Graphics = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { context } = $$props;
  let { drawFunc = void 0 } = $$props;
  let { alpha = 1 } = $$props;
  let { blendmode = "NORMAL" } = $$props;
  const graphics = new PIXI.Graphics();
  graphics.alpha = alpha;
  graphics.blendMode = PIXI.BLEND_MODES[blendmode];
  if (drawFunc) {
    drawFunc(graphics);
  }
  context.addChild(graphics);
  setContext("graphics", graphics);
  if ($$props.context === void 0 && $$bindings.context && context !== void 0) $$bindings.context(context);
  if ($$props.drawFunc === void 0 && $$bindings.drawFunc && drawFunc !== void 0) $$bindings.drawFunc(drawFunc);
  if ($$props.alpha === void 0 && $$bindings.alpha && alpha !== void 0) $$bindings.alpha(alpha);
  if ($$props.blendmode === void 0 && $$bindings.blendmode && blendmode !== void 0) $$bindings.blendmode(blendmode);
  return `${slots.default ? slots.default({}) : ``}`;
});
const Bubble = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $app, $$unsubscribe_app;
  $$unsubscribe_app = subscribe(app, (value) => $app = value);
  let { i } = $$props;
  let { r } = $$props;
  const graphics = getContext("graphics");
  const bubble = { r };
  const tweenOptions = {
    duration: 1,
    delay: i * 0.05,
    ease: d3.easeCubicInOut
  };
  function ticked() {
    graphics.clear();
    graphics.beginFill(14475006);
    graphics.drawCircle(0, 0, bubble.r);
    graphics.endFill();
  }
  const ticker = $app.ticker.add(ticked);
  onDestroy(() => {
    ticker.remove(ticked);
  });
  if ($$props.i === void 0 && $$bindings.i && i !== void 0) $$bindings.i(i);
  if ($$props.r === void 0 && $$bindings.r && r !== void 0) $$bindings.r(r);
  {
    gsap.to(bubble, { r, ...tweenOptions });
  }
  $$unsubscribe_app();
  return ``;
});
const css$a = {
  code: '.container.on-dark.svelte-1wcac7d .input-group__item .item__label input.svelte-1wcac7d:checked+p.svelte-1wcac7d{font-weight:700;color:var(--clr-accent)}.container.svelte-1wcac7d .input-group.svelte-1wcac7d.svelte-1wcac7d{display:grid;grid-template-rows:repeat(var(--items-by-column), min-content);grid-template-columns:repeat(var(--n-columns), 1fr);align-items:start;-moz-column-gap:0.8rem;column-gap:0.8rem;row-gap:0.4rem}.container.svelte-1wcac7d .input-group__item .item.svelte-1wcac7d.svelte-1wcac7d{text-transform:lowercase;display:grid;grid-template-columns:min-content 1fr;grid-template-rows:auto;grid-template-areas:"check label";align-items:center;-moz-column-gap:0.4rem;column-gap:0.4rem}.container.svelte-1wcac7d .input-group__item .item__check.svelte-1wcac7d.svelte-1wcac7d{grid-area:check}.container.svelte-1wcac7d .input-group__item .item__label.svelte-1wcac7d.svelte-1wcac7d{grid-area:label}.container.svelte-1wcac7d .input-group__item .item__bubble.svelte-1wcac7d.svelte-1wcac7d{grid-area:bubble}.container.svelte-1wcac7d .input-group__item .item__check.svelte-1wcac7d.svelte-1wcac7d{display:flex;justify-content:center;align-items:center}.container.svelte-1wcac7d .input-group__item .item__bubble.svelte-1wcac7d.svelte-1wcac7d{height:100%}.container.svelte-1wcac7d .input-group__item.active .item__label.svelte-1wcac7d.svelte-1wcac7d{font-weight:500}.container.bubble.svelte-1wcac7d .input-group.svelte-1wcac7d.svelte-1wcac7d{grid-auto-flow:column;grid-template-rows:max-content;grid-template-columns:none;grid-auto-columns:calc(5.6 * var(--fs-label));-moz-column-gap:calc(0.8 * var(--fs-label));column-gap:calc(0.8 * var(--fs-label))}@media(min-width: 1024px){.container.bubble.svelte-1wcac7d .input-group.svelte-1wcac7d.svelte-1wcac7d{grid-auto-columns:calc(8.6 * var(--fs-label))}}.container.bubble.svelte-1wcac7d .input-group__item .item.svelte-1wcac7d.svelte-1wcac7d{grid-template-columns:100%;grid-template-rows:0 calc(4.2 * var(--fs-label)) auto;grid-template-areas:"check" "bubble" "label"}.container.bubble.svelte-1wcac7d .input-group__item .item__label p.svelte-1wcac7d.svelte-1wcac7d{text-align:center}@media(min-width: 768px){.container.bubble.svelte-1wcac7d .input-group__item .item__label p.svelte-1wcac7d.svelte-1wcac7d{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}}@media(min-width: 1024px){.container.bubble.svelte-1wcac7d .input-group__item .item__label p.svelte-1wcac7d.svelte-1wcac7d{white-space:inherit;overflow:visible;text-overflow:none}}.container.bubble.svelte-1wcac7d .input-group__unselect-btn.svelte-1wcac7d.svelte-1wcac7d{padding-top:calc(4.2 * var(--fs-label))}input.svelte-1wcac7d.svelte-1wcac7d.svelte-1wcac7d{display:none}',
  map: `{"version":3,"file":"InputGroupProduct.svelte","sources":["InputGroupProduct.svelte"],"sourcesContent":["<script>\\n  import { getContext } from 'svelte';\\n  import { _ } from 'svelte-i18n'\\n\\n  // Libraries\\n  import * as PIXI from \\"pixi.js\\"\\n\\n  // Actions\\n  import castContainer from \\"$lib/actions/castContainer\\";\\n\\n  // Stores\\n  import { hoveredFilter } from '$lib/stores/canvas.js';\\n  import { nodeSize } from '$lib/stores/nodes.js';\\n\\n  // DOM Components\\n\\timport CheckIcon from '$lib/components/dom/atoms/CheckIcon.svelte';\\n  import ClearFilterButton from '$lib/components/dom/molecules/ClearFilterButton.svelte';\\n\\n  // WebGL Components\\n  import Graphics from '$lib/components/webgl/atoms/Graphics.svelte';\\n  import Bubble from '$lib/components/webgl/atoms/Bubble.svelte';\\n  \\n  // Templates\\n  import templates from \\"$lib/templates\\"\\n\\n  const { theme } = getContext(\\"item-theme\\")\\n\\n  export let categories\\n  export let selected = []\\n  export let disabled = false\\n  export let nColumns = 1\\n\\n  export let parent = undefined\\n\\n  // +1 for unselect btn\\n  $: itemsByColumn = Math.ceil((categories.length + 1)/nColumns)\\n  \\n<\/script>\\n\\n<div \\n  class=\\"container {theme}\\"\\n  class:bubble={!!parent}\\n>\\n\\n  <ul class=\\"input-group\\" \\n    style:--n-columns={nColumns}\\n    style:--items-by-column={itemsByColumn}\\n  >\\n    {#each categories as { id, nNodes }, i}\\n    {@const active = selected.includes(id)}\\n\\n      <li class=\\"input-group__item\\" \\n        class:active={active}\\n      >\\n\\n        <label class=\\"item\\"\\n          on:mouseenter={() => hoveredFilter.set(id)}\\n          on:mouseleave={() => hoveredFilter.set()}\\n        >\\n\\n          <div class=\\"item__check\\">\\n            <CheckIcon \\n              onDark={theme === \\"on-dark\\"}\\n              active={active} \\n              hoveredFilter={$hoveredFilter === id} \\n            />\\n          </div>\\n\\n          {#if parent !== undefined}\\n            {@const context = new PIXI.Container()}\\n            {@const r = (nNodes/(3*20)*$nodeSize)}\\n            <div class=\\"item__bubble\\"\\n              use:castContainer={{ parent, context }}\\n            >\\n\\n              <Graphics context={context} blendmode=\\"MULTIPLY\\" alpha=.9>\\n                <Bubble {i} {r} />\\n              </Graphics>\\n\\n              <Graphics context={context} drawFunc={templates[id]} />\\n\\n            </div>\\n          {/if}\\n\\n          <div class=\\"item__label\\">\\n            <input type=\\"checkbox\\" value={id} {disabled} bind:group={selected}/>\\n            <p class=\\"text-xxs\\">{$_(\\"category.\\" + id)}</p>\\n          </div>\\n\\n        </label>\\n\\n      </li>\\n\\n    {/each}\\n\\n    <li class=\\"input-group__unselect-btn\\">\\n      <ClearFilterButton \\n        onClick={() => selected = []} \\n        disabled={selected.length === 0} \\n      />\\n    </li>\\n  </ul>\\n\\n</div>\\n\\n<style lang=\\"scss\\">.container.on-dark .input-group__item .item__label input:checked + p {\\n  font-weight: 700;\\n  color: var(--clr-accent);\\n}\\n.container .input-group {\\n  display: grid;\\n  grid-template-rows: repeat(var(--items-by-column), min-content);\\n  grid-template-columns: repeat(var(--n-columns), 1fr);\\n  align-items: start;\\n  -moz-column-gap: 0.8rem;\\n       column-gap: 0.8rem;\\n  row-gap: 0.4rem;\\n}\\n.container .input-group__item .item {\\n  text-transform: lowercase;\\n  display: grid;\\n  grid-template-columns: min-content 1fr;\\n  grid-template-rows: auto;\\n  grid-template-areas: \\"check label\\";\\n  align-items: center;\\n  -moz-column-gap: 0.4rem;\\n       column-gap: 0.4rem;\\n}\\n.container .input-group__item .item__check {\\n  grid-area: check;\\n}\\n.container .input-group__item .item__label {\\n  grid-area: label;\\n}\\n.container .input-group__item .item__bubble {\\n  grid-area: bubble;\\n}\\n.container .input-group__item .item__check {\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n}\\n.container .input-group__item .item__bubble {\\n  height: 100%;\\n}\\n.container .input-group__item.active .item__label {\\n  font-weight: 500;\\n}\\n.container.bubble .input-group {\\n  grid-auto-flow: column;\\n  grid-template-rows: max-content;\\n  grid-template-columns: none;\\n  grid-auto-columns: calc(5.6 * var(--fs-label));\\n  -moz-column-gap: calc(0.8 * var(--fs-label));\\n       column-gap: calc(0.8 * var(--fs-label));\\n}\\n@media (min-width: 1024px) {\\n  .container.bubble .input-group {\\n    grid-auto-columns: calc(8.6 * var(--fs-label));\\n  }\\n}\\n.container.bubble .input-group__item .item {\\n  grid-template-columns: 100%;\\n  grid-template-rows: 0 calc(4.2 * var(--fs-label)) auto;\\n  grid-template-areas: \\"check\\" \\"bubble\\" \\"label\\";\\n}\\n.container.bubble .input-group__item .item__label p {\\n  text-align: center;\\n}\\n@media (min-width: 768px) {\\n  .container.bubble .input-group__item .item__label p {\\n    white-space: nowrap; /* Prevents text from wrapping to a new line */\\n    overflow: hidden; /* Hides the overflow text */\\n    text-overflow: ellipsis; /* Adds the ellipsis (...) */\\n  }\\n}\\n@media (min-width: 1024px) {\\n  .container.bubble .input-group__item .item__label p {\\n    white-space: inherit;\\n    overflow: visible;\\n    text-overflow: none;\\n  }\\n}\\n.container.bubble .input-group__unselect-btn {\\n  padding-top: calc(4.2 * var(--fs-label));\\n}\\ninput {\\n  display: none;\\n}</style>"],"names":[],"mappings":"AAyGmB,UAAU,uBAAQ,CAAC,kBAAkB,CAAC,YAAY,CAAC,oBAAK,QAAQ,CAAG,gBAAE,CACtF,WAAW,CAAE,GAAG,CAChB,KAAK,CAAE,IAAI,YAAY,CACzB,CACA,yBAAU,CAAC,0CAAa,CACtB,OAAO,CAAE,IAAI,CACb,kBAAkB,CAAE,OAAO,IAAI,iBAAiB,CAAC,CAAC,CAAC,WAAW,CAAC,CAC/D,qBAAqB,CAAE,OAAO,IAAI,WAAW,CAAC,CAAC,CAAC,GAAG,CAAC,CACpD,WAAW,CAAE,KAAK,CAClB,eAAe,CAAE,MAAM,CAClB,UAAU,CAAE,MAAM,CACvB,OAAO,CAAE,MACX,CACA,yBAAU,CAAC,kBAAkB,CAAC,mCAAM,CAClC,cAAc,CAAE,SAAS,CACzB,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,WAAW,CAAC,GAAG,CACtC,kBAAkB,CAAE,IAAI,CACxB,mBAAmB,CAAE,aAAa,CAClC,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MAAM,CAClB,UAAU,CAAE,MACnB,CACA,yBAAU,CAAC,kBAAkB,CAAC,0CAAa,CACzC,SAAS,CAAE,KACb,CACA,yBAAU,CAAC,kBAAkB,CAAC,0CAAa,CACzC,SAAS,CAAE,KACb,CACA,yBAAU,CAAC,kBAAkB,CAAC,2CAAc,CAC1C,SAAS,CAAE,MACb,CACA,yBAAU,CAAC,kBAAkB,CAAC,0CAAa,CACzC,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MACf,CACA,yBAAU,CAAC,kBAAkB,CAAC,2CAAc,CAC1C,MAAM,CAAE,IACV,CACA,yBAAU,CAAC,kBAAkB,OAAO,CAAC,0CAAa,CAChD,WAAW,CAAE,GACf,CACA,UAAU,sBAAO,CAAC,0CAAa,CAC7B,cAAc,CAAE,MAAM,CACtB,kBAAkB,CAAE,WAAW,CAC/B,qBAAqB,CAAE,IAAI,CAC3B,iBAAiB,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAC9C,eAAe,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CACvC,UAAU,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAC7C,CACA,MAAO,YAAY,MAAM,CAAE,CACzB,UAAU,sBAAO,CAAC,0CAAa,CAC7B,iBAAiB,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAC/C,CACF,CACA,UAAU,sBAAO,CAAC,kBAAkB,CAAC,mCAAM,CACzC,qBAAqB,CAAE,IAAI,CAC3B,kBAAkB,CAAE,CAAC,CAAC,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAAC,IAAI,CACtD,mBAAmB,CAAE,OAAO,CAAC,QAAQ,CAAC,OACxC,CACA,UAAU,sBAAO,CAAC,kBAAkB,CAAC,YAAY,CAAC,+BAAE,CAClD,UAAU,CAAE,MACd,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,UAAU,sBAAO,CAAC,kBAAkB,CAAC,YAAY,CAAC,+BAAE,CAClD,WAAW,CAAE,MAAM,CACnB,QAAQ,CAAE,MAAM,CAChB,aAAa,CAAE,QACjB,CACF,CACA,MAAO,YAAY,MAAM,CAAE,CACzB,UAAU,sBAAO,CAAC,kBAAkB,CAAC,YAAY,CAAC,+BAAE,CAClD,WAAW,CAAE,OAAO,CACpB,QAAQ,CAAE,OAAO,CACjB,aAAa,CAAE,IACjB,CACF,CACA,UAAU,sBAAO,CAAC,wDAA2B,CAC3C,WAAW,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CACzC,CACA,kDAAM,CACJ,OAAO,CAAE,IACX"}`
};
const InputGroupProduct = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let itemsByColumn;
  let $hoveredFilter, $$unsubscribe_hoveredFilter;
  let $nodeSize, $$unsubscribe_nodeSize;
  let $_, $$unsubscribe__;
  $$unsubscribe_hoveredFilter = subscribe(hoveredFilter, (value) => $hoveredFilter = value);
  $$unsubscribe_nodeSize = subscribe(nodeSize, (value) => $nodeSize = value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  const { theme } = getContext("item-theme");
  let { categories: categories2 } = $$props;
  let { selected: selected2 = [] } = $$props;
  let { disabled = false } = $$props;
  let { nColumns = 1 } = $$props;
  let { parent = void 0 } = $$props;
  if ($$props.categories === void 0 && $$bindings.categories && categories2 !== void 0) $$bindings.categories(categories2);
  if ($$props.selected === void 0 && $$bindings.selected && selected2 !== void 0) $$bindings.selected(selected2);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  if ($$props.nColumns === void 0 && $$bindings.nColumns && nColumns !== void 0) $$bindings.nColumns(nColumns);
  if ($$props.parent === void 0 && $$bindings.parent && parent !== void 0) $$bindings.parent(parent);
  $$result.css.add(css$a);
  itemsByColumn = Math.ceil((categories2.length + 1) / nColumns);
  $$unsubscribe_hoveredFilter();
  $$unsubscribe_nodeSize();
  $$unsubscribe__();
  return `<div class="${[
    "container " + escape(theme, true) + " svelte-1wcac7d",
    !!parent ? "bubble" : ""
  ].join(" ").trim()}"><ul class="input-group svelte-1wcac7d"${add_styles({
    "--n-columns": nColumns,
    "--items-by-column": itemsByColumn
  })}>${each(categories2, ({ id, nNodes }, i) => {
    let active = selected2.includes(id);
    return ` <li class="${["input-group__item", active ? "active" : ""].join(" ").trim()}"><label class="item svelte-1wcac7d"><div class="item__check svelte-1wcac7d">${validate_component(CheckIcon, "CheckIcon").$$render(
      $$result,
      {
        onDark: theme === "on-dark",
        active,
        hoveredFilter: $hoveredFilter === id
      },
      {},
      {}
    )}</div> ${parent !== void 0 ? (() => {
      let context = new PIXI.Container(), r = nNodes / (3 * 20) * $nodeSize;
      return `  <div class="item__bubble svelte-1wcac7d">${validate_component(Graphics, "Graphics").$$render(
        $$result,
        {
          context,
          blendmode: "MULTIPLY",
          alpha: ".9"
        },
        {},
        {
          default: () => {
            return `${validate_component(Bubble, "Bubble").$$render($$result, { i, r }, {}, {})} `;
          }
        }
      )} ${validate_component(Graphics, "Graphics").$$render($$result, { context, drawFunc: templates[id] }, {}, {})} </div>`;
    })() : ``} <div class="item__label svelte-1wcac7d"><input type="checkbox"${add_attribute("value", id, 0)} ${disabled ? "disabled" : ""} class="svelte-1wcac7d"${~selected2.indexOf(id) ? add_attribute("checked", true, 1) : ""}> <p class="text-xxs svelte-1wcac7d">${escape($_("category." + id))}</p> </div></label> </li>`;
  })} <li class="input-group__unselect-btn svelte-1wcac7d">${validate_component(ClearFilterButton, "ClearFilterButton").$$render(
    $$result,
    {
      onClick: () => selected2 = [],
      disabled: selected2.length === 0
    },
    {},
    {}
  )}</li></ul> </div>`;
});
const InputProduct = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  let $categoriesEnriched, $$unsubscribe_categoriesEnriched;
  let $isSwitchingLayout, $$unsubscribe_isSwitchingLayout;
  let $fproducts, $$unsubscribe_fproducts;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_categoriesEnriched = subscribe(categoriesEnriched, (value) => $categoriesEnriched = value);
  $$unsubscribe_isSwitchingLayout = subscribe(isSwitchingLayout, (value) => $isSwitchingLayout = value);
  $$unsubscribe_fproducts = subscribe(fproducts, (value) => $fproducts = value);
  let { parent = void 0 } = $$props;
  let { nColumns = 1 } = $$props;
  let { theme = "on-light" } = $$props;
  setContext("item-theme", { theme });
  if ($$props.parent === void 0 && $$bindings.parent && parent !== void 0) $$bindings.parent(parent);
  if ($$props.nColumns === void 0 && $$bindings.nColumns && nColumns !== void 0) $$bindings.nColumns(nColumns);
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(PanelItem, "PanelItem").$$render(
      $$result,
      {
        icon: "products",
        title: $_("input.product")
      },
      {},
      {
        default: () => {
          return `${validate_component(InputGroupProduct, "InputGroupProduct").$$render(
            $$result,
            {
              parent,
              categories: $categoriesEnriched.filter((d) => d.type === "product"),
              disabled: $isSwitchingLayout,
              nColumns,
              selected: $fproducts
            },
            {
              selected: ($$value) => {
                $fproducts = $$value;
                $$settled = false;
              }
            },
            {}
          )}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe__();
  $$unsubscribe_categoriesEnriched();
  $$unsubscribe_isSwitchingLayout();
  $$unsubscribe_fproducts();
  return $$rendered;
});
const BeeswarmAlt = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe__;
  let $$unsubscribe_locale;
  let $$unsubscribe_categoriesEnriched;
  let $lineWidth, $$unsubscribe_lineWidth;
  let $$unsubscribe_width;
  let $nodeSize, $$unsubscribe_nodeSize;
  $$unsubscribe__ = subscribe($format, (value) => value);
  $$unsubscribe_locale = subscribe($locale, (value) => value);
  $$unsubscribe_categoriesEnriched = subscribe(categoriesEnriched, (value) => value);
  $$unsubscribe_lineWidth = subscribe(lineWidth, (value) => $lineWidth = value);
  $$unsubscribe_width = subscribe(width, (value) => value);
  $$unsubscribe_nodeSize = subscribe(nodeSize, (value) => $nodeSize = value);
  let { selected: selected2 = [] } = $$props;
  let { disabled } = $$props;
  let svg;
  textures.circles().size($nodeSize / 2).radius($lineWidth).complement().fill("#818afa");
  const forceCollide = d3.forceCollide().strength(0.9);
  d3.forceSimulation().force("charge", d3.forceManyBody().strength(10)).force("center", d3.forceCenter().x(0).y(0).strength(0.5)).force("collide", forceCollide).on("tick", tick);
  function tick() {
    return;
  }
  if ($$props.selected === void 0 && $$bindings.selected && selected2 !== void 0) $$bindings.selected(selected2);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  $$unsubscribe__();
  $$unsubscribe_locale();
  $$unsubscribe_categoriesEnriched();
  $$unsubscribe_lineWidth();
  $$unsubscribe_width();
  $$unsubscribe_nodeSize();
  return `<div class="h-80 md:h-64 grid grid-rows-[1fr_min-content]"><div class="w-full h-full"><svg class="w-full h-full overflow-visible relative"${add_attribute("this", svg, 0)}><defs><filter x="0" y="0" width="1" height="1" id="text-bg"><feFlood flood-color="var(--clr-accent-low)" result="bg"></feFlood><feMerge><feMergeNode in="bg"></feMergeNode><feMergeNode in="SourceGraphic"></feMergeNode></feMerge></filter></defs><g class="chart" transform="${"translate(" + escape(0, true) + ", " + escape(0, true) + ")"}"></g></svg></div> ${validate_component(ClearFilterButton, "ClearFilterButton").$$render(
    $$result,
    {
      onClick: () => selected2 = [],
      disabled: selected2.length === 0
    },
    {},
    {}
  )} </div>`;
});
const InputIndustry = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $_, $$unsubscribe__;
  let $isSwitchingLayout, $$unsubscribe_isSwitchingLayout;
  let $findustries, $$unsubscribe_findustries;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_isSwitchingLayout = subscribe(isSwitchingLayout, (value) => $isSwitchingLayout = value);
  $$unsubscribe_findustries = subscribe(findustries, (value) => $findustries = value);
  let { theme = "on-light" } = $$props;
  setContext("item-theme", { theme });
  if ($$props.theme === void 0 && $$bindings.theme && theme !== void 0) $$bindings.theme(theme);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `${validate_component(PanelItem, "PanelItem").$$render(
      $$result,
      {
        icon: "industries",
        title: $_("input.industry")
      },
      {},
      {
        default: () => {
          return `${validate_component(BeeswarmAlt, "Beeswarm").$$render(
            $$result,
            {
              disabled: $isSwitchingLayout,
              selected: $findustries
            },
            {
              selected: ($$value) => {
                $findustries = $$value;
                $$settled = false;
              }
            },
            {}
          )}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe__();
  $$unsubscribe_isSwitchingLayout();
  $$unsubscribe_findustries();
  return $$rendered;
});
const ClearAllFilterButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let disabled;
  let $fyears, $$unsubscribe_fyears;
  let $fproducts, $$unsubscribe_fproducts;
  let $findustries, $$unsubscribe_findustries;
  let $fgoals, $$unsubscribe_fgoals;
  let $fdesigns, $$unsubscribe_fdesigns;
  let $_, $$unsubscribe__;
  $$unsubscribe_fyears = subscribe(fyears, (value) => $fyears = value);
  $$unsubscribe_fproducts = subscribe(fproducts, (value) => $fproducts = value);
  $$unsubscribe_findustries = subscribe(findustries, (value) => $findustries = value);
  $$unsubscribe_fgoals = subscribe(fgoals, (value) => $fgoals = value);
  $$unsubscribe_fdesigns = subscribe(fdesigns, (value) => $fdesigns = value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  function clearFilters() {
    fyears.set([2014, 2023]);
    fdesigns.set([]);
    fgoals.set([]);
    findustries.set([]);
    fproducts.set([]);
  }
  disabled = $fdesigns.length + $fgoals.length + $findustries.length + $fproducts.length === 0 && (!$fyears || $fyears.length === 2 && $fyears[0] === 2014 && $fyears[1] === 2023);
  $$unsubscribe_fyears();
  $$unsubscribe_fproducts();
  $$unsubscribe_findustries();
  $$unsubscribe_fgoals();
  $$unsubscribe_fdesigns();
  $$unsubscribe__();
  return `${validate_component(ClearFilterButton, "ClearFilterButton").$$render(
    $$result,
    {
      uppercase: true,
      onClick: clearFilters,
      disabled
    },
    {},
    {
      default: () => {
        return `X <span class="font-inherit underline">${escape($_("menu.unselect-all"))}</span>`;
      }
    }
  )}`;
});
const PlayButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<button class="${"text-xxs w-full h-full py-0 px-4 grid grid-cols-[1.125rem_min-content_1.125rem] justify-center items-center gap-2.5 italic " + escape(
    "bg-black fill-primary text-primary md:hover:text-secondary md:hover:fill-secondary",
    true
  ) + " transition-colors"}">${validate_component(Icon, "Icon").$$render($$result, { icon: "play" }, {}, {})} <span class="text-nowrap" data-svelte-h="svelte-1esz6cp">play my vis!</span> <svg id="sound-icon" width="100%" height="100%" viewBox="0 0 32 33" xmlns="http://www.w3.org/2000/svg"><path d="M8.64 18.9001C10.098 18.9001 11.28 17.7181 11.28 16.2601C11.28 14.8021 10.098 13.6201 8.64 13.6201C7.18197 13.6201 6 14.8021 6 16.2601C6 17.7181 7.18197 18.9001 8.64 18.9001Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M14.1173 6.71289C19.3879 11.9834 19.3879 20.5366 14.1173 25.8071L12.7031 24.3929C17.1926 19.9034 17.1926 12.6166 12.7031 8.1271L14.1173 6.71289Z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M19.9171 1.00293C28.3477 9.43345 28.3477 23.0966 19.9171 31.5271L18.5029 30.1129C26.1524 22.4635 26.1524 10.0666 18.5029 2.41714L19.9171 1.00293Z"></path></svg></button>`;
});
const css$9 = {
  code: ".signals.svelte-9alu6d.svelte-9alu6d{position:absolute;bottom:calc(1.6 * var(--fs-label));right:calc(1.6 * var(--fs-label));opacity:1;transition:opacity 0.5s ease-in-out;display:flex;flex-direction:column;gap:var(--fs-label)}.signals.fade.svelte-9alu6d.svelte-9alu6d{opacity:0}@media(min-width: 768px){.signals.svelte-9alu6d.svelte-9alu6d{right:auto;left:calc(1.6 * var(--fs-label))}}.signals.svelte-9alu6d .signal.svelte-9alu6d{width:calc(3.6 * var(--fs-label));display:none;animation:ping 1s ease-in-out infinite both}",
  map: `{"version":3,"file":"Signals.svelte","sources":["Signals.svelte"],"sourcesContent":["<script>\\n  import Icon from \\"$lib/components/dom/atoms/Icon.svelte\\";\\n  \\n\\timport { selected } from '$lib/stores/nodes';\\n\\n<\/script>\\n\\n<div class=\\"signals\\" class:fade={!!$selected}>\\n\\n  <div id=\\"pinch-signal\\" class=\\"signal signals__pinch\\">\\n    <Icon icon=\\"pinch\\" />\\n  </div>\\n\\n  <div id=\\"pan-signal\\" class=\\"signal signals__pan\\">\\n    <Icon icon=\\"mousePan\\" />\\n  </div>\\n\\n</div>\\n\\n<style lang=\\"scss\\">.signals {\\n  position: absolute;\\n  bottom: calc(1.6 * var(--fs-label));\\n  right: calc(1.6 * var(--fs-label));\\n  opacity: 1;\\n  transition: opacity 0.5s ease-in-out;\\n  display: flex;\\n  flex-direction: column;\\n  gap: var(--fs-label);\\n}\\n.signals.fade {\\n  opacity: 0;\\n}\\n@media (min-width: 768px) {\\n  .signals {\\n    right: auto;\\n    left: calc(1.6 * var(--fs-label));\\n  }\\n}\\n.signals .signal {\\n  width: calc(3.6 * var(--fs-label));\\n  display: none;\\n  animation: ping 1s ease-in-out infinite both;\\n}</style>"],"names":[],"mappings":"AAmBmB,oCAAS,CAC1B,QAAQ,CAAE,QAAQ,CAClB,MAAM,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CACnC,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAClC,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,OAAO,CAAC,IAAI,CAAC,WAAW,CACpC,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,GAAG,CAAE,IAAI,UAAU,CACrB,CACA,QAAQ,iCAAM,CACZ,OAAO,CAAE,CACX,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,oCAAS,CACP,KAAK,CAAE,IAAI,CACX,IAAI,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAClC,CACF,CACA,sBAAQ,CAAC,qBAAQ,CACf,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAClC,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,IAAI,CAAC,EAAE,CAAC,WAAW,CAAC,QAAQ,CAAC,IAC1C"}`
};
const Signals = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $selected, $$unsubscribe_selected;
  $$unsubscribe_selected = subscribe(selected, (value) => $selected = value);
  $$result.css.add(css$9);
  $$unsubscribe_selected();
  return `<div class="${["signals svelte-9alu6d", !!$selected ? "fade" : ""].join(" ").trim()}"><div id="pinch-signal" class="signal signals__pinch svelte-9alu6d">${validate_component(Icon, "Icon").$$render($$result, { icon: "pinch" }, {}, {})}</div> <div id="pan-signal" class="signal signals__pan svelte-9alu6d">${validate_component(Icon, "Icon").$$render($$result, { icon: "mousePan" }, {}, {})}</div> </div>`;
});
const Visualization = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_app;
  let $nodeSize, $$unsubscribe_nodeSize;
  let $figureHeight, $$unsubscribe_figureHeight;
  let $figureWidth, $$unsubscribe_figureWidth;
  let $zoom, $$unsubscribe_zoom;
  let $cameraOffsetY, $$unsubscribe_cameraOffsetY;
  let $cameraOffsetX, $$unsubscribe_cameraOffsetX;
  $$unsubscribe_app = subscribe(app, (value) => value);
  $$unsubscribe_nodeSize = subscribe(nodeSize, (value) => $nodeSize = value);
  $$unsubscribe_figureHeight = subscribe(figureHeight, (value) => $figureHeight = value);
  $$unsubscribe_figureWidth = subscribe(figureWidth, (value) => $figureWidth = value);
  $$unsubscribe_zoom = subscribe(zoom, (value) => $zoom = value);
  $$unsubscribe_cameraOffsetY = subscribe(cameraOffsetY, (value) => $cameraOffsetY = value);
  $$unsubscribe_cameraOffsetX = subscribe(cameraOffsetX, (value) => $cameraOffsetX = value);
  let container;
  const root2 = new PIXI.Container();
  const camera = new PIXI.Container();
  const scene = new PIXI.Container();
  root2.name = "vis-container";
  camera.name = "outer-scene";
  scene.name = "scene";
  scene.node = { hitArea: new PIXI.Rectangle() };
  root2.addChild(camera);
  camera.addChild(scene);
  function updateNodeHitArea(nodeSize2) {
    scene.node.hitArea.x = -nodeSize2 / 2;
    scene.node.hitArea.y = -nodeSize2 / 2;
    scene.node.hitArea.width = nodeSize2;
    scene.node.hitArea.height = nodeSize2;
  }
  camera.x = $cameraOffsetX;
  camera.y = $cameraOffsetY;
  {
    camera.scale.set($zoom);
  }
  scene.x = $figureWidth / 2;
  scene.y = $figureHeight / 2;
  {
    updateNodeHitArea($nodeSize);
  }
  $$unsubscribe_app();
  $$unsubscribe_nodeSize();
  $$unsubscribe_figureHeight();
  $$unsubscribe_figureWidth();
  $$unsubscribe_zoom();
  $$unsubscribe_cameraOffsetY();
  $$unsubscribe_cameraOffsetX();
  return `<div class="w-full h-full"${add_attribute("this", container, 0)}></div>`;
});
const FileTrace = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $app, $$unsubscribe_app;
  $$unsubscribe_app = subscribe(app, (value) => $app = value);
  let { id } = $$props;
  let { context } = $$props;
  const translationRadius = 2 + Math.random() * 5;
  const ticker = $app.ticker.add(tick);
  const graphics = new PIXI.Graphics();
  context.addChild(graphics);
  templates[id](graphics, id >= 30 && id < 40 ? { anchor: [0.5, 0.5], rotateSprite: false } : void 0);
  const attr = { rotation: 0, translation: 0, scale: 1 };
  const tweens = [];
  if (get_store_value(width) > 768) {
    const clockwiseRotation = Math.random() > 0.5 ? 1 : -1;
    tweens.push(gsap$1.fromTo(
      attr,
      {
        rotation: clockwiseRotation * -Math.PI / 12
      },
      {
        rotation: clockwiseRotation * Math.PI / 12,
        repeat: -1,
        duration: 1.75 + Math.random() * 1.5,
        yoyo: true,
        ease: "none"
      }
    ));
    const clockwiseTranslation = Math.random() > 0.5 ? 1 : -1;
    tweens.push(gsap$1.fromTo(attr, { translation: 0 }, {
      translation: clockwiseTranslation * 2 * Math.PI,
      repeat: -1,
      duration: 6 + Math.random() * 4,
      ease: "none"
    }));
    tweens.push(gsap$1.fromTo(attr, { scale: 0.9 + Math.random() * 0.1 }, {
      scale: 1.15 + Math.random() * 0.05,
      repeat: -1,
      duration: 3 + Math.random(),
      yoyo: true,
      ease: "none"
    }));
  } else {
    graphics.scale.set(0.7);
  }
  function tick() {
    if (!tweens.length) {
      return;
    }
    graphics.rotation = attr.rotation;
    graphics.x = Math.cos(attr.translation) * translationRadius;
    graphics.y = Math.sin(attr.translation) * translationRadius;
    graphics.scale.set(attr.scale);
  }
  onDestroy(() => {
    ticker.remove(tick);
    tweens.forEach((tween) => tween.kill());
  });
  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.context === void 0 && $$bindings.context && context !== void 0) $$bindings.context(context);
  $$unsubscribe_app();
  return ``;
});
const File = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $selected, $$unsubscribe_selected;
  let $categories, $$unsubscribe_categories;
  let $_, $$unsubscribe__;
  $$unsubscribe_selected = subscribe(selected, (value) => $selected = value);
  $$unsubscribe_categories = subscribe(categories, (value) => $categories = value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  let { nColumns = 1 } = $$props;
  let { outerClose = false } = $$props;
  let container;
  let traceIds = [];
  let itemsByColumn = 0;
  let project = "";
  let client = "";
  let description = "";
  let date = "";
  function update(selected2) {
    if (!selected2) {
      return exit();
    }
    traceIds = [
      selected2.channel,
      ...selected2.products,
      ...selected2.designs,
      ...selected2.goals
    ];
    project = selected2.project;
    client = selected2.client;
    description = selected2.description;
    date = selected2.date;
    itemsByColumn = Math.ceil(traceIds.length / nColumns);
  }
  function exit() {
    {
      return;
    }
  }
  if ($$props.nColumns === void 0 && $$bindings.nColumns && nColumns !== void 0) $$bindings.nColumns(nColumns);
  if ($$props.outerClose === void 0 && $$bindings.outerClose && outerClose !== void 0) $$bindings.outerClose(outerClose);
  {
    update($selected);
  }
  $$unsubscribe_selected();
  $$unsubscribe_categories();
  $$unsubscribe__();
  return `<section class="${"hidden absolute top-0 left-0 w-full h-full z-40 " + escape(
    !!$selected ? "pointer-events-auto" : "pointer-events-none",
    true
  ) + " flex flex-col justify-center"}"${add_attribute("this", container, 0)}> <article class="max-w-full max-h-full mx-auto px-6 py-8 grid grid-rows-[max-content_minmax(auto,1fr)] gap-10 md:py-0 md:max-w-3xl md:grid-rows-none md:grid-cols-[max-content_minmax(auto,1fr)] overflow-hidden"> <ul class="row-start-2 md:row-start-1 md:col-start-1 gap-y-6 gap-x-2 content-center grid overflow-y-auto overflow-x-hidden pr-2"${add_styles({
    "grid-template-columns": `repeat(${nColumns}, minmax(0,1fr))`,
    "grid-template-rows": `repeat(${itemsByColumn}, minmax(0,1fr))`
  })}>${each(traceIds, (id, i) => {
    let context = new PIXI.Container(), category = $categories.find((d) => d.id === id);
    return `  ${category ? `<li class="grid grid-cols-[2rem_minmax(0,1fr)] gap-2.5 md:grid-cols-[2.25rem_minmax(0,1fr)] items-center"> <figure class="opacity-[inherit] aspect-square">${validate_component(FileTrace, "FileTrace").$$render($$result, { id, context }, {}, {})}</figure> <p class="text-xxs md:text-xs self-center lowercase underline">${escape($_("category." + category.id))}</p> </li>` : ``}`;
  })}</ul>  <div class="flex flex-col gap-3 justify-center md:py-8"> <div class="flex flex-col"><h3 class="inline-block font-bold uppercase text-2xl md:text-3xl">${escape(project)}</h3> <h4 class="mt-1.5 underline text-lg">${escape(client)}</h4></div>  <p>${escape(description)}</p>  <div class="flex flex-col gap-4 items-start"><p class="underline">${escape(date)}</p> ${!outerClose ? `<button class="stroke-black stroke-1 hover:stroke-primary hover:text-primary flex flex-col"><figure class="w-10 h-10">${validate_component(Icon, "Icon").$$render($$result, { icon: "return" }, {}, {})}</figure> <p>${escape($_("file.back"))}</p></button>` : ``}</div></div></article></section>`;
});
const MobileFrame = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $isToggleHidden, $$unsubscribe_isToggleHidden;
  let $_, $$unsubscribe__;
  let $isFilterOpen, $$unsubscribe_isFilterOpen;
  let $selected, $$unsubscribe_selected;
  $$unsubscribe_isToggleHidden = subscribe(isToggleHidden, (value) => $isToggleHidden = value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_isFilterOpen = subscribe(isFilterOpen, (value) => $isFilterOpen = value);
  $$unsubscribe_selected = subscribe(selected, (value) => $selected = value);
  let { layout } = $$props;
  function openSheet() {
    isSheetOpen.set(true);
  }
  if ($$props.layout === void 0 && $$bindings.layout && layout !== void 0) $$bindings.layout(layout);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div id="root" class="w-full h-full overflow-hidden grid grid-rows-[max-content_minmax(0,1fr)_max-content_max-content]"> <section id="mobile-header" class="row-start-1 z-10 px-6 pt-7 pb-3.5 flex justify-between items-end border-b border-b-black border-opacity-50"><div class="logo-container">${validate_component(ProjectLogo, "ProjectLogo").$$render($$result, {}, {}, {})}</div> <div class="options-wrapper flex flex-col justify-between items-end">${validate_component(LanguageChange, "LanguageChange").$$render($$result, {}, {}, {})}</div></section> <section class="row-start-2 z-20 w-full flex relative"><article id="vis-container" class="w-full">${validate_component(Signals, "Signals").$$render($$result, {}, {}, {})} ${validate_component(Visualization, "Visualization").$$render($$result, {}, {}, {})} ${validate_component(File, "File").$$render($$result, { nColumns: "2", outerClose: true }, {}, {})}</article> <article id="filter-container" class="absolute overflow-hidden top-0 left-0 w-full h-[110%] pointer-events-none"><button class="${"bg-black text-white absolute top-4 right-0 border-none rounded-tl-[1rem] rounded-bl-[1rem] p-3 transition-transform ease-in-out " + escape(
      $isToggleHidden ? "translate-x-full duration-200 pointer-events-none" : "duration-[750ms] delay-500 pointer-events-auto",
      true
    )}"><p>&gt; ${escape($_("menu.filters"))}</p></button> <aside class="${"pointer-events-auto absolute top-0 right-0 w-[85vw] h-full grid grid-rows-[minmax(0,1fr)_min-content] bg-black border border-white border-r-black rounded-tl-[3rem] rounded-bl-[3rem] transition-transform duration-500 ease-in-out overflow-hidden " + escape($isFilterOpen ? "translate-x-0" : "translate-x-full", true)}"><ul class="overflow-y-auto overflow-x-hidden pt-0 pb-8 pl-10 pr-4"><li class="border-b border-b-white border-opacity-50 py-8 pr-8 pl-0">${validate_component(InputPeriod, "InputPeriod").$$render($$result, { theme: "on-dark" }, {}, {})}</li> <li class="border-b border-b-white border-opacity-50 py-8 pr-8 pl-0">${validate_component(InputDesign, "InputDesign").$$render($$result, { theme: "on-dark" }, {}, {})}</li> <li class="border-b border-b-white border-opacity-50 py-8 pr-4 pl-0">${validate_component(InputGoal, "InputGoal").$$render($$result, { nColumns: "2", theme: "on-dark" }, {}, {})}</li> <li class="border-b border-b-white border-opacity-50 py-8 pr-4 pl-0">${validate_component(InputProduct, "InputProduct").$$render($$result, { nColumns: "2", theme: "on-dark" }, {}, {})}</li> <li class="py-8 pr-4 pl-0">${validate_component(InputIndustry, "InputIndustry").$$render($$result, { theme: "on-dark" }, {}, {})}</li></ul> <div class="grid grid-cols-5 h-16 border-t border-white border-opacity-50 pl-10"><div class="col-span-4">${validate_component(ClearAllFilterButton, "ClearAllFilterButton").$$render($$result, {}, {}, {})}</div> <div class="p-2 border-l border-l-white border-opacity-50 flex items-center justify-center"><button class="clean-btn" data-svelte-h="svelte-5u2sco"><p class="text-white text-2xl font-bold mx-auto">X</p></button></div></div></aside></article></section> <section id="layout-container" class="row-start-3 z-10 border-t flex justify-center items-center border-t-black border-opacity-50 h-12">${!$selected ? `<div>${validate_component(InputLayout, "InputLayout").$$render(
      $$result,
      { direction: "row", layout },
      {
        layout: ($$value) => {
          layout = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>` : `<button class="grid grid-cols-[repeat(2,min-content)] items-center justify-end gap-2.5"><figure class="w-6 h-6 stroke-black">${validate_component(Icon, "Icon").$$render($$result, { icon: "return" }, {}, {})}</figure> <p>${escape($_("file.back"))}</p></button>`}</section> <section id="play-my-vis" class="row-start-4 z-10 h-12 border-t border-t-black border-opacity-50 grid grid-cols-[min-content_minmax(0,1fr)]"><figure class="h-full aspect-square border-r border-r-dark-gray">${validate_component(Button, "Button").$$render($$result, { onClick: openSheet }, {}, {
      default: () => {
        return `${validate_component(Icon, "Icon").$$render($$result, { icon: "infoDefault" }, {}, {})}`;
      }
    })}</figure> ${validate_component(PlayButton, "PlayButton").$$render($$result, {}, {}, {})}</section></div>`;
  } while (!$$settled);
  $$unsubscribe_isToggleHidden();
  $$unsubscribe__();
  $$unsubscribe_isFilterOpen();
  $$unsubscribe_selected();
  return $$rendered;
});
const css$8 = {
  code: ".dropdown.svelte-l3v3h3.svelte-l3v3h3{position:relative;width:100%;height:100%}.dropdown.svelte-l3v3h3 .button.svelte-l3v3h3{padding:0 1rem;display:grid;grid-template-columns:max-content max-content;align-items:center;width:100%;height:100%;border:none;background:none;font-family:inherit;cursor:pointer;text-align:left}.dropdown.svelte-l3v3h3 .button__icon.svelte-l3v3h3{align-self:center;width:1rem;transform:translateY(-0.085rem) rotate(-90deg);transition:transform 150ms ease-in-out}.dropdown.svelte-l3v3h3 .content.svelte-l3v3h3{position:absolute;padding:1rem;min-width:calc(100% + 2px);left:-1px;top:100%;background-color:hsla(0, 0%, 100%, 0.9);border:1px solid var(--clr-black);background:var(--clr-black);pointer-events:none;opacity:0;transform:translateY(-0.15rem);transition:opacity 150ms ease-in-out, transform 150ms ease-in-out;z-index:10;display:flex;flex-direction:column;align-items:stretch;gap:calc(2 * var(--fs-label))}.dropdown.svelte-l3v3h3.active .content.svelte-l3v3h3{transform:translateY(0);opacity:1;pointer-events:auto !important}.dropdown.svelte-l3v3h3.active .button__icon.svelte-l3v3h3{transform:rotate(0)}",
  map: `{"version":3,"file":"DropdownMenu.svelte","sources":["DropdownMenu.svelte"],"sourcesContent":["<script>\\n  import { setContext } from 'svelte';\\n\\timport Icon from '$lib/components/dom/atoms/Icon.svelte';\\n  \\n  export let title\\n\\n  let active = false\\n\\n  function handlePointerEnter(e) {\\n    active = true\\n    e.preventDefault()\\n    e.stopPropagation()\\n  }\\n  \\n  function handlePointerLeave(e) {\\n    active = false\\n    e.preventDefault()\\n    e.stopPropagation()\\n  }\\n\\n  function handlePointerUp(e) {\\n    active = !active\\n    e.preventDefault()\\n    e.stopPropagation()\\n  }\\n\\n  setContext(\\"item-theme\\", { theme: \\"on-dark\\" })\\n\\n<\/script>\\n\\n<div class=\\"dropdown\\" class:active\\n  on:pointerenter={handlePointerEnter}\\n  on:pointerleave={handlePointerLeave}\\n>\\n  <button class=\\"button\\" on:pointerup={handlePointerUp}>\\n\\n    {#if title}\\n      <div class=\\"button__icon\\">\\n        <Icon icon='caret' />\\n      </div>\\n\\n      <span class=\\"button__label text-xxs\\">{title}</span>\\n    {:else}\\n      <span class=\\"button__label text-xxs\\">...</span>\\n    {/if}\\n  </button>\\n\\n  <div class=\\"content\\">\\n    <slot />\\n  </div>\\n\\n</div>\\n\\n<style lang=\\"scss\\">.dropdown {\\n  position: relative;\\n  width: 100%;\\n  height: 100%;\\n}\\n.dropdown .button {\\n  padding: 0 1rem;\\n  display: grid;\\n  grid-template-columns: max-content max-content;\\n  align-items: center;\\n  width: 100%;\\n  height: 100%;\\n  border: none;\\n  background: none;\\n  font-family: inherit;\\n  cursor: pointer;\\n  text-align: left;\\n}\\n.dropdown .button__icon {\\n  align-self: center;\\n  width: 1rem;\\n  transform: translateY(-0.085rem) rotate(-90deg);\\n  transition: transform 150ms ease-in-out;\\n}\\n.dropdown .content {\\n  position: absolute;\\n  padding: 1rem;\\n  min-width: calc(100% + 2px);\\n  left: -1px;\\n  top: 100%;\\n  background-color: hsla(0, 0%, 100%, 0.9);\\n  border: 1px solid var(--clr-black);\\n  background: var(--clr-black);\\n  pointer-events: none;\\n  opacity: 0;\\n  transform: translateY(-0.15rem);\\n  transition: opacity 150ms ease-in-out, transform 150ms ease-in-out;\\n  z-index: 10;\\n  display: flex;\\n  flex-direction: column;\\n  align-items: stretch;\\n  gap: calc(2 * var(--fs-label));\\n}\\n.dropdown:global(.active) .content {\\n  transform: translateY(0);\\n  opacity: 1;\\n  pointer-events: auto !important;\\n}\\n.dropdown:global(.active) .button__icon {\\n  transform: rotate(0);\\n}</style>"],"names":[],"mappings":"AAqDmB,qCAAU,CAC3B,QAAQ,CAAE,QAAQ,CAClB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IACV,CACA,uBAAS,CAAC,qBAAQ,CAChB,OAAO,CAAE,CAAC,CAAC,IAAI,CACf,OAAO,CAAE,IAAI,CACb,qBAAqB,CAAE,WAAW,CAAC,WAAW,CAC9C,WAAW,CAAE,MAAM,CACnB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,OAAO,CACpB,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,IACd,CACA,uBAAS,CAAC,2BAAc,CACtB,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,WAAW,SAAS,CAAC,CAAC,OAAO,MAAM,CAAC,CAC/C,UAAU,CAAE,SAAS,CAAC,KAAK,CAAC,WAC9B,CACA,uBAAS,CAAC,sBAAS,CACjB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,SAAS,CAAE,KAAK,IAAI,CAAC,CAAC,CAAC,GAAG,CAAC,CAC3B,IAAI,CAAE,IAAI,CACV,GAAG,CAAE,IAAI,CACT,gBAAgB,CAAE,KAAK,CAAC,CAAC,CAAC,EAAE,CAAC,CAAC,IAAI,CAAC,CAAC,GAAG,CAAC,CACxC,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,WAAW,CAAC,CAClC,UAAU,CAAE,IAAI,WAAW,CAAC,CAC5B,cAAc,CAAE,IAAI,CACpB,OAAO,CAAE,CAAC,CACV,SAAS,CAAE,WAAW,QAAQ,CAAC,CAC/B,UAAU,CAAE,OAAO,CAAC,KAAK,CAAC,WAAW,CAAC,CAAC,SAAS,CAAC,KAAK,CAAC,WAAW,CAClE,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,OAAO,CACpB,GAAG,CAAE,KAAK,CAAC,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAC/B,CACA,uBAAiB,OAAQ,CAAC,sBAAS,CACjC,SAAS,CAAE,WAAW,CAAC,CAAC,CACxB,OAAO,CAAE,CAAC,CACV,cAAc,CAAE,IAAI,CAAC,UACvB,CACA,uBAAiB,OAAQ,CAAC,2BAAc,CACtC,SAAS,CAAE,OAAO,CAAC,CACrB"}`
};
const DropdownMenu = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  setContext("item-theme", { theme: "on-dark" });
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  $$result.css.add(css$8);
  return `<div class="${["dropdown svelte-l3v3h3", ""].join(" ").trim()}"><button class="button svelte-l3v3h3">${title ? `<div class="button__icon svelte-l3v3h3">${validate_component(Icon, "Icon").$$render($$result, { icon: "caret" }, {}, {})}</div> <span class="button__label text-xxs">${escape(title)}</span>` : `<span class="button__label text-xxs" data-svelte-h="svelte-gxj7xe">...</span>`}</button> <div class="content svelte-l3v3h3">${slots.default ? slots.default({}) : ``}</div> </div>`;
});
const DropdownActivate = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let featCategories;
  let $_, $$unsubscribe__;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  let activeFeatures = [];
  const featIds = ["complexity", "link-project", "link-client"];
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    featCategories = featIds.map((id) => ({
      id,
      alias: $_(`menu.active.values.${id}`)
    }));
    {
      complexityOn.set(activeFeatures.includes("complexity"));
    }
    {
      linkProjectOn.set(activeFeatures.includes("link-project"));
    }
    {
      linkClientOn.set(activeFeatures.includes("link-client"));
    }
    $$rendered = `${validate_component(DropdownMenu, "DropdownMenu").$$render($$result, { title: $_("menu.active.title") }, {}, {
      default: () => {
        return `${validate_component(InputGroup, "InputGroup").$$render(
          $$result,
          {
            direction: "column",
            i18nPrefix: "menu.active.values.",
            categories: featCategories,
            multiselect: true,
            unselectBtn: false,
            onDark: true,
            selected: activeFeatures
          },
          {
            selected: ($$value) => {
              activeFeatures = $$value;
              $$settled = false;
            }
          },
          {}
        )}`;
      }
    })}`;
  } while (!$$settled);
  $$unsubscribe__();
  return $$rendered;
});
const DropdownSortBy = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let sortCategories;
  let $_, $$unsubscribe__;
  let $sortBy, $$unsubscribe_sortBy;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_sortBy = subscribe(sortBy, (value) => $sortBy = value);
  const sortIds = ["dt", "industry"];
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    sortCategories = sortIds.map((id) => ({ id, alias: $_(`menu.sort.values.${id}`) }));
    $$rendered = `${validate_component(DropdownMenu, "DropdownMenu").$$render($$result, { title: $_("menu.sort.title") }, {}, {
      default: () => {
        return `${validate_component(InputGroup, "InputGroup").$$render(
          $$result,
          {
            direction: "column",
            i18nPrefix: "menu.sort.values.",
            categories: sortCategories,
            multiselect: false,
            onDark: true,
            selected: $sortBy
          },
          {
            selected: ($$value) => {
              $sortBy = $$value;
              $$settled = false;
            }
          },
          {}
        )}`;
      }
    })}`;
  } while (!$$settled);
  $$unsubscribe__();
  $$unsubscribe_sortBy();
  return $$rendered;
});
const css$7 = {
  code: ".dropdown-section.svelte-iiocv2.svelte-iiocv2{display:flex;flex-direction:column;align-items:stretch;gap:var(--fs-label)}.dropdown-section.svelte-iiocv2 h5.svelte-iiocv2{font-size:var(--fs-label);color:var(--clr-white)}",
  map: `{"version":3,"file":"DropdownAll.svelte","sources":["DropdownAll.svelte"],"sourcesContent":["<script>\\n  import { _ } from 'svelte-i18n'\\n\\n  // Stores\\n  import { sortBy } from \\"$lib/stores/nodes\\";\\n  import { complexityOn, linkProjectOn, linkClientOn } from \\"$lib/stores/canvas\\";\\n\\n  // DOM Components\\n  import DropdownMenu from \\"$lib/components/dom/molecules/DropdownMenu.svelte\\";\\n  import InputGroup from \\"$lib/components/dom/molecules/InputGroup.svelte\\";\\n\\n  // Sort\\n  const sortIds = [ \\"dt\\", \\"industry\\" ]\\n\\n  $: sortCategories = sortIds.map(id => ({\\n    id,\\n    alias: $_(\`menu.sort.values.\${id}\`)\\n  }))\\n  \\n  // Active\\n  let activeFeatures = []\\n\\n  const featIds = [ \\"complexity\\", \\"link-project\\", \\"link-client\\" ]\\n\\n  $: featCategories = featIds.map(id => ({\\n    id,\\n    alias: $_(\`menu.active.values.\${id}\`)\\n  }))\\n\\n  $: complexityOn.set(activeFeatures.includes('complexity'))\\n  $: linkProjectOn.set(activeFeatures.includes('link-project'))\\n  $: linkClientOn.set(activeFeatures.includes('link-client'))\\n<\/script>\\n\\n<DropdownMenu>\\n\\n  <div class=\\"dropdown-section\\">\\n    <h5>{$_(\\"menu.sort.title\\")}</h5>\\n    <InputGroup\\n      direction=\\"column\\"\\n      i18nPrefix=\\"menu.sort.values.\\"\\n      categories={sortCategories}\\n      multiselect={false}\\n      onDark={true}\\n      bind:selected={$sortBy}\\n    />\\n  </div>\\n\\n  <div class=\\"dropdown-section\\">\\n    <h5>{$_(\\"menu.active.title\\")}</h5>\\n    <InputGroup\\n      direction=\\"column\\"\\n      i18nPrefix=\\"menu.active.values.\\"\\n      categories={featCategories}\\n      multiselect={true}\\n      unselectBtn={false}\\n      onDark={true}\\n      bind:selected={activeFeatures}\\n    />\\n  </div>\\n</DropdownMenu>\\n\\n<style lang=\\"scss\\">.dropdown-section {\\n  display: flex;\\n  flex-direction: column;\\n  align-items: stretch;\\n  gap: var(--fs-label);\\n}\\n.dropdown-section h5 {\\n  font-size: var(--fs-label);\\n  color: var(--clr-white);\\n}</style>"],"names":[],"mappings":"AA8DmB,6CAAkB,CACnC,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,OAAO,CACpB,GAAG,CAAE,IAAI,UAAU,CACrB,CACA,+BAAiB,CAAC,gBAAG,CACnB,SAAS,CAAE,IAAI,UAAU,CAAC,CAC1B,KAAK,CAAE,IAAI,WAAW,CACxB"}`
};
const DropdownAll = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let sortCategories;
  let featCategories;
  let $_, $$unsubscribe__;
  let $sortBy, $$unsubscribe_sortBy;
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  $$unsubscribe_sortBy = subscribe(sortBy, (value) => $sortBy = value);
  const sortIds = ["dt", "industry"];
  let activeFeatures = [];
  const featIds = ["complexity", "link-project", "link-client"];
  $$result.css.add(css$7);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    sortCategories = sortIds.map((id) => ({ id, alias: $_(`menu.sort.values.${id}`) }));
    featCategories = featIds.map((id) => ({
      id,
      alias: $_(`menu.active.values.${id}`)
    }));
    {
      complexityOn.set(activeFeatures.includes("complexity"));
    }
    {
      linkProjectOn.set(activeFeatures.includes("link-project"));
    }
    {
      linkClientOn.set(activeFeatures.includes("link-client"));
    }
    $$rendered = `${validate_component(DropdownMenu, "DropdownMenu").$$render($$result, {}, {}, {
      default: () => {
        return `<div class="dropdown-section svelte-iiocv2"><h5 class="svelte-iiocv2">${escape($_("menu.sort.title"))}</h5> ${validate_component(InputGroup, "InputGroup").$$render(
          $$result,
          {
            direction: "column",
            i18nPrefix: "menu.sort.values.",
            categories: sortCategories,
            multiselect: false,
            onDark: true,
            selected: $sortBy
          },
          {
            selected: ($$value) => {
              $sortBy = $$value;
              $$settled = false;
            }
          },
          {}
        )}</div> <div class="dropdown-section svelte-iiocv2"><h5 class="svelte-iiocv2">${escape($_("menu.active.title"))}</h5> ${validate_component(InputGroup, "InputGroup").$$render(
          $$result,
          {
            direction: "column",
            i18nPrefix: "menu.active.values.",
            categories: featCategories,
            multiselect: true,
            unselectBtn: false,
            onDark: true,
            selected: activeFeatures
          },
          {
            selected: ($$value) => {
              activeFeatures = $$value;
              $$settled = false;
            }
          },
          {}
        )}</div>`;
      }
    })}`;
  } while (!$$settled);
  $$unsubscribe__();
  $$unsubscribe_sortBy();
  return $$rendered;
});
const DesktopFrame = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $width, $$unsubscribe_width;
  $$unsubscribe_width = subscribe(width, (value) => $width = value);
  const productContainer = new PIXI.Container();
  productContainer.name = "top-panel";
  let { layout } = $$props;
  let shrinkHeight;
  let isShrinked = false;
  function toggleTopMenuCollapse() {
    isShrinked = !isShrinked;
    return;
  }
  if ($$props.layout === void 0 && $$bindings.layout && layout !== void 0) $$bindings.layout(layout);
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    $$rendered = `<div id="root" class="w-full h-full relative overflow-hidden grid md:grid-rows-[auto_1fr] md:grid-cols-[240px_repeat(4,minmax(0,1fr))] xl:grid-cols-5"><section id="top-panel" class="col-start-2 col-span-full row-start-1 row-span-1 z-20"><article id="shrink-panel" class="relative overflow-hidden transition-all duration-300 ease-in-out"${add_styles({
      "transform": `translate(0, ${isShrinked ? -1 * shrinkHeight : 0}px)`,
      "max-height": `${isShrinked ? 0 : shrinkHeight}px`
    })}><div class="pt-12 pr-0 pb-6 pl-12">${validate_component(InputProduct, "InputProduct").$$render($$result, { parent: productContainer }, {}, {})}</div> <figure class="absolute top-12 right-12 w-10 h-10">${validate_component(Button, "Button").$$render($$result, { onClick: () => isSheetOpen.set(true) }, {}, {
      default: () => {
        return `${validate_component(Icon, "Icon").$$render($$result, { icon: "infoDefault" }, {}, {})}`;
      }
    })}</figure></article> <ul id="top-panel-menu" class="h-10 grid md:grid-cols-[auto_auto_max-content_max-content_minmax(0,1fr)_min-content] lg:grid-cols-[auto_auto_auto_max-content_max-content_minmax(0,1fr)_min-content]">${$width >= 1024 ? `<li id="sortby" class="border-y border-y-black border-r border-r-black">${validate_component(DropdownSortBy, "DropdownSortBy").$$render($$result, {}, {}, {})}</li> <li id="activate" class="border-y border-y-black border-r border-r-black">${validate_component(DropdownActivate, "DropdownActivate").$$render($$result, {}, {}, {})}</li>` : `<li id="sortby-activate" class="border-y border-y-black border-r border-r-black">${validate_component(DropdownAll, "DropdownAll").$$render($$result, {}, {}, {})}</li>`} <li id="clear-all" class="border-y border-y-black border-r border-r-black py-0 px-3">${validate_component(ClearAllFilterButton, "ClearAllFilterButton").$$render($$result, {}, {}, {})}</li> <li id="play-my-vis" class="border-y border-y-black border-r border-r-black">${validate_component(PlayButton, "PlayButton").$$render($$result, {}, {}, {})}</li> <li id="project-logo" class="border-y border-y-black px-8 h-full max-h-full"><div class="h-10 flex py-2">${validate_component(ProjectLogo, "ProjectLogo").$$render($$result, {}, {}, {})}</div></li> <li id="shrink-button-wrapper" class="border-y border-y-black relative z-20 hidden lg:block"><figure class="absolute top-full left-1/3 -translate-y-1/2 w-8"><div class="${"rotate transition-transform duration-150 ease-in-out origin-center " + escape(isShrinked ? "rotate-180" : "rotate-0", true)}">${validate_component(Button, "Button").$$render(
      $$result,
      {
        onClick: toggleTopMenuCollapse,
        colorDefault: "var(--clr-white)",
        colorHover: "var(--clr-accent)",
        colorActive: "var(--clr-accent-low)"
      },
      {},
      {
        default: () => {
          return `${validate_component(Icon, "Icon").$$render($$result, { icon: "collapse" }, {}, {})}`;
        }
      }
    )}</div></figure></li> <li id="change-language" class="border-y border-y-black flex items-center"><div class="mr-12 z-40">${validate_component(LanguageChange, "LanguageChange").$$render($$result, {}, {}, {})}</div></li></ul></section> <section id="left-panel" class="col-start-1 col-span-1 row-start-1 row-span-full z-10 border-r border-r-black overflow-y-auto pt-12 pr-6 pb-6 pl-12 flex flex-col"><ul><li class="pb-7 pr-6 pl-0 border-b border-b-black border-opacity-40 input-layout">${validate_component(InputLayout, "InputLayout").$$render(
      $$result,
      { layout },
      {
        layout: ($$value) => {
          layout = $$value;
          $$settled = false;
        }
      },
      {}
    )}</li> <li class="py-7 pr-6 pl-0 border-b border-b-black border-opacity-40 input-period">${validate_component(InputPeriod, "InputPeriod").$$render($$result, {}, {}, {})}</li> <li class="py-7 pr-6 pl-0 border-b border-b-black border-opacity-40 input-design">${validate_component(InputDesign, "InputDesign").$$render($$result, {}, {}, {})}</li> <li class="py-7 pr-6 pl-0 border-b border-b-black border-opacity-40 input-goal">${validate_component(InputGoal, "InputGoal").$$render($$result, {}, {}, {})}</li> <li class="py-7 pr-6 pl-0 input-industry">${validate_component(InputIndustry, "InputIndustry").$$render($$result, {}, {}, {})}</li></ul></section> <section id="vis-container" class="col-start-2 col-span-full row-start-2 relative">${validate_component(Signals, "Signals").$$render($$result, {}, {}, {})} ${validate_component(Visualization, "Visualization").$$render($$result, {}, {}, {})} ${validate_component(File, "File").$$render($$result, {}, {}, {})}</section></div>`;
  } while (!$$settled);
  $$unsubscribe_width();
  return $$rendered;
});
const css$6 = {
  code: ".techsheet.svelte-1lw7ke.svelte-1lw7ke{position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;display:none}.techsheet.svelte-1lw7ke.svelte-1lw7ke.open{display:block}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper.svelte-1lw7ke{position:absolute;top:50%;left:50%;transform:translate(-50%, -50%)}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel.svelte-1lw7ke{display:flex;flex-direction:column;width:90vw;max-height:80vh}@media(min-width: 768px){.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel.svelte-1lw7ke{width:auto;max-width:calc(48 * var(--fs-label))}}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .close-wrapper.svelte-1lw7ke{width:calc(3.2 * var(--fs-label));height:calc(3.2 * var(--fs-label));margin-left:auto;position:fixed;bottom:0;right:0;transform:translate(-30%, 50%)}@media(min-width: 768px){.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .close-wrapper.svelte-1lw7ke{width:calc(2.4 * var(--fs-label));height:calc(2.4 * var(--fs-label));bottom:auto;top:0;transform:translate(-50%, -50%)}}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .close-wrapper button.svelte-1lw7ke{padding:0;width:100%;height:100%;background:var(--clr-black);border-radius:99rem;color:var(--clr-accent);cursor:pointer}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .close-wrapper button.svelte-1lw7ke:hover{color:var(--clr-accent-hover)}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .content.svelte-1lw7ke{flex:1;border:2px solid var(--clr-black);background:var(--clr-white);overflow:hidden;display:flex}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .content__body.svelte-1lw7ke{padding:calc(2.4 * var(--fs-label));overflow-y:auto;max-height:100%;flex:1;display:grid;grid-auto-flow:row;gap:calc(1.4 * var(--fs-label))}@media(min-width: 768px){.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .content__body.svelte-1lw7ke{padding:calc(3.6 * var(--fs-label))}}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .content__body p.svelte-1lw7ke{margin:var(--fs-label) 0}.techsheet.svelte-1lw7ke .techsheet-panel-wrapper .techsheet-panel .content__body h5.svelte-1lw7ke{margin-bottom:var(--fs-label)}.techsheet.svelte-1lw7ke .techsheet-backdrop.svelte-1lw7ke{position:absolute;top:0;left:0;right:0;bottom:0;background:rgba(255, 255, 255, 0.8)}",
  map: '{"version":3,"file":"TechSheet.svelte","sources":["TechSheet.svelte"],"sourcesContent":["<script lang=\\"ts\\">import { _ } from \\"svelte-i18n\\";\\nimport { gsap } from \\"gsap\\";\\nimport { isSheetOpen } from \\"../../../stores/techsheet\\";\\nimport Icon from \\"../atoms/Icon.svelte\\";\\nlet wrapper;\\n$: if (wrapper && $isSheetOpen) {\\n  const tl = gsap.timeline({\\n    overwrite: true,\\n    onStart: addOpenClass\\n  });\\n  tl.fromTo(\\".techsheet-backdrop\\", { opacity: 0 }, { opacity: 1, duration: 0.15 }).fromTo(\\".techsheet-panel\\", { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3 }, \\"<\\");\\n} else if (wrapper && !$isSheetOpen) {\\n  const tl = gsap.timeline({\\n    overwrite: true,\\n    onComplete: removeOpenClass,\\n    onInterrupt: removeOpenClass\\n  });\\n  tl.to(\\".techsheet-backdrop\\", { opacity: 0, duration: 0.5 }).to(\\".techsheet-panel\\", { y: -12, opacity: 0, duration: 0.3 }, \\"<\\");\\n}\\nfunction handleClose() {\\n  isSheetOpen.set(false);\\n}\\nfunction addOpenClass() {\\n  if (!wrapper) return;\\n  wrapper.classList.add(\\"open\\");\\n}\\nfunction removeOpenClass() {\\n  if (!wrapper) return;\\n  wrapper.classList.remove(\\"open\\");\\n}\\n<\/script>\\n\\n<div bind:this={wrapper} class=\\"techsheet\\">\\n  \\n  <div class=\\"techsheet-backdrop\\" />\\n\\n  <div class=\\"techsheet-panel-wrapper\\">\\n\\n    <!-- Adding the extra div below allows us to add some transform transition -->\\n    <div class=\\"techsheet-panel\\">\\n\\n      <div class=\\"close-wrapper\\">\\n        <button class=\\"clean-btn\\" on:click={handleClose}>\\n          <Icon icon=\\"closeX\\"/>\\n        </button>\\n      </div>\\n\\n      <div class=\\"content\\">\\n\\n        <div class=\\"content__body\\">\\n          <h3 class=\\"text-lg\\">datadot {$_(\\"page.hero\\")}</h3>\\n    \\n          <div>\\n            <p class=\\"text-xs\\">{$_(\\"techsheet.main\\")}</p>\\n            <p class=\\"text-xs\\"><span class=\\"font-medium\\">{$_(\\"techsheet.encourage\\")}</span></p>\\n          </div>\\n    \\n          <div>\\n            <h5>{$_(\\"techsheet.made-by\\")}</h5>  \\n            <ul class=\\"text-xs\\">\\n              <li><span class=\\"font-medium\\">Flávia Marinho</span> ({($_(\\"techsheet.roles.flavia\\"))})</li>\\n              <li><span class=\\"font-medium\\">Otávio Burin</span> ({($_(\\"techsheet.roles.otavio\\"))})</li>\\n              <li><span class=\\"font-medium\\">Italo Oliveira</span> ({($_(\\"techsheet.roles.italo\\"))})</li>\\n              <li><span class=\\"font-medium\\">Quintino Andrade</span> ({($_(\\"techsheet.roles.quintino\\"))})</li>\\n              <li><span class=\\"font-medium\\">Ludmila Souza</span> ({($_(\\"techsheet.roles.ludmila\\"))})</li>\\n              <li><span class=\\"font-medium\\">Gabriel Maciel</span> ({($_(\\"techsheet.roles.gabriel\\"))})</li>\\n            </ul>\\n          </div>\\n    \\n          <div>\\n            <a href=\\"https://datadotestudio.com/\\" target=\\"_blank\\">datadot.com.br</a>\\n          </div>\\n        </div>\\n\\n      </div>\\n\\n    </div>\\n\\n  </div>\\n\\n</div>\\n\\n<style lang=\\"scss\\">.techsheet {\\n  position: fixed;\\n  top: 0;\\n  left: 0;\\n  right: 0;\\n  bottom: 0;\\n  z-index: 9999;\\n  display: none;\\n}\\n.techsheet:global(.open) {\\n  display: block;\\n}\\n.techsheet .techsheet-panel-wrapper {\\n  position: absolute;\\n  top: 50%;\\n  left: 50%;\\n  transform: translate(-50%, -50%);\\n}\\n.techsheet .techsheet-panel-wrapper .techsheet-panel {\\n  display: flex;\\n  flex-direction: column;\\n  width: 90vw;\\n  max-height: 80vh;\\n}\\n@media (min-width: 768px) {\\n  .techsheet .techsheet-panel-wrapper .techsheet-panel {\\n    width: auto;\\n    max-width: calc(48 * var(--fs-label));\\n  }\\n}\\n.techsheet .techsheet-panel-wrapper .techsheet-panel .close-wrapper {\\n  width: calc(3.2 * var(--fs-label));\\n  height: calc(3.2 * var(--fs-label));\\n  margin-left: auto;\\n  position: fixed;\\n  bottom: 0;\\n  right: 0;\\n  transform: translate(-30%, 50%);\\n}\\n@media (min-width: 768px) {\\n  .techsheet .techsheet-panel-wrapper .techsheet-panel .close-wrapper {\\n    width: calc(2.4 * var(--fs-label));\\n    height: calc(2.4 * var(--fs-label));\\n    bottom: auto;\\n    top: 0;\\n    transform: translate(-50%, -50%);\\n  }\\n}\\n.techsheet .techsheet-panel-wrapper .techsheet-panel .close-wrapper button {\\n  padding: 0;\\n  width: 100%;\\n  height: 100%;\\n  background: var(--clr-black);\\n  border-radius: 99rem;\\n  color: var(--clr-accent);\\n  cursor: pointer;\\n}\\n.techsheet .techsheet-panel-wrapper .techsheet-panel .close-wrapper button:hover {\\n  color: var(--clr-accent-hover);\\n}\\n.techsheet .techsheet-panel-wrapper .techsheet-panel .content {\\n  flex: 1;\\n  border: 2px solid var(--clr-black);\\n  background: var(--clr-white);\\n  overflow: hidden;\\n  display: flex;\\n}\\n.techsheet .techsheet-panel-wrapper .techsheet-panel .content__body {\\n  padding: calc(2.4 * var(--fs-label));\\n  overflow-y: auto;\\n  max-height: 100%;\\n  flex: 1;\\n  display: grid;\\n  grid-auto-flow: row;\\n  gap: calc(1.4 * var(--fs-label));\\n}\\n@media (min-width: 768px) {\\n  .techsheet .techsheet-panel-wrapper .techsheet-panel .content__body {\\n    padding: calc(3.6 * var(--fs-label));\\n  }\\n}\\n.techsheet .techsheet-panel-wrapper .techsheet-panel .content__body p {\\n  margin: var(--fs-label) 0;\\n}\\n.techsheet .techsheet-panel-wrapper .techsheet-panel .content__body h5 {\\n  margin-bottom: var(--fs-label);\\n}\\n.techsheet .techsheet-backdrop {\\n  position: absolute;\\n  top: 0;\\n  left: 0;\\n  right: 0;\\n  bottom: 0;\\n  background: rgba(255, 255, 255, 0.8);\\n}</style>"],"names":[],"mappings":"AAkFmB,sCAAW,CAC5B,QAAQ,CAAE,KAAK,CACf,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CAAC,CACT,OAAO,CAAE,IAAI,CACb,OAAO,CAAE,IACX,CACA,sCAAkB,KAAO,CACvB,OAAO,CAAE,KACX,CACA,wBAAU,CAAC,sCAAyB,CAClC,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,GAAG,CACR,IAAI,CAAE,GAAG,CACT,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CACjC,CACA,wBAAU,CAAC,wBAAwB,CAAC,8BAAiB,CACnD,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,IACd,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,wBAAU,CAAC,wBAAwB,CAAC,8BAAiB,CACnD,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,KAAK,EAAE,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CACtC,CACF,CACA,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,4BAAe,CAClE,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAClC,MAAM,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CACnC,WAAW,CAAE,IAAI,CACjB,QAAQ,CAAE,KAAK,CACf,MAAM,CAAE,CAAC,CACT,KAAK,CAAE,CAAC,CACR,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,GAAG,CAChC,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,4BAAe,CAClE,KAAK,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CAClC,MAAM,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CACnC,MAAM,CAAE,IAAI,CACZ,GAAG,CAAE,CAAC,CACN,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CACjC,CACF,CACA,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,cAAc,CAAC,oBAAO,CACzE,OAAO,CAAE,CAAC,CACV,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,IAAI,WAAW,CAAC,CAC5B,aAAa,CAAE,KAAK,CACpB,KAAK,CAAE,IAAI,YAAY,CAAC,CACxB,MAAM,CAAE,OACV,CACA,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,cAAc,CAAC,oBAAM,MAAO,CAC/E,KAAK,CAAE,IAAI,kBAAkB,CAC/B,CACA,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,sBAAS,CAC5D,IAAI,CAAE,CAAC,CACP,MAAM,CAAE,GAAG,CAAC,KAAK,CAAC,IAAI,WAAW,CAAC,CAClC,UAAU,CAAE,IAAI,WAAW,CAAC,CAC5B,QAAQ,CAAE,MAAM,CAChB,OAAO,CAAE,IACX,CACA,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,4BAAe,CAClE,OAAO,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CAAC,CACpC,UAAU,CAAE,IAAI,CAChB,UAAU,CAAE,IAAI,CAChB,IAAI,CAAE,CAAC,CACP,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,GAAG,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CACjC,CACA,MAAO,YAAY,KAAK,CAAE,CACxB,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,4BAAe,CAClE,OAAO,CAAE,KAAK,GAAG,CAAC,CAAC,CAAC,IAAI,UAAU,CAAC,CACrC,CACF,CACA,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,cAAc,CAAC,eAAE,CACpE,MAAM,CAAE,IAAI,UAAU,CAAC,CAAC,CAC1B,CACA,wBAAU,CAAC,wBAAwB,CAAC,gBAAgB,CAAC,cAAc,CAAC,gBAAG,CACrE,aAAa,CAAE,IAAI,UAAU,CAC/B,CACA,wBAAU,CAAC,iCAAoB,CAC7B,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,MAAM,CAAE,CAAC,CACT,UAAU,CAAE,KAAK,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CAAC,CAAC,GAAG,CACrC"}'
};
const TechSheet = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_isSheetOpen;
  let $_, $$unsubscribe__;
  $$unsubscribe_isSheetOpen = subscribe(isSheetOpen, (value) => value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  let wrapper;
  $$result.css.add(css$6);
  $$unsubscribe_isSheetOpen();
  $$unsubscribe__();
  return `<div class="techsheet svelte-1lw7ke"${add_attribute("this", wrapper, 0)}><div class="techsheet-backdrop svelte-1lw7ke"></div> <div class="techsheet-panel-wrapper svelte-1lw7ke"> <div class="techsheet-panel svelte-1lw7ke"><div class="close-wrapper svelte-1lw7ke"><button class="clean-btn svelte-1lw7ke">${validate_component(Icon, "Icon").$$render($$result, { icon: "closeX" }, {}, {})}</button></div> <div class="content svelte-1lw7ke"><div class="content__body svelte-1lw7ke"><h3 class="text-lg">datadot ${escape($_("page.hero"))}</h3> <div><p class="text-xs svelte-1lw7ke">${escape($_("techsheet.main"))}</p> <p class="text-xs svelte-1lw7ke"><span class="font-medium">${escape($_("techsheet.encourage"))}</span></p></div> <div><h5 class="svelte-1lw7ke">${escape($_("techsheet.made-by"))}</h5> <ul class="text-xs"><li><span class="font-medium" data-svelte-h="svelte-1po971f">Flávia Marinho</span> (${escape($_("techsheet.roles.flavia"))})</li> <li><span class="font-medium" data-svelte-h="svelte-gnyq50">Otávio Burin</span> (${escape($_("techsheet.roles.otavio"))})</li> <li><span class="font-medium" data-svelte-h="svelte-js96a2">Italo Oliveira</span> (${escape($_("techsheet.roles.italo"))})</li> <li><span class="font-medium" data-svelte-h="svelte-f1sz9s">Quintino Andrade</span> (${escape($_("techsheet.roles.quintino"))})</li> <li><span class="font-medium" data-svelte-h="svelte-1wvsova">Ludmila Souza</span> (${escape($_("techsheet.roles.ludmila"))})</li> <li><span class="font-medium" data-svelte-h="svelte-kjcu9f">Gabriel Maciel</span> (${escape($_("techsheet.roles.gabriel"))})</li></ul></div> <div data-svelte-h="svelte-1nh53s1"><a href="https://datadotestudio.com/" target="_blank">datadot.com.br</a></div></div></div></div></div> </div>`;
});
const Onboarding = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $contentKeyIdx, $$unsubscribe_contentKeyIdx;
  let $ongoing, $$unsubscribe_ongoing;
  let $$unsubscribe_width;
  let $_, $$unsubscribe__;
  $$unsubscribe_contentKeyIdx = subscribe(contentKeyIdx, (value) => $contentKeyIdx = value);
  $$unsubscribe_ongoing = subscribe(ongoing, (value) => $ongoing = value);
  $$unsubscribe_width = subscribe(width, (value) => value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  const CONFIG = {
    fadeoutDuration: 0.15,
    fadeoutOpacity: 0.1,
    offset: 12
  };
  const tl = gsap.timeline({ overwrite: true });
  let outer;
  let inner;
  let init = false;
  let index;
  let prvStep;
  let curStep;
  let steps;
  let el;
  function updateStep() {
    const curSettings = steps[index];
    prvStep = curStep;
    curStep = curSettings ? {
      index,
      position: void 0,
      settings: curSettings
    } : void 0;
    if (curStep) triggerFadeOut();
  }
  function triggerFadeOut() {
    const toFadeOut = el.filter((d) => d !== curStep.settings.highlight).join(", ");
    applyFadeOutAnimation(toFadeOut);
    if (prvStep) applyPreviousStepFadeOut(prvStep);
    tl.call(() => contentKeyIdx.set(index));
  }
  function applyFadeOutAnimation(toFadeOut) {
    tl.to(toFadeOut, {
      opacity: CONFIG.fadeoutOpacity,
      duration: CONFIG.fadeoutDuration
    });
  }
  function applyPreviousStepFadeOut(prevStep) {
    const { position, settings } = prevStep;
    tl.to(
      inner,
      {
        x: position.xOffset * 2,
        y: position.yOffset * 2,
        opacity: 0,
        duration: CONFIG.fadeoutDuration
      },
      "<"
    );
    if (settings.onLeave) {
      tl.call(settings.onLeave, [], "<");
    }
  }
  {
    if ($ongoing && !init) {
      init = true;
      index = 0;
      const asset = PIXI.Assets.get("cursor");
      const sprite = new PIXI.Sprite(asset);
      sprite.renderable = false;
      sprite.name = "cursor";
      const parent = get_store_value(app).stage.getChildByName("vis-container", true);
      parent.addChild(sprite);
      updateStep();
    }
  }
  $$unsubscribe_contentKeyIdx();
  $$unsubscribe_ongoing();
  $$unsubscribe_width();
  $$unsubscribe__();
  return `${$ongoing ? `  <section id="onboarding-layer" class="absolute top-0 left-0 w-full h-full z-50"><div id="onboarding" class="absolute"${add_attribute("this", outer, 0)}><article id="panel" class="opacity-0 w-[75vw] md:min-w-24 md:max-w-80 my-0 mx-auto pt-4 pb-3 px-4 bg-dark-gray flex flex-col gap-3 shadow"${add_attribute("this", inner, 0)}><div class="flex justify-between h-6"><button class="p-0 w-6" data-svelte-h="svelte-bupgv5"><svg width="100%" height="100%" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><g class="stroke-white hover:opacity-60 transition-colors" stroke-miterlimit="10" stroke-linecap="round"><path d="M10.1 19.2C15.1258 19.2 19.2 15.1258 19.2 10.1C19.2 5.07421 15.1258 1 10.1 1C5.07421 1 1 5.07421 1 10.1C1 15.1258 5.07421 19.2 10.1 19.2Z" fill="transparent"></path><path d="M5.7998 5.7998L14.3998 14.3998"></path><path d="M14.3998 5.7998L5.7998 14.3998"></path></g></svg></button></div>  <div class="p-0">${each(steps, (step, i) => {
    return `<p class="${"text-white " + escape(i === $contentKeyIdx ? "block" : "hidden", true)}"><!-- HTML_TAG_START -->${$_(step.contentKey)}<!-- HTML_TAG_END --> </p>`;
  })}</div>  <div class="pt-1.5 px-0 flex justify-between gap-4"><button class="onboarding-nav">${escape($_(index === 0 ? "onboarding.panel.skip" : "onboarding.panel.back"))}</button> <button class="onboarding-nav">${escape($_("onboarding.panel.next"))}</button></div></article></div></section>` : ``}`;
});
const Renderer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_pixelRatio;
  $$unsubscribe_pixelRatio = subscribe(pixelRatio, (value) => value);
  let canvas;
  PIXI.Assets.add({
    alias: "petal",
    src: "/sprites/petal.png"
  });
  PIXI.Assets.add({
    alias: "cursor",
    src: "/sprites/cursor.png"
  });
  PIXI.Assets.add({
    alias: "soundFX",
    src: "/sprites/sound-fx.json"
  });
  PIXI.Assets.load("petal");
  PIXI.Assets.load("cursor");
  PIXI.Assets.load("soundFX");
  $$unsubscribe_pixelRatio();
  return `<canvas id="canvas" class="absolute top-0 left-0 w-full h-full"${add_attribute("this", canvas, 0)}></canvas>`;
});
const css$5 = {
  code: '.text-input.svelte-w9go3q.svelte-w9go3q{border:1px #ccc solid;border-radius:5px;padding:3px;width:60px;margin:0}.color-picker.svelte-w9go3q.svelte-w9go3q{display:flex;flex-direction:row;justify-content:space-between;height:90px}.color-selectors.svelte-w9go3q.svelte-w9go3q{display:flex;flex-direction:column;justify-content:space-between}.color-component.svelte-w9go3q.svelte-w9go3q{display:flex;flex-direction:row;font-size:12px;align-items:center;justify-content:center}.color-component.svelte-w9go3q strong.svelte-w9go3q{width:40px}.color-component.svelte-w9go3q input[type="range"].svelte-w9go3q{margin:0 0 0 10px}.color-component.svelte-w9go3q input[type="number"].svelte-w9go3q{width:50px;margin:0 0 0 10px}.color-preview.svelte-w9go3q.svelte-w9go3q{font-size:12px;display:flex;flex-direction:column;align-items:center;justify-content:space-between}.preview.svelte-w9go3q.svelte-w9go3q{height:60px;width:60px}',
  map: '{"version":3,"file":"ColorPicker.svelte","sources":["ColorPicker.svelte"],"sourcesContent":["<script>\\n  import { createEventDispatcher } from \\"svelte\\";\\n\\n  // Create event dispatcher\\n  const dispatch = createEventDispatcher();\\n\\n  export let color;\\n\\n  let red = 0;\\n  let green = 0;\\n  let blue = 0;\\n  let rgba = null;\\n  let hex = null;\\n\\n  const parseColor = input => {\\n    if (typeof input !== \\"string\\") {\\n      return;\\n    }\\n\\n    let colorComponents = [];\\n\\n    if (input[0] === \\"#\\") {\\n      colorComponents =\\n        input.length === 4\\n          ? [input.slice(1, 2), input.slice(2, 3), input.slice(3, 4)].map(n =>\\n              parseInt(`${n}${n}`, 16)\\n            )\\n          : [input.slice(1, 3), input.slice(3, 5), input.slice(5, 7)].map(n =>\\n              parseInt(n, 16)\\n            );\\n    } else if (input.startsWith(\\"rgb\\")) {\\n      colorComponents = input.match(/\\\\d+/g).map(n => parseInt(n));\\n    }\\n\\n    if (colorComponents.length) {\\n      red = colorComponents[0];\\n      green = colorComponents[1];\\n      blue = colorComponents[2];\\n    }\\n  };\\n\\n  $: parseColor(color);\\n\\n  $: {\\n    dispatch(\\"color\\", {\\n      hex,\\n      rgb\\n    });\\n  }\\n\\n  $: rgb = `rgb(${red}, ${green}, ${blue})`;\\n\\n  $: hex =\\n    \\"#\\" +\\n    (red | (1 << 8)).toString(16).slice(1) +\\n    (green | (1 << 8)).toString(16).slice(1) +\\n    (blue | (1 << 8)).toString(16).slice(1);\\n<\/script>\\n\\n<style>\\n  .text-input {\\n    border: 1px #ccc solid;\\n    border-radius: 5px;\\n    padding: 3px;\\n    width: 60px;\\n    margin: 0;\\n  }\\n\\n  .color-picker {\\n    display: flex;\\n    flex-direction: row;\\n    justify-content: space-between;\\n    height: 90px;\\n  }\\n\\n  .color-selectors {\\n    display: flex;\\n    flex-direction: column;\\n    justify-content: space-between;\\n  }\\n\\n  .color-component {\\n    display: flex;\\n    flex-direction: row;\\n    font-size: 12px;\\n    align-items: center;\\n    justify-content: center;\\n  }\\n\\n  .color-component strong {\\n    width: 40px;\\n  }\\n\\n  .color-component input[type=\\"range\\"] {\\n    margin: 0 0 0 10px;\\n  }\\n\\n  .color-component input[type=\\"number\\"] {\\n    width: 50px;\\n    margin: 0 0 0 10px;\\n  }\\n\\n  .color-preview {\\n    font-size: 12px;\\n    display: flex;\\n    flex-direction: column;\\n    align-items: center;\\n    justify-content: space-between;\\n  }\\n\\n  .preview {\\n    height: 60px;\\n    width: 60px;\\n  }\\n</style>\\n\\n<div class=\\"color-picker\\">\\n  <div class=\\"color-selectors\\">\\n    <div class=\\"color-component\\">\\n      <strong>Red</strong>\\n      <input type=\\"range\\" min=\\"0\\" max=\\"255\\" bind:value={red} />\\n      <input class=\\"text-input\\" type=\\"number\\" bind:value={red} />\\n    </div>\\n    <div class=\\"color-component\\">\\n      <strong>Green</strong>\\n      <input type=\\"range\\" min=\\"0\\" max=\\"255\\" bind:value={green} />\\n      <input class=\\"text-input\\" type=\\"number\\" bind:value={green} />\\n    </div>\\n    <div class=\\"color-component\\">\\n      <strong>Blue</strong>\\n      <input type=\\"range\\" min=\\"0\\" max=\\"255\\" bind:value={blue} />\\n      <input class=\\"text-input\\" type=\\"number\\" bind:value={blue} />\\n    </div>\\n  </div>\\n  <div class=\\"color-preview\\">\\n    <div class=\\"preview\\" style=\\"background: {rgb}\\" />\\n    <div>\\n      <input\\n        class=\\"text-input\\"\\n        type=\\"text\\"\\n        value={hex}\\n        on:change={e => parseColor(e.target.value)} />\\n    </div>\\n  </div>\\n</div>\\n"],"names":[],"mappings":"AA4DE,uCAAY,CACV,MAAM,CAAE,GAAG,CAAC,IAAI,CAAC,KAAK,CACtB,aAAa,CAAE,GAAG,CAClB,OAAO,CAAE,GAAG,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CACV,CAEA,yCAAc,CACZ,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,eAAe,CAAE,aAAa,CAC9B,MAAM,CAAE,IACV,CAEA,4CAAiB,CACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,eAAe,CAAE,aACnB,CAEA,4CAAiB,CACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,IAAI,CACf,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,MACnB,CAEA,8BAAgB,CAAC,oBAAO,CACtB,KAAK,CAAE,IACT,CAEA,8BAAgB,CAAC,KAAK,CAAC,IAAI,CAAC,OAAO,eAAE,CACnC,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAChB,CAEA,8BAAgB,CAAC,KAAK,CAAC,IAAI,CAAC,QAAQ,eAAE,CACpC,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAChB,CAEA,0CAAe,CACb,SAAS,CAAE,IAAI,CACf,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,aACnB,CAEA,oCAAS,CACP,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IACT"}'
};
const ColorPicker = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let rgb;
  const dispatch = createEventDispatcher();
  let { color } = $$props;
  let red = 0;
  let green = 0;
  let blue = 0;
  let hex = null;
  const parseColor = (input) => {
    if (typeof input !== "string") {
      return;
    }
    let colorComponents = [];
    if (input[0] === "#") {
      colorComponents = input.length === 4 ? [input.slice(1, 2), input.slice(2, 3), input.slice(3, 4)].map((n) => parseInt(`${n}${n}`, 16)) : [input.slice(1, 3), input.slice(3, 5), input.slice(5, 7)].map((n) => parseInt(n, 16));
    } else if (input.startsWith("rgb")) {
      colorComponents = input.match(/\d+/g).map((n) => parseInt(n));
    }
    if (colorComponents.length) {
      red = colorComponents[0];
      green = colorComponents[1];
      blue = colorComponents[2];
    }
  };
  if ($$props.color === void 0 && $$bindings.color && color !== void 0) $$bindings.color(color);
  $$result.css.add(css$5);
  {
    parseColor(color);
  }
  hex = "#" + (red | 1 << 8).toString(16).slice(1) + (green | 1 << 8).toString(16).slice(1) + (blue | 1 << 8).toString(16).slice(1);
  rgb = `rgb(${red}, ${green}, ${blue})`;
  {
    {
      dispatch("color", { hex, rgb });
    }
  }
  return `<div class="color-picker svelte-w9go3q"><div class="color-selectors svelte-w9go3q"><div class="color-component svelte-w9go3q"><strong class="svelte-w9go3q" data-svelte-h="svelte-1t5qv47">Red</strong> <input type="range" min="0" max="255" class="svelte-w9go3q"${add_attribute("value", red, 0)}> <input class="text-input svelte-w9go3q" type="number"${add_attribute("value", red, 0)}></div> <div class="color-component svelte-w9go3q"><strong class="svelte-w9go3q" data-svelte-h="svelte-603a6r">Green</strong> <input type="range" min="0" max="255" class="svelte-w9go3q"${add_attribute("value", green, 0)}> <input class="text-input svelte-w9go3q" type="number"${add_attribute("value", green, 0)}></div> <div class="color-component svelte-w9go3q"><strong class="svelte-w9go3q" data-svelte-h="svelte-u094rs">Blue</strong> <input type="range" min="0" max="255" class="svelte-w9go3q"${add_attribute("value", blue, 0)}> <input class="text-input svelte-w9go3q" type="number"${add_attribute("value", blue, 0)}></div></div> <div class="color-preview svelte-w9go3q"><div class="preview svelte-w9go3q" style="${"background: " + escape(rgb, true)}"></div> <div><input class="text-input svelte-w9go3q" type="text"${add_attribute("value", hex, 0)}></div></div></div>`;
});
const css$4 = {
  code: "h4.svelte-1gm5gmt{font-size:0.85rem;padding:5px;margin:0}.property.svelte-1gm5gmt{display:flex;flex-direction:row;font-size:0.75rem;align-items:center;justify-content:space-between;padding:3px 5px}.label.svelte-1gm5gmt{display:block;color:#999}.value.svelte-1gm5gmt{display:block;color:#666}",
  map: '{"version":3,"file":"Info.svelte","sources":["Info.svelte"],"sourcesContent":["<script>\\n  export let animationData;\\n\\n  let author;\\n  let frameRate;\\n  let generator;\\n  let keywords;\\n  let numAssets;\\n  let numFonts;\\n  let numFrames;\\n  let numLayers;\\n  let themeColor;\\n  let version;\\n  let hasMeta = false;\\n\\n  $: {\\n    if (animationData) {\\n      frameRate = animationData.fr;\\n      numAssets = animationData.assets ? animationData.assets.length : 0;\\n      numFonts = animationData.fonts ? animationData.fonts.length : 0;\\n      numFrames = animationData.op - animationData.ip;\\n      numLayers = animationData.layers ? animationData.layers.length : 0;\\n      version = animationData.v;\\n\\n      if (animationData.meta) {\\n        hasMeta = true;\\n        author = animationData.meta.a;\\n        generator = animationData.meta.g;\\n        keywords = animationData.meta.k;\\n        themeColor = animationData.meta.tc;\\n      }\\n    }\\n  }\\n<\/script>\\n\\n<style>\\n  h4 {\\n    font-size: 0.85rem;\\n    padding: 5px;\\n    margin: 0;\\n  }\\n  .property {\\n    display: flex;\\n    flex-direction: row;\\n    font-size: 0.75rem;\\n    align-items: center;\\n    justify-content: space-between;\\n    padding: 3px 5px;\\n  }\\n\\n  .label {\\n    display: block;\\n    color: #999;\\n  }\\n\\n  .value {\\n    display: block;\\n    color: #666;\\n  }\\n</style>\\n\\n<h4>Info</h4>\\n\\n{#if version}\\n  <div class=\\"property\\">\\n    <span class=\\"label\\">Lottie Version</span>\\n    <span class=\\"value\\">{version}</span>\\n  </div>\\n{/if}\\n\\n{#if numFrames}\\n  <div class=\\"property\\">\\n    <span class=\\"label\\">Frames</span>\\n    <span class=\\"value\\">{numFrames}</span>\\n  </div>\\n{/if}\\n\\n{#if frameRate}\\n  <div class=\\"property\\">\\n    <span class=\\"label\\">Frame Rate</span>\\n    <span class=\\"value\\">{frameRate}</span>\\n  </div>\\n{/if}\\n\\n{#if numLayers}\\n  <div class=\\"property\\">\\n    <span class=\\"label\\">Layers</span>\\n    <span class=\\"value\\">{numLayers}</span>\\n  </div>\\n{/if}\\n\\n{#if numAssets}\\n  <div class=\\"property\\">\\n    <span class=\\"label\\">Assets</span>\\n    <span class=\\"value\\">{numAssets}</span>\\n  </div>\\n{/if}\\n\\n{#if numFonts}\\n  <div class=\\"property\\">\\n    <span class=\\"label\\">Fonts</span>\\n    <span class=\\"value\\">{numFonts}</span>\\n  </div>\\n{/if}\\n\\n{#if hasMeta}\\n  <hr />\\n\\n  {#if generator}\\n    <div class=\\"property\\">\\n      <span class=\\"label\\">Generator</span>\\n      <span class=\\"value\\">{generator}</span>\\n    </div>\\n  {/if}\\n\\n  {#if author}\\n    <div class=\\"property\\">\\n      <span class=\\"label\\">Author</span>\\n      <span class=\\"value\\">{author}</span>\\n    </div>\\n  {/if}\\n\\n  {#if keywords}\\n    <div class=\\"property\\">\\n      <span class=\\"label\\">Keywords</span>\\n      <span class=\\"value\\">{keywords}</span>\\n    </div>\\n  {/if}\\n\\n  {#if themeColor}\\n    <div class=\\"property\\">\\n      <span class=\\"label\\">Theme Color</span>\\n      <span class=\\"value\\">{themeColor}</span>\\n    </div>\\n  {/if}\\n{/if}\\n"],"names":[],"mappings":"AAoCE,iBAAG,CACD,SAAS,CAAE,OAAO,CAClB,OAAO,CAAE,GAAG,CACZ,MAAM,CAAE,CACV,CACA,wBAAU,CACR,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,GAAG,CACnB,SAAS,CAAE,OAAO,CAClB,WAAW,CAAE,MAAM,CACnB,eAAe,CAAE,aAAa,CAC9B,OAAO,CAAE,GAAG,CAAC,GACf,CAEA,qBAAO,CACL,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IACT,CAEA,qBAAO,CACL,OAAO,CAAE,KAAK,CACd,KAAK,CAAE,IACT"}'
};
const Info = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { animationData } = $$props;
  let author;
  let frameRate;
  let generator;
  let keywords;
  let numAssets;
  let numFonts;
  let numFrames;
  let numLayers;
  let themeColor;
  let version;
  let hasMeta = false;
  if ($$props.animationData === void 0 && $$bindings.animationData && animationData !== void 0) $$bindings.animationData(animationData);
  $$result.css.add(css$4);
  {
    {
      if (animationData) {
        frameRate = animationData.fr;
        numAssets = animationData.assets ? animationData.assets.length : 0;
        numFonts = animationData.fonts ? animationData.fonts.length : 0;
        numFrames = animationData.op - animationData.ip;
        numLayers = animationData.layers ? animationData.layers.length : 0;
        version = animationData.v;
        if (animationData.meta) {
          hasMeta = true;
          author = animationData.meta.a;
          generator = animationData.meta.g;
          keywords = animationData.meta.k;
          themeColor = animationData.meta.tc;
        }
      }
    }
  }
  return `<h4 class="svelte-1gm5gmt" data-svelte-h="svelte-11vwzdi">Info</h4> ${version ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-140olyo">Lottie Version</span> <span class="value svelte-1gm5gmt">${escape(version)}</span></div>` : ``} ${numFrames ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-t3mwqp">Frames</span> <span class="value svelte-1gm5gmt">${escape(numFrames)}</span></div>` : ``} ${frameRate ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-gz9x0y">Frame Rate</span> <span class="value svelte-1gm5gmt">${escape(frameRate)}</span></div>` : ``} ${numLayers ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-1xevuc9">Layers</span> <span class="value svelte-1gm5gmt">${escape(numLayers)}</span></div>` : ``} ${numAssets ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-6uf78y">Assets</span> <span class="value svelte-1gm5gmt">${escape(numAssets)}</span></div>` : ``} ${numFonts ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-195sn5x">Fonts</span> <span class="value svelte-1gm5gmt">${escape(numFonts)}</span></div>` : ``} ${hasMeta ? `<hr> ${generator ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-14vtnfc">Generator</span> <span class="value svelte-1gm5gmt">${escape(generator)}</span></div>` : ``} ${author ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-1r8juj4">Author</span> <span class="value svelte-1gm5gmt">${escape(author)}</span></div>` : ``} ${keywords ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-5f12vj">Keywords</span> <span class="value svelte-1gm5gmt">${escape(keywords)}</span></div>` : ``} ${themeColor ? `<div class="property svelte-1gm5gmt"><span class="label svelte-1gm5gmt" data-svelte-h="svelte-1csv89t">Theme Color</span> <span class="value svelte-1gm5gmt">${escape(themeColor)}</span></div>` : ``}` : ``}`;
});
const css$3 = {
  code: '.popover.svelte-cq7jp3.svelte-cq7jp3{position:relative}.popover-content.svelte-cq7jp3.svelte-cq7jp3{display:inline-block;position:absolute;opacity:1;visibility:visible;transform:translate(0, -10px);box-shadow:0 2px 5px 0 rgba(0, 0, 0, 0.26);transition:all 0.3s cubic-bezier(0.75, -0.02, 0.2, 0.97)}.popover-content.hidden.svelte-cq7jp3.svelte-cq7jp3{opacity:0;visibility:hidden;transform:translate(0, 0px)}.arrow.svelte-cq7jp3.svelte-cq7jp3{position:absolute;z-index:-1;content:"";bottom:-9px;border-style:solid;border-width:10px 10px 0px 10px}.left-align.svelte-cq7jp3.svelte-cq7jp3,.left-align.svelte-cq7jp3 .arrow.svelte-cq7jp3{left:0;right:unset}.right-align.svelte-cq7jp3.svelte-cq7jp3,.right-align.svelte-cq7jp3 .arrow.svelte-cq7jp3{right:0;left:unset}',
  map: '{"version":3,"file":"Popover.svelte","sources":["Popover.svelte"],"sourcesContent":["<script>\\n  import { onMount } from \\"svelte\\";\\n\\n  export let color = \\"transparent\\";\\n\\n  let _triggerRef;\\n  let _contentRef;\\n  let _alignment;\\n  let _open = true;\\n\\n  onMount(() => {\\n    const triggerBounds = _triggerRef.getBoundingClientRect();\\n    const contentBounds = _contentRef.getBoundingClientRect();\\n\\n    _alignment =\\n      triggerBounds.left + contentBounds.width > window.innerWidth ? -1 : 0;\\n\\n    _contentRef.style.bottom = triggerBounds.height + \\"px\\";\\n\\n    // Start with content box hidden\\n    hide();\\n  });\\n\\n  /**\\n   * Show content box\\n   */\\n  const show = () => {\\n    _open = true;\\n  };\\n\\n  /**\\n   * Hide content box\\n   */\\n  const hide = () => {\\n    _open = false;\\n  };\\n<\/script>\\n\\n<style>\\n  .popover {\\n    position: relative;\\n  }\\n\\n  .popover-content {\\n    display: inline-block;\\n    position: absolute;\\n    opacity: 1;\\n    visibility: visible;\\n    transform: translate(0, -10px);\\n    box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);\\n    transition: all 0.3s cubic-bezier(0.75, -0.02, 0.2, 0.97);\\n  }\\n\\n  .popover-content.hidden {\\n    opacity: 0;\\n    visibility: hidden;\\n    transform: translate(0, 0px);\\n  }\\n\\n  .arrow {\\n    position: absolute;\\n    z-index: -1;\\n    content: \\"\\";\\n    bottom: -9px;\\n    border-style: solid;\\n    border-width: 10px 10px 0px 10px;\\n  }\\n\\n  .left-align,\\n  .left-align .arrow {\\n    left: 0;\\n    right: unset;\\n  }\\n\\n  .right-align,\\n  .right-align .arrow {\\n    right: 0;\\n    left: unset;\\n  }\\n</style>\\n\\n<div\\n  class=\\"popover\\"\\n  on:mousedown\\n  on:mouseover={show}\\n  on:mouseout={hide}\\n  on:mouseup\\n  on:mousewheel>\\n  <div bind:this={_triggerRef}>\\n    <slot name=\\"target\\" />\\n  </div>\\n  <div\\n    class=\\"popover-content\\"\\n    bind:this={_contentRef}\\n    class:hidden={!_open}\\n    class:left-align={_alignment !== -1}\\n    class:right-align={_alignment === -1}>\\n    <slot name=\\"content\\" />\\n    <div\\n      class=\\"arrow\\"\\n      style=\\"border-color: {color} transparent transparent transparent;\\" />\\n  </div>\\n</div>\\n"],"names":[],"mappings":"AAuCE,oCAAS,CACP,QAAQ,CAAE,QACZ,CAEA,4CAAiB,CACf,OAAO,CAAE,YAAY,CACrB,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,OAAO,CACnB,SAAS,CAAE,UAAU,CAAC,CAAC,CAAC,KAAK,CAAC,CAC9B,UAAU,CAAE,CAAC,CAAC,GAAG,CAAC,GAAG,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,IAAI,CAAC,CAC3C,UAAU,CAAE,GAAG,CAAC,IAAI,CAAC,aAAa,IAAI,CAAC,CAAC,KAAK,CAAC,CAAC,GAAG,CAAC,CAAC,IAAI,CAC1D,CAEA,gBAAgB,mCAAQ,CACtB,OAAO,CAAE,CAAC,CACV,UAAU,CAAE,MAAM,CAClB,SAAS,CAAE,UAAU,CAAC,CAAC,CAAC,GAAG,CAC7B,CAEA,kCAAO,CACL,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,EAAE,CACX,OAAO,CAAE,EAAE,CACX,MAAM,CAAE,IAAI,CACZ,YAAY,CAAE,KAAK,CACnB,YAAY,CAAE,IAAI,CAAC,IAAI,CAAC,GAAG,CAAC,IAC9B,CAEA,uCAAW,CACX,yBAAW,CAAC,oBAAO,CACjB,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,KACT,CAEA,wCAAY,CACZ,0BAAY,CAAC,oBAAO,CAClB,KAAK,CAAE,CAAC,CACR,IAAI,CAAE,KACR"}'
};
const Popover = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { color = "transparent" } = $$props;
  let _triggerRef;
  let _contentRef;
  if ($$props.color === void 0 && $$bindings.color && color !== void 0) $$bindings.color(color);
  $$result.css.add(css$3);
  return `<div class="popover svelte-cq7jp3"><div${add_attribute("this", _triggerRef, 0)}>${slots.target ? slots.target({}) : ``}</div> <div class="${[
    "popover-content svelte-cq7jp3",
    " left-align "
  ].join(" ").trim()}"${add_attribute("this", _contentRef, 0)}>${slots.content ? slots.content({}) : ``} <div class="arrow svelte-cq7jp3" style="${"border-color: " + escape(color, true) + " transparent transparent transparent;"}"></div></div></div>`;
});
const PlayerRender = {
  SVG: "svg",
  Canvas: "canvas"
};
const PlayerState = {
  Loading: "loading",
  Playing: "playing",
  Paused: "paused",
  Stopped: "stopped",
  Frozen: "frozen",
  Error: "error"
};
const PlayMode = {
  Normal: "normal",
  Bounce: "bounce"
};
const ControlsLayoutOptions = [
  "previousFrame",
  "playpause",
  "stop",
  "nextFrame",
  "progress",
  "frame",
  "loop",
  "spacer",
  "background",
  "snapshot",
  "info",
  "zoom"
];
const triggerDownload = (dataUri, filename) => {
  const element = document.createElement("a");
  element.href = dataUri;
  element.download = filename;
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
const css$2 = {
  code: ".lottie-player-controls.svelte-9yox50.svelte-9yox50{align-items:center;display:flex;justify-content:space-between;padding:4px 8px;font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana,\n      sans-serif !important}.lottie-player-controls.svelte-9yox50>div.svelte-9yox50{margin-left:4px}.spacer.svelte-9yox50.svelte-9yox50{flex-grow:1;width:14px}.btn.svelte-9yox50.svelte-9yox50{cursor:pointer;fill:#999;width:14px}.btn.svelte-9yox50.svelte-9yox50:hover{fill:#222}.btn.active.svelte-9yox50.svelte-9yox50{fill:#555}.progress.svelte-9yox50.svelte-9yox50{-webkit-appearance:none;-moz-apperance:none;width:100%;margin:0 10px;height:4px;border-radius:3px;cursor:pointer}.progress.svelte-9yox50.svelte-9yox50:focus{outline:none;border:none}.progress.svelte-9yox50.svelte-9yox50::-moz-range-track{cursor:pointer;background:none;border:none;outline:none}.progress.svelte-9yox50.svelte-9yox50::-webkit-slider-thumb{-webkit-appearance:none !important;height:13px;width:13px;border:0;border-radius:50%;background:#0fccce;cursor:pointer}.progress.svelte-9yox50.svelte-9yox50::-moz-range-thumb{-moz-appearance:none !important;height:13px;width:13px;border:0;border-radius:50%;background:#0fccce;cursor:pointer}.progress.svelte-9yox50.svelte-9yox50::-ms-track{width:100%;height:3px;cursor:pointer;background:transparent;border-color:transparent;color:transparent}.progress.svelte-9yox50.svelte-9yox50::-ms-fill-lower{background:#ccc;border-radius:3px}.progress.svelte-9yox50.svelte-9yox50::-ms-fill-upper{background:#ccc;border-radius:3px}.progress.svelte-9yox50.svelte-9yox50::-ms-thumb{border:0;height:15px;width:15px;border-radius:50%;background:#0fccce;cursor:pointer}.progress.svelte-9yox50.svelte-9yox50:focus::-ms-fill-lower{background:#ccc}.progress.svelte-9yox50.svelte-9yox50:focus::-ms-fill-upper{background:#ccc}.popover.svelte-9yox50.svelte-9yox50{padding:10px;background:#fff;font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana,\n      sans-serif;font-size:0.75rem;border-radius:5px}.popover-snapshot.svelte-9yox50.svelte-9yox50{width:150px}.popover-snapshot.svelte-9yox50 h5.svelte-9yox50{margin:5px 0 10px 0;font-size:0.75rem}.popover-snapshot.svelte-9yox50 a.svelte-9yox50{display:block;text-decoration:none}.popover-snapshot.svelte-9yox50 a.svelte-9yox50:before{content:'⥼';margin-right:5px}.popover-snapshot.svelte-9yox50 .note.svelte-9yox50{display:block;margin-top:10px;color:#999}.popover-info.svelte-9yox50.svelte-9yox50{width:250px}.frame-number.svelte-9yox50.svelte-9yox50{outline:none;border:1px #ccc solid;border-radius:3px;width:40px;text-align:center;color:#999;font-size:0.7rem;padding:0;font-family:inherit}.popover-background.svelte-9yox50.svelte-9yox50{width:350px}",
  map: `{"version":3,"file":"Controls.svelte","sources":["Controls.svelte"],"sourcesContent":["<style>\\n  .lottie-player-controls {\\n    align-items: center;\\n    display: flex;\\n    justify-content: space-between;\\n    padding: 4px 8px;\\n    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana,\\n      sans-serif !important;\\n  }\\n\\n  .lottie-player-controls > div {\\n    margin-left: 4px;\\n  }\\n\\n  .spacer {\\n    flex-grow: 1;\\n    width: 14px;\\n  }\\n\\n  .btn {\\n    cursor: pointer;\\n    fill: #999;\\n    width: 14px;\\n  }\\n\\n  .btn:hover {\\n    fill: #222;\\n  }\\n\\n  .btn.active {\\n    fill: #555;\\n  }\\n\\n  .progress {\\n    -webkit-appearance: none;\\n    -moz-apperance: none;\\n    width: 100%;\\n    margin: 0 10px;\\n    height: 4px;\\n    border-radius: 3px;\\n    cursor: pointer;\\n  }\\n  .progress:focus {\\n    outline: none;\\n    border: none;\\n  }\\n  .progress::-moz-range-track {\\n    cursor: pointer;\\n    background: none;\\n    border: none;\\n    outline: none;\\n  }\\n  .progress::-webkit-slider-thumb {\\n    -webkit-appearance: none !important;\\n    height: 13px;\\n    width: 13px;\\n    border: 0;\\n    border-radius: 50%;\\n    background: #0fccce;\\n    cursor: pointer;\\n  }\\n  .progress::-moz-range-thumb {\\n    -moz-appearance: none !important;\\n    height: 13px;\\n    width: 13px;\\n    border: 0;\\n    border-radius: 50%;\\n    background: #0fccce;\\n    cursor: pointer;\\n  }\\n  .progress::-ms-track {\\n    width: 100%;\\n    height: 3px;\\n    cursor: pointer;\\n    background: transparent;\\n    border-color: transparent;\\n    color: transparent;\\n  }\\n  .progress::-ms-fill-lower {\\n    background: #ccc;\\n    border-radius: 3px;\\n  }\\n  .progress::-ms-fill-upper {\\n    background: #ccc;\\n    border-radius: 3px;\\n  }\\n  .progress::-ms-thumb {\\n    border: 0;\\n    height: 15px;\\n    width: 15px;\\n    border-radius: 50%;\\n    background: #0fccce;\\n    cursor: pointer;\\n  }\\n  .progress:focus::-ms-fill-lower {\\n    background: #ccc;\\n  }\\n  .progress:focus::-ms-fill-upper {\\n    background: #ccc;\\n  }\\n\\n  .popover {\\n    padding: 10px;\\n    background: #fff;\\n    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana,\\n      sans-serif;\\n    font-size: 0.75rem;\\n    border-radius: 5px;\\n  }\\n\\n  .popover-snapshot {\\n    width: 150px;\\n  }\\n  .popover-snapshot h5 {\\n    margin: 5px 0 10px 0;\\n    font-size: 0.75rem;\\n  }\\n  .popover-snapshot a {\\n    display: block;\\n    text-decoration: none;\\n  }\\n  .popover-snapshot a:before {\\n    content: '⥼';\\n    margin-right: 5px;\\n  }\\n  .popover-snapshot .note {\\n    display: block;\\n    margin-top: 10px;\\n    color: #999;\\n  }\\n\\n  .popover-info {\\n    width: 250px;\\n  }\\n\\n  .frame-number {\\n    outline: none;\\n    border: 1px #ccc solid;\\n    border-radius: 3px;\\n    width: 40px;\\n    text-align: center;\\n    color: #999;\\n    font-size: 0.7rem;\\n    padding: 0;\\n    font-family: inherit;\\n  }\\n\\n  .popover-background {\\n    width: 350px;\\n  }\\n</style>\\n\\n<script>\\n  import { createEventDispatcher } from 'svelte';\\n\\n  import ColorPicker from './ColorPicker.svelte';\\n  import Info from './Info.svelte';\\n  import Popover from './Popover.svelte';\\n  import { ControlsLayoutOptions, PlayerState } from './utils';\\n\\n  // Define icon size\\n  const ICON_SIZE = { width: 14, height: 14, viewBox: '0 0 24 24' };\\n\\n  // Create event dispatcher\\n  const dispatch = createEventDispatcher();\\n\\n  export let animationData;\\n  export let background;\\n  export let currentState;\\n  export let frame;\\n  export let freeze;\\n  export let instance;\\n  export let layout = ControlsLayoutOptions;\\n  export let loop;\\n  export let play;\\n  export let progress;\\n  export let seek;\\n  export let snapshot;\\n  export let stop;\\n  export let toggleZoom;\\n  export let toggleLooping;\\n  export let togglePlay;\\n  export let totalFrames = 0;\\n\\n  let isZoomed = false;\\n\\n  $: isPlaying = currentState === PlayerState.Playing;\\n  $: isPaused = currentState === PlayerState.Paused;\\n  $: isStopped = currentState === PlayerState.Stopped;\\n  $: formattedFrame = Math.round(frame);\\n\\n  const onHandleSeekChange = e => {\\n    if (!instance || isNaN(e.target.value)) {\\n      return;\\n    }\\n\\n    const frame = (e.target.value / 100) * totalFrames;\\n\\n    seek(frame);\\n  };\\n\\n  const onSelectBackground = e => {\\n    dispatch('background', {\\n      color: e.detail.hex,\\n    });\\n  };\\n\\n  const onToggleZoom = () => {\\n    isZoomed = !isZoomed;\\n    toggleZoom();\\n  };\\n\\n  const onNextFrame = () => {\\n    const nextFrame = frame + 1;\\n    if (nextFrame <= totalFrames) {\\n      seek(nextFrame);\\n    }\\n  };\\n\\n  const oPreviousFrame = () => {\\n    const prevFrame = frame - 1;\\n    if (prevFrame >= 0) {\\n      seek(prevFrame);\\n    }\\n  };\\n<\/script>\\n\\n<div class=\\"lottie-player-controls\\">\\n  {#each layout as item}\\n    {#if item === 'playpause'}\\n      <div class=\\"btn\\" on:click=\\"{togglePlay}\\" class:active=\\"{isPlaying || isPaused}\\">\\n        {#if isPlaying}\\n          <svg {...ICON_SIZE}>\\n            <rect height=\\"22.9\\" rx=\\"1.9\\" width=\\"7.6\\" x=\\"14\\" y=\\".5\\"></rect>\\n            <rect height=\\"22.9\\" rx=\\"1.9\\" width=\\"7.6\\" x=\\"2\\" y=\\".5\\"></rect>\\n          </svg>\\n        {:else}\\n          <svg {...ICON_SIZE}>\\n            <path d=\\"M2 3.4C2 1.9 3.5 1 4.8 1.8l16.5 9.6c1.2.7 1.2 2.5 0 3.2L4.8 24.2C3.5 25 2 24.1 2 22.6V3.4z\\"></path>\\n          </svg>\\n        {/if}\\n      </div>\\n    {:else if item === 'stop'}\\n      <div class=\\"btn\\" on:click=\\"{stop}\\" class:active=\\"{isStopped}\\">\\n        <svg {...ICON_SIZE}>\\n          <path\\n            d=\\"M2 3.667A1.67 1.67 0 0 1 3.667 2h16.666A1.67 1.67 0 0 1 22 3.667v16.666A1.67 1.67 0 0 1 20.333\\n            22H3.667A1.67 1.67 0 0 1 2 20.333z\\"\\n          ></path>\\n        </svg>\\n      </div>\\n    {:else if item === 'progress'}\\n      <input\\n        class=\\" progress\\"\\n        type=\\"range\\"\\n        min=\\"0\\"\\n        step=\\"1\\"\\n        max=\\"100\\"\\n        bind:value=\\"{progress}\\"\\n        on:input=\\"{onHandleSeekChange}\\"\\n        on:mousedown=\\"{freeze}\\"\\n        on:mouseup=\\"{play}\\"\\n        style={\`\\n          background-image: -webkit-gradient(linear, left top, right top, color-stop(\${progress}%, rgba(15, 204, 206, 0.4)), color-stop(\${progress}%, #DAE1E7));\\n          background-image: -moz-linear-gradient(left center, rgba(15, 204, 206, 0.4) 0%, rgba(15, 204, 206, 0.4) \${progress}%, #DAE1E7 \${progress}%, #DAE1E7 100%);\\n        \`}\\n      />\\n    {:else if item === 'loop'}\\n      <div class=\\"btn\\" on:click=\\"{toggleLooping}\\" class:active=\\"{loop}\\">\\n        <svg {...ICON_SIZE}>\\n          <path\\n            d=\\"M12.5 16.8137h-.13v1.8939h4.9696c3.6455 0 6.6113-2.9658 6.6113-6.6116\\n            0-3.64549-2.9658-6.61131-6.6113-6.61131-.5231 0-.947.42391-.947.94696 0 .52304.4239.94696.947.94696 2.6011 0\\n            4.7174 2.11634 4.7174 4.71739 0 2.6014-2.1166 4.7177-4.7174 4.7177H12.5zM13.6025\\n            5.61469v-.13H7.48137C3.83582 5.48469.87 8.45051.87 12.096c0 3.6509 3.17269 6.6117 6.81304 6.6117.52304 0\\n            .94696-.424.94696-.947 0-.5231-.42392-.947-.94696-.947-2.60804 0-4.91907-2.1231-4.91907-4.7176 0-2.60115\\n            2.11634-4.71744 4.7174-4.71744h6.12113V5.61469z\\"\\n            stroke=\\"#8795A1\\"\\n            stroke-width=\\".26\\"\\n          ></path>\\n          <path\\n            d=\\"M11.1482\\n            2.20355h0l-.001-.00116c-.3412-.40061-.9405-.44558-1.33668-.0996h-.00001c-.39526.34519-.43936.94795-.09898\\n            1.34767l2.51487 3.03683-2.51894 3.06468c-.33872.40088-.29282 1.00363.10347\\n            1.34723l.08517-.0982-.08517.0982c.17853.1549.39807.2308.61647.2308.2671 0 .5328-.114.72-.3347h0l.0011-.0014\\n            3.0435-3.68655.0006-.00068c.3035-.35872.3025-.88754-.0019-1.24526l-3.0425-3.65786zM13.9453\\n            21.7965h0l.001.0011c.3413.4006.9407.4456 1.337.0996h0c.3953-.3452.4395-.9479.099-1.3477l-2.5154-3.0368\\n            2.5195-3.0647c.3388-.4008.2929-1.0036-.1035-1.3472l-.0852.0982.0852-.0982c-.1786-.1549-.3981-.2308-.6166-.2308-.2671\\n            0-.5329.114-.7202.3347h0l-.0011.0014-3.0442\\n            3.6865c-.0001.0003-.0003.0005-.0005.0007-.3036.3587-.3027.8876.0019 1.2453l3.0431 3.6579z\\"\\n            fill=\\"#8795A1\\"\\n            stroke=\\"#8795A1\\"\\n            stroke-width=\\".26\\"\\n          ></path>\\n        </svg>\\n      </div>\\n    {:else if item === 'background'}\\n      <div class=\\"\\">\\n        <Popover color=\\"#fff\\">\\n          <div class=\\"btn\\" slot=\\"target\\">\\n            <svg {...ICON_SIZE}>\\n              <path\\n                d=\\"M12 3.1L6.1 8.6a7.6 7.6 0 00-2.2 4 7.2 7.2 0 00.4 4.4 7.9 7.9 0 003 3.5 8.7 8.7 0 004.7 1.3c1.6 0\\n                3.2-.5 4.6-1.3s2.4-2 3-3.5a7.2 7.2 0 00.5-4.5 7.6 7.6 0 00-2.2-4L12 3.2zM12 0l7.5 7a9.8 9.8 0 013 5.1\\n                9.3 9.3 0 01-.6 5.8c-.9 1.8-2.2 3.3-4 4.4A11.2 11.2 0 0112 24a11.2 11.2 0\\n                01-6-1.7c-1.7-1-3-2.6-3.9-4.4a9.3 9.3 0 01-.6-5.8c.4-2 1.5-3.7 3-5L12 0zM6 14h12c0 1.5-.7 3-1.8 4s-2.6\\n                1.6-4.2 1.6S9 19 7.8 18s-1.7-2.5-1.7-4z\\"\\n              ></path>\\n            </svg>\\n          </div>\\n          <div slot=\\"content\\" class=\\"popover popover-background\\">\\n            <ColorPicker color=\\"{background}\\" on:color=\\"{onSelectBackground}\\" />\\n          </div>\\n        </Popover>\\n      </div>\\n    {:else if item === 'snapshot'}\\n      <div\\n        class=\\"\\"\\n        on:mouseout=\\"{() => currentState === PlayerState.Frozen && play()}\\"\\n        on:mouseover=\\"{() => currentState !== PlayerState.Paused && freeze()}\\"\\n      >\\n        <Popover color=\\"#fff\\" on:mousewheel=\\"{e => seek(frame + (e.deltaY > 0 ? -1 : 1))}\\">\\n          <div class=\\"btn\\" slot=\\"target\\">\\n            <svg {...ICON_SIZE}>\\n              <path\\n                clip-rule=\\"evenodd\\"\\n                d=\\"M0 3.01A2.983 2.983 0 012.983.027H16.99a2.983 2.983 0 012.983 2.983v14.008a2.982 2.982 0 01-2.983\\n                2.983H2.983A2.983 2.983 0 010 17.018zm2.983-.941a.941.941 0 00-.942.94v14.01c0\\n                .52.422.94.942.94H16.99a.94.94 0 00.941-.94V3.008a.941.941 0 00-.94-.94H2.981z\\"\\n                fill-rule=\\"evenodd\\"\\n              ></path>\\n              <path d=\\"M12.229 7.945l-2.07 4.598-2.586-2.605-2.414 2.758v2.146h9.656V11.93z\\"></path>\\n              <circle cx=\\"7.444\\" cy=\\"6.513\\" r=\\"2.032\\"></circle>\\n              <path\\n                d=\\"M9.561 23.916h11.25a2.929 2.929 0 002.926-2.927V9.954a1.06 1.06 0 10-2.122 0v11.035a.805.805 0\\n                01-.803.804H9.562a1.061 1.061 0 100 2.123z\\"\\n                stroke=\\"#8795a1\\"\\n                stroke-width=\\".215\\"\\n              ></path>\\n            </svg>\\n          </div>\\n          <div slot=\\"content\\" class=\\"popover popover-snapshot\\">\\n            <h5>Frame {formattedFrame}</h5>\\n            <a href=\\"#downloadsvg\\" on:click=\\"{() => snapshot(true)}\\">Download SVG</a>\\n            <a href=\\"#downloadsvg\\" on:click=\\"{() => snapshot(true)}\\">Download PNG</a>\\n            <i class=\\"note\\">Scroll with mousewheel to find exact frame</i>\\n          </div>\\n        </Popover>\\n      </div>\\n    {:else if item === 'zoom'}\\n      <div class=\\"btn\\" on:click=\\"{onToggleZoom}\\">\\n        {#if isZoomed}\\n          <svg {...ICON_SIZE}>\\n            <path\\n              d=\\"M7 22a1 1 0 102 0v-4a3 3 0 00-3-3H2a1 1 0 100 2h4a1 1 0 011 1v4zm8 0a1 1 0 102 0v-4a1 1 0 011-1h4a1 1 0\\n              100-2h-4a3 3 0 00-3 3v4zM2 9h4a3 3 0 003-3V2a1 1 0 10-2 0v4a1 1 0 01-1 1H2a1 1 0 100 2zm16 0h4a1 1 0\\n              100-2h-4a1 1 0 01-1-1V2a1 1 0 10-2 0v4a3 3 0 003 3z\\"\\n              stroke-width=\\".2\\"\\n            ></path>\\n          </svg>\\n        {:else}\\n          <svg {...ICON_SIZE}>\\n            <path\\n              d=\\"M21 8a1 1 0 102 0V4a3 3 0 00-3-3h-4a1 1 0 100 2h4a1 1 0 011 1v4zM1 8a1 1 0 102 0V4a1 1 0 011-1h4a1 1 0\\n              100-2H4a3 3 0 00-3 3v4zm15 15h4a3 3 0 003-3v-4a1 1 0 10-2 0v4a1 1 0 01-1 1h-4a1 1 0 100 2zM4 23h4a1 1 0\\n              100-2H4a1 1 0 01-1-1v-4a1 1 0 10-2 0v4a3 3 0 003 3z\\"\\n              stroke-width=\\".2\\"\\n            ></path>\\n          </svg>\\n        {/if}\\n      </div>\\n    {:else if item === 'info'}\\n      <div class=\\"\\">\\n        <Popover color=\\"#fff\\">\\n          <div class=\\"btn\\" slot=\\"target\\">\\n            <svg {...ICON_SIZE}>\\n              <path\\n                fill-rule=\\"evenodd\\"\\n                clip-rule=\\"evenodd\\"\\n                d=\\"M3.15 0h17.7A3.12 3.12 0 0124 3.1v17.8c0 1.71-1.4 3.1-3.15 3.1H3.15A3.12 3.12 0 010 20.9V3.1C0 1.39\\n                1.4 0 3.15 0zm0 2.05c-.6 0-1.07.47-1.07 1.05v17.8c0 .58.48 1.05 1.07 1.05h17.7c.6 0 1.07-.47\\n                1.07-1.05V3.1c0-.58-.48-1.05-1.07-1.05H3.15z\\"\\n              ></path>\\n              <path\\n                fill-rule=\\"evenodd\\"\\n                clip-rule=\\"evenodd\\"\\n                d=\\"M12 10c.55 0 1 .42 1 .94v6.12c0 .52-.45.94-1 .94s-1-.42-1-.94v-6.12c0-.52.45-.94 1-.94zM12 6a1 1 0\\n                011 1v.42a1 1 0 11-2 0V7a1 1 0 011-1z\\"\\n              ></path>\\n            </svg>\\n          </div>\\n          <div slot=\\"content\\" class=\\"popover popover-info\\">\\n            <Info {animationData} />\\n          </div>\\n        </Popover>\\n      </div>\\n    {:else if item === 'frame'}\\n      <div class=\\"\\">\\n        <input\\n          class=\\"frame-number\\"\\n          type=\\"text\\"\\n          bind:value=\\"{formattedFrame}\\"\\n          on:mouseout=\\"{() => currentState === PlayerState.Frozen && play()}\\"\\n          on:mouseover=\\"{() => currentState !== PlayerState.Paused && freeze()}\\"\\n          on:input=\\"{e => seek(e.target.value)}\\"\\n          on:mousewheel=\\"{e => seek(frame + (e.deltaY > 0 ? -1 : 1))}\\"\\n        />\\n      </div>\\n    {:else if item === 'nextFrame'}\\n      <div class=\\"btn\\" on:click=\\"{onNextFrame}\\">\\n        <svg {...ICON_SIZE}>\\n          <path\\n            d=\\"M2 19.513a1.429 1.429 0 0 0 2.148 1.234l12.88-7.513a1.429 1.429 0 0 0 0-2.468L4.147 3.253A1.429 1.429 0 0\\n            0 2 4.487z\\"\\n          ></path>\\n          <rect height=\\"17.143\\" rx=\\"1.429\\" transform=\\"matrix(1 0 0 -1 16.286 20.571)\\" width=\\"5.714\\"></rect>\\n        </svg>\\n      </div>\\n    {:else if item === 'previousFrame'}\\n      <div class=\\"btn\\" on:click=\\"{oPreviousFrame}\\">\\n        <svg {...ICON_SIZE}>\\n          <path d=\\"M22 4.5a1.4 1.4 0 00-2.1-1.2l-13 7.5a1.4 1.4 0 000 2.4l13 7.5a1.4 1.4 0 002.1-1.2z\\"></path>\\n          <rect height=\\"17.1\\" rx=\\"1.4\\" transform=\\"matrix(-1 0 0 1 7.7 3.4)\\" width=\\"5.7\\"></rect>\\n        </svg>\\n      </div>\\n    {:else if item === 'spacer'}\\n      <div class=\\"spacer\\"></div>\\n    {/if}\\n  {/each}\\n</div>\\n"],"names":[],"mappings":"AACE,mDAAwB,CACtB,WAAW,CAAE,MAAM,CACnB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,aAAa,CAC9B,OAAO,CAAE,GAAG,CAAC,GAAG,CAChB,WAAW,CAAE,aAAa,CAAC,CAAC,qBAAqB,CAAC,CAAC,eAAe,CAAC,CAAC,qBAAqB,CAAC,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC;AAC/G,MAAM,UAAU,CAAC,UACf,CAEA,qCAAuB,CAAG,iBAAI,CAC5B,WAAW,CAAE,GACf,CAEA,mCAAQ,CACN,SAAS,CAAE,CAAC,CACZ,KAAK,CAAE,IACT,CAEA,gCAAK,CACH,MAAM,CAAE,OAAO,CACf,IAAI,CAAE,IAAI,CACV,KAAK,CAAE,IACT,CAEA,gCAAI,MAAO,CACT,IAAI,CAAE,IACR,CAEA,IAAI,mCAAQ,CACV,IAAI,CAAE,IACR,CAEA,qCAAU,CACR,kBAAkB,CAAE,IAAI,CACxB,cAAc,CAAE,IAAI,CACpB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CAAC,IAAI,CACd,MAAM,CAAE,GAAG,CACX,aAAa,CAAE,GAAG,CAClB,MAAM,CAAE,OACV,CACA,qCAAS,MAAO,CACd,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,IACV,CACA,qCAAS,kBAAmB,CAC1B,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,IAAI,CAChB,MAAM,CAAE,IAAI,CACZ,OAAO,CAAE,IACX,CACA,qCAAS,sBAAuB,CAC9B,kBAAkB,CAAE,IAAI,CAAC,UAAU,CACnC,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CACT,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,OAAO,CACnB,MAAM,CAAE,OACV,CACA,qCAAS,kBAAmB,CAC1B,eAAe,CAAE,IAAI,CAAC,UAAU,CAChC,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,CAAC,CACT,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,OAAO,CACnB,MAAM,CAAE,OACV,CACA,qCAAS,WAAY,CACnB,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,GAAG,CACX,MAAM,CAAE,OAAO,CACf,UAAU,CAAE,WAAW,CACvB,YAAY,CAAE,WAAW,CACzB,KAAK,CAAE,WACT,CACA,qCAAS,gBAAiB,CACxB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,GACjB,CACA,qCAAS,gBAAiB,CACxB,UAAU,CAAE,IAAI,CAChB,aAAa,CAAE,GACjB,CACA,qCAAS,WAAY,CACnB,MAAM,CAAE,CAAC,CACT,MAAM,CAAE,IAAI,CACZ,KAAK,CAAE,IAAI,CACX,aAAa,CAAE,GAAG,CAClB,UAAU,CAAE,OAAO,CACnB,MAAM,CAAE,OACV,CACA,qCAAS,MAAM,gBAAiB,CAC9B,UAAU,CAAE,IACd,CACA,qCAAS,MAAM,gBAAiB,CAC9B,UAAU,CAAE,IACd,CAEA,oCAAS,CACP,OAAO,CAAE,IAAI,CACb,UAAU,CAAE,IAAI,CAChB,WAAW,CAAE,aAAa,CAAC,CAAC,qBAAqB,CAAC,CAAC,eAAe,CAAC,CAAC,qBAAqB,CAAC,CAAC,MAAM,CAAC,CAAC,OAAO,CAAC;AAC/G,MAAM,UAAU,CACZ,SAAS,CAAE,OAAO,CAClB,aAAa,CAAE,GACjB,CAEA,6CAAkB,CAChB,KAAK,CAAE,KACT,CACA,+BAAiB,CAAC,gBAAG,CACnB,MAAM,CAAE,GAAG,CAAC,CAAC,CAAC,IAAI,CAAC,CAAC,CACpB,SAAS,CAAE,OACb,CACA,+BAAiB,CAAC,eAAE,CAClB,OAAO,CAAE,KAAK,CACd,eAAe,CAAE,IACnB,CACA,+BAAiB,CAAC,eAAC,OAAQ,CACzB,OAAO,CAAE,GAAG,CACZ,YAAY,CAAE,GAChB,CACA,+BAAiB,CAAC,mBAAM,CACtB,OAAO,CAAE,KAAK,CACd,UAAU,CAAE,IAAI,CAChB,KAAK,CAAE,IACT,CAEA,yCAAc,CACZ,KAAK,CAAE,KACT,CAEA,yCAAc,CACZ,OAAO,CAAE,IAAI,CACb,MAAM,CAAE,GAAG,CAAC,IAAI,CAAC,KAAK,CACtB,aAAa,CAAE,GAAG,CAClB,KAAK,CAAE,IAAI,CACX,UAAU,CAAE,MAAM,CAClB,KAAK,CAAE,IAAI,CACX,SAAS,CAAE,MAAM,CACjB,OAAO,CAAE,CAAC,CACV,WAAW,CAAE,OACf,CAEA,+CAAoB,CAClB,KAAK,CAAE,KACT"}`
};
const Controls = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isPlaying;
  let isPaused;
  let isStopped;
  let formattedFrame;
  const ICON_SIZE = {
    width: 14,
    height: 14,
    viewBox: "0 0 24 24"
  };
  createEventDispatcher();
  let { animationData } = $$props;
  let { background } = $$props;
  let { currentState } = $$props;
  let { frame } = $$props;
  let { freeze } = $$props;
  let { instance } = $$props;
  let { layout = ControlsLayoutOptions } = $$props;
  let { loop: loop2 } = $$props;
  let { play } = $$props;
  let { progress } = $$props;
  let { seek } = $$props;
  let { snapshot } = $$props;
  let { stop } = $$props;
  let { toggleZoom } = $$props;
  let { toggleLooping } = $$props;
  let { togglePlay } = $$props;
  let { totalFrames = 0 } = $$props;
  if ($$props.animationData === void 0 && $$bindings.animationData && animationData !== void 0) $$bindings.animationData(animationData);
  if ($$props.background === void 0 && $$bindings.background && background !== void 0) $$bindings.background(background);
  if ($$props.currentState === void 0 && $$bindings.currentState && currentState !== void 0) $$bindings.currentState(currentState);
  if ($$props.frame === void 0 && $$bindings.frame && frame !== void 0) $$bindings.frame(frame);
  if ($$props.freeze === void 0 && $$bindings.freeze && freeze !== void 0) $$bindings.freeze(freeze);
  if ($$props.instance === void 0 && $$bindings.instance && instance !== void 0) $$bindings.instance(instance);
  if ($$props.layout === void 0 && $$bindings.layout && layout !== void 0) $$bindings.layout(layout);
  if ($$props.loop === void 0 && $$bindings.loop && loop2 !== void 0) $$bindings.loop(loop2);
  if ($$props.play === void 0 && $$bindings.play && play !== void 0) $$bindings.play(play);
  if ($$props.progress === void 0 && $$bindings.progress && progress !== void 0) $$bindings.progress(progress);
  if ($$props.seek === void 0 && $$bindings.seek && seek !== void 0) $$bindings.seek(seek);
  if ($$props.snapshot === void 0 && $$bindings.snapshot && snapshot !== void 0) $$bindings.snapshot(snapshot);
  if ($$props.stop === void 0 && $$bindings.stop && stop !== void 0) $$bindings.stop(stop);
  if ($$props.toggleZoom === void 0 && $$bindings.toggleZoom && toggleZoom !== void 0) $$bindings.toggleZoom(toggleZoom);
  if ($$props.toggleLooping === void 0 && $$bindings.toggleLooping && toggleLooping !== void 0) $$bindings.toggleLooping(toggleLooping);
  if ($$props.togglePlay === void 0 && $$bindings.togglePlay && togglePlay !== void 0) $$bindings.togglePlay(togglePlay);
  if ($$props.totalFrames === void 0 && $$bindings.totalFrames && totalFrames !== void 0) $$bindings.totalFrames(totalFrames);
  $$result.css.add(css$2);
  isPlaying = currentState === PlayerState.Playing;
  isPaused = currentState === PlayerState.Paused;
  isStopped = currentState === PlayerState.Stopped;
  formattedFrame = Math.round(frame);
  return `<div class="lottie-player-controls svelte-9yox50">${each(layout, (item) => {
    return `${item === "playpause" ? `<div class="${["btn svelte-9yox50", isPlaying || isPaused ? "active" : ""].join(" ").trim()}">${isPlaying ? `<svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><rect height="22.9" rx="1.9" width="7.6" x="14" y=".5"></rect><rect height="22.9" rx="1.9" width="7.6" x="2" y=".5"></rect></svg>` : `<svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path d="M2 3.4C2 1.9 3.5 1 4.8 1.8l16.5 9.6c1.2.7 1.2 2.5 0 3.2L4.8 24.2C3.5 25 2 24.1 2 22.6V3.4z"></path></svg>`} </div>` : `${item === "stop" ? `<div class="${["btn svelte-9yox50", isStopped ? "active" : ""].join(" ").trim()}"><svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path d="M2 3.667A1.67 1.67 0 0 1 3.667 2h16.666A1.67 1.67 0 0 1 22 3.667v16.666A1.67 1.67 0 0 1 20.333
            22H3.667A1.67 1.67 0 0 1 2 20.333z"></path></svg> </div>` : `${item === "progress" ? `<input class="progress svelte-9yox50" type="range" min="0" step="1" max="100"${add_attribute(
      "style",
      `
          background-image: -webkit-gradient(linear, left top, right top, color-stop(${progress}%, rgba(15, 204, 206, 0.4)), color-stop(${progress}%, #DAE1E7));
          background-image: -moz-linear-gradient(left center, rgba(15, 204, 206, 0.4) 0%, rgba(15, 204, 206, 0.4) ${progress}%, #DAE1E7 ${progress}%, #DAE1E7 100%);
        `,
      0
    )}${add_attribute("value", progress, 0)}>` : `${item === "loop" ? `<div class="${["btn svelte-9yox50", loop2 ? "active" : ""].join(" ").trim()}"><svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path d="M12.5 16.8137h-.13v1.8939h4.9696c3.6455 0 6.6113-2.9658 6.6113-6.6116
            0-3.64549-2.9658-6.61131-6.6113-6.61131-.5231 0-.947.42391-.947.94696 0 .52304.4239.94696.947.94696 2.6011 0
            4.7174 2.11634 4.7174 4.71739 0 2.6014-2.1166 4.7177-4.7174 4.7177H12.5zM13.6025
            5.61469v-.13H7.48137C3.83582 5.48469.87 8.45051.87 12.096c0 3.6509 3.17269 6.6117 6.81304 6.6117.52304 0
            .94696-.424.94696-.947 0-.5231-.42392-.947-.94696-.947-2.60804 0-4.91907-2.1231-4.91907-4.7176 0-2.60115
            2.11634-4.71744 4.7174-4.71744h6.12113V5.61469z" stroke="#8795A1" stroke-width=".26"></path><path d="M11.1482
            2.20355h0l-.001-.00116c-.3412-.40061-.9405-.44558-1.33668-.0996h-.00001c-.39526.34519-.43936.94795-.09898
            1.34767l2.51487 3.03683-2.51894 3.06468c-.33872.40088-.29282 1.00363.10347
            1.34723l.08517-.0982-.08517.0982c.17853.1549.39807.2308.61647.2308.2671 0 .5328-.114.72-.3347h0l.0011-.0014
            3.0435-3.68655.0006-.00068c.3035-.35872.3025-.88754-.0019-1.24526l-3.0425-3.65786zM13.9453
            21.7965h0l.001.0011c.3413.4006.9407.4456 1.337.0996h0c.3953-.3452.4395-.9479.099-1.3477l-2.5154-3.0368
            2.5195-3.0647c.3388-.4008.2929-1.0036-.1035-1.3472l-.0852.0982.0852-.0982c-.1786-.1549-.3981-.2308-.6166-.2308-.2671
            0-.5329.114-.7202.3347h0l-.0011.0014-3.0442
            3.6865c-.0001.0003-.0003.0005-.0005.0007-.3036.3587-.3027.8876.0019 1.2453l3.0431 3.6579z" fill="#8795A1" stroke="#8795A1" stroke-width=".26"></path></svg> </div>` : `${item === "background" ? `<div class=" svelte-9yox50">${validate_component(Popover, "Popover").$$render($$result, { color: "#fff" }, {}, {
      content: () => {
        return `<div slot="content" class="popover popover-background svelte-9yox50">${validate_component(ColorPicker, "ColorPicker").$$render($$result, { color: background }, {}, {})} </div>`;
      },
      target: () => {
        return `<div class="btn svelte-9yox50" slot="target"><svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path d="M12 3.1L6.1 8.6a7.6 7.6 0 00-2.2 4 7.2 7.2 0 00.4 4.4 7.9 7.9 0 003 3.5 8.7 8.7 0 004.7 1.3c1.6 0
                3.2-.5 4.6-1.3s2.4-2 3-3.5a7.2 7.2 0 00.5-4.5 7.6 7.6 0 00-2.2-4L12 3.2zM12 0l7.5 7a9.8 9.8 0 013 5.1
                9.3 9.3 0 01-.6 5.8c-.9 1.8-2.2 3.3-4 4.4A11.2 11.2 0 0112 24a11.2 11.2 0
                01-6-1.7c-1.7-1-3-2.6-3.9-4.4a9.3 9.3 0 01-.6-5.8c.4-2 1.5-3.7 3-5L12 0zM6 14h12c0 1.5-.7 3-1.8 4s-2.6
                1.6-4.2 1.6S9 19 7.8 18s-1.7-2.5-1.7-4z"></path></svg> </div>`;
      }
    })} </div>` : `${item === "snapshot" ? `<div class=" svelte-9yox50">${validate_component(Popover, "Popover").$$render($$result, { color: "#fff" }, {}, {
      content: () => {
        return `<div slot="content" class="popover popover-snapshot svelte-9yox50"><h5 class="svelte-9yox50">Frame ${escape(formattedFrame)}</h5> <a href="#downloadsvg" class="svelte-9yox50" data-svelte-h="svelte-1700g46">Download SVG</a> <a href="#downloadsvg" class="svelte-9yox50" data-svelte-h="svelte-v3u96x">Download PNG</a> <i class="note svelte-9yox50" data-svelte-h="svelte-19sz8ci">Scroll with mousewheel to find exact frame</i> </div>`;
      },
      target: () => {
        return `<div class="btn svelte-9yox50" slot="target"><svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path clip-rule="evenodd" d="M0 3.01A2.983 2.983 0 012.983.027H16.99a2.983 2.983 0 012.983 2.983v14.008a2.982 2.982 0 01-2.983
                2.983H2.983A2.983 2.983 0 010 17.018zm2.983-.941a.941.941 0 00-.942.94v14.01c0
                .52.422.94.942.94H16.99a.94.94 0 00.941-.94V3.008a.941.941 0 00-.94-.94H2.981z" fill-rule="evenodd"></path><path d="M12.229 7.945l-2.07 4.598-2.586-2.605-2.414 2.758v2.146h9.656V11.93z"></path><circle cx="7.444" cy="6.513" r="2.032"></circle><path d="M9.561 23.916h11.25a2.929 2.929 0 002.926-2.927V9.954a1.06 1.06 0 10-2.122 0v11.035a.805.805 0
                01-.803.804H9.562a1.061 1.061 0 100 2.123z" stroke="#8795a1" stroke-width=".215"></path></svg> </div>`;
      }
    })} </div>` : `${item === "zoom" ? `<div class="btn svelte-9yox50">${`<svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path d="M21 8a1 1 0 102 0V4a3 3 0 00-3-3h-4a1 1 0 100 2h4a1 1 0 011 1v4zM1 8a1 1 0 102 0V4a1 1 0 011-1h4a1 1 0
              100-2H4a3 3 0 00-3 3v4zm15 15h4a3 3 0 003-3v-4a1 1 0 10-2 0v4a1 1 0 01-1 1h-4a1 1 0 100 2zM4 23h4a1 1 0
              100-2H4a1 1 0 01-1-1v-4a1 1 0 10-2 0v4a3 3 0 003 3z" stroke-width=".2"></path></svg>`} </div>` : `${item === "info" ? `<div class=" svelte-9yox50">${validate_component(Popover, "Popover").$$render($$result, { color: "#fff" }, {}, {
      content: () => {
        return `<div slot="content" class="popover popover-info svelte-9yox50">${validate_component(Info, "Info").$$render($$result, { animationData }, {}, {})} </div>`;
      },
      target: () => {
        return `<div class="btn svelte-9yox50" slot="target"><svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path fill-rule="evenodd" clip-rule="evenodd" d="M3.15 0h17.7A3.12 3.12 0 0124 3.1v17.8c0 1.71-1.4 3.1-3.15 3.1H3.15A3.12 3.12 0 010 20.9V3.1C0 1.39
                1.4 0 3.15 0zm0 2.05c-.6 0-1.07.47-1.07 1.05v17.8c0 .58.48 1.05 1.07 1.05h17.7c.6 0 1.07-.47
                1.07-1.05V3.1c0-.58-.48-1.05-1.07-1.05H3.15z"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M12 10c.55 0 1 .42 1 .94v6.12c0 .52-.45.94-1 .94s-1-.42-1-.94v-6.12c0-.52.45-.94 1-.94zM12 6a1 1 0
                011 1v.42a1 1 0 11-2 0V7a1 1 0 011-1z"></path></svg> </div>`;
      }
    })} </div>` : `${item === "frame" ? `<div class=" svelte-9yox50"><input class="frame-number svelte-9yox50" type="text"${add_attribute("value", formattedFrame, 0)}> </div>` : `${item === "nextFrame" ? `<div class="btn svelte-9yox50"><svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path d="M2 19.513a1.429 1.429 0 0 0 2.148 1.234l12.88-7.513a1.429 1.429 0 0 0 0-2.468L4.147 3.253A1.429 1.429 0 0
            0 2 4.487z"></path><rect height="17.143" rx="1.429" transform="matrix(1 0 0 -1 16.286 20.571)" width="5.714"></rect></svg> </div>` : `${item === "previousFrame" ? `<div class="btn svelte-9yox50"><svg${spread([escape_object(ICON_SIZE)], { classes: "svelte-9yox50" })}><path d="M22 4.5a1.4 1.4 0 00-2.1-1.2l-13 7.5a1.4 1.4 0 000 2.4l13 7.5a1.4 1.4 0 002.1-1.2z"></path><rect height="17.1" rx="1.4" transform="matrix(-1 0 0 1 7.7 3.4)" width="5.7"></rect></svg> </div>` : `${item === "spacer" ? `<div class="spacer svelte-9yox50"></div>` : ``}`}`}`}`}`}`}`}`}`}`}`}`;
  })}</div>`;
});
const SVELTE_LOTTIE_PLAYER_VERSION = "0.3.1";
const LOTTIE_WEB_VERSION = "^5.10.0";
const css$1 = {
  code: ".lottie-player.svelte-1aiskgp{box-sizing:border-box;display:flex;flex-direction:column;transition:box-shadow 0.6s}.lottie-player.is-zoomed.svelte-1aiskgp{position:absolute;top:0;left:0;right:0;box-shadow:0px 0px 56px -14px rgba(0, 0, 0, 0.6);margin:100px;border-radius:6px}.animation.svelte-1aiskgp{overflow:hidden}.lottie-player-error.svelte-1aiskgp{display:flex;justify-content:center;height:100%;align-items:center}",
  map: '{"version":3,"file":"LottiePlayer.svelte","sources":["LottiePlayer.svelte"],"sourcesContent":["<script>\\n  import { onDestroy, onMount } from \\"svelte\\";\\n  import lottie from \\"lottie-web\\";\\n\\n  import Controls from \\"./Controls.svelte\\";\\n\\n  import { SVELTE_LOTTIE_PLAYER_VERSION, LOTTIE_WEB_VERSION } from \'./versions.js\'\\n\\n  import {\\n    PlayerEvents,\\n    PlayerRender,\\n    PlayerState,\\n    PlayMode,\\n    parseSrc,\\n    triggerDownload\\n  } from \\"./utils\\";\\n\\n  // Autoplay animation on load\\n  export let autoplay = false;\\n\\n  // Background color\\n  export let background;\\n\\n  // Show controls\\n  export let controls;\\n\\n  // Controls layout\\n  export let controlsLayout;\\n\\n  // Number of times to loop animation.\\n  export let count = undefined;\\n\\n  // Default frame to show if autoplay is disabled\\n  export let defaultFrame = 0;\\n\\n  // Direction of animation\\n  export let direction = 1;\\n\\n  // Player height\\n  export let height;\\n\\n  // Whether to play on mouse hover\\n  export let hover = false;\\n\\n  // Whether to loop animation\\n  export let loop = false;\\n\\n  // Play mode\\n  export let mode = PlayMode.Normal;\\n\\n  // Callback for when zoom is triggered\\n  export let onToggleZoom = undefined;\\n\\n  // Renderer to use in lottie-web\\n  export let renderer = PlayerRender.SVG;\\n\\n  // Playback speed.\\n  export let speed = 1;\\n\\n  // Lottie file as either a URL or JSON content.\\n  export let src = \\"\\";\\n\\n  // Styling for the Player\'s wrapper element\\n  export let style = \\"\\";\\n\\n  // Player width\\n  export let width;\\n\\n  let animationData;\\n  let animationRef;\\n  let playerRef;\\n  let wrapperRef;\\n  let instance;\\n  let frame = 0;\\n  let progress = 0;\\n  let io;\\n  let currentState = PlayerState.Loading;\\n  let isZoomed = false;\\n  let playerHeight;\\n  let playerWidth;\\n  let totalFrames;\\n\\n  /**\\n   * Handle visibility change events.\\n   */\\n  const onVisibilityChange = () => {\\n    if (document.hidden === true && currentState === PlayerState.Playing) {\\n      freeze();\\n    } else if (currentState === PlayerState.Frozen) {\\n      play();\\n    }\\n  };\\n\\n  /**\\n   * Initialize everything on component mount.\\n   */\\n  onMount(() => {\\n    if (\\"IntersectionObserver\\" in window) {\\n      io = new IntersectionObserver(entries => {\\n        if (entries[0].isIntersecting) {\\n          if (currentState === PlayerState.Frozen) {\\n            play();\\n          }\\n        } else if (currentState === PlayerState.Playing) {\\n          freeze();\\n        }\\n      });\\n\\n      io.observe(animationRef);\\n    }\\n\\n    // Add listener for Visibility API\'s change event.\\n    if (typeof document.hidden !== \\"undefined\\") {\\n      document.addEventListener(\\"visibilitychange\\", onVisibilityChange);\\n    }\\n\\n    // Setup lottie player\\n    if (src) {\\n      load(src);\\n    }\\n  });\\n\\n  /**\\n   * Cleanup on component destroy.\\n   */\\n  onDestroy(() => {\\n    // Remove intersection observer for detecting component being out-of-view.\\n    if (io) {\\n      io.disconnect();\\n      io = undefined;\\n    }\\n\\n    // Remove the attached Visibility API\'s change event listener.\\n    document.removeEventListener(\\"visibilitychange\\", onVisibilityChange);\\n  });\\n\\n  /**\\n   * Configure and initialize lottie-web player instance.\\n   */\\n  export const load = srcValue => {\\n    if (!animationRef) {\\n      return;\\n    }\\n\\n    // Clear previous animation, if any\\n    if (instance) {\\n      instance.destroy();\\n    }\\n\\n    const options = {\\n      container: animationRef,\\n      loop,\\n      autoplay,\\n      renderer,\\n      rendererSettings: {\\n        preserveAspectRatio: \\"xMidYMid meet\\",\\n        clearCanvas: true,\\n        progressiveLoad: true,\\n        hideOnTransparent: true\\n      }\\n    };\\n\\n    // Load the resource information\\n    try {\\n      const srcParsed = parseSrc(srcValue);\\n      const srcAttrib =\\n        typeof srcParsed === \\"string\\" ? \\"path\\" : \\"animationData\\";\\n\\n      // Initialize lottie player and load animation\\n      instance = lottie.loadAnimation({\\n        ...options,\\n        [srcAttrib]: srcParsed\\n      });\\n    } catch (err) {\\n      currentState = PlayerState.Error;\\n      dispatchEvent(new CustomEvent(PlayerEvents.Error));\\n    }\\n\\n    if (instance) {\\n      // Calculate and save the current progress of the animation\\n      instance.addEventListener(\\"enterFrame\\", () => {\\n        frame = instance.currentFrame;\\n        progress = (instance.currentFrame / instance.totalFrames) * 100;\\n\\n        dispatchEvent(\\n          new CustomEvent(PlayerEvents.Frame, {\\n            detail: {\\n              frame: instance.currentFrame,\\n              progress: progress\\n            }\\n          })\\n        );\\n      });\\n\\n      instance.addEventListener(\\"complete\\", () => {\\n        if (currentState !== PlayerState.Playing) {\\n          dispatchEvent(new CustomEvent(PlayerEvents.Complete));\\n          return;\\n        }\\n\\n        if (!loop || (count && _counter >= count)) {\\n          dispatchEvent(new CustomEvent(PlayerEvents.Complete));\\n          return;\\n        }\\n\\n        if (mode === PlayMode.Bounce) {\\n          if (count) {\\n            _counter += 0.5;\\n          }\\n\\n          setTimeout(() => {\\n            dispatchEvent(new CustomEvent(PlayerEvents.Loop));\\n\\n            if (currentState === PlayerState.Playing) {\\n              instance.setDirection(instance.playDirection * -1);\\n              instance.play();\\n            }\\n          }, intermission);\\n        } else {\\n          if (count) {\\n            _counter += 1;\\n          }\\n\\n          window.setTimeout(() => {\\n            dispatchEvent(new CustomEvent(PlayerEvents.Loop));\\n\\n            if (currentState === PlayerState.Playing) {\\n              instance.stop();\\n              instance.play();\\n            }\\n          }, intermission);\\n        }\\n      });\\n\\n      // Handle animation data load complete\\n      instance.addEventListener(\\"data_ready\\", () => {\\n        animationData = instance.animationData;\\n        totalFrames = instance.totalFrames;\\n      });\\n\\n      // Set error state when animation load fail event triggers\\n      instance.addEventListener(\\"data_failed\\", () => {\\n        currentState = PlayerState.Error;\\n\\n        dispatchEvent(new CustomEvent(PlayerEvents.Error));\\n      });\\n\\n      // Set handlers to auto play animation on hover if enabled\\n      animationRef.addEventListener(\\"mouseenter\\", () => {\\n        if (hover && currentState !== PlayerState.Playing) {\\n          play();\\n        }\\n      });\\n      animationRef.addEventListener(\\"mouseleave\\", () => {\\n        if (hover && currentState === PlayerState.Playing) {\\n          stop();\\n        }\\n      });\\n\\n      // Set initial playback speed and direction\\n      setSpeed(speed);\\n      setDirection(direction);\\n\\n      // Start playing if autoplay is enabled\\n      if (autoplay) {\\n        play();\\n      } else if (!isNaN(defaultFrame)) {\\n        instance.goToAndStop(defaultFrame, true);\\n      }\\n    }\\n  };\\n\\n  /**\\n   * Returns the lottie-web instance used in the component.\\n   */\\n  export const getLottie = () => {\\n    return instance;\\n  };\\n\\n  /**\\n   * Start playing animation.\\n   */\\n  export const play = () => {\\n    if (!instance) {\\n      return;\\n    }\\n\\n    currentState = PlayerState.Playing;\\n    instance.play();\\n\\n    dispatchEvent(new CustomEvent(PlayerEvents.Play));\\n  };\\n\\n  /**\\n   * Returns the lottie-web version and this player\'s version\\n   */\\n   export const getVersions = () => {\\n    return {\\n      lottieWebVersion: LOTTIE_WEB_VERSION,\\n      svelteLottiePlayerVersion: SVELTE_LOTTIE_PLAYER_VERSION,\\n    };\\n  }\\n\\n  /**\\n   * Pause animation play.\\n   */\\n  export const pause = () => {\\n    if (!instance) {\\n      return;\\n    }\\n\\n    currentState = PlayerState.Paused;\\n    instance.pause();\\n\\n    dispatchEvent(new CustomEvent(PlayerEvents.Pause));\\n  };\\n\\n  /**\\n   * Stops animation play.\\n   */\\n  export const stop = () => {\\n    if (!instance) {\\n      return;\\n    }\\n\\n    currentState = PlayerState.Stopped;\\n    instance.stop();\\n\\n    dispatchEvent(new CustomEvent(PlayerEvents.Stop));\\n  };\\n\\n  /**\\n   * Freeze animation play.\\n   * This internal state pauses animation and is used to differentiate between\\n   * user requested pauses and component instigated pauses.\\n   */\\n  export const freeze = () => {\\n    if (!instance) {\\n      return;\\n    }\\n\\n    instance.pause();\\n    currentState = PlayerState.Frozen;\\n\\n    dispatchEvent(new CustomEvent(PlayerEvents.Freeze));\\n  };\\n\\n  /**\\n   * Resize animation.\\n   */\\n  export const resize = () => {\\n    if (!instance) {\\n      return;\\n    }\\n\\n    instance.resize();\\n  };\\n\\n  /**\\n   * Seek to a given frame.\\n   */\\n  export const seek = value => {\\n    if (!instance) {\\n      return;\\n    }\\n\\n    // Extract frame number from either number or percentage value\\n    const matches = value.toString().match(/^([0-9\\\\.]+)(%?)$/);\\n    if (!matches) {\\n      return;\\n    }\\n\\n    // Calculate and set the frame number\\n    const resolvedFrame =\\n      matches[2] === \\"%\\"\\n        ? (instance.totalFrames * Number(matches[1])) / 100\\n        : Number(matches[1]);\\n\\n    // Send lottie player to the new frame\\n    if (currentState === PlayerState.Playing) {\\n      instance.goToAndPlay(resolvedFrame, true);\\n    } else {\\n      instance.goToAndStop(resolvedFrame, true);\\n      instance.pause();\\n    }\\n  };\\n\\n  /**\\n   * Snapshot the current frame as SVG.\\n   *\\n   * If \'download\' argument is boolean true, then a download is triggered in browser.\\n   */\\n  export const snapshot = (download = true) => {\\n    let data;\\n\\n    if (renderer === PlayerRender.SVG) {\\n      // Get SVG element and serialize markup\\n      const svgElement = animationRef.querySelector(\\"svg\\");\\n      const serializedSvg = new XMLSerializer().serializeToString(svgElement);\\n      data =\\n        \\"data:image/svg+xml;charset=utf-8,\\" + encodeURIComponent(serializedSvg);\\n\\n      // Trigger file download if needed\\n      if (download) {\\n        triggerDownload(data, `snapshot_${progress}.svg`);\\n      }\\n    } else if (renderer === PlayerRender.Canvas) {\\n      const canvas = animationRef.querySelector(\\"canvas\\");\\n      data = canvas.toDataURL(\\"image/png\\");\\n\\n      // Trigger file download if needed\\n      if (download) {\\n        triggerDownload(data, `snapshot_${progress}.png`);\\n      }\\n    }\\n\\n    return data;\\n  };\\n\\n  /**\\n   * Sets the looping of the animation.\\n   *\\n   * @param value Whether to enable looping. Boolean true enables looping.\\n   */\\n  export const setLooping = value => {\\n    if (instance) {\\n      loop = value;\\n    }\\n  };\\n\\n  /**\\n   * Sets animation play speed.\\n   *\\n   * @param value Playback speed.\\n   */\\n  export const setSpeed = value => {\\n    if (instance) {\\n      speed = value;\\n    }\\n  };\\n\\n  /**\\n   * Animation play direction.\\n   *\\n   * @param value Direction values.\\n   */\\n  export const setDirection = value => {\\n    if (instance) {\\n      direction = value;\\n    }\\n  };\\n\\n  /**\\n   * Toggle playing state.\\n   */\\n  export const togglePlay = () => {\\n    return currentState === PlayerState.Playing ? pause() : play();\\n  };\\n\\n  /**\\n   * Toggles animation looping.\\n   */\\n  export const toggleLooping = () => {\\n    setLooping(!loop);\\n  };\\n\\n  /**\\n   * Sets background color.\\n   */\\n  export const setBackground = value => {\\n    background = value;\\n  };\\n\\n  export const toggleZoom = () => {\\n    // Check if custom handler for zoom toggle is set\\n    if (typeof onToggleZoom === \\"function\\") {\\n      // Call the custom zoom toggle handler with current zoom status\\n      // Set return value as the zoom status\\n      isZoomed = Boolean(onToggleZoom(isZoomed));\\n\\n      return;\\n    }\\n\\n    if (!isZoomed) {\\n      wrapperRef.style.height = playerHeight + \\"px\\";\\n      wrapperRef.style.width = playerWidth + \\"px\\";\\n\\n      document.body.appendChild(playerRef);\\n    } else {\\n      wrapperRef.appendChild(playerRef);\\n\\n      wrapperRef.style.height = undefined;\\n      wrapperRef.style.width = undefined;\\n    }\\n\\n    isZoomed = !isZoomed;\\n\\n    setTimeout(() => resize(), 100);\\n  };\\n\\n  // Try load new animation when the src value changes\\n  $: load(src);\\n\\n  // Update the player with loop prop changes\\n  $: {\\n    if (instance) {\\n      instance.loop = loop;\\n    }\\n  }\\n\\n  // Update the player with speed prop changes\\n  $: {\\n    if (instance) {\\n      instance.setSpeed(speed);\\n    }\\n  }\\n\\n  // Update the player with direction prop changes\\n  $: {\\n    if (instance) {\\n      instance.setDirection(direction);\\n    }\\n  }\\n<\/script>\\n\\n<style>\\n  .lottie-player {\\n    box-sizing: border-box;\\n    display: flex;\\n    flex-direction: column;\\n    transition: box-shadow 0.6s;\\n    /* overflow: hidden; */\\n  }\\n\\n  .lottie-player.is-zoomed {\\n    position: absolute;\\n    top: 0;\\n    left: 0;\\n    right: 0;\\n    box-shadow: 0px 0px 56px -14px rgba(0, 0, 0, 0.6);\\n    margin: 100px;\\n    border-radius: 6px;\\n  }\\n\\n  .animation {\\n    overflow: hidden;\\n  }\\n\\n  .lottie-player-error {\\n    display: flex;\\n    justify-content: center;\\n    height: 100%;\\n    align-items: center;\\n  }\\n</style>\\n\\n<div\\n  bind:this={wrapperRef}\\n  style=\\"{width ? `width:${width}px;` : \'\'}{height ? `height:${height}px;` : \'\'}{style}\\"\\n  bind:clientHeight={playerHeight}\\n  bind:clientWidth={playerWidth}>\\n  <div\\n    bind:this={playerRef}\\n    class=\\"lottie-player\\"\\n    class:with-controls={controls}\\n    class:is-zoomed={isZoomed}>\\n    <div\\n      class:animation={true}\\n      bind:this={animationRef}\\n      style=\\"background: {background}\\">\\n      {#if currentState === PlayerState.Error}\\n        <div class=\\"lottie-player-error\\">⚠️</div>\\n      {/if}\\n    </div>\\n    {#if controls}\\n      <Controls\\n        on:background={e => setBackground(e.detail.color)}\\n        layout={controlsLayout}\\n        {animationData}\\n        {background}\\n        {controls}\\n        {currentState}\\n        {frame}\\n        {freeze}\\n        {instance}\\n        {loop}\\n        {lottie}\\n        {pause}\\n        {play}\\n        {progress}\\n        {seek}\\n        {setDirection}\\n        {setSpeed}\\n        {setLooping}\\n        {snapshot}\\n        {src}\\n        {stop}\\n        {toggleZoom}\\n        {toggleLooping}\\n        {togglePlay}\\n        {totalFrames} />\\n    {/if}\\n  </div>\\n</div>\\n"],"names":[],"mappings":"AA8gBE,6BAAe,CACb,UAAU,CAAE,UAAU,CACtB,OAAO,CAAE,IAAI,CACb,cAAc,CAAE,MAAM,CACtB,UAAU,CAAE,UAAU,CAAC,IAEzB,CAEA,cAAc,yBAAW,CACvB,QAAQ,CAAE,QAAQ,CAClB,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,CAAC,CACR,UAAU,CAAE,GAAG,CAAC,GAAG,CAAC,IAAI,CAAC,KAAK,CAAC,KAAK,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,CAAC,GAAG,CAAC,CACjD,MAAM,CAAE,KAAK,CACb,aAAa,CAAE,GACjB,CAEA,yBAAW,CACT,QAAQ,CAAE,MACZ,CAEA,mCAAqB,CACnB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,MAAM,CAAE,IAAI,CACZ,WAAW,CAAE,MACf"}'
};
const LottiePlayer = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { autoplay = false } = $$props;
  let { background } = $$props;
  let { controls } = $$props;
  let { controlsLayout } = $$props;
  let { count = void 0 } = $$props;
  let { defaultFrame = 0 } = $$props;
  let { direction = 1 } = $$props;
  let { height: height2 } = $$props;
  let { hover = false } = $$props;
  let { loop: loop2 = false } = $$props;
  let { mode = PlayMode.Normal } = $$props;
  let { onToggleZoom = void 0 } = $$props;
  let { renderer = PlayerRender.SVG } = $$props;
  let { speed = 1 } = $$props;
  let { src = "" } = $$props;
  let { style = "" } = $$props;
  let { width: width2 } = $$props;
  let animationData;
  let animationRef;
  let playerRef;
  let wrapperRef;
  let instance;
  let frame = 0;
  let progress = 0;
  let currentState = PlayerState.Loading;
  let isZoomed = false;
  let playerHeight;
  let playerWidth;
  let totalFrames;
  const onVisibilityChange = () => {
  };
  onDestroy(() => {
    document.removeEventListener("visibilitychange", onVisibilityChange);
  });
  const load = (srcValue) => {
    {
      return;
    }
  };
  const getLottie = () => {
    return instance;
  };
  const play = () => {
    {
      return;
    }
  };
  const getVersions = () => {
    return {
      lottieWebVersion: LOTTIE_WEB_VERSION,
      svelteLottiePlayerVersion: SVELTE_LOTTIE_PLAYER_VERSION
    };
  };
  const pause = () => {
    {
      return;
    }
  };
  const stop = () => {
    {
      return;
    }
  };
  const freeze = () => {
    {
      return;
    }
  };
  const resize = () => {
    {
      return;
    }
  };
  const seek = (value) => {
    {
      return;
    }
  };
  const snapshot = (download = true) => {
    let data;
    if (renderer === PlayerRender.SVG) {
      const svgElement = animationRef.querySelector("svg");
      const serializedSvg = new XMLSerializer().serializeToString(svgElement);
      data = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serializedSvg);
      if (download) {
        triggerDownload(data, `snapshot_${progress}.svg`);
      }
    } else if (renderer === PlayerRender.Canvas) {
      const canvas = animationRef.querySelector("canvas");
      data = canvas.toDataURL("image/png");
      if (download) {
        triggerDownload(data, `snapshot_${progress}.png`);
      }
    }
    return data;
  };
  const setLooping = (value) => {
  };
  const setSpeed = (value) => {
  };
  const setDirection = (value) => {
  };
  const togglePlay = () => {
    return play();
  };
  const toggleLooping = () => {
  };
  const setBackground = (value) => {
    background = value;
  };
  const toggleZoom = () => {
    if (typeof onToggleZoom === "function") {
      isZoomed = Boolean(onToggleZoom(isZoomed));
      return;
    }
    if (!isZoomed) {
      wrapperRef.style.height = playerHeight + "px";
      wrapperRef.style.width = playerWidth + "px";
      document.body.appendChild(playerRef);
    } else {
      wrapperRef.appendChild(playerRef);
      wrapperRef.style.height = void 0;
      wrapperRef.style.width = void 0;
    }
    isZoomed = !isZoomed;
    setTimeout(() => resize(), 100);
  };
  if ($$props.autoplay === void 0 && $$bindings.autoplay && autoplay !== void 0) $$bindings.autoplay(autoplay);
  if ($$props.background === void 0 && $$bindings.background && background !== void 0) $$bindings.background(background);
  if ($$props.controls === void 0 && $$bindings.controls && controls !== void 0) $$bindings.controls(controls);
  if ($$props.controlsLayout === void 0 && $$bindings.controlsLayout && controlsLayout !== void 0) $$bindings.controlsLayout(controlsLayout);
  if ($$props.count === void 0 && $$bindings.count && count !== void 0) $$bindings.count(count);
  if ($$props.defaultFrame === void 0 && $$bindings.defaultFrame && defaultFrame !== void 0) $$bindings.defaultFrame(defaultFrame);
  if ($$props.direction === void 0 && $$bindings.direction && direction !== void 0) $$bindings.direction(direction);
  if ($$props.height === void 0 && $$bindings.height && height2 !== void 0) $$bindings.height(height2);
  if ($$props.hover === void 0 && $$bindings.hover && hover !== void 0) $$bindings.hover(hover);
  if ($$props.loop === void 0 && $$bindings.loop && loop2 !== void 0) $$bindings.loop(loop2);
  if ($$props.mode === void 0 && $$bindings.mode && mode !== void 0) $$bindings.mode(mode);
  if ($$props.onToggleZoom === void 0 && $$bindings.onToggleZoom && onToggleZoom !== void 0) $$bindings.onToggleZoom(onToggleZoom);
  if ($$props.renderer === void 0 && $$bindings.renderer && renderer !== void 0) $$bindings.renderer(renderer);
  if ($$props.speed === void 0 && $$bindings.speed && speed !== void 0) $$bindings.speed(speed);
  if ($$props.src === void 0 && $$bindings.src && src !== void 0) $$bindings.src(src);
  if ($$props.style === void 0 && $$bindings.style && style !== void 0) $$bindings.style(style);
  if ($$props.width === void 0 && $$bindings.width && width2 !== void 0) $$bindings.width(width2);
  if ($$props.load === void 0 && $$bindings.load && load !== void 0) $$bindings.load(load);
  if ($$props.getLottie === void 0 && $$bindings.getLottie && getLottie !== void 0) $$bindings.getLottie(getLottie);
  if ($$props.play === void 0 && $$bindings.play && play !== void 0) $$bindings.play(play);
  if ($$props.getVersions === void 0 && $$bindings.getVersions && getVersions !== void 0) $$bindings.getVersions(getVersions);
  if ($$props.pause === void 0 && $$bindings.pause && pause !== void 0) $$bindings.pause(pause);
  if ($$props.stop === void 0 && $$bindings.stop && stop !== void 0) $$bindings.stop(stop);
  if ($$props.freeze === void 0 && $$bindings.freeze && freeze !== void 0) $$bindings.freeze(freeze);
  if ($$props.resize === void 0 && $$bindings.resize && resize !== void 0) $$bindings.resize(resize);
  if ($$props.seek === void 0 && $$bindings.seek && seek !== void 0) $$bindings.seek(seek);
  if ($$props.snapshot === void 0 && $$bindings.snapshot && snapshot !== void 0) $$bindings.snapshot(snapshot);
  if ($$props.setLooping === void 0 && $$bindings.setLooping && setLooping !== void 0) $$bindings.setLooping(setLooping);
  if ($$props.setSpeed === void 0 && $$bindings.setSpeed && setSpeed !== void 0) $$bindings.setSpeed(setSpeed);
  if ($$props.setDirection === void 0 && $$bindings.setDirection && setDirection !== void 0) $$bindings.setDirection(setDirection);
  if ($$props.togglePlay === void 0 && $$bindings.togglePlay && togglePlay !== void 0) $$bindings.togglePlay(togglePlay);
  if ($$props.toggleLooping === void 0 && $$bindings.toggleLooping && toggleLooping !== void 0) $$bindings.toggleLooping(toggleLooping);
  if ($$props.setBackground === void 0 && $$bindings.setBackground && setBackground !== void 0) $$bindings.setBackground(setBackground);
  if ($$props.toggleZoom === void 0 && $$bindings.toggleZoom && toggleZoom !== void 0) $$bindings.toggleZoom(toggleZoom);
  $$result.css.add(css$1);
  return `<div style="${escape(width2 ? `width:${width2}px;` : "", true) + escape(height2 ? `height:${height2}px;` : "", true) + escape(style, true)}"${add_attribute("this", wrapperRef, 0)}><div class="${[
    "lottie-player svelte-1aiskgp",
    (controls ? "with-controls" : "") + " " + (isZoomed ? "is-zoomed" : "")
  ].join(" ").trim()}"${add_attribute("this", playerRef, 0)}><div style="${"background: " + escape(background, true)}" class="${["svelte-1aiskgp", "animation"].join(" ").trim()}"${add_attribute("this", animationRef, 0)}>${``}</div> ${controls ? `${validate_component(Controls, "Controls").$$render(
    $$result,
    {
      layout: controlsLayout,
      animationData,
      background,
      controls,
      currentState,
      frame,
      freeze,
      instance,
      loop: loop2,
      lottie,
      pause,
      play,
      progress,
      seek,
      setDirection,
      setSpeed,
      setLooping,
      snapshot,
      src,
      stop,
      toggleZoom,
      toggleLooping,
      togglePlay,
      totalFrames
    },
    {},
    {}
  )}` : ``}</div></div>`;
});
const css = {
  code: ".loading.svelte-manu88{position:absolute;z-index:1000;top:0;left:0;width:100%;height:100%;background:white;display:flex;justify-content:center;align-items:center}",
  map: `{"version":3,"file":"LoadingScreen.svelte","sources":["LoadingScreen.svelte"],"sourcesContent":["<script>\\n  import { LottiePlayer } from '@lottiefiles/svelte-lottie-player';\\n  import { scale } from 'svelte/transition';\\n\\n  import { width, height } from '$lib/stores'\\n\\n  $: size =  Math.min(200, Math.min($width, $height) * ($width < 768 ? 1 : .85 ))\\n\\n<\/script>\\n\\n<section \\n  class=\\"loading\\" \\n  out:scale={{ start: 1, opacity: 0, delay: 0, duration: 500, delay: 0 }}\\n>\\n  \\n  <LottiePlayer\\n    src=\\"/loadingLottie.json\\"\\n    autoplay={true}\\n    loop={true}\\n    controls={false}\\n    renderer=\\"svg\\"\\n    background=\\"transparent\\"\\n    width={size}\\n    height={size}\\n    controlsLayout={[]}\\n  />\\n\\n</section>\\n\\n<style lang=\\"scss\\">.loading {\\n  position: absolute;\\n  z-index: 1000;\\n  top: 0;\\n  left: 0;\\n  width: 100%;\\n  height: 100%;\\n  background: white;\\n  display: flex;\\n  justify-content: center;\\n  align-items: center;\\n}</style>\\n"],"names":[],"mappings":"AA6BmB,sBAAS,CAC1B,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,IAAI,CACb,GAAG,CAAE,CAAC,CACN,IAAI,CAAE,CAAC,CACP,KAAK,CAAE,IAAI,CACX,MAAM,CAAE,IAAI,CACZ,UAAU,CAAE,KAAK,CACjB,OAAO,CAAE,IAAI,CACb,eAAe,CAAE,MAAM,CACvB,WAAW,CAAE,MACf"}`
};
const LoadingScreen = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let size;
  let $width, $$unsubscribe_width;
  let $height, $$unsubscribe_height;
  $$unsubscribe_width = subscribe(width, (value) => $width = value);
  $$unsubscribe_height = subscribe(height, (value) => $height = value);
  $$result.css.add(css);
  size = Math.min(200, Math.min($width, $height) * ($width < 768 ? 1 : 0.85));
  $$unsubscribe_width();
  $$unsubscribe_height();
  return `<section class="loading svelte-manu88">${validate_component(LottiePlayer, "LottiePlayer").$$render(
    $$result,
    {
      src: "/loadingLottie.json",
      autoplay: true,
      loop: true,
      controls: false,
      renderer: "svg",
      background: "transparent",
      width: size,
      height: size,
      controlsLayout: []
    },
    {},
    {}
  )} </section>`;
});
const App = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $locale$1, $$unsubscribe_locale;
  let $linkProjectOn, $$unsubscribe_linkProjectOn;
  let $linkClientOn, $$unsubscribe_linkClientOn;
  let $complexityOn, $$unsubscribe_complexityOn;
  let $hovered, $$unsubscribe_hovered;
  let $selected, $$unsubscribe_selected;
  let $figureWidth, $$unsubscribe_figureWidth;
  let $width, $$unsubscribe_width;
  let $sortBy, $$unsubscribe_sortBy;
  let $fproducts, $$unsubscribe_fproducts;
  let $fgoals, $$unsubscribe_fgoals;
  let $fdesigns, $$unsubscribe_fdesigns;
  let $findustries, $$unsubscribe_findustries;
  let $fyears, $$unsubscribe_fyears;
  let $height, $$unsubscribe_height;
  let $loaded, $$unsubscribe_loaded;
  $$unsubscribe_locale = subscribe($locale, (value) => $locale$1 = value);
  $$unsubscribe_linkProjectOn = subscribe(linkProjectOn, (value) => $linkProjectOn = value);
  $$unsubscribe_linkClientOn = subscribe(linkClientOn, (value) => $linkClientOn = value);
  $$unsubscribe_complexityOn = subscribe(complexityOn, (value) => $complexityOn = value);
  $$unsubscribe_hovered = subscribe(hovered, (value) => $hovered = value);
  $$unsubscribe_selected = subscribe(selected, (value) => $selected = value);
  $$unsubscribe_figureWidth = subscribe(figureWidth, (value) => $figureWidth = value);
  $$unsubscribe_width = subscribe(width, (value) => $width = value);
  $$unsubscribe_sortBy = subscribe(sortBy, (value) => $sortBy = value);
  $$unsubscribe_fproducts = subscribe(fproducts, (value) => $fproducts = value);
  $$unsubscribe_fgoals = subscribe(fgoals, (value) => $fgoals = value);
  $$unsubscribe_fdesigns = subscribe(fdesigns, (value) => $fdesigns = value);
  $$unsubscribe_findustries = subscribe(findustries, (value) => $findustries = value);
  $$unsubscribe_fyears = subscribe(fyears, (value) => $fyears = value);
  $$unsubscribe_height = subscribe(height, (value) => $height = value);
  $$unsubscribe_loaded = subscribe(loaded, (value) => $loaded = value);
  let layout = "block";
  let $$settled;
  let $$rendered;
  do {
    $$settled = true;
    {
      simulation.setLayout(layout);
    }
    {
      simulation.filter($fyears, $findustries, $fdesigns, $fgoals, $fproducts);
    }
    {
      simulation.sort($sortBy);
    }
    {
      simulation.handleWindowResize($width);
    }
    {
      simulation.handleFigureResize($figureWidth);
    }
    {
      simulation.handleSelected($selected);
    }
    {
      simulation.handleHovered($hovered);
    }
    {
      simulation.handleComplexity($complexityOn);
    }
    {
      simulation.handleLinks("clients", $linkClientOn);
    }
    {
      simulation.handleLinks("projects", $linkProjectOn);
    }
    {
      simulation.handleLanguageChange($locale$1);
    }
    {
      console.log(layout);
    }
    $$rendered = `<main class="relative overflow-hidden"${add_styles({
      "width": `${$width}px`,
      "height": `${$height}px`
    })}>${validate_component(Renderer, "Renderer").$$render($$result, {}, {}, {})} ${$loaded ? `${$width < 768 ? `${validate_component(MobileFrame, "MobileFrame").$$render(
      $$result,
      { layout },
      {
        layout: ($$value) => {
          layout = $$value;
          $$settled = false;
        }
      },
      {}
    )}` : `${validate_component(DesktopFrame, "DesktopFrame").$$render(
      $$result,
      { layout },
      {
        layout: ($$value) => {
          layout = $$value;
          $$settled = false;
        }
      },
      {}
    )}`} ${validate_component(TechSheet, "TechSheet").$$render($$result, {}, {}, {})}` : `${validate_component(LoadingScreen, "LoadingScreen").$$render($$result, {}, {}, {})}`} ${validate_component(Onboarding, "Onboarding").$$render($$result, {}, {}, {})}</main>`;
  } while (!$$settled);
  $$unsubscribe_locale();
  $$unsubscribe_linkProjectOn();
  $$unsubscribe_linkClientOn();
  $$unsubscribe_complexityOn();
  $$unsubscribe_hovered();
  $$unsubscribe_selected();
  $$unsubscribe_figureWidth();
  $$unsubscribe_width();
  $$unsubscribe_sortBy();
  $$unsubscribe_fproducts();
  $$unsubscribe_fgoals();
  $$unsubscribe_fdesigns();
  $$unsubscribe_findustries();
  $$unsubscribe_fyears();
  $$unsubscribe_height();
  $$unsubscribe_loaded();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$unsubscribe_width;
  let $$unsubscribe_height;
  let $$unsubscribe_pixelRatio;
  let $_, $$unsubscribe__;
  $$unsubscribe_width = subscribe(width, (value) => value);
  $$unsubscribe_height = subscribe(height, (value) => value);
  $$unsubscribe_pixelRatio = subscribe(pixelRatio, (value) => value);
  $$unsubscribe__ = subscribe($format, (value) => $_ = value);
  let { data } = $$props;
  clients.set(data.clients);
  projects.set(data.projects);
  categories.set(data.categories);
  console.log(data);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  $$unsubscribe_width();
  $$unsubscribe_height();
  $$unsubscribe_pixelRatio();
  $$unsubscribe__();
  return ` ${$$result.head += `<!-- HEAD_svelte-1ei3etp_START -->${$$result.title = `<title>${escape($_("page.title"))}</title>`, ""}<meta name="author" content="datadot + italo doliva"><meta property="og:title"${add_attribute("content", $_("page.title"), 0)}><meta property="og:description"${add_attribute("content", $_("page.description"), 0)}><meta name="twitter:title"${add_attribute("content", $_("page.title"), 0)}><meta name="twitter:description"${add_attribute("content", $_("page.description"), 0)}><meta name="theme-color" content="#6D78FC"><meta charset="UTF-8"><meta name="robots" content="index, follow"><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"><!-- HEAD_svelte-1ei3etp_END -->`, ""} ${validate_component(App, "App").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};

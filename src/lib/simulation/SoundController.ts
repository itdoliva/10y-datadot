import * as PIXI from "pixi.js"


// Libraries
import * as Tone from 'tone';
import _ from 'lodash';
import { gsap } from 'gsap';

import Simulation from "./Simulation";
import Deliverable from './Deliverable';


export default class SoundController {
  private simulation: Simulation

  private curNode

  private initialized = false
  
  private volPlayer = -5
  private volSynth = -15

  private columnTime = '12n'

  private drumPlayers: any

  private playing = false
  private stepCounter = 0
  private patternLength = 4

  
  private notes = _.range(3, 4 + 1).map((octave) => {
    return [ 'C', 'D', 'E', 'G', 'A' ].map((note) => {
      return note + octave
    })
  }).flat()

  private noteIdx = 8
  private noteIncrement = -1

  private filterNext = false
  private reverbNext = false

  private release = 20
  private releaseMax = 30
  private releaseMin = 5
  
  private attack = .2
  private attackMax = .4
  private attackMin = .005
  
  private pingPongs: any[] = []

  private snareCounter = 0

  private autoFilter
  private reverb
  private pingPong


  constructor(simulation: Simulation) {
    this.simulation = simulation
  }

  public loadPlayers(baseURL: string) {
    const soundURL = (route: string) => baseURL + route;

    // Effects
    this.autoFilter = new Tone.AutoFilter({ frequency: 15, wet: 0.8, depth: 0.9 }).toDestination()
    this.reverb = new Tone.Reverb(3).toDestination()
    this.pingPong = new Tone.PingPongDelay('4n', 0.2).toDestination()

    // Instruments
    const drumReverb = new Tone.Convolver(soundURL('/small-drum-room.wav')).toDestination();
    const snarePanner = new Tone.Panner().connect(drumReverb);
    new Tone.LFO(0.13, -0.25, 0.25).connect(snarePanner.pan);
  
    this.drumPlayers = {
      kick: new Tone.Player(soundURL('/808-kick-vm.mp3')).toDestination(),
      snare: new Tone.Player(soundURL('/flares-snare-vm.mp3')).connect(snarePanner),
      hihatClosed: new Tone.Player(soundURL('/808-hihat-vm.mp3')).connect(new Tone.Panner(-0.5).connect(drumReverb)),
      hihatOpen: new Tone.Player(soundURL('/808-hihat-open-vm.mp3')).connect(new Tone.Panner(-0.5).connect(drumReverb)),
      tomLow: new Tone.Player(soundURL('/slamdam-tom-low-vm.mp3')).connect(new Tone.Panner(-0.4).connect(drumReverb)),
      tomMid: new Tone.Player(soundURL('/slamdam-tom-mid-vm.mp3')).connect(drumReverb),
      tomHigh: new Tone.Player(soundURL('/slamdam-tom-high-vm.mp3')).connect(new Tone.Panner(0.4).connect(drumReverb)),
      clap: new Tone.Player(soundURL('/909-clap-vm.mp3')).connect(new Tone.Panner(0.5).connect(drumReverb)),
      rim: new Tone.Player(soundURL('/909-rim-vm.wav')).connect(new Tone.Panner(0.5).connect(drumReverb)),
    }

    Object.entries(this.drumPlayers).forEach(([key, player]) => {
      player.volume.value = this.volPlayer;

      const pingPongPlayer = new Tone.Player(player.buffer).connect(this.pingPong);
      pingPongPlayer.volume.value = this.volPlayer;

      this.drumPlayers[key + "PingPong"] = pingPongPlayer;
    });
  }


  public resetParams() {
    this.stepCounter = 0

    this.release = 20
    this.attack = .2
    this.snareCounter = 0
    this.filterNext = false
    this.reverbNext = false
    this.noteIdx = 8
    this.noteIncrement = -1

    this.curNode = undefined
  }


  public togglePlaying() {
    if (!this.initialized) {
      this.initialized = true

      Promise.all([ Tone.start(), Tone.loaded() ]).then(() => {
        new Tone.Loop(this.tick, this.columnTime).start(0)
        Tone.getTransport().start()
      })
    }

    this.resetParams()
    this.playing = !this.playing

    return this.playing
  }

  private tick = (time) => {
    if (!this.playing || !_.isNumber(this.stepCounter)) return

    const stepIdx = this.stepCounter % this.simulation.activeCount
    const patternIdx = Math.floor(stepIdx / this.patternLength)

    const columnIdx = stepIdx % this.patternLength
    const evenPattern = patternIdx % 2 === 0

    const node = this.simulation.getDeliverableNodes().find(d => d.active && d.i === stepIdx)
    const nodesInPattern = this.simulation.getDeliverableNodes()
      .filter(d => Math.floor(d.i / this.patternLength) === patternIdx)
      
    this.curNode = node

    if (!node) return

    let animate = false
    const animateParams = {
      tint: 0xFFFFFF,
      rotate: 0
    }

    const { categories } = node


    if (categories.includes("product.outras-interfaces")) {
      this.incrementNoteFrequency(2)
    }

    if (categories.includes("goal.jornalistico-editorial")) {
      this.filterNext = true
    }

    if (categories.includes("goal.impacto-positivo")) {
      this.reverbNext = true
    }

    if (categories.includes("design.editorial")) {
      gsap.fromTo(this,
        { release: this.releaseMax },
        { release: this.releaseMin,
          duration: 2,
          ease: 'power2.inOut',
          overwrite: 'auto'
         })
    }

    if (categories.includes("design.datavis")) {
      gsap.fromTo(this,
        { attack: this.attackMax },
        { attack: this.attackMin,
          duration: 2.5,
          overwrite: 'auto'
         })
    }


    if (columnIdx % 2 === 0) {
      if (categories.includes('design.infografia')) {
        animate = true
        this.drumPlayers.hihatClosed.start(time);
      }

      if (categories.includes("design.user-interface") || categories.includes("design.design-de-servicos")) {
        animate = true
        this.drumPlayers.hihatOpen.start(time)
      }

      if (categories.includes('industry.comunicacao')) {
        animate = true
        this.drumPlayers.clapPingPong.start(time);
      }
    }
    else {
      if (categories.includes('industry.educacao')) {
        animate = true
        this.drumPlayers.rimPingPong.start(time);
      }
    }

    if (columnIdx === 0) {
      if (nodesInPattern.filter(d => d.categories.includes('product.video')).length >= 3) {
        this.noteIncrement = this.noteIncrement * -1
      }

      if (categories.includes("channel.digital")) {
        animate = true

        const poly = new Tone.PolySynth().toDestination()
        poly.set({ envelope: { attack: this.attack, release: this.release } })
        poly.volume.value = this.volSynth

        if (this.filterNext) {
          poly.connect(this.autoFilter)
          this.filterNext = false
        }

        if (this.reverbNext) {
          poly.connect(this.reverb)
          this.reverbNext = false
        }

        this.triggerAndRelease(poly, this.notes[this.noteIdx])
      }

      if (evenPattern && categories.includes("design.ilustracao")) {
        animate = true

        const playerKey = categories.includes('goal.educacional')
          ? 'kickPingPong'
          : 'kick'

        this.drumPlayers[playerKey].start(time)
      }
  
      if (categories.includes('design.motion-graphics')) {

        if (!categories.includes('product.outras-interfaces')) {
          this.incrementNoteFrequency()
        }
        
        this.snareCounter++
        animate = true
  
        const playerKey = this.snareCounter % 3 === 0
          ? 'snarePingPong'
          : 'snare'

        this.drumPlayers[playerKey].start(time)
      }
    }

    if (animate) {
      node.context.animateSound(animateParams)
    }

    this.stepCounter++
  }

  private triggerAndRelease(poly, note, duration='8n') {
    poly.triggerAttackRelease(note, duration)

    Tone.getTransport().scheduleOnce(() => {
      poly.dispose()
    }, Tone.now() + Tone.Time("2n").toSeconds())
  }


  private incrementNoteFrequency(k=1) {
    let idx = this.noteIdx + this.noteIncrement * k
  
    if (idx < 0 || idx >= this.notes.length) {
      this.noteIncrement = this.noteIncrement * -1
      idx = this.noteIdx + this.noteIncrement * k
    }
  
    this.noteIdx = idx
  }
}
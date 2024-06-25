// Libraries
import * as Tone from 'tone';
import _ from 'lodash';
import { gsap } from 'gsap';

import Simulation from "./Simulation";
import Deliverable from './Deliverable';


export default class SoundController {
  private simulation: Simulation

  private initialized = false

  private columnTime = '12n'

  private drumPlayers: any

  private playing = false
  private stepCounter = 0
  private patternLength = 4

  private scaleNotes = [ 'C', 'D', 'E', 'F', 'G', 'A', 'B' ]
  private notes: string[]
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

  constructor(simulation: Simulation) {
    this.simulation = simulation

    this.notes = _.range(2, 7 + 1).map((n) => this.scaleNotes.map((note) => note + n)).flat();
  }

  public loadPlayers(baseURL: string) {
    const soundURL = (route: string) => baseURL + route;
    const volumeObject = (dynamicRoute: string) => {
      return Object.fromEntries([ "vh", "vm", "vl" ].map(v => [ v, soundURL(dynamicRoute.replace("{v}", v)) ]))
    }

    const reverb = new Tone.Convolver(soundURL('/small-drum-room.wav')).toDestination();
    const snarePanner = new Tone.Panner().connect(reverb);
    new Tone.LFO(0.13, -0.25, 0.25).connect(snarePanner.pan);
  
    this.drumPlayers = {
      kick: new Tone.Players(volumeObject('/808-kick-{v}.mp3')).toDestination(),
      snare: new Tone.Players(volumeObject('/flares-snare-{v}.mp3')).connect(snarePanner),
      hihatClosed: new Tone.Players(volumeObject('/808-hihat-{v}.mp3')).connect(new Tone.Panner(-0.5).connect(reverb)),
      hihatOpen: new Tone.Players(volumeObject('/808-hihat-open-{v}.mp3')).connect(new Tone.Panner(-0.5).connect(reverb)),
      tomLow: new Tone.Players(volumeObject('/slamdam-tom-low-{v}.mp3')).connect(new Tone.Panner(-0.4).connect(reverb)),
      tomMid: new Tone.Players(volumeObject('/slamdam-tom-mid-{v}.mp3')).connect(reverb),
      tomHigh: new Tone.Players(volumeObject('/slamdam-tom-high-{v}.mp3')).connect(new Tone.Panner(0.4).connect(reverb)),
      clap: new Tone.Players(volumeObject('/909-clap-{v}.mp3')).connect(new Tone.Panner(0.5).connect(reverb)),
      rim: new Tone.Players(volumeObject('/909-rim-{v}.wav')).connect(new Tone.Panner(0.5).connect(reverb)),
    }
  }



  public togglePlaying() {
    if (!this.initialized) {
      this.initialized = true

      Promise.all([ Tone.start(), Tone.loaded() ]).then(() => {
        new Tone.Loop(this.tick, this.columnTime).start(0)
        Tone.Transport.start()
      })
    }

    this.stepCounter = 0

    this.release = 20
    this.attack = .2
    this.snareCounter = 0
    this.filterNext = false
    this.reverbNext = false
    this.noteIdx = 8
    this.noteIncrement = -1

    this.disposePingPongs()
    
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

    console.log('stepCounter', this.stepCounter, 'patternIdx', patternIdx, 'columnIdx', columnIdx)

    if (!node) return

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

    if (columnIdx % 2 === 0 && categories.includes('design.infografia')) {
      this.drumPlayers.hihatClosed.player('vh').start(time);
    }

    if (columnIdx === 0) {
      if (nodesInPattern.filter(d => d.categories.includes('product.video')).length >= 3) {
        this.noteIncrement = this.noteIncrement * -1
      }

      if (categories.includes("channel.digital")) {
        const poly = new Tone.PolySynth().toDestination();
        poly.set({ envelope: { attack: this.attack, release: this.release } })

        if (this.filterNext) {
          this.filterSynth(poly)
        }

        if (this.reverbNext) {
          this.reverbSynth(poly)
        }

        poly.triggerAttackRelease(this.notes[this.noteIdx], '8n')
      }


      if (evenPattern && categories.includes("design.ilustracao")) {
        const player = this.drumPlayers.kick.player('vm')
  
        if (categories.includes('goal.educacional')) {
          const pp = new Tone.PingPongDelay('4n', 0.2).toDestination()
          player.connect(pp)
  
          this.pingPongs.push([ player, pp ])
        }
  
        player.start(time)
      }
  
      if (categories.includes('design.motion-graphics')) {

        this.snareCounter++
  
        if (!categories.includes('product.outras-interfaces')) {
          this.incrementNoteFrequency()
        }
  
        const player = this.drumPlayers.snare.player('vm')
  
        if (this.snareCounter % 3 === 0) {
          const pp = new Tone.PingPongDelay('4n', 0.2).toDestination()
          player.connect(pp)
  
          this.pingPongs.push([ player, pp ])
        }
  
        if (this.snareCounter % 9 === 0) {
          this.disposePingPongs()
        }
  
        player.start(time)
      }
    }





    this.stepCounter++
  }

  private disposePingPongs() {
    while (this.pingPongs.length) {
      const [ player, pp ] = this.pingPongs.pop()
      pp.dispose()
      player.disconnect(pp)
    }
  }

  private filterSynth(poly) {
    this.filterNext = false

    const autoFilter = new Tone.AutoFilter({ frequency: 15, wet: 0.8, depth: 0.9 }).toDestination()
    autoFilter.start()

    poly.connect(autoFilter)
  }

  private reverbSynth(poly) {
    this.reverbNext = false

    const reverb = new Tone.Reverb(3).toDestination()

    poly.connect(reverb)
  }

  private incrementStep() {
    this.stepCounter++
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
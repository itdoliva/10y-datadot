export default class NodeAttributes {
  public id: number

  public active: boolean;

  public x: number
  public y: number
  public radius: number
  public theta: number
  public time: number

  constructor(id: number, attr: any) {
    this.id = id

    this.active = attr.active
    this.x = attr.x
    this.y = attr.y
    this.radius = attr.radius
    this.theta = attr.theta
    this.time = attr.time
  }
}
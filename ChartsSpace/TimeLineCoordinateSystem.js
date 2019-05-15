 ﻿/*

This Object object is responsible for defining the coordinate system in a TimeLine.

The scale on the X axis depends on the time.
The scale on the Y axis depends on the data that wants to be plotted. Usually we need the Max amount on that data to generate a proper scale.

*/

function newTimeLineCoordinateSystem () {
  let thisObject = {
    min: undefined,
    max: undefined,
    scale: undefined,
    transformThisPoint: transformThisPoint,
    transformThisPoint2: transformThisPoint2,
    unInverseTransform: unInverseTransform,
    inverseTransformUncappedY: inverseTransformUncappedY,
    initializeX: initializeX,
    initializeY: initializeY,
    initialize: initialize
  }

  var min = {
    x: 0,
    y: 0
  }

  var max = {
    x: 0,
    y: 0
  }

  var scale = {
    x: 0,
    y: 0
  }

  thisObject.min = min
  thisObject.max = max
  thisObject.scale = scale

  let maxHeight

  return thisObject

  function initialize (minValue, maxValue, maxWidth, pMaxHeight) {
        /* Defines the min and max value of rate that we are going to transport to the available screen at the center position. */

    thisObject.min.x = minValue.x // * 0.999; // 0.1% less
    thisObject.max.x = maxValue.x // * 1.001; // 0.1% more

    thisObject.min.y = minValue.y // * 0.999; // 0.1% less
    thisObject.max.y = maxValue.y // * 1.001; // 0.1% more

        /* Defines the initial Zoom level at center position. */

    thisObject.scale.x = maxWidth / (thisObject.max.x - thisObject.min.x)
    thisObject.scale.y = pMaxHeight / (thisObject.max.y - thisObject.min.y)

    maxHeight = pMaxHeight
  }

  function initializeX (minValue, maxValue, maxWidth) {
    thisObject.min.x = minValue.x // * 0.999; // 0.1% less
    thisObject.max.x = maxValue.x // * 1.001; // 0.1% more

    thisObject.scale.x = maxWidth / (thisObject.max.x - thisObject.min.x)
  }

  function initializeY (minValue, maxValue, pMaxHeight) {
    thisObject.min.y = minValue.y // * 0.999; // 0.1% less
    thisObject.max.y = maxValue.y // * 1.001; // 0.1% more

    thisObject.scale.y = pMaxHeight / (thisObject.max.y - thisObject.min.y)

    maxHeight = pMaxHeight
  }

  function transformThisPoint (point) {
        /*

        This is the straigh fordward transformation this object provides. The input is a point on the data set that wants to be plotted in a timeline.
        The x value of the point must be a datetime.valueOf() and is going to be transformed into an x value on the coordinate system of the timeline.
        The y value should be a value in the dataset at that moment in time. Depending on how this coordinate system was initialized then are the
        possible values y can have. For sure it must be in the range between the min and max y declared at initialization. The y value has a special
        treatment since the browser canvas object used, has a zero y value at the top, while the timeline we use has a zero y value at the botton,
        for that reason y is flipped.

        Besides this, what we do is to multiply by the scale, which in turn is calculated at initialization time depending on the values provided.

        */

    point = {
      x: (point.x - this.min.x) * this.scale.x,
      y: maxHeight - (point.y - this.min.y) * this.scale.y
    }

    return point
  }

  function transformThisPoint2 (point) {
    point = {
      x: (point.x - this.min.x) * this.scale.x,
      y: (maxHeight - point.y - this.min.y) * this.scale.y
    }

    return point
  }

  function unInverseTransform (point, inverseY) {
    point = {
      x: (point.x / this.scale.x) + this.min.x,
      y: (inverseY - point.y) / this.scale.y + this.min.y
    }

    return point
  }

  function inverseTransformUncappedY (point, inverseY) {
    point = {
      x: (point.x - this.min.x) * this.scale.x,
      y: (inverseY - point.y) * this.scale.y
    }

    return point
  }
}



function newFrame () {
  const PANEL_CORNERS_RADIUS = 5
  const TITLE_BAR_HEIGHT = 15 // this must be grater than radius

  let thisObject = {
    type: 'Rectangle',
    containerName: '',                  // This is for debugging purposes only.
    parentFrame: undefined,             // Here we store the parent cointainer zoom object.
    radius: 0,
    position: undefined,
    container: undefined,
    width: browserCanvas.width,
    height: browserCanvas.height,
    getBodyHeight: getBodyHeight,
    draw: draw,
    fitIntoFrame: fitIntoFrame,
    frameThisPoint: frameThisPoint,     // This function changes the actual frame coordinate system to the screen coordinate system.
    unframeThisPoint: unframeThisPoint,
    isThisPointHere: isThisPointHere,   // This function return true is the point received as parameter lives within this frame.
    isThisScreenPointHere: isThisScreenPointHere,
    isInViewPort: isInViewPort,
    canYouMoveHere: canYouMoveHere,
    initialize: initialize
  }

  return thisObject

  function initialize (pType) {
    if (pType !== undefined) { thisObject.type = pType }

    let position = {
      x: 0,
      y: 0
    }

    thisObject.position = position
  }

  function getBodyHeight () {
    return thisObject.height - TITLE_BAR_HEIGHT
  }

  function isInViewPort () {
   /* This function is usefull to know if the object who has this frame is currently appearing at least in part at the viewPort */

    point1 = {
      x: 0,
      y: 0
    }

    point3 = {
      x: thisObject.width,
      y: thisObject.height
    }

       /* Now the transformations. */

    point1 = transformThisPoint(point1, thisObject.container)
    point3 = transformThisPoint(point3, thisObject.container)

    if (point1.x < viewPort.visibleArea.topRight.x && point1.y < viewPort.visibleArea.bottomRight.y && point3.x > viewPort.visibleArea.bottomLeft.x && point3.y > viewPort.visibleArea.topLeft.y) {
      return true
    } else {
      return false
    }
  }

  function frameThisPoint (point) {
   /* We need not to modify the point received, so me make a copy of it. */

    let checkPoint = {
      x: point.x,
      y: point.y
    }

    let parentPoint = {
      x: 0,
      y: 0
    }

    let returnPoint = {
      x: 0,
      y: 0
    }

    if (thisObject.parentFrame !== undefined) {
      parentPoint = thisObject.parentFrame.frameThisPoint(checkPoint)

      returnPoint.x = parentPoint.x + thisObject.position.x
      returnPoint.y = parentPoint.y + thisObject.position.y
    } else {
      returnPoint.x = checkPoint.x + thisObject.position.x
      returnPoint.y = checkPoint.y + thisObject.position.y
    }

    return returnPoint
  }

  function unframeThisPoint (point) {
   /* We need not to modify the point received, so me make a copy of it. */

    let checkPoint = {
      x: point.x,
      y: point.y
    }

    let parentPoint = {
      x: 0,
      y: 0
    }

    let returnPoint = {
      x: 0,
      y: 0
    }

    if (thisObject.parentFrame !== undefined) {
      parentPoint = thisObject.parentFrame.unframeThisPoint(checkPoint)

      returnPoint.x = parentPoint.x - thisObject.position.x
      returnPoint.y = parentPoint.y - thisObject.position.y
    } else {
      returnPoint.x = checkPoint.x - thisObject.position.x
      returnPoint.y = checkPoint.y - thisObject.position.y
    }

    return returnPoint
  }

  function fitIntoFrame (point) {
        /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

    if (point.x > thisObject.width) {
      point.x = thisObject.width
    }

    if (point.x < 0) {
      point.x = 0
    }

    if (point.y > thisObject.height) {
      point.y = thisObject.height
    }

    if (point.y < 0) {
      point.y = 0
    }

    return point
  }

  function canYouMoveHere (tempDisplacement) {
       /*

       The current frame has a position and a displacement. We need to check that none of the boundaries points of the frame fall outside of its container frame.
       First we apply the theoreticall displacement.

       */

    point1 = {
      x: thisObject.position.x,
      y: thisObject.position.y
    }

    point2 = {
      x: thisObject.position.x + thisObject.width,
      y: thisObject.position.y
    }

    point3 = {
      x: thisObject.position.x + thisObject.width,
      y: thisObject.position.y + thisObject.height
    }

    point4 = {
      x: thisObject.position.x,
      y: thisObject.position.y + thisObject.height
    }

       /* Now the transformations. */

    if (thisObject.parentFrame !== undefined) {
  // If there is not a parent then there is no point to check bounderies.

      point1 = thisObject.parentFrame.frameThisPoint(point1)
      point2 = thisObject.parentFrame.frameThisPoint(point2)
      point3 = thisObject.parentFrame.frameThisPoint(point3)
      point4 = thisObject.parentFrame.frameThisPoint(point4)

           /* We apply the temporary displacement. */

      point1 = tempDisplacement.displaceThisPoint(point1)
      point2 = tempDisplacement.displaceThisPoint(point2)
      point3 = tempDisplacement.displaceThisPoint(point3)
      point4 = tempDisplacement.displaceThisPoint(point4)

           /* We add the actual displacement. */

      point1 = thisObject.container.displacement.displaceThisPoint(point1)
      point2 = thisObject.container.displacement.displaceThisPoint(point2)
      point3 = thisObject.container.displacement.displaceThisPoint(point3)
      point4 = thisObject.container.displacement.displaceThisPoint(point4)

      if (thisObject.parentFrame.isThisPointHere(point1) === false) {
        return false
      }

      if (thisObject.parentFrame.isThisPointHere(point2) === false) {
        return false
      }

      if (thisObject.parentFrame.isThisPointHere(point3) === false) {
        return false
      }

      if (thisObject.parentFrame.isThisPointHere(point4) === false) {
        return false
      }
    }

    return true
  }

  function isThisPointHere (point, outsideViewPort, dontTransform) {
 // The second parameter is usefull when you want to check a point that you already know is outside the viewport.

       /* We need not to modify the point received, so me make a copy of it. */

    let checkPoint = {
      x: point.x,
      y: point.y
    }

       /* The point received is on the screen coordinates system, which already has zoom and displacement applied. We need to remove the zoom and displacement
       in order to have the point on the containers coordinate system and be able to compare it with its dimmensions. */
    if (dontTransform === false || dontTransform === undefined) {
      if (outsideViewPort === true) {
        checkPoint = thisObject.container.displacement.undisplaceThisPoint(checkPoint)
        checkPoint = thisObject.container.frame.unframeThisPoint(checkPoint)
      } else {
        checkPoint = unTransformThisPoint(checkPoint, thisObject.container)
      }
    }

   /* Now we check if the resulting point is whin the current Frame. */

    if (thisObject.type === 'Circle') {
      let distance = Math.sqrt(Math.pow(thisObject.position.x - point.x, 2) + Math.pow(thisObject.position.y - point.y, 2))

      if (distance < thisObject.radius) {
        return true
      } else {
        return false
      }
    }

    if (thisObject.type === 'Rectangle') {
      if (checkPoint.x < 0 || checkPoint.y < 0 || checkPoint.x > thisObject.width || checkPoint.y > thisObject.height) {
        return false
      } else {
        return true
      }
    }
  }

  function isThisScreenPointHere (point) {
    let checkPoint = {
      x: point.x,
      y: point.y
    }

    let thisPoint = {
      x: thisObject.position.x,
      y: thisObject.position.y
    }

    thisPoint = thisObject.parentFrame.frameThisPoint(thisPoint)

   /* Now we check if the resulting point is whin the current Frame. */

    if (thisObject.type === 'Circle') {
      let distance = Math.sqrt(Math.pow(thisPoint.x - checkPoint.x, 2) + Math.pow(thisPoint.y - checkPoint.y, 2))

      if (distance < thisObject.radius) {
        return true
      } else {
        return false
      }
    }

    if (thisObject.type === 'Rectangle') {
      if (checkPoint.x < 0 || checkPoint.y < 0 || checkPoint.x > thisObject.width || checkPoint.y > thisObject.height) {
        return false
      } else {
        return true
      }
    }
  }

  function draw (drawGrid, drawBorders, drawBackground, fitFunction) {
    if (drawBorders === true) {
      borders(fitFunction)
    }

    if (drawGrid === true) {
      grid(fitFunction)
    }

    if (drawBackground === true) {
      background(fitFunction)
    }
  }

  function background (fitFunction) {
    let params = {
      cornerRadius: 5,
      lineWidth: 0.1,
      opacity: 0.75,
      container: thisObject.container,
      borderColor: UI_COLOR.DARK,
      backgroundColor: UI_COLOR.WHITE,
      fitFunction: fitFunction
    }

    roundedCornersBackground(params)

    titleBarPoint1 = {
      x: 0,
      y: TITLE_BAR_HEIGHT
    }

    titleBarPoint2 = {
      x: thisObject.width,
      y: TITLE_BAR_HEIGHT
    }

       /* Now the transformations. */

    titleBarPoint1 = frameThisPoint(titleBarPoint1)
    titleBarPoint2 = frameThisPoint(titleBarPoint2)

    if (fitFunction !== undefined) {
      titleBarPoint1 = fitFunction(titleBarPoint1)
      titleBarPoint2 = fitFunction(titleBarPoint2)
    }

       /* We paint the title bar now */

    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK + ', 1)'
    browserCanvasContext.beginPath()

    browserCanvasContext.moveTo(titleBarPoint1.x, titleBarPoint1.y)
    browserCanvasContext.lineTo(borderPoint1.x - PANEL_CORNERS_RADIUS, borderPoint1.y)
    browserCanvasContext.arc(borderPoint1.x, borderPoint1.y, PANEL_CORNERS_RADIUS, 1.0 * Math.PI, 1.5 * Math.PI)
    browserCanvasContext.lineTo(borderPoint2.x, borderPoint2.y - PANEL_CORNERS_RADIUS)
    browserCanvasContext.arc(borderPoint2.x, borderPoint2.y, PANEL_CORNERS_RADIUS, 1.5 * Math.PI, 2.0 * Math.PI)
    browserCanvasContext.lineTo(titleBarPoint2.x, titleBarPoint2.y)

    browserCanvasContext.closePath()
    browserCanvasContext.fill()

    browserCanvasContext.lineWidth = 0.1
    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.MANGANESE_PURPLE + ', 0.75)'
    browserCanvasContext.stroke()

       /* print the title */

    let labelPoint
    let fontSize = 10

    browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

    let label = thisObject.containerName

    let xOffset = label.length / 2 * fontSize * FONT_ASPECT_RATIO
    let yOffset = (TITLE_BAR_HEIGHT - fontSize) / 2 + 2

    labelPoint = {
      x: thisObject.width / 2 - xOffset,
      y: TITLE_BAR_HEIGHT - yOffset
    }

    labelPoint = thisObject.frameThisPoint(labelPoint)

    if (fitFunction !== undefined) {
      labelPoint = fitFunction(labelPoint)
    }

    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
    browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
  }

  function borders (fitFunction) {
       /* Lest get the important points of the drawing so as to apply the needed transformations. */

    let point1
    let point2
    let point3
    let point4

    point1 = {
      x: 0,
      y: 0
    }

    point2 = {
      x: thisObject.width,
      y: 0
    }

    point3 = {
      x: thisObject.width,
      y: thisObject.height
    }

    point4 = {
      x: 0,
      y: thisObject.height
    }

       /* Now the transformations. */

    point1 = transformThisPoint(point1, thisObject.container)
    point2 = transformThisPoint(point2, thisObject.container)
    point3 = transformThisPoint(point3, thisObject.container)
    point4 = transformThisPoint(point4, thisObject.container)

    if (fitFunction !== undefined) {
      point1 = fitFunction(point1)
      point2 = fitFunction(point2)
      point3 = fitFunction(point3)
      point4 = fitFunction(point4)
    }

       /* Lets start the drawing. */

    browserCanvasContext.beginPath()
    browserCanvasContext.moveTo(point1.x, point1.y)
    browserCanvasContext.lineTo(point2.x, point2.y)
    browserCanvasContext.lineTo(point3.x, point3.y)
    browserCanvasContext.lineTo(point4.x, point4.y)
    browserCanvasContext.lineTo(point1.x, point1.y)
    browserCanvasContext.closePath()

    browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 1)'
    browserCanvasContext.lineWidth = 1
    browserCanvasContext.stroke()

    browserCanvasContext.closePath()
  }

  function grid (fitFunction, smallLines) {
    if (smallLines === true) {
           /* Small Lines */

      let step = thisObject.width / 100

      browserCanvasContext.beginPath()

      for (let i = 0; i < thisObject.width; i = i + step) {
        for (let j = 0; j < thisObject.height; j = j + step) {
          let point1 = {
            x: 0,
            y: j
          }

          let point2 = {
            x: thisObject.width,
            y: j
          }

          point1 = transformThisPoint(point1, thisObject.container)
          point2 = transformThisPoint(point2, thisObject.container)

          if (fitFunction !== undefined) {
            point1 = fitFunction(point1)
            point2 = fitFunction(point2)
          }

          browserCanvasContext.moveTo(point1.x, point1.y)
          browserCanvasContext.lineTo(point2.x, point2.y)
        }

        let point3 = {
          x: thisObject.width,
          y: thisObject.height
        }

        let point4 = {
          x: 0,
          y: thisObject.height
        }

        point3 = transformThisPoint(point3, thisObject.container)
        point4 = transformThisPoint(point4, thisObject.container)

        if (fitFunction !== undefined) {
          point3 = fitFunction(point3)
          point4 = fitFunction(point4)
        }

        browserCanvasContext.moveTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
      }
      browserCanvasContext.closePath()
      browserCanvasContext.strokeStyle = 'rgba(150, 150, 150, 0.1)'
      browserCanvasContext.lineWidth = 1
      browserCanvasContext.stroke()
    }

       /* Main Lines */

    let step = thisObject.width / 20

    browserCanvasContext.beginPath()

    for (let i = 0; i < thisObject.width; i = i + step) {
      for (let j = 0; j < thisObject.height; j = j + step) {
        let point1 = {
          x: 0,
          y: j
        }

        let point2 = {
          x: thisObject.width,
          y: j
        }

        point1 = transformThisPoint(point1, thisObject.container)
        point2 = transformThisPoint(point2, thisObject.container)

        if (fitFunction !== undefined) {
          point1 = fitFunction(point1)
          point2 = fitFunction(point2)
        }

        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
      }

      let point3 = {
        x: i,
        y: 0
      }

      let point4 = {
        x: i,
        y: thisObject.height
      }

      point3 = transformThisPoint(point3, thisObject.container)
      point4 = transformThisPoint(point4, thisObject.container)

      if (fitFunction !== undefined) {
        point3 = fitFunction(point3)
        point4 = fitFunction(point4)
      }

      browserCanvasContext.moveTo(point3.x, point3.y)
      browserCanvasContext.lineTo(point4.x, point4.y)
    }
    browserCanvasContext.closePath()
    browserCanvasContext.strokeStyle = 'rgba(100, 100, 100, 0.2)'
    browserCanvasContext.lineWidth = 1
    browserCanvasContext.stroke()
  }
}

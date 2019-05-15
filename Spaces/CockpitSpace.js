
 function newCockpitSpace () {
   const MODULE_NAME = 'CockpitSpace'

   let thisObject = {
     container: undefined,
     status: 'BOTTOM',
     assetBalances: undefined,
     draw: draw,
     physics: physics,
     getContainer: getContainer,
     finalize: finalize,
     initialize: initialize
   }

   thisObject.container = newContainer()
   thisObject.container.initialize(MODULE_NAME)
   thisObject.container.isClickeable = false
   thisObject.container.isDraggeable = true
   thisObject.container.notDraggingOnX = true

   controlsMap = new Map()
   resize()

   let selfMouseClickEventSubscriptionId
   let canvasBrowserResizedEventSubscriptionId

   return thisObject

   function finalize () {
     thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
     thisObject.container.eventHandler.stopListening(canvasBrowserResizedEventSubscriptionId)

     thisObject.container.finalize()
     thisObject.container = undefined
     thisObject.assetBalances = undefined
   }

   function initialize () {
     canvasBrowserResizedEventSubscriptionId = window.canvasApp.eventHandler.listenToEvent('Browser Resized', resize)
     selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)

     thisObject.assetBalances = newAssetBalances()
     thisObject.assetBalances.initialize()
   }

   function onMouseClick (event) {

   }

   function resize () {
     thisObject.container.frame.position.x = 0
     thisObject.container.frame.position.y = browserCanvas.height - COCKPIT_SPACE_HEIGHT

     thisObject.container.frame.width = browserCanvas.width
     thisObject.container.frame.height = COCKPIT_SPACE_HEIGHT
   }

   function physics () {
     /* Check the limits */

     thisObject.status = 'MIDDLE'

     let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE)
     if (user !== null) { // Only if user is logged in
       thisObject.container.isDraggeable = true
     } else {
       thisObject.container.isDraggeable = false
     }

     if (thisObject.container.frame.position.y > browserCanvas.height * 99.5 / 100 - COCKPIT_SPACE_HEIGHT) {
       thisObject.container.frame.position.y = browserCanvas.height - COCKPIT_SPACE_HEIGHT
       thisObject.status = 'BOTTOM'
       canvas.strategySpace.makeInvisible()
     } else {
       canvas.strategySpace.makeVisible()
     }

     if (thisObject.container.frame.position.y < browserCanvas.height * 0.5 / 100) {
       thisObject.container.frame.position.y = 0
       thisObject.status = 'TOP'
       canvas.panelsSpace.visible = false
     } else {
       canvas.panelsSpace.visible = true
     }

     COCKPIT_SPACE_POSITION = thisObject.container.frame.position.y
     viewPort.resize()
   }

   function getContainer (point) {
     if (thisObject.container.frame.isThisPointHere(point, true) === true) {
       return thisObject.container
     } else {
       return undefined
     }
   }

   function draw () {
     thisObject.container.frame.draw(false, false)

     drawBackground()

     thisObject.assetBalances.draw()
   }

   function drawBackground () {
     let opacity = 1

     let zeroPoint = {
       x: 0,
       y: 0
     }

     const RED_LINE_HIGHT = 5

     zeroPoint = thisObject.container.frame.frameThisPoint(zeroPoint)

     browserCanvasContext.beginPath()
     browserCanvasContext.rect(zeroPoint.x, zeroPoint.y, thisObject.container.frame.width, thisObject.container.frame.height)
     browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + opacity + ')'
     browserCanvasContext.closePath()
     browserCanvasContext.fill()

     browserCanvasContext.beginPath()
     browserCanvasContext.rect(zeroPoint.x, zeroPoint.y, thisObject.container.frame.width, RED_LINE_HIGHT)
     browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'
     browserCanvasContext.closePath()
     browserCanvasContext.fill()

     browserCanvasContext.beginPath()
     browserCanvasContext.rect(zeroPoint.x, zeroPoint.y - RED_LINE_HIGHT + thisObject.container.frame.height, thisObject.container.frame.width, RED_LINE_HIGHT)
     browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'
     browserCanvasContext.closePath()
     browserCanvasContext.fill()

     let user = window.localStorage.getItem(LOGGED_IN_USER_LOCAL_STORAGE)
     if (user !== null) { // Only if user is logged in
       arrow()
     }
   }

   function arrow () {
     const X_OFFSET = thisObject.container.frame.width / 2
     const Y_OFFSET = thisObject.container.frame.height / 2
     const HEIGHT = 6
     const WIDTH = 18
     const LINE_WIDTH = 3
     const OPACITY = 1
     let DISTANCE_BETWEEN_ARROWS = 0
     let ARROW_1_DIRECTION = 0
     let ARROW_2_DIRECTION = 0

     switch (thisObject.status) {

       case ('TOP'): {
         ARROW_1_DIRECTION = -1
         ARROW_2_DIRECTION = -1
         DISTANCE_BETWEEN_ARROWS = 6
         break
       }
       case ('MIDDLE'): {
         ARROW_1_DIRECTION = 1
         ARROW_2_DIRECTION = -1
         DISTANCE_BETWEEN_ARROWS = 9
         break
       }
       case ('BOTTOM'): {
         ARROW_1_DIRECTION = 1
         ARROW_2_DIRECTION = 1
         DISTANCE_BETWEEN_ARROWS = 6
         break
       }
     }

     point1 = {
       x: X_OFFSET - WIDTH / 2,
       y: Y_OFFSET + HEIGHT / 2 * ARROW_1_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2
     }

     point2 = {
       x: X_OFFSET,
       y: Y_OFFSET - HEIGHT / 2 * ARROW_1_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2
     }

     point3 = {
       x: X_OFFSET + WIDTH / 2,
       y: Y_OFFSET + HEIGHT / 2 * ARROW_1_DIRECTION - DISTANCE_BETWEEN_ARROWS / 2
     }

     point1 = thisObject.container.frame.frameThisPoint(point1)
     point2 = thisObject.container.frame.frameThisPoint(point2)
     point3 = thisObject.container.frame.frameThisPoint(point3)

     point4 = {
       x: X_OFFSET - WIDTH / 2,
       y: Y_OFFSET + HEIGHT / 2 * ARROW_2_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2
     }

     point5 = {
       x: X_OFFSET,
       y: Y_OFFSET - HEIGHT / 2 * ARROW_2_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2
     }

     point6 = {
       x: X_OFFSET + WIDTH / 2,
       y: Y_OFFSET + HEIGHT / 2 * ARROW_2_DIRECTION + DISTANCE_BETWEEN_ARROWS / 2
     }

     point4 = thisObject.container.frame.frameThisPoint(point4)
     point5 = thisObject.container.frame.frameThisPoint(point5)
     point6 = thisObject.container.frame.frameThisPoint(point6)

     browserCanvasContext.setLineDash([0, 0])

     browserCanvasContext.beginPath()

     browserCanvasContext.moveTo(point1.x, point1.y)
     browserCanvasContext.lineTo(point2.x, point2.y)
     browserCanvasContext.lineTo(point3.x, point3.y)

     browserCanvasContext.moveTo(point4.x, point4.y)
     browserCanvasContext.lineTo(point5.x, point5.y)
     browserCanvasContext.lineTo(point6.x, point6.y)

     browserCanvasContext.lineWidth = LINE_WIDTH
     browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + OPACITY + ')'
     browserCanvasContext.stroke()
   }
 }


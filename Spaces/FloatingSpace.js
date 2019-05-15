
function newFloatingSpace () {
  const MODULE_NAME = 'Floating Space'
  const ERROR_LOG = true
   /*
   The Floating Space is the place where floating elements like floatingObjects, live and are rendered.
   This space has its own physics which helps with the animation of these objects and also preventing them to overlap.
   */

  let thisObject = {
    floatingLayer: undefined,               // This is the array of floatingObjects being displayed
    profileBalls: undefined,
    strategyPartConstructor: undefined,
    noteSets: undefined,
    container: undefined,
    fitIntoVisibleArea: fitIntoVisibleArea,
    isThisPointVisible: isThisPointVisible,
    makeVisible: makeVisible,
    makeInvisible: makeInvisible,
    draw: draw,
    physics: physics,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.container = newContainer()
  thisObject.container.initialize(MODULE_NAME)
  thisObject.container.isClickeable = false
  thisObject.container.isDraggeable = true
  thisObject.container.isWheelable = true
  thisObject.container.detectMouseOver = true
  thisObject.container.frame.radius = 0
  thisObject.container.frame.width = browserCanvas.width * 10
  thisObject.container.frame.height = browserCanvas.height * 10
  thisObject.container.frame.position.x = browserCanvas.width / 2 - thisObject.container.frame.width / 2
  thisObject.container.frame.position.y = browserCanvas.height / 2 - thisObject.container.frame.height / 2

  let visible = false

  return thisObject

  function finalize () {
    thisObject.floatingLayer.finalize()
    thisObject.profileBalls.finalize()
    thisObject.strategyPartConstructor.finalize()
    thisObject.noteSets.finalize()
  }

  function initialize (callBackFunction) {
    thisObject.floatingLayer = newFloatingLayer()
    thisObject.floatingLayer.initialize()

    thisObject.profileBalls = newProfileBalls()
    thisObject.profileBalls.initialize(thisObject.floatingLayer)

    thisObject.noteSets = newNoteSets()
    thisObject.noteSets.initialize(thisObject.floatingLayer)

    thisObject.strategyPartConstructor = newStrategyPartConstructor()
    thisObject.strategyPartConstructor.initialize(thisObject.floatingLayer)

    thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
  }

  function fitIntoVisibleArea (point) {
      /* Here we check the boundaries of the resulting points, so they dont go out of the visible area. */

    let returnPoint = {
      x: point.x,
      y: point.y
    }

    if (point.x > browserCanvas.width) {
      returnPoint.x = browserCanvas.width
    }

    if (point.x < 0) {
      returnPoint.x = 0
    }

    if (point.y < COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT) {
      returnPoint.y = COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT
    }

    if (point.y > browserCanvas.height) {
      returnPoint.y = browserCanvas.height
    }

    return returnPoint
  }

  function isThisPointVisible (point) {
    if (point.x > browserCanvas.width) {
      return false
    }

    if (point.x < 0) {
      return false
    }

    if (point.y < COCKPIT_SPACE_POSITION + COCKPIT_SPACE_HEIGHT) {
      return false
    }

    if (point.y > browserCanvas.height) {
      return false
    }

    return true
  }

  function onMouseWheel (event) {
    thisObject.floatingLayer.changeTargetRepulsion(event.wheelDelta)
  }

  function makeVisible () {
    visible = true
  }

  function makeInvisible () {
    visible = false
  }

  function getContainer (point) {
    let container

    container = thisObject.floatingLayer.getContainer(point)
    if (container !== undefined) { return container }

    if (visible === true) {
      return thisObject.container
    }
  }

  function physics () {
    thisObject.floatingLayer.physics()
  }

  function draw () {
    if (visible === true) {
      drawBackground()
    }

    thisObject.floatingLayer.draw()
  }

  function drawBackground () {
    browserCanvasContext.beginPath()

    browserCanvasContext.rect(thisObject.container.frame.position.x, thisObject.container.frame.position.y, thisObject.container.frame.width, thisObject.container.frame.height)
    browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.BLACK + ', 1)'

    browserCanvasContext.closePath()
    browserCanvasContext.fill()
  }
}


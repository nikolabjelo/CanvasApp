
let browserCanvasContext          // The context of the canvas object.

let stepsInitializationCounter = 0         // This counter the initialization steps required to be able to turn off the splash screen.
let marketInitializationCounter = 0        // This counter the initialization of markets required to be able to turn off the splash screen.
let splashScreenNeeded = true

function newCanvas () {
  const MODULE_NAME = 'Canvas'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

   /* Mouse event related variables. */

  let containerDragStarted = false
  let floatingObjectDragStarted = false
  let floatingObjectBeingDragged
  let containerBeingDragged
  let viewPortBeingDragged = false
  let ignoreNextClick = false

  let dragVector = {
    downX: 0,
    downY: 0,
    upX: 0,
    upY: 0
  }

   /* canvas object */

  let thisObject = {
    eventHandler: undefined,
    topSpace: undefined,
    chartSpace: undefined,
    floatingSpace: undefined,
    panelsSpace: undefined,
    cockpitSpace: undefined,
    bottomSpace: undefined,
    strategySpace: undefined,
    animation: undefined,
    initialize: initialize,
    finalize: finalize
  }

  thisObject.eventHandler = newEventHandler()

  let splashScreen
  let lastContainerMouseOver
  return thisObject

  function finalize () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      thisObject.chartSpace.finalize()
      thisObject.floatingSpace.finalize()

      browserCanvas.removeEventListener('mousedown', onMouseDown, false)
      browserCanvas.removeEventListener('mouseup', onMouseUp, false)
      browserCanvas.removeEventListener('mousemove', onMouseMove, false)
      browserCanvas.removeEventListener('click', onMouseClick, false)
      browserCanvas.removeEventListener('mouseout', onMouseOut, false)

           /* Mouse wheel events. */

      if (browserCanvas.removeEventListener) {
               // IE9, Chrome, Safari, Opera
        browserCanvas.removeEventListener('mousewheel', onMouseWheel, false)
               // Firefox
        browserCanvas.removeEventListener('DOMMouseScroll', onMouseWheel, false)
      }
           // IE 6/7/8
      else browserCanvas.detachEvent('onmousewheel', onMouseWheel)
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  async function initialize (callBackFunction) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initialize -> Entering function.') }

      initializeBrowserCanvas()

      addCanvasEvents()

           /* Instantiate all the children spaces of Canvas object */

      thisObject.topSpace = newTopSpace()
      await thisObject.topSpace.initialize()

      thisObject.strategySpace = newStrategySpace()
      await thisObject.strategySpace.initialize()

      thisObject.cockpitSpace = newCockpitSpace()
      thisObject.cockpitSpace.initialize()

      thisObject.panelsSpace = newPanelsSpace()
      thisObject.panelsSpace.initialize()

      thisObject.floatingSpace = newFloatingSpace()
      thisObject.floatingSpace.initialize()

      thisObject.chartSpace = newChartSpace()
      thisObject.chartSpace.initialize(onCharSpaceInitialized)

      thisObject.bottomSpace = thisObject.cockpitSpace

      function onCharSpaceInitialized (err) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] initialize -> onCharSpaceInitialized -> Entering function.') }

          viewPort.raiseEvents() // These events will impacts on objects just initialized.
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onCharSpaceInitialized -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }

           /* Splash Screen */

      splashScreen = newSplashScreen()
      splashScreen.initialize()

      let animation = newAnimation()
      animation.initialize(onAnimationInitialized)

      function onAnimationInitialized (err) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] initialize -> onAnimationInitialized -> Entering function.') }

          thisObject.animation = animation

                   /* Here we add all the functions that will be called during the animation cycle. */

          animation.addCallBackFunction('Floating Space Draw', thisObject.floatingSpace.draw, onFunctionAdded)
          animation.addCallBackFunction('Floating Space Physics', thisObject.floatingSpace.physics, onFunctionAdded)
          animation.addCallBackFunction('Chart Space Background', thisObject.chartSpace.drawBackground, onFunctionAdded)
          animation.addCallBackFunction('Chart Space Draw', thisObject.chartSpace.draw, onFunctionAdded)
          animation.addCallBackFunction('Chart Space Physics', thisObject.chartSpace.physics, onFunctionAdded)
          animation.addCallBackFunction('Panels Space', thisObject.panelsSpace.draw, onFunctionAdded)
          animation.addCallBackFunction('ViewPort Animate', viewPort.animate, onFunctionAdded)
          animation.addCallBackFunction('CockpitSpace Draw', thisObject.cockpitSpace.draw, onFunctionAdded)
          animation.addCallBackFunction('CockpitSpace Physics', thisObject.cockpitSpace.physics, onFunctionAdded)
          animation.addCallBackFunction('Top Space Draw', thisObject.topSpace.draw, onFunctionAdded)
          animation.addCallBackFunction('Strategy Space Draw', thisObject.strategySpace.draw, onFunctionAdded)
          animation.addCallBackFunction('Splash Screen Draw', splashScreen.draw, onFunctionAdded)
          animation.start(onStart)

          function onFunctionAdded (err) {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onAnimationInitialized -> onFunctionAdded -> Entering function.') }

              if (err.result === GLOBAL.DEFAULT_FAIL_RESPONSE.result) {
                animation.stop()

                if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onAnimationInitialized -> onFunctionAdded -> Animation Stopped since a vital funtion could not be added.') }

                               /* Display some Error Page here. */
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onAnimationInitialized -> onFunctionAdded -> err = ' + err.stack) }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }

          function onStart (err) {
            try {
              if (INFO_LOG === true) { logger.write('[INFO] initialize -> onAnimationInitialized -> onStart -> Entering function.') }

              switch (err.result) {
                case GLOBAL.DEFAULT_OK_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onAnimationInitialized -> onStart ->  Received OK Response.') }
                  callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
                  return
                }

                case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {
                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onAnimationInitialized -> onStart -> Received FAIL Response.') }
                  callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
                  return
                }

                default: {
                  if (INFO_LOG === true) { logger.write('[INFO] initialize -> onAnimationInitialized -> onStart -> Received Unexpected Response.') }
                  callBackFunction(err)
                  return
                }
              }
            } catch (err) {
              if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onAnimationInitialized -> onStart -> err = ' + err.stack) }
              callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
            }
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> onAnimationInitialized -> err = ' + err.stack) }
          callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initialize -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function initializeBrowserCanvas () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] initializeBrowserCanvas -> Entering function.') }

      browserCanvasContext = browserCanvas.getContext('2d')
      // browserCanvasContext.font = 'italic small-caps bold 12px Saira'
      browserCanvasContext.font = 'Saira'

      viewPort.initialize()
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] initializeBrowserCanvas -> err = ' + err.stack) }
    }
  }

  function addCanvasEvents () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] addCanvasEvents -> Entering function.') }

           /* Mouse down and up events to control the drag of the canvas. */

      browserCanvas.addEventListener('mousedown', onMouseDown, false)
      browserCanvas.addEventListener('mouseup', onMouseUp, false)
      browserCanvas.addEventListener('mousemove', onMouseMove, false)
      browserCanvas.addEventListener('click', onMouseClick, false)
      browserCanvas.addEventListener('mouseout', onMouseOut, false)

           /* Mouse wheel events. */

      if (browserCanvas.addEventListener) {
               // IE9, Chrome, Safari, Opera
        browserCanvas.addEventListener('mousewheel', onMouseWheel, false)
               // Firefox
        browserCanvas.addEventListener('DOMMouseScroll', onMouseWheel, false)
      }
           // IE 6/7/8
      else browserCanvas.attachEvent('onmousewheel', onMouseWheel)

      //  Disables the context menu when you right mouse click the canvas.
      browserCanvas.oncontextmenu = function (e) {
        e.preventDefault()
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] addCanvasEvents -> err = ' + err.stack) }
    }
  }

  function onMouseDown (event) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] onMouseDown -> Entering function.') }

           /*

           There are four types of elements that can be dragged.

           1. Panels.
           2. Floating Elements (Currently only FloatingObjects).
           3. Charts.
           4. The Viewport.

           We eveluate each space in order to see if they are holding the element being dragged, and we fallout at the Viewport.

           */

      let point = {
        x: event.pageX,
        y: event.pageY - window.canvasApp.topMargin
      }

      dragVector.downX = point.x
      dragVector.downY = point.y

      let container

            /* We check if the mouse is over an element of the Strategy Space / */

      container = thisObject.strategySpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true) {
        containerBeingDragged = container
        containerDragStarted = true
        return
      }

      if (container !== undefined && container.isDraggeable === false) {
        return
      }

           /* We check if the mouse is over an element of the Top Space / */

      container = thisObject.topSpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true) {
        containerBeingDragged = container
        containerDragStarted = true
        return
      }

           /* We check if the mouse is over an element of the CockpitSpace / */

      container = thisObject.cockpitSpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true) {
        containerBeingDragged = container
        containerDragStarted = true
        return
      }

           /* We check if the mouse is over a panel/ */

      container = thisObject.panelsSpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true && event.button === 2) {
        containerBeingDragged = container
        containerDragStarted = true
        return
      }

      if (container !== undefined && container.isClickeable === true) {
       /* We dont want to mess up with the click */
        return
      }

           /*  we check if it is over any of the existing containers at the Chart Space. */

      container = thisObject.chartSpace.getContainer(point)

      if (container !== undefined) {
        if (container.isDraggeable === true) {
          containerBeingDragged = container
          containerDragStarted = true
          return
        } else {
          viewPortBeingDragged = true
          return
        }
      }

      container = thisObject.floatingSpace.getContainer(point)

      if (container !== undefined && container.isDraggeable === true) {
        containerBeingDragged = container
        containerDragStarted = true
        floatingObjectDragStarted = true
        return
      }

      if (container !== undefined && container.isClickeable === true) {
       /* We dont want to mess up with the click */
        return
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseDown -> err = ' + err.stack) }
    }
  }

  function onMouseClick (event) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] onMouseClick -> Entering function.') }

      if (ignoreNextClick === true) {
        ignoreNextClick = false
        return
      }
      let point = {
        x: event.pageX,
        y: event.pageY - window.canvasApp.topMargin
      }

      let container

            /* We check if the mouse is over an element of the Strategy Space / */

      container = thisObject.strategySpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

           /* We check if the mouse is over an element of the Top Space / */

      container = thisObject.topSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

           /* We check if the mouse is over an element of the CockpitSpace / */

      container = thisObject.cockpitSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

           /* We check if the mouse is over a panel/ */

      container = thisObject.panelsSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

           /* If it is not, then we check if it is over any of the existing containers at the Chart Space. */

      container = thisObject.chartSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }

      /* We check if the mouse is over a floatingObject/ */
      container = thisObject.floatingSpace.getContainer(point)

      if (container !== undefined && container.isClickeable === true) {
        container.eventHandler.raiseEvent('onMouseClick', point)
        return
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseClick -> err = ' + err.stack) }
    }
  }

  function onMouseOut (event) {
    deactivateDragging(event)

    /* When the mouse leaves the canvas, our elements needs to react to the fact that the mouse is over a far away place */
    let thisEvent = {
      pageX: VERY_LARGE_NUMBER,
      pageY: VERY_LARGE_NUMBER
    }
    onMouseOver(thisEvent)
  }

  function onMouseUp (event) {
    deactivateDragging(event)
  }

  function deactivateDragging (event) {
    try {
      if (containerDragStarted || viewPortBeingDragged || floatingObjectDragStarted) {
        thisObject.eventHandler.raiseEvent('Drag Finished', undefined)
      }

      if (
     containerDragStarted ||
     floatingObjectDragStarted ||
     viewPortBeingDragged
     ) {
        ignoreNextClick = true
      }
           /* Turn off all the possible things that can be dragged. */

      containerDragStarted = false
      floatingObjectDragStarted = false
      viewPortBeingDragged = false

      containerBeingDragged = undefined

      browserCanvas.style.cursor = 'auto'
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseUp -> err = ' + err.stack) }
    }
  }

  function onMouseMove (event) {
    try {
      let point = {
        x: event.pageX,
        y: event.pageY - window.canvasApp.topMargin
      }

      viewPort.mousePosition.x = point.x
      viewPort.mousePosition.y = point.y

      if (containerDragStarted === true || floatingObjectDragStarted === true || viewPortBeingDragged === true) {
        if (floatingObjectDragStarted === true) {
          let targetContainer = thisObject.floatingSpace.getContainer(point)
          if (targetContainer !== undefined) {
            if (targetContainer.id !== containerBeingDragged.id) {
              containerBeingDragged = undefined
              containerDragStarted = false
              floatingObjectDragStarted = false
              browserCanvas.style.cursor = 'auto'
              ignoreNextClick = true
              return
            }
          } else {
            containerDragStarted = false
            containerBeingDragged = undefined
            floatingObjectDragStarted = false
            browserCanvas.style.cursor = 'auto'
            ignoreNextClick = true
            return
          }
        }

        dragVector.upX = point.x
        dragVector.upY = point.y

        checkDrag(event)
      } else {
        onMouseOver(event)
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseMove -> err = ' + err.stack) }
    }
  }

  function onMouseOver (event) {
    try {
           /* Then we check who is the current object underneeth the mounse. */

      let point = {
        x: event.pageX,
        y: event.pageY - window.canvasApp.topMargin
      }

      let container

            /* We check if the mouse is over an element of the Strategy Space / */

      if (thisObject.strategySpace !== undefined) {
        container = thisObject.strategySpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

           /* We check if the mouse is over an element of the Top Space / */

      if (thisObject.topSpace !== undefined) {
        container = thisObject.topSpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

           /* We check if the mouse is over an element of the CockpitSpace / */

      if (thisObject.cockpitSpace !== undefined) {
        container = thisObject.cockpitSpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

           /* We check if the mouse is over a panel/ */

      if (thisObject.panelsSpace !== undefined) {
        container = thisObject.panelsSpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

           /* If it is not, then we check if it is over any of the existing containers at the Chart Space. */

      if (thisObject.chartSpace !== undefined) {
        container = thisObject.chartSpace.getContainer(point, GET_CONTAINER_PURPOSE.MOUSE_OVER)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

      /* We check if the mouse is over a floatingObject/ */
      if (thisObject.floatingSpace !== undefined) {
        container = thisObject.floatingSpace.getContainer(point)

        if (container !== undefined && container.detectMouseOver === true) {
          containerFound()
          return
        }
      }

      function containerFound () {
        if (lastContainerMouseOver !== undefined) {
          if (container.id !== lastContainerMouseOver.id) {
            lastContainerMouseOver.eventHandler.raiseEvent('onMouseNotOver', point)
          }
        }

        container.eventHandler.raiseEvent('onMouseOver', point)
        lastContainerMouseOver = container
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseOver -> err = ' + err.stack) }
    }
  }

  function onMouseWheel (event) {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] onMouseWheel -> Entering function.') }

           // cross-browser wheel delta
      var event = window.event || event // old IE support
      let delta = Math.max(-1, Math.min(1, event.wheelDelta || -event.detail))

           /* We try first with panels. */

      let point = {
        x: event.pageX,
        y: event.pageY - window.canvasApp.topMargin
      }

      event.mousePosition = point
      let container
      container = canvas.panelsSpace.getContainer({ x: point.x, y: point.y })

      if (container !== undefined && container.isWheelable === true) {
        container.eventHandler.raiseEvent('onMouseWheel', event)
        return false  // This instructs the browser not to take the event and scroll the page.
      }

           /* We try the CockpitSpace. */

      container = canvas.cockpitSpace.getContainer({ x: point.x, y: point.y })

      if (container !== undefined && container.isWheelable === true) {
        container.eventHandler.raiseEvent('onMouseWheel', event)
        return false  // This instructs the browser not to take the event and scroll the page.
      }

          /*   Chart Space. */

      container = canvas.chartSpace.getContainer({ x: point.x, y: point.y }, GET_CONTAINER_PURPOSE.MOUSE_WHEEL)
      if (container !== undefined && container.isWheelable === true) {
        container.eventHandler.raiseEvent('onMouseWheel', event)
        return false  // This instructs the browser not to take the event and scroll the page.
      }

      if (container !== undefined) {
        viewPort.applyZoom(delta)
        return false
      }

         /* We try second with floating objects. */

      container = canvas.floatingSpace.getContainer({ x: point.x, y: point.y })

      if (container !== undefined && container.isWheelable === true) {
        container.eventHandler.raiseEvent('onMouseWheel', event)
        return false  // This instructs the browser not to take the event and scroll the page.
      }

      return false
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] onMouseWheel -> err = ' + err.stack) }
    }
  }

  function checkDrag (event) {
    try {
      if (containerDragStarted === true || floatingObjectDragStarted === true || viewPortBeingDragged === true) {
        let point = {
          x: event.pageX,
          y: event.pageY - window.canvasApp.topMargin
        }

        browserCanvas.style.cursor = 'grabbing'
        thisObject.eventHandler.raiseEvent('Dragging', undefined)

        if (containerDragStarted || viewPortBeingDragged) {
                   /* The parameters received have been captured with zoom applied. We must remove the zoom in order to correctly modify the displacement. */

          let downCopy = {
            x: dragVector.downX,
            y: dragVector.downY
          }

          let downCopyNoTransf
          downCopyNoTransf = viewPort.unzoomThisPoint(downCopy)
                   // downCopyNoTransf = containerBeingDragged.zoom.unzoomThisPoint(downCopyNoTransf);

          let upCopy = {
            x: dragVector.upX,
            y: dragVector.upY
          }

          let upCopyNoTranf
          upCopyNoTranf = viewPort.unzoomThisPoint(upCopy)

          let displaceVector = {
            x: dragVector.upX - dragVector.downX,
            y: dragVector.upY - dragVector.downY
          }

          if (viewPortBeingDragged) {
            viewPort.displace(displaceVector)
          }

          if (containerBeingDragged !== undefined) {
            let moveSucceed = containerBeingDragged.displace(displaceVector)
            if (moveSucceed === false) {
              deactivateDragging(event)
            }
          }
        }

               /* Finally we set the starting point of the new dragVector at this current point. */

        dragVector.downX = dragVector.upX
        dragVector.downY = dragVector.upY
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] checkDrag -> err = ' + err.stack) }
    }
  }
}

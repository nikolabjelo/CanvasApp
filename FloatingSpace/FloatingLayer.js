/*
    This module represent one layer of many possible layers that could be at the Floating Space. Objects in the same layer are subject to
    the same physics, and by being at the same level, they interact with each other. For example, they can bounce when one hit the other.
    This module posesses its own physics engine. There are different types of floating objects, but this layer takes care of each of them.

    Floating Objects Types:

    1. Profile Balls: These are small balls with a profile picture, and two levels, one above and one below the ball. They are usually used
                      to specify the location of a bot instance.

    2. Notes:         Notes are a rectangular area where some text is posted. It has a subject and a body.

    3. Strategy Parts: These are small balls that represent parts of an strategy.
    */

function newFloatingLayer () {
  const MODULE_NAME = 'Floating Layer'
  const INFO_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    addFloatingObject: addFloatingObject,
    removeFloatingObject: removeFloatingObject,
    getFloatingObject: getFloatingObject,
    physics: physics,
    changeTargetRepulsion: changeTargetRepulsion,
    draw: draw,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

    /*
    When objects are added to this layer they are added to the invisibleFloatingObjects array and they stay there because they are invisible.
    Visibility of objects is not decided at this layer, but outside. The ones who decides which object is visible or not are plotters, because
    they know the position of objects and the coordinate system which these positions belong to.

    To save resources, the physics engine only apply its calculations to visible floating objects.
    */

  let invisibleFloatingObjects = []

    /*
    Floating objects are accesible to plotters because they carry a "payload" object that was creted by them. This object includes the position
    and visible property. When visible turns to true, this layer module will move the reference of the floating object from the invisible array
    to the visibleFloatingObjects array. If the plotter decides that the object is to far from the what the user is seeing, it can eventually
    turn the visible property off again, forcing the layer to remove the object from the visibleFloatingObjects and place it again at the invisible
    array.
    */

  let visibleFloatingObjects = []

  let maxTargetRepulsionForce = 0.001
  let currentHandle = 0

  return thisObject

  function finalize () {
    invisibleFloatingObjects = []
    visibleFloatingObjects = []
  }

  function initialize () {

        /* We dont need to initialize anything right now. */
  }

  function getContainer (point) {
    let container

    for (let i = 0; i < visibleFloatingObjects.length; i++) {
      let floatingObject = visibleFloatingObjects[i]
      container = floatingObject.getContainer(point)
      if (container !== undefined) { return container }
    }

    return container
  }

  function addFloatingObject (pFloatingObject) {
    currentHandle++
    pFloatingObject.handle = currentHandle // Math.floor((Math.random() * 10000000) + 1);
    invisibleFloatingObjects.push(pFloatingObject)
  }

  function removeFloatingObject (pFloatingObjectHandle) {
    try {
      for (let i = 0; i < invisibleFloatingObjects.length; i++) {
        let floatingObject = invisibleFloatingObjects[i]

        if (floatingObject.handle === pFloatingObjectHandle) {
          invisibleFloatingObjects.splice(i, 1)  // Delete item from array.
          return
        }
      }

      for (let i = 0; i < visibleFloatingObjects.length; i++) {
        let floatingObject = visibleFloatingObjects[i]

        if (floatingObject.handle === pFloatingObjectHandle) {
          visibleFloatingObjects.splice(i, 1)  // Delete item from array.
          return
        }
      }

      if (ERROR_LOG === true) { logger.write('[ERROR] removeFloatingObject -> Floating Object Not Found.') }
      if (ERROR_LOG === true) { logger.write('[ERROR] removeFloatingObject -> Floating Object cannot be killed.') }
      if (ERROR_LOG === true) { logger.write('[ERROR] removeFloatingObject -> pFloatingObjectHandle = ' + pFloatingObjectHandle) }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] removeFloatingObject -> err= ' + err.stack) }
    }
  }

  function getFloatingObject (pFloatingObjectHandle, pFloatingObjectIndex) {
        /*
        There are two ways to look for a floating object: by handle or by index. The search by handle is done on the visible and invisible array.
        The search by index is done only on the visible ones. The search by index is usually needed when mouse events occurs. In those cases
        only objects visible to the end usser matters.
        */

    try {
      if (INFO_LOG === true) { logger.write('[INFO] getFloatingObject -> Entering function.') }

      if (pFloatingObjectHandle !== undefined) {
        for (let i = 0; i < invisibleFloatingObjects.length; i++) {
          let floatingObject = invisibleFloatingObjects[i]

          if (floatingObject.handle === pFloatingObjectHandle) {
            return floatingObject
          }
        }

        for (let i = 0; i < visibleFloatingObjects.length; i++) {
          let floatingObject = visibleFloatingObjects[i]

          if (floatingObject.handle === pFloatingObjectHandle) {
            return floatingObject
          }
        }
      }

      if (pFloatingObjectIndex !== undefined) {
        for (let i = 0; i < visibleFloatingObjects.length; i++) {
          let floatingObject = visibleFloatingObjects[i]

          if (i === pFloatingObjectIndex) {
            return floatingObject
          }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getFloatingObject -> err= ' + err.stack) }
    }
  }

  function draw () {
    drawVisibleObjects()

    function drawVisibleObjects () {
                  /* We draw all the visibleFloatingObjects. */

      for (let i = 0; i < visibleFloatingObjects.length; i++) {
        let floatingObject = visibleFloatingObjects[i]
        floatingObject.drawBackground()
      }

      for (let i = 0; i < visibleFloatingObjects.length; i++) {
        let floatingObject = visibleFloatingObjects[i]
        floatingObject.drawMiddleground()
      }

      for (let i = 0; i < visibleFloatingObjects.length; i++) {
        let floatingObject = visibleFloatingObjects[visibleFloatingObjects.length - i - 1]
        floatingObject.drawForeground()
      }

      for (let i = 0; i < visibleFloatingObjects.length; i++) {
        let floatingObject = visibleFloatingObjects[i]
        floatingObject.drawOnFocus()
      }

      makeVisible()
    }

    function makeVisible () {
      try {
                  /* Now we check if any of the created FloatingObjects where enabled to run under the Physics Engine. */

        for (let i = 0; i < invisibleFloatingObjects.length; i++) {
          let floatingObject = invisibleFloatingObjects[i]

          let payload = {
            position: undefined,
            visible: false
          }

          switch (floatingObject.type) {

            case 'Profile Ball': {
              payload.targetPosition = floatingObject.payload.profile.position
              payload.visible = floatingObject.payload.profile.visible
              break
            }
            case 'Note': {
              if (floatingObject.payload.notes[floatingObject.payloadNoteIndex] !== undefined) {
                payload.targetPosition = floatingObject.payload.notes[floatingObject.payloadNoteIndex].position
                payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible
              }
              break
            }
            case 'Strategy Part': {
              payload.targetPosition = floatingObject.payload.targetPosition
              payload.visible = floatingObject.payload.visible
              break
            }
            default: {
              break
            }
          }

          if (payload.visible === true) {
            visibleFloatingObjects.push(floatingObject)

            invisibleFloatingObjects.splice(i, 1)  // Delete item from array.

            return                     // Only one at the time.
          }
        }

        makeInvisible()
      } catch (err) {
        if (ERROR_LOG === true) { logger.write('[ERROR] physics -> makeVisible -> err= ' + err.stack) }
      }
    }

    function makeInvisible () {
      try {
                  /* Finally we check if any of the currently visible floatingObjects has become invisible and must be removed from the Physics Engine. */

        for (let i = 0; i < visibleFloatingObjects.length; i++) {
          let floatingObject = visibleFloatingObjects[i]

          let payload = {
            position: undefined,
            visible: true
          }

          switch (floatingObject.type) {

            case 'Profile Ball': {
              payload.visible = floatingObject.payload.profile.visible
              break
            }
            case 'Note': {
              payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible
              break
            }
            case 'Strategy Part': {
              payload.visible = floatingObject.payload.visible
              break
            }
            default: {
              break
            }
          }

          if (payload.visible === false) {
            invisibleFloatingObjects.push(floatingObject)

            visibleFloatingObjects.splice(i, 1)  // Delete item from array.

            return                     // Only one at the time.
          }
        }
      } catch (err) {
        if (ERROR_LOG === true) { logger.write('[ERROR] physics -> makeInvisible -> err= ' + err.stack) }
      }
    }
  }

    /******************************************/
    /*                                        */
    /*        Physics Engine Follows          */
    /*                                        */
    /******************************************/

  function physics () {
        /*
        The Physics engine is hooked at the animation loop, so it executes very very often. According to this Physics engine, each
        floating object has a position and a speed. In fact, each floating object has two positions at the same time:

        1. The current position: is the position of the ball, floating around.
        2. The anchor position: is the position of where the ball is achored on the plot. This one is inside the payload object controlled by the
           plotter.

        The anchor position influences the current position, since the Physics engine will apply a gravity force to the ball's position in order
        to make it gravitate towards the anchor position. At the same time there will be a repulsion force that will prevent the ball reaching
        the anchor position, so that the anchor point keeps visible to the user.

        */

    try {
      applyPhysics()

      function applyPhysics () {
                /* This function makes all the calculations to apply phisycs on all visible floatingObjects in this layer. */

        try {
          for (let i = 0; i < visibleFloatingObjects.length; i++) {
            let floatingObject = visibleFloatingObjects[i]

            if (floatingObject.positionLocked === false) {
              floatingObject.container.frame.position.x = floatingObject.container.frame.position.x + floatingObject.currentSpeed.x
              floatingObject.container.frame.position.y = floatingObject.container.frame.position.y + floatingObject.currentSpeed.y
            }

            floatingObject.currentSpeed.x = floatingObject.currentSpeed.x * floatingObject.friction  // Desaceleration factor.
            floatingObject.currentSpeed.y = floatingObject.currentSpeed.y * floatingObject.friction  // Desaceleration factor.

            let payload = {
              position: undefined,
              visible: false
            }

            switch (floatingObject.type) {

              case 'Profile Ball': {
                payload.targetPosition = floatingObject.payload.profile.position
                payload.visible = floatingObject.payload.profile.visible
                break
              }
              case 'Note': {
                payload.targetPosition = floatingObject.payload.notes[floatingObject.payloadNoteIndex].position
                payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible

                break
              }
              case 'Strategy Part': {
                payload.targetPosition = floatingObject.payload.targetPosition
                payload.visible = floatingObject.payload.visible
                break
              }
              default: {
                break
              }
            }

            if (floatingObject.container.frame.position.x < payload.targetPosition.x) {
              floatingObject.currentSpeed.x = floatingObject.currentSpeed.x + 0.005
            } else {
              floatingObject.currentSpeed.x = floatingObject.currentSpeed.x - 0.005
            }

            if (floatingObject.container.frame.position.y < payload.targetPosition.y) {
              floatingObject.currentSpeed.y = floatingObject.currentSpeed.y + 0.005
            } else {
              floatingObject.currentSpeed.y = floatingObject.currentSpeed.y - 0.005
            }

            const MAX_SPEED = 50

            if (floatingObject.currentSpeed.x > MAX_SPEED) {
              floatingObject.currentSpeed.x = MAX_SPEED
            }

            if (floatingObject.currentSpeed.y > MAX_SPEED) {
              floatingObject.currentSpeed.y = MAX_SPEED
            }

            if (floatingObject.currentSpeed.x < -MAX_SPEED) {
              floatingObject.currentSpeed.x = -MAX_SPEED
            }

            if (floatingObject.currentSpeed.y < -MAX_SPEED) {
              floatingObject.currentSpeed.y = -MAX_SPEED
            }

                        // We let the Floating Object animate the physics loops by itself.
            checkBoundaries(floatingObject)

            floatingObject.physics()

                        /* Collision Control */

            for (let k = i + 1; k < visibleFloatingObjects.length; k++) {
              if (colliding(visibleFloatingObjects[i], visibleFloatingObjects[k])) {
                resolveCollision(visibleFloatingObjects[k], visibleFloatingObjects[i])
              }
            }

                        /* Calculate repulsion force produced by all other floatingObjects */

            repulsionForceBetweenFloatingObjects(i)

            targetRepulsionForce(i)

            gravityForce(floatingObject, payload)
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] physics -> applyPhysics -> err= ' + err.stack) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] physics -> err= ' + err.stack) }
    }
  }

  function checkBoundaries (floatingObject) {
    if (floatingObject.container.frame.position.x - floatingObject.container.frame.radius < 0) {
      floatingObject.container.frame.position.x = floatingObject.container.frame.radius
      floatingObject.currentSpeed.x = -floatingObject.currentSpeed.x
    }

    if (floatingObject.container.frame.position.x + floatingObject.container.frame.radius > canvas.floatingSpace.container.frame.width) {
      floatingObject.container.frame.position.x = canvas.floatingSpace.container.frame.width - floatingObject.container.frame.radius
      floatingObject.currentSpeed.x = -floatingObject.currentSpeed.x
    }

    if (floatingObject.container.frame.position.y - floatingObject.container.frame.radius < 0) {
      floatingObject.container.frame.position.y = floatingObject.container.frame.radius
      floatingObject.currentSpeed.y = -floatingObject.currentSpeed.y
    }

    if (floatingObject.container.frame.position.y + floatingObject.container.frame.radius > canvas.floatingSpace.container.frame.height) {
      floatingObject.container.frame.position.y = canvas.floatingSpace.container.frame.height - floatingObject.container.frame.radius
      floatingObject.currentSpeed.y = -floatingObject.currentSpeed.y
    }
  }

  function gravityForce (floatingObject, payload) {
    try {
            /* We simulate a kind of gravity towards the target point of each floatingObject. This force will make the floatingObject to keep pushing to reach that point. */

      const coulomb = 0.00001
      const minForce = 0.01

      var d = Math.sqrt(Math.pow(payload.targetPosition.x - floatingObject.container.frame.position.x, 2) + Math.pow(payload.targetPosition.y - floatingObject.container.frame.position.y, 2))  // ... we calculate the distance ...

      var force = coulomb * d * d / floatingObject.currentMass  // In this case the mass of the floatingObject affects the gravity force that it receives, that gives priority to target position to bigger floatingObjects.

      if (force < minForce) { // We need this attraction force to overcome the friction we imposed to the system.
        force = minForce
      }

      var pos1 = {
        x: floatingObject.container.frame.position.x,
        y: floatingObject.container.frame.position.y
      }

      var pos2 = {
        x: payload.targetPosition.x,
        y: payload.targetPosition.y
      }

      var posDiff = {             // Next we need the vector resulting from the 2 positions.
        x: pos2.x - pos1.x,
        y: pos2.y - pos1.y
      }

      if (d !== 0) {
        var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
          x: posDiff.x / d,
          y: posDiff.y / d
        }

        var forceVector = {
          x: unitVector.x * force,
          y: unitVector.y * force
        }

              /* We add the force vector to the speed vector */

        floatingObject.currentSpeed.x = floatingObject.currentSpeed.x + forceVector.x
        floatingObject.currentSpeed.y = floatingObject.currentSpeed.y + forceVector.y
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] gravityForce -> err= ' + err.stack) }
    }
  }

  function repulsionForceBetweenFloatingObjects (currentFloatingObject) {
    try {
            /* We generate a repulsion force between floatingObjects, that prevents them to be collisioning so often. */

      const coulomb = 2

      var floatingObject1 = visibleFloatingObjects[currentFloatingObject]

      for (var i = 0; i < visibleFloatingObjects.length; i++) {
  // The force to be applied is considering all other floatingObjects...

        if (i !== currentFloatingObject) {
  // ... except for the current one.

          var floatingObject2 = visibleFloatingObjects[i]   // So, for each floatingObject...

          var d = Math.sqrt(Math.pow(floatingObject2.container.frame.position.x - floatingObject1.container.frame.position.x, 2) + Math.pow(floatingObject2.container.frame.position.y - floatingObject1.container.frame.position.y, 2))  // ... we calculate the distance ...

          var force = coulomb * floatingObject2.currentMass / (d * d)  // ... and with it the repulsion force.

                    /* We need to put a hard limit to this force, in order to to eject very little floatingObjects to the infinite and beyond. */

          if (force > 1) {
            force = 1
          }

          var pos1 = {
            x: floatingObject1.container.frame.position.x,
            y: floatingObject1.container.frame.position.y
          }

          var pos2 = {
            x: floatingObject2.container.frame.position.x,
            y: floatingObject2.container.frame.position.y
          }

          var posDiff = {             // Next we need the vector resulting from the 2 positions.
            x: pos2.x - pos1.x,
            y: pos2.y - pos1.y
          }

          var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
            x: posDiff.x / d,
            y: posDiff.y / d
          }

          var forceVector = {
            x: unitVector.x * force,
            y: unitVector.y * force
          }

                    /* We substract the force vector to the speed vector of the current floatingObject */

          floatingObject1.currentSpeed.x = floatingObject1.currentSpeed.x - forceVector.x
          floatingObject1.currentSpeed.y = floatingObject1.currentSpeed.y - forceVector.y
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] repulsionForceBetweenFloatingObjects -> err= ' + err.stack) }
    }
  }

  function targetRepulsionForce (currentFloatingObject) {
    try {
            /* We generate a repulsion force between floatingObjects, that prevents them to be collisioning so often. */

      const coulomb = 2

      var floatingObject1 = visibleFloatingObjects[currentFloatingObject]

      for (var i = 0; i < visibleFloatingObjects.length; i++) {
  // The force to be applied is considering all other floatingObjects...

        var floatingObject2 = visibleFloatingObjects[i]   // So, for each floatingObject...

        let payload = {
          position: undefined
        }

        switch (floatingObject2.type) {

          case 'Profile Ball': {
            payload.targetPosition = floatingObject2.payload.profile.position
            break
          }
          case 'Note': {
            payload.targetPosition = floatingObject2.payload.notes[floatingObject2.payloadNoteIndex].position
            break
          }
          case 'Strategy Part': {
            payload.targetPosition = floatingObject2.payload.targetPosition
            break
          }
          default: {
            break
          }
        }

        var d = Math.sqrt(Math.pow(payload.targetPosition.x - floatingObject1.container.frame.position.x, 2) + Math.pow(payload.targetPosition.y - floatingObject1.container.frame.position.y, 2))  // ... we calculate the distance ...

        var force = coulomb * floatingObject2.currentMass / (d * d)  // ... and with it the repulsion force.

                /* We need to put a hard limit to this force, in order to to eject very little floatingObjects to the infinite and beyond. */

        if (force > maxTargetRepulsionForce) {
          force = maxTargetRepulsionForce
        }

        var pos1 = {
          x: floatingObject1.container.frame.position.x,
          y: floatingObject1.container.frame.position.y
        }

        var pos2 = {
          x: payload.targetPosition.x,
          y: payload.targetPosition.y
        }

        var posDiff = {             // Next we need the vector resulting from the 2 positions.
          x: pos2.x - pos1.x,
          y: pos2.y - pos1.y
        }

        if (d !== 0) {
          var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
            x: posDiff.x / d,
            y: posDiff.y / d
          }

          var forceVector = {
            x: unitVector.x * force,
            y: unitVector.y * force
          }

                  /* We substract the force vector to the speed vector of the current floatingObject */

          floatingObject1.currentSpeed.x = floatingObject1.currentSpeed.x - forceVector.x
          floatingObject1.currentSpeed.y = floatingObject1.currentSpeed.y - forceVector.y
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] targetRepulsionForce -> err= ' + err.stack) }
    }
  }

  function changeTargetRepulsion (pDelta) {
    try {
      if (pDelta > 0) {
        pDelta = 1
      } else {
        pDelta = -1
      }

      maxTargetRepulsionForce = maxTargetRepulsionForce + pDelta / 10000

      if (maxTargetRepulsionForce < 0.0001) {
        maxTargetRepulsionForce = 0.0001
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] changeTargetRepulsion -> err= ' + err.stack) }
    }
  }

  function colliding (floatingObject1, floatingObject2) {
    try {
            /* This function detects weather 2 floatingObjects collide with each other. */

      var r1 = floatingObject1.container.frame.radius
      var r2 = floatingObject2.container.frame.radius

      var distance = Math.sqrt(Math.pow(floatingObject2.container.frame.position.x - floatingObject1.container.frame.position.x, 2) + Math.pow(floatingObject2.container.frame.position.y - floatingObject1.container.frame.position.y, 2))

      if (distance > (r1 + r2)) {
                // No solutions, the circles are too far apart.
        return false
      } else if (distance <= r1 + r2) {
                // One circle contains the other.
        return true
      } else if ((distance === 0) && (r1 === r2)) {
                // the circles coincide.
        return true
      } else return true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] colliding -> err= ' + err.stack) }
    }
  }

  function distance (x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  function resolveCollision (floatingObject1, floatingObject2) {
    try {
            /* This function changes speed and position of floatingObjects that are in collision */

      var collisionision_angle = Math.atan2((floatingObject2.container.frame.position.y - floatingObject1.container.frame.position.y), (floatingObject2.container.frame.position.x - floatingObject1.container.frame.position.x))

      var speed1 = Math.sqrt(floatingObject1.currentSpeed.x * floatingObject1.currentSpeed.x + floatingObject1.currentSpeed.y * floatingObject1.currentSpeed.y)  // Magnitude of Speed Vector for floatingObject 1
      var speed2 = Math.sqrt(floatingObject2.currentSpeed.x * floatingObject2.currentSpeed.x + floatingObject2.currentSpeed.y * floatingObject2.currentSpeed.y)  // Magnitude of Speed Vector for floatingObject 2

      var direction_1 = Math.atan2(floatingObject1.currentSpeed.y, floatingObject1.currentSpeed.x)
      var direction_2 = Math.atan2(floatingObject2.currentSpeed.y, floatingObject2.currentSpeed.x)

      var new_xspeed_1 = speed1 * Math.cos(direction_1 - collisionision_angle)
      var new_yspeed_1 = speed1 * Math.sin(direction_1 - collisionision_angle)
      var new_xspeed_2 = speed2 * Math.cos(direction_2 - collisionision_angle)
      var new_yspeed_2 = speed2 * Math.sin(direction_2 - collisionision_angle)

      var final_xspeed_1 = ((floatingObject1.currentMass - floatingObject2.currentMass) * new_xspeed_1 + (floatingObject2.currentMass + floatingObject2.currentMass) * new_xspeed_2) / (floatingObject1.currentMass + floatingObject2.currentMass)
      var final_xspeed_2 = ((floatingObject1.currentMass + floatingObject1.currentMass) * new_xspeed_1 + (floatingObject2.currentMass - floatingObject1.currentMass) * new_xspeed_2) / (floatingObject1.currentMass + floatingObject2.currentMass)
      var final_yspeed_1 = new_yspeed_1
      var final_yspeed_2 = new_yspeed_2

      var cosAngle = Math.cos(collisionision_angle)
      var sinAngle = Math.sin(collisionision_angle)

      floatingObject1.currentSpeed.x = cosAngle * final_xspeed_1 - sinAngle * final_yspeed_1
      floatingObject1.currentSpeed.y = sinAngle * final_xspeed_1 + cosAngle * final_yspeed_1

      floatingObject2.currentSpeed.x = cosAngle * final_xspeed_2 - sinAngle * final_yspeed_2
      floatingObject2.currentSpeed.y = sinAngle * final_xspeed_2 + cosAngle * final_yspeed_2

      var pos1 = {
        x: floatingObject1.container.frame.position.x,
        y: floatingObject1.container.frame.position.y
      }

      var pos2 = {
        x: floatingObject2.container.frame.position.x,
        y: floatingObject2.container.frame.position.y
      }

            // get the mtd
      var posDiff = {
        x: pos1.x - pos2.x,
        y: pos1.y - pos2.y
      }

      var d = Math.sqrt(Math.pow(floatingObject2.container.frame.position.x - floatingObject1.container.frame.position.x, 2) + Math.pow(floatingObject2.container.frame.position.y - floatingObject1.container.frame.position.y, 2))

            // minimum translation distance to push floatingObjects apart after intersecting
      var scalar = (((floatingObject1.container.frame.radius + floatingObject2.container.frame.radius) - d) / d)

      var minTD = {
        x: posDiff.x * scalar,
        y: posDiff.y * scalar
      }

            // resolve intersection --
            // computing inverse mass quantities
      var im1 = 1 / floatingObject1.currentMass
      var im2 = 1 / floatingObject2.currentMass

            // push-pull them apart based off their mass

      pos1.x = pos1.x + minTD.x * (im1 / (im1 + im2))
      pos1.y = pos1.y + minTD.y * (im1 / (im1 + im2))
      pos2.x = pos2.x - minTD.x * (im2 / (im1 + im2))
      pos2.y = pos2.y - minTD.y * (im2 / (im1 + im2))

      if (floatingObject1.positionLocked === false) {
        floatingObject1.container.frame.position = pos1
      }
      if (floatingObject2.positionLocked === false) {
        floatingObject2.container.frame.position = pos2
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] resolveCollision -> err= ' + err.stack) }
    }
  }
}


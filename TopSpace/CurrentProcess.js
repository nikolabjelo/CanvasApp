﻿
function newCurrentProcess() {

    let thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,    
        initialize: initialize
    };

    let container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 150;
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT;

    resize()

    container.isDraggeable = false;
    container.isClickeable = true;

    const NOT_FOUND = "";

    let sharedStatus;

    return thisObject;

    function initialize(pSharedStatus) {

        sharedStatus = pSharedStatus;

        if (window.USER_PROFILE.devTeams.length === 0) {
            window.CURRENT_PROCESS = NOT_FOUND;
        } else {

            if (window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots.length === 0) {
                window.CURRENT_PROCESS = NOT_FOUND;
            } else {

                if (window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes.length === 0) {
                    window.CURRENT_PROCESS = NOT_FOUND;
                } else {

                    window.CURRENT_PROCESS = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes[sharedStatus.currentProcessIndex].name;

                }
            }
        }

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);
        sharedStatus.eventHandler.listenToEvent("userBot Changed", onUserBotChanged);

        window.canvasApp.eventHandler.listenToEvent("Browser Resized", resize);
    }

    function resize() {

        container.frame.position.x = viewPort.visibleArea.topLeft.x + thisObject.container.frame.width * 2;
        container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    }

    function onUserBotChanged() {

        if ( window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots.length > 0) {

            if (window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes.length > 0) {

                sharedStatus.currentProcessIndex = 0;
                window.CURRENT_PROCESS = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes[sharedStatus.currentProcessIndex].name;

                return;
            }   
        }

        window.CURRENT_PROCESS = NOT_FOUND;
    }

    function onClick() {

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken === null || sessionToken === "") {
            /* not logged in */
            return;
        }

        if (sharedStatus.currentProcessIndex + 1 === window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes.length) {

            sharedStatus.currentProcessIndex = 0;
            window.CURRENT_PROCESS = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes[sharedStatus.currentProcessIndex].name;
            return;
        }

        if (sharedStatus.currentProcessIndex + 1 < window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes.length) {

            sharedStatus.currentProcessIndex++;
            window.CURRENT_PROCESS = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes[sharedStatus.currentProcessIndex].name;
            return;
        }
    }

    function getContainer(point) {

        let container;

        /* First we check if this point is inside this object UI. */

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

    function draw() {

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken === null || sessionToken === "") {
            /* not logged in */
            return;
        }

        thisObject.container.frame.draw(false, false);

        let breakpointsHeight = 14;
        let fontSize = 12;
        let label = window.CURRENT_PROCESS;
        if (label === undefined) { label = "" };

        let point = {
            x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize / 3,
            y: thisObject.container.frame.height / 2 + fontSize / 2 + breakpointsHeight
        };

        point = thisObject.container.frame.frameThisPoint(point);

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY;
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)';
        browserCanvasContext.fillText(label, point.x, point.y);
    }
}
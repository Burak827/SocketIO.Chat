var globalDefaultSocket;
var globalRooms;


function onAddRoomModalButtonClicked(){
    $('#roomName').focus();
}
function onChangeUsernameButtonClicked(){
    debugger;
    $('#userName').focus();
}

/*$('#changeUserNameModal').on('shown.bs.modal', function (e) {
    $('#userName').focus();
});
$('#addRoomModal').on('shown.bs.modal', function (e) {
    $('#userName').focus();
});*/

$(window).resize(function () {
    initUI();
});

function onTextSubmit(e) {
    e.preventDefault();
    let message = $(e.currentTarget).find("input").val();
    let channel = $(e.currentTarget).attr("target-channel");
    message = "@" + channel + " " + message;
    if (message != "") {
        globalDefaultSocket.emit('message', message);
        $(e.currentTarget).find("input").val('');
    }
    return false;
}

$(function () {
    var defaultSocket = globalDefaultSocket = io("localhost:827");
    var generalInfoSocket = io("/generalInfo");

    $('.message-box-form').submit(onTextSubmit);

    defaultSocket.on('newMessage', (newMsg) => {
        var date = new Date(newMsg.date);
        var messageListElement = $('#' + newMsg.channel);
        var messageElement = $('<li />');
        var dateElement = $('<span />');
        var fromElement = $('<span />');
        var textElement = $('<span />');

        var hour = date.getHours();
        var minute = date.getMinutes();
        var second = date.getSeconds();
        hour = (hour < 10) ? '0' + hour.toString() : hour.toString()
        minute = (minute < 10) ? '0' + minute.toString() : minute.toString()
        second = (second < 10) ? '0' + second.toString() : second.toString()

        dateElement.addClass("date-item");
        dateElement.addClass("list-group");
        dateElement.text(hour + ":" + minute + ":" + second);

        messageElement.addClass("user-li-item");
        messageElement.addClass("list-group-item");
        fromElement.addClass("from-element");
        textElement.addClass("text-element");

        fromElement.text(newMsg.userName);
        textElement.text(newMsg.messageText);
        messageElement.append(fromElement);
        messageElement.append(textElement);
        messageElement.append(dateElement);
        messageListElement.append(messageElement);
    });

    generalInfoSocket.on('userInfo', (users) => {
        var userContainerElement = $('#userContainer');
        var userListContainerElement = $('#userListContainer');
        userListContainerElement.html("");

        var userListElement = $("<ul />");
        userListElement.addClass("user-ul-item");
        userListElement.addClass("list-group");
        userListElement.addClass("list-group-flush");

        for (var i = 0; i < users.length; i++) {
            var userElement = $("<li />");
            userElement.prop("id", users[i].id);
            userElement.text(users[i].name);
            userElement.addClass("user-li-item");
            userElement.addClass("list-group-item");
            userListElement.append(userElement);
        }

        userListContainerElement.append(userListElement);
        userContainerElement.append(userListContainerElement);
        // $('#roomsInfo').append($('<li>').text(msg));
    });

    generalInfoSocket.on('roomInfo', (rooms) => {
        globalRooms = rooms;
        var roomListContainerElement = $('#roomListContainer');
        roomListContainerElement.html("");
        var roomListElement = $("<div />");
        roomListElement.addClass("user-ul-item");
        roomListElement.addClass("list-group");
        roomListElement.addClass("list-group-flush");

        for (var i = 0; i < rooms.length; i++) {
            var roomElement = $("<li />");
            var btnRemoveRoom = $("<button />");
            var btnJoinRoom = $("<button />");

            btnRemoveRoom.attr("roomName", rooms[i].name);
            btnRemoveRoom.addClass("btn btn-danger btn-sm float-left oi oi-x remove-room-button");
            btnRemoveRoom.click((e) => {
                var roomName = e.currentTarget.getAttribute("roomname");
                var roomTitles = [];

                for (var i = 0; i < $("#pills-tab>.nav-item>.nav-link").length; i++) {
                    let roomId = $($("#pills-tab>.nav-item>.nav-link")[i]).attr("room-id");
                    roomTitles.push(roomId);
                }
                if (roomTitles.includes(e.currentTarget.getAttribute("roomname"))) {
                    leaveRoom(roomName);
                    closeRoom(roomName);
                }
                removeNewRoomClicked(e.currentTarget.getAttribute("roomname"));
            });

            btnJoinRoom.attr("roomName", rooms[i].name);
            btnJoinRoom.addClass("btn btn-sm btn-success float-right oi oi-comment-square");
            btnJoinRoom.click((e) => {
                var roomName = e.currentTarget.getAttribute("roomname");
                var roomTitles = [];

                for (var i = 0; i < $("#pills-tab>.nav-item>.nav-link").length; i++) {
                    let roomId = $($("#pills-tab>.nav-item>.nav-link")[i]).attr("room-id");
                    roomTitles.push(roomId);
                }
                if (!roomTitles.includes(e.currentTarget.getAttribute("roomname"))) {
                    joinRoom(roomName);
                    openRoom(roomName);
                    $('a.nav-link#pills-' + roomName + '-tab').tab('show');
                } else {
                    $('a.nav-link#pills-' + roomName + '-tab').tab('show');
                }
            });

            roomElement.addClass("list-group-item list-group-item-action text-center");
            roomElement.text(rooms[i].name);
            roomElement.append(btnRemoveRoom);
            roomElement.append(btnJoinRoom);
            roomListElement.append(roomElement);
        }
        roomListContainerElement.append(roomListElement);

        var aElements = $("#pills-tab>.nav-item>.nav-link");

        var roomTitles = [];
        for (var i = 0; i < aElements.length; i++) {
            let roomId = $(aElements[i]).attr("room-id");
            roomTitles.push(roomId);
        }

        for (var i = 0; i < roomTitles.length; i++) {
            let roomId = roomTitles[i];
            if (!rooms.includes(roomId) && roomId != "Public") {
                 leaveRoom(roomId);
                // closeRoom(roomId);
            }
        }

        for (var i = 0; i < rooms.length; i++) {
            if (!roomTitles.includes(rooms[i].name) && rooms[i] != "Public") {
                // openRoom(rooms[i].name);
            }
        }
    });

    initUI();
});

function openRoom(roomName) {
    //TAB PART
    var tabsElement = $("#pills-tab");
    var navItemLi = $("<li/>");
    var navLinkA = $('<a style="color:black;"/>');
    navItemLi.addClass("nav-item");

    navLinkA.addClass("nav-link");
    navLinkA.addClass("my-nav-button");

    navLinkA.attr("room-id", roomName);
    navLinkA.attr("id", "pills-" + roomName + "-tab");
    navLinkA.attr("data-toggle", "pill");
    navLinkA.attr("href", "#pills-" + roomName);
    navLinkA.attr("role", "tab");
    navLinkA.attr("aria-controls", "pills-profile");
    navLinkA.attr("aria-selected", "false");
    navLinkA.text(roomName);

    var closeButton = $('<button class="btn btn-danger btn-sm float-left oi oi-x close-tab-button"/>');
    closeButton.click((e) => {
        let publicTabName = "home";
        closeRoom($(closeButton).parent().attr("room-id"));
        closeButton.remove();
        $('a.nav-link#pills-' + publicTabName + '-tab').tab('show');
    });

    navLinkA.append(closeButton);
    navItemLi.append(navLinkA);
    tabsElement.append(navItemLi);

    //------

    //CONTENT PART
    var contentElement = $('#pills-tabContent');
    var paneDiv = $('<div class="tab-pane messages-container fade"  role="tabpanel"    aria-labelledby="pills-home-tab" id="pills-' + roomName + '"/>');
    var messageListDiv = $('<div id="' + roomName + '" class="message-list" />');
    var messageBoxDiv = $('<div  id="' + roomName + '-messageBox" class="message-box"/>');
    var messageBoxForm = $('<form target-channel="' + roomName + '"class="message-box-form height-100"/>');
    var span = $("<span/>");
    var input = $('<input class="height-100 width-100"  autocomplete="off" id="m-' + roomName + '" /> ');

    messageBoxForm.submit(onTextSubmit);
    span.append(input);
    messageBoxForm.append(span);
    messageBoxDiv.append(messageBoxForm);
    paneDiv.append(messageListDiv);
    paneDiv.append(messageBoxDiv);
    contentElement.append(paneDiv);
    //-----------------

    //inituidakiler
    var messageBoxHeight = 33;
    // messageList.height(messagesContainer.height() - messageBoxHeight);
    messageListDiv.addClass("list-group-flush");
    messageListDiv.addClass("list-group");
    messageBoxDiv.height(messageBoxHeight);

    var messageListElements = $(".message-list");
    ////TODO show olan tabe göre olmalı
    for (var i = 0; i < messageListElements.length; i++) {
        var messageListElement = $(messageListElements[i]);
        messageListElement.height(window.innerHeight - ($(".tab-pane.active>.message-list")[0].offsetTop + messageBoxHeight) - 3);
    }
}

function closeRoom(roomName) {
    //TAB PART
    $('#pills-tab>li>a[room-id="' + roomName + '"]').parent().remove();
    $('#pills-tabContent>div.tab-pane#pills-' + roomName).remove();
}

function initUI() {
    var messageBoxHeight = 33;
    var mainContainer = $("#mainContainer");
    var messagesContainer = $("#messagesContainer");
    var messageBox = $(".message-box");
    var messageList = $("#messageList");
    var userContainer = $("#userContainer");

    var windowHeight = window.innerHeight;
    var messageInput = $("#m");
    // var sendButton = $("#sendButton");

    mainContainer.height(window.innerHeight);

    $("#roomContainer").height((mainContainer.height() / 2) - 2);
    $("#x").height((mainContainer.height() / 2) - 2);

    // messageList.height(messagesContainer.height() - messageBoxHeight);
    messageList.addClass("list-group-flush");
    messageList.addClass("list-group");
    messageBox.height(messageBoxHeight);

    var messageListElements = $(".message-list");
    ////TODO show olan tabe göre olmalı
    for (var i = 0; i < messageListElements.length; i++) {
        var messageListElement = $(messageListElements[i]);
        messageListElement.height(window.innerHeight - ($(".tab-pane.active>.message-list")[0].offsetTop + messageBoxHeight) - 3);
    }

}

function changeUsernameClicked() {
    var roomName = $("#userName").val();
    var command = "/nickname";
    globalDefaultSocket.emit("message", command + " " + roomName);
    $("#userNameName").val("");
    $("#changeUserNameModal").modal("hide");
}

function addNewRoomClicked() {
    var roomName = $("#roomName").val();
    var command = "/newRoom";
    addOrRemoveRoom(command, roomName);
    $("#roomName").val("");
    $("#addRoomModal").modal("hide");
}

function removeNewRoomClicked(roomname) {
    var command = "/closeroom";
    addOrRemoveRoom(command, roomname);
}

function addOrRemoveRoom(command, roomName) {
    globalDefaultSocket.emit("message", command + " " + roomName);
}

function joinRoom(roomName) {
    globalDefaultSocket.emit("joinRoom", roomName);
}

function leaveRoom(roomName) {
    globalDefaultSocket.emit("leaveRoom", roomName);
}


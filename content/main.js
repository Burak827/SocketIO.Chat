var globalDefaultSocket;
$(window).resize(function () {
    initUI();
});

$(function () {
    var defaultSocket = globalDefaultSocket = io("localhost:827");
    var generalInfoSocket = io("/generalInfo");;

    $('#messageBoxForm').submit(function () {
        let message = $('#m').val();
        if (message != "") {
            defaultSocket.emit('message', message);
            $('#m').val('');
        }
        return false;
    });

    defaultSocket.on('newMessage', (newMsg) => {
        var date = new Date(newMsg.date);
        var messageListElement = $('#pills-home');
        var messageElement = $('<li />');
        var dateElement = $('<span />');

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
        messageElement.text(newMsg);
        messageElement.text(newMsg.channel + " -> " + newMsg.userName + " : " + newMsg.messageText);
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

            // var chkSubscribed = $("<input />");
            // var lblSubscribed = $("<label />");
            // chkSubscribed.attr("type", "checkbox");
            // chkSubscribed.attr("roomName", rooms[i].name);
            // chkSubscribed.addClass("room-checkbox");
            // chkSubscribed.addClass("form-check-input");
            // chkSubscribed.change(onRoomCheckBoxChanged);
            // lblSubscribed.addClass("form-check-label");
            // lblSubscribed.text(rooms[i].name);
            btnRemoveRoom.attr("roomName", rooms[i].name);
            btnRemoveRoom.addClass("btn btn-danger btn-sm float-left oi oi-x");
            btnRemoveRoom.click((e) => {
                removeNewRoomClicked(e.currentTarget.getAttribute("roomname"));
            });

            btnJoinRoom.attr("roomName", rooms[i].name);
            btnJoinRoom.addClass("btn btn-sm btn-success float-right oi oi-comment-square");
            btnJoinRoom.click((e) => {
                joinRoom(e.currentTarget.getAttribute("roomname"));
            });

            // roomElement.prop("id", rooms[i].name);
            // roomElement.addClass("user-li-item");
            roomElement.addClass("list-group-item list-group-item-action text-center");
            roomElement.text(rooms[i].name);
            // roomItemElement.append(chkSubscribed);
            // roomItemElement.append(lblSubscribed);
            // roomElement.append(roomItemElement);
            roomElement.append(btnRemoveRoom);
            roomElement.append(btnJoinRoom);
            roomListElement.append(roomElement);
        }
        roomListContainerElement.append(roomListElement);
    });

    initUI();
});

function initUI() {
    var messageBoxHeight = 33;
    var mainContainer = $("#mainContainer");
    var messagesContainer = $("#messagesContainer");
    var messageBox = $("#messageBox");
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

    for (var i = 0; i < messageListElements.length; i++) {
        var messageListElement = $(messageListElements[i]);
        messageListElement.height(window.innerHeight - (messageListElement[0].offsetTop + $("#messageBox").height()) - 3);
    }

    // messageBox.width(messageListElements.width());
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
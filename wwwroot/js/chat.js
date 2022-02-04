//    "use strict";
window.onload = function () {
    var connection = new signalR.HubConnectionBuilder().withUrl("/stream/chatHub").build();

    //Disable send button until connection is established
    document.getElementById("sendButton").disabled = true;
    var video = document.getElementById('video');
    var hls = new Hls();

    var userColor;
    var currentStreams = [];
    var first = true;

    connection.on("ReceiveMessage", function (user, userId, message) {
        var msg = message.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        var coloredUser = document.createElement("span");
        coloredUser.style.color = getColor(userId);        ////get right color    
        var encodedMsg = ": " + msg;
        coloredUser.innerText = user + encodedMsg;
        var li = document.createElement("li");
        li.appendChild(coloredUser);
        //li.appendChild(encodedMsg);    
        var chatlist = document.getElementById("messagesList");
        chatlist.appendChild(li);
        var chatlistC = document.getElementById("messageContainer");
        chatlist.scrollTop = chatlist.scrollHeight;
        while (chatlist.scrollHeight > chatlistC.clientHeight) {
            chatlist.removeChild(chatlist.firstChild);
        }
    });

    var getColor = function (searchId) {
        var color = userColor.find(id => id[0] === searchId)[1];
        return color;
    }

    connection.on("colorPool", function (usersOnline) {
        userColor = usersOnline;
    });

    var insertStreams = function (incomingStreams) {
        var streamSelection = document.getElementById("streamSelection");
        var newStreams = [];
        var itemsToRemove = [];
        //incomingStreams.forEach(income =>{
        //    if (!currentStreams.includes(income)) {
        //        newStreams.push(income);
        //        currentStreams.push(income);
        //    }
        newStreams = incomingStreams.filter(incoming => !currentStreams.includes(incoming));
        newStreams.forEach(x => currentStreams.push(x));
        //currentStreams.forEach(curStream => {           
        //        if (!incomingStreams.includes(curStream)) {
        //            itemsToRemove.push(curStream);                
        //        }
        //    })
        itemsToRemove = currentStreams.filter(curitem => !incomingStreams.includes(curitem));

        for (i = 0; i < itemsToRemove.length; i++) {
            var index = currentStreams.indexOf(itemsToRemove[i]);
            if (index > -1) {
                currentStreams.splice(index, 1);
            }
            for (e = 0; e < streamSelection.length; e++) {
                var dataValue = streamSelection[e];
                if (itemsToRemove.includes(dataValue.value)) {
                    streamSelection.removeChild(dataValue);
                }
            }
        }

        for (i = 0; i < newStreams.length; i++) {
            var option = document.createElement("option");
            option.value = newStreams[i];
            option.innerText = newStreams[i].slice(0, newStreams[i].length - 5);
            streamSelection.appendChild(option);
        }
    };
    
    connection.on("ReceiveStreamNames", function (streamNameList) {
        if (first) {
            first = false;            
            playHls(streamNameList[0]);
        }
        insertStreams(streamNameList);        
    });

    var getStreamList = function () {
        var request = new XMLHttpRequest();
        request.open("Get", "/api/info");
        request.onreadystatechange = function () {
            if (this.readyState === 4) {
                currentStreams = JSON.parse(request.response);
                if (currentStreams.length > 0) {
                    for (var i = 0; i < currentStreams.length; i++) {
                        var option = document.createElement("option");
                        option.value = currentStreams[i];
                        option.innerText = currentStreams[i].slice(0, currentStreams[i].length - 5);
                        streamSelection.appendChild(option);
                    }
                    playHls(currentStreams[0])
                }
                else {
                    playVideo();
                }                
            }
        };
        request.send();
    };
    getStreamList();    

    connection.on("ViewerCount", function (count) {
        var viewerCount = document.getElementById("viewers");
        viewerCount.innerText = count;
    });

    document.getElementById("sendButton").addEventListener("click", function (event) {
        var userName = document.getElementById("userName");
        if (userName.value !== "") {
            var message = document.getElementById("messageInput");

            if (message.value !== "") {
                connection.invoke("SendMessage", userName.value, message.value).catch(function (err) {
                    return console.error(err.toString());
                });
                message.value = "";
                event.preventDefault();
            }
        }
    });

    var input = document.getElementById("messageInput");
    input.addEventListener("keyup", function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("sendButton").click();
        }
    });

    connection.start().then(function () {
        document.getElementById("sendButton").disabled = false;
    }).catch(function (err) {
        return console.error(err.toString());
    });  

    var playHls = function (stream) {
        video.pause();
        video.removeAttribute("src");
        video.removeAttribute("type");
        video.load();
        
        var videoType = 'application/vnd.apple.mpegurl';
        var videoSrc = "/hls/" + stream;
        video.type = videoType;
        hls.attachMedia(video);
        hls.on(Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(videoSrc);
            hls.on(Hls.Events.MANIFEST_PARSED, function (event, data) {
                video.muted = true;
                video.play();
            });
        });
    }
    var playVideo = function () {
        var number = Math.floor(Math.random() * 1);
        
        video.type = "video/webm";
        video.src = "media/anime1.webm";

        //var vSrc = document.createElement("source");
        //vSrc.src = "media/anime1.webm";
        //vSrc.type = "video/webm";
        //video.appendChild(vSrc);

        //var track = document.createElement("track");
        //track.src = "media/anime1.srt";
        //track.kind = "subtitles";
        //track.mode = "showing";
        //track.label = "Englisch";
        //track.srclang = "en";
        //video.appendChild(track);
        //video.textTracks[0].mode = "showing";        
    }
    document.getElementById("streamSelection").addEventListener("change", function () {
        playHls(this.value);
    });
    document.getElementById("streamSelect").addEventListener("keyup", function () {
        if (event.keyCode === 13) {
            event.preventDefault();
            playHls(this.value+".m3u8")
        }
    });
    document.getElementById("howToImg").addEventListener("click", function () {
        this.style.display = "none";
    })
    document.getElementById("howTo").addEventListener("click", function () {
        var img = document.getElementById("howToImg");
        img.style.display = "inline";
        img.style.position = "absolute";
        img.style.top = "3%";
        img.style.left = "17%";
        img.style.height = "90%";
        img.style.cursor = "pointer";
    })
}
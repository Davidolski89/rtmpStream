# rtmpStream
Streaming UI with chat functionality

# Description
This application is supposed to be hosted on top of a rtmp and file server.  
It checks for playlists(.m3u) in a selected folder and lets the user decide which one to play.  
Provides LiveChat functionality over WebSockets (SignalR library).  

# Usage
1. Have your rtmp Server running
2. Set the fileserver to serve files from Your_Machine/hls
    - optionaly a small controller can be added to serve files from kestrell
3. Set the StreamPath in appsettings.json to where the rtmp server is saving the livefeed

## possible rtmp Servers
[nginx compiled with rtmp module](https://github.com/sergey-dryabzhinsky/nginx-rtmp-module) (tested) [tutorial](https://docs.peer5.com/guides/setting-up-hls-live-streaming-server-using-nginx/)   
[ffmpeg](https://www.ffmpeg.org/)

## Mention
Using [hls.js](https://github.com/video-dev/hls.js/) for browser playback.



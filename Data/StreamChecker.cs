using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using System.IO;
using rtmpStream.Hubs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Configuration;

namespace rtmpStream.Data
{
    public class StreamChecker
    {
        string path;
        Thread thread;
        IHubContext<ChatHub> chatHub;
        IConfiguration config;
        public StreamChecker(IConfiguration configuration, IHubContext<ChatHub> hubContext)
        {
            config = configuration;
            chatHub = hubContext;
            Path = config.GetSection("StreamPath").Value;
        }        

        public string Path
        {
            get { return path; }
            set { if (Directory.Exists(value))
                {
                    path = value;
                    StartListener();
                }
            }
        }
        public IEnumerable<string> oldList = new List<string>();
        public IEnumerable<string> newList = new List<string>();

        void StartListener()
        {
            if(thread is null)
            {                
                thread = new Thread(new ThreadStart(Check));
                thread.Start();
                thread.Priority = ThreadPriority.Lowest;                
            }
        }
            
        void Check()
        {            
            while (true)
            {
                newList = Directory.GetFiles(Path, "*.m3u8").Select(x=> System.IO.Path.GetFileName(x)).Where(v => !v.Contains("hidden"));                
                if(newList.Count() != oldList.Count())
                    chatHub.Clients.All.SendAsync("ReceiveStreamNames", newList);
                oldList = newList;
                Thread.Sleep(10000);
            }
        }
    }
}

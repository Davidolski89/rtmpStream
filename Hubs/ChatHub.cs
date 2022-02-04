using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using System.Text;


namespace rtmpStream.Hubs
{
    public class ChatHub : Hub
    {
        public static List<string[]> usersOnline = new List<string[]>();
        static List<string> colorPool = new List<string>() {
            "#a2b9bc", "#b2ad7f" ,"#878f99","#6b5b95","#c94c4c","#034f84","#feb236","#d64161" ,"#ff7b25","#d6cbd3", "#eca1a6","#bdcebe", " #ada397","#d5e1df","#e3eaa7","#b5e7a0","#86af49"
        };
        
        public async Task SendMessage(string name, string message)
        {
            await Clients.All.SendAsync("ReceiveMessage", name ,Context.ConnectionId , message);            
        }
       
        
        public override async Task OnConnectedAsync()
        {
            Random gen = new Random();
            int randnumber = gen.Next(0,colorPool.Count);
            string[] urs = { Context.ConnectionId, colorPool[randnumber] };
            usersOnline.Add(urs);
            colorPool.RemoveAt(randnumber);
            await Clients.All.SendAsync("ViewerCount", usersOnline.Count());
            await Clients.All.SendAsync("colorPool",usersOnline);
            await base.OnConnectedAsync();
        }
        public override async Task OnDisconnectedAsync(Exception ex)
        {
            string[] comp = usersOnline.Where(x => x[0] == Context.ConnectionId).FirstOrDefault();
            colorPool.Add(comp[1]);
            usersOnline.Remove(comp);
            await Clients.All.SendAsync("ViewerCount", usersOnline.Count());
            var counter = Context.User.Identities.Count();
            await base.OnDisconnectedAsync(ex);
        }
    }    
}

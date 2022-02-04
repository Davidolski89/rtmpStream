using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using rtmpStream.Data;

namespace rtmpStream.Controller
{
    public class InfoController : ControllerBase
    {
        StreamChecker checker;
        public InfoController(StreamChecker streamchecker)
        {
            checker = streamchecker;
        }

        [Route("api/[controller]")]        
        [HttpGet]
        public IEnumerable<string> GetStreams()
        {
            return checker.oldList;
        }
    }
}

class SaveManager
{
    public static initializeSystem()
    {
        var desiredCapacity = 10*1024*1024;
        (<any>window).storage = new (<any>window).LargeLocalStorage({size: desiredCapacity, name: 'saves'});
        (<any>window).storage.initialized.then(function(grantedCapacity) {});
        (<any>window).start((<any>window).fullscreenCanvas, (<any>window).base64_decode((<any>window).romb641));
        (<any>window).fullscreenPlayer();
    }



    public static save()
    {
        try
        {
            var s1 = (<any>window).gameboy.saveState(),
            done = [false,false];
            (<any>window).storage.setContents('pokemulti', JSON.stringify(s1)).then(function() {
              done[0] = true;
            });
        }
        catch(e)
        {
            alert("Error when trying to save. Error message : \n"+e)
        }
    }

    public static load()
    {
        try
        {
            var saves = [], done = [false,false];
            (<any>window).storage.getContents('pokemulti').then(function(s1) {
                if(s1)saves[0] = JSON.parse(s1);
                done[0] = true;
                checkDone();
            });
            
            function checkDone()
            {
                if(done[0] /*&& done[1]*/)
                {
                    if( saves[0] /*&& saves[1]*/)
                    {
                        (<any>window).clearLastEmulation();
                        (<any>window).gameboy = new (<any>window).GameBoyCore((<any>window).fullscreenCanvas, "");
                        if(!(<any>window).inFullscreen)
                            (<any>window).fullscreenPlayer();
                        (<any>window).gameboy.savedStateFileName = "SAVE STATE POKEMULTI";
                        (<any>window).gameboy.returnFromState(saves[0]);
                        (<any>window).run();
                    }
                }
            }
        }
        catch(e)
        {
            alert("Error when trying to load. Error message :\n "+e)
        }
    }

    public static saveLocal()
    {
        try {
            (<any>window).storage.getContents('pokemulti').then(function(s1) {
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(s1));
                element.setAttribute('download', "ModdableGB.rawsave");
              
                element.style.display = 'none';
                document.body.appendChild(element);
              
                element.click();
              
                document.body.removeChild(element);
            });
        }
        catch(e)
        {
            alert("Error when trying to save. Error message : \n"+e)            
        }
    }

    public static loadLocal(ev : Event)
    {
        let input : HTMLInputElement = <HTMLInputElement>ev.target;
        if(input.files.length < 1)
            return;
        let file = input.files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            var saves = [], done = [false,false];
            let s1 = (<any>e.target).result;
            if(s1)
                saves[0] = JSON.parse(s1);
            done[0] = true;
            checkDone();
      
            function checkDone()
            {
                if(done[0] /*&& done[1]*/)
                {
                    if( saves[0] /*&& saves[1]*/)
                    {
                        (<any>window).clearLastEmulation();
                        (<any>window).gameboy = new (<any>window).GameBoyCore((<any>window).fullscreenCanvas, "");
                        if(!(<any>window).inFullscreen)
                            (<any>window).fullscreenPlayer();
                        (<any>window).gameboy.savedStateFileName = "SAVE STATE POKEMULTI";
                        (<any>window).gameboy.returnFromState(saves[0]);
                        (<any>window).run();
                    }
                }
            }
        };
        reader.readAsText(file);
    }
}

(<any>window).SaveManager = SaveManager;
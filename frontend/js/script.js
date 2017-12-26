function startGame()
{
	var desiredCapacity = 10*1024*1024;
			storage = new LargeLocalStorage({size: desiredCapacity, name: 'saves'});
			storage.initialized.then(function(grantedCapacity) {});
	start(mainCanvas, base64_decode(romb641));
}

function save()
		{
			try
			{
				var s1 = gameboy.saveState(),
				done = [false,false];
				storage.setContents('pokemulti', JSON.stringify(s1)).then(function() {
				  done[0] = true;
				});
			}
			catch(e)
			{
				alert("Error when trying to save. Error message : \n"+e)
			}
		}
		
		function load()
		{
			try
			{
				var saves = [], done = [false,false];
				storage.getContents('pokemulti').then(function(s1) {
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
							clearLastEmulation();
							gameboy = new GameBoyCore(mainCanvas, "");
							gameboy.savedStateFileName = "SAVE STATE POKEMULTI";
							gameboy.returnFromState(saves[0]);
							run();
						}
					}
				}
			}
			catch(e)
			{
				alert("Error when trying to load. Error message :\n "+e)
			}
		}
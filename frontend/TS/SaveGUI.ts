class SaveGUI
{
    private static GUI : HTMLElement = null;

    constructor()
    {

    }

    private buildGUI()
    {
        if(SaveGUI.GUI != null)
            return;
        let ui = document.createElement("template");
        ui.innerHTML = 
        `<nav>
        <input id="save"  value="SAVE" onclick="SaveManager.save();" type="button"/>
        <input id="load"  value="LOAD" onclick="SaveManager.load();" type="button"/>
		<input id="save"  value="SAVE LOCAL" onclick="SaveManager.saveLocal();" type="button"/>
        <input id="save"  value="LOAD LOCAL" onchange="SaveManager.loadLocal(event);" type="file"/>
        </nav>`;
        SaveGUI.GUI = <HTMLElement>ui.firstChild;
        document.appendChild(SaveGUI.GUI);
    }
}
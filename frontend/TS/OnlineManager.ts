interface RTC
{
    id? : number;
    password? : string;
    serverDescription? : string;
    clientDescription? : string;
    clientCandidates? : string;
    serverCandidates? : string;
}

class OnlineManager
{
    private static Database : string = "http://placeholder";


    private static Instance : OnlineManager = new OnlineManager();

    public static GetInstance() : OnlineManager
    {
        return OnlineManager.Instance;
    }

    private rtc : RTC = null;

    constructor()
    {

    }

    /**
     * Ouvre la connexion et poste l'objet RTC initialisé sur le serveur 
     */
    public openServer()
    {
        this.rtc = {
            serverDescription : (<any>window).Server.localDescription
        }
        OnlineManager.request(OnlineManager.Database+"/rtc", this.rtc, "PUT").then((response) => {
            this.rtc.id = response.value;
        }, (error) => { 
            alert("Unable to create.");
        });;
    }

    /**
     * Lance une tentative de rejoindre un serveur à partir de l'id de l'objet RTC posté par le pair. 
     * @param id id de l'objet rtc à rejoindre
     */
    public beginJoinServer(id : number)
    {
        OnlineManager.request(OnlineManager.Database+"/rtc/"+id, null, "GET").then((response) => {
            this.rtc = response.value;
            (<any>window).Client.receiveOffer(new RTCSessionDescription(JSON.parse(this.rtc.serverDescription))).then((response) => {
                this.rtc.clientDescription = (<any>window).Client.localDescription;
                OnlineManager.request(OnlineManager.Database+"/rtc/"+this.rtc.id, this.rtc, "PATCH");
            }, (error) => {
                alert("Error receive Offer");
            });
        }, (error) => {
            alert("Unable to reach.");
        });
    }

    /**
     * A lancer de manière périodique, vérifie si une paire a lancé BeginJoinServer sur l'objet initialisé.
     */
    public checkConnection()
    {
        if(this.rtc == null || this.rtc.id == null)
            throw new Error("Cant call that before OpenServer.");
        OnlineManager.request(OnlineManager.Database+"/rtc/"+this.rtc.id, null, "GET").then((response) => {
            this.rtc = response.value;
            if(this.rtc.clientDescription == null)
                return;
            (<any>window).Server.setRemoteDescription(new RTCSessionDescription(JSON.parse(this.rtc.clientDescription)));
            this.rtc.serverCandidates = (<any>window).Server.candidates;
            OnlineManager.request(OnlineManager.Database+"/rtc/"+this.rtc.id, this.rtc, "PATCH");
        }, (error) => {
            alert("Unable to reach.");
        });
    }

    /**
     * A lancer de manière périodique, vérifie si le serveur a lancé checkConnection sur l'objet RTC avec succès.
     */
    public updateJoinServer()
    {
        if(this.rtc == null || this.rtc.id == null)
            throw new Error("Cant call that before BeginJoinServer.");
        OnlineManager.request(OnlineManager.Database+"/rtc/"+this.rtc.id, null, "GET").then((response) => {
                this.rtc = response.value;
                if(this.rtc.serverCandidates == null)
                    return;
                (<any>window).Client.setCandidates(JSON.parse(this.rtc.serverCandidates));
                this.rtc.clientCandidates = (<any>window).Client.candidates;
                OnlineManager.request(OnlineManager.Database+"/rtc/"+this.rtc.id, this.rtc, "PATCH");
        }, (error) => {
            alert("Unable to reach.");
        });
    }

    /**
     * A lancer de manière périodique, après checkConnection. vérifie si le client a lancé updateJoinServer sur l'objet RTC avec succès.
     */
    public finalizeConnection()
    {
        if(this.rtc == null || this.rtc.id == null || this.rtc.serverCandidates == null)
            throw new Error("Cant call that before checkConnection.");
        OnlineManager.request(OnlineManager.Database+"/rtc/"+this.rtc.id, null, "GET").then((response) => {
                this.rtc = response.value;
                if(this.rtc.clientCandidates == null)
                    return;
                (<any>window).Server.setCandidates(JSON.parse(this.rtc.clientCandidates));
                OnlineManager.request(OnlineManager.Database+"/rtc/"+this.rtc.id, null, "DELETE");
        }, (error) => {
            alert("Unable to reach.");
        });
    }


    /**
     * Effectue une requete Ajax et retourne une promesse.
     * address : concaténé après App.Address, addresse à interroger
     * data : données de la requête
     */
    public static request(address, data, method = "POST", redirect = true) : Promise<any>
    {
        let jsonToQuery = function(json) {
            return  Object.keys(json).map(function(key) {
                    if(json[key] != null)
                        return encodeURIComponent(key) + '=' +
                            encodeURIComponent(json[key]);
                }).join('&');
        };
        return new Promise(function(resolve, reject)
        {
            var href=window.location.href;
            if(data == null)
                data = {};
            
            var oReq = new XMLHttpRequest();
            oReq.open(method, address, true);
            //TODO: ajouter les headers
            if(data != null && method != "GET")
                oReq.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            
            //oReq.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
            oReq.send(jsonToQuery(data));

            oReq.onreadystatechange = function () 
            {
                var DONE = 4; // readyState 4 means the request is done.
                var OK = 200; // status 200 is a successful return.
                if (oReq.readyState === DONE) {
                  if (oReq.status === OK) 
                  {
                      var response = JSON.parse(oReq.responseText);
                        try
                        {
                            resolve(response);
                        }
                        catch(error)
                        {
                                reject(error);
                        }
                  } else {
                      alert("Network error.");
                  }
                }
            };
        });
    }



    
}
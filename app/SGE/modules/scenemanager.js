// MANAGER DE ESCENAS
SGE.Scene = new function(){
    var scenes = {};
    var loaded = [0,0];
    var current;
    var hasGameLoop = SGE.hasModule("gameloop");

    var _Add = function(name, callback, destructor){
        loaded[0]++;
        if(typeof callback == "function"){
            scenes[name] = {
                'callback': callback,
                'destructor': destructor || false
            };
            loaded[1]++;
        }else if(typeof callback == "string"){
            $.getScript(callback)
                .done(function(script){
                    scenes[name] = {
                        'callback': (typeof SceneConstructor != "undefined")? SceneConstructor : function(){console.log("SceneConstructor not defined in "+callback)},
                        'destructor': (typeof SceneDestructor != "undefined")? SceneDestructor : function(){console.log("SceneDestructor not defined in "+callback)}
                    }
                    delete SceneConstructor;
                    delete SceneDestructor;

                    console.log("Scene "+name+" loaded from "+callback);
                    loaded[1]++;
                })
                .fail(function(xhr, settings, exception){
                    console.log("%c Scene "+name+" couldn't be loaded from "+callback, csswarning);
                });

        }
    };

    var _Preload = function(cb){
        var t = setInterval(function(){
            if(_isLoaded){
                clearInterval(t);
                cb();
            }
        },300);
    }

    var _LoadScene = function(name,args){
        if(current && scenes[current].destructor) scenes[current].destructor(args);
        current = name;
        if(hasGameLoop){
            GameLoop.Clear();
        }
        scenes[name].callback(args);
    };

    var _isLoaded = function(){
        return (loaded[0] == loaded[1])? true : false;
    }

    this.Add = _Add;
    this.Load = _LoadScene;
    this.Preload = _Preload;
    this.isLoaded = _isLoaded;
    this.__defineGetter__("current",function(){return current});
};  // SCENE

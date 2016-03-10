function Init(){
    var App = {
        DBConfig : false,
        DBProjects : false,
        activeProject: false,
        Loading: false,
        AskFor: false,
        Download: false,
        ProjectStructure : __projectStructure
    }
    function __projectStructure(n){
        return {
            name: n,
            modules: [],
            defaults: MIYData.defaults
        }
    }

    PDB.Init(DBReady);
    function DBReady(){
        App.DBConfig = PDB.Select("MIY_CONFIG");
        App.DBProjects = PDB.Select("MIY_PROJECTS");
    }

    SGE.Loader.Add([
        "assets/miy-modules.js"
    ]);

    return App;
}

function Main(App){
    SGE.Scene.Add("editor", "scenes/editor.js");

    for(var e in MIYData.toolbar)
        $(".toolbar " + MIYData.toolbar[e].parent).append(
            $("<li>").addClass("item").attr("tbaction", e).append(
                $("<p>").html(MIYData.toolbar[e].name)
            )
        );

    SGE.Scene.Preload(function(){
        AllReady();
    });

    //TOOLS
    App.Loading = new function(){
        var ls = $("#loading");

        this.Show = function(){
            ls.fadeIn(300);
        }
        this.Hide = function(){
            ls.fadeOut(300);
        }
    }

    var contextmenu = new function(){
        var cm = $("#contextmenu");
        var target = false;
        var ce = false;
        var o = false;

        this.trigger = function(e, pos, t){
            try{ e.preventDefault();} catch(e){};
            if(!App.activeProject) return false;
            if(e === true) __hide();
            if(e === "cache"){
                e = ce;
                e.target = t.get(0);
                __hide(e);
            }else{
                ce = e;
            }

            if(o) __hide(e, true);
            else __show(e,pos,t);
        }
        function __hide(e, reopen){
            o = false;
            target = false;
            cm.hide();
            if(reopen) __show(e);
        }
        function __show(e,pos,t){
            o = true;
            target = $(e.target);
            cm.css({
                "top":e.pageY,
                "left":e.pageX
            });

            var cl = target.closest(".miy-module");

            if(pos)
                __Populate(0 |0, pos, t);
            else if(target.hasClass("main-canvas"))
                __Populate(0 |0);
            else if(cl.hasClass("miy-module"))
                __Populate(1 |0);
            else {o = false; target = false; return false};

            cm.show();
        }

        function __Populate(t,pos,ta){
            var ul = cm.find("ul");
            ul.find("li").off();
            ul.empty();
            switch(t){
                case 0:
                    target = $("center div.content table.bgtable tr td");
                    for(var m in MIYData.modules)
                        ul.append(
                            $("<li>").addClass("cm-module").attr("mcode",MIYData.modules[m].mcode).append(
                                $("<p>").html(MIYData.modules[m].name)
                            )
                        );
                        ul.find("li").on("click", function(e){
                            if(pos)
                                MIYData.modules[$(this).attr("mcode")].action([ta.closest(".miy-module"),pos], App);
                            else
                                MIYData.modules[$(this).attr("mcode")].action(target, App);
                        });
                break;
                case 1:
                    for(var m in MIYData.interaction)
                        ul.append(
                            $("<li>").addClass("cm-interaction").attr("mcode",MIYData.interaction[m].mcode).append(
                                $("<p>").html(MIYData.interaction[m].name)
                            )
                        );
                        ul.find("li").on("click", function(e){
                            if(pos)
                                MIYData.modules[$(this).attr("mcode")].action([ta,pos], contextmenu.trigger, App);
                            else
                                MIYData.interaction[$(this).attr("mcode")].action(target.closest(".miy-module"), contextmenu.trigger, App);
                        });
                break;
            }
        }

        this.hide = __hide;
    }

    App.Download = function download(filename, text) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    var toolbar = function(e){
        var $target = $(e.target).closest(".toolbar ul li.item");
        if(!$target.hasClass("item") || $target.hasClass("disabled")) return false;
        var action = $target.attr("tbaction");

        MIYData.toolbar[action].action(App);
    }

    App.AskFor = function(obj,onlaunch){
        $("#AskFor #submit").show();
        if(arguments.length == 3){
            var cb = arguments[arguments.length-1];
        }else{
            var cb = onlaunch;
            onlaunch = false;
        }
        var $form = $("#AskFor");
        $form.find("#list").empty();
        $form.fadeIn(200);
        var sub =  $form.find("#submit");
        sub.off();


        if(typeof obj[0] == "string"){
            for(var o in obj)
                $form.find("#list").append(
                    $("<p>").append(
                        $("<span>").html((App.activeProject && typeof App.activeProject.defaults[obj[o]] != "undefined")? App.activeProject.defaults[obj[o]][0] : obj[o] ),
                        $("<input>").attr({
                            "id": "af-"+obj[o],
                            "type": (App.activeProject && typeof App.activeProject.defaults[obj[o]] != "undefined")?App.activeProject.defaults[obj[o]][1]: "text",
                            "placeholder":(App.activeProject && typeof App.activeProject.defaults[obj[o]] != "undefined")? App.activeProject.defaults[obj[o]][2]:"",
                            "value":(App.activeProject && typeof App.activeProject.defaults[obj[o]] != "undefined")? App.activeProject.defaults[obj[o]][2]:""
                        })
                    )
                );
        }else{
            for(var o in obj)
                $form.find("#list").append(
                    $("<p>").append(
                        $("<span>").html((App.activeProject && typeof App.activeProject.defaults[obj[o][0]] != "undefined")? App.activeProject.defaults[obj[o][0]][0] : obj[o][0] ),
                        $("<input>").attr({
                            "id":"af-"+obj[o][0],
                            "type": obj[o][1],
                            "placeholder": (App.activeProject && typeof App.activeProject.defaults[obj[o][0]] != "undefined")? App.activeProject.defaults[obj[o][0]][2]:"",
                            "value": (App.activeProject && typeof App.activeProject.defaults[obj[o][0]] != "undefined")? App.activeProject.defaults[obj[o][0]][2]:""
                        })
                    )
                );
        }

        if(onlaunch) onlaunch();

        sub.on("click", submit);

        function submit(){
            var ans = (function(){
                var t = {};
                if(typeof obj[0] == "string")
                    for(var o in obj)
                        t[obj[o]] = $("input#af-"+obj[o]).val();
                else
                    for(var o in obj)
                        t[obj[o][0]] = $("input#af-"+obj[o][0]).val();

                for(var e in t)
                    if(t[e] == "") (typeof App.activeProject.defaults[e] != "undefined")? t[e] = App.activeProject.defaults[e][2]: "";

                return t;
            })();
            $form.fadeOut(200);
            cb(ans);
        }
    }


    $("body").on({
        "contextmenu": contextmenu.trigger,
        "click": contextmenu.hide
    });
    $(".toolbar ul li.item").on("click", toolbar);


    ////////////

    function AllReady(){
        SGE.Scene.Load("editor",App);
    }
}

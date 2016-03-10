var MIYData = {
    RenderVC: function(d){
        var c = $("#miy-basetable tbody tr td");
        c.empty();
        $("div.pident p span").html("");
        if(!d) return true;

        $("#miy-basetable").attr("bgcolor",d.defaults.baseTableBackground[2]);

        $("div.pident p span").html(d.name);
        for(var i in d.modules) c.append(MIYData.modules[d.modules[i].mcode].render(d.modules[i], d.defaults));
    },
    getPosition: function(m,target){
        var id = target[0].attr("mid");
        var c = 0 |0;
        for(var i in m) if(m[i].mid == id) break; else c++;
        return (c + ((target[1] == "after")?1:0));
    },

    defaults: {
        "workSpace": ["WorkSpaces:", "hidden", ""],                                //SYSTEM

        "bodyBackground": ["Body Background","color", "#ffffff"],                           //BODY
        "baseTableBackground": ["Table Background","color", "#ffffff"],

        "moduleBackground": ["Module Background","color", "#EBEBEB"],                         //MODULES

        "font": ["Font family", "text", "Arial, sans-serif"],                                     //TEXT
        "color": ["Font color", "color", "#333"],
        "fontSize": ["Font size","number", "14"],
        "textAlign": ["Text align","text", "left"],

        "titleFont": ["Title font family", "text", "Arial, sans-serif"],                                //TITLE
        "titleColor": ["Title font color","color", "#145266"],
        "titleFontSize": ["Title font size","number","22"],
        "titleAlign": ["Title text align","text", "left"],

        "linkStyles": ["Link custom style","text",""]                                //LINKS
    },

    toolbar: {
        "new" : {
            name: "New Workspace",
            parent: "#Archive",
            action: function(App){
                App.AskFor(["projectName"], function(ans){
                    App.activeProject = App.DBProjects.Save(App.ProjectStructure(ans.projectName)).data;
                    MIYData.RenderVC(App.activeProject);
                });
            }
        },
        "open" : {
            name: "Open Workspace",
            parent: "#Archive",
            action: function(App){
                if(!App.DBProjects.Search("name").length > 0) return false;
                App.AskFor(["workSpace"],function(){
                    var ws = App.DBProjects.Search("name");
                    $("#AskFor #submit").hide();
                    for(var w in ws)
                        $("#AskFor #list").append(
                            $("<div>").addClass("workspace-load").attr("ws-name",ws[w].data.name).html(ws[w].data.name)
                        );
                    $(".workspace-load").on("click", function(){
                        $("#af-workSpace").val($(this).attr("ws-name"));
                        $("#AskFor #submit").click();
                    });

                },function(ans){
                    var project = App.DBProjects.SearchFirstWhere({"name": ans.workSpace});
                    console.log(ans.workSpace,project);
                    if(project)
                        App.activeProject = project.data;
                    else{
                        console.log("Not found");
                        return false;
                    }
                    console.log(App.activeProject.name);
                    MIYData.RenderVC(App.activeProject);
                });
            }
        },
        "save" : {
            name: "Save Workspaces",
            parent: "#Archive",
            action: function(App){
                if(!App.activeProject) return false;
                var ws = App.DBProjects.Search("name");
                for(var i in ws) ws[i].update(ws[i].data);
                App.DBProjects.Export();
                alert("saved");
            }
        },
        "delete" : {
            name: "Delete Workspace",
            parent: "#Archive",
            action: function(App){
                if(!App.activeProject) return false;
                App.DBProjects.Remove({"name":App.activeProject.name});
                App.DBProjects.Export();
                var projects = App.DBProjects.Search("name");
                if(projects.length > 0){
                    App.activeProject = projects[0].data;
                    MIYData.RenderVC(App.activeProject);
                }else{
                    App.activeProject = false;
                    MIYData.RenderVC(false);
                }
            }
        },
        "export" : {
            name: "Export Template",
            parent: "#Archive",
            action: function(App){
                if(!App.activeProject) return false;
                App.Download(App.activeProject.name+".html",$("#main-canvas").html());
                console.log("not yet");
            }
        },
        "reset" : {
            name: "Reset Workspace",
            parent: "#Edit",
            action: function(App){
                if(!App.activeProject) return false;
                App.AskFor(["AreYouSure"],function(ans){
                    var ays = ans.AreYouSure;
                    if(ays == "si" || ays == "yes" || ays =="Si" || ays == "Yes" || ays == "y" || ays == "s"){
                        App.activeProject.modules.length = 0;
                        MIYData.RenderVC(App.activeProject);
                    }
                    return false;
                });
            }
        },
        "defaults": {
            name: "Edit Defaults",
            parent: "#Edit",
            action: function(App){
                if(!App.activeProject) return false;
                var af = (function(){
                    var t = [];
                    for(var i in MIYData.defaults)
                        if(MIYData.defaults[i][1] != "hidden")
                            t.push([i,MIYData.defaults[i][1]]);
                    return t;
                })();
                App.AskFor(af,function(ans){
                    for(var k in ans)
                        if(ans[k] != "" && App.activeProject.defaults[k]) App.activeProject.defaults[k][2] = ans[k];

                    for(var m in App.activeProject.modules)
                        for(var s in App.activeProject.modules[m].data)
                            if(App.activeProject.defaults[s])
                                App.activeProject.modules[m].data[s] = App.activeProject.defaults[s][2];
                    MIYData.RenderVC(App.activeProject);
                });
            }
        },
        "force": {
            name: "Force Styles",
            parent: "#Edit",
            action: function(App){
                if(!App.activeProject) return false;
                console.log(App.activeProject);
                for(var m in App.activeProject.modules)
                    for(var s in App.activeProject.modules[m].data)
                        if(App.activeProject.defaults[s])
                            App.activeProject.modules[m].data[s] = App.activeProject.defaults[s][2];
                MIYData.RenderVC(App.activeProject);
            }
        }
    },

    interaction: {
        0: {
            mcode: 0,
            name: "Remove",
            action: function(target){
                var App = arguments[arguments.length-1];
                var c = 0 |0;

                for(var i in App.activeProject.modules){
                    if(App.activeProject.modules[i].mid == target.attr("mid")) break;
                    c++;
                }

                App.activeProject.modules.splice(c,1);
                MIYData.RenderVC(App.activeProject);
            }
        },
        1: {
            mcode: 1,
            name: "Edit",
            action: function(target){
                var App = arguments[arguments.length-1];
                var el = false;

                for(var i in App.activeProject.modules)
                    if(App.activeProject.modules[i].mid == target.attr("mid"))
                        el = App.activeProject.modules[i];
                if(!el)return false;

                var af = (function(){
                    var t = [];
                    for(var i in el.data) t.push(i);
                    return t;
                })();

                App.AskFor(af,function(){
                    for(var i in el.data)
                        $("#af-"+i).html(el.data[i]).attr("value",el.data[i]);
                },function(ans){
                    for(var e in ans)
                        if(ans[e].length > 0) el.data[e] = ans[e];
                    MIYData.RenderVC(App.activeProject);
                });
            }
        },
        2: {
            mcode: 2,
            name: "Insert before",
            action: function(target,cm){
                setTimeout(function(){
                    console.log("Insert before",target);
                    cm("cache","before",target);
                },100);
            }
        },
        3: {
            mcode: 3,
            name: "Insert after",
            action: function(target,cm){
                setTimeout(function(){
                    console.log("Insert after",target);
                    cm("cache","after",target);
                },100);
            }
        }
    },
    modules: {
        0: {
            mcode: 0,
            name: "Full width image",
            action: function(target){
                var App = arguments[arguments.length-1];
                console.log("insert full width image",App);
                
                App.AskFor(["url", "alt", "link"],function(ans){
                    if(ans.url.length < 1) ans.url = "http://placehold.it/580x580/5A7023/";
                    var m = {
                        mcode: 0,
                        mid: Math.floor(Math.random()*9999999999),
                        data: ans
                    };

                    if(target.length == 2){
                        App.activeProject.modules.splice(MIYData.getPosition(App.activeProject.modules,target), 0, m);
                    }else{
                        App.activeProject.modules.push(m);
                    }
                    MIYData.RenderVC(App.activeProject);
                });
            },
            render: function(o,d){
                    return '<table class="container HeaderFullImageTitle miy-module" mid="'+o.mid+'" border="0" cellpadding="0" cellspacing="0" style=" padding: 0; margin: 0;"> \
                                <tbody><tr> \
                                    <td> \
                                        <table class="row header" border="0" cellpadding="0" cellspacing="0" style="padding: 0; margin: 0;"> \
                                            <!-- MAIN NEWSLETTER IMAGE --> \
                                            <tbody><tr> \
                                                <td class="wrapper last" align="center" valign="top" style="padding: 0; margin: 0;"> \
                                                    <center> \
                                                        <table class="twelve columns" border="0" cellpadding="0" cellspacing="0" style="padding: 0; margin: 0;"> \
                                                            <tbody><tr> \
                                                                <td> \
                                                                    <p style="width: 580px; padding: 0; margin: 0;"><a href="'+o.data.link+'" style="padding: 0; margin: 0;"><img width="100%" src="'+o.data.url+'" alt="'+o.data.alt+'" style="display: block; border: none;"></a></p> \
                                                                </td><td class="expander"></td> \
                                                            </tr> \
                                                        </tbody></table> \
                                                    </center> \
                                                </td><td class="expander"></td> \
                                            </tr> \
                                        </tbody></table> \
                                    </td> \
                                </tr> \
                        </tbody></table>';
            }
        },
        1: {
            mcode: 1,
            name: "Title",
            action: function(target){
                var App = arguments[arguments.length-1];
                console.log("insert Title");

                App.AskFor(["text","font","fontSize","color"],function(ans){
                    if(ans.text.length < 1) ans.text = "Lorem ipsum dolor sit amet";
                    if(ans.font.length < 1) ans.font = "Repsol BETA, Arial, sans-serif";
                    if(ans.fontSize.length < 1) ans.fontSize = "24";
                    if(ans.color.length < 1) ans.color = "black";

                    var m = {
                        mcode: 1,
                        mid: Math.floor(Math.random()*9999999999),
                        data: ans
                    };

                    if(target.length == 2){
                        App.activeProject.modules.splice(MIYData.getPosition(App.activeProject.modules,target), 0, m);
                    }else{
                        App.activeProject.modules.push(m);
                    }
                    MIYData.RenderVC(App.activeProject);
                });
            },
            render: function(o,d){
                    return '<table width="580" class="container FullTitle miy-module" mid="'+o.mid+'" border="0" cellpadding="0" cellspacing="0" style="padding: 0; margin: 0;">\
                            <tbody><tr>\
                                <td class="center">\
                                    <h1 style="margin: 10px 0; font-family: '+o.data.font+'; color: '+o.data.color+'; font-weight: bold; text-align: center; font-size: '+o.data.fontSize+'px; display: block;">'+o.data.text+'</h1>\
                                </td>\
                            </tr>\
                        </tbody></table>';
            }
        },
        2: {
            mcode: 2,
            name: "Text block",
            action: function(target){
                var App = arguments[arguments.length-1];
                console.log("insert full width text");


                App.AskFor(["title", "titleFont", "titleFontSize", "titleColor", "text", "font", "fontSize", "textAlign", "color"],function(ans){
                    console.log(ans);
                        for(var k in ans)
                            if(ans[k] == "" && App.activeProject.defaults[k]) ans[k] = App.activeProject.defaults[k];

                    if(ans.text.length < 1) ans.text = "Lorem ipsum dolor sit amet";
                    if(ans.titleFont.length < 1) ans.titleFont = "Repsol BETA, Arial, sans-serif";
                    if(ans.font.length < 1) ans.font = "Repsol BETA, Arial, sans-serif";
                    if(ans.fontSize.length < 1) ans.fontSize = "24";
                    if(ans.titleFontSize.length < 1) ans.TitleFontSize = "24";
                    if(ans.color.length < 1) ans.color = "black";
                    if(ans.titleColor.length < 1) ans.TitleColor = "red";

                    var m = {
                        mcode: 2,
                        mid: Math.floor(Math.random()*9999999999),
                        data: ans
                    };

                    if(target.length == 2){
                        App.activeProject.modules.splice(MIYData.getPosition(App.activeProject.modules,target), 0, m);
                    }else{
                        App.activeProject.modules.push(m);
                    }
                    MIYData.RenderVC(App.activeProject);
                });
            },
            render: function(o,d){
                    console.log(o.data);
                    return '<table class="container Text miy-module" mid="'+o.mid+'" border="0" cellpadding="0" cellspacing="0" style="padding: 0; margin: 0;">\
                        <tbody><tr>\
                            <td>\
                                <table class="row" border="0" cellspacing="0" cellpadding="0" style="padding: 0; margin: 0;">\
                                    <tbody><tr>\
                                        <td class="wrapper last" style="padding: 0; margin: 0;">\
                                            <table class="twelve columns" border="0" cellspacing="0" cellpadding="0" style="padding: 0; margin: 0;">\
                                                <tbody><tr>\
                                                    <td valign="top" style="text-align:'+o.data.textAlign+'">\
                                                        <h1 style="font-family: '+o.data.titleFont+'; color: '+o.data.titleColor+'; font-size: '+o.data.titleFontSize+'px; font-weight: bold; margin: 10px 5px; width: auto;">'+o.data.title+'</h1>\
                                                        <p style="font-family: '+o.data.font+'; font-size: '+o.data.fontSize+'px; color: '+o.data.color+'; margin: 10px 5px; width: auto;">'+o.data.text+'</p>\
                                                    </td><td class="expander"></td>\
                                                </tr>\
                                            </tbody></table>\
                                        </td>\
                                    </tr>\
                    </tbody></table>';
            }
        },
        3: {
            mcode: 3,
            name: "Title with icon",
            action: function(target){
                var App = arguments[arguments.length-1];
                console.log("Insert title with icon");


                App.AskFor(["title", "font", "fontSize", "color", "iconURL", "iconAlt"],function(ans){
                    console.log(ans);
                    if(ans.title.length < 1) ans.title = "Lorem ipsum dolor sit amet";
                    if(ans.font.length < 1) ans.font = "Repsol BETA, Arial, sans-serif";
                    if(ans.fontSize.length < 1) ans.fontSize = "24";
                    if(ans.color.length < 1) ans.color = "black";
                    if(ans.iconURL.length < 1) ans.iconURL = "http://dummyimage.com/70x70";

                    var m = {
                        mcode: 3,
                        mid: Math.floor(Math.random()*9999999999),
                        data: ans
                    };

                    if(target.length == 2){
                        App.activeProject.modules.splice(MIYData.getPosition(App.activeProject.modules,target), 0, m);
                    }else{
                        App.activeProject.modules.push(m);
                    }
                    MIYData.RenderVC(App.activeProject);
                });
            },
            render: function(o,d){
                return '<table width="580" class="container FullTitleWithLeftIcon miy-module" mid="'+o.mid+'" border="0" cellpadding="0" cellspacing="0" style="padding: 0; margin: 0;">\
                        <tbody><tr>\
                            <td class="center">\
                                <table border="0" cellspacing="0" cellpadding="0" style="padding: 0; margin: 0">\
                                    <tbody><tr>\
                                        <td width="70" valign="top" align="center">\
                                            <img src="'+o.data.iconURL+'" alt="'+o.data.iconAlt+'">\
                                        </td>\
                                        <td class="" valign="middle">\
                                            <h1 style="margin: 10px 10px; font-family: '+o.data.font+'; color: '+o.data.color+'; font-weight: bold; text-align: left; font-size: '+o.data.fontSize+'px; display: block;">'+o.data.title+'</h1>\
                                        </td>\
                                    </tr>\
                                </tbody></table>\
                            </td>\
                        </tr>\
                    </tbody></table>';
            }
        },
        4: {
            mcode: 4,
            name: "Two columns Text-Image",
            action: function(target){
                var App = arguments[arguments.length-1];
                console.log("Two columns Text-Image");


                App.AskFor(["title", "titleFont", "titleFontSize", "titleColor", "text", "font", "fontSize", "color", "linkText", "linkURL", "linkStyles",
                        "imageURL", "imageResponsiveURL", "imageAlt", "imageLinkTo"],function(ans){
                    console.log(ans);

                    if(ans.titleFont.length < 1) ans.titleFont = "Repsol BETA, Arial, sans-serif";
                    if(ans.titleFontSize.length < 1) ans.TitleFontSize = "24";
                    if(ans.titleColor.length < 1) ans.TitleColor = "red";

                    if(ans.text.length < 1) ans.text = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Tenetur quidem natus, nihil, quos possimus voluptatibus voluptates libero, explicabo animi dolorem ipsum. Illum maiores enim libero odit.";
                    if(ans.font.length < 1) ans.font = "Repsol BETA, Arial, sans-serif";
                    if(ans.fontSize.length < 1) ans.fontSize = "24";
                    if(ans.color.length < 1) ans.color = "black";

                    if(ans.linkText.length < 1) ans.linkText = "Link";
                    if(ans.linkURL.length < 1) ans.URL = "http://google.com";

                    if(ans.imageURL.length < 1) ans.imageURL = "http://dummyimage.com/280x150";
                    if(ans.imageResponsiveURL.length < 1) ans.imageResponsiveURL = ans.imageURL;
                    if(ans.imageLinkTo.length < 1) ans.imageLinkTo = "#";

                    var m = {
                        mcode: 4,
                        mid: Math.floor(Math.random()*9999999999),
                        data: ans
                    };

                    if(target.length == 2){
                        App.activeProject.modules.splice(MIYData.getPosition(App.activeProject.modules,target), 0, m);
                    }else{
                        App.activeProject.modules.push(m);
                    }
                    MIYData.RenderVC(App.activeProject);
                });
            },
            render: function(o,d){
                return '<table class="container HighlightTextImage miy-module" mid="'+o.mid+'" border="0" cellpadding="0" cellspacing="0" style=" padding: 0; margin: 0;">\
                            <tbody><tr>\
                                <td>\
                                    <table class="row" border="0" cellspacing="0" cellpadding="0" style="padding: 0; margin: 0;">\
                                        <tbody><tr>\
                                            <td class="wrapper">\
                                                <table class="six columns" border="0" cellspacing="0" cellpadding="0">\
                                                    <tbody><tr>\
                                                        <td valign="top">\
                                                            <h1 style="font-family: '+o.data.titleFont+'; color: '+o.data.titleColor+'; font-size: '+o.data.titleFontSize+'px; font-weight: bold; margin: 0 0 10px 5px; width: auto; margin-right: 20px;">'+o.data.title+'</h1>\
                                                            <p style="font-family: '+o.data.font+'; font-size: '+o.data.fontSize+'px; color: '+o.data.color+'; width: auto; margin: 0 0 10px 5px; margin-right: 20px;">'+o.data.text+'</p>\
                                                            <p class="link" style="margin: 0 0 10px 5px; margin-right: 20px; width: auto;"><a href="'+o.data.linkURL+'" style="color: '+o.data.color+'; font-family: '+o.data.font+'; text-decoration: none; '+o.data.linkStyles+'">'+o.data.linkText+'</a></p>\
                                                        </td><td class="expander"></td>\
                                                    </tr>\
                                                </tbody></table>\
                                            </td><td class="wrapper last" style="padding: 0; margin: 0">\
                                                <table class="six columns" border="0" cellspacing="0" cellpadding="0">\
                                                    <tbody><tr>\
                                                        <td class="image" valign="top" style="display: block;">\
                                                            <a href="'+o.data.imageLinkTo+'" style="padding: 0; margin: 0;"><img height="100%" src="'+o.data.imageURL+'" alt="'+o.data.imageAlt+'" style="display: block;"></a>\
                                                        </td>\
                                                        <td class="alt" valign="top" style="width: 0; max-height: 0; overflow: hidden; float: left; display: none;">\
                                                            <a href="'+o.data.imageLinkTo+'" style="padding: 0; margin: 0;"><img height="100%" src="'+o.data.imageURL+'" alt="'+o.data.imageAlt+'" style="display: block;"></a>\
                                                        </td><td class="expander"></td>\
                                                    </tr>\
                                                </tbody></table>\
                                            </td>\
                                        </tr>\
                                    </tbody></table>\
                                </td>\
                            </tr>\
                        </tbody></table>';
            }
        },

    }
}

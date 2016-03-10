function SceneConstructor(App){
    console.log("editor",App);

    App.DBConfig.Import("MIY_CONFIG");
    App.DBProjects.Import("MIY_PROJECTS");
    console.log(App.DBProjects);
    var projects = App.DBProjects.Search("name");
    if(projects.length > 0)
        App.activeProject = projects[0].data;
    MIYData.RenderVC(App.activeProject);

    App.Loading.Hide();
}
function SceneDestructor(){

}

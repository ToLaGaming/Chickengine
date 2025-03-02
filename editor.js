document.getElementById("sceneButton").addEventListener("click", function() {
    document.getElementById("sceneWorkspace").style.display = "block";
    document.getElementById("codeWorkspace").style.display = "none"; 
    this.classList.add("active");
    document.getElementById("codeButton").classList.remove("active");
});

document.getElementById("codeButton").addEventListener("click", function() {
    document.getElementById("sceneWorkspace").style.display = "none"; 
    document.getElementById("codeWorkspace").style.display = "flex";
    this.classList.add("active");
    document.getElementById("sceneButton").classList.remove("active");
});

function saveProject() {
    const projectData = {
        code: document.getElementById("codeEditor").value
    };

    const blob = new Blob([JSON.stringify(projectData)], { type: "application/tipu" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "myProject.tipu"; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function loadProject(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const projectData = JSON.parse(e.target.result);
        document.getElementById("codeEditor").value = projectData.code;
    };
    reader.readAsText(file);
}

document.getElementById("fileInput").addEventListener("change", loadProject);

document.getElementById("runGameButton").addEventListener("click", function() {
    const codeContent = document.getElementById("codeEditor").value;
    localStorage.setItem('gameCode', codeContent);
    const newTab = window.open("game.html", "_blank");
});

document.getElementById("exampleButton").addEventListener("click", function() {
    const newTab = window.open("example1.html", "_blank");
});

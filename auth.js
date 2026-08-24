function login() {
    //alert("hi111");
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;
    const role = document.getElementById("role").value;
    //alert(user.length);
    //alert(pass.length);

   //if (user.length == 0 || pass.length==0) {
   if((!user)||(!pass)){
        document.getElementById("loginError").innerText =
            "Please fill all fields";
        return;
    }
    //alert("hi");
    // Demo authentication (hackathon-safe)
    localStorage.setItem("loggedInUser", user);
    localStorage.setItem("userRole", role);
    const url = 'patient_index.html?username=' + encodeURIComponent(user) + '&role=' + encodeURIComponent(role);
    const url2 = 'doctor.html?username=' + encodeURIComponent(user) + '&role=' + encodeURIComponent(role);
    if(role=="doctor")
    {
        window.location.href = url2;

    }
    else if(role=="patient")
        {
    window.location.href = url;
        }

    }
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

const userMenu = document.getElementById("authentication")
document.addEventListener("DOMContentLoaded",res=>sendUserMenuContainers())
function sendUserMenuContainers(){
    fetch(
        "/draw-user-auth",{
            method:'get'
        })
            .then(result=>{
                const menu = result.text()
                console.log(result.headers.get("Draw"))
                return menu
            })
            .then(res=>
                userMenu.innerHTML = res
            )
            .catch(err=>console.log(err))
}
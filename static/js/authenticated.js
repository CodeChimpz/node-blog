const userMenu = document.getElementById("authentication")
const userPFP = document.getElementById("pfp")

document.addEventListener("DOMContentLoaded",res=>sendUserMenuContainers())
document.addEventListener("DOMContentLoaded",res=>sendPFP())

//показывает меню аутентикации или страницу пользователя в зависимости от статуса аутентикации
function sendUserMenuContainers(){
    if(window.location.pathname !== ("/authen/user")){
        fetch(
            "/user/draw-user-auth",{
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
    else{
        userMenu.innerHTML = `<a class="logout" href="/logout">Logout</a>`
    }
}

function sendPFP(){
    if(userPFP){
        fetch("/user/data/userPfp",{

        })
            .then(res=>{return res.json()})
            .then(result=>{
                console.log(typeof(result))
                const image = document.getElementById('pfpimg')
                    if(result["userPfp"]){
                        image.setAttribute("src",`/public_img/${result['userPfp']}`)
                    }
        }).catch(err=>console.log(err))
    }
}
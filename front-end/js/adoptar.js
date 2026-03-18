// 🔹 CARGAR TODAS LAS MASCOTAS AL INICIO
async function cargarMascotas(){

    try{
        let response = await fetch("http://localhost:3000/mascotas")
        let mascotas = await response.json()

        mostrarMascotas(mascotas)

    }catch(error){
        console.log("Error al cargar mascotas:", error)
    }

}


// 🔹 FILTRAR MASCOTAS
async function filtrarMascotas(){

    let tipo = document.getElementById("tipo").value
    let ciudad = document.getElementById("ciudad").value
    let busqueda = document.getElementById("busqueda").value

    let url = "http://localhost:3000/mascotas?"

    // filtro tipo
    if(tipo != "Tipo de animal"){
        url += "tipo=" + tipo + "&"
    }

    // filtro ciudad
    if(ciudad != "Provincia"){
        url += "ciudad=" + ciudad + "&"
    }

    // filtro búsqueda
    if(busqueda != ""){
        url += "busqueda=" + busqueda + "&"
    }

    try{
        let response = await fetch(url)
        let mascotas = await response.json()

        mostrarMascotas(mascotas)

    }catch(error){
        console.log("Error al filtrar mascotas:", error)
    }

}


// 🔹 MOSTRAR MASCOTAS
function mostrarMascotas(mascotas){

    let container = document.getElementById("mascotas-container")

    container.innerHTML = ""

    // si no hay resultados
    if(mascotas.length === 0){
        container.innerHTML = "<p>No hay mascotas disponibles</p>"
        return
    }

    for(let i = 0; i < mascotas.length; i++){

        let m = mascotas[i]

        container.innerHTML += `
        <div class="bg-white rounded-2xl overflow-hidden shadow hover:-translate-y-1 hover:shadow-lg transition cursor-pointer">

        <img src="http://localhost:3000/img/${m.imagen}" 
        class="w-full h-40 object-cover">

        <div class="p-4">

        <h3 class="font-black text-blue-900">${m.nombre}</h3>

        <p class="text-xs text-gray-500 mt-1 mb-2">
        ${m.raza} · ${m.sexo} · ${m.edad} años · ${m.ciudad}
        </p>

        <span class="text-xs bg-green-100 text-green-700 font-bold px-2 py-1 rounded-full">
        ${m.estado}
        </span>

        </div>

        </div>
        `
    }

}


cargarMascotas()
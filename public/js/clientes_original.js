const URL_BASE = "/api/";
const AREA_CLIENTES = document.querySelector("table tbody");
const CAMPO_NOMBRE = document.querySelector("#nombre");
const CAMPO_APELLIDOS = document.querySelector("#apellidos");
const CAMPO_LOCALIDAD = document.querySelector("#localidad");
const ID_OCULTO = document.querySelector('#id');

function cargarClientes() {
    AREA_CLIENTES.innerHTML = `
        <td colspan="4">Cargando clientes...</td>
    `;
    fetch(URL_BASE+"clientes")
    .then(response=>response.json())
    .then(datos=>{
        console.log(datos);
        let clientes = datos.data.clientes;
        AREA_CLIENTES.innerHTML = "";
        clientes.forEach(cliente => {
            let linea = document.createElement("tr");
            linea.innerHTML=`
                <td>${cliente.id}</td>
                <td>${cliente.nombre}</td>
                <td>${cliente.apellidos}</td>
                <td>${cliente.localidad}</td>
                <td>
                    <img src="img/editar.png" alt="editar cliente" onclick="datosCliente(${cliente.id});"/> 
                    <img src="img/eliminar.png" alt="eliminar cliente" onclick="eliminarCliente(${cliente.id});"/>
                </td>
            `;
            AREA_CLIENTES.append(linea);
        });
    });
}

function datosCliente(id) {
    fetch(URL_BASE+"clientes/"+id)
    .then(response=>response.json())
    .then(datos=>{
        console.log(datos);
        CAMPO_NOMBRE.value = datos.data.nombre;
        CAMPO_APELLIDOS.value = datos.data.apellidos;
        CAMPO_LOCALIDAD.value = datos.data.direccion.localidad;
        ID_OCULTO.value = datos.data.id;
    });
}

function eliminarCliente(id) {
    fetch(URL_BASE+"clientes/"+id, {method: "DELETE"})
    .then(response=>{
        if (response.status==404) {
            alert("NO ENCONTRADO");
        }
        return response.json();
    })
    .catch(error=>console.error("NO HAY CONEXION", error))
    .then(datos=>{
        console.log(datos);
       if (datos.success) {
           console.log("ELIMINADO", datos.message)
       } else {
        console.log("NO ELIMINADO", datos.message)
       }
    })
    .catch(error=>console.error("Fallo respuesta", error));
}

function crearUsuario() {
    console.log("Creando...");
    let nuevoCliente = {
        nombre: CAMPO_NOMBRE.value,
        apellidos: CAMPO_APELLIDOS.value,
        direccion: {
            localidad: CAMPO_LOCALIDAD.value
        }
    };
    let opciones = {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevoCliente)
    }

    fetch(URL_BASE+"clientes", opciones)
    .then(response=>response.json())
    .then(datos=>{
        console.log(datos);
        cargarClientes();
    });
}

function modificarCliente() {
    let id = ID_OCULTO.value;
    console.log("Modificando..");
    let editCliente = {
        nombre: CAMPO_NOMBRE.value,
        apellidos: CAMPO_APELLIDOS.value,
        direccion: {
            localidad: CAMPO_LOCALIDAD.value
        }
    };
    let opciones = {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(editCliente)
    }

    fetch(URL_BASE+"clientes/"+id, opciones)
    .then(response=>response.json())
    .then(datos=>{
        console.log(datos);
        cargarClientes();
    });
}

cargarClientes();